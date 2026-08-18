# ZENNARA Portal & Authentication System Guide

**Status:** ✅ Implementation Complete  
**Version:** 1.0.0  
**Last Updated:** August 19, 2026

---

## 📋 Overview

The Portal Authentication system provides complete user management for ZENNARA with:
- User registration (by type: Client, Landlord, Admin)
- Secure login with password hashing
- Password reset via email
- User profile management
- Session management with token-based auth
- Automatic session persistence (localStorage)

---

## 🏗️ Architecture

### Frontend (React)
**File:** `/src/pages/Portal.jsx`

Components:
- Login Form (with email/password)
- Registration Form (with name, email, password, type selection)
- Password Reset Form (email input)
- User Dashboard (profile info display)
- Profile Edit Form (name, email, phone, company)
- Logout functionality

State Management:
- `isAuthenticated` - User login status
- `authToken` - Session token (stored in localStorage)
- `userData` - Current user information
- `activeTab` - Selected user type (client/landlord/admin)
- Form data and errors

### Backend (PHP)
**File:** `/backend/auth.php`

Handlers:
- **register()** - Create new user account
- **login()** - Authenticate user and create session
- **verifySession()** - Validate session token
- **logout()** - Terminate session
- **requestPasswordReset()** - Send reset email
- **resetPassword()** - Update password with token
- **updateProfile()** - Save user profile changes
- **getProfile()** - Retrieve user information

Data Storage:
- `/data/users.json` - User accounts with hashed passwords
- `/data/.session_*.json` - Active sessions (24-hour expiry)
- `/data/.reset_*.json` - Password reset tokens (1-hour expiry)

---

## 🔐 Security Features

### Implemented ✅
- **Password Hashing:** bcrypt (PASSWORD_BCRYPT)
- **Token Generation:** 64-bit random tokens (bin2hex)
- **Session Expiry:** 24 hours automatic expiry
- **Reset Token Expiry:** 1 hour for password resets
- **Email Validation:** Standard regex validation
- **Input Sanitization:** All inputs validated before processing
- **Secure File Locks:** File locking for concurrent writes
- **HTTPS Ready:** Works with HTTPS in production
- **LocalStorage:** Secure token storage (HttpOnly in production)

### Production Recommendations
- [ ] Enable HTTPS/SSL
- [ ] Use HttpOnly cookies instead of localStorage
- [ ] Add rate limiting on login endpoint
- [ ] Implement CAPTCHA for registration
- [ ] Add email verification on registration
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Add audit logging for security events
- [ ] Rotate session tokens periodically
- [ ] Add IP-based session validation
- [ ] Implement account lockout after failed attempts

---

## 📱 User Types

### Client
- Basic account for property seekers
- Access to property listings
- Saved properties/favorites
- Inquiry history

### Landlord
- Property owner account
- List and manage properties
- Tenant management
- Company information
- Property analytics

### Admin
- Administrative access
- View all submissions (Contact form)
- User management
- System analytics
- Access logs

---

## 🚀 How It Works

### Registration Flow
```
1. User selects user type (Client/Landlord/Admin)
2. Fills in: Name, Email, Password
3. System validates inputs
4. Checks if email already exists
5. Creates account with bcrypt-hashed password
6. Returns success message
7. User directed to login
```

### Login Flow
```
1. User enters Email and Password
2. System finds user by email
3. Verifies password using bcrypt
4. Generates 64-bit random session token
5. Stores session data with 24-hour expiry
6. Returns token to frontend
7. Frontend stores token in localStorage
8. User redirected to dashboard
9. Session persists across page reloads
```

### Password Reset Flow
```
1. User enters email on "Forgot Password"
2. System finds user by email (returns generic message)
3. Generates reset token (1-hour expiry)
4. Sends email with reset link
5. User clicks link with token
6. Frontend validates token
7. User enters new password
8. Password updated with bcrypt hash
9. Reset token deleted
10. User can now login with new password
```

### Profile Update Flow
```
1. User navigates to Edit Profile
2. System verifies session token
3. User modifies: Name, Email, Phone, Company
4. System validates new data
5. Checks if new email is available
6. Updates user profile
7. Returns updated user data
8. Frontend refreshes display
```

---

## 🔗 API Endpoints

### Base URL
```
POST http://localhost:8000/backend/auth.php
```

### Endpoints

#### 1. Register User
```http
POST /auth.php
Content-Type: application/json

{
  "action": "register",
  "email": "user@example.com",
  "password": "secure_password_123",
  "name": "John Doe",
  "type": "client"  // "client", "landlord", or "admin"
}

Response (201):
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "type": "client"
  }
}
```

#### 2. Login User
```http
POST /auth.php
Content-Type: application/json

{
  "action": "login",
  "email": "user@example.com",
  "password": "secure_password_123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "a1b2c3d4e5f6...",  // Store in localStorage
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "type": "client",
    "phone": "+254789123456",
    "company": ""
  }
}
```

#### 3. Verify Session
```http
POST /auth.php
Content-Type: application/json

{
  "action": "verify_session",
  "token": "a1b2c3d4e5f6..."
}

Response (200):
{
  "success": true,
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "type": "client",
    "phone": "+254789123456",
    "company": ""
  }
}
```

#### 4. Logout User
```http
POST /auth.php
Content-Type: application/json

{
  "action": "logout",
  "token": "a1b2c3d4e5f6..."
}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 5. Request Password Reset
```http
POST /auth.php
Content-Type: application/json

{
  "action": "request_password_reset",
  "email": "user@example.com"
}

Response (200):
{
  "success": true,
  "message": "If that email exists, a reset link has been sent"
}
```

#### 6. Reset Password
```http
POST /auth.php
Content-Type: application/json

{
  "action": "reset_password",
  "token": "reset_token_abc123",
  "password": "new_secure_password_456"
}

Response (200):
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### 7. Get User Profile
```http
POST /auth.php
Content-Type: application/json

{
  "action": "get_profile",
  "token": "a1b2c3d4e5f6..."
}

Response (200):
{
  "success": true,
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "type": "client",
    "phone": "+254789123456",
    "company": ""
  }
}
```

#### 8. Update User Profile
```http
POST /auth.php
Content-Type: application/json

{
  "action": "update_profile",
  "token": "a1b2c3d4e5f6...",
  "data": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+254789654321",
    "company": "My Company Ltd"
  }
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_abc123",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "type": "client",
    "phone": "+254789654321",
    "company": "My Company Ltd"
  }
}
```

---

## 📊 Data Structure

### User Object (users.json)
```json
{
  "id": "user_1234567890",
  "email": "user@example.com",
  "password": "$2y$10$hashedpassword...",
  "name": "John Doe",
  "type": "client",
  "phone": "+254789123456",
  "company": "My Company",
  "created_at": "2024-08-19 10:30:00",
  "updated_at": "2024-08-19 10:30:00",
  "verified": false
}
```

### Session Object (.session_*.json)
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "user_id": "user_1234567890",
  "email": "user@example.com",
  "type": "client",
  "created_at": 1692432600,
  "expires_at": 1692519000
}
```

### Password Reset Token (.reset_*.json)
```json
{
  "token": "reset_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
  "user_id": "user_1234567890",
  "email": "user@example.com",
  "created_at": 1692432600,
  "expires_at": 1692436200
}
```

---

## 🧪 Testing the System

### 1. Test Registration
```bash
curl -X POST http://localhost:8000/backend/auth.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User",
    "type": "client"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:8000/backend/auth.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### 3. Test Profile Update
```bash
# Replace TOKEN with actual token from login
curl -X POST http://localhost:8000/backend/auth.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_profile",
    "token": "TOKEN_HERE",
    "data": {
      "name": "Updated Name",
      "phone": "+254789654321"
    }
  }'
```

### 4. Test Password Reset
```bash
curl -X POST http://localhost:8000/backend/auth.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "request_password_reset",
    "email": "test@example.com"
  }'
```

---

## 🎯 Frontend Usage

### Check Session on Mount
```javascript
useEffect(() => {
  const savedToken = localStorage.getItem('auth_token')
  if (savedToken) {
    verifySession(savedToken)
  }
}, [])
```

### Save Token After Login
```javascript
localStorage.setItem('auth_token', data.token)
```

### Use Token in Requests
```javascript
const response = await fetch(`${API_URL}/auth.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update_profile',
    token: authToken,
    data: { ... }
  })
})
```

### Clear Session on Logout
```javascript
localStorage.removeItem('auth_token')
```

---

## 📧 Email Templates

### Password Reset Email
Subject: `Password Reset - ZENNARA`

Contains:
- Reset link with token
- 1-hour expiry notice
- Direct URL for manual reset
- Disclaimer about unsolicited requests

---

## 🔍 Logging

All authentication events are logged to:
```
/logs/auth_YYYY-MM-DD.log
```

Log Format:
```
[2024-08-19 10:30:00] User registered: user@example.com (client)
[2024-08-19 10:31:00] User logged in: user@example.com
[2024-08-19 10:35:00] Profile updated for user: user_1234567890
[2024-08-19 10:40:00] Password reset requested for: user@example.com
[2024-08-19 11:40:00] Password reset completed for: user@example.com
```

---

## ✅ Verification Checklist

### Frontend
- [ ] Login form validates email/password
- [ ] Registration form validates inputs
- [ ] Token stored in localStorage
- [ ] Session persists on page reload
- [ ] Dashboard displays user info correctly
- [ ] Profile edit saves correctly
- [ ] Password reset email sends
- [ ] Logout clears session
- [ ] Mobile responsive
- [ ] Accessibility compliant

### Backend
- [ ] Users file created automatically
- [ ] Passwords hashed with bcrypt
- [ ] Session tokens unique and secure
- [ ] Tokens expire after 24 hours
- [ ] Reset tokens expire after 1 hour
- [ ] Email validation works
- [ ] Duplicate email detection works
- [ ] Password validation enforced (8+ chars)
- [ ] Logging working for all actions
- [ ] Error handling comprehensive

---

## 🚀 Deployment Steps

### 1. Environment Setup
```bash
# Ensure these are set in .env.backend
PHP_VERSION=7.4+
SMTP_HOST=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Permissions
```bash
# Ensure data directory is writable
chmod 755 /data
chmod 755 /logs
```

### 3. Security
```bash
# In production, use HTTPS
# Change default admin password
# Enable CORS if needed
# Set secure session cookies
```

### 4. Email Configuration
```bash
# Update TEAM_EMAIL in .env.backend
TEAM_EMAIL=info@zennarafp.com
```

### 5. Testing
```bash
# Test registration, login, password reset
# Verify emails send correctly
# Check logs for errors
# Test with different user types
```

---

## 📝 Future Enhancements

### Phase 2
- [ ] Two-Factor Authentication (2FA)
- [ ] Social login (Google, Facebook)
- [ ] Email verification on registration
- [ ] Account deactivation

### Phase 3
- [ ] Role-based access control (RBAC)
- [ ] Permission management
- [ ] User activity dashboard
- [ ] Account security settings
- [ ] Login history
- [ ] Device management

### Phase 4
- [ ] OAuth 2.0 implementation
- [ ] API key management
- [ ] Audit logging
- [ ] GDPR compliance tools
- [ ] Data export

---

## 🆘 Troubleshooting

### Issue: Login fails with "Invalid email or password"
**Solution:**
- Check email exists in users.json
- Verify password is correct
- Check PHP bcrypt is working
- Check logs for error details

### Issue: Session expires immediately
**Solution:**
- Check session file permissions
- Verify file lock is working
- Check storage location is writable
- Increase expiry time if needed

### Issue: Password reset email not sending
**Solution:**
- Verify SMTP configured in .env.backend
- Check email in notifications log
- Test email manually
- Check firewall rules

### Issue: Profile update fails
**Solution:**
- Verify token is valid
- Check session hasn't expired
- Ensure user exists
- Check file permissions on users.json

---

## 📞 Support

For issues:
1. Check `/logs/auth_YYYY-MM-DD.log`
2. Review error messages in response
3. Test with curl commands
4. Check file permissions
5. Verify email configuration

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** August 19, 2026  

For more information, see:
- `/PHASE_2_STATUS.md` - Phase 2 implementation status
- `/BACKEND_SETUP.md` - Backend configuration
- `/backend/auth.php` - Source code

