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
     * Log CRM sync event
     */
    private function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($this->sync_log_file, "[{$timestamp}] {$message}\n", FILE_APPEND);
    }
}

?>
