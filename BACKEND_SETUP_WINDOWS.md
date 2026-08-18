# ZENNARA Backend Setup Guide for Windows

## Prerequisites

- PHP 7.4+ installed and available in PATH
- Node.js 16+ (for Vite dev server)
- Git (optional but recommended)
- A Gmail account (for SMTP testing)

### Check Prerequisites

Open PowerShell and run:

```powershell
php --version
node --version
npm --version
```

All three should show version numbers.

---

## Setup Steps

### Step 1: Copy Environment Configuration

```powershell
# Navigate to project directory
cd "path\to\zennara v4"

# Copy the example environment file
Copy-Item .env.backend.example .env.backend
```

### Step 2: Configure .env.backend

Edit `.env.backend` and update with your credentials:

```powershell
# Open in notepad
notepad .env.backend
```

**Required:**
- `SMTP_USER`: Your email address
- `SMTP_PASS`: Your email's app password (not regular password)
- `ENCRYPTION_KEY`: Random 32+ character string
- `ADMIN_PASSWORD`: Choose a strong password

**Optional:**
- Twilio credentials (for SMS)
- CRM webhook URLs (Zapier, HubSpot, Salesforce)

### Step 3: Get Gmail App Password

If using Gmail SMTP:

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Paste into `.env.backend` as `SMTP_PASS`

### Step 4: Generate Encryption Key

In PowerShell, run:

```powershell
# Generate a random 32-character key
$key = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host $key
```

Copy the output and paste into `.env.backend` as `ENCRYPTION_KEY`

### Step 5: Start PHP Development Server

Open a NEW PowerShell window and run:

```powershell
# Navigate to project directory
cd "path\to\zennara v4"

# Start PHP server
php -S localhost:8000 -t .
```

You should see:
```
[Wed Aug 19 10:30:00 2026] PHP 8.1.x Development Server started at http://localhost:8000
[Wed Aug 19 10:30:00 2026] Press Ctrl-C to quit
```

**Leave this window open.**

### Step 6: Start Vite Development Server

Open ANOTHER PowerShell window and run:

```powershell
# Navigate to project directory
cd "path\to\zennara v4"

# Install dependencies (if not already done)
npm install

# Start Vite dev server
npm run dev
```

You should see the React app open automatically at `http://localhost:3000`

---

## Testing the Backend

### 1. Test Admin Dashboard

Navigate to: `http://localhost:3000/backend/admin.php`

Login with password: (the one you set in `.env.backend`)

### 2. Test Analytics

Navigate to: `http://localhost:3000/backend/analytics.php`

### 3. Test Contact Form

1. Go to `http://localhost:3000/contact`
2. Fill out the form
3. Click "Request Proposal"
4. Enter OTP code (check browser console or your email)
5. Submit form
6. Check admin dashboard to see submission

### 4. Test Email

Send test email via admin dashboard or check logs:

```powershell
Get-Content "logs\otp_*.log" -Tail 10
```

---

## Troubleshooting

### PHP Server Won't Start

**Error:** `Port 8000 is already in use`

**Solution:** Use a different port:
```powershell
php -S localhost:8001 -t .
```

Then update `vite.config.js`:
```javascript
proxy: {
  '/backend': {
    target: 'http://localhost:8001',
```

### Email Not Sending

**Check:**
1. `SMTP_USER` and `SMTP_PASS` are correct
2. Gmail account has 2FA enabled
3. Using app password (not regular password)
4. Check logs: `logs\otp_*.log`

**Test manually:**
```powershell
# Create test.php and run it
php test.php
```

### Vite Proxy Not Working

**Symptom:** API calls fail with CORS or 404

**Solution:**
1. Make sure PHP server is running on port 8000
2. Check `vite.config.js` has the proxy configured
3. Restart Vite dev server: `Ctrl+C` then `npm run dev`

### CORS Errors

**Solution:** Backend already has CORS headers enabled in `config.php`:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

If still getting errors, check browser console for details.

---

## File Structure After Setup

```
zennara v4/
├── .env.backend          ← Your configuration (DON'T commit!)
├── .env.backend.example  ← Template (safe to commit)
├── vite.config.js        ← Updated with proxy
├── backend/
│   ├── admin.php         ← Dashboard
│   ├── analytics.php     ← Analytics charts
│   ├── auth.php          ← User authentication
│   ├── config.php        ← Configuration loader
│   ├── crm.php           ← CRM integration
│   ├── export.php        ← Data export
│   ├── logs.php          ← Log viewer
│   ├── mail.php          ← Email handler
│   ├── notifications.php ← Email templates
│   ├── otp.php           ← OTP generation/verification
│   ├── security.php      ← Encryption/validation
│   ├── storage.php       ← CSV storage
│   ├── submit.php        ← Main API endpoint
│   ├── test.php          ← API tester
│   └── totp.php          ← 2FA handler
├── data/                 ← Auto-created
│   ├── contact_submissions.csv
│   ├── .otp_sessions.json
│   └── backups/
├── logs/                 ← Auto-created
│   ├── contact_*.log
│   ├── otp_*.log
│   └── ...
└── src/                  ← React frontend
```

---

## Development Workflow

### Terminal 1: PHP Server
```powershell
cd "path\to\zennara v4"
php -S localhost:8000 -t .
```

### Terminal 2: Vite Dev Server
```powershell
cd "path\to\zennara v4"
npm run dev
```

### Terminal 3: Logs (Optional)
```powershell
Get-Content "path\to\zennara v4\logs\*.log" -Wait
```

---

## Key URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | React Frontend |
| `http://localhost:3000/contact` | Contact Form |
| `http://localhost:3000/portal` | User Portal |
| `http://localhost:3000/backend/admin.php` | Admin Dashboard |
| `http://localhost:3000/backend/analytics.php` | Analytics |
| `http://localhost:3000/backend/logs.php` | Logs Viewer |
| `http://localhost:8000` | Direct PHP Server (for testing) |
| `http://localhost:8000/backend/test.php` | API Test Interface |

---

## API Testing

### Send OTP
```powershell
$body = @{
    action = "send_otp"
    email = "test@example.com"
    method = "email"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/backend/submit.php" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Verify OTP
```powershell
$body = @{
    action = "verify_otp"
    session_id = "abc123..."
    otp_code = "123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/backend/submit.php" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

## Next Steps

1. ✅ Setup backend with .env.backend
2. ✅ Start PHP server
3. ✅ Start Vite dev server
4. ✅ Test contact form submission
5. ✅ View admin dashboard
6. [ ] Set up user authentication (Portal)
7. [ ] Configure CRM integration (optional)
8. [ ] Deploy to production

---

## Production Deployment

Before deploying to production:

1. Update `.env.backend` with production credentials
2. Change `ADMIN_PASSWORD` to something strong
3. Set `CRM_SYNC_ENABLED` appropriately
4. Run `npm run build` to create optimized bundle
5. Set up HTTPS/SSL certificate
6. Configure server to run PHP with proper permissions
7. Back up your data directory regularly

---

## Support & Troubleshooting

### Check PHP Version
```powershell
php --version
```

### Check PHP Extensions
```powershell
php -m | Select-String openssl
php -m | Select-String curl
```

### Clear Logs
```powershell
Remove-Item logs\*.log
```

### Reset Admin Password
Edit `.env.backend` and change `ADMIN_PASSWORD` value, then clear session cookies and login again.

### Debug OTP Sending
Edit `backend/otp.php` and add:
```php
error_log("OTP Debug: " . print_r($otp_data, true));
```

---

**Last Updated:** August 19, 2026  
**Version:** 1.0  
**Status:** ✅ Ready for Use
