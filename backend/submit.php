<?php
/**
 * Contact Form Submission Handler
 * Processes form data, validates OTP, and stores to CSV
 */

require_once 'config.php';
require_once 'security.php';
require_once 'storage.php';
require_once 'otp.php';
require_once 'notifications.php';
require_once 'crm.php';

header('Content-Type: application/json');

class ContactFormHandler {
    private $security;
    private $storage;
    private $otp_handler;
    
    public function __construct() {
        $this->security = new Security();
        $this->storage = new StorageHandler();
        $this->otp_handler = new OTPHandler();
    }
    
    /**
     * Handle form submission
     */
    public function handleSubmit() {
        try {
            // Validate request method
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                return $this->error('Invalid request method', 405);
            }
            
            // Get raw request body and parse JSON safely
            $raw_body = file_get_contents('php://input');
            $input = json_decode($raw_body, true);

            // If json_decode returned null and there was a JSON error, log and return 400
            if (is_null($input) && json_last_error() !== JSON_ERROR_NONE) {
                $this->log('Invalid JSON received: ' . json_last_error_msg());
                $this->log('Raw request body: ' . $raw_body);
                // Log important headers for debugging
                $headers = function_exists('getallheaders') ? json_encode(getallheaders()) : json_encode($_SERVER);
                $this->log('Request headers: ' . $headers);
                return $this->error('Invalid JSON data', 400);
            }
            
            // Required fields
            $name = $input['name'] ?? null;
            $email = $input['email'] ?? null;
            $phone = $input['phone'] ?? null;
            $interest = $input['interest'] ?? null;
            $message = $input['message'] ?? null;
            $session_id = $input['session_id'] ?? null;
            $action = $input['action'] ?? null;
            
            // Route to appropriate handler
            if ($action === 'send_otp') {
                return $this->sendOTP($email, $phone);
            } else if ($action === 'verify_otp') {
                return $this->verifyOTP($session_id, $input['otp_code'] ?? null);
            } else if ($action === 'submit_form') {
                return $this->submitForm($name, $email, $phone, $interest, $message, $session_id);
            } else {
                return $this->error('Invalid action', 400);
            }
            
        } catch (Exception $e) {
            $this->log('Error in handleSubmit: ' . $e->getMessage());
            return $this->error('An unexpected error occurred', 500);
        }
    }
    
    /**
     * Send OTP
     */
    private function sendOTP($email, $phone) {
        // Validate input
        if (!$email && !$phone) {
            return $this->error('Email or phone is required', 400);
        }
        
        $method = $email ? 'email' : 'sms';
        
        // Validate email if provided
        if ($email && !Security::validateEmail($email)) {
            return $this->error('Invalid email address', 400);
        }
        
        // Validate phone if provided
        if ($phone && !Security::validatePhone($phone)) {
            return $this->error('Invalid phone number', 400);
        }
        
        // Use OTP handler
        $result = $this->otp_handler->generateAndSendOTP($email, $phone, $method);
        echo $result;
        exit();
    }
    
    /**
     * Verify OTP
     */
    private function verifyOTP($session_id, $otp_code) {
        if (!$session_id || !$otp_code) {
            return $this->error('Session ID and OTP code are required', 400);
        }
        
        // Use OTP handler
        $result = $this->otp_handler->verifyOTP($session_id, $otp_code);
        echo $result;
        exit();
    }
    
    /**
     * Submit form with verified OTP
     */
    private function submitForm($name, $email, $phone, $interest, $message, $session_id) {
        // Validate required fields
        if (!$name || !$email || !$message) {
            return $this->error('Name, email, and message are required', 400);
        }
        
        // Validate email
        if (!Security::validateEmail($email)) {
            return $this->error('Invalid email address', 400);
        }
        
        // Validate message length
        $message = trim($message);
        if (strlen($message) < 10) {
            return $this->error('Message must be at least 10 characters long', 400);
        }
        
        // Validate phone if provided
        if ($phone && !Security::validatePhone($phone)) {
            return $this->error('Invalid phone number', 400);
        }
        
        // Check if OTP was verified
        $otp_verified = false;
        $email_verified = false;
        $phone_verified = false;
        
        if ($session_id) {
            $otp_file = DATA_DIR . '/.otp_sessions.json';
            if (file_exists($otp_file)) {
                $sessions = json_decode(file_get_contents($otp_file), true);
                if (isset($sessions[$session_id]) && $sessions[$session_id]['verified']) {
                    $otp_verified = true;
                    if ($sessions[$session_id]['method'] === 'email') {
                        $email_verified = true;
                    } else if ($sessions[$session_id]['method'] === 'sms') {
                        $phone_verified = true;
                    }
                }
            }
        }
        
        // Prepare data for storage
        $data = [
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'interest' => $interest,
            'message' => $message,
            'email_verified' => $email_verified,
            'phone_verified' => $phone_verified
        ];
        
        // Save to CSV
        $result = $this->storage->saveContactSubmission($data);
        
        if ($result['success']) {
            // Send notifications
            $notifier = new NotificationHandler();
            
            // Send confirmation to user
            $notifier->sendUserConfirmation($email, $name, $interest, $message);
            
            // Send notification to team
            $submissionData = [
                'id' => $result['id'],
                'timestamp' => date('Y-m-d H:i:s'),
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'interest' => $interest,
                'message' => $message,
                'email_verified' => $email_verified ? 'Yes' : 'No',
                'phone_verified' => $phone_verified ? 'Yes' : 'No',
                'ip_address' => Security::getClientIP()
            ];
            $notifier->sendTeamNotification($submissionData);
            
            // Sync to CRM (Zapier, HubSpot, Salesforce)
            if (strtolower(CRM_SYNC_ENABLED) === 'true') {
                $crm = new CRMHandler();
                $crm_sync = $crm->syncSubmission($submissionData, $result['id']);
                
                if ($crm_sync['success']) {
                    $this->log('CRM sync initiated for submission: ' . $result['id']);
                } else {
                    $this->log('CRM sync failed (queued for retry): ' . $crm_sync['error']);
                }
            }
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'id' => $result['id'],
                'message' => 'Your message has been received. We will contact you shortly.',
                'otp_verified' => $otp_verified
            ]);
            
            // Log successful submission
            $this->log('Contact submission successful: ' . $result['id']);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $result['error']
            ]);
        }
    }
    
    /**
     * Response helper
     */
    private function error($message, $code) {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message]);
    }
    
    /**
     * Log action
     */
    private function log($message) {
        $log_file = LOGS_DIR . '/contact_' . date('Y-m-d') . '.log';
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($log_file, "[{$timestamp}] {$message}\n", FILE_APPEND);
    }
}

// Handle request
try {
    $handler = new ContactFormHandler();
    $handler->handleSubmit();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Fatal error: ' . $e->getMessage()]);
}
exit();

?>
