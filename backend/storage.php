<?php
/**
 * CSV Storage Handler - Securely store form data
 */

require_once 'config.php';
require_once 'security.php';

class StorageHandler {
    private $security;
    
    public function __construct() {
        $this->security = new Security();
    }
    
    /**
     * Save form submission to CSV
     */
    public function saveContactSubmission($data) {
        try {
            // Validate required fields
            if (!isset($data['name'], $data['email'], $data['message'])) {
                throw new Exception('Missing required fields');
            }
            
            // Sanitize data
            $submission = [
                'timestamp' => date('Y-m-d H:i:s'),
                'id' => Security::generateUID(),
                'name' => Security::sanitize($data['name']),
                'email' => Security::validateEmail($data['email']),
                'phone' => $data['phone'] ? Security::validatePhone($data['phone']) : '',
                'interest' => Security::sanitize($data['interest'] ?? 'general'),
                'message' => Security::sanitize($data['message']),
                'email_verified' => isset($data['email_verified']) ? ($data['email_verified'] ? 'Yes' : 'No') : 'No',
                'phone_verified' => isset($data['phone_verified']) ? ($data['phone_verified'] ? 'Yes' : 'No') : 'No',
                'ip_address' => Security::getClientIP(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
            ];
            
            // Validate critical fields
            if (!$submission['email']) {
                throw new Exception('Invalid email address');
            }
            
            if ($submission['phone'] === false) {
                $submission['phone'] = '';
            }
            
            // Create backup before writing
            $this->createBackup();
            
            // Append to CSV
            $fp = fopen(CSV_PATH, 'a');
            
            if (!$fp) {
                throw new Exception('Cannot open CSV file for writing');
            }
            
            // Lock file while writing
            if (!flock($fp, LOCK_EX)) {
                fclose($fp);
                throw new Exception('Cannot lock CSV file');
            }
            
            $result = fputcsv($fp, [
                $submission['timestamp'],
                $submission['id'],
                $submission['name'],
                $submission['email'],
                $submission['phone'],
                $submission['interest'],
                $submission['message'],
                $submission['email_verified'],
                $submission['phone_verified'],
                $submission['ip_address'],
                $submission['user_agent']
            ]);
            
            flock($fp, LOCK_UN);
            fclose($fp);
            
            if (!$result) {
                throw new Exception('Failed to write to CSV file');
            }
            
            $this->log('Contact submission saved: ' . $submission['id']);
            
            return [
                'success' => true,
                'id' => $submission['id'],
                'message' => 'Data saved successfully'
            ];
            
        } catch (Exception $e) {
            $this->log('Error saving contact submission: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Create backup of CSV file
     */
    private function createBackup() {
        if (!file_exists(CSV_PATH)) {
            return;
        }
        
        // Create backup only once per day
        $backup_date = date('Y-m-d');
        $backup_file = CSV_BACKUP_PATH . CSV_FILENAME . '.' . $backup_date . '.bak';
        
        if (!file_exists($backup_file)) {
            copy(CSV_PATH, $backup_file);
            chmod($backup_file, 0600);
            
            $this->log('Backup created: ' . $backup_file);
            
            // Clean old backups (keep last 30 days)
            $this->cleanOldBackups();
        }
    }
    
    /**
     * Clean old backup files
     */
    private function cleanOldBackups($days = 30) {
        $now = time();
        $cutoff = $now - ($days * 24 * 60 * 60);
        
        $backup_files = glob(CSV_BACKUP_PATH . '*.bak');
        
        foreach ($backup_files as $file) {
            if (filemtime($file) < $cutoff) {
                unlink($file);
                $this->log('Old backup deleted: ' . $file);
            }
        }
    }
    
    /**
     * Get submission count
     */
    public function getSubmissionCount() {
        if (!file_exists(CSV_PATH)) {
            return 0;
        }
        
        $count = 0;
        $fp = fopen(CSV_PATH, 'r');
        
        while (fgets($fp) !== false) {
            $count++;
        }
        
        fclose($fp);
        
        // Subtract 1 for header row
        return max(0, $count - 1);
    }
    
    /**
     * Log action
     */
    private function log($message) {
        $log_file = LOGS_DIR . '/storage_' . date('Y-m-d') . '.log';
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($log_file, "[{$timestamp}] {$message}\n", FILE_APPEND);
    }
}

?>
