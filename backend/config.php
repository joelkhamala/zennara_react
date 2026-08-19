<?php
/**
 * ZENNARA Contact Form Configuration
 * Secure configuration for OTP and form processing
 */

// Disable HTML error display in API output and buffer everything
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);

// Start output buffering to prevent any stray output
ob_start();

// Security Headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle OPTIONS preflight requests globally
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (ob_get_level() > 0) ob_clean();
    http_response_code(200);
    exit();
}

// Environment Variables
define('PROJECT_ROOT', dirname(__DIR__));
define('DATA_DIR', PROJECT_ROOT . '/data');
define('LOGS_DIR', PROJECT_ROOT . '/logs');

// Load environment variables from .env or .env.backend if present
$env_files = [PROJECT_ROOT . '/.env', PROJECT_ROOT . '/.env.backend', __DIR__ . '/.env'];
foreach ($env_files as $env_path) {
    if (file_exists($env_path) && is_readable($env_path)) {
        $lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || $line[0] === '#') continue;
            if (strpos($line, '=') !== false) {
                list($env_k, $env_v) = explode('=', $line, 2);
                $env_k = trim($env_k);
                $env_v = trim(trim($env_v), "\"'");
                if (!empty($env_k)) {
                    putenv("{$env_k}={$env_v}");
                    $_ENV[$env_k] = $env_v;
                    $_SERVER[$env_k] = $env_v;
                }
            }
        }
        break;
    }
}

// Email Configuration
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'smtp.gmail.com');
define('SMTP_PORT', getenv('SMTP_PORT') ?: 587);
define('SMTP_USER', getenv('SMTP_USER') ?: 'your-email@gmail.com');
define('SMTP_PASS', getenv('SMTP_PASS') ?: 'your-app-password');
define('FROM_EMAIL', getenv('FROM_EMAIL') ?: 'info@zennarafp.com');
define('FROM_NAME', getenv('FROM_NAME') ?: 'ZENNARA');
define('TEAM_EMAIL', getenv('TEAM_EMAIL') ?: 'info@zennarafp.com');

// SMS Configuration (Africa's Talking & Twilio)
define('SMS_PROVIDER', getenv('SMS_PROVIDER') ?: 'africastalking');
define('AT_USERNAME', getenv('AT_USERNAME') ?: '');
define('AT_API_KEY', getenv('AT_API_KEY') ?: '');
define('AT_SENDER_ID', getenv('AT_SENDER_ID') ?: '');

define('TWILIO_ACCOUNT_SID', getenv('TWILIO_ACCOUNT_SID') ?: '');
define('TWILIO_AUTH_TOKEN', getenv('TWILIO_AUTH_TOKEN') ?: '');
define('TWILIO_API_KEY', getenv('TWILIO_API_KEY') ?: '');
define('TWILIO_API_SECRET', getenv('TWILIO_API_SECRET') ?: '');
define('TWILIO_FROM_NUMBER', getenv('TWILIO_FROM_NUMBER') ?: '');

// CRM Integration Configuration
define('ZAPIER_WEBHOOK_URL', getenv('ZAPIER_WEBHOOK_URL') ?: '');
define('HUBSPOT_API_KEY', getenv('HUBSPOT_API_KEY') ?: '');
define('HUBSPOT_PIPELINE_ID', getenv('HUBSPOT_PIPELINE_ID') ?: 'default');
define('SALESFORCE_CLIENT_ID', getenv('SALESFORCE_CLIENT_ID') ?: '');
define('SALESFORCE_CLIENT_SECRET', getenv('SALESFORCE_CLIENT_SECRET') ?: '');
define('SALESFORCE_USERNAME', getenv('SALESFORCE_USERNAME') ?: '');
define('SALESFORCE_PASSWORD', getenv('SALESFORCE_PASSWORD') ?: '');
define('SALESFORCE_ENDPOINT', getenv('SALESFORCE_ENDPOINT') ?: 'https://login.salesforce.com');
define('CRM_SYNC_ENABLED', getenv('CRM_SYNC_ENABLED') ?: 'true');

// Security Settings
define('OTP_LENGTH', 6);
define('OTP_EXPIRY_MINUTES', 10);
define('MAX_ATTEMPTS', 5);
define('RATE_LIMIT_MINUTES', 15);

// CSV Settings
define('CSV_FILENAME', 'contact_submissions.csv');
define('CSV_PATH', DATA_DIR . '/' . CSV_FILENAME);
define('CSV_BACKUP_PATH', DATA_DIR . '/backups/');

// Encryption Key (change this to a random string)
define('ENCRYPTION_KEY', getenv('ENCRYPTION_KEY') ?: 'your-secret-encryption-key-change-this');

// Initialize directories
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}
if (!is_dir(LOGS_DIR)) {
    mkdir(LOGS_DIR, 0755, true);
}
if (!is_dir(CSV_BACKUP_PATH)) {
    mkdir(CSV_BACKUP_PATH, 0755, true);
}

// Initialize CSV file with headers if it doesn't exist
if (!file_exists(CSV_PATH)) {
    $headers = [
        'Timestamp',
        'ID',
        'Name',
        'Email',
        'Phone',
        'Interest',
        'Message',
        'Email_Verified',
        'Phone_Verified',
        'IP_Address',
        'User_Agent'
    ];
    $fp = fopen(CSV_PATH, 'w');
    fputcsv($fp, $headers);
    fclose($fp);
    chmod(CSV_PATH, 0644);
}

// Session Configuration
if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
    ini_set('session.cookie_httponly', 1);
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', 1);
    }
    ini_set('session.use_strict_mode', 1);
    @session_start();
}

?>
