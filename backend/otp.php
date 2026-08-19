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
    public function generateAndSendOTP($email = null, $phone = null, $method = 'both') {
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
            
            $resolved_method = ($email && $phone) ? 'both' : ($email ? 'email' : 'sms');

            // Store OTP with expiry
            $otp_data = [
                'session_id' => $session_id,
                'otp_hash' => password_hash($otp, PASSWORD_BCRYPT),
                'email' => $email,
                'phone' => $phone,
                'method' => $resolved_method,
                'created_at' => time(),
                'expires_at' => time() + (OTP_EXPIRY_MINUTES * 60),
                'attempts' => 0,
                'verified' => false
            ];
            
            $this->saveOTPSession($session_id, $otp_data);
            $this->log("Generated OTP for " . trim(($email ?? '') . ' ' . ($phone ?? '')) . ": {$otp} (session: {$session_id})");
            
            // Send OTP to email and/or SMS
            $sent_email = false;
            $sent_sms = false;

            if ($email && $method !== 'sms') {
                $sent_email = $this->sendOTPEmail($email, $otp);
            }
            if ($phone && $method !== 'email') {
                $sent_sms = $this->sendOTPSMS($phone, $otp);
            }

            if ($method === 'email') {
                $sent = $sent_email;
            } else if ($method === 'sms') {
                $sent = $sent_sms;
            } else {
                // For 'both', succeed if at least one was delivered successfully
                $sent = ($sent_email || $sent_sms);
            }
            
            if (!$sent) {
                return json_encode(['success' => false, 'error' => 'Failed to send OTP. Please try again.']);
            }
            
            $destinations = [];
            if ($email && $method !== 'sms') $destinations[] = $email;
            if ($phone && $method !== 'email') $destinations[] = $phone;

            return json_encode([
                'success' => true,
                'data' => [
                    'session_id' => $session_id,
                    'method' => $resolved_method,
                    'message' => "OTP sent to " . implode(' and ', $destinations)
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
     * Programmatic OTP Verification (Returns boolean / array)
     */
    public function verifyOTPRaw($session_id, $otp_code) {
        try {
            if (!$session_id || !$otp_code) {
                return ['success' => false, 'error' => 'Session ID and OTP code are required'];
            }
            
            $otp_data = $this->getOTPSession($session_id);
            if (!$otp_data) {
                return ['success' => false, 'error' => 'Invalid or expired session'];
            }
            
            if (time() > $otp_data['expires_at']) {
                $this->deleteOTPSession($session_id);
                return ['success' => false, 'error' => 'OTP has expired'];
            }
            
            if ($otp_data['attempts'] >= MAX_ATTEMPTS) {
                $this->deleteOTPSession($session_id);
                return ['success' => false, 'error' => 'Maximum OTP verification attempts exceeded'];
            }
            
            $otp_data['attempts']++;
            
            if (!password_verify($otp_code, $otp_data['otp_hash'])) {
                $this->saveOTPSession($session_id, $otp_data);
                return ['success' => false, 'error' => 'Invalid OTP code'];
            }
            
            $otp_data['verified'] = true;
            $otp_data['verified_at'] = time();
            $this->saveOTPSession($session_id, $otp_data);
            
            return ['success' => true, 'data' => $otp_data];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Send OTP via Email
     */
    private function sendOTPEmail($email, $otp) {
        $mailer = new Mailer();
        
        $subject = 'ZENNARA - Your Email Verification Code';
        $body = "
        <div style=\"font-family: 'Inter', Arial, sans-serif; color: #1C1C1C; line-height: 1.6;\">
            <h2 style=\"color: #080808; margin-top: 0;\">Verify Your Email Address</h2>
            <p style=\"color: #4A4A4A; font-size: 15px;\">Thank you for reaching out to ZENNARA. Please use the following 6-digit verification code to complete your proposal request:</p>
            <div style=\"text-align: center; margin: 25px 0;\">
                <div style=\"display: inline-block; letter-spacing: 6px; font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; background: #FAF7F2; color: #080808; border: 2px solid #C9A030; padding: 16px 32px; border-radius: 8px;\">
                    {$otp}
                </div>
            </div>
            <p style=\"color: #666; font-size: 13px;\">This verification code is valid for <strong>" . OTP_EXPIRY_MINUTES . " minutes</strong>.</p>
            <p style=\"color: #999; font-size: 12px; margin-bottom: 0;\">If you did not request this verification code, please ignore this email.</p>
        </div>
        ";
        
        return $mailer->send($email, $subject, $body);
    }
    
    /**
     * Send OTP via SMS (Africa's Talking or Twilio)
     */
    private function sendOTPSMS($phone, $otp) {
        $provider = defined('SMS_PROVIDER') ? strtolower(SMS_PROVIDER) : 'africastalking';

        if ($provider === 'africastalking' || (!empty(AT_API_KEY) && !empty(AT_USERNAME))) {
            return $this->sendAfricasTalkingSMS($phone, $otp);
        } else {
            return $this->sendTwilioSMS($phone, $otp);
        }
    }

    /**
     * Send SMS via Africa's Talking
     */
    private function sendAfricasTalkingSMS($phone, $otp) {
        $username = defined('AT_USERNAME') ? AT_USERNAME : '';
        $apiKey = defined('AT_API_KEY') ? AT_API_KEY : '';
        $senderId = defined('AT_SENDER_ID') ? AT_SENDER_ID : '';

        if (empty($username) || empty($apiKey)) {
            $this->log("Africa's Talking credentials not configured");
            return false;
        }

        try {
            // Clean and format phone number to E.164 (+254...)
            $clean_phone = preg_replace('/[^0-9+]/', '', $phone);
            if (strpos($clean_phone, '0') === 0 && strlen($clean_phone) === 10) {
                $clean_phone = '+254' . substr($clean_phone, 1);
            } elseif (strpos($clean_phone, '254') === 0) {
                $clean_phone = '+' . $clean_phone;
            } elseif (strpos($clean_phone, '+') !== 0) {
                $clean_phone = '+' . $clean_phone;
            }

            $is_sandbox = (strtolower($username) === 'sandbox');
            $url = $is_sandbox
                ? "https://api.sandbox.africastalking.com/version1/messaging"
                : "https://api.africastalking.com/version1/messaging";

            $post_data = [
                'username' => $username,
                'to' => $clean_phone,
                'message' => "Your ZENNARA verification code is: {$otp}. Valid for " . OTP_EXPIRY_MINUTES . " minutes."
            ];

            if (!empty($senderId)) {
                $post_data['from'] = $senderId;
            }

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "apiKey: {$apiKey}",
                "Accept: application/json",
                "Content-Type: application/x-www-form-urlencoded"
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);

            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_close($ch);

            $data = json_decode($response, true);
            $recipients = $data['SMSMessageData']['Recipients'] ?? [];
            $success = false;

            if (!empty($recipients)) {
                foreach ($recipients as $recipient) {
                    if (isset($recipient['statusCode']) && in_array($recipient['statusCode'], [100, 101, 102])) {
                        $success = true;
                        $this->log("Africa's Talking SMS sent successfully to {$clean_phone} (Cost: " . ($recipient['cost'] ?? 'N/A') . ")");
                        break;
                    } else {
                        $this->log("Africa's Talking SMS recipient status: " . ($recipient['status'] ?? 'Unknown') . " (Code: " . ($recipient['statusCode'] ?? 'N/A') . ")");
                    }
                }
            } else {
                $this->log("Africa's Talking SMS failed (HTTP {$http_code}): {$response} {$err}");
            }

            return $success;

        } catch (Exception $e) {
            $this->log("Error sending Africa's Talking SMS: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send OTP via SMS (Twilio)
     */
    private function sendTwilioSMS($phone, $otp) {
        $account_sid = defined('TWILIO_ACCOUNT_SID') ? TWILIO_ACCOUNT_SID : '';
        if (defined('TWILIO_API_KEY') && strpos(TWILIO_API_KEY, 'SK') === 0 && defined('TWILIO_API_SECRET') && !empty(TWILIO_API_SECRET)) {
            $auth_user = TWILIO_API_KEY;
            $auth_pass = TWILIO_API_SECRET;
        } else {
            $auth_user = $account_sid;
            $auth_pass = defined('TWILIO_AUTH_TOKEN') ? TWILIO_AUTH_TOKEN : '';
        }

        if (empty($account_sid) || empty($auth_pass)) {
            $this->log('Twilio credentials not configured');
            return false;
        }
        
        try {
            // Clean and format phone number to E.164 standard (+254...)
            $clean_phone = preg_replace('/[^0-9+]/', '', $phone);
            if (strpos($clean_phone, '0') === 0 && strlen($clean_phone) === 10) {
                $clean_phone = '+254' . substr($clean_phone, 1);
            } elseif (strpos($clean_phone, '254') === 0) {
                $clean_phone = '+' . $clean_phone;
            } elseif (strpos($clean_phone, '+') !== 0) {
                $clean_phone = '+' . $clean_phone;
            }

            $url = "https://api.twilio.com/2010-04-01/Accounts/" . $account_sid . "/Messages.json";
            
            $post_data = [
                'To' => $clean_phone,
                'Body' => "Your ZENNARA verification code is: {$otp}. Valid for " . OTP_EXPIRY_MINUTES . " minutes."
            ];
            
            // Check if From is a Twilio phone number or a Messaging Service SID (starts with MG)
            if (defined('TWILIO_FROM_NUMBER') && !empty(TWILIO_FROM_NUMBER)) {
                if (strpos(TWILIO_FROM_NUMBER, 'MG') === 0) {
                    $post_data['MessagingServiceSid'] = TWILIO_FROM_NUMBER;
                } else {
                    $post_data['From'] = TWILIO_FROM_NUMBER;
                }
            }
            
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
            curl_setopt($ch, CURLOPT_USERPWD, $auth_user . ":" . $auth_pass);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_close($ch);
            
            if ($http_code !== 201) {
                $this->log('Twilio SMS failed (HTTP ' . $http_code . '): ' . $response . ' ' . $err);
                return false;
            }
            
            $this->log('Twilio SMS sent successfully to ' . $clean_phone);
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
            $requests = array_filter($data['requests'] ?? [], function($time) use ($now, $window) {
                return ($now - $time) < $window;
            });
            
            if (count($requests) >= 10) {
                return false;
            }
            
            $requests[] = $now;
        } else {
            $requests = [$now];
        }
        
        file_put_contents($rate_file, json_encode(['requests' => array_values($requests)]), LOCK_EX);
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
        
        $sessions = array_filter($sessions ?: [], function($session) use ($now) {
            return ($session['expires_at'] ?? 0) > $now;
        });
        
        file_put_contents($this->db_file, json_encode($sessions), LOCK_EX);
    }
    
    /**
     * Response helpers
     */
    private function success($data, $code = 200) {
        if (ob_get_level() > 0) ob_clean();
        http_response_code($code);
        return json_encode(['success' => true, 'data' => $data]);
    }
    
    private function error($message, $code = 400) {
        if (ob_get_level() > 0) ob_clean();
        http_response_code($code);
        return json_encode(['success' => false, 'error' => $message]);
    }
    
    private function log($message) {
        $log_file = LOGS_DIR . '/otp_' . date('Y-m-d') . '.log';
        file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] " . $message . "\n", FILE_APPEND);
    }
}

// Handle requests only when executed directly (not when included via require_once)
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        if (ob_get_level() > 0) ob_clean();
        http_response_code(200);
        exit();
    }

    try {
        $raw_input = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $_GET['action'] ?? $_POST['action'] ?? $raw_input['action'] ?? null;
        $otp_handler = new OTPHandler();

        if ($action === 'send' || $action === 'send_otp') {
            $email = $_POST['email'] ?? $raw_input['email'] ?? null;
            $phone = $_POST['phone'] ?? $raw_input['phone'] ?? null;
            $method = $_POST['method'] ?? $raw_input['method'] ?? 'email';
            $result = $otp_handler->generateAndSendOTP($email, $phone, $method);
            if (ob_get_level() > 0) ob_clean();
            echo $result;
        } else if ($action === 'verify' || $action === 'verify_otp') {
            $session_id = $_POST['session_id'] ?? $raw_input['session_id'] ?? null;
            $otp_code = $_POST['otp_code'] ?? $raw_input['otp_code'] ?? null;
            $result = $otp_handler->verifyOTP($session_id, $otp_code);
            if (ob_get_level() > 0) ob_clean();
            echo $result;
        } else {
            if (ob_get_level() > 0) ob_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
        }
    } catch (Exception $e) {
        if (ob_get_level() > 0) ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Fatal error: ' . $e->getMessage()]);
    }
    exit();
}

?>
