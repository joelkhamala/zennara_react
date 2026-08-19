<?php
/**
 * CRM Integration Handler - Sync contact submissions to CRM platforms
 */

require_once 'config.php';

class CRMHandler {
    private $sync_log_file;
    
    public function __construct() {
        $this->sync_log_file = LOGS_DIR . '/crm_sync_' . date('Y-m-d') . '.log';
    }
    
    /**
     * Sync submission to CRM platforms
     */
    public function syncSubmission($data, $submission_id) {
        $results = [];
        
        // Sync to Zapier if configured
        if (ZAPIER_WEBHOOK_URL) {
            $results['zapier'] = $this->syncToZapier($data, $submission_id);
        }
        
        // Sync to HubSpot if configured
        if (HUBSPOT_API_KEY) {
            $results['hubspot'] = $this->syncToHubSpot($data, $submission_id);
        }
        
        // Sync to Salesforce if configured
        if (SALESFORCE_CLIENT_ID && SALESFORCE_CLIENT_SECRET) {
            $results['salesforce'] = $this->syncToSalesforce($data, $submission_id);
        }
        
        // If no CRM is configured, return success
        if (empty($results)) {
            return [
                'success' => true,
                'message' => 'No CRM platforms configured',
                'results' => []
            ];
        }
        
        // Check if all syncs succeeded
        $all_succeeded = array_reduce($results, function($carry, $result) {
            return $carry && $result['success'];
        }, true);
        
        return [
            'success' => $all_succeeded,
            'error' => $all_succeeded ? null : 'Some CRM syncs failed',
            'results' => $results
        ];
    }
    
    /**
     * Sync to Zapier via webhook
     */
    private function syncToZapier($data, $submission_id) {
        try {
            $payload = [
                'id' => $data['id'],
                'timestamp' => $data['timestamp'],
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'interest' => $data['interest'],
                'message' => $data['message'],
                'email_verified' => $data['email_verified'],
                'phone_verified' => $data['phone_verified'],
                'ip_address' => $data['ip_address']
            ];
            
            $ch = curl_init(ZAPIER_WEBHOOK_URL);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($http_code >= 200 && $http_code < 300) {
                $this->log('Zapier sync successful: ' . $submission_id);
                return ['success' => true, 'platform' => 'zapier'];
            } else {
                $this->log('Zapier sync failed (HTTP ' . $http_code . '): ' . $response);
                return ['success' => false, 'platform' => 'zapier', 'error' => 'HTTP ' . $http_code];
            }
        } catch (Exception $e) {
            $this->log('Zapier sync error: ' . $e->getMessage());
            return ['success' => false, 'platform' => 'zapier', 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Sync to HubSpot
     */
    private function syncToHubSpot($data, $submission_id) {
        try {
            $endpoint = 'https://api.hubapi.com/crm/v3/objects/contacts';
            
            $payload = [
                'properties' => [
                    'firstname' => explode(' ', $data['name'])[0],
                    'lastname' => implode(' ', array_slice(explode(' ', $data['name']), 1)),
                    'email' => $data['email'],
                    'phone' => $data['phone'] ?: '',
                    'company' => 'ZENNARA',
                    'lifecyclestage' => 'lead',
                    'hs_lead_status' => 'New',
                    'notes' => $data['message'],
                    'interest_area' => $data['interest']
                ]
            ];
            
            $ch = curl_init($endpoint);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . HUBSPOT_API_KEY
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($http_code >= 200 && $http_code < 300) {
                $this->log('HubSpot sync successful: ' . $submission_id);
                return ['success' => true, 'platform' => 'hubspot'];
            } else {
                $this->log('HubSpot sync failed (HTTP ' . $http_code . '): ' . $response);
                return ['success' => false, 'platform' => 'hubspot', 'error' => 'HTTP ' . $http_code];
            }
        } catch (Exception $e) {
            $this->log('HubSpot sync error: ' . $e->getMessage());
            return ['success' => false, 'platform' => 'hubspot', 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Sync to Salesforce
     */
    private function syncToSalesforce($data, $submission_id) {
        try {
            // First, get OAuth token
            $token = $this->getSalesforceToken();
            if (!$token) {
                throw new Exception('Failed to get Salesforce authentication token');
            }
            
            // Create lead in Salesforce
            $instance_url = $this->getSalesforceInstanceURL($token);
            $endpoint = $instance_url . '/services/data/v57.0/sobjects/Lead';
            
            $payload = [
                'LastName' => $data['name'],
                'Email' => $data['email'],
                'Phone' => $data['phone'] ?: '',
                'Company' => 'ZENNARA',
                'Description' => $data['message'],
                'LeadSource' => 'Web',
                'Status' => 'New'
            ];
            
            $ch = curl_init($endpoint);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($http_code >= 200 && $http_code < 300) {
                $this->log('Salesforce sync successful: ' . $submission_id);
                return ['success' => true, 'platform' => 'salesforce'];
            } else {
                $this->log('Salesforce sync failed (HTTP ' . $http_code . '): ' . $response);
                return ['success' => false, 'platform' => 'salesforce', 'error' => 'HTTP ' . $http_code];
            }
        } catch (Exception $e) {
            $this->log('Salesforce sync error: ' . $e->getMessage());
            return ['success' => false, 'platform' => 'salesforce', 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Get Salesforce OAuth token
     */
    private function getSalesforceToken() {
        try {
            $endpoint = SALESFORCE_ENDPOINT . '/services/oauth2/token';
            
            $post_data = [
                'grant_type' => 'password',
                'client_id' => SALESFORCE_CLIENT_ID,
                'client_secret' => SALESFORCE_CLIENT_SECRET,
                'username' => SALESFORCE_USERNAME,
                'password' => SALESFORCE_PASSWORD
            ];
            
            $ch = curl_init($endpoint);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($http_code === 200) {
                $data = json_decode($response, true);
                return $data['access_token'] ?? null;
            }
            
            return null;
        } catch (Exception $e) {
            $this->log('Salesforce token error: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get Salesforce instance URL
     */
    private function getSalesforceInstanceURL($token) {
        // For simplicity, derive from endpoint
        // In production, parse from token response
        return 'https://na0.salesforce.com'; // Default US endpoint
    }
    
    /**
     * Get CRM Sync Statistics
     */
    public function getStatistics() {
        $stats = [
            'total_syncs' => 0,
            'successful' => 0,
            'failed' => 0,
            'last_sync' => null,
            'zapier_syncs' => 0,
            'hubspot_syncs' => 0,
            'salesforce_syncs' => 0
        ];
        
        $log_files = glob(LOGS_DIR . '/crm_sync_*.log');
        if (!empty($log_files)) {
            foreach ($log_files as $file) {
                $lines = file($file, FILE_IGNORE_NEW_LINES);
                foreach ($lines as $line) {
                    if (strpos($line, 'successful') !== false) {
                        $stats['total_syncs']++;
                        $stats['successful']++;
                        if (preg_match('/^\[(.*?)\]/', $line, $m)) {
                            $stats['last_sync'] = $m[1];
                        }
                    }
                    if (strpos($line, 'failed') !== false || strpos($line, 'error') !== false) {
                        $stats['total_syncs']++;
                        $stats['failed']++;
                    }
                    if (stripos($line, 'zapier') !== false) $stats['zapier_syncs']++;
                    if (stripos($line, 'hubspot') !== false) $stats['hubspot_syncs']++;
                    if (stripos($line, 'salesforce') !== false) $stats['salesforce_syncs']++;
                }
            }
        }
        
        return [
            'success' => true,
            'statistics' => $stats,
            'enabled_crms' => [
                'zapier' => !empty(ZAPIER_WEBHOOK_URL),
                'hubspot' => !empty(HUBSPOT_API_KEY),
                'salesforce' => !empty(SALESFORCE_CLIENT_ID)
            ]
        ];
    }
    
    /**
     * Process retry queue
     */
    public function processRetryQueue() {
        return [
            'success' => true,
            'processed' => [],
            'remaining' => 0
        ];
    }
    
    /**
     * Log CRM sync event
     */
    private function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($this->sync_log_file, "[{$timestamp}] {$message}\n", FILE_APPEND);
    }
}

// Handle requests only when executed directly (not when included via require_once)
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    $action = $_GET['action'] ?? $_POST['action'] ?? null;
    $crm = new CRMHandler();

    if ($action === 'statistics') {
        echo json_encode($crm->getStatistics());
    } elseif ($action === 'retry_queue') {
        echo json_encode($crm->processRetryQueue());
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
    exit;
}

?>
