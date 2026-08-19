<?php
/**
 * Two-Factor Authentication (2FA) Handler - TOTP Implementation
 * Time-based One-Time Password for Google Authenticator, Authy, etc.
 */

require_once 'config.php';
require_once 'security.php';

class TOTPHandler {
    private $secret_file;
    private $backup_codes_file;
    
    public function __construct() {
        $this->secret_file = DATA_DIR . '/totp_secrets.json';
        $this->backup_codes_file = DATA_DIR . '/backup_codes.json';
        
        if (!file_exists($this->secret_file)) {
            file_put_contents($this->secret_file, json_encode([]));
        }
        if (!file_exists($this->backup_codes_file)) {
            file_put_contents($this->backup_codes_file, json_encode([]));
        }
    }
    
    /**
     * Generate random base32 secret for TOTP
     */
    public function generateSecret() {
        $length = 32;
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        
        for ($i = 0; $i < $length; $i++) {
            $secret .= $alphabet[random_int(0, 31)];
        }
        
        return $secret;
    }
    
    /**
     * Generate QR code data URI for TOTP secret
     */
    public function generateQRCodeDataUri($secret, $email, $issuer = 'ZENNARA') {
        $otpauth_url = 'otpauth://totp/' . urlencode($issuer . ':' . $email) . 
                       '?secret=' . $secret . 
                       '&issuer=' . urlencode($issuer) .
                       '&algorithm=SHA1&digits=6&period=30';
        
        // Use Google Charts API for QR code generation
        $qr_url = 'https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl=' . 
                  urlencode($otpauth_url);
        
        return $qr_url;
    }
    
    /**
     * Verify TOTP code
     */
    public function verifyTOTP($secret, $code, $time_window = 1) {
        $code = str_replace(' ', '', $code);
        
        if (strlen($code) !== 6 || !ctype_digit($code)) {
            return false;
        }
        
        $current_time = floor(time() / 30);
        
        for ($i = -$time_window; $i <= $time_window; $i++) {
            $time = $current_time + $i;
            $hash = hash_hmac('sha1', pack('N', $time), $this->base32_decode($secret), true);
            $offset = ord($hash[19]) & 0x0f;
            $code_computed = (unpack('N', substr($hash, $offset, 4))[1] & 0x7fffffff) % 1000000;
            
            if (str_pad($code_computed, 6, '0', STR_PAD_LEFT) === $code) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Decode base32 string
     */
    private function base32_decode($str) {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $bits = '';
        $str = strtoupper($str);
        
        for ($i = 0; $i < strlen($str); $i++) {
            $char = $str[$i];
            if (($pos = strpos($alphabet, $char)) === false) {
                continue;
            }
            $bits .= str_pad(base_convert($pos, 10, 2), 5, '0', STR_PAD_LEFT);
        }
        
        $bytes = '';
        for ($i = 0; $i + 8 <= strlen($bits); $i += 8) {
            $bytes .= chr(base_convert(substr($bits, $i, 8), 2, 10));
        }
        
        return $bytes;
    }
    
    /**
     * Generate backup codes
     */
    public function generateBackupCodes($count = 10) {
        $codes = [];
        
        for ($i = 0; $i < $count; $i++) {
            $code = '';
            for ($j = 0; $j < 8; $j++) {
                $code .= random_int(0, 9);
            }
            // Format: XXXX-XXXX
            $codes[] = substr($code, 0, 4) . '-' . substr($code, 4, 4);
        }
        
        return $codes;
    }
    
    /**
     * Enable 2FA for user
     */
    public function enable2FA($user_id, $email) {
        try {
            $secret = $this->generateSecret();
            $backup_codes = $this->generateBackupCodes(10);
            
            $secrets = $this->loadSecrets();
            $backup_codes_data = $this->loadBackupCodes();
            
            // Store secret (not yet enabled)
            $secrets[$user_id] = [
                'secret' => $secret,
                'enabled' => false,
                'created_at' => date('Y-m-d H:i:s'),
                'email' => $email
            ];
            
            // Store backup codes (not yet enabled)
            $backup_codes_data[$user_id] = [
                'codes' => $backup_codes,
                'used' => [],
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            $this->saveSecrets($secrets);
            $this->saveBackupCodes($backup_codes_data);
            
            $this->log("2FA setup initiated for user: {$user_id}");
            
            return [
                'secret' => $secret,
                'backup_codes' => $backup_codes,
                'qr_code_url' => $this->generateQRCodeDataUri($secret, $email)
            ];
            
        } catch (Exception $e) {
            $this->log('Error enabling 2FA: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Verify and enable 2FA
     */
    public function verify2FA($user_id, $code) {
        try {
            $secrets = $this->loadSecrets();
            
            if (!isset($secrets[$user_id])) {
                return false;
            }
            
            $user_secret = $secrets[$user_id];
            
            if ($user_secret['enabled']) {
                return false; // Already enabled
            }
            
            if (!$this->verifyTOTP($user_secret['secret'], $code)) {
                return false;
            }
            
            // Enable 2FA
            $secrets[$user_id]['enabled'] = true;
            $secrets[$user_id]['enabled_at'] = date('Y-m-d H:i:s');
            $this->saveSecrets($secrets);
            
            $this->log("2FA enabled for user: {$user_id}");
            
            return true;
            
        } catch (Exception $e) {
            $this->log('Error verifying 2FA: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Verify login with 2FA
     */
    public function verify2FACode($user_id, $code) {
        try {
            $secrets = $this->loadSecrets();
            
            if (!isset($secrets[$user_id]) || !$secrets[$user_id]['enabled']) {
                return false;
            }
            
            // Check if code is backup code first
            $backup_codes_data = $this->loadBackupCodes();
            
            if (isset($backup_codes_data[$user_id])) {
                $code_upper = strtoupper(str_replace(' ', '', $code));
                
                foreach ($backup_codes_data[$user_id]['codes'] as $idx => $backup_code) {
                    if ($backup_code === $code_upper && !in_array($idx, $backup_codes_data[$user_id]['used'])) {
                        // Mark code as used
                        $backup_codes_data[$user_id]['used'][] = $idx;
                        $this->saveBackupCodes($backup_codes_data);
                        
                        $this->log("Backup code used by user: {$user_id}");
                        
                        return true;
                    }
                }
            }
            
            // Check TOTP code
            if ($this->verifyTOTP($secrets[$user_id]['secret'], $code)) {
                return true;
            }
            
            return false;
            
        } catch (Exception $e) {
            $this->log('Error verifying 2FA code: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Disable 2FA for user
     */
    public function disable2FA($user_id, $password_hash) {
        try {
            $secrets = $this->loadSecrets();
            
            if (!isset($secrets[$user_id])) {
                return false;
            }
            
            // Remove 2FA
            unset($secrets[$user_id]);
            $this->saveSecrets($secrets);
            
            // Remove backup codes
            $backup_codes_data = $this->loadBackupCodes();
            unset($backup_codes_data[$user_id]);
            $this->saveBackupCodes($backup_codes_data);
            
            $this->log("2FA disabled for user: {$user_id}");
            
            return true;
            
        } catch (Exception $e) {
            $this->log('Error disabling 2FA: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Check if 2FA is enabled for user
     */
    public function is2FAEnabled($user_id) {
        $secrets = $this->loadSecrets();
        
        if (!isset($secrets[$user_id])) {
            return false;
        }
        
        return $secrets[$user_id]['enabled'] ?? false;
    }
    
    /**
     * Get remaining backup codes count
     */
    public function getBackupCodesCount($user_id) {
        $backup_codes_data = $this->loadBackupCodes();
        
        if (!isset($backup_codes_data[$user_id])) {
            return 0;
        }
        
        $total = count($backup_codes_data[$user_id]['codes']);
        $used = count($backup_codes_data[$user_id]['used']);
        
        return $total - $used;
    }
    
    /**
     * Regenerate backup codes
     */
    public function regenerateBackupCodes($user_id) {
        try {
            $backup_codes_data = $this->loadBackupCodes();
            $new_codes = $this->generateBackupCodes(10);
            
            $backup_codes_data[$user_id] = [
                'codes' => $new_codes,
                'used' => [],
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            $this->saveBackupCodes($backup_codes_data);
            
            $this->log("Backup codes regenerated for user: {$user_id}");
            
            return $new_codes;
            
        } catch (Exception $e) {
            $this->log('Error regenerating backup codes: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Load secrets
     */
    private function loadSecrets() {
        $content = file_get_contents($this->secret_file);
        return json_decode($content, true) ?: [];
    }
    
    /**
     * Save secrets
     */
    private function saveSecrets($secrets) {
        $lock_file = $this->secret_file . '.lock';
        $lock = fopen($lock_file, 'w');
        if (flock($lock, LOCK_EX)) {
            file_put_contents($this->secret_file, json_encode($secrets, JSON_PRETTY_PRINT));
            flock($lock, LOCK_UN);
        }
        fclose($lock);
    }
    
    /**
     * Load backup codes
     */
    private function loadBackupCodes() {
        $content = file_get_contents($this->backup_codes_file);
        return json_decode($content, true) ?: [];
    }
    
    /**
     * Save backup codes
     */
    private function saveBackupCodes($codes) {
        $lock_file = $this->backup_codes_file . '.lock';
        $lock = fopen($lock_file, 'w');
        if (flock($lock, LOCK_EX)) {
            file_put_contents($this->backup_codes_file, json_encode($codes, JSON_PRETTY_PRINT));
            flock($lock, LOCK_UN);
        }
        fclose($lock);
    }
    
    /**
     * Log action
     */
    private function log($message) {
        $log_file = LOGS_DIR . '/2fa_' . date('Y-m-d') . '.log';
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($log_file, "[{$timestamp}] {$message}\n", FILE_APPEND);
    }
}

// Handle API requests only when executed directly (not when included via require_once)
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? null;
        $user_id = $input['user_id'] ?? null;
        
        $totp = new TOTPHandler();
        
        if ($action === 'setup') {
            try {
                if (!$user_id) {
                    if (ob_get_level() > 0) ob_clean();
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Missing user_id parameter']);
                    exit;
                }
                
                $email = $input['email'] ?? null;
                if (!$email) {
                    $users_file = DATA_DIR . '/users.json';
                    if (file_exists($users_file)) {
                        $users = json_decode(file_get_contents($users_file), true) ?: [];
                        foreach ($users as $u) {
                            if ($u['id'] === $user_id) {
                                $email = $u['email'];
                                break;
                            }
                        }
                    }
                }
                
                $email = $email ?: 'user@zennarafp.com';
                $result = $totp->enable2FA($user_id, $email);
                
                if (ob_get_level() > 0) ob_clean();
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'secret' => $result['secret'],
                    'backup_codes' => $result['backup_codes'],
                    'qr_code_url' => $result['qr_code_url'],
                    'qr_code_data_uri' => $result['qr_code_url']
                ]);
            } catch (Exception $e) {
                if (ob_get_level() > 0) ob_clean();
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
        } elseif ($action === 'verify_setup') {
            if (!$user_id || !isset($input['code'])) {
                if (ob_get_level() > 0) ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing parameters']);
                exit;
            }
            
            $verified = $totp->verify2FA($user_id, $input['code']);
            
            if (ob_get_level() > 0) ob_clean();
            http_response_code($verified ? 200 : 401);
            echo json_encode([
                'success' => $verified,
                'message' => $verified ? '2FA enabled successfully' : 'Invalid code'
            ]);
        } elseif ($action === 'verify_code') {
            if (!$user_id || !isset($input['code'])) {
                if (ob_get_level() > 0) ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing parameters']);
                exit;
            }
            
            $verified = $totp->verify2FACode($user_id, $input['code']);
            
            if (ob_get_level() > 0) ob_clean();
            http_response_code($verified ? 200 : 401);
            echo json_encode([
                'success' => $verified,
                'message' => $verified ? '2FA verified' : 'Invalid code'
            ]);
        } elseif ($action === 'disable') {
            if (!$user_id) {
                if (ob_get_level() > 0) ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing user_id']);
                exit;
            }
            
            $disabled = $totp->disable2FA($user_id, null);
            
            if (ob_get_level() > 0) ob_clean();
            http_response_code($disabled ? 200 : 400);
            echo json_encode([
                'success' => $disabled,
                'message' => $disabled ? '2FA disabled' : 'Failed to disable 2FA'
            ]);
        } elseif ($action === 'status') {
            if (!$user_id) {
                if (ob_get_level() > 0) ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing user_id']);
                exit;
            }
            
            $enabled = $totp->is2FAEnabled($user_id);
            $backup_count = $totp->getBackupCodesCount($user_id);
            
            if (ob_get_level() > 0) ob_clean();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'enabled' => $enabled,
                'is_enabled' => $enabled,
                'backup_codes_count' => $backup_count,
                'backup_codes_remaining' => $backup_count
            ]);
        } elseif ($action === 'regenerate_backup') {
            if (!$user_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing user_id']);
                exit;
            }
            
            try {
                $new_codes = $totp->regenerateBackupCodes($user_id);
                
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'backup_codes' => $new_codes
                ]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
    exit;
}

?>
