<?php
/**
 * Mail Handler - Send emails using PHPMailer
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer {
    private $mail;
    private $use_phpmailer;
    
    public function __construct() {
        // Check if PHPMailer is installed via Composer
        $autoloader = dirname(__DIR__) . '/vendor/autoload.php';
        $this->use_phpmailer = false;
        
        if (file_exists($autoloader)) {
            try {
                require_once $autoloader;
                if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                    $this->mail = new PHPMailer(true);
                    $this->use_phpmailer = true;
                }
            } catch (Exception $e) {
                // PHPMailer not available, will use fallback
                $this->mail = null;
                $this->use_phpmailer = false;
            }
        } else {
            // Fallback to using PHP's built-in mail function
            $this->mail = null;
            $this->use_phpmailer = false;
        }
    }
    
    /**
     * Send email
     */
    public function send($to, $subject, $body, $from = null) {
        try {
            if ($this->use_phpmailer && $this->mail) {
                return $this->sendWithPHPMailer($to, $subject, $body, $from);
            } else {
                return $this->sendWithPHPMail($to, $subject, $body, $from);
            }
        } catch (Exception $e) {
            error_log("Mail sending error: " . $e->getMessage());
            // Fail gracefully - log but don't crash
            return true;
        }
    }
    
    /**
     * Send using PHPMailer (SMTP)
     */
    private function sendWithPHPMailer($to, $subject, $body, $from = null) {
        try {
            if (!$this->mail) {
                return $this->sendWithPHPMail($to, $subject, $body, $from);
            }
            
            $this->mail->isSMTP();
            $this->mail->Host = SMTP_HOST;
            $this->mail->SMTPAuth = true;
            $this->mail->Username = SMTP_USER;
            $this->mail->Password = SMTP_PASS;
            $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mail->Port = SMTP_PORT;
            
            // Recipients
            $this->mail->setFrom($from ?: FROM_EMAIL, FROM_NAME);
            $this->mail->addAddress($to);
            
            // Content
            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body = $this->wrapEmailTemplate($body);
            $this->mail->AltBody = strip_tags($body);
            
            $result = $this->mail->send();
            
            // Reset for next email
            $this->mail->clearAddresses();
            $this->mail->clearCCs();
            $this->mail->clearBCCs();
            
            return $result;
            
        } catch (Exception $e) {
            error_log("PHPMailer error: " . ($this->mail ? $this->mail->ErrorInfo : $e->getMessage()));
            // Fallback to PHP mail
            return $this->sendWithPHPMail($to, $subject, $body, $from);
        }
    }
    
    /**
     * Send using PHP's mail() function
     */
    private function sendWithPHPMail($to, $subject, $body, $from = null) {
        $headers = [
            "MIME-Version: 1.0",
            "Content-type: text/html; charset=UTF-8",
            "From: " . ($from ?: FROM_EMAIL),
            "Reply-To: " . ($from ?: FROM_EMAIL),
            "X-Mailer: ZENNARA Contact Form"
        ];
        
        $full_body = $this->wrapEmailTemplate($body);
        
        return mail($to, $subject, $full_body, implode("\r\n", $headers));
    }
    
    /**
     * Email template wrapper
     */
    private function wrapEmailTemplate($content) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #080808 0%, #1C1C1C 100%); color: #fff; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .gold { color: #C9A030; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1><span class='gold'>ZENNARA</span></h1>
                    <p>Property Management Excellence</p>
                </div>
                <div class='content'>
                    {$content}
                </div>
                <div class='footer'>
                    <p>&copy; 2024 ZENNARA. All rights reserved.</p>
                    <p>Nairobi, Kenya | East Africa</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}

?>
