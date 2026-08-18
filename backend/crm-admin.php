<?php
/**
 * ZENNARA CRM Admin Dashboard
 * Monitor and manage CRM integrations from admin panel
 * 
 * Features:
 * - Real-time CRM statistics
 * - Sync history viewer
 * - Retry queue management
 * - Platform status checks
 * - Manual sync triggering
 */

require_once 'config.php';
require_once 'crm.php';

header('Content-Type: text/html; charset=utf-8');

// Simple authentication check
session_start();
$admin_password = getenv('ADMIN_PASSWORD') ?: 'admin123';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    if ($_POST['password'] === $admin_password) {
        $_SESSION['crm_admin_authenticated'] = true;
    } else {
        $login_error = 'Invalid password';
    }
}

$is_authenticated = isset($_SESSION['crm_admin_authenticated']) && $_SESSION['crm_admin_authenticated'];

if (!$is_authenticated && $_GET['logout'] ?? false) {
    unset($_SESSION['crm_admin_authenticated']);
    header('Location: crm-admin.php');
    exit;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZENNARA CRM Admin Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            width: 100%;
            max-width: 1200px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 24px;
            font-weight: 600;
        }

        .header-actions {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background: white;
            color: #667eea;
        }

        .btn-primary:hover {
            background: #f0f0f0;
        }

        .btn-danger {
            background: #ff6b6b;
            color: white;
        }

        .btn-danger:hover {
            background: #ff5252;
        }

        .login-form {
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        .login-form h2 {
            color: #333;
            margin-bottom: 20px;
        }

        .login-form input {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
            width: 100%;
            max-width: 300px;
        }

        .login-form .btn {
            width: 100%;
            max-width: 300px;
            background: #667eea;
            color: white;
            padding: 12px;
        }

        .login-form .btn:hover {
            background: #5568d3;
        }

        .login-error {
            color: #ff6b6b;
            text-align: center;
            padding: 10px;
            background: #fff5f5;
            border-radius: 6px;
            width: 100%;
            max-width: 300px;
        }

        .content {
            padding: 30px;
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .stat-card h3 {
            font-size: 12px;
            text-transform: uppercase;
            opacity: 0.8;
            margin-bottom: 10px;
        }

        .stat-card .value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .stat-card .label {
            font-size: 13px;
            opacity: 0.8;
        }

        .stat-card.success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        .stat-card.warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-card.info {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .section {
            margin-bottom: 30px;
        }

        .section h2 {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
        }

        .crm-status {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
        }

        .crm-platform {
            padding: 15px;
            background: white;
            border-left: 4px solid #ddd;
            border-radius: 4px;
        }

        .crm-platform.enabled {
            border-left-color: #11998e;
        }

        .crm-platform.disabled {
            border-left-color: #ccc;
            opacity: 0.6;
        }

        .crm-platform h3 {
            color: #333;
            margin-bottom: 5px;
            font-size: 14px;
        }

        .crm-platform .status {
            font-size: 12px;
            color: #666;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-badge.active {
            background: #d4edda;
            color: #155724;
        }

        .status-badge.inactive {
            background: #f8d7da;
            color: #721c24;
        }

        .actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .btn-sm {
            padding: 8px 12px;
            font-size: 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-sm-primary {
            background: #667eea;
            color: white;
        }

        .btn-sm-primary:hover {
            background: #5568d3;
        }

        .btn-sm-secondary {
            background: #e9ecef;
            color: #333;
        }

        .btn-sm-secondary:hover {
            background: #dee2e6;
        }

        .sync-history {
            background: #f9f9f9;
            border-radius: 8px;
            overflow: hidden;
        }

        .sync-item {
            padding: 15px;
            border-bottom: 1px solid #e9e9e9;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .sync-item:last-child {
            border-bottom: none;
        }

        .sync-info {
            flex: 1;
        }

        .sync-id {
            font-size: 13px;
            color: #666;
            font-family: monospace;
            margin-bottom: 5px;
        }

        .sync-time {
            font-size: 12px;
            color: #999;
        }

        .sync-results {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .sync-result {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
            padding: 4px 8px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid;
        }

        .sync-result.success {
            border-left-color: #11998e;
            color: #155724;
        }

        .sync-result.failed {
            border-left-color: #f5576c;
            color: #721c24;
        }

        .icon {
            font-size: 14px;
        }

        .retry-queue {
            background: #fff5f5;
            border: 1px solid #ffcccc;
            padding: 15px;
            border-radius: 8px;
        }

        .retry-queue.empty {
            background: #f0fff4;
            border-color: #b7e4c7;
        }

        .retry-item {
            padding: 10px;
            background: white;
            border-radius: 4px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }

        .retry-item:last-child {
            margin-bottom: 0;
        }

        .retry-badge {
            background: #f5576c;
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 600;
        }

        .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }

        @media (max-width: 768px) {
            .header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }

            .section h2 {
                flex-direction: column;
                align-items: flex-start;
            }

            .dashboard-grid {
                grid-template-columns: 1fr;
            }

            .crm-status {
                grid-template-columns: 1fr;
            }

            .sync-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }

            .sync-results {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <?php if (!$is_authenticated): ?>
            <div class="header">
                <h1>🔐 CRM Admin Authentication</h1>
            </div>
            <div class="login-form">
                <h2>Enter Admin Password</h2>
                <?php if (isset($login_error)): ?>
                    <div class="login-error"><?php echo htmlspecialchars($login_error); ?></div>
                <?php endif; ?>
                <form method="POST" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 15px;">
                    <input type="hidden" name="action" value="login">
                    <input type="password" name="password" placeholder="Enter admin password" autofocus>
                    <button type="submit" class="btn btn-primary" style="background: #667eea; color: white; width: 100%; max-width: 300px;">Login</button>
                </form>
            </div>
        <?php else: ?>
            <div class="header">
                <div>
                    <h1>🔗 CRM Integration Dashboard</h1>
                    <p style="font-size: 13px; opacity: 0.8; margin-top: 5px;">Real-time CRM sync monitoring and management</p>
                </div>
                <div class="header-actions">
                    <button onclick="location.reload()" class="btn btn-primary">🔄 Refresh</button>
                    <a href="crm-admin.php?logout=1" class="btn btn-danger">🚪 Logout</a>
                </div>
            </div>

            <div class="content">
                <div id="stats-container" class="dashboard-grid">
                    <div class="loading"><span class="spinner"></span> Loading statistics...</div>
                </div>

                <div class="section">
                    <div class="section-header">
                        <h2>CRM Platform Status</h2>
                    </div>
                    <div id="crm-status" class="crm-status">
                        <div class="loading"><span class="spinner"></span> Loading platform status...</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">
                        <h2>Retry Queue</h2>
                        <button class="btn btn-sm btn-sm-primary" onclick="processRetryQueue()">Process Queue</button>
                    </div>
                    <div id="retry-queue" class="retry-queue empty">
                        <div class="loading"><span class="spinner"></span> Loading retry queue...</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">
                        <h2>Recent Syncs</h2>
                    </div>
                    <div id="sync-history" class="sync-history">
                        <div class="loading"><span class="spinner"></span> Loading sync history...</div>
                    </div>
                </div>
            </div>

            <script>
                async function loadStatistics() {
                    try {
                        const response = await fetch('crm.php?action=statistics');
                        const data = await response.json();

                        if (data.success) {
                            const stats = data.statistics;
                            const html = `
                                <div class="stat-card success">
                                    <h3>Total Syncs</h3>
                                    <div class="value">${stats.total_syncs}</div>
                                    <div class="label">All time</div>
                                </div>
                                <div class="stat-card success">
                                    <h3>Successful</h3>
                                    <div class="value">${stats.successful}</div>
                                    <div class="label">${(stats.successful / Math.max(stats.successful + stats.failed, 1) * 100).toFixed(1)}% success rate</div>
                                </div>
                                <div class="stat-card warning">
                                    <h3>Failed</h3>
                                    <div class="value">${stats.failed}</div>
                                    <div class="label">Pending retry</div>
                                </div>
                                <div class="stat-card info">
                                    <h3>Last Sync</h3>
                                    <div class="value" style="font-size: 14px;">
                                        ${stats.last_sync ? new Date(stats.last_sync).toLocaleString() : 'Never'}
                                    </div>
                                    <div class="label">Last activity</div>
                                </div>
                            `;
                            document.getElementById('stats-container').innerHTML = html;

                            loadCRMStatus(data.enabled_crms, stats);
                        }
                    } catch (error) {
                        console.error('Error loading statistics:', error);
                        document.getElementById('stats-container').innerHTML = '<div style="color: red; padding: 20px;">Error loading statistics</div>';
                    }
                }

                function loadCRMStatus(enabled, stats) {
                    const crms = [
                        { name: 'Zapier', key: 'zapier_syncs', icon: '🚀' },
                        { name: 'HubSpot', key: 'hubspot_syncs', icon: '🎯' },
                        { name: 'Salesforce', key: 'salesforce_syncs', icon: '☁️' }
                    ];

                    let html = '';
                    crms.forEach(crm => {
                        const isEnabled = enabled[crm.key.replace('_syncs', '')];
                        const syncCount = stats[crm.key];
                        html += `
                            <div class="crm-platform ${isEnabled ? 'enabled' : 'disabled'}">
                                <h3>${crm.icon} ${crm.name}</h3>
                                <div class="status">
                                    <span class="status-badge ${isEnabled ? 'active' : 'inactive'}">
                                        ${isEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <div style="margin-top: 8px; font-size: 12px; color: #666;">
                                        ${syncCount} syncs
                                    </div>
                                </div>
                            </div>
                        `;
                    });

                    document.getElementById('crm-status').innerHTML = html;
                }

                async function loadRetryQueue() {
                    try {
                        const queueData = JSON.parse(localStorage.getItem('crm_retry_queue') || '[]');
                        let html = '';

                        if (queueData.length === 0) {
                            html = '<div style="text-align: center; padding: 20px; color: #11998e;"><strong>✓ Retry queue is empty</strong></div>';
                            document.getElementById('retry-queue').className = 'retry-queue empty';
                        } else {
                            document.getElementById('retry-queue').className = 'retry-queue';
                            queueData.slice(-10).reverse().forEach(item => {
                                html += `
                                    <div class="retry-item">
                                        <div>
                                            <div style="font-weight: 600; margin-bottom: 3px;">Submission: ${item.submission_id}</div>
                                            <div style="color: #999; font-size: 11px;">${item.timestamp}</div>
                                        </div>
                                        <span class="retry-badge">Attempt ${item.attempts}/${item.max_attempts}</span>
                                    </div>
                                `;
                            });
                        }

                        document.getElementById('retry-queue').innerHTML = html;
                    } catch (error) {
                        console.error('Error loading retry queue:', error);
                    }
                }

                async function loadSyncHistory() {
                    try {
                        const syncsData = JSON.parse(localStorage.getItem('crm_syncs') || '[]');
                        let html = '';

                        if (syncsData.length === 0) {
                            html = '<div style="text-align: center; padding: 20px; color: #666;">No sync history yet</div>';
                        } else {
                            syncsData.slice(-20).reverse().forEach(sync => {
                                const results = [];
                                Object.entries(sync.syncs || {}).forEach(([platform, status]) => {
                                    results.push(`
                                        <div class="sync-result ${status.success ? 'success' : 'failed'}">
                                            <span class="icon">${status.success ? '✓' : '✗'}</span>
                                            <span>${platform}</span>
                                        </div>
                                    `);
                                });

                                html += `
                                    <div class="sync-item">
                                        <div class="sync-info">
                                            <div class="sync-id">ID: ${sync.submission_id}</div>
                                            <div class="sync-time">${sync.timestamp}</div>
                                        </div>
                                        <div class="sync-results">${results.join('')}</div>
                                    </div>
                                `;
                            });
                        }

                        document.getElementById('sync-history').innerHTML = html;
                    } catch (error) {
                        console.error('Error loading sync history:', error);
                    }
                }

                async function processRetryQueue() {
                    try {
                        const btn = event.target;
                        btn.disabled = true;
                        btn.innerHTML = '<span class="spinner" style="margin-right: 5px;"></span>Processing...';

                        const response = await fetch('crm.php?action=retry_queue');
                        const data = await response.json();

                        setTimeout(() => {
                            btn.disabled = false;
                            btn.innerHTML = 'Process Queue';
                            loadStatistics();
                            loadRetryQueue();
                            alert(`✓ Processed ${data.processed.length} items. ${data.remaining} items remaining.`);
                        }, 1000);
                    } catch (error) {
                        alert('Error processing retry queue: ' + error.message);
                    }
                }

                // Load data on page load
                document.addEventListener('DOMContentLoaded', () => {
                    loadStatistics();
                    loadRetryQueue();
                    loadSyncHistory();

                    // Refresh every 30 seconds
                    setInterval(() => {
                        loadStatistics();
                        loadRetryQueue();
                        loadSyncHistory();
                    }, 30000);
                });
            </script>
        <?php endif; ?>
    </div>
</body>
</html>
