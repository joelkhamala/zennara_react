# Startup Troubleshooting Guide

If `start-dev.bat` isn't working, use this guide to diagnose and fix the issue.

---

## 🔍 Quick Diagnosis

### Option 1: Check Windows Compatibility
Your system: **Windows** (cmd shell)

Run this in Command Prompt to verify setup:
```cmd
php --version
node --version
npm --version
dir .env.backend.example
```

If all show results, prerequisites are OK.

---

## 📋 Startup Methods (Try in Order)

### Method 1: Use PowerShell Version (Recommended)

```powershell
# Right-click PowerShell and "Run as Administrator"
# Navigate to project folder
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the PowerShell script
.\start-dev.ps1
```

**This version is more reliable on Windows**

---

### Method 2: Manual Two-Terminal Method (Easiest)

**Terminal 1: PHP Server**
```cmd
cd "C:\path\to\zennara v4"
php -S localhost:8000 -t .
```

**Terminal 2: Vite Server**
```cmd
cd "C:\path\to\zennara v4"
npm run dev
```

**This is the most reliable method** - just copy/paste the commands

---

### Method 3: Batch Script (start-dev.bat)

```cmd
# Just run it from Command Prompt
start-dev.bat
```

If you get errors, see **Fixing start-dev.bat** below.

---

## 🛠️ Common Issues & Fixes

### Issue 1: ".env.backend not found"

**Cause:** Configuration file missing

**Fix:**
```cmd
# Copy template
copy .env.backend.example .env.backend

# Edit with notepad
notepad .env.backend
```

**Update these lines:**
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ENCRYPTION_KEY=any-random-string
ADMIN_PASSWORD=choose-a-password
```

---

### Issue 2: "PHP is not recognized"

**Cause:** PHP not installed or not in PATH

**Fix:**
1. **Check if PHP is installed:**
   ```cmd
   where php
   ```

2. **If nothing shows, install PHP:**
   - Download: https://www.php.net/downloads
   - Choose "Windows downloads" → Latest
   - Extract to `C:\PHP`

3. **Add PHP to PATH:**
   - Windows key → "Environment Variables"
   - Click "Edit the system environment variables"
   - Click "Environment Variables..."
   - Under "User variables", click "New"
   - Variable name: `PATH`
   - Variable value: `C:\PHP`
   - Click OK
   - **Restart Command Prompt/PowerShell**

4. **Verify:**
   ```cmd
   php --version
   ```

---

### Issue 3: "Node.js is not recognized"

**Cause:** Node.js not installed or not in PATH

**Fix:**
1. **Check if installed:**
   ```cmd
   where node
   ```

2. **If nothing shows, install:**
   - Download: https://nodejs.org
   - Download LTS version
   - Run installer
   - Accept defaults
   - **Restart Command Prompt**

3. **Verify:**
   ```cmd
   node --version
   npm --version
   ```

---

### Issue 4: "Port 8000 already in use"

**Cause:** Another app is using port 8000

**Fix Option 1: Use Different Port**
```cmd
php -S localhost:8001 -t .
```

Then edit `vite.config.js`:
```javascript
proxy: {
  '/backend': {
    target: 'http://localhost:8001',  // Change to 8001
```

**Fix Option 2: Kill Process Using Port**
```cmd
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill it (replace PID with number from above)
taskkill /PID [PID] /F

# Try again
php -S localhost:8000 -t .
```

---

### Issue 5: "Port 3000 already in use"

**Cause:** Another Vite or dev server running

**Fix:**
```cmd
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Try again
npm run dev
```

Or use different port:
```cmd
npm run dev -- --port 3001
```

---

### Issue 6: Vite "Cannot proxy to backend"

**Cause:** PHP server not running or vite config wrong

**Fix:**
1. **Verify PHP server is running in Terminal 1**
   - Should show: `Listening on http://localhost:8000`
   - If not, start it: `php -S localhost:8000 -t .`

2. **Check vite.config.js has proxy:**
   ```javascript
   server: {
     proxy: {
       '/backend': {
         target: 'http://localhost:8000',
   ```

3. **Restart Vite:**
   - Press `Ctrl+C` in Terminal 2
   - Run: `npm run dev`

4. **Check browser console:**
   - Press F12
   - Go to "Console" tab
   - Look for error messages

---

### Issue 7: "npm: command not found"

**Cause:** npm not installed (rare if Node.js installed)

**Fix:**
```cmd
# Verify Node.js installed
node --version

# If that works but npm doesn't, reinstall Node.js
# Download latest from https://nodejs.org
```

---

### Issue 8: Email/OTP Not Working

**Cause:** SMTP credentials wrong

**Fix:**
1. **Verify .env.backend:**
   ```cmd
   notepad .env.backend
   ```

2. **Check credentials:**
   - SMTP_USER: Your full email (e.g., `user@gmail.com`)
   - SMTP_PASS: Your APP PASSWORD (not regular password!)
   - SMTP_HOST: `smtp.gmail.com`
   - SMTP_PORT: `587`

3. **Get Gmail App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy 16-character password
   - Paste into SMTP_PASS

4. **Check logs:**
   ```cmd
   type logs\otp_*.log
   ```

---

## ✅ Step-by-Step Setup

### 1. Create Configuration
```cmd
copy .env.backend.example .env.backend
notepad .env.backend
```

Update: SMTP_USER, SMTP_PASS, ENCRYPTION_KEY, ADMIN_PASSWORD  
Save & close

### 2. Terminal 1: PHP Server
```cmd
cd "C:\path\to\zennara v4"
php -S localhost:8000 -t .
```

Wait for: `Listening on http://localhost:8000`

### 3. Terminal 2: Vite Server
```cmd
cd "C:\path\to\zennara v4"
npm run dev
```

Wait for: `Local: http://localhost:3000/`

### 4. Browser Should Open
```
http://localhost:3000
```

If not, manually open it.

### 5. Test Contact Form
```
1. Go to http://localhost:3000/contact
2. Fill form with any values
3. Click "Request Proposal"
4. Check console (F12) or email for OTP
5. Enter OTP code
6. Submit
7. Check admin: http://localhost:3000/backend/admin.php
```

---

## 🔧 Advanced Troubleshooting

### View All Logs
```cmd
# See latest logs
dir logs /O-D

# View specific log
type logs\contact_2026-08-19.log
```

### Check What's Using Ports
```cmd
# Port 3000
netstat -ano | findstr :3000

# Port 8000
netstat -ano | findstr :8000

# All connections
netstat -ano
```

### Clear Data/Logs (Fresh Start)
```cmd
# Delete contact submissions
del data\contact_submissions.csv

# Delete logs
del logs\*.log

# Delete temp files
del data\.otp_sessions.json
del data\.crm_*.json
```

### Test PHP Configuration
```cmd
# Create test file
echo ^<?php phpinfo^();?^> > test.php

# Run PHP server
php -S localhost:8000 -t .

# Open http://localhost:8000/test.php in browser
```

### Test API Manually
```powershell
# Send OTP
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

---

## 📞 Getting Help

### Check Documentation
- `QUICK_MANUAL_START.md` - Manual startup
- `BACKEND_SETUP_WINDOWS.md` - Detailed setup
- `DOCUMENTATION_INDEX.md` - All docs

### Check Error Logs
```cmd
# View recent errors
dir logs /O-D
type logs\otp_*.log
type logs\contact_*.log
```

### Browser Console Errors
```
Press F12 to open developer tools
Check "Console" tab for JavaScript errors
Check "Network" tab to see API calls
```

---

## ✨ Everything Verified

If you see these, you're good:

```
✅ PHP server: "Listening on http://localhost:8000"
✅ Vite: "Local: http://localhost:3000/"
✅ Browser opens to http://localhost:3000
✅ Contact form visible at http://localhost:3000/contact
✅ Admin panel at http://localhost:3000/backend/admin.php
✅ OTP email arrives within 30 seconds
```

---

## 🎯 Quick Reference

| Issue | Command |
|-------|---------|
| Check PHP | `php --version` |
| Check Node | `node --version` |
| Check npm | `npm --version` |
| View config | `notepad .env.backend` |
| Start PHP | `php -S localhost:8000 -t .` |
| Start Vite | `npm run dev` |
| Kill port 8000 | `netstat -ano \| findstr :8000` then `taskkill /PID xxx /F` |
| View logs | `dir logs` |
| Test API | Use `QUICK_MANUAL_START.md` section |

---

**Status:** All issues covered  
**Last Updated:** August 19, 2026

If you have an issue not listed, check the logs first - they contain the actual error message.
