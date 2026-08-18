<?php
/**
 * OTP Handler - Send and Verify OTP
 */

require_once 'config.php';
require_once 'mail.php';
require_once 'security.php';

class OTPHandler {
    private $security;
    private $db_file;
    
    public function __construct() {
        $this->security = new Security();
        $this->db_file = DATA_DIR . '/.otp_sessions.json';
        $this->cleanExpiredOTPs();
    }
    
    /**
     * Generate and send OTP
     */
    public function generateAndSendOTP($email = null, $phone = null, $method = 'email') {
        try {
            // Validate input
            if (!$email && !$phone) {
                return json_encode(['success' => false, 'error' => 'No contact method provided']);
            }
            
            // Rate limiting check
            if (!$this->checkRateLimit($email ?: $phone)) {
                return json_encode(['success' => false, 'error' => 'Too many OTP requests. Please try again later.']);
            }
            
            // Generate OTP
            $otp = str_pad(random_int(0, 999999), OTP_LENGTH, '0', STR_PAD_LEFT);
            $session_id = bin2hex(random_bytes(16));
            
            // Store OTP with expiry
            $otp_data = [
                'session_id' => $session_id,
                'otp_hash' => password_hash($otp, PASSWORD_BCRYPT),
                'email' => $email,
                'phone' => $phone,
                'method' => $method,
                'created_at' => time(),
                'expires_at' => time() + (OTP_EXPIRY_MINUTES * 60),
                'attempts' => 0,
                'verified' => false
            ];
            
            $this->saveOTPSession($session_id, $otp_data);
            
            // Send OTP
            if ($method === 'email' && $email) {
                $sent = $this->sendOTPEmail($email, $otp);
            } else if ($method === 'sms' && $phone) {
                $sent = $this->sendOTPSMS($phone, $otp);
            } else {
                return json_encode(['success' => false, 'error' => 'Invalid OTP method']);
            }
            
            if (!$sent) {
                return json_encode(['success' => false, 'error' => 'Failed to send OTP. Please try again.']);
            }
            
            return json_encode([
                'success' => true,
                'data' => [
                    'session_id' => $session_id,
                    'method' => $method,
                    'message' => "OTP sent to " . ($method === 'email' ? $email : $phone)
                ]
            ]);
            
        } catch (Exception $e) {
            $this->log('Error generating OTP: ' . $e->getMessage());
            return json_encode(['success' => false, 'error' => 'An error occurred while generating OTP']);
        }
    }
    
    /**
     * Verify OTP
     */
    public function verifyOTP($session_id, $otp_code) {
        try {
            if (!$session_id || !$otp_code) {
                return $this->error('Session ID and OTP code are required', 400);
            }
            
            $otp_data = $this->getOTPSession($session_id);
            
            if (!$otp_data) {
                return $this->error('Invalid or expired session', 400);
            }
            
            // Check expiry
            if (time() > $otp_data['expires_at']) {
                $this->deleteOTPSession($session_id);
                return $this->error('OTP has expired', 400);
            }
            
            // Check attempts
            if ($otp_data['attempts'] >= MAX_ATTEMPTS) {
                $this->deleteOTPSession($session_id);
                return $this->error('Maximum OTP verification attempts exceeded', 429);
            }
            
            // Increment attempts
            $otp_data['attempts']++;
            
            // Verify OTP
            if (!password_verify($otp_code, $otp_data['otp_hash'])) {
                $this->saveOTPSession($session_id, $otp_data);
                return $this->error('Invalid OTP code', 400);
            }
            
            // Mark as verified
            $otp_data['verified'] = true;
            $otp_data['verified_at'] = time();
            $this->saveOTPSession($session_id, $otp_data);
            
            return $this->success([
                'session_id' => $session_id,
                'verified' => true,
                'method' => $otp_data['method'],
                'message' => 'OTP verified successfully'
            ]);
            
        } catch (Exception $e) {
            $this->log('Error verifying OTP: ' . $e->getMessage());
            return $this->error('An error occurred while verifying OTP', 500);
        }
    }
    
    /**
     * Send OTP via Email
     */
    private function sendOTPEmail($email, $otp) {
        $mailer = new Mailer();
        
        $subject = 'Your ZENNARA Verification Code';
        $body = "
        <h2>Verify Your Email</h2>
        <p>Your verification code is:</p>
        <h1 style='letter-spacing: 2px; font-family: monospace; background: #f0f0f0; padding: 20px; border-radius: 8px;'>
            {$otp}
        </h1>
        <p>This code expires in " . OTP_EXPIRY_MINUTES . " minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        ";
        
        return $mailer->send($email, $subject, $body);
    }
    
    /**
     * Send OTP via SMS (Twilio)
     */
    private function sendOTPSMS($phone, $otp) {
        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
            $this->log('Twilio credentials not configured');
            return false;
        }
        
        try {
            $url = "https://api.twilio.com/2010-04-01/Accounts/" . TWILIO_ACCOUNT_SID . "/Messages.json";
            
            $post_data = [
                'From' => TWILIO_FROM_NUMBER,
                'To' => $phone,
                'Body' => "Your ZENNARA verification code is: {$otp}. Valid for " . OTP_EXPIRY_MINUTES . " minutes."
            ];
            
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
            curl_setopt($ch, CURLOPT_USERPWD, TWILIO_ACCOUNT_SID . ":" . TWILIO_AUTH_TOKEN);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($http_code !== 201) {
                $this->log('Twilio SMS failed: ' . $response);
                return false;
            }
            
            return true;
            
        } catch (Exception $e) {
            $this->log('Error sending SMS: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Check rate limiting
     */
    private function checkRateLimit($identifier) {
        $rate_file = DATA_DIR . '/.rate_limit_' . md5($identifier) . '.json';
        $now = time();
        $window = RATE_LIMIT_MINUTES * 60;
        
        if (file_exists($rate_file)) {
            $data = json_decode(file_get_contents($rate_file), true);
            $requests = array_filter($data['requests'], function($time) use ($now, $window) {
                return ($now - $time) < $window;
            });
            
            if (count($requests) >= 3) {
                return false;
            }
            
            $requests[] = $now;
        } else {
            $requests = [$now];
        }
        
        file_put_contents($rate_file, json_encode(['requests' => $requests]), LOCK_EX);
        return true;
    }
    
    /**
     * OTP Session Management
     */
    private function getOTPSession($session_id) {
        if (!file_exists($this->db_file)) {
            return null;
        }
        
        $data = json_decode(file_get_contents($this->db_file), true);
        return $data[$session_id] ?? null;
    }
    
    private function saveOTPSession($session_id, $data) {
        $sessions = [];
        if (file_exists($this->db_file)) {
            $sessions = json_decode(file_get_contents($this->db_file), true);
        }
        
        $sessions[$session_id] = $data;
        file_put_contents($this->db_file, json_encode($sessions), LOCK_EX);
        chmod($this->db_file, 0600);
    }
    
    private function deleteOTPSession($session_id) {
        if (file_exists($this->db_file)) {
            $sessions = json_decode(file_get_contents($this->db_file), true);
            unset($sessions[$session_id]);
            file_put_contents($this->db_file, json_encode($sessions), LOCK_EX);
        }
    }
    
    private function cleanExpiredOTPs() {
        if (!file_exists($this->db_file)) {
            return;
        }
        
        $sessions = json_decode(file_get_contents($this->db_file), true);
        $now = time();
        
        $sessions = array_filter($sessions, function($session) use ($now) {
            return $session['expires_at'] > $now;
        });
        
        file_put_contents($this->db_file, json_encode($sessions), LOCK_EX);
    }
    
    /**
     * Response helpers
     */
    private function success($data, $code = 200) {
        http_response_code($code);
        return json_encode(['success' => true, 'data' => $data]);
    }
    
    private function error($message, $code = 400) {
        http_response_code($code);
        return json_encode(['success' => false, 'error' => $message]);
    }
    
    private function log($message) {
        $log_file = LOGS_DIR . '/otp_' . date('Y-m-d') . '.log';
        file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] " . $message . "\n", FILE_APPEND);
    }
}

// Handle requests
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $action = $_GET['action'] ?? $_POST['action'] ?? null;
    $otp_handler = new OTPHandler();

    if ($action === 'send') {
        $email = $_POST['email'] ?? null;
        $phone = $_POST['phone'] ?? null;
        $method = $_POST['method'] ?? 'email';
        $result = $otp_handler->generateAndSendOTP($email, $phone, $method);
        echo $result;
    } else if ($action === 'verify') {
        $session_id = $_POST['session_id'] ?? null;
        $otp_code = $_POST['otp_code'] ?? null;
        $result = $otp_handler->verifyOTP($session_id, $otp_code);
        echo $result;
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Fatal error: ' . $e->getMessage()]);
}
exit();

?>
