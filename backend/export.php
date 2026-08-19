<?php
/**
 * Export Handler - Export contact submissions in multiple formats
 * Supports CSV, JSON, and HTML export with advanced filtering
 */

require_once 'config.php';
require_once 'security.php';

header('Content-Type: application/json');

class ExportHandler {
    private $security;
    
    public function __construct() {
        $this->security = new Security();
    }
    
    /**
     * Load submissions from CSV
     */
    private function loadSubmissions() {
        if (!file_exists(CSV_PATH)) {
            return [];
        }
        
        $submissions = [];
        $handle = fopen(CSV_PATH, 'r');
        $headers = fgetcsv($handle);
        
        while (($row = fgetcsv($handle)) !== false) {
            $submissions[] = array_combine($headers, $row);
        }
        
        fclose($handle);
        return $submissions;
    }
    
    /**
     * Filter submissions by date range
     */
    private function filterByDateRange($submissions, $start_date, $end_date) {
        if (!$start_date && !$end_date) {
            return $submissions;
        }
        
        return array_filter($submissions, function($sub) use ($start_date, $end_date) {
            $sub_date = strtotime($sub['Timestamp']);
            
            if ($start_date && $sub_date < strtotime($start_date . ' 00:00:00')) {
                return false;
            }
            
            if ($end_date && $sub_date > strtotime($end_date . ' 23:59:59')) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Filter submissions by verification status
     */
    private function filterByStatus($submissions, $status) {
        if ($status === 'all' || !$status) {
            return $submissions;
        }
        
        return array_filter($submissions, function($sub) use ($status) {
            if ($status === 'verified') {
                return $sub['Email_Verified'] === 'Yes' || $sub['Phone_Verified'] === 'Yes';
            } else if ($status === 'unverified') {
                return $sub['Email_Verified'] === 'No' && $sub['Phone_Verified'] === 'No';
            }
            return true;
        });
    }
    
    /**
     * Filter submissions by interest
     */
    private function filterByInterest($submissions, $interest) {
        if ($interest === 'all' || !$interest) {
            return $submissions;
        }
        
        return array_filter($submissions, function($sub) use ($interest) {
            return $sub['Interest'] === $interest;
        });
    }
    
    /**
     * Apply all filters
     */
    private function applyFilters($submissions, $filters) {
        $submissions = $this->filterByDateRange(
            $submissions,
            $filters['start_date'] ?? null,
            $filters['end_date'] ?? null
        );
        
        $submissions = $this->filterByStatus(
            $submissions,
            $filters['status'] ?? 'all'
        );
        
        $submissions = $this->filterByInterest(
            $submissions,
            $filters['interest'] ?? 'all'
        );
        
        return $submissions;
    }
    
    /**
     * Export to CSV
     */
    private function exportCSV($submissions) {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="submissions_' . date('Y-m-d_H-i-s') . '.csv"');
        
        $output = fopen('php://output', 'w');
        
        if (!empty($submissions)) {
            // Write headers
            fputcsv($output, array_keys($submissions[0]));
            
            // Write data
            foreach ($submissions as $sub) {
                fputcsv($output, $sub);
            }
        }
        
        fclose($output);
        exit;
    }
    
    /**
     * Export to JSON
     */
    private function exportJSON($submissions) {
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="submissions_' . date('Y-m-d_H-i-s') . '.json"');
        
        $data = [
            'export_date' => date('Y-m-d H:i:s'),
            'total_count' => count($submissions),
            'submissions' => $submissions
        ];
        
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    /**
     * Export to HTML (for viewing/printing)
     */
    private function exportHTML($submissions) {
        header('Content-Type: text/html');
        
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ZENNARA Contact Submissions Report</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: "Segoe UI", Arial, sans-serif;
                    background: #f5f5f5;
                    color: #333;
                    padding: 20px;
                }
                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header {
                    border-bottom: 3px solid #C9A030;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #080808;
                    font-size: 28px;
                    margin-bottom: 5px;
                }
                .header p {
                    color: #666;
                    font-size: 14px;
                }
                .summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .summary-box {
                    background: #f9f9f9;
                    padding: 15px;
                    border-radius: 6px;
                    border-left: 4px solid #C9A030;
                }
                .summary-box .number {
                    font-size: 24px;
                    font-weight: bold;
                    color: #C9A030;
                }
                .summary-box .label {
                    font-size: 12px;
                    color: #999;
                    margin-top: 5px;
                }
                .table-wrapper {
                    overflow-x: auto;
                    margin-bottom: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th {
                    background: #f5f5f5;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid #e0e0e0;
                    font-size: 12px;
                    color: #666;
                }
                td {
                    padding: 12px;
                    border-bottom: 1px solid #e0e0e0;
                    font-size: 12px;
                }
                tr:hover {
                    background: #fafafa;
                }
                .badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                }
                .badge.verified {
                    background: #e8f5e9;
                    color: #2e7d32;
                }
                .badge.unverified {
                    background: #ffebee;
                    color: #c62828;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    color: #999;
                    font-size: 11px;
                }
                @media print {
                    body { background: #fff; }
                    .container { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ZENNARA Contact Submissions Report</h1>
                    <p>Generated on ' . date('F d, Y \a\t g:i A') . '</p>
                </div>
                
                <div class="summary">
                    <div class="summary-box">
                        <div class="number">' . count($submissions) . '</div>
                        <div class="label">Total Submissions</div>
                    </div>
                    <div class="summary-box">
                        <div class="number">' . count(array_filter($submissions, fn($s) => $s['Email_Verified'] === 'Yes' || $s['Phone_Verified'] === 'Yes')) . '</div>
                        <div class="label">Verified</div>
                    </div>
                    <div class="summary-box">
                        <div class="number">' . count(array_filter($submissions, fn($s) => $s['Email_Verified'] === 'No' && $s['Phone_Verified'] === 'No')) . '</div>
                        <div class="label">Unverified</div>
                    </div>
                </div>
                
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Interest</th>
                                <th>Message</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>';
        
        foreach ($submissions as $sub) {
            $verified = ($sub['Email_Verified'] === 'Yes' || $sub['Phone_Verified'] === 'Yes');
            $status_class = $verified ? 'verified' : 'unverified';
            $status_text = $verified ? 'Verified' : 'Unverified';
            
            $html .= '
                            <tr>
                                <td>' . htmlspecialchars($sub['Timestamp']) . '</td>
                                <td>' . htmlspecialchars($sub['Name']) . '</td>
                                <td>' . htmlspecialchars($sub['Email']) . '</td>
                                <td>' . htmlspecialchars($sub['Phone'] ?: '-') . '</td>
                                <td>' . htmlspecialchars($sub['Interest']) . '</td>
                                <td>' . htmlspecialchars(substr($sub['Message'], 0, 50)) . '...</td>
                                <td><span class="badge ' . $status_class . '">' . $status_text . '</span></td>
                            </tr>';
        }
        
        $html .= '
                        </tbody>
                    </table>
                </div>
                
                <div class="footer">
                    <p>&copy; 2026 ZENNARA. All rights reserved. | This is a system-generated report.</p>
                </div>
            </div>
        </body>
        </html>';
        
        echo $html;
        exit;
    }
    
    /**
     * Handle export request
     */
    public function handle() {
        try {
            // Get request data
            $input = json_decode(file_get_contents('php://input'), true);
            $format = $input['format'] ?? 'csv';
            $filters = $input['filters'] ?? [];
            
            // Load and filter submissions
            $submissions = $this->loadSubmissions();
            $submissions = $this->applyFilters($submissions, $filters);
            
            // Reindex array after filtering
            $submissions = array_values($submissions);
            
            // Export in requested format
            if ($format === 'csv') {
                $this->exportCSV($submissions);
            } elseif ($format === 'json') {
                $this->exportJSON($submissions);
            } elseif ($format === 'html') {
                $this->exportHTML($submissions);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid format']);
            }
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}

// Handle requests only when executed directly (not when included via require_once)
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $handler = new ExportHandler();
        $handler->handle();
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
    exit;
}

?>
