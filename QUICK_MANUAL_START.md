# Manual Startup (If start-dev.bat doesn't work)

## Step 1: Setup Configuration (One-time)

```cmd
# Copy environment template
copy .env.backend.example .env.backend

# Edit with your credentials
notepad .env.backend
```

**Update these 3 lines in `.env.backend`:**
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password      # Get from Gmail
ENCRYPTION_KEY=random-string
```

### Get Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"  
3. Copy the 16-char password
4. Paste into SMTP_PASS

---

## Step 2: Terminal 1 - Start PHP Server

```cmd
# Open PowerShell or Command Prompt
# Navigate to project folder
cd "C:\path\to\zennara v4"

# Start PHP server
php -S localhost:8000 -t .
```

**You should see:**
```
[Wed Aug 19 10:30:00 2026] PHP 8.1.x Development Server started
[Wed Aug 19 10:30:00 2026] Listening on http://localhost:8000
```

✅ **Leave this running**

---

## Step 3: Terminal 2 - Start Vite Server

```cmd
# Open NEW PowerShell/Command Prompt
# Navigate to same folder
cd "C:\path\to\zennara v4"

# Start dev server
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

✅ **Browser should open automatically**

---

## Step 4: Test the System

### Test Contact Form
1. Go to http://localhost:3000/contact
2. Fill out form
3. Click "Request Proposal"
4. Enter OTP code (check browser console or email)
5. Submit

### Test Admin Dashboard
1. Go to http://localhost:3000/backend/admin.php
2. Login (password from your `.env.backend`)
3. View submissions

### Test Analytics
1. Go to http://localhost:3000/backend/analytics.php
2. View charts and metrics

---

## 🔑 Key URLs

```
Frontend:        http://localhost:3000
Contact Form:    http://localhost:3000/contact
Admin Panel:     http://localhost:3000/backend/admin.php
Analytics:       http://localhost:3000/backend/analytics.php
Direct PHP:      http://localhost:8000
```

---

## ❌ Troubleshooting

### Terminal 1: PHP Server Issues

**Error: "PHP is not recognized"**
```
Solution: PHP not in PATH
1. Install PHP from https://www.php.net/downloads
2. Add PHP folder to Windows PATH
3. Restart terminal and try again
```

**Error: "Address already in use"**
```
Solution: Port 8000 taken
Use different port:
  php -S localhost:8001 -t .

Then update vite.config.js proxy:
  target: 'http://localhost:8001',
```

### Terminal 2: Vite Server Issues

**Error: "npm: command not found"**
```
Solution: Node.js not installed
1. Install from https://nodejs.org
2. Restart terminal
3. Run: npm run dev
```

**Error: "Port 3000 already in use"**
```
Solution: Different port or kill process
Method 1: Different port
  npm run dev -- --port 3001

Method 2: Kill process using port 3000
  netstat -ano | findstr :3000
  taskkill /PID [PID] /F
```

**Vite not connecting to backend**
```
Solution:
1. Make sure PHP server is running (Terminal 1)
2. Make sure port 8000 is correct
3. Check vite.config.js proxy settings
4. Restart Vite: Ctrl+C, then npm run dev
5. Check browser console (F12) for errors
```

### Email Not Working

**OTP not sending**
```
Check:
1. .env.backend SMTP credentials
2. Gmail has 2FA enabled
3. Using app password (not regular password)
4. View logs: logs/otp_*.log
```

---

## ✅ Checklist Before Starting

- [ ] PHP installed (`php --version` works)
- [ ] Node.js installed (`node --version` works)
- [ ] npm installed (`npm --version` works)
- [ ] .env.backend created and configured
- [ ] Gmail app password obtained
- [ ] Two terminal windows ready

---

## 🎯 What's Working

✅ Contact form submission  
✅ OTP via email  
✅ Admin dashboard  
✅ Analytics  
✅ Data storage  
✅ User authentication (backend)  
✅ CRM integration  

**Everything is ready to use!**

---

## 📊 Expected Times

- Setup: 5 minutes
- PHP server start: 2 seconds
- Vite dev server start: 15-30 seconds
- First page load: 3-5 seconds
- Subsequent loads: 1-2 seconds

---

## 💾 File Locations

```
Project Root: C:\path\to\zennara v4\
├── .env.backend           ← Your config (created from example)
├── vite.config.js        ← Frontend config
├── backend/              ← PHP files (13 total)
│   ├── submit.php        ← Main API
│   ├── admin.php         ← Dashboard
│   ├── analytics.php     ← Charts
│   └── ... (more files)
├── src/                  ← React code
│   ├── pages/Contact.jsx ← Contact form
│   └── ...
├── data/                 ← Auto-created
│   ├── contact_submissions.csv
│   └── backups/
└── logs/                 ← Auto-created
    └── *.log
```

---

**Status:** ✅ Ready to Run

All systems are ready. Just follow the 4 steps above!
