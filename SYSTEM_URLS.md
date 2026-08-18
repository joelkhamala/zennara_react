# ZENNARA System - Complete URL Reference

## 🚀 Quick Access Guide

### Frontend URLs (React)
```
Main Site:           http://localhost:3000
Home:                http://localhost:3000/
Properties:          http://localhost:3000/properties
Listings:            http://localhost:3000/properties (same interface)
Portal (Login):      http://localhost:3000/portal
Contact Form:        http://localhost:3000/contact
Advisory:            http://localhost:3000/advisory
Projects:            http://localhost:3000/projects
Property Details:    http://localhost:3000/property/:id
SecureRent:          http://localhost:3000/securerent
Facility Mgmt:       http://localhost:3000/facility-management
```

### Backend URLs (PHP)
```
Contact Processor:   http://localhost:8000/backend/submit.php
Test Interface:      http://localhost:8000/backend/test.php
Logs Viewer:         http://localhost:8000/backend/logs.php
Admin Dashboard:     http://localhost:8000/backend/admin.php
Analytics:           http://localhost:8000/backend/analytics.php
```

---

## 📱 Frontend URLs

### Main Pages
| Page | URL | Purpose |
|------|-----|---------|
| Home | `http://localhost:3000/` | Landing page |
| Properties | `http://localhost:3000/properties` | Browse properties with filters |
| Portal | `http://localhost:3000/portal` | Client/Landlord/Admin login tabs |
| Contact | `http://localhost:3000/contact` | Contact form with OTP |
| Advisory | `http://localhost:3000/advisory` | Real estate advisory |
| Projects | `http://localhost:3000/projects` | Development projects |
| SecureRent | `http://localhost:3000/securerent` | SecureRent program info |
| Facility Mgmt | `http://localhost:3000/facility-management` | Facility management info |

### Dynamic Routes
| Route | Example | Purpose |
|-------|---------|---------|
| Property Details | `http://localhost:3000/property/1` | Single property view |
| Product Details | `http://localhost:3000/product/:id` | Product view |
| Blog Post | `http://localhost:3000/blog/:id` | Blog article |

---

## 🔧 Backend URLs

### Contact Form Processing
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/backend/submit.php` | POST | Main form handler |
| Action: `send_otp` | POST | Send OTP to email/SMS |
| Action: `verify_otp` | POST | Verify OTP code |
| Action: `submit_form` | POST | Save form data |

### Request Example
```bash
curl -X POST http://localhost:8000/backend/submit.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_otp",
    "email": "user@example.com",
    "method": "email"
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "session_id": "abc123...",
    "method": "email",
    "message": "OTP sent successfully"
  }
}
```

---

## 📊 Admin & Monitoring URLs

### Admin Dashboard
```
URL: http://localhost:8000/backend/admin.php
Authentication: Yes (password required)
Default Password: admin123
Change via: ADMIN_PASSWORD environment variable
```

**Features:**
- View all submissions (paginated, 20 per page)
- Delete submissions
- Export CSV
- View statistics
- Quick links to analytics & logs

### Logs Viewer
```
URL: http://localhost:8000/backend/logs.php
Authentication: No (direct access)
Streams: Contact, OTP, Storage
Real-time viewing: Yes
```

**Features:**
- Real-time log monitoring
- 3 separate log streams
- System status checker
- Statistics dashboard
- Log download

### Analytics Dashboard
```
URL: http://localhost:8000/backend/analytics.php
Direct Access: Yes
From Admin: Click "View Analytics" button
```

**Features:**
- Key metrics (total, verified, rate)
- Interactive charts
- Submissions by date, interest, hour
- Verification status pie chart
- Top categories table
- Recent activity table

### Test Interface
```
URL: http://localhost:8000/backend/test.php
Purpose: System diagnostics and testing
Features: API testing, CSV inspection, log viewing
```

---

## 🔐 Authentication

### Admin Panel
```
URL: http://localhost:8000/backend/admin.php
Username: N/A (password only)
Password: admin123 (default)
Session: Cookie-based
Expiry: Until logout or session end
```

### Portal Login (Frontend)
```
URL: http://localhost:3000/portal
Tabs: Client, Landlord, Admin
Demo Mode: Form accepts any credentials
Production: Requires backend authentication
```

---

## 📝 Configuration URLs

### Environment Files
```
Frontend Config:  /vite.config.js
Backend Config:   /backend/config.php
Env Variables:    /.env.backend (create from .env.backend.example)
```

### Key Environment Variables
```env
VITE_API_URL=http://localhost:8000/backend
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
ADMIN_PASSWORD=admin123
```

---

## 🧪 Testing URLs

### Form Testing
```
Contact Form:      http://localhost:3000/contact
Fill form → Send OTP → Enter code → Submit
Check admin: http://localhost:8000/backend/admin.php
```

### Backend Testing
```
Test Suite:        http://localhost:8000/backend/test.php
Tests System Requirements
Tests Configuration
Tests API Endpoints
Tests CSV Storage
Tests Log Viewer
```

### Analytics Testing
```
Check Analytics:   http://localhost:8000/backend/analytics.php
View submission trends
Check verification rates
Review engagement metrics
```

---

## 📡 API Endpoints Reference

### OTP Operations
```
Send OTP:
  POST /backend/submit.php
  Body: {"action": "send_otp", "email": "user@example.com"}

Verify OTP:
  POST /backend/submit.php
  Body: {"action": "verify_otp", "session_id": "...", "otp_code": "123456"}

Submit Form:
  POST /backend/submit.php
  Body: {"action": "submit_form", "name": "John", "email": "john@example.com", ...}
```

### Response Codes
```
200 OK           - Success
400 Bad Request  - Invalid input
405 Not Allowed  - Wrong HTTP method
429 Too Many     - Rate limit exceeded
500 Error        - Server error
```

---

## 📂 Data Access URLs

### CSV Data
```
File Location:     /data/contact_submissions.csv
Download From:     Admin Dashboard → Export CSV button
Format:            CSV (Excel compatible)
Permissions:       644 (restricted)
```

### Logs Access
```
Location:          /logs/
Files:
  - contact_YYYY-MM-DD.log      (submissions)
  - otp_YYYY-MM-DD.log          (OTP operations)
  - storage_YYYY-MM-DD.log      (storage events)
View From:         http://localhost:8000/backend/logs.php
```

### Backups
```
Location:          /data/backups/
Daily Backups:     contact_submissions.csv.YYYY-MM-DD.bak
Retention:         30 days
Download From:     Manual via file system
```

---

## 🛠️ Development URLs

### Source Code Locations
```
Frontend:
  /src/pages/Contact.jsx
  /src/pages/Portal.jsx
  /src/pages/*.jsx (all pages)

Backend:
  /backend/submit.php (main handler)
  /backend/admin.php (dashboard)
  /backend/analytics.php (analytics)
  /backend/logs.php (logs viewer)
  /backend/config.php (configuration)

Data:
  /data/contact_submissions.csv (submissions)
  /logs/ (activity logs)
```

### Documentation URLs
```
Setup Guide:       /BACKEND_SETUP.md
Quick Reference:   /QUICK_REFERENCE.md
Backend Docs:      /backend/README.md
Roadmap:           /ADVANCED_FEATURES_ROADMAP.md
Completion Status: /PHASE_1_COMPLETION.md
System URLs:       /SYSTEM_URLS.md (this file)
```

---

## 🚀 Server Commands

### Start React Development Server
```bash
npm run dev
# Runs at: http://localhost:5173 (default)
# Or:      http://localhost:3000 (if configured)
```

### Start PHP Server
```bash
php -S localhost:8000 -t .
# Serves files from: http://localhost:8000
# Backend accessible at: http://localhost:8000/backend/
```

### Run Both Servers
```bash
# Terminal 1: React
npm run dev

# Terminal 2: PHP
php -S localhost:8000 -t .

# Then access: http://localhost:3000
```

---

## 📋 Common Tasks & URLs

### Task: View Form Submissions
```
1. Open: http://localhost:8000/backend/admin.php
2. Login with password: admin123
3. View submissions in table
4. Click "Delete" to remove submission
5. Click "⬇️ Export CSV" to download
```

### Task: Monitor Activity
```
1. Open: http://localhost:8000/backend/logs.php
2. View three log streams:
   - Contact submissions
   - OTP operations
   - Storage events
3. Click "🔄 Refresh" for latest logs
4. Click "⬇️ Download Logs" to save
```

### Task: Check Analytics
```
1. Open: http://localhost:8000/backend/admin.php
2. Login with password: admin123
3. Click "📊 View Analytics"
4. See interactive charts and statistics
5. View trends and metrics
```

### Task: Test Contact Form
```
1. Open: http://localhost:3000/contact
2. Fill form (name, email, message)
3. Click "Request Proposal"
4. Check email for OTP code
5. Enter code and submit
6. View in admin panel
```

### Task: Check System Status
```
1. Open: http://localhost:8000/backend/test.php
2. See system requirements check
3. See configuration validation
4. Test API endpoints
5. View CSV inspection
```

---

## 🔍 Troubleshooting URLs

### If Contact Form Not Working
```
Check: http://localhost:8000/backend/test.php
Check: http://localhost:8000/backend/logs.php
Check: /logs/contact_YYYY-MM-DD.log (file system)
```

### If Admin Not Accessible
```
Check: http://localhost:8000/backend/admin.php
Verify password (default: admin123)
Check: /logs/contact_YYYY-MM-DD.log for errors
```

### If OTP Not Sending
```
Check: http://localhost:8000/backend/test.php (configuration)
View: http://localhost:8000/backend/logs.php (OTP logs)
Verify: SMTP credentials in .env.backend
```

### If CSV Not Saving
```
Check: http://localhost:8000/backend/test.php (permissions)
View: http://localhost:8000/backend/logs.php (storage logs)
Verify: /data directory exists and writable
```

---

## 📊 Monitoring Dashboard

### All-in-One Monitoring
```
Admin Dashboard:     http://localhost:8000/backend/admin.php
├── Statistics      (total, verified, by interest)
├── Submissions     (paginated table)
├── View Analytics  (click button)
└── View Logs       (click button)

Analytics:          http://localhost:8000/backend/analytics.php
├── Key Metrics     (charts, statistics)
├── Trends          (by date, hour, interest)
└── Details         (tables, breakdowns)

Logs:               http://localhost:8000/backend/logs.php
├── Contact Log     (submissions)
├── OTP Log         (verifications)
└── Storage Log     (errors, backups)
```

---

## ✅ URL Checklist

Frontend URLs
- [ ] http://localhost:3000 (home)
- [ ] http://localhost:3000/contact (contact form)
- [ ] http://localhost:3000/portal (login)
- [ ] http://localhost:3000/properties (listings)

Backend URLs
- [ ] http://localhost:8000/backend/admin.php (admin)
- [ ] http://localhost:8000/backend/analytics.php (analytics)
- [ ] http://localhost:8000/backend/logs.php (logs)
- [ ] http://localhost:8000/backend/test.php (test)

---

## 🎯 Quick Links

**For Users:**
- Contact Form: http://localhost:3000/contact
- Portal Login: http://localhost:3000/portal

**For Admins:**
- Admin Dashboard: http://localhost:8000/backend/admin.php (password: admin123)
- Analytics: http://localhost:8000/backend/analytics.php
- Logs: http://localhost:8000/backend/logs.php

**For Developers:**
- Test Suite: http://localhost:8000/backend/test.php
- Documentation: /BACKEND_SETUP.md, /QUICK_REFERENCE.md

---

**Last Updated:** 2024  
**Version:** 2.0.0  
**Status:** Complete Reference  

Bookmark this page for quick access to all system URLs!
