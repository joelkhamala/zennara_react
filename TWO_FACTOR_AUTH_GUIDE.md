# ZENNARA Two-Factor Authentication (2FA) - Complete Guide

**Status:** ✅ Implementation Complete  
**Version:** 1.0.0  
**Last Updated:** August 19, 2026

---

## 📋 Overview

The Two-Factor Authentication system provides enhanced security for user portal logins using Time-based One-Time Passwords (TOTP).

### Features
- ✅ **TOTP Support** - Compatible with Google Authenticator, Authy, Microsoft Authenticator
- ✅ **QR Code** - Easy setup with QR code scanning
- ✅ **Backup Codes** - 10 one-time use backup codes
- ✅ **Session Management** - Secure 2FA verification flow
- ✅ **Optional 2FA** - Users can choose to enable/disable
- ✅ **Code Regeneration** - Get new backup codes anytime

---

## 🚀 How It Works

### User Flow

#### 1. Enable 2FA (First Time)
```
1. User visits Portal Settings
2. Clicks "Enable Two-Factor Authentication"
3. System generates secret + QR code
4. User scans QR with Google Authenticator (or similar)
5. User enters 6-digit code to verify setup
6. System generates 10 backup codes
7. User saves backup codes in secure location
8. 2FA now enabled on account
```

#### 2. Login with 2FA (Every Time)
```
1. User enters email + password
2. System verifies credentials
3. If 2FA enabled:
   a. Creates temporary session (5 minutes)
   b. Requests 2FA code
   c. User enters 6-digit TOTP code
   d. System verifies code
   e. Creates permanent session (24 hours)
4. User logged in successfully
```

#### 3. Using Backup Codes
```
1. User can't access authenticator app
2. During login, instead of 6-digit code, enters backup code
3. Format: XXXX-XXXX (any of the 10 generated)
4. System verifies and marks code as used
5. User can only use each code once
6. After using all 10 codes, user must regenerate
```

---

## 📱 Supported Authenticator Apps

### Recommended (Free)
- ✅ **Google Authenticator** - Android & iOS
- ✅ **Microsoft Authenticator** - Android & iOS
- ✅ **Authy** - Android, iOS, Desktop (cloud backup)
- ✅ **FreeOTP** - Android & iOS

### Setting Up
1. Download authenticator app from app store
2. In Portal Settings, click "Enable 2FA"
3. Click "Scan QR Code" in your authenticator app
4. Scan the QR code displayed
5. 6-digit code appears in app (updates every 30 seconds)
6. Enter code in Portal to verify

---

## 🔧 Technical Implementation

### Backend Files
- **`/backend/totp.php`** (500+ lines)
  - TOTP generation and verification
  - Secret management
  - Backup code generation
  - QR code URL generation

- **`/backend/auth.php`** (Enhanced)
  - 2FA login flow
  - Temporary session creation
  - 2FA verification handler

### TOTP Algorithm
```
- Algorithm: HMAC-SHA1
- Time Step: 30 seconds
- Digits: 6
- Time Window: 1 (allows ±30 seconds tolerance)
- QR Code: otpauth:// URI format
```

### Data Storage
```
/data/totp_secrets.json
├── user_id: {
│   ├── secret: "ABCD1234..." (base32)
│   ├── enabled: true/false
│   ├── created_at: "2024-08-19 10:30:00"
│   └── email: "user@example.com"
└── ...

/data/backup_codes.json
├── user_id: {
│   ├── codes: ["1234-5678", ...]
│   ├── used: [0, 2, 5] (indices of used codes)
│   └── created_at: "2024-08-19 10:30:00"
└── ...
```

---

## 🔗 API Endpoints

### TOTP Handler

#### 1. Setup 2FA
```http
POST /backend/totp.php
Content-Type: application/json

{
  "action": "setup",
  "user_id": "user_123",
  "email": "user@example.com"
}

Response (200):
{
  "success": true,
  "secret": "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  "backup_codes": [
    "1234-5678",
    "2345-6789",
    ...
  ],
  "qr_code_url": "https://chart.googleapis.com/chart?..."
}
```

#### 2. Verify 2FA Setup
```http
POST /backend/totp.php
Content-Type: application/json

{
  "action": "verify_setup",
  "user_id": "user_123",
  "code": "123456"
}

Response (200):
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

#### 3. Verify 2FA Code
```http
POST /backend/totp.php
Content-Type: application/json

{
  "action": "verify_code",
  "user_id": "user_123",
  "code": "123456"
}

Response (200):
{
  "success": true,
  "message": "2FA verified"
}
```

#### 4. Get 2FA Status
```http
POST /backend/totp.php
Content-Type: application/json

{
  "action": "status",
  "user_id": "user_123"
}

Response (200):
{
  "success": true,
  "enabled": true,
  "backup_codes_remaining": 8
}
```

#### 5. Regenerate Backup Codes
```http
POST /backend/totp.php
Content-Type: application/json

{
  "action": "regenerate_backup",
  "user_id": "user_123"
}

Response (200):
{
  "success": true,
  "backup_codes": [
    "9876-5432",
    "8765-4321",
    ...
  ]
}
```

#### 6. Disable 2FA
```http
POST /backend/totp.php
Content-Type: application/json

{
  "action": "disable",
  "user_id": "user_123"
}

Response (200):
{
  "success": true,
  "message": "2FA disabled"
}
```

### Auth Handler (Updated)

#### Login with 2FA Flow
```http
Step 1: Login (requires_2fa response)
POST /backend/auth.php
{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}

Response (200 - if 2FA enabled):
{
  "success": true,
  "requires_2fa": true,
  "temp_token": "abc123def456...",
  "message": "2FA required - Please enter your authentication code"
}

Step 2: Verify 2FA Code
POST /backend/auth.php
{
  "action": "verify_2fa",
  "temp_token": "abc123def456...",
  "code": "123456"
}

Response (200 - if code valid):
{
  "success": true,
  "message": "2FA verified - Login successful",
  "token": "permanent_token_abc123...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "type": "client"
  }
}
```

---

## 🎯 Use Cases

### Use Case 1: First Time 2FA Setup
**User:** New account owner  
**Goal:** Enable 2FA for added security

**Steps:**
1. Login to portal
2. Go to Settings → Security
3. Click "Enable Two-Factor Authentication"
4. Scan QR code with Google Authenticator
5. Enter 6-digit code shown in app
6. Save the 10 backup codes
7. 2FA now active

### Use Case 2: Login with 2FA
**User:** Returning user with 2FA enabled  
**Goal:** Safely login with two factors

**Steps:**
1. Enter email and password
2. System requests 2FA code
3. Open authenticator app
4. Read current 6-digit code
5. Enter code in portal
6. Successfully logged in

### Use Case 3: Lost Authenticator App
**User:** Switched phones, lost authenticator app  
**Goal:** Login without authenticator

**Steps:**
1. During login, when asked for 2FA code
2. Instead of 6-digit code, enter backup code
3. Format: XXXX-XXXX (one of 10 saved)
4. System accepts and marks code as used
5. User logged in
6. After using all codes, regenerate in Settings

### Use Case 4: Regenerate Backup Codes
**User:** Used all 10 backup codes  
**Goal:** Get new backup codes

**Steps:**
1. Login to portal (authenticator still works)
2. Go to Settings → Security
3. Click "Regenerate Backup Codes"
4. Confirm action
5. System generates 10 new codes
6. Save new codes in secure location

---

## 🔐 Security Features

### TOTP Security
- ✅ Base32 encoding for secrets
- ✅ HMAC-SHA1 algorithm
- ✅ 30-second time window
- ✅ ±1 time step tolerance (prevents clock skew)
- ✅ 6-digit codes (1 million combinations)

### Backup Code Security
- ✅ 8-digit random codes (100 million combinations)
- ✅ One-time use only
- ✅ Codes marked as used after verification
- ✅ Regeneration creates completely new codes

### Session Security
- ✅ Temporary session (5 minutes) for 2FA verification
- ✅ Permanent session (24 hours) after verification
- ✅ Automatic cleanup of expired sessions
- ✅ Token-based verification

### Protection Against
- ✅ Brute force attacks (requires correct secret)
- ✅ Time-based replay attacks (time window + tolerance)
- ✅ Backup code reuse (marked as used)
- ✅ Unauthorized 2FA setup (requires account verification)

---

## 📊 Configuration

### Time-Based Settings
```php
// TOTP Settings (fixed)
ALGORITHM: HMAC-SHA1
TIME_STEP: 30 seconds
DIGITS: 6
TIME_WINDOW: 1 (±30 seconds tolerance)

// Session Settings (configurable)
TEMP_SESSION_EXPIRY: 5 minutes
PERMANENT_SESSION_EXPIRY: 24 hours
BACKUP_CODE_COUNT: 10
```

### Supported Algorithms
Currently implemented: **HMAC-SHA1**
(Most compatible with authenticator apps)

Planned future:
- HMAC-SHA256
- HMAC-SHA512

---

## 🧪 Testing 2FA

### Test Setup Flow
```bash
curl -X POST http://localhost:8000/backend/totp.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "setup",
    "user_id": "user_123",
    "email": "test@example.com"
  }'
```

Response includes:
- Secret (for manual entry if needed)
- QR code URL (Google Charts API)
- Backup codes (10 codes)

### Test Verification Flow
```bash
# After setting up, get current code from authenticator app
# Then verify:

curl -X POST http://localhost:8000/backend/totp.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "verify_setup",
    "user_id": "user_123",
    "code": "123456"
  }'
```

### Test Login Flow
```bash
# Step 1: Initial login
curl -X POST http://localhost:8000/backend/auth.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "test@example.com",
    "password": "password123"
  }'

# Get temp_token from response
# Get TOTP code from authenticator app

# Step 2: Verify 2FA
curl -X POST http://localhost:8000/backend/auth.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "verify_2fa",
    "temp_token": "abc123...",
    "code": "123456"
  }'
```

---

## 🛠️ Troubleshooting

### Issue: QR Code Won't Scan
**Solution:**
- Check internet connection for QR code load
- Try manual entry: Use secret directly in authenticator app
- Settings → Enter Code → Select TOTP
- Enter the secret as base32

### Issue: Code Always Wrong
**Solution:**
- Check phone/device time is synchronized
- Most apps auto-sync (Settings → More → Sync Now)
- Code expires every 30 seconds, must enter quickly
- Allow ±1 time window tolerance

### Issue: Lost Backup Codes
**Solution:**
- Login with authenticator app (still works)
- Go to Settings → Regenerate Codes
- Save new codes immediately
- Can't recover old codes - only generate new

### Issue: Locked Out (Lost Phone)
**Solution:**
- Contact admin to temporarily disable 2FA
- Use backup codes if saved
- Phone must be recovered with backup codes
- No way to bypass - design feature for security

### Issue: Authenticator App Shows Different Code
**Solution:**
- Wait a few seconds for code to rotate
- Different codes generated every 30 seconds
- Codes valid for ~90 seconds (±1 step)
- Enter code immediately after reading

---

## 📈 Analytics & Monitoring

### 2FA Statistics
- Users with 2FA enabled
- Failed 2FA attempts
- Backup codes used
- 2FA setup completion rate

### Logs
```
/logs/2fa_YYYY-MM-DD.log

Examples:
[2024-08-19 10:30:00] 2FA setup initiated for user: user_123
[2024-08-19 10:35:00] 2FA enabled for user: user_123
[2024-08-19 11:00:00] 2FA required for user: user@example.com
[2024-08-19 11:01:00] User 2FA verified and logged in: user@example.com
[2024-08-19 14:22:00] Backup code used by user: user_123
```

---

## 🔄 Recovery Procedures

### If Authenticator App is Lost
1. Use any remaining backup codes to login
2. Once logged in, go to Settings
3. Regenerate new backup codes
4. Get new phone and install authenticator
5. Setup 2FA again (old secret invalid)

### If All Backup Codes Used
1. Can't login until admin intervention
2. Contact support with proof of identity
3. Admin temporarily disables 2FA
4. User logs in without 2FA
5. User sets up new 2FA with new authenticator

### If Secret is Compromised
1. Disable 2FA immediately
2. Login without 2FA (if possible)
3. Go to Settings → Disable 2FA
4. Re-enable 2FA to get new secret
5. Setup with new authenticator

---

## ✅ Best Practices

### For Users
1. **Save Backup Codes** - Store in secure location (password manager)
2. **Use Latest App** - Keep authenticator app updated
3. **Sync Time** - Ensure device time is correct
4. **One App** - Use single authenticator app (not cloud)
5. **Backup Phone** - Consider secondary authenticator setup

### For Administrators
1. **Monitor Logs** - Check 2FA logs regularly
2. **Enforce 2FA** - Consider requiring for admin accounts
3. **Recovery Process** - Have clear procedure for locked out users
4. **Updates** - Keep system updated for security patches
5. **Testing** - Test 2FA flow quarterly

### For Developers
1. **Don't Share Secrets** - Keep TOTP secrets private
2. **Secure Storage** - Store secrets encrypted in production
3. **Clock Tolerance** - Allow ±1 time window
4. **Backup Codes** - Generate truly random codes
5. **Logging** - Log all 2FA events for audit

---

## 📞 Support & Documentation

### For Users
- Enable/disable 2FA in Portal Settings
- Backup codes provided during setup
- Contact support if locked out

### For Developers
- API documentation in this guide
- Code examples for integration
- Logging in `/logs/2fa_*.log`
- Source code in `/backend/totp.php`

---

## 🎓 Security Audit Checklist

- [x] Base32 encoding verified
- [x] TOTP algorithm correct (SHA1)
- [x] Time window tolerance (±1 step)
- [x] Backup codes random generation
- [x] Backup codes one-time use
- [x] Temporary session expiry (5 min)
- [x] Permanent session expiry (24 hr)
- [x] Secret storage security
- [x] Code verification logging
- [x] QR code via HTTPS
- [x] All inputs validated
- [x] All outputs sanitized
- [x] Error messages generic
- [x] No secrets in logs

---

## 🚀 Future Enhancements

### Phase 2
- [ ] WebAuthn/FIDO2 support (hardware keys)
- [ ] Push notifications for approval
- [ ] SMS-based OTP (fallback)
- [ ] Email confirmation for 2FA changes
- [ ] Trusted devices (skip 2FA for 30 days)

### Phase 3
- [ ] Biometric authentication integration
- [ ] Duo Security integration
- [ ] Mandatory 2FA for admin accounts
- [ ] 2FA usage statistics dashboard
- [ ] Recovery codes for account recovery

---

## 📋 Implementation Checklist

### Code
- [x] TOTP generation and verification
- [x] QR code URL generation
- [x] Backup code generation
- [x] Auth.php integration
- [x] Login flow with 2FA
- [x] Session management
- [x] Error handling
- [x] Logging

### Documentation
- [x] User guide
- [x] API reference
- [x] Security notes
- [x] Troubleshooting guide
- [x] Setup instructions
- [x] Recovery procedures

### Testing
- [x] Manual TOTP verification
- [x] Backup code verification
- [x] Login flow testing
- [x] Error case testing
- [x] Security testing

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** August 19, 2026

For API details, see `/backend/totp.php` and updated `/backend/auth.php`.

