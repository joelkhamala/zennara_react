<?php
/**
 * Analytics Dashboard - View statistics and metrics
 * Tracks submission trends, OTP performance, and CRM sync rates
 */

require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

// Load submissions
$submissions = [];
$total_submissions = 0;
$verified_count = 0;
$by_interest = [];
$by_date = [];
$by_hour = [];

if (file_exists(CSV_PATH)) {
    $handle = fopen(CSV_PATH, 'r');
    $headers = fgetcsv($handle);
    
    while (($row = fgetcsv($handle)) !== false) {
        $sub = array_combine($headers, $row);
        $submissions[] = $sub;
        $total_submissions++;
        
        // Count verified
        if ($sub['Email_Verified'] === 'Yes' || $sub['Phone_Verified'] === 'Yes') {
            $verified_count++;
        }
        
        // By interest
        $interest = $sub['Interest'] ?? 'general';
        $by_interest[$interest] = ($by_interest[$interest] ?? 0) + 1;
        
        // By date
        $date = substr($sub['Timestamp'], 0, 10);
        $by_date[$date] = ($by_date[$date] ?? 0) + 1;
        
        // By hour
        $hour = substr($sub['Timestamp'], 11, 2);
        $by_hour[$hour] = ($by_hour[$hour] ?? 0) + 1;
    }
    
    fclose($handle);
}

// Parse log files for OTP stats
$otp_sent = 0;
$otp_verified = 0;
$otp_failed = 0;

$log_files = glob(LOGS_DIR . '/otp_*.log');
foreach ($log_files as $log_file) {
    $lines = file($log_file, FILE_IGNORE_NEW_LINES);
    foreach ($lines as $line) {
        if (strpos($line, 'OTP sent') !== false) $otp_sent++;
        if (strpos($line, 'OTP verified successfully') !== false) $otp_verified++;
        if (strpos($line, 'Invalid OTP') !== false) $otp_failed++;
    }
}

// Calculate percentages
$unverified_count = $total_submissions - $verified_count;
$verification_rate = $total_submissions > 0 ? ($verified_count / $total_submissions * 100) : 0;
$otp_success_rate = $otp_sent > 0 ? ($otp_verified / $otp_sent * 100) : 0;

// Sort data
ksort($by_date);
ksort($by_hour);
arsort($by_interest);

// Chart data for date trend
$chart_dates = [];
$chart_counts = [];
foreach ($by_date as $date => $count) {
    $chart_dates[] = date('M d', strtotime($date));
    $chart_counts[] = $count;
}

$chart_dates_json = json_encode($chart_dates);
$chart_counts_json = json_encode($chart_counts);

// Chart data for interest
$interest_labels = [];
$interest_values = [];
foreach ($by_interest as $interest => $count) {
    $interest_labels[] = ucfirst(str_replace('-', ' ', $interest));
    $interest_values[] = $count;
}

$interest_labels_json = json_encode($interest_labels);
$interest_values_json = json_encode($interest_values);

// Hour data
$hour_labels = [];
$hour_values = [];
for ($i = 0; $i < 24; $i++) {
    $hour_labels[] = str_pad($i, 2, '0', STR_PAD_LEFT) . ':00';
    $hour_values[] = $by_hour[str_pad($i, 2, '0', STR_PAD_LEFT)] ?? 0;
}

$hour_labels_json = json_encode($hour_labels);
$hour_values_json = json_encode($hour_values);

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZENNARA Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', Arial, sans-serif;
            background: #f5f5f5;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #080808 0%, #1C1C1C 100%);
            color: #fff;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #C9A030;
            font-size: 28px;
            margin-bottom: 5px;
        }
        .header p {
            opacity: 0.8;
            font-size: 14px;
        }
        .kpis {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .kpi-card {
            background: #fff;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 4px solid #C9A030;
        }
        .kpi-value {
            font-size: 36px;
            font-weight: bold;
            color: #C9A030;
            margin-bottom: 5px;
        }
        .kpi-label {
            font-size: 13px;
            color: #999;
            font-weight: 500;
        }
        .kpi-detail {
            font-size: 12px;
            color: #999;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #f0f0f0;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .chart-card {
            background: #fff;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .chart-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #333;
        }
        .chart-container {
            position: relative;
            height: 300px;
        }
        .stats-table {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .table-header {
            background: #f5f5f5;
            padding: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .table-header h3 {
            font-size: 16px;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e0e0e0;
            background: #f9f9f9;
            font-size: 12px;
            color: #666;
        }
        td {
            padding: 15px;
            border-bottom: 1px solid #e0e0f0;
            font-size: 13px;
        }
        tr:hover {
            background: #f9f9f9;
        }
        .bar {
            display: inline-block;
            height: 20px;
            background: #C9A030;
            border-radius: 2px;
        }
        .percentage {
            font-weight: 600;
            color: #C9A030;
        }
        @media (max-width: 768px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }
            .kpis {
                grid-template-columns: 1fr 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Analytics Dashboard</h1>
            <p>ZENNARA Contact Form Performance Metrics</p>
        </div>

        <!-- Key Performance Indicators -->
        <div class="kpis">
            <div class="kpi-card">
                <div class="kpi-value"><?php echo $total_submissions; ?></div>
                <div class="kpi-label">Total Submissions</div>
                <div class="kpi-detail">Lifetime metric</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-value"><?php echo number_format($verification_rate, 1); ?>%</div>
                <div class="kpi-label">Verification Rate</div>
                <div class="kpi-detail"><?php echo $verified_count; ?> verified / <?php echo $total_submissions; ?> total</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-value"><?php echo number_format($otp_success_rate, 1); ?>%</div>
                <div class="kpi-label">OTP Success Rate</div>
                <div class="kpi-detail"><?php echo $otp_verified; ?> verified / <?php echo $otp_sent; ?> sent</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-value"><?php echo count($by_interest); ?></div>
                <div class="kpi-label">Interest Categories</div>
                <div class="kpi-detail">Distinct service interests</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-value"><?php echo $otp_sent; ?></div>
                <div class="kpi-label">OTP Sent</div>
                <div class="kpi-detail"><?php echo $otp_failed; ?> failed attempts</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-value"><?php echo count($by_date); ?></div>
                <div class="kpi-label">Active Days</div>
                <div class="kpi-detail">Days with submissions</div>
            </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
            <!-- Submission Trend -->
            <div class="chart-card">
                <div class="chart-title">📈 Submissions Over Time</div>
                <div class="chart-container">
                    <canvas id="trendChart"></canvas>
                </div>
            </div>

            <!-- Interest Distribution -->
            <div class="chart-card">
                <div class="chart-title">🎯 Interest Distribution</div>
                <div class="chart-container">
                    <canvas id="interestChart"></canvas>
                </div>
            </div>

            <!-- Hourly Pattern -->
            <div class="chart-card">
                <div class="chart-title">⏰ Submissions by Hour</div>
                <div class="chart-container">
                    <canvas id="hourChart"></canvas>
                </div>
            </div>

            <!-- Verification Stats -->
            <div class="chart-card">
                <div class="chart-title">✓ Verification Status</div>
                <div class="chart-container">
                    <canvas id="verificationChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Interest Breakdown Table -->
        <div class="stats-table">
            <div class="table-header">
                <h3>Interest Category Breakdown</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Count</th>
                        <th>Percentage</th>
                        <th>Visual</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($by_interest as $interest => $count): ?>
                        <?php $percentage = ($count / $total_submissions * 100); ?>
                        <tr>
                            <td><?php echo htmlspecialchars(ucfirst(str_replace('-', ' ', $interest))); ?></td>
                            <td><?php echo $count; ?></td>
                            <td><span class="percentage"><?php echo number_format($percentage, 1); ?>%</span></td>
                            <td><span class="bar" style="width: <?php echo $percentage * 2; ?>px;"></span></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Performance Notes -->
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-top: 20px; font-size: 13px; color: #666;">
            <strong>📊 Dashboard Information:</strong>
            <ul style="margin-top: 10px; margin-left: 20px; line-height: 1.8;">
                <li><strong>Total Submissions:</strong> <?php echo $total_submissions; ?> contact form submissions received</li>
                <li><strong>Verification Rate:</strong> <?php echo number_format($verification_rate, 1); ?>% of submissions verified via email or SMS</li>
                <li><strong>OTP Performance:</strong> <?php echo $otp_sent; ?> OTP codes sent, <?php echo $otp_verified; ?> verified successfully</li>
                <li><strong>Peak Activity:</strong> Most active on <?php echo $by_date ? key(array_slice($by_date, 0, 1, true)) : 'N/A'; ?> with <?php echo $by_date ? max($by_date) : 0; ?> submissions</li>
                <li><strong>Popular Service:</strong> <?php echo count($by_interest) > 0 ? ucfirst(str_replace('-', ' ', key($by_interest))) : 'N/A'; ?> is the most requested service</li>
            </ul>
        </div>
    </div>

    <script>
        // Chart configuration
        const chartConfig = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: { size: 12 },
                        usePointStyle: true,
                        padding: 15
                    }
                }
            }
        };

        // Trend Chart
        new Chart(document.getElementById('trendChart'), {
            type: 'line',
            data: {
                labels: <?php echo $chart_dates_json; ?>,
                datasets: [{
                    label: 'Submissions',
                    data: <?php echo $chart_counts_json; ?>,
                    borderColor: '#C9A030',
                    backgroundColor: 'rgba(201, 160, 48, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#C9A030',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                ...chartConfig,
                scales: {
                    y: { beginAtZero: true, ticks: { font: { size: 11 } } }
                }
            }
        });

        // Interest Chart
        new Chart(document.getElementById('interestChart'), {
            type: 'doughnut',
            data: {
                labels: <?php echo $interest_labels_json; ?>,
                datasets: [{
                    data: <?php echo $interest_values_json; ?>,
                    backgroundColor: [
                        '#C9A030', '#b8942a', '#a7842a', '#96742a', '#85642a'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: chartConfig
        });

        // Hour Chart
        new Chart(document.getElementById('hourChart'), {
            type: 'bar',
            data: {
                labels: <?php echo $hour_labels_json; ?>,
                datasets: [{
                    label: 'Submissions',
                    data: <?php echo $hour_values_json; ?>,
                    backgroundColor: '#C9A030',
                    borderRadius: 4
                }]
            },
            options: {
                ...chartConfig,
                scales: {
                    y: { beginAtZero: true, ticks: { font: { size: 11 } } }
                }
            }
        });

        // Verification Chart
        new Chart(document.getElementById('verificationChart'), {
            type: 'doughnut',
            data: {
                labels: ['Verified', 'Unverified'],
                datasets: [{
                    data: [<?php echo $verified_count; ?>, <?php echo $unverified_count; ?>],
                    backgroundColor: ['#2e7d32', '#c62828'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: chartConfig
        });
    </script>
</body>
</html>

?>
