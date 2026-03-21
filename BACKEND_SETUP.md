# Backend Setup & Deployment Guide

## Overview

This guide covers setting up the Majority Hair Solutions backend for production deployment on Render.com.

## Prerequisites

- Node.js 18+ installed locally
- MongoDB Atlas account (free tier available)
- Render.com account
- GitHub repository with backend code

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
# Key packages installed:
# - express: Web server
# - mongoose: MongoDB ORM
# - bcryptjs: Password hashing
# - jsonwebtoken: JWT authentication
# - multer: File upload handling
# - stripe: Payment processing
# - axios: HTTP client for OAuth
# - nodemailer: Email sending
# - dotenv: Environment variables
```

### 2. Create Local `.env` File

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

**Critical Environment Variables for Local Testing:**

```env
MONGODB_URI=mongodb://localhost:27017/majority-hair
JWT_SECRET=dev-secret-key-change-in-production
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_CLIENT_ID=your.apps.googleusercontent.com
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. MongoDB Setup (Local Option)

**Option A: MongoDB Atlas (Recommended for Production)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user (username/password)
4. Get connection string
5. Add to `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/majority-hair
   ```

**Option B: Local MongoDB** (for development only)

```bash
# Install MongoDB Community Edition
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com

# Start MongoDB server
mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/majority-hair
```

### 4. Run Backend Locally

```bash
node server.js
# Output: ✅ Backend running on port 3001
# Or npm scripts (if added to package.json):
npm run server
```

**Test with curl:**

```bash
curl http://localhost:3001/health
# Response: { "status": "ok", "timestamp": "..." }
```

---

## Production Deployment (Render.com)

### 1. Connect GitHub Repository

```bash
# Push your code to GitHub
git add .
git commit -m "Backend: Add profile, media, and OAuth endpoints"
git push origin main
```

### 2. Create Render.com Web Service

**Steps:**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:

   | Setting | Value |
   |---------|-------|
   | **Name** | `hair-backend-2` |
   | **Environment** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | Free (or Starter if needed) |

### 3. Add Environment Variables

**In Render Dashboard:**

1. Go to Web Service → **Settings** → **Environment**
2. Add each variable from `.env`:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/majority-hair
JWT_SECRET=your-super-secret-32-char-key-change-this
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-specific-password
FRONTEND_URL=https://your-frontend.onrender.com
NODE_ENV=production
```

### 4. Deploy

1. Click **"Deploy"** button
2. Monitor logs: **Logs** tab
3. Once deployed, your backend URL is displayed (e.g., `https://hair-backend-2.onrender.com`)

### 5. Update Frontend

In [src/App.js](src/App.js), update:

```javascript
const BACKEND_URL = "https://hair-backend-2.onrender.com";
```

---

## API Testing

### Authentication Endpoints

**Signup:**
```bash
curl -X POST http://localhost:3001/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Response:**
```json
{
  "email": "test@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "rank_title": "bolshevik",
  "rank_score": 1
}
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","rememberMe":true}'
```

**Get Profile (requires auth token):**
```bash
curl -X GET http://localhost:3001/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Profile Endpoints

**Update Profile:**
```bash
curl -X PUT http://localhost:3001/api/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "perspective": {
      "box1": {"content":"Introduce yourself...","mediaUrls":[],"videoUrl":null},
      "box2": {"content":"Tell what you do...","mediaUrls":[],"videoUrl":null},
      "box3": {"content":"Beauty philosophy...","mediaUrls":[],"videoUrl":null},
      "box4": {"content":"Other ideas...","mediaUrls":[],"videoUrl":null}
    }
  }'
```

**Update Social Links:**
```bash
curl -X PUT http://localhost:3001/api/profile/social-links \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "socialLinks": {
      "instagram":"@username",
      "tiktok":"@username",
      "facebook":"facebook.com/profile"
    }
  }'
```

### Media Upload

**Upload File:**
```bash
curl -X POST http://localhost:3001/api/media/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/image.jpg"
```

---

## Common Issues & Solutions

### Issue: "Cannot find module 'multer'"

**Solution:**
```bash
npm install multer --save
```

### Issue: MongoDB Connection Fails

**Check:**
1. Connection string is correct
2. IP whitelist includes your IP (MongoDB Atlas)
3. Username/password are correct and URL-encoded if special characters

### Issue: "STRIPE_SECRET_KEY is not defined"

**Solution:**
Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_public_key_here
```

### Issue: Google OAuth Returns 401

**Check:**
1. Google OAuth token is valid
2. GOOGLE_CLIENT_ID is configured (can be blank for testing)
3. Token hasn't expired

### Issue: Render Deploy Fails

**Check Logs:**
1. Go to Render Dashboard → Web Service → Logs
2. Look for errors:
   - `Cannot find module X` → missing npm install
   - `MONGODB_URI is not defined` → missing env var
   - `Listen EADDRINUSE` → port already in use

---

## Next Steps: OAuth Implementation

### Google OAuth (Already Implemented ✅)

The `/api/auth/google` endpoint is ready. No additional setup needed beyond adding `GOOGLE_CLIENT_ID` to environment.

### Instagram OAuth (Coming Soon)

Requires:
1. [Instagram Developer Account](https://developers.instagram.com)
2. App approval from Meta
3. Implementation of OAuth 2.0 flow

### TikTok OAuth (Coming Soon)

Requires:
1. [TikTok Developer Portal](https://developers.tiktok.com)
2. App approval from TikTok
3. Implementation of OAuth 2.0 flow

---

## Next Steps: File Storage Integration

### AWS S3 Setup

```bash
npm install aws-sdk
```

Update `server.js` in `/api/media/upload`:

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Replace placeholder with actual S3 upload
const params = {
  Bucket: process.env.AWS_S3_BUCKET,
  Key: `media/${req.user._id}/${Date.now()}-${file.originalname}`,
  Body: file.buffer,
  ContentType: file.mimetype,
  ACL: 'public-read'
};

const result = await s3.upload(params).promise();
media.storageUrl = result.Location;
```

### Cloudinary Setup

```bash
npm install cloudinary
```

Update `server.js`:

```javascript
const cloudinary = require('cloudinary').v2;

const result = await cloudinary.uploader.upload_stream({
  folder: `majority-hair/${req.user._id}`,
  resource_type: 'auto'
}, (error, result) => {
  // Handle upload
}).end(file.buffer);
```

---

## Verification Checklist

- [ ] Backend deployed on Render
- [ ] Environment variables set in Render
- [ ] MongoDB Atlas cluster running
- [ ] Frontend updated with backend URL
- [ ] Test signup/login works
- [ ] Test profile endpoints return data
- [ ] Test media upload (with file size validation)
- [ ] Google OAuth receives tokens
- [ ] Email sending works (via SMTP)
- [ ] Rank progression calculates correctly

---

## Support

For issues:
1. Check Render logs
2. Check MongoDB Atlas connection
3. Test endpoints locally first
4. Review `.env` variables
5. Check GitHub Issues/Discussions
