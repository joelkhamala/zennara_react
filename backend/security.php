<?php
/**
 * Security Handler - Data encryption and sanitization
 */

class Security {
    /**
     * Sanitize input data
     */
    public static function sanitize($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        
        return htmlspecialchars(stripslashes(trim($data)), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate email
     */
    public static function validateEmail($email) {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : false;
    }
    
    /**
     * Validate phone number
     */
    public static function validatePhone($phone) {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        // Check if phone is between 10-15 digits
        if (preg_match('/^\+?[0-9]{10,15}$/', $phone)) {
            return $phone;
        }
        
        return false;
    }
    
    /**
     * Encrypt data (using openssl)
     */
    public static function encrypt($data, $key = ENCRYPTION_KEY) {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted = openssl_encrypt($data, 'aes-256-cbc', hash('sha256', $key, true), false, $iv);
        return base64_encode($iv . $encrypted);
    }
    
    /**
     * Decrypt data
     */
    public static function decrypt($data, $key = ENCRYPTION_KEY) {
        try {
            $data = base64_decode($data);
            $iv = substr($data, 0, openssl_cipher_iv_length('aes-256-cbc'));
            $encrypted = substr($data, openssl_cipher_iv_length('aes-256-cbc'));
            return openssl_decrypt($encrypted, 'aes-256-cbc', hash('sha256', $key, true), false, $iv);
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Generate CSRF token
     */
    public static function generateCSRFToken() {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Verify CSRF token
     */
    public static function verifyCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Get client IP address
     */
    public static function getClientIP() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'UNKNOWN';
    }
    
    /**
     * Hash password
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }
    
    /**
     * Verify password
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Generate unique ID
     */
    public static function generateUID() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}

?>
