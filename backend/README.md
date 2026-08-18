# ZENNARA Contact Form Backend

This is a production-ready PHP backend for the ZENNARA contact form with OTP verification and secure CSV storage.

## Features

✅ **OTP Verification**
- Send OTP via Email or SMS
- Rate limiting to prevent abuse
- Session-based OTP management
- Configurable expiry and attempt limits
- Automatic cleanup of expired OTPs

✅ **Secure Data Storage**
- CSV-based storage with encryption support
- Automatic daily backups
- File locking during write operations
- Secure file permissions (0600)
- Data sanitization and validation

✅ **Email Delivery**
- PHPMailer integration for reliable SMTP
- Fallback to PHP mail() function
- HTML email templates
- Support for Gmail, SendGrid, and other SMTP providers

✅ **SMS Integration**
- Twilio support for SMS OTP
- Phone number validation
- International phone number support

✅ **Security Features**
- Input sanitization
- CSRF protection
- Rate limiting
- IP address logging
- User agent tracking
- Encryption for sensitive data

## Installation

### 1. Requirements

- PHP 7.4 or higher
- cURL extension (for Twilio API)
- OpenSSL extension (for encryption)
- Writable directories for data storage
- SMTP credentials (Gmail, SendGrid, etc.)

### 2. Setup Steps

#### a) Copy Backend Files
All backend files are in the `/backend` directory:
```
/backend
├── config.php          # Configuration and constants
├── otp.php            # OTP generation and verification
├── mail.php           # Email delivery
├── security.php       # Data encryption and sanitization
├── storage.php        # CSV storage handler
└── submit.php         # Main form submission handler
```

#### b) Install PHPMailer (Optional but Recommended)
```bash
cd /path/to/project
composer require phpmailer/phpmailer
```

If you don't have Composer, the system will fallback to PHP's built-in `mail()` function.

#### c) Create Environment File
```bash
cp .env.backend.example .env.backend
```

Edit `.env.backend` with your credentials:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@zennarafp.com
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+1234567890
ENCRYPTION_KEY=your-random-secret-key
```

#### d) Create Required Directories
The backend will auto-create these directories on first run:
- `/data` - Stores CSV files
- `/data/backups` - Daily CSV backups
- `/logs` - Activity logs

Make sure `/backend` is writable:
```bash
chmod 755 /backend
```

#### e) Configure React Environment
Add to your `.env` file:
```env
VITE_API_URL=http://localhost:3000/backend
```

Or update in `src/pages/Contact.jsx`:
```javascript
const API_URL = 'http://your-domain.com/backend'
```

## Configuration Guide

### Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security
   - Select "App passwords"
   - Generate a password for "Mail"
3. Use the generated 16-character password as `SMTP_PASS`

### Twilio Configuration (SMS)

1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Generate a Twilio phone number
4. Add credentials to `.env.backend`

### Encryption Key

Generate a random encryption key:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
$key = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })); $key
```

Use this key as `ENCRYPTION_KEY` in `.env.backend`.

## API Endpoints

All requests use POST to `/backend/submit.php` with JSON body.

### 1. Send OTP

**Request:**
```json
{
  "action": "send_otp",
  "email": "user@example.com",
  "phone": "+254789123456",
  "method": "email"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "session_id": "abc123def456...",
    "method": "email",
    "message": "OTP sent to user@example.com"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

### 2. Verify OTP

**Request:**
```json
{
  "action": "verify_otp",
  "session_id": "abc123def456...",
  "otp_code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "session_id": "abc123def456...",
    "verified": true,
    "method": "email",
    "message": "OTP verified successfully"
  }
}
```

### 3. Submit Form

**Request:**
```json
{
  "action": "submit_form",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254789123456",
  "interest": "property-management",
  "message": "I need property management services.",
  "session_id": "abc123def456..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "id": "unique-submission-id",
  "message": "Your message has been received.",
  "otp_verified": true
}
```

## CSV Data Format

Contact submissions are stored in `/data/contact_submissions.csv`:

```csv
Timestamp,ID,Name,Email,Phone,Interest,Message,Email_Verified,Phone_Verified,IP_Address,User_Agent
2024-01-15 10:30:45,abc123def456...,John Doe,john@example.com,+254789123456,property-management,I need services,Yes,No,192.168.1.1,Mozilla/5.0...
```

## Security Best Practices

1. **Never commit `.env.backend` to version control**
   - Add it to `.gitignore`
   - Keep encryption keys private

2. **Protect CSV Files**
   - Set permissions to 0600 (read/write owner only)
   - Store outside web root if possible
   - Regularly backup data

3. **Rate Limiting**
   - Maximum 3 OTP requests per 15 minutes per identifier
   - Maximum 5 OTP verification attempts per session

4. **Data Encryption**
   - Consider encrypting sensitive data at rest
   - Use HTTPS for all connections

5. **Logging**
   - All actions are logged to `/logs` directory
   - Review logs regularly for suspicious activity

6. **Input Validation**
   - All inputs are sanitized
   - Phone numbers must be 10-15 digits
   - Emails validated with filter_var()

## Troubleshooting

### OTP Email Not Sending

**Check:**
1. SMTP credentials in `.env.backend`
2. Gmail app password (not regular password)
3. 2FA enabled on Gmail
4. Check logs in `/logs/otp_YYYY-MM-DD.log`

**Enable debug:**
Add this to `mail.php` after `$this->mail = new PHPMailer(true);`:
```php
$this->mail->SMTPDebug = 2; // Verbose output
```

### CSV File Locked

**Solution:**
1. Check file permissions: `chmod 644 /data/contact_submissions.csv`
2. Clear any stale file locks
3. Ensure PHP process has write access

### Session Directory Issues

**Solution:**
```bash
# Create session directory
mkdir -p /path/to/project/sessions
chmod 777 /path/to/project/sessions

# Configure in config.php
session_save_path('/path/to/project/sessions');
```

## Integration with Frontend

The React Contact component already integrates with this backend. The flow is:

1. User fills form and clicks "Request Proposal"
2. Frontend calls `POST /backend/submit.php?action=send_otp`
3. Backend sends OTP and returns `session_id`
4. User enters OTP code
5. Frontend calls `POST /backend/submit.php?action=verify_otp`
6. On success, frontend calls `POST /backend/submit.php?action=submit_form`
7. Data is saved to CSV with verification status

## Monitoring and Maintenance

### Daily Tasks
- Review `/logs` directory for errors
- Check `/data/contact_submissions.csv` for new submissions

### Weekly Tasks
- Verify backup files in `/data/backups`
- Check SMTP delivery rates
- Monitor rate limiting effectiveness

### Monthly Tasks
- Rotate encryption keys (optional)
- Archive old logs
- Review and optimize CSV storage

## Support

For issues or questions:
1. Check the logs in `/logs` directory
2. Review error messages in browser console
3. Verify all environment variables are set correctly
4. Check PHP version and extensions (`php -m`)

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready
