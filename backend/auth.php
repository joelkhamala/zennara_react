<?php
/**
 * User Authentication Handler
 * Handles login, registration, password reset, and profile management
 */

require_once 'config.php';
require_once 'security.php';
require_once 'mail.php';
require_once 'totp.php';

header('Content-Type: application/json; charset=utf-8');

class AuthHandler {
    private $users_file;
    private $mailer;
    private $security;
    
    public function __construct() {
        $this->users_file = DATA_DIR . '/users.json';
        $this->mailer = new Mailer();
        $this->security = new Security();
        
        // Create users file if it doesn't exist
        if (!file_exists($this->users_file)) {
            file_put_contents($this->users_file, json_encode([]));
        }
    }
    
    /**
     * Load all users
     */
    private function loadUsers() {
        $content = file_get_contents($this->users_file);
        return json_decode($content, true) ?: [];
    }
    
    /**
     * Save users
     */
    private function saveUsers($users) {
        $lock_file = $this->users_file . '.lock';
        $lock = fopen($lock_file, 'w');
        if (flock($lock, LOCK_EX)) {
            file_put_contents($this->users_file, json_encode($users, JSON_PRETTY_PRINT));
            flock($lock, LOCK_UN);
        }
        fclose($lock);
    }
    
    /**
     * Register new user
     */
    public function register($email, $password, $name, $type = 'tenant') {
        try {
            // Validate inputs
            if (!Security::validateEmail($email)) {
                return $this->error('Invalid email address', 400);
            }
            
            if (strlen($password) < 8) {
                return $this->error('Password must be at least 8 characters', 400);
            }
            
            if (!$name || strlen($name) < 2) {
                return $this->error('Name is required and must be at least 2 characters', 400);
            }
            
            if (!in_array($type, ['tenant', 'client', 'landlord', 'admin'])) {
                return $this->error('Invalid user type', 400);
            }
            
            $users = $this->loadUsers();
            
            // Check if user already exists
            foreach ($users as $user) {
                if ($user['email'] === $email) {
                    return $this->error('Email already registered', 409);
                }
            }
            
            // Create new user
            $user_id = uniqid('user_', true);
            $new_user = [
                'id' => $user_id,
                'email' => $email,
                'password' => password_hash($password, PASSWORD_BCRYPT),
                'name' => $name,
                'type' => $type,
                'phone' => '',
                'company' => '',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
                'verified' => false
            ];
            
            $users[] = $new_user;
            $this->saveUsers($users);
            
            $this->log("User registered: {$email} ({$type})");
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Account created successfully',
                'user' => [
                    'id' => $user_id,
                    'email' => $email,
                    'name' => $name,
                    'type' => $type
                ]
            ]);
            
        } catch (Exception $e) {
            $this->log('Registration error: ' . $e->getMessage());
            return $this->error('Registration failed', 500);
        }
    }
    
    /**
     * Login user (with 2FA check)
     */
    public function login($email, $password) {
        try {
            if (!Security::validateEmail($email)) {
                return $this->error('Invalid email or password', 401);
            }
            
            $users = $this->loadUsers();
            
            // Find user
            $user = null;
            foreach ($users as $u) {
                if ($u['email'] === $email) {
                    $user = $u;
                    break;
                }
            }
            
            if (!$user) {
                $this->log("Login failed: User not found ({$email})");
                return $this->error('Invalid email or password', 401);
            }
            
            // Verify password
            if (!password_verify($password, $user['password'])) {
                $this->log("Login failed: Invalid password ({$email})");
                return $this->error('Invalid email or password', 401);
            }
            
            // Check if 2FA is enabled
            $totp = new TOTPHandler();
            $has_2fa = $totp->is2FAEnabled($user['id']);
            
            if ($has_2fa) {
                // Create temporary session for 2FA verification
                $temp_token = bin2hex(random_bytes(32));
                $temp_file = DATA_DIR . '/.temp_' . $user['id'] . '.json';
                
                $temp_data = [
                    'token' => $temp_token,
                    'user_id' => $user['id'],
                    'email' => $email,
                    'created_at' => time(),
                    'expires_at' => time() + (5 * 60) // 5 minutes for 2FA
                ];
                
                file_put_contents($temp_file, json_encode($temp_data));
                
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'requires_2fa' => true,
                    'temp_token' => $temp_token,
                    'message' => '2FA required - Please enter your authentication code'
                ]);
                
                $this->log("2FA required for user: {$email}");
                return;
            }
            
            // Generate permanent session token (no 2FA required)
            $session_token = bin2hex(random_bytes(32));
            $session_file = DATA_DIR . '/.session_' . $user['id'] . '.json';
            
            $session_data = [
                'token' => $session_token,
                'user_id' => $user['id'],
                'email' => $user['email'],
                'type' => $user['type'],
                'created_at' => time(),
                'expires_at' => time() + (24 * 60 * 60) // 24 hours
            ];
            
            file_put_contents($session_file, json_encode($session_data));
            
            $this->log("User logged in: {$email}");
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'token' => $session_token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'type' => $user['type'],
                    'phone' => $user['phone'],
                    'company' => $user['company']
                ]
            ]);
            
        } catch (Exception $e) {
            $this->log('Login error: ' . $e->getMessage());
            return $this->error('Login failed', 500);
        }
    }
    
    /**
     * Verify session token
     */
    public function verifySession($token) {
        try {
            $sessions_dir = DATA_DIR;
            $files = glob($sessions_dir . '/.session_*.json');
            
            foreach ($files as $file) {
                $session_data = json_decode(file_get_contents($file), true);
                
                if ($session_data['token'] === $token) {
                    // Check if expired
                    if (time() > $session_data['expires_at']) {
                        unlink($file);
                        return $this->error('Session expired', 401);
                    }
                    
                    // Get full user data
                    $users = $this->loadUsers();
                    foreach ($users as $user) {
                        if ($user['id'] === $session_data['user_id']) {
                            return [
                                'success' => true,
                                'user' => [
                                    'id' => $user['id'],
                                    'email' => $user['email'],
                                    'name' => $user['name'],
                                    'type' => $user['type'],
                                    'phone' => $user['phone'],
                                    'company' => $user['company']
                                ]
                            ];
                        }
                    }
                }
            }
            
            return $this->error('Invalid session', 401);
            
        } catch (Exception $e) {
            $this->log('Session verification error: ' . $e->getMessage());
            return $this->error('Verification failed', 500);
        }
    }
    
    /**
     * Logout user
     */
    public function logout($token) {
        try {
            $sessions_dir = DATA_DIR;
            $files = glob($sessions_dir . '/.session_*.json');
            
            foreach ($files as $file) {
                $session_data = json_decode(file_get_contents($file), true);
                if ($session_data['token'] === $token) {
                    unlink($file);
                    $this->log("User logged out");
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Logged out successfully'
                    ]);
                    return;
                }
            }
            
            return $this->error('Invalid session', 401);
            
        } catch (Exception $e) {
            $this->log('Logout error: ' . $e->getMessage());
            return $this->error('Logout failed', 500);
        }
    }
    
    /**
     * Request password reset
     */
    public function requestPasswordReset($email) {
        try {
            if (!Security::validateEmail($email)) {
                return $this->error('Invalid email address', 400);
            }
            
            $users = $this->loadUsers();
            
            // Find user
            $user = null;
            foreach ($users as $u) {
                if ($u['email'] === $email) {
                    $user = $u;
                    break;
                }
            }
            
            if (!$user) {
                // Return success anyway (don't reveal if email exists)
                return $this->success('If that email exists, a reset link has been sent');
            }
            
            // Generate reset token
            $reset_token = bin2hex(random_bytes(32));
            $reset_file = DATA_DIR . '/.reset_' . $user['id'] . '.json';
            
            $reset_data = [
                'token' => $reset_token,
                'user_id' => $user['id'],
                'email' => $email,
                'created_at' => time(),
                'expires_at' => time() + (1 * 60 * 60) // 1 hour
            ];
            
            file_put_contents($reset_file, json_encode($reset_data));
            
            // Send reset email
            $reset_link = "http://localhost:3000/portal?reset={$reset_token}";
            $subject = "Password Reset - ZENNARA";
            
            $body = "
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password for your ZENNARA account.</p>
            
            <p>Click the link below to reset your password:</p>
            <p><a href=\"{$reset_link}\" style=\"background: #C9A030; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;\">Reset Password</a></p>
            
            <p>Or copy this link:</p>
            <p><code>{$reset_link}</code></p>
            
            <p><strong>This link expires in 1 hour.</strong></p>
            
            <p>If you didn't request this, please ignore this email.</p>
            
            <p>Best regards,<br><strong>ZENNARA Team</strong></p>
            ";
            
            $this->mailer->send($email, $subject, $body);
            
            $this->log("Password reset requested for: {$email}");
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'If that email exists, a reset link has been sent'
            ]);
            
        } catch (Exception $e) {
            $this->log('Password reset request error: ' . $e->getMessage());
            return $this->error('Request failed', 500);
        }
    }
    
    /**
     * Reset password with token
     */
    public function resetPassword($token, $new_password) {
        try {
            if (strlen($new_password) < 8) {
                return $this->error('Password must be at least 8 characters', 400);
            }
            
            $sessions_dir = DATA_DIR;
            $files = glob($sessions_dir . '/.reset_*.json');
            
            $reset_data = null;
            $reset_file = null;
            
            // Find reset token
            foreach ($files as $file) {
                $data = json_decode(file_get_contents($file), true);
                if ($data['token'] === $token) {
                    $reset_data = $data;
                    $reset_file = $file;
                    break;
                }
            }
            
            if (!$reset_data) {
                return $this->error('Invalid or expired reset token', 401);
            }
            
            // Check if expired
            if (time() > $reset_data['expires_at']) {
                unlink($reset_file);
                return $this->error('Reset token has expired', 401);
            }
            
            // Update user password
            $users = $this->loadUsers();
            $updated = false;
            
            foreach ($users as &$user) {
                if ($user['id'] === $reset_data['user_id']) {
                    $user['password'] = password_hash($new_password, PASSWORD_BCRYPT);
                    $user['updated_at'] = date('Y-m-d H:i:s');
                    $updated = true;
                    break;
                }
            }
            
            if (!$updated) {
                return $this->error('User not found', 404);
            }
            
            $this->saveUsers($users);
            
            // Delete reset token
            unlink($reset_file);
            
            $this->log("Password reset completed for: {$reset_data['email']}");
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Password reset successfully'
            ]);
            
        } catch (Exception $e) {
            $this->log('Password reset error: ' . $e->getMessage());
            return $this->error('Reset failed', 500);
        }
    }
    
    /**
     * Update user profile
     */
    public function updateProfile($token, $data) {
        try {
            // Verify session
            $sessions_dir = DATA_DIR;
            $files = glob($sessions_dir . '/.session_*.json');
            
            $user_id = null;
            foreach ($files as $file) {
                $session_data = json_decode(file_get_contents($file), true);
                if ($session_data['token'] === $token) {
                    $user_id = $session_data['user_id'];
                    break;
                }
            }
            
            if (!$user_id) {
                return $this->error('Invalid session', 401);
            }
            
            // Update user profile
            $users = $this->loadUsers();
            $updated = false;
            
            $updated_user = null;
            foreach ($users as &$user) {
                if ($user['id'] === $user_id) {
                    if (isset($data['name']) && !empty($data['name'])) {
                        $user['name'] = $data['name'];
                    }
                    if (isset($data['email']) && !empty($data['email'])) {
                        // Check if email is already used
                        foreach ($users as $other_user) {
                            if ($other_user['email'] === $data['email'] && $other_user['id'] !== $user_id) {
                                return $this->error('Email already in use', 409);
                            }
                        }
                        $user['email'] = $data['email'];
                    }
                    if (isset($data['phone'])) {
                        $user['phone'] = $data['phone'];
                    }
                    if (isset($data['company'])) {
                        $user['company'] = $data['company'];
                    }
                    
                    $user['updated_at'] = date('Y-m-d H:i:s');
                    $updated = true;
                    $updated_user = $user;
                    break;
                }
            }
            unset($user);
            
            if (!$updated || !$updated_user) {
                return $this->error('User not found', 404);
            }
            
            $this->saveUsers($users);
            
            $this->log("Profile updated for user: {$user_id}");
            
            if (ob_get_level() > 0) ob_clean();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $updated_user['id'],
                    'email' => $updated_user['email'],
                    'name' => $updated_user['name'],
                    'type' => $updated_user['type'],
                    'phone' => $updated_user['phone'],
                    'company' => $updated_user['company']
                ]
            ]);
            return;
            
        } catch (Exception $e) {
            $this->log('Profile update error: ' . $e->getMessage());
            return $this->error('Update failed', 500);
        }
    }
    
    /**
     * Verify 2FA code and complete login
     */
    public function verify2FA($temp_token, $code) {
        try {
            // Find temporary session
            $sessions_dir = DATA_DIR;
            $temp_files = glob($sessions_dir . '/.temp_*.json');
            
            $user_id = null;
            $temp_file = null;
            
            foreach ($temp_files as $file) {
                $temp_data = json_decode(file_get_contents($file), true);
                
                if ($temp_data['token'] === $temp_token) {
                    // Check if expired
                    if (time() > $temp_data['expires_at']) {
                        unlink($file);
                        return $this->error('2FA token expired', 401);
                    }
                    
                    $user_id = $temp_data['user_id'];
                    $temp_file = $file;
                    break;
                }
            }
            
            if (!$user_id) {
                return $this->error('Invalid 2FA token', 401);
            }
            
            // Verify 2FA code
            $totp = new TOTPHandler();
            if (!$totp->verify2FACode($user_id, $code)) {
                return $this->error('Invalid 2FA code', 401);
            }
            
            // Create permanent session
            $session_token = bin2hex(random_bytes(32));
            $session_file = DATA_DIR . '/.session_' . $user_id . '.json';
            
            // Get user data
            $users = $this->loadUsers();
            $user = null;
            
            foreach ($users as $u) {
                if ($u['id'] === $user_id) {
                    $user = $u;
                    break;
                }
            }
            
            if (!$user) {
                return $this->error('User not found', 404);
            }
            
            $session_data = [
                'token' => $session_token,
                'user_id' => $user_id,
                'email' => $user['email'],
                'type' => $user['type'],
                'created_at' => time(),
                'expires_at' => time() + (24 * 60 * 60) // 24 hours
            ];
            
            file_put_contents($session_file, json_encode($session_data));
            
            // Remove temporary session
            unlink($temp_file);
            
            $this->log("User 2FA verified and logged in: {$user['email']}");
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => '2FA verified - Login successful',
                'token' => $session_token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'type' => $user['type'],
                    'phone' => $user['phone'],
                    'company' => $user['company']
                ]
            ]);
            
        } catch (Exception $e) {
            $this->log('2FA verification error: ' . $e->getMessage());
            return $this->error('2FA verification failed', 500);
        }
    }
    
    /**
     * Get user profile
     */
    public function getProfile($token) {
        try {
            // Verify session
            $sessions_dir = DATA_DIR;
            $files = glob($sessions_dir . '/.session_*.json');
            
            foreach ($files as $file) {
                $session_data = json_decode(file_get_contents($file), true);
                if ($session_data['token'] === $token) {
                    $user_id = $session_data['user_id'];
                    
                    // Get user
                    $users = $this->loadUsers();
                    foreach ($users as $user) {
                        if ($user['id'] === $user_id) {
                            http_response_code(200);
                            echo json_encode([
                                'success' => true,
                                'user' => [
                                    'id' => $user['id'],
                                    'email' => $user['email'],
                                    'name' => $user['name'],
                                    'type' => $user['type'],
                                    'phone' => $user['phone'],
                                    'company' => $user['company']
                                ]
                            ]);
                            return;
                        }
                    }
                }
            }
            
            return $this->error('Invalid session', 401);
            
        } catch (Exception $e) {
            $this->log('Get profile error: ' . $e->getMessage());
            return $this->error('Failed to get profile', 500);
        }
    }
    
    /**
     * Helper: Success response
     */
    private function success($message) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => $message
        ]);
    }
    
    /**
     * Helper: Error response
     */
    private function error($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
    }
    
    /**
     * Log action
     */
    private function log($message) {
        $log_file = LOGS_DIR . '/auth_' . date('Y-m-d') . '.log';
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($log_file, "[{$timestamp}] {$message}\n", FILE_APPEND);
    }
}

// Handle API requests only when executed directly
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        if (ob_get_level() > 0) ob_clean();
        http_response_code(200);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $input['action'] ?? null;
        
        $auth = new AuthHandler();
        
        if ($action === 'register') {
            $auth->register(
                $input['email'] ?? '',
                $input['password'] ?? '',
                $input['name'] ?? '',
                $input['type'] ?? 'client'
            );
        } elseif ($action === 'login') {
            $auth->login(
                $input['email'] ?? '',
                $input['password'] ?? ''
            );
        } elseif ($action === 'verify_2fa') {
            $auth->verify2FA(
                $input['temp_token'] ?? '',
                $input['code'] ?? ''
            );
        } elseif ($action === 'verify_session') {
            $result = $auth->verifySession($input['token'] ?? '');
            if (is_array($result) && isset($result['success'])) {
                if (ob_get_level() > 0) ob_clean();
                http_response_code(200);
                echo json_encode($result);
            }
        } elseif ($action === 'logout') {
            $auth->logout($input['token'] ?? '');
        } elseif ($action === 'request_password_reset') {
            $auth->requestPasswordReset($input['email'] ?? '');
        } elseif ($action === 'reset_password') {
            $auth->resetPassword($input['token'] ?? '', $input['password'] ?? '');
        } elseif ($action === 'update_profile') {
            $auth->updateProfile($input['token'] ?? '', $input['data'] ?? []);
        } elseif ($action === 'get_profile') {
            $auth->getProfile($input['token'] ?? '');
        } else {
            if (ob_get_level() > 0) ob_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
        }
    } else {
        if (ob_get_level() > 0) ob_clean();
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
    exit();
}

?>
