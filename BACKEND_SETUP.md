# ZENNARA Backend Setup Guide

Complete guide to setting up the contact form backend with OTP verification and CSV storage.

## Quick Start (5 minutes)

### 1. Copy Backend Files
All PHP files are in `/backend` directory. They're already in place.

### 2. Create Environment File
```bash
# In project root
cp .env.backend.example .env.backend
```

Edit `.env.backend` and add your credentials (Gmail SMTP at minimum).

### 3. Test It Out
Open `http://localhost:3000/backend/test.php` in your browser to verify everything works.

---

## Detailed Setup Guide

### Prerequisites
- PHP 7.4+ installed
- Apache/Nginx with PHP support
- Ability to send emails (Gmail SMTP recommended)
- Optional: Twilio account for SMS

### Step 1: Gmail SMTP Setup

**Enable Gmail 2-Step Verification:**
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Complete the setup

**Generate App Password:**
1. Go back to Security settings
2. Find "App passwords"
3. Select "Mail" and "Windows Computer" (or your device)
4. Google will generate a 16-character password
5. Copy this password

**Update .env.backend:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
FROM_EMAIL=noreply@zennarafp.com
```

### Step 2: Generate Encryption Key

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows PowerShell:**
```powershell
$bytes = New-Object byte[] 32
$rng = [Security.Cryptography.RNGCryptoServiceProvider]::new()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Update .env.backend:**
```env
ENCRYPTION_KEY=your-generated-key-here
```

### Step 3: Vite Configuration

Update `vite.config.js` to serve PHP files:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/backend': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          // Custom configuration
        }
      }
    }
  }
})
```

### Step 4: Run PHP Server

Open a second terminal and run:

```bash
# From project root
php -S localhost:8000 -t .

# Or specify a port
php -S localhost:9000 -t .
```

This serves PHP files at `http://localhost:9000`.

### Step 5: Update React API URL

In `.env`:
```env
VITE_API_URL=http://localhost:9000/backend
```

Or update directly in `src/pages/Contact.jsx`:
```javascript
const API_URL = 'http://localhost:9000/backend'
```

### Step 6: Test the Integration

1. Open `http://localhost:3000` (React app)
2. Navigate to `/contact`
3. Fill out the form
4. Click "Request Proposal"
5. Check your email for OTP code
6. Enter code and submit

---

## Alternative Setup Methods

### Using Local Mail Server (Windows)

If you don't want to use Gmail:

1. Install Papercut SMTP (https://papercut.io/)
2. Update `.env.backend`:
```env
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_USER=
SMTP_PASS=
```

### Using Docker

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  php:
    image: php:8.1-apache
    ports:
      - "8000:80"
    volumes:
      - .:/var/www/html
    environment:
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
```

Run with:
```bash
docker-compose up -d
```

### Using Laravel Valet (Mac)

```bash
valet link
# Access at http://zennara.test/backend/submit.php
```

---

## File Structure

```
project-root/
├── backend/
│   ├── config.php              # Configuration & constants
│   ├── otp.php                # OTP generation/verification
│   ├── mail.php               # Email delivery
│   ├── security.php           # Security functions
│   ├── storage.php            # CSV storage
│   ├── submit.php             # Main handler
│   ├── test.php               # Testing interface
│   └── README.md              # Backend documentation
├── data/
│   ├── contact_submissions.csv # Submissions storage
│   ├── .otp_sessions.json     # Active OTP sessions
│   ├── backups/               # Daily backups
│   └── .rate_limit_*          # Rate limiting data
├── logs/
│   ├── contact_YYYY-MM-DD.log # Form submission logs
│   ├── otp_YYYY-MM-DD.log     # OTP operation logs
│   └── storage_YYYY-MM-DD.log # Storage operation logs
├── src/pages/Contact.jsx      # React component
├── .env.backend               # Environment variables
├── .env.backend.example       # Example configuration
└── BACKEND_SETUP.md           # This file
```

---

## Security Checklist

- [ ] Created `.env.backend` with real credentials
- [ ] Generated and set encryption key
- [ ] Updated vite config for PHP proxy
- [ ] Running PHP server on separate port (not 3000)
- [ ] Updated `VITE_API_URL` to PHP server URL
- [ ] Verified email delivery works
- [ ] Tested OTP flow end-to-end
- [ ] Checked `/logs` directory for errors
- [ ] Verified CSV file was created
- [ ] Set proper file permissions (0600 for data files)
- [ ] Added `.env.backend` to `.gitignore`

---

## Common Issues & Solutions

### "Cannot open CSV file for writing"

**Solution:**
```bash
# Ensure data directory exists and is writable
mkdir -p data
chmod 777 data
```

### "OTP email not received"

**Check:**
1. Gmail app password is correct (not regular password)
2. 2FA enabled on Gmail account
3. From email address is correct
4. Check `/logs/otp_YYYY-MM-DD.log` for errors

**Debug:**
Add to `mail.php` after creating PHPMailer instance:
```php
$this->mail->SMTPDebug = 2;
```

### "Session file locked"

**Solution:**
```bash
# Check permissions
ls -la data/.otp_sessions.json

# Fix permissions
chmod 600 data/.otp_sessions.json
```

### "API returns 404"

**Check:**
1. PHP server is running: `php -S localhost:8000 -t .`
2. `VITE_API_URL` points to correct server (e.g., `http://localhost:8000`)
3. `submit.php` exists in `/backend` directory

### "CORS errors"

The `config.php` already sets CORS headers. If still getting errors:

1. Make sure you're calling the PHP server URL, not React server
2. Check browser console for exact error
3. Update `.env` to match exact domain/port

---

## Monitoring

### Check Recent Activity
```bash
# See last 20 submissions
tail -20 logs/contact_*.log

# See OTP activity
tail -50 logs/otp_*.log

# Check CSV for new records
tail -5 data/contact_submissions.csv
```

### Monitor Email Delivery
Gmail sends emails instantly, but check:
1. Spam folder (add to contacts to trust)
2. Promotions tab
3. Server logs for SMTP errors

### Rate Limiting Status
```bash
# Check rate limit files
ls -la data/.rate_limit_*

# See how many pending requests
wc -l data/.rate_limit_*.json
```

---

## Performance Optimization

### For High Volume

1. **Increase Rate Limit:**
   ```php
   define('RATE_LIMIT_MINUTES', 30);  // More time between requests
   ```

2. **Use SQLite Instead of CSV:**
   - Faster for large datasets
   - Create `database.php` handler
   - Reference SQLite docs

3. **Add Caching:**
   ```php
   define('CACHE_ENABLED', true);
   define('CACHE_DIR', DATA_DIR . '/cache');
   ```

4. **Async Processing:**
   - Queue OTP sends for high volume
   - Process in background with cron

### Backup Strategy

Automatic daily backups are created. For additional safety:

```bash
# Monthly manual backup
cp data/contact_submissions.csv data/backups/contact_submissions_$(date +%Y-%m).csv

# Cloud backup (AWS S3)
aws s3 sync data/backups/ s3://your-bucket/backups/
```

---

## Production Deployment

### Pre-deployment Checklist

- [ ] All `.env.backend` values are production credentials
- [ ] Encryption key is strong and different from development
- [ ] HTTPS is enabled
- [ ] Rate limiting values adjusted for expected volume
- [ ] Backup strategy implemented
- [ ] Monitoring/alerts set up
- [ ] Error logging configured
- [ ] Security headers verified

### Deploy Steps

1. Copy `/backend` files to server
2. Create `.env.backend` with production credentials
3. Set directory permissions: `chmod 755 backend data logs`
4. Run `backend/test.php` to verify
5. Monitor logs for errors
6. Test full flow: form → email → verify → submission

### Server Requirements

- PHP 7.4+ with OpenSSL and cURL
- Write access to `/data` and `/logs`
- SMTP credentials (Gmail, SendGrid, etc.)
- Optional: Twilio for SMS

---

## Support & Troubleshooting

**Check Logs:**
```bash
tail -f logs/contact_*.log      # Real-time submission logs
tail -f logs/otp_*.log          # OTP activity
tail -f logs/storage_*.log      # Storage errors
```

**Test Backend:**
1. Visit `http://your-domain.com/backend/test.php`
2. Run system checks
3. Test sending OTP
4. Download CSV to verify storage

**Debug Mode:**
Add to `config.php`:
```php
define('DEBUG_MODE', true);
// More detailed error messages and logging
```

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready
