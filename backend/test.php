<?php
/**
 * Backend Testing Script
 * Run this to test the backend functionality
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZENNARA Backend Test</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #080808 0%, #1C1C1C 100%);
            color: #fff;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            margin-bottom: 0;
        }
        .header h1 { color: #C9A030; }
        .test-section {
            background: #fff;
            padding: 20px;
            margin: 10px 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .test-section h2 {
            color: #080808;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .status {
            padding: 10px 15px;
            border-radius: 4px;
            margin: 10px 0;
            font-weight: bold;
        }
        .status.pass {
            background: #e8f5e9;
            color: #2e7d32;
            border-left: 4px solid #4caf50;
        }
        .status.fail {
            background: #ffebee;
            color: #c62828;
            border-left: 4px solid #f44336;
        }
        .status.warn {
            background: #fff3e0;
            color: #e65100;
            border-left: 4px solid #ff9800;
        }
        input, textarea, select {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 5px 0;
            width: 100%;
            font-family: Arial, sans-serif;
            font-size: 14px;
        }
        button {
            background: #C9A030;
            color: #fff;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            margin: 10px 5px 10px 0;
        }
        button:hover {
            background: #b8942a;
        }
        .form-group {
            margin: 15px 0;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        .response {
            background: #f9f9f9;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
        }
        .loading {
            display: none;
            color: #C9A030;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ZENNARA Backend Test Suite</h1>
            <p>Test and verify all backend functionality</p>
        </div>

        <!-- System Check -->
        <div class="test-section">
            <h2>1. System Requirements Check</h2>
            <?php
            // Check PHP version
            $php_version = phpversion();
            echo '<div class="status ' . (version_compare($php_version, '7.4.0', '>=') ? 'pass' : 'fail') . '">';
            echo 'PHP Version: ' . $php_version . ' ' . (version_compare($php_version, '7.4.0', '>=') ? '✓ OK' : '✗ REQUIRES 7.4+');
            echo '</div>';

            // Check extensions
            $extensions = ['curl', 'openssl', 'json', 'spl_fileobject'];
            foreach ($extensions as $ext) {
                echo '<div class="status ' . (extension_loaded($ext) ? 'pass' : 'fail') . '">';
                echo $ext . ' extension: ' . (extension_loaded($ext) ? '✓ Loaded' : '✗ Not loaded');
                echo '</div>';
            }

            // Check directories
            $backend_dir = dirname(__FILE__);
            $data_dir = $backend_dir . '/../data';
            $logs_dir = $backend_dir . '/../logs';
            
            echo '<div class="status ' . (is_writable($backend_dir) ? 'pass' : 'fail') . '">';
            echo 'Backend directory writable: ' . (is_writable($backend_dir) ? '✓ Yes' : '✗ No');
            echo '</div>';

            echo '<div class="status ' . (is_dir($data_dir) || is_writable(dirname($data_dir)) ? 'pass' : 'fail') . '">';
            echo 'Data directory: ' . (is_dir($data_dir) ? '✓ Exists' : '○ Will be created');
            echo '</div>';

            // Check PHPMailer
            $phpmailer_installed = file_exists($backend_dir . '/../vendor/autoload.php');
            echo '<div class="status ' . ($phpmailer_installed ? 'pass' : 'warn') . '">';
            echo 'PHPMailer: ' . ($phpmailer_installed ? '✓ Installed' : '○ Not installed (will use mail())');
            echo '</div>';

            // Check config file
            echo '<div class="status ' . (file_exists($backend_dir . '/config.php') ? 'pass' : 'fail') . '">';
            echo 'config.php: ' . (file_exists($backend_dir . '/config.php') ? '✓ Found' : '✗ Missing');
            echo '</div>';
            ?>
        </div>

        <!-- Configuration Check -->
        <div class="test-section">
            <h2>2. Configuration Check</h2>
            <?php
            require_once $backend_dir . '/config.php';
            
            echo '<div class="status ' . (!empty(SMTP_USER) && SMTP_USER !== 'your-email@gmail.com' ? 'pass' : 'warn') . '">';
            echo 'SMTP User configured: ' . (!empty(SMTP_USER) && SMTP_USER !== 'your-email@gmail.com' ? '✓ Yes' : '○ Configure in .env.backend');
            echo '</div>';

            echo '<div class="status ' . (!empty(TWILIO_ACCOUNT_SID) ? 'pass' : 'warn') . '">';
            echo 'Twilio configured: ' . (!empty(TWILIO_ACCOUNT_SID) ? '✓ Yes' : '○ Optional - SMS disabled');
            echo '</div>';

            echo '<div class="status ' . (!empty(ENCRYPTION_KEY) && ENCRYPTION_KEY !== 'your-secret-encryption-key-change-this' ? 'pass' : 'warn') . '">';
            echo 'Encryption key set: ' . (!empty(ENCRYPTION_KEY) && ENCRYPTION_KEY !== 'your-secret-encryption-key-change-this' ? '✓ Yes' : '○ Configure in .env.backend');
            echo '</div>';

            echo '<div class="status pass">';
            echo 'OTP Expiry: ' . OTP_EXPIRY_MINUTES . ' minutes';
            echo '</div>';

            echo '<div class="status pass">';
            echo 'CSV Path: ' . CSV_PATH;
            echo '</div>';
            ?>
        </div>

        <!-- API Testing -->
        <div class="test-section">
            <h2>3. API Testing</h2>
            
            <div class="form-group">
                <label for="test-email">Test Email Address:</label>
                <input type="email" id="test-email" value="test@example.com" placeholder="test@example.com">
            </div>

            <div class="form-group">
                <label for="test-phone">Test Phone (optional):</label>
                <input type="tel" id="test-phone" value="+254789123456" placeholder="+254789123456">
            </div>

            <button onclick="testSendOTP()">Send OTP (Email)</button>
            <button onclick="testSendOTPSMS()">Send OTP (SMS)</button>
            <span id="loading-send" class="loading">Sending...</span>

            <div id="otp-response" class="response" style="display:none;"></div>

            <div class="form-group" id="verify-section" style="display:none;">
                <label for="test-otp">Enter OTP Code:</label>
                <input type="text" id="test-otp" maxlength="6" placeholder="000000">
                <span id="session-id" style="display:none;"></span>
            </div>
            <button id="verify-btn" onclick="testVerifyOTP()" style="display:none;">Verify OTP</button>
            <span id="loading-verify" class="loading">Verifying...</span>

            <div id="verify-response" class="response" style="display:none;"></div>
        </div>

        <!-- Submission Test -->
        <div class="test-section">
            <h2>4. Form Submission Test</h2>
            
            <div class="form-group">
                <label for="form-name">Name:</label>
                <input type="text" id="form-name" value="Test User" placeholder="Full Name">
            </div>

            <div class="form-group">
                <label for="form-email">Email:</label>
                <input type="email" id="form-email" value="test@example.com" placeholder="test@example.com">
            </div>

            <div class="form-group">
                <label for="form-phone">Phone:</label>
                <input type="tel" id="form-phone" value="+254789123456" placeholder="+254789123456">
            </div>

            <div class="form-group">
                <label for="form-interest">Interest:</label>
                <select id="form-interest">
                    <option value="property-management">Property Management</option>
                    <option value="facility-management">Facility Management</option>
                    <option value="securerent">SecureRent</option>
                    <option value="general">General</option>
                </select>
            </div>

            <div class="form-group">
                <label for="form-message">Message:</label>
                <textarea id="form-message" rows="4" placeholder="Your message...">This is a test message for the contact form.</textarea>
            </div>

            <button onclick="testSubmitForm()">Submit Form (Without OTP)</button>
            <span id="loading-submit" class="loading">Submitting...</span>

            <div id="submit-response" class="response" style="display:none;"></div>
        </div>

        <!-- CSV Verification -->
        <div class="test-section">
            <h2>5. CSV Storage Verification</h2>
            <?php
            if (file_exists(CSV_PATH)) {
                $count = 0;
                $fp = fopen(CSV_PATH, 'r');
                while (fgets($fp) !== false) {
                    $count++;
                }
                fclose($fp);
                
                echo '<div class="status pass">';
                echo 'CSV File exists: ✓ Yes<br>';
                echo 'File size: ' . round(filesize(CSV_PATH) / 1024, 2) . ' KB<br>';
                echo 'Total records: ' . ($count - 1) . ' submissions<br>';
                echo 'File permissions: ' . substr(sprintf('%o', fileperms(CSV_PATH)), -3);
                echo '</div>';
                
                echo '<button onclick="downloadCSV()">Download CSV</button>';
            } else {
                echo '<div class="status warn">';
                echo 'CSV File: Will be created on first submission';
                echo '</div>';
            }
            ?>
        </div>

        <!-- Logs Section -->
        <div class="test-section">
            <h2>6. Logs Verification</h2>
            <?php
            if (is_dir(LOGS_DIR)) {
                $log_files = glob(LOGS_DIR . '/*.log');
                if (!empty($log_files)) {
                    echo '<div class="status pass">';
                    echo 'Log directory exists: ✓ Yes<br>';
                    echo 'Recent logs: ' . count($log_files) . ' files';
                    echo '</div>';
                    
                    echo '<button onclick="viewLogs()">View Recent Logs</button>';
                } else {
                    echo '<div class="status warn">';
                    echo 'Log directory exists but no logs yet';
                    echo '</div>';
                }
            } else {
                echo '<div class="status warn">';
                echo 'Log directory will be created on first request';
                echo '</div>';
            }
            ?>
        </div>
    </div>

    <script>
        const API_URL = '<?php echo isset($_GET['api_url']) ? htmlspecialchars($_GET['api_url']) : 'http://localhost:3000/backend'; ?>';
        let sessionId = '';

        async function testSendOTP() {
            const email = document.getElementById('test-email').value;
            const loading = document.getElementById('loading-send');
            const response = document.getElementById('otp-response');
            
            loading.style.display = 'inline';
            response.style.display = 'none';

            try {
                const result = await fetch(`${API_URL}/submit.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'send_otp',
                        email: email,
                        method: 'email'
                    })
                });

                const data = await result.json();
                loading.style.display = 'none';
                response.style.display = 'block';
                response.textContent = JSON.stringify(data, null, 2);

                if (data.success) {
                    sessionId = data.data.session_id;
                    document.getElementById('session-id').textContent = sessionId;
                    document.getElementById('verify-section').style.display = 'block';
                    document.getElementById('verify-btn').style.display = 'inline-block';
                }
            } catch (error) {
                loading.style.display = 'none';
                response.style.display = 'block';
                response.textContent = 'Error: ' + error.message;
            }
        }

        async function testSendOTPSMS() {
            const phone = document.getElementById('test-phone').value;
            const loading = document.getElementById('loading-send');
            const response = document.getElementById('otp-response');
            
            loading.style.display = 'inline';
            response.style.display = 'none';

            try {
                const result = await fetch(`${API_URL}/submit.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'send_otp',
                        phone: phone,
                        method: 'sms'
                    })
                });

                const data = await result.json();
                loading.style.display = 'none';
                response.style.display = 'block';
                response.textContent = JSON.stringify(data, null, 2);

                if (data.success) {
                    sessionId = data.data.session_id;
                    document.getElementById('session-id').textContent = sessionId;
                    document.getElementById('verify-section').style.display = 'block';
                    document.getElementById('verify-btn').style.display = 'inline-block';
                }
            } catch (error) {
                loading.style.display = 'none';
                response.style.display = 'block';
                response.textContent = 'Error: ' + error.message;
            }
        }

        async function testVerifyOTP() {
            const otp = document.getElementById('test-otp').value;
            const loading = document.getElementById('loading-verify');
            const response = document.getElementById('verify-response');
            
            loading.style.display = 'inline';
            response.style.display = 'none';

            try {
                const result = await fetch(`${API_URL}/submit.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'verify_otp',
                        session_id: sessionId,
                        otp_code: otp
                    })
                });

                const data = await result.json();
                loading.style.display = 'none';
                response.style.display = 'block';
                response.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                loading.style.display = 'none';
                response.style.display = 'block';
                response.textContent = 'Error: ' + error.message;
            }
        }

        async function testSubmitForm() {
            const loading = document.getElementById('loading-submit');
            const response = document.getElementById('submit-response');
            
            loading.style.display = 'inline';
            response.style.display = 'none';

            try {
                const result = await fetch(`${API_URL}/submit.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'submit_form',
                        name: document.getElementById('form-name').value,
                        email: document.getElementById('form-email').value,
                        phone: document.getElementById('form-phone').value,
                        interest: document.getElementById('form-interest').value,
                        message: document.getElementById('form-message').value,
                        session_id: sessionId
                    })
                });

                const data = await result.json();
                loading.style.display = 'none';
                response.style.display = 'block';
                response.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                loading.style.display = 'none';
                response.style.display = 'block';
                response.textContent = 'Error: ' + error.message;
            }
        }

        function downloadCSV() {
            window.location.href = '<?php echo CSV_PATH; ?>';
        }

        function viewLogs() {
            window.open('logs.php', 'logs', 'width=800,height=600');
        }
    </script>
</body>
</html>
