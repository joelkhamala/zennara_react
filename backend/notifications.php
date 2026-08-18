<?php
/**
 * Notifications Handler - Send email notifications
 */

require_once 'config.php';
require_once 'mail.php';

class NotificationHandler {
    private $mailer;
    
    public function __construct() {
        $this->mailer = new Mailer();
    }
    
    /**
     * Send confirmation email to user
     */
    public function sendUserConfirmation($email, $name, $interest, $message) {
        $subject = 'Thank you for contacting ZENNARA';
        
        $body = "
        <h2>Thank you, {$name}!</h2>
        <p>We've received your message and will review it shortly.</p>
        
        <div style='background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;'>
            <p><strong>Your Inquiry:</strong></p>
            <p><strong>Interest:</strong> " . ucfirst(str_replace('-', ' ', $interest)) . "</p>
            <p><strong>Message:</strong></p>
            <p>" . nl2br(htmlspecialchars($message)) . "</p>
        </div>
        
        <p>Our team will contact you within 24 hours during business hours.</p>
        
        <p>Best regards,<br/>The ZENNARA Team</p>
        ";
        
        return $this->mailer->send($email, $subject, $body);
    }
    
    /**
     * Send notification to team
     */
    public function sendTeamNotification($data) {
        $subject = 'New Contact Form Submission - ' . $data['name'];
        
        $body = "
        <h2>New Contact Form Submission</h2>
        
        <table style='width: 100%; border-collapse: collapse;'>
            <tr style='background: #f9f9f9;'>
                <td style='padding: 10px; border: 1px solid #ddd;'><strong>Name:</strong></td>
                <td style='padding: 10px; border: 1px solid #ddd;'>" . htmlspecialchars($data['name']) . "</td>
            </tr>
            <tr>
                <td style='padding: 10px; border: 1px solid #ddd;'><strong>Email:</strong></td>
                <td style='padding: 10px; border: 1px solid #ddd;'><a href='mailto:" . htmlspecialchars($data['email']) . "'>" . htmlspecialchars($data['email']) . "</a></td>
            </tr>
            <tr style='background: #f9f9f9;'>
                <td style='padding: 10px; border: 1px solid #ddd;'><strong>Phone:</strong></td>
                <td style='padding: 10px; border: 1px solid #ddd;'>" . (htmlspecialchars($data['phone']) ?: 'Not provided') . "</td>
            </tr>
            <tr>
                <td style='padding: 10px; border: 1px solid #ddd;'><strong>Interest:</strong></td>
                <td style='padding: 10px; border: 1px solid #ddd;'>" . ucfirst(str_replace('-', ' ', $data['interest'])) . "</td>
            </tr>
            <tr style='background: #f9f9f9;'>
                <td style='padding: 10px; border: 1px solid #ddd;'><strong>Message:</strong></td>
                <td style='padding: 10px; border: 1px solid #ddd;'>" . nl2br(htmlspecialchars($data['message'])) . "</td>
            </tr>
            <tr>
                <td style='padding: 10px; border: 1px solid #ddd;'><strong>Email Verified:</strong></td>
                <td style='padding: 10px; border: 1px solid #ddd;'>" . htmlspecialchars($data['email_verified']) . "</td>
            </tr>
            <tr style='background: #f9f9f9;'>
                <td style='padding: 10px; border: 1px solid #ddd;'><strong>Phone Verified:</strong></td>
                <td style='padding: 10px; border: 1px solid #ddd;'>" . htmlspecialchars($data['phone_verified']) . "</td>
            </tr>
            <tr>
                <td style='padding: 10px; border: 1px solid #ddd;'><strong>IP Address:</strong></td>
                <td style='padding: 10px; border: 1px solid #ddd;'>" . htmlspecialchars($data['ip_address']) . "</td>
            </tr>
            <tr style='background: #f9f9f9;'>
                <td style='padding: 10px; border: 1px solid #ddd;'><strong>Submission ID:</strong></td>
                <td style='padding: 10px; border: 1px solid #ddd;'><code>" . htmlspecialchars($data['id']) . "</code></td>
            </tr>
            <tr>
                <td style='padding: 10px; border: 1px solid #ddd;'><strong>Timestamp:</strong></td>
                <td style='padding: 10px; border: 1px solid #ddd;'>" . htmlspecialchars($data['timestamp']) . "</td>
            </tr>
        </table>
        
        <p style='margin-top: 20px; color: #666; font-size: 12px;'>
            View submission details or export data in the 
            <a href='http://localhost:3000/backend/admin.php'>admin dashboard</a>.
        </p>
        ";
        
        return $this->mailer->send(TEAM_EMAIL, $subject, $body);
    }
}

?>
