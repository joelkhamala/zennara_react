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
     * Send notification to team (info@zennarafp.com)
     */
    public function sendTeamNotification($data) {
        $client_name = htmlspecialchars($data['name'] ?? 'Client');
        $client_email = htmlspecialchars($data['email'] ?? '');
        $client_phone = htmlspecialchars($data['phone'] ?? 'Not provided');
        $interest = ucfirst(str_replace('-', ' ', $data['interest'] ?? 'General Enquiry'));
        $message = nl2br(htmlspecialchars($data['message'] ?? ''));
        $email_verified = ($data['email_verified'] ?? '') === 'Yes' || ($data['email_verified'] ?? false) === true;
        $phone_verified = ($data['phone_verified'] ?? '') === 'Yes' || ($data['phone_verified'] ?? false) === true;
        
        $subject = "[New Enquiry] {$client_name} - {$interest} | ZENNARA";
        
        $body = "
        <div style='margin-bottom: 24px;'>
            <div style='display: inline-block; padding: 4px 12px; background: rgba(201, 160, 48, 0.15); border: 1px solid #C9A030; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #C9A030; text-transform: uppercase; margin-bottom: 12px;'>
                New Contact Enquiry
            </div>
            <h2 style='color: #ffffff; font-size: 22px; margin: 0 0 8px 0;'>New Inquiry from {$client_name}</h2>
            <p style='color: #a0a0a0; font-size: 14px; margin: 0;'>A new inquiry has been submitted through the ZENNARA contact form.</p>
        </div>

        <!-- Verification Badges -->
        <div style='margin-bottom: 20px;'>
            " . ($email_verified ? "<span style='display: inline-block; background: #1b4332; color: #74c69d; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 4px; margin-right: 8px;'>✓ Email Verified</span>" : "") . "
            " . ($phone_verified ? "<span style='display: inline-block; background: #1b4332; color: #74c69d; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 4px;'>✓ Phone Verified</span>" : "") . "
        </div>
        
        <!-- Details Table -->
        <table style='width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #181818; border-radius: 8px; overflow: hidden; border: 1px solid #2a2a2a;'>
            <tr style='border-bottom: 1px solid #2a2a2a;'>
                <td style='padding: 12px 16px; color: #888888; font-size: 13px; width: 140px; font-weight: 600;'>Contact Name</td>
                <td style='padding: 12px 16px; color: #ffffff; font-size: 14px; font-weight: 600;'>{$client_name}</td>
            </tr>
            <tr style='border-bottom: 1px solid #2a2a2a;'>
                <td style='padding: 12px 16px; color: #888888; font-size: 13px; font-weight: 600;'>Email Address</td>
                <td style='padding: 12px 16px; font-size: 14px;'>
                    <a href='mailto:{$client_email}' style='color: #C9A030; text-decoration: none; font-weight: 600;'>{$client_email}</a>
                </td>
            </tr>
            <tr style='border-bottom: 1px solid #2a2a2a;'>
                <td style='padding: 12px 16px; color: #888888; font-size: 13px; font-weight: 600;'>Phone Number</td>
                <td style='padding: 12px 16px; color: #ffffff; font-size: 14px;'>{$client_phone}</td>
            </tr>
            <tr style='border-bottom: 1px solid #2a2a2a;'>
                <td style='padding: 12px 16px; color: #888888; font-size: 13px; font-weight: 600;'>Area of Interest</td>
                <td style='padding: 12px 16px; color: #C9A030; font-size: 14px; font-weight: 600;'>{$interest}</td>
            </tr>
            <tr style='border-bottom: 1px solid #2a2a2a;'>
                <td style='padding: 12px 16px; color: #888888; font-size: 13px; font-weight: 600; vertical-align: top;'>Message</td>
                <td style='padding: 12px 16px; color: #e0e0e0; font-size: 14px; line-height: 1.6; background: #141414;'>{$message}</td>
            </tr>
            <tr style='border-bottom: 1px solid #2a2a2a;'>
                <td style='padding: 12px 16px; color: #888888; font-size: 13px; font-weight: 600;'>Submission ID</td>
                <td style='padding: 12px 16px; color: #777777; font-size: 12px; font-family: monospace;'>" . htmlspecialchars($data['id'] ?? 'N/A') . "</td>
            </tr>
            <tr>
                <td style='padding: 12px 16px; color: #888888; font-size: 13px; font-weight: 600;'>Received At</td>
                <td style='padding: 12px 16px; color: #777777; font-size: 12px;'>" . htmlspecialchars($data['timestamp'] ?? date('Y-m-d H:i:s')) . "</td>
            </tr>
        </table>
        
        <!-- Action Buttons -->
        <div style='margin-top: 24px; text-align: center;'>
            <a href='mailto:{$client_email}?subject=Re: ZENNARA Inquiry - {$interest}' style='display: inline-block; background: linear-gradient(135deg, #C9A030 0%, #A88425 100%); color: #000000; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; margin-right: 12px;'>
                ✉️ Reply to {$client_name}
            </a>
            <a href='http://localhost:3000/backend/admin.php' style='display: inline-block; background: #222222; color: #C9A030; border: 1px solid #C9A030; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;'>
                📊 View in Admin Console
            </a>
        </div>
        ";
        
        $to_email = defined('TEAM_EMAIL') && !empty(TEAM_EMAIL) ? TEAM_EMAIL : 'info@zennarafp.com';
        return $this->mailer->send($to_email, $subject, $body, null, $data['email'] ?? null);
    }
}

?>
