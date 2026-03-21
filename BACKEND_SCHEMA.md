# Backend Database Schema & API Endpoints

## 1. User Collection/Table

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed bcrypt),
  rank_title: String,              // e.g., "General Secretary", "bolshevik"
  rank_score: Number,              // Battle points (default: 1)
  createdAt: Date,
  updatedAt: Date,
  
  // Profile Data
  perspective: {
    box1: {
      content: String,             // User's text response
      mediaUrls: [String],         // URLs to stored images
      videoUrl: String,            // URL to stored video
      updatedAt: Date
    },
    box2: { content, mediaUrls, videoUrl, updatedAt },
    box3: { content, mediaUrls, videoUrl, updatedAt },
    box4: { content, mediaUrls, videoUrl, updatedAt }
  },
  
  // Social Media Connections
  socialLinks: {
    instagram: String,             // @username
    tiktok: String,                // @username
    facebook: String,              // Full profile URL or username
    updatedAt: Date
  },
  
  // OAuth Provider Data
  oauthProviders: {
    google: {
      id: String,
      accessToken: String,
      refreshToken: String,
      expiresAt: Date
    },
    instagram: {
      id: String,
      accessToken: String,
      refreshToken: String,
      expiresAt: Date
    },
    tiktok: {
      id: String,
      accessToken: String,
      refreshToken: String,
      expiresAt: Date
    }
  },
  
  // Remember Me & Session
  rememberMe: Boolean,
  lastLoginAt: Date,
  ipAddress: String
}
```

---

## 2. Media Collection/Table

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  filename: String,
  originalName: String,
  mimetype: String,                // image/jpeg, video/mp4, etc.
  size: Number,                    // Bytes
  
  // Storage Info
  storageUrl: String,              // S3/Cloudinary URL
  s3Key: String,                   // AWS S3 key path
  cdnUrl: String,                  // Cloudinary CDN URL
  
  // Media Type
  type: String,                    // 'image' or 'video'
  duration: Number,                // Video duration in seconds
  dimensions: {                    // For images
    width: Number,
    height: Number
  },
  
  // Timestamps
  uploadedAt: Date,
  expiresAt: Date                  // Optional: auto-delete after X days
}
```

---

## 3. API Endpoints

### **Authentication**

#### POST `/api/signup`
```json
Request: { email, password }
Response: { email, token, rank_title, rank_score, _id }
```

#### POST `/api/login`
```json
Request: { email, password, rememberMe }
Response: { email, token, rank_title, rank_score, _id }
```

#### POST `/api/auth/google`
```json
Request: { accessToken }
Response: { email, token, rank_title, rank_score, _id, socialLinks, perspective }
```

#### POST `/api/auth/instagram`
```json
Request: { accessToken }
Response: { email, token, rank_title, rank_score, _id, socialLinks, perspective }
```

#### POST `/api/auth/tiktok`
```json
Request: { accessToken }
Response: { email, token, rank_title, rank_score, _id, socialLinks, perspective }
```

#### GET `/api/auth/me`
```json
Headers: { Authorization: "Bearer {token}" }
Response: { email, rank_title, rank_score, _id, perspective, socialLinks }
```

---

### **Profile Management**

#### GET `/api/profile`
```json
Headers: { Authorization: "Bearer {token}" }
Response: {
  email,
  rank_title,
  rank_score,
  perspective: { box1, box2, box3, box4 },
  socialLinks: { instagram, tiktok, facebook }
}
```

#### PUT `/api/profile`
```json
Headers: { Authorization: "Bearer {token}" }
Request: {
  perspective: {
    box1: { content, mediaUrls, videoUrl },
    box2: { content, mediaUrls, videoUrl },
    box3: { content, mediaUrls, videoUrl },
    box4: { content, mediaUrls, videoUrl }
  }
}
Response: { success: true, message: "Profile updated" }
```

#### PUT `/api/profile/social-links`
```json
Headers: { Authorization: "Bearer {token}" }
Request: {
  socialLinks: {
    instagram: "username",
    tiktok: "username",
    facebook: "facebook.com/profile"
  }
}
Response: { success: true, message: "Social links updated" }
```

---

### **Media Upload**

#### POST `/api/media/upload`
```
Headers: { Authorization: "Bearer {token}", Content-Type: "multipart/form-data" }
Body: { file: <binary>, boxKey: "box1" } // Optional boxKey for direct box upload

Validation:
- Images: Max 5MB, Accept: JPG, PNG, WEBP
- Videos: Max 50MB, Accept: MP4, WebM, 60s max duration

Response: {
  _id,
  filename,
  storageUrl,
  type: "image" | "video",
  size,
  uploadedAt
}
```

#### DELETE `/api/media/{mediaId}`
```json
Headers: { Authorization: "Bearer {token}" }
Response: { success: true, message: "Media deleted" }
```

#### POST `/api/media/get-upload-url`
```json
Headers: { Authorization: "Bearer {token}" }
Request: { filename, mimetype }
Response: {
  uploadUrl: "https://...",      // For client-side direct upload
  mediaId: "...",
  expiresIn: 3600
}
```

---

## 4. File Storage Setup

### **Option A: AWS S3**
```
Bucket: majority-hair-media
Region: us-east-1
Folder Structure:
  /users/{userId}/images/
  /users/{userId}/videos/
Lifecycle: Delete after 90 days (configurable)
```

### **Option B: Cloudinary**
```
Folder: /majority-hair/{userId}/
Transformations:
  - Images: Auto-optimize, max-width 1200px
  - Videos: Auto-transcode to MP4/WebM, max 60s
CORS: { allow_unsigned: false }
```

---

## 5. Rank Progression Logic

```javascript
// Server-side rank calculation (immutable)
const RANK_TIERS = [
  { title: "General Secretary",      min: 8500001 },
  { title: "Premier",                min: 7000001 },
  { title: "Head of State",          min: 5500001 },
  { title: "Politburo",              min: 4000001 },
  // ... 36 more tiers ...
  { title: "bolshevik",              min: 1 }
];

function getRankTitle(score) {
  for (const tier of RANK_TIERS) {
    if (score >= tier.min) return tier.title;
  }
  return "bolshevik";
}

function getPointsToNextRank(currentScore, currentRankTitle) {
  const currentIndex = RANK_TIERS.findIndex(r => r.title === currentRankTitle);
  if (currentIndex === 0) return 0; // Already at top
  const nextRank = RANK_TIERS[currentIndex - 1];
  return Math.max(0, nextRank.min - currentScore);
}

// Award points on actions (backend only)
// - Video upload: +200 points
// - Profile update: +50 points
// - Purchase: +100 points per item
// - Recommendation accepted: +500 points
```

---

## 6. Security & Validation

### **Input Validation**
```
- Email: RFC 5322 format (trimmed, lowercased)
- Password: Min 8 chars, alphanumeric + special
- Text fields: Max 2000 chars, no script tags
- File uploads: MIME type + magic byte validation
```

### **Authentication**
```
- Passwords: bcrypt (salt rounds: 12)
- Tokens: JWT { email, userId, rank, iat, exp: "7d" }
- Rate limit: POST /login (5 attempts/15min)
- OAuth: Refresh tokens rotated on use
```

### **File Security**
```
- Signed URLs expire after 1 hour
- Direct S3 bucket access: Restricted to signed URLs
- Virus scan: ClamAV on upload (optional)
- Max file size enforced on server
```

---

## 7. Database Indexes

```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ rank_score: -1 });
db.users.createIndex({ createdAt: -1 });

db.media.createIndex({ userId: 1, uploadedAt: -1 });
db.media.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## 8. Example Node.js/Express Implementation Skeleton

```javascript
const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
const app = express();

// Middleware
app.use(express.json());
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 52428800 } // 50MB
});
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  // Save to DB
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ email, token, rank_title: 'bolshevik', rank_score: 1 });
});

app.post('/api/media/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const { file } = req;
  // Validate file
  // Upload to S3
  // Save to DB
  res.json({ _id: '...', storageUrl: '...', type: 'image' });
});

app.put('/api/profile', authMiddleware, async (req, res) => {
  const { perspective } = req.body;
  // Validate & save
  res.json({ success: true });
});

module.exports = app;
```

---

## 9. Environment Variables (.env.example)

```
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/majority-hair

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=majority-hair-media

# Cloudinary (alternative)
CLOUDINARY_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# OAuth Providers
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
INSTAGRAM_APP_ID=xxx
INSTAGRAM_APP_SECRET=xxx
TIKTOK_CLIENT_KEY=xxx
TIKTOK_CLIENT_SECRET=xxx

# Server
PORT=3001
NODE_ENV=production
```

---

## Next Steps for Backend Developer

1. Set up MongoDB Atlas or PostgreSQL
2. Implement user signup/login with bcrypt
3. Add JWT token generation & validation
4. Integrate AWS S3 or Cloudinary
5. Create OAuth flows (Google/Instagram/TikTok)
6. Implement profile update endpoints
7. Add file upload validation & virus scanning
8. Deploy to Render as separate service
9. Configure CORS for frontend domain
10. Set up error logging (Sentry/LogRocket)
