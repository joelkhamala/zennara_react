# ZENNARA Backend - Quick Reference

## Setup (Copy-Paste Commands)

### 1. Gmail Setup
1. Enable 2FA: https://myaccount.google.com/security
2. Generate app password in Security → App passwords
3. Copy 16-char password

### 2. Create .env.backend
```bash
cp .env.backend.example .env.backend
```

**Edit with:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
FROM_EMAIL=noreply@zennarafp.com
ENCRYPTION_KEY=<your-random-key>
```

### 3. Generate Encryption Key
**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Windows:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([Guid]::NewGuid().ToString() + [Guid]::NewGuid().ToString()))
```

### 4. Run PHP Server (separate terminal)
```bash
php -S localhost:8000 -t .
```

### 5. Test
```
http://localhost:3000/backend/test.php
```

## File Locations

| File | Purpose |
|------|---------|
| `/backend/config.php` | Configuration & constants |
| `/backend/submit.php` | API endpoint (main file) |
| `/backend/test.php` | Web testing interface |
| `/data/contact_submissions.csv` | Submission storage |
| `/logs/contact_*.log` | Activity logs |
| `.env.backend` | Environment credentials |

## API Quick Reference

### Send OTP
```bash
curl -X POST http://localhost:8000/backend/submit.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_otp",
    "email": "user@example.com",
    "method": "email"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "abc123...",
    "method": "email"
  }
}
```

### Verify OTP
```bash
curl -X POST http://localhost:8000/backend/submit.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "verify_otp",
    "session_id": "abc123...",
    "otp_code": "123456"
  }'
```

### Submit Form
```bash
curl -X POST http://localhost:8000/backend/submit.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "submit_form",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254789123456",
    "interest": "property-management",
    "message": "I need services",
    "session_id": "abc123..."
  }'
```

## Environment Variables

```env
# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
FROM_EMAIL=noreply@zennarafp.com
FROM_NAME=ZENNARA Contact Form

# SMS (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+1234567890

# Security
ENCRYPTION_KEY=your-random-key

# OTP Settings
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
MAX_ATTEMPTS=5
RATE_LIMIT_MINUTES=15
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Email not received | Check Gmail app password (not regular password), verify SMTP credentials |
| CSV permission error | `chmod 644 data/contact_submissions.csv` |
| "Too many requests" | Rate limit active, wait 15 minutes |
| API returns 404 | PHP server not running, check `VITE_API_URL` |
| Session expired | OTP expires after 10 minutes, request new one |

## File Permissions

```bash
# Data directory
chmod 755 data/
chmod 755 logs/

# CSV file
chmod 644 data/contact_submissions.csv

# Session file
chmod 600 data/.otp_sessions.json

# Rate limit files
chmod 644 data/.rate_limit_*
```

## Testing Commands

**Check logs:**
```bash
tail -f logs/contact_*.log
tail -f logs/otp_*.log
```

**View CSV:**
```bash
cat data/contact_submissions.csv
head -5 data/contact_submissions.csv  # First 5 rows
tail -5 data/contact_submissions.csv  # Last 5 rows
```

**Check directories:**
```bash
ls -la data/
ls -la logs/
ls -la backend/
```

## Configuration Defaults

- OTP Length: **6 digits**
- OTP Expiry: **10 minutes**
- Max Attempts: **5 tries**
- Rate Limit: **3 requests per 15 minutes**
- CSV Backup: **Daily automatic**

## Data Directory Structure

```
data/
├── contact_submissions.csv          # Main CSV file
├── .otp_sessions.json               # Active OTP sessions (hidden)
├── .rate_limit_*.json               # Rate limit tracking (hidden)
└── backups/
    ├── contact_submissions.csv.2024-01-15.bak
    ├── contact_submissions.csv.2024-01-16.bak
    └── ...
```

## Security Notes

✅ Do:
- Change ENCRYPTION_KEY to random string
- Use Gmail app password (not regular password)
- Keep .env.backend private (add to .gitignore)
- Regularly check logs for errors
- Backup CSV files regularly

❌ Don't:
- Commit .env.backend to git
- Use weak encryption keys
- Share SMTP credentials
- Store passwords in comments
- Disable SSL/HTTPS in production

## Useful Commands

**Backup CSV:**
```bash
cp data/contact_submissions.csv data/backups/contact_submissions_$(date +%Y-%m-%d_%H-%M-%S).backup
```

**Search logs:**
```bash
grep "error" logs/contact_*.log
grep "verified" logs/otp_*.log
```

**Count submissions:**
```bash
wc -l data/contact_submissions.csv  # Includes header row
```

**View recent submissions:**
```bash
tail -3 data/contact_submissions.csv
```

## React Component Integration

```javascript
const API_URL = 'http://localhost:8000/backend'

// Send OTP
fetch(`${API_URL}/submit.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'send_otp',
    email: 'user@example.com',
    method: 'email'
  })
})
```

## Production Checklist

- [ ] `.env.backend` has production credentials
- [ ] ENCRYPTION_KEY is strong and unique
- [ ] PHP server is running on production
- [ ] HTTPS is enabled
- [ ] File permissions are secure (644 for CSV, 755 for dirs)
- [ ] Backups are being created
- [ ] Logs are being monitored
- [ ] Email delivery is tested
- [ ] OTP flow tested end-to-end
- [ ] CSV data verified and accessible

## Support Resources

| Resource | Location |
|----------|----------|
| Full documentation | `/backend/README.md` |
| Setup guide | `/BACKEND_SETUP.md` |
| Implementation details | `/backend/IMPLEMENTATION_SUMMARY.md` |
| Web test interface | `http://localhost:8000/backend/test.php` |
| Contact component | `src/pages/Contact.jsx` |

## Emergency Fixes

**Reset OTP sessions:**
```bash
rm data/.otp_sessions.json
```

**Clear rate limiting:**
```bash
rm data/.rate_limit_*
```

**Reset everything:**
```bash
rm -rf data/*
rm -rf logs/*
# Recreate on next request
```

## Performance Tips

- Monitor CSV file size (archive if > 50MB)
- Clean old logs monthly
- Use backups for recovery
- Consider SQLite for high volume (>10k submissions)

---

**Quick Start:** 5 minutes from zero to working  
**Full Setup:** 15 minutes including Gmail setup  
**Production:** 30 minutes with testing  

Need help? Check `/backend/test.php` for system diagnostics!
