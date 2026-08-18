<?php
/**
 * Logs Viewer - Display recent activity logs
 */

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZENNARA Logs Viewer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            background: #1a1a1a;
            color: #e0e0e0;
            padding: 20px;
            font-size: 12px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #C9A030 0%, #b8942a 100%);
            color: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; opacity: 0.9; }
        .logs-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .log-section {
            background: #2a2a2a;
            border: 1px solid #3a3a3a;
            border-radius: 8px;
            overflow: hidden;
            max-height: 600px;
            display: flex;
            flex-direction: column;
        }
        .log-header {
            background: #333;
            padding: 15px;
            border-bottom: 1px solid #3a3a3a;
            font-weight: bold;
            color: #C9A030;
        }
        .log-content {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
        }
        .log-line {
            margin: 5px 0;
            padding: 5px;
            border-left: 3px solid #3a3a3a;
            padding-left: 10px;
        }
        .log-line.error {
            color: #ff6b6b;
            border-left-color: #ff6b6b;
        }
        .log-line.success {
            color: #51cf66;
            border-left-color: #51cf66;
        }
        .log-line.warning {
            color: #ffd43b;
            border-left-color: #ffd43b;
        }
        .log-line.info {
            color: #74c0fc;
            border-left-color: #74c0fc;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-box {
            background: #2a2a2a;
            border: 1px solid #3a3a3a;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 28px;
            font-weight: bold;
            color: #C9A030;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #999;
            font-size: 12px;
        }
        button {
            background: #C9A030;
            color: #000;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            margin: 5px;
        }
        button:hover {
            background: #b8942a;
        }
        .actions {
            margin-bottom: 20px;
        }
        .no-logs {
            color: #666;
            text-align: center;
            padding: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ZENNARA Activity Logs</h1>
            <p>Real-time monitoring of contact form submissions, OTP operations, and storage activities</p>
        </div>

        <div class="actions">
            <button onclick="location.reload()">🔄 Refresh</button>
            <button onclick="clearAllLogs()">🗑️ Clear Logs</button>
            <button onclick="downloadLogs()">⬇️ Download Logs</button>
            <button onclick="window.close()">✕ Close</button>
        </div>

        <div class="stats">
            <?php
            // Count statistics
            $contact_logs = glob(LOGS_DIR . '/contact_*.log');
            $otp_logs = glob(LOGS_DIR . '/otp_*.log');
            $storage_logs = glob(LOGS_DIR . '/storage_*.log');
            
            $contact_count = 0;
            $otp_count = 0;
            $storage_count = 0;
            
            foreach ($contact_logs as $log) {
                $contact_count += count(file($log));
            }
            foreach ($otp_logs as $log) {
                $otp_count += count(file($log));
            }
            foreach ($storage_logs as $log) {
                $storage_count += count(file($log));
            }
            
            // CSV submissions count
            $csv_count = 0;
            if (file_exists(CSV_PATH)) {
                $csv_count = count(file(CSV_PATH)) - 1; // Exclude header
            }
            ?>
            <div class="stat-box">
                <div class="stat-number"><?php echo $csv_count; ?></div>
                <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat-box">
                <div class="stat-number"><?php echo $contact_count; ?></div>
                <div class="stat-label">Contact Logs</div>
            </div>
            <div class="stat-box">
                <div class="stat-number"><?php echo $otp_count; ?></div>
                <div class="stat-label">OTP Operations</div>
            </div>
            <div class="stat-box">
                <div class="stat-number"><?php echo $storage_count; ?></div>
                <div class="stat-label">Storage Events</div>
            </div>
        </div>

        <div class="logs-container">
            <!-- Contact Logs -->
            <div class="log-section">
                <div class="log-header">📧 Contact Submissions Log</div>
                <div class="log-content">
                    <?php
                    $contact_logs = glob(LOGS_DIR . '/contact_*.log');
                    if ($contact_logs) {
                        rsort($contact_logs);
                        $latest = array_shift($contact_logs);
                        $lines = file($latest, FILE_IGNORE_NEW_LINES);
                        $lines = array_slice(array_reverse($lines), 0, 20);
                        
                        if (empty($lines)) {
                            echo '<div class="no-logs">No contact logs yet</div>';
                        } else {
                            foreach ($lines as $line) {
                                $class = 'info';
                                if (strpos($line, 'Error') !== false || strpos($line, 'error') !== false) {
                                    $class = 'error';
                                } elseif (strpos($line, 'successful') !== false) {
                                    $class = 'success';
                                }
                                echo '<div class="log-line ' . $class . '">' . htmlspecialchars($line) . '</div>';
                            }
                        }
                    } else {
                        echo '<div class="no-logs">No contact logs found</div>';
                    }
                    ?>
                </div>
            </div>

            <!-- OTP Logs -->
            <div class="log-section">
                <div class="log-header">🔐 OTP Operations Log</div>
                <div class="log-content">
                    <?php
                    $otp_logs = glob(LOGS_DIR . '/otp_*.log');
                    if ($otp_logs) {
                        rsort($otp_logs);
                        $latest = array_shift($otp_logs);
                        $lines = file($latest, FILE_IGNORE_NEW_LINES);
                        $lines = array_slice(array_reverse($lines), 0, 20);
                        
                        if (empty($lines)) {
                            echo '<div class="no-logs">No OTP logs yet</div>';
                        } else {
                            foreach ($lines as $line) {
                                $class = 'info';
                                if (strpos($line, 'Error') !== false) {
                                    $class = 'error';
                                } elseif (strpos($line, 'verified') !== false || strpos($line, 'sent') !== false) {
                                    $class = 'success';
                                }
                                echo '<div class="log-line ' . $class . '">' . htmlspecialchars($line) . '</div>';
                            }
                        }
                    } else {
                        echo '<div class="no-logs">No OTP logs found</div>';
                    }
                    ?>
                </div>
            </div>

            <!-- Storage Logs -->
            <div class="log-section">
                <div class="log-header">💾 Storage Operations Log</div>
                <div class="log-content">
                    <?php
                    $storage_logs = glob(LOGS_DIR . '/storage_*.log');
                    if ($storage_logs) {
                        rsort($storage_logs);
                        $latest = array_shift($storage_logs);
                        $lines = file($latest, FILE_IGNORE_NEW_LINES);
                        $lines = array_slice(array_reverse($lines), 0, 20);
                        
                        if (empty($lines)) {
                            echo '<div class="no-logs">No storage logs yet</div>';
                        } else {
                            foreach ($lines as $line) {
                                $class = 'info';
                                if (strpos($line, 'Error') !== false) {
                                    $class = 'error';
                                } elseif (strpos($line, 'saved') !== false || strpos($line, 'Backup') !== false) {
                                    $class = 'success';
                                }
                                echo '<div class="log-line ' . $class . '">' . htmlspecialchars($line) . '</div>';
                            }
                        }
                    } else {
                        echo '<div class="no-logs">No storage logs found</div>';
                    }
                    ?>
                </div>
            </div>

            <!-- System Status -->
            <div class="log-section">
                <div class="log-header">⚙️ System Status</div>
                <div class="log-content">
                    <?php
                    // System checks
                    $checks = [
                        'PHP Version' => phpversion(),
                        'cURL Extension' => extension_loaded('curl') ? '✓ Loaded' : '✗ Missing',
                        'OpenSSL Extension' => extension_loaded('openssl') ? '✓ Loaded' : '✗ Missing',
                        'Data Directory' => (is_dir(DATA_DIR) && is_writable(DATA_DIR)) ? '✓ Writable' : '✗ Issue',
                        'Logs Directory' => (is_dir(LOGS_DIR) && is_writable(LOGS_DIR)) ? '✓ Writable' : '✗ Issue',
                        'CSV File' => file_exists(CSV_PATH) ? '✓ Exists (' . round(filesize(CSV_PATH)/1024, 2) . 'KB)' : '○ Will create',
                        'OTP Sessions' => file_exists(DATA_DIR . '/.otp_sessions.json') ? '✓ Active' : '○ Not started',
                        'Last Activity' => $contact_logs ? date('Y-m-d H:i:s', filemtime($contact_logs[0])) : 'None'
                    ];
                    
                    foreach ($checks as $label => $value) {
                        $class = 'info';
                        if (strpos($value, '✓') !== false) {
                            $class = 'success';
                        } elseif (strpos($value, '✗') !== false) {
                            $class = 'error';
                        }
                        echo '<div class="log-line ' . $class . '"><strong>' . $label . ':</strong> ' . htmlspecialchars($value) . '</div>';
                    }
                    ?>
                </div>
            </div>
        </div>
    </div>

    <script>
        function clearAllLogs() {
            if (confirm('Clear all logs? This cannot be undone.')) {
                fetch('<?php echo $_SERVER["PHP_SELF"]; ?>', {
                    method: 'POST',
                    body: 'action=clear'
                }).then(() => location.reload());
            }
        }

        function downloadLogs() {
            const logs = document.querySelector('.log-content').innerText;
            const blob = new Blob([logs], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'zennara_logs_' + new Date().toISOString().slice(0,10) + '.txt';
            a.click();
        }
    </script>
</body>
</html>

<?php
// Handle clear logs
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'clear') {
    foreach (glob(LOGS_DIR . '/*.log') as $log) {
        unlink($log);
    }
    exit(json_encode(['success' => true]));
}
?>
