<?php
/**
 * Admin Dashboard - View and manage contact submissions
 */

require_once 'config.php';
require_once 'security.php';

header('Content-Type: text/html; charset=utf-8');

// Simple admin authentication (can be enhanced with real auth)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$admin_password = getenv('ADMIN_PASSWORD') ?: 'admin123'; // Change this!

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login_password'])) {
    if (md5($_POST['login_password']) === md5($admin_password)) {
        $_SESSION['admin_authenticated'] = true;
    }
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

if (!isset($_SESSION['admin_authenticated']) || !$_SESSION['admin_authenticated']) {
    // Show login form
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>ZENNARA Admin - Login</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Inter', Arial, sans-serif;
                background: linear-gradient(135deg, #080808 0%, #1C1C1C 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                color: #fff;
            }
            .login-box {
                background: #2a2a2a;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                width: 100%;
                max-width: 400px;
            }
            .login-box h1 {
                color: #C9A030;
                margin-bottom: 30px;
                text-align: center;
            }
            .form-group {
                margin-bottom: 20px;
            }
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-size: 14px;
                font-weight: 600;
            }
            .form-group input {
                width: 100%;
                padding: 12px;
                border: 1px solid #3a3a3a;
                border-radius: 8px;
                background: #333;
                color: #fff;
                font-size: 14px;
            }
            .form-group input:focus {
                outline: none;
                border-color: #C9A030;
                box-shadow: 0 0 0 3px rgba(201, 160, 48, 0.12);
            }
            button {
                width: 100%;
                padding: 12px;
                background: #C9A030;
                color: #000;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 14px;
            }
            button:hover {
                background: #b8942a;
            }
        
        /* Export Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .modal.show {
            display: flex;
        }
        .modal-content {
            background: #fff;
            padding: 30px;
            border-radius: 12px;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 16px;
        }
        .modal-header h3 {
            font-size: 20px;
            color: #080808;
            margin: 0;
        }
        .close-btn {
            background: none;
            border: none;
            font-size: 28px;
            color: #999;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .close-btn:hover {
            color: #000;
        }
        
        /* Export Form Styles */
        .export-form {
            display: grid;
            gap: 20px;
        }
        .form-group {
            display: grid;
            gap: 8px;
        }
        .form-group label {
            font-weight: 600;
            font-size: 13px;
            color: #000;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .format-options {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }
        .radio-label {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 13px;
            font-weight: 500;
        }
        .radio-label:hover {
            border-color: #C9A030;
            background: rgba(201, 160, 48, 0.05);
        }
        .radio-label input[type="radio"] {
            cursor: pointer;
        }
        .filter-select {
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-family: 'Inter', Arial;
            font-size: 13px;
            background: #fff;
            cursor: pointer;
        }
        .filter-select:focus {
            outline: none;
            border-color: #C9A030;
            box-shadow: 0 0 0 3px rgba(201, 160, 48, 0.1);
        }
        .date-inputs {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 12px;
            align-items: center;
        }
        .date-inputs input {
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-family: 'Inter', Arial;
            font-size: 13px;
        }
        .date-inputs input:focus {
            outline: none;
            border-color: #C9A030;
            box-shadow: 0 0 0 3px rgba(201, 160, 48, 0.1);
        }
        .date-separator {
            text-align: center;
            color: #999;
            font-size: 12px;
        }
        
        /* Form Actions */
        .form-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
        }
        .btn-primary {
            background: #C9A030;
            color: #000;
            border: none;
            padding: 12px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 13px;
        }
        .btn-primary:hover {
            background: #b8942a;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(201, 160, 48, 0.2);
        }
        .btn-secondary {
            background: #f0f0f0;
            color: #000;
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 13px;
        }
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        
        /* Export Status */
        .export-status {
            margin-top: 16px;
            padding: 12px;
            border-radius: 6px;
            font-size: 12px;
            display: none;
        }
        .export-status.show {
            display: block;
        }
        .export-status.loading {
            background: rgba(0, 150, 150, 0.1);
            color: #006400;
            border: 1px solid rgba(0, 150, 150, 0.2);
        }
        .export-status.success {
            background: rgba(46, 125, 50, 0.1);
            color: #2e7d32;
            border: 1px solid rgba(46, 125, 50, 0.2);
        }
        .export-status.error {
            background: rgba(198, 40, 40, 0.1);
            color: #c62828;
            border: 1px solid rgba(198, 40, 40, 0.2);
        }
        </style>
    </head>
    <body>
        <div class="login-box">
            <h1>ZENNARA Admin</h1>
            <form method="POST">
                <div class="form-group">
                    <label>Admin Password</label>
                    <input type="password" name="login_password" required autofocus>
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? null;
    
    if ($action === 'export_csv') {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="contact_submissions_' . date('Y-m-d') . '.csv"');
        readfile(CSV_PATH);
        exit;
    } elseif ($action === 'delete_submission') {
        $id_to_delete = $_POST['submission_id'] ?? null;
        if ($id_to_delete) {
            $temp_file = DATA_DIR . '/submissions_temp.csv';
            $input = fopen(CSV_PATH, 'r');
            $output = fopen($temp_file, 'w');
            
            $header = fgetcsv($input);
            fputcsv($output, $header);
            
            while (($row = fgetcsv($input)) !== false) {
                if ($row[1] !== $id_to_delete) { // ID is at index 1
                    fputcsv($output, $row);
                }
            }
            
            fclose($input);
            fclose($output);
            
            rename($temp_file, CSV_PATH);
            $_GET['message'] = 'Submission deleted successfully';
        }
    } elseif ($action === 'logout') {
        session_destroy();
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
}

// Read submissions
$submissions = [];
$total_count = 0;
if (file_exists(CSV_PATH)) {
    $handle = fopen(CSV_PATH, 'r');
    $headers = fgetcsv($handle);
    while (($row = fgetcsv($handle)) !== false) {
        $submissions[] = array_combine($headers, $row);
        $total_count++;
    }
    fclose($handle);
    $submissions = array_reverse($submissions); // Latest first
}

// Pagination
$per_page = 20;
$total_pages = ceil($total_count / $per_page);
$current_page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$offset = ($current_page - 1) * $per_page;
$page_submissions = array_slice($submissions, $offset, $per_page);

// Statistics
$verified_count = 0;
$unverified_count = 0;
$by_interest = [];

foreach ($submissions as $sub) {
    if ($sub['Email_Verified'] === 'Yes' || $sub['Phone_Verified'] === 'Yes') {
        $verified_count++;
    } else {
        $unverified_count++;
    }
    
    $interest = $sub['Interest'] ?? 'general';
    $by_interest[$interest] = ($by_interest[$interest] ?? 0) + 1;
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZENNARA Admin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', Arial, sans-serif;
            background: #f5f5f5;
            color: #333;
        }
        .navbar {
            background: linear-gradient(135deg, #080808 0%, #1C1C1C 100%);
            color: #fff;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .navbar h1 { color: #C9A030; font-size: 24px; }
        .navbar button {
            background: #C9A030;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 30px 20px;
        }
        .message {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #C9A030;
        }
        .stat-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        .controls {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
        }
        .controls form { display: inline; }
        .controls button {
            background: #C9A030;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
        }
        .table-container {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background: #f5f5f5;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e0e0e0;
            font-size: 13px;
            color: #666;
        }
        td {
            padding: 15px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13px;
        }
        tr:hover {
            background: #f9f9f9;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
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
        .delete-btn {
            background: #ff6b6b;
            color: #fff;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
        }
        .delete-btn:hover {
            background: #ff5252;
        }
        .pagination {
            margin-top: 20px;
            text-align: center;
        }
        .pagination a, .pagination span {
            display: inline-block;
            padding: 8px 12px;
            margin: 0 4px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
        }
        .pagination a:hover {
            background: #f5f5f5;
        }
        .pagination .current {
            background: #C9A030;
            color: #fff;
            border-color: #C9A030;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        .modal.show {
            display: flex;
        }
        .modal-content {
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-content h2 {
            margin-bottom: 20px;
            color: #080808;
        }
        .modal-content p {
            margin-bottom: 10px;
            line-height: 1.6;
        }
        .modal-actions {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }
        .modal-actions button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
        }
        .modal-actions .close-btn {
            background: #e0e0e0;
            color: #333;
        }
        .no-data {
            text-align: center;
            padding: 40px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <h1>ZENNARA Admin Dashboard</h1>
        <form method="POST" style="display: inline;">
            <input type="hidden" name="action" value="logout">
            <button type="submit">Logout</button>
        </form>
    </div>

    <div class="container">
        <?php if (isset($_GET['message'])): ?>
            <div class="message"><?php echo htmlspecialchars($_GET['message']); ?></div>
        <?php endif; ?>

        <!-- Statistics -->
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number"><?php echo $total_count; ?></div>
                <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo $verified_count; ?></div>
                <div class="stat-label">Verified Submissions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo $unverified_count; ?></div>
                <div class="stat-label">Unverified Submissions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo count($by_interest); ?></div>
                <div class="stat-label">Interest Categories</div>
            </div>
        </div>

        <!-- Controls -->
        <div class="controls">
            <form method="POST">
                <input type="hidden" name="action" value="export_csv">
                <button type="submit">⬇️ Export CSV</button>
            </form>
            <button onclick="openExportModal()">📥 Advanced Export</button>
            <button onclick="viewAnalytics()">📊 View Analytics</button>
            <button onclick="viewLogs()">📋 View Logs</button>
        </div>

        <!-- Export Modal -->
        <div id="exportModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Export Submissions</h3>
                    <button class="close-btn" onclick="closeExportModal()">&times;</button>
                </div>
                <form id="exportForm" class="export-form" onsubmit="handleExport(event)">
                    <div class="form-group">
                        <label>Export Format:</label>
                        <div class="format-options">
                            <label class="radio-label">
                                <input type="radio" name="format" value="csv" checked> CSV
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="format" value="json"> JSON
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="format" value="html"> HTML (View/Print)
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Verification Status:</label>
                        <select name="status" class="filter-select">
                            <option value="all">All Submissions</option>
                            <option value="verified">Verified Only</option>
                            <option value="unverified">Unverified Only</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Interest Category:</label>
                        <select name="interest" class="filter-select">
                            <option value="all">All Categories</option>
                            <?php foreach ($by_interest as $interest => $count): ?>
                                <option value="<?php echo htmlspecialchars($interest); ?>">
                                    <?php echo htmlspecialchars(ucfirst(str_replace('-', ' ', $interest))); ?> (<?php echo $count; ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Date Range:</label>
                        <div class="date-inputs">
                            <input type="date" name="start_date" placeholder="Start Date">
                            <span class="date-separator">to</span>
                            <input type="date" name="end_date" placeholder="End Date">
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-primary">📥 Export Now</button>
                        <button type="button" class="btn-secondary" onclick="closeExportModal()">Cancel</button>
                    </div>

                    <div id="exportStatus" class="export-status"></div>
                </form>
            </div>
        </div>

        <!-- Submissions Table -->
        <div class="table-container">
            <?php if (empty($submissions)): ?>
                <div class="no-data">No submissions yet. Contact form data will appear here.</div>
            <?php else: ?>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Interest</th>
                            <th>Verified</th>
                            <th>Message Preview</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($page_submissions as $sub): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($sub['Timestamp']); ?></td>
                                <td><?php echo htmlspecialchars($sub['Name']); ?></td>
                                <td><?php echo htmlspecialchars($sub['Email']); ?></td>
                                <td><?php echo htmlspecialchars($sub['Phone'] ?: '-'); ?></td>
                                <td><?php echo htmlspecialchars($sub['Interest']); ?></td>
                                <td>
                                    <?php
                                    $verified = ($sub['Email_Verified'] === 'Yes' || $sub['Phone_Verified'] === 'Yes');
                                    $class = $verified ? 'verified' : 'unverified';
                                    $text = $verified ? 'Verified' : 'Unverified';
                                    echo '<span class="badge ' . $class . '">' . $text . '</span>';
                                    ?>
                                </td>
                                <td><?php echo htmlspecialchars(substr($sub['Message'], 0, 40) . '...'); ?></td>
                                <td>
                                    <button class="delete-btn" onclick="deleteSubmission('<?php echo htmlspecialchars($sub['ID']); ?>')">Delete</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <!-- Pagination -->
                <?php if ($total_pages > 1): ?>
                    <div class="pagination">
                        <?php if ($current_page > 1): ?>
                            <a href="?page=1">« First</a>
                            <a href="?page=<?php echo $current_page - 1; ?>">‹ Previous</a>
                        <?php endif; ?>

                        <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                            <?php if ($i === $current_page): ?>
                                <span class="current"><?php echo $i; ?></span>
                            <?php else: ?>
                                <a href="?page=<?php echo $i; ?>"><?php echo $i; ?></a>
                            <?php endif; ?>
                        <?php endfor; ?>

                        <?php if ($current_page < $total_pages): ?>
                            <a href="?page=<?php echo $current_page + 1; ?>">Next ›</a>
                            <a href="?page=<?php echo $total_pages; ?>">Last »</a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>

    <!-- Modals -->
    <div class="modal" id="deleteModal">
        <div class="modal-content">
            <h2>Delete Submission?</h2>
            <p>Are you sure you want to delete this submission? This action cannot be undone.</p>
            <div class="modal-actions">
                <form method="POST" style="display: inline;">
                    <input type="hidden" name="action" value="delete_submission">
                    <input type="hidden" name="submission_id" id="deleteSubmissionId">
                    <button type="submit" style="background: #ff6b6b; color: #fff;">Delete</button>
                </form>
                <button class="close-btn" onclick="closeModal()">Cancel</button>
            </div>
        </div>
    </div>

    <script>
        function deleteSubmission(id) {
            document.getElementById('deleteSubmissionId').value = id;
            document.getElementById('deleteModal').classList.add('show');
        }

        function closeModal() {
            document.getElementById('deleteModal').classList.remove('show');
        }

        function viewAnalytics() {
            window.open('analytics.php', 'analytics', 'width=1000,height=700');
        }

        function viewLogs() {
            window.open('logs.php', 'logs', 'width=1200,height=700');
        }

        // Export Modal Functions
        function openExportModal() {
            document.getElementById('exportModal').classList.add('show');
        }

        function closeExportModal() {
            document.getElementById('exportModal').classList.remove('show');
            document.getElementById('exportStatus').classList.remove('show', 'loading', 'success', 'error');
        }

        async function handleExport(event) {
            event.preventDefault();

            const format = document.querySelector('input[name="format"]:checked').value;
            const status = document.querySelector('select[name="status"]').value;
            const interest = document.querySelector('select[name="interest"]').value;
            const startDate = document.querySelector('input[name="start_date"]').value;
            const endDate = document.querySelector('input[name="end_date"]').value;

            const statusEl = document.getElementById('exportStatus');
            statusEl.className = 'export-status show loading';
            statusEl.textContent = '⏳ Preparing export...';

            try {
                const payload = {
                    format: format,
                    filters: {
                        status: status !== 'all' ? status : null,
                        interest: interest !== 'all' ? interest : null,
                        start_date: startDate || null,
                        end_date: endDate || null
                    }
                };

                const response = await fetch('export.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Export failed: ' + response.statusText);
                }

                // Handle different file types
                if (format === 'csv' || format === 'json') {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'submissions_' + new Date().toISOString().split('T')[0] + '.' + format;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    statusEl.className = 'export-status show success';
                    statusEl.textContent = '✓ Export downloaded successfully!';
                    
                    setTimeout(() => {
                        closeExportModal();
                    }, 2000);
                } else if (format === 'html') {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    
                    statusEl.className = 'export-status show success';
                    statusEl.textContent = '✓ HTML preview opened in new window!';
                    
                    setTimeout(() => {
                        closeExportModal();
                    }, 2000);
                }
            } catch (error) {
                console.error('Export error:', error);
                statusEl.className = 'export-status show error';
                statusEl.textContent = '✗ Export failed: ' + error.message;
            }
        }

        window.onclick = function(event) {
            const deleteModal = document.getElementById('deleteModal');
            const exportModal = document.getElementById('exportModal');
            
            if (event.target === deleteModal) {
                closeModal();
            }
            if (event.target === exportModal) {
                closeExportModal();
            }
        }
    </script>
</body>
</html>
