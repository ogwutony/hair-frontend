const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const axios = require('axios');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// ============================================================
// TOKEN ENCRYPTION HELPERS
// ============================================================
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : require('crypto').randomBytes(32);
const ENC_ALGO = 'aes-256-gcm';

function encryptToken(text) {
    const iv = require('crypto').randomBytes(16);
    const cipher = require('crypto').createCipheriv(ENC_ALGO, ENCRYPTION_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptToken(encryptedStr) {
    const [ivHex, authTagHex, dataHex] = encryptedStr.split(':');
    const decipher = require('crypto').createDecipheriv(ENC_ALGO, ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
}

// Validate critical environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️ WARNING: STRIPE_SECRET_KEY is not defined in .env");
}

// Cloudinary Configuration
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log("✅ Cloudinary configured");
} else {
  console.warn("⚠️ WARNING: Cloudinary credentials missing (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)");
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Middleware
app.use(express.json());

// CORS Configuration - Allows multiple origins
const allowedOrigins = [
  'https://themajorities.com', // ADD THIS LINE
  'https://www.themajorities.com', // ADD THIS LINE
  'https://majorityhairsolutions.com',
  'https://www.majorityhairsolutions.com',
  'https://majority-hair-frontend.vercel.app',
  'https://majority-hair.vercel.app',
  'http://localhost:3000'
];

// Pattern to allow any Vercel preview deployment URL for this project
const vercelPreviewPattern = /^https:\/\/majority-hair-frontend-[a-z0-9-]+\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1 && !vercelPreviewPattern.test(origin)) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Required if you are sending cookies or Authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 52428800 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// --- DATABASE ---
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ DB Error:", err.message));
} else {
  console.error("❌ Error: MONGODB_URI is missing from environment variables.");
}

// --- RANK TIER SYSTEM (10-Million Scale) ---
const RANK_TIERS = [
  { title: "General Secretary",           min: 8500001, max: 10000000 },
  { title: "Premier",                     min: 7000001, max: 8500000  },
  { title: "Head of State",               min: 5500001, max: 7000000  },
  { title: "Politburo",                   min: 4000001, max: 5500000  },
  { title: "Party National",              min: 2500001, max: 4000000  },
  { title: "Central committee",           min: 1000001, max: 2500000  },
  { title: "Councils of ministers",       min: 500001,  max: 1000000  },
  { title: "Supreme soviets",             min: 250000,  max: 500000   },
  { title: "Republican Party committeemen", min: 160000, max: 249999  },
  { title: "Regional party head",         min: 80000,   max: 159999   },
  { title: "City Party Head",             min: 40000,   max: 79999    },
  { title: "District Party head",         min: 20000,   max: 39999    },
  { title: "District Soviet",             min: 10000,   max: 19999    },
  { title: "Executive",                   min: 5000,    max: 9999     },
  { title: "Department head",             min: 2500,    max: 4999     },
  { title: "enterprises",                 min: 2000,    max: 2499     },
  { title: "Executive",                   min: 1500,    max: 1999     },
  { title: "Department head",             min: 1250,    max: 1499     },
  { title: "enterprises",                 min: 1000,    max: 1249     },
  { title: "Partymember",                 min: 800,     max: 999      },
  { title: "bold carp",                   min: 500,     max: 799      },
  { title: "crucian carp",                min: 250,     max: 499      },
  { title: "elephants",                   min: 160,     max: 249      },
  { title: "Small elephants",             min: 80,      max: 159      },
  { title: "godok",                       min: 40,      max: 79       },
  { title: "podgodok",                    min: 20,      max: 39       },
  { title: "one-and-a-half",              min: 10,      max: 19       },
  { title: "bolshevik",                   min: 1,       max: 9        },
];

const POLITBURO_MIN = 4000001; // Politburo rank minimum score

const getRankTitle = (score) => {
  for (const tier of RANK_TIERS) {
    if (score >= tier.min) return tier.title;
  }
  return "bolshevik";
};

const getRankRange = (title) => {
  const tier = RANK_TIERS.find(t => t.title === title);
  if (!tier) return "1 - 9";
  return `${tier.min.toLocaleString()} - ${tier.max.toLocaleString()}`;
};

const isPolitburoOrHigher = (score) => score >= POLITBURO_MIN;

// --- MongoDB Models API Integration ---
const MONGODB_MODELS_API_KEY = process.env.MONGODB_MODELS_API_KEY;
const MONGODB_MODELS_BASE_URL = 'https://api.mongodb.com/app/data/v1';

if (MONGODB_MODELS_API_KEY) {
  console.log("✅ MongoDB Models API Key configured");
} else {
  console.warn("⚠️ WARNING: MONGODB_MODELS_API_KEY is not defined in environment variables");
}

// Initialize MongoDB Models API client
const mongoDBModelsClient = {
  async callModel(modelId, inputs) {
    if (!MONGODB_MODELS_API_KEY) {
      throw new Error('MongoDB Models API Key not configured');
    }
    tr  try {
      const response = await axios.post(`${MONGODB_MODELS_BASE_URL}/models/${modelId}/infer`, 
        { inputs },
        {
          headers: {
            'Authorization': `Bearer ${MONGODB_MODELS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('MongoDB Models API Error:', error.response?.data || error.message);
      throw new Error('Failed to call MongoDB Model: ' + error.message);
    }
  },

  // Helper: Generate hair care recommendation based on user profile
  async generateRecommendation(userProfile) {
    tr  try {
      // This endpoint uses a model that analyzes hair type, needs, preferences
      const response = await axios.post(
        `${MONGODB_MODELS_BASE_URL}/models/hair-recommendation/infer`,
        {
          inputs: {
            hairType: userProfile.hairType || 'unspecified',
            concerns: userProfile.concerns || [],
            preferredIngredients: userProfile.preferredIngredients || [],
            budget: userProfile.budget || 'moderate'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${MONGODB_MODELS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Recommendation API Error:', error.message);
      throw error;
    }
  }
};

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  email:            { type: String, required: true, unique: true },
  password:         { type: String },
  googleId:         { type: String },
  resetToken:       { type: String },
  resetTokenExpiry: { type: Date },
  rank_score:       { type: Number, default: 1 },   // BigInt-scale (up to 10,000,000)
  rank_title:       { type: String, default: 'bolshevik' },
  rank_rewards_sent: { type: [String], default: [] }, // Track which ranks already rewarded
  avatarUrl:        { type: String, default: null },  // Profile picture URL (Cloudinary)
  
  // Profile perspectives (4-box layout)
  perspective: {
    box1: { content: String, mediaUrls: [String], videoUrl: String, updatedAt: Date },
    box2: { content: String, mediaUrls: [String], videoUrl: String, updatedAt: Date },
    box3: { content: String, mediaUrls: [String], videoUrl: String, updatedAt: Date },
    box4: { content: String, mediaUrls: [String], videoUrl: String, updatedAt: Date },
  },
  
  // Social media links
  socialLinks: {
    instagram: String,
    tiktok: String,
    facebook: String,
    updatedAt: Date
  },
    // OAuth tokens for social publishing (encrypted)
    oauthProviders: {
          instagram: {
                  id:          { type: String },
                  accessToken: { type: String },
                  expiresAt:   { type: Date }
          },
      tiktok: {
              id:          { type: String },
              accessToken: { type: String },h
              expiresAt:   { type: Date }
      }
});
const User = mongoose.model('User', userSchema);

const Order = mongoose.model('Order', new mongoose.Schema({
  userEmail:             { type: String, required: true },
  items:                 { type: Object, required: true },
  totalPrice:            { type: Number, required: true },
  status:                { type: String, default: 'Pending' },
  stripePaymentIntentId: String,
  createdAt:             { type: Date, default: Date.now }
}));

// Duma (formerly Legislature) submissions
const DumaItem = mongoose.model('DumaItem', new mongoose.Schema({
  type:       { type: String, required: true }, // "Recommendation" | "Partner"
  company:    String,
  product:    String,
  name:       String,
  prompt:     String,
  response:   String,
  category:   String,
  section:    String,
  mediaUrl:   String,
  mediaType:  String,
  reason:     String,
  desc:       String,
  submittedBy: String,
  submitterRank: String,
  votes:      { yes: { type: Number, default: 0 }, no: { type: Number, default: 0 }, abstain: { type: Number, default: 0 } },
  createdAt:  { type: Date, default: Date.now }
}));

// Media uploads
const Media = mongoose.model('Media', new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename:    String,
  originalName: String,
  mimetype:    String,
  size:        Number,
  storageUrl:  String,
  s3Key:       String,
  type:        { type: String, enum: ['image', 'video'] },
  duration:    Number,
  uploadedAt:  { type: Date, default: Date.now },
  expiresAt:   Date
}));

// --- HELPERS ---
const JWT_SECRET = process.env.JWT_SECRET || 'majority-hair-default-secret-change-me';

const generateToken = (userId, rememberMe = false) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '24h'
  });
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  tr  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials missing.");
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: `"Majority Hair Solutions" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

// Send rank-up reward email (once per rank)
const sendRankUpEmail = async (user, newRankTitle) => {
  if (user.rank_rewards_sent.includes(newRankTitle)) return; // Prevent double-dip

  const range = getRankRange(newRankTitle);
  const shopUrl = process.env.FRONTEND_URL || 'https://majorityhairsolutions.com';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px;">
      <h1 style="color: #222;">Congratulations on your promotion to <strong>${newRankTitle}</strong>! 🎊</h1>
      <p>You've reached a new level of influence at Majority Hair Solutions!</p>
      <p>Your dedication has officially earned you the rank of <strong>${newRankTitle}</strong>. 
         You are now part of the elite group within the <strong>${range}</strong> point bracket.</p>
      <p>As a reward for your contribution to the total solution, please enjoy <strong>25% OFF</strong> your next one-time order.</p>
      <p style="font-size: 18px;"><strong>Your Unique Reward Code: <span style="color: #c00;">MAJORITY25</span></strong></p>
      <a href="${shopUrl}" style="display:inline-block; background:#222; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; margin-top:10px;">Redeem My 25% Discount</a>
      <p style="margin-top:30px; color:#666;">Keep climbing — the path to <strong>General Secretary</strong> is waiting for you.</p>
    </div>
  `;

  await sendEmail(user.email, `Congratulations on your promotion to ${newRankTitle}! 🎊`, html);

  // Mark this rank as rewarded so it only triggers once
  await User.findByIdAndUpdate(user._id, {
    $addToSet: { rank_rewards_sent: newRankTitle }
  });
};

// Update a user's rank score and check for rank-up
const updateRankScore = async (userId, pointsToAdd) => {
  const user = await User.findById(userId);
  if (!user) return;

  const oldTitle = user.rank_title;
  const newScore = Math.min((user.rank_score || 1) + pointsToAdd, 10000000);
  const newTitle = getRankTitle(newScore);

  await User.findByIdAndUpdate(userId, {
    rank_score: newScore,
    rank_title: newTitle
  });

  // Send rank-up reward email if rank changed
  if (newTitle !== oldTitle) {
    const updatedUser = await User.findById(userId);
    await sendRankUpEmail(updatedUser, newTitle);
  }
};

// --- ROUTES ---

// Health check
app.get('/', (req, res) => res.send('The Majority Backend is Live!'));

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// --- MongoDB Models API Endpoints ---

// Health check for MongoDB Models API
app.get('/api/models/health', async (req, res) => {
  tr  try {
    const hasKey = !!MONGODB_MODELS_API_KEY;
    res.json({
      status: hasKey ? 'configured' : 'not-configured',
      message: hasKey ? 'MongoDB Models API is ready' : 'MongoDB Models API key not configured',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate personalized hair care recommendation
app.post('/api/models/recommend', authMiddleware, async (req, res) => {
  tr  try {
    const { hairType, concerns, preferredIngredients, budget } = req.body;

    // Validate input
    if (!hairType) {
      return res.status(400).json({ error: 'Hair type is required' });
    }

    // Call MongoDB Models API
    const recommendation = await mongoDBModelsClient.generateRecommendation({
      hairType,
      concerns: concerns || [],
      preferredIngredients: preferredIngredients || [],
      budget: budget || 'moderate'
    });

    // Save recommendation to user profile (optional)
    const user = await User.findOne({ email: req.user.email });
    if (user) {
      user.lastRecommendation = {
        input: { hairType, concerns, preferredIngredients, budget },
        result: recommendation,
        timestamp: new Date()
      };
      await user.save();
    }

    res.json({
      success: true,
      recommendation: recommendation,
      userEmail: req.user.email
    });
  } catch (error) {
    console.error('Recommendation endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendation',
      details: error.message 
    });
  }
});

// Generic MongoDB Models API call endpoint (authenticated)
app.post('/api/models/call', authMiddleware, async (req, res) => {
  tr  try {
    const { modelId, inputs } = req.body;

    if (!modelId) {
      return res.status(400).json({ error: 'Model ID is required' });
    }

    if (!inputs) {
      return res.status(400).json({ error: 'Inputs are required' });
    }

    const result = await mongoDBModelsClient.callModel(modelId, inputs);

    res.json({
      success: true,
      modelId,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Model call error:', error);
    res.status(500).json({
      error: 'Failed to call model',
      details: error.message
    });
  }
});

// Auth: verify token and return user info including rank
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = req.user;
  res.json({
    email: user.email,
    rank_score: user.rank_score,
    rank_title: user.rank_title || getRankTitle(user.rank_score || 1),
    isPolitburoOrHigher: isPolitburoOrHigher(user.rank_score || 1)
  });
});

// POST /api/auth/google - Google OAuth Authentication
app.post('/api/auth/google', async (req, res) => {
  tr  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }
    
    // Verify token with Google
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
    );
    
    if (!googleResponse.data.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }
    
    const email = googleResponse.data.email.toLowerCase();
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user from Google OAuth
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 12);
      user = await User.create({
        email,
        password: randomPassword,
        googleId: googleResponse.data.id,
        rank_title: 'bolshevik',
        rank_score: 1
      });
    } else {
      // Update existing user's Google ID
      if (!user.googleId) {
        user.googleId = googleResponse.data.id;
        await user.save();
      }
    }
    
    // Generate JWT
    const token = generateToken(user._id, true);
    
    res.json({
      email: user.email,
      token,
      rank_title: user.rank_title || getRankTitle(user.rank_score || 1),
      rank_score: user.rank_score || 1,
      _id: user._id
    });
  } catch (err) {
    res.status(500).json({ error: 'Google authentication failed: ' + err.message });
  }
});

// SIGN UP
app.post('/api/signup', async (req, res) => {
  tr  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be 8+ chars' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Account already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashed,
      rank_score: 1,
      rank_title: 'bolshevik'
    });
    const token = generateToken(user._id, false);

    res.status(201).json({ message: 'Account created', token, email: user.email, rank_title: user.rank_title });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// LOG IN
app.post('/api/login', async (req, res) => {
  tr  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user._id, !!rememberMe);
    res.json({
      success: true,
      token,
      email: user.email,
      rank_title: user.rank_title || getRankTitle(user.rank_score || 1),
      rank_score: user.rank_score || 1
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// FORGOT PASSWORD
app.post('/api/auth/forgot-password', async (req, res) => {
  tr  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    const SAFE_MSG = "If that email is registered, a reset link has been sent.";

    if (!user) return res.json({ message: SAFE_MSG });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'https://majorityhairsolutions.com';
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    await sendEmail(user.email, 'Reset Your Password', `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`);
    res.json({ message: SAFE_MSG });
  } catch (err) {
    res.status(500).json({ error: 'Email failed' });
  }
});

// RESET PASSWORD
app.post('/api/auth/reset-password/:token', async (req, res) => {
  tr  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 8) return res.status(400).json({ error: 'Password too short' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed' });
  }
});

// STRIPE
app.post('/api/create-payment-intent', async (req, res) => {
  tr  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount required" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'usd',
      automatic_payment_methods: { enabled: true }
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DUMA (LEGISLATURE) ROUTES ---

// 1. Fetch all submissions
app.get('/api/duma', async (req, res) => {
  tr  try {
    const items = await DumaItem.find().sort({ createdAt: -1 });
    
    // Enrich items with submitter social links and avatar
    const emails = [...new Set(items.map(item => item.submittedBy).filter(Boolean))];
    const users = await User.find({ email: { $in: emails } }, 'email socialLinks avatarUrl');
    const userMap = {};
    users.forEach(u => {
      userMap[u.email] = { socialLinks: u.socialLinks, avatarUrl: u.avatarUrl };
    });
    
    const enrichedItems = items.map(item => {
      const obj = item.toObject();
      obj.votes = {
        yes: obj.votes?.yes ?? obj.votes?.yay ?? 0,
        no: obj.votes?.no ?? obj.votes?.nay ?? 0,
        abstain: obj.votes?.abstain ?? 0
      };
      if (obj.submittedBy && userMap[obj.submittedBy]) {
        obj.submitterSocialLinks = userMap[obj.submittedBy].socialLinks || null;
        obj.submitterAvatar = userMap[obj.submittedBy].avatarUrl || null;
      }
      return obj;
    });
    
    res.json(enrichedItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Voting Logic - Accept both "voteType" and "vote" parameters
app.post('/api/duma/:id/vote', authMiddleware, async (req, res) => {
  tr  try {
    const voteType = req.body.voteType || req.body.vote; // Support both parameter names
    const normalizedVote = voteType === 'yay' ? 'yes' : voteType === 'nay' ? 'no' : voteType;
    if (!['yes', 'no', 'abstain'].includes(normalizedVote)) {
      return res.status(400).json({ error: 'Vote must be "yes", "no", or "abstain"' });
    }

    const update = { $inc: { [`votes.${normalizedVote}`]: 1 } };

    const item = await DumaItem.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // Award points for voting
    await updateRankScore(req.user._id, 2);

    res.json({
      success: true,
      votes: {
        yes: item.votes?.yes ?? item.votes?.yay ?? 0,
        no: item.votes?.no ?? item.votes?.nay ?? 0,
        abstain: item.votes?.abstain ?? 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Submit culture perspective to Duma
app.post('/api/duma/culture', authMiddleware, async (req, res) => {
  tr  try {
    const { prompt, response, category, mediaUrl, mediaType } = req.body;
    const trimmedPrompt = typeof prompt === 'string' ? prompt.trim() : '';
    const trimmedResponse = typeof response === 'string' ? response.trim() : '';

    if (!trimmedPrompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!trimmedResponse && !mediaUrl) {
      return res.status(400).json({ error: 'A response, photo, or video is required' });
    }

    if (mediaUrl && !mediaType) {
      return res.status(400).json({ error: 'Media type is required when media is attached' });
    }

    const rankTitle = req.user.rank_title || getRankTitle(req.user.rank_score || 1);
    const item = await DumaItem.create({
      type: 'Culture',
      category: category || 'Culture',
      section: 'Cultural',
      prompt: trimmedPrompt,
      response: trimmedResponse,
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || '',
      submittedBy: req.user.email,
      submitterRank: rankTitle,
      votes: { yes: 0, no: 0, abstain: 0 }
    });

    await updateRankScore(req.user._id, 1);
    res.status(201).json({ message: "Your perspective has been sent to The Majority's Duma for voting", item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit culture perspective' });
  }
});

// 4. Submit recommendation to Duma
app.post('/api/duma/recommend', authMiddleware, async (req, res) => {
  tr  try {
    const { name, company, reason } = req.body;
    if (!name || !company || !reason) return res.status(400).json({ error: 'All fields required' });

    const rankTitle = req.user.rank_title || getRankTitle(req.user.rank_score || 1);
    const item = await DumaItem.create({
      type: 'Recommendation',
      name,
      company,
      reason,
      submittedBy: req.user.email,
      submitterRank: rankTitle
    });

    await updateRankScore(req.user._id, 5);
    res.status(201).json({ message: "Your recommendation has been sent to The Majority's Duma for voting", item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit recommendation' });
  }
});

// 5. Submit partner application to Duma
app.post('/api/duma/partner', authMiddleware, async (req, res) => {
  tr  try {
    const { company, product, desc, tier } = req.body;
    if (!company || !product || !desc) return res.status(400).json({ error: 'All fields required' });

    const rankScore = req.user.rank_score || 1;
    const rankTitle = req.user.rank_title || getRankTitle(rankScore);

    if (tier === 'Premium' && !isPolitburoOrHigher(rankScore)) {
      return res.status(403).json({
        error: 'Premium Partner status requires Politburo rank or higher. Keep building your influence!'
      });
    }

    const item = await DumaItem.create({
      type: 'Partner',
      company,
      product,
      desc,
      submittedBy: req.user.email,
      submitterRank: rankTitle
    });

    await updateRankScore(req.user._id, 10);
    res.status(201).json({ message: "Your partner application has been submitted to The Majority's Duma", item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit partner application' });
  }
});

// GET user rank info
app.get('/api/rank', authMiddleware, async (req, res) => {
  const user = req.user;
  res.json({
    rank_score: user.rank_score || 1,
    rank_title: user.rank_title || getRankTitle(user.rank_score || 1),
    isPolitburoOrHigher: isPolitburoOrHigher(user.rank_score || 1)
  });
});

// ========== PROFILE ENDPOINTS ==========

// GET /api/profile - Fetch user profile with perspectives and social links
app.get('/api/profile', authMiddleware, async (req, res) => {
  tr  try {
    const user = req.user;
    res.json({
      email: user.email,
      rank_title: user.rank_title || getRankTitle(user.rank_score || 1),
      rank_score: user.rank_score || 1,
      avatar: user.avatarUrl || null,
      perspective: user.perspective || {
        box1: { content: "", mediaUrls: [], videoUrl: null },
        box2: { content: "", mediaUrls: [], videoUrl: null },
        box3: { content: "", mediaUrls: [], videoUrl: null },
        box4: { content: "", mediaUrls: [], videoUrl: null }
      },
      socialLinks: user.socialLinks || { instagram: "", tiktok: "", facebook: "" },
      _id: user._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile - Update user profile perspectives
app.put('/api/profile', authMiddleware, async (req, res) => {
  tr  try {
    const { perspective, socialLinks, avatar } = req.body;
    
    const updateData = {};
    
    // Update avatar URL if provided
    if (avatar) {
      updateData.avatarUrl = avatar;
    }
    
    // Update perspective if provided
    if (perspective) {
      updateData.perspective = {
        box1: { ...perspective.box1, updatedAt: new Date() },
        box2: { ...perspective.box2, updatedAt: new Date() },
        box3: { ...perspective.box3, updatedAt: new Date() },
        box4: { ...perspective.box4, updatedAt: new Date() }
      };
    }
    
    // Update social links if provided
    if (socialLinks) {
      updateData.socialLinks = { ...socialLinks, updatedAt: new Date() };
    }
    
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    res.json({ success: true, message: 'Profile updated successfully', profile: {
      avatar: user.avatarUrl,
      perspective: user.perspective,
      socialLinks: user.socialLinks
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile/social-links - Update only social media links
app.put('/api/profile/social-links', authMiddleware, async (req, res) => {
  tr  try {
    const { socialLinks } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { socialLinks: { ...socialLinks, updatedAt: new Date() } },
      { new: true }
    );
    
    res.json({ success: true, message: 'Social links updated', socialLinks: user.socialLinks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== MEDIA UPLOAD ENDPOINTS ==========

// POST /api/media/upload - Upload media file (photo or video)
app.post('/api/media/upload', authMiddleware, upload.single('file'), async (req, res) => {
  tr  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const { file } = req;
    const isImage = file.mimetype.startsWith('image');
    const isVideo = file.mimetype.startsWith('video');
    
    if (!isImage && !isVideo) {
      return res.status(400).json({ error: 'Only images and videos allowed' });
    }
    
    // File size validation
    if (isImage && file.size > 5242880) { // 5MB
      return res.status(400).json({ error: 'Image must be under 5MB' });
    }
    if (isVideo && file.size > 52428800) { // 50MB
      return res.status(400).json({ error: 'Video must be under 50MB' });
    }
    
    // Upload to Cloudinary
    let storageUrl;
    tr  try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: isVideo ? 'video' : 'image',
            folder: 'majority-hair',
            transformation: isImage ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      storageUrl = uploadResult.secure_url;

      // If uploading an avatar, save the URL directly to the user record
      if (req.body.type === 'avatar') {
        await User.findByIdAndUpdate(req.user._id, { avatarUrl: storageUrl });
      }
    } catch (cloudinaryErr) {
      console.error('Cloudinary upload error:', cloudinaryErr.message);
      return res.status(500).json({ error: 'File upload to storage failed' });
    }

    const media = await Media.create({
      userId: req.user._id,
      filename: file.originalname,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      type: isImage ? 'image' : 'video',
      storageUrl,
      uploadedAt: new Date()
    });
    
    // Award points for uploading
    await updateRankScore(req.user._id, 5);
    
    res.json({
      _id: media._id,
      url: media.storageUrl,
      filename: media.filename,
      storageUrl: media.storageUrl,
      type: media.type,
      size: media.size,
      uploadedAt: media.uploadedAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/media/{mediaId} - Delete media file
apapp.delete('/api/media/:mediaId', authMiddleware, async (req, res) => {
  tr  try {
    const media = await Media.findById(req.params.mediaId);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    // Verify user owns the media
    if (media.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // TODO: Delete from S3/Cloudinary
    await Media.deleteOne({ _id: req.params.mediaId });
    
    res.json({ success: true, message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== LEADERBOARD ==========
app.app.get('/api/leaderboard', async (req, res) => {
  tr  try {
    const users = await User.find({}, 'email rank_score rank_title')
      .sort({ rank_score: -1 })
      .limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }

  // ============================================================
  // INSTAGRAM OAUTH 2.0
  // ============================================================
  apapp.get('/api/auth/instagram/redirect', (req, res) => {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });
      const params = new URLSearchParams({
            client_id:     process.env.INSTAGRAM_APP_ID,
            redirect_uri:  process.env.INSTAGRAM_REDIRECT_URI || 'https://themajorities.com/oauth/callback/instagram',
            scope:         'instagram_basic,instagram_content_publish',
            response_type: 'code',
            state:         userId
      });
      res.redirect('https://api.instagram.com/oauth/authorize?' + params.toString());
  });

  apapp.get('/api/auth/instagram/callback', async (req, res) => {
      const { code, state: userId, error } = req.query;
      const FRONTEND = process.env.FRONTEND_URL || 'https://themajorities.com';
      if (error) return res.redirect(FRONTEND + '/profile?error=instagram_denied');
      if (!code || !userId) return res.redirect(FRONTEND + '/profile?error=instagram_missing_params');
      tr  try {
            const shortRes = await axios.post(
                    'https://api.instagram.com/oauth/access_token',
                    new URLSearchParams({
                              client_id:     process.env.INSTAGRAM_APP_ID,
                              client_secret: process.env.INSTAGRAM_APP_SECRET,
                              grant_type:    'authorization_code',
                              redirect_uri:  process.env.INSTAGRAM_REDIRECT_URI || 'https://themajorities.com/oauth/callback/instagram',
                              code
                    }).toString(),
              { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                  );
            const { access_token: shortToken, user_id: igUserId } = shortRes.data;
            const longRes = await axios.get('https://graph.instagram.com/access_token', {
                    params: { grant_type: 'ig_exchange_token', client_secret: process.env.INSTAGRAM_APP_SECRET, access_token: shortToken }
            });
            const { access_token: longToken, expires_in } = longRes.data;
            await User.findByIdAndUpdate(userId, {
                    'oauthProviders.instagram': {
                              id: igUserId.toString(),
                              accessToken: encryptToken(longToken),
                              expiresAt: new Date(Date.now() + expires_in * 1000)
                    }
            });
            res.redirect(FRONTEND + '/profile?connected=instagram');
      } catch (err) {
            console.error('Instagram OAuth error:', err.response?.data || err.message);
            res.redirect(FRONTEND + '/profile?error=instagram_failed');
      }
  });

  apapp.delete('/api/auth/instagram/disconnect', authMiddleware, async (req, res) => {
      tr  try {
            await User.findByIdAndUpdate(req.user._id, { $unset: { 'oauthProviders.instagram': '' } });
            res.json({ success: true });
      } catch (err) { res.status(500).json({ error: 'Disconnect failed' }); }
  });

  // ============================================================
  // TIKTOK OAUTH 2.0
  // ============================================================
  apapp.get('/api/auth/tiktok/redirect', (req, res) => {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });
      const params = new URLSearchParams({
            client_key:    process.env.TIKTOK_CLIENT_KEY,
            redirect_uri:  process.env.TIKTOK_REDIRECT_URI || 'https://themajorities.com/oauth/callback/tiktok',
            scope:         'user.info.basic,video.upload',
            response_type: 'code',
            state:         userId
      });
      res.redirect('https://www.tiktok.com/auth/authorize/?' + params.toString());
  });

  apapp.get('/api/auth/tiktok/callback', async (req, res) => {
      const { code, state: userId, error } = req.query;
      const FRONTEND = process.env.FRONTEND_URL || 'https://themajorities.com';
      if (error) return res.redirect(FRONTEND + '/profile?error=tiktok_denied');
      if (!code || !userId) return res.redirect(FRONTEND + '/profile?error=tiktok_missing_params');
      tr  try {
            const tokenRes = await axios.post(
                    'https://open-api.tiktok.com/oauth/access_token/',
                    new URLSearchParams({
                              client_key:    process.env.TIKTOK_CLIENT_KEY,
                              client_secret: process.env.TIKTOK_CLIENT_SECRET,
                              code,
                              grant_type:    'authorization_code',
                              redirect_uri:  process.env.TIKTOK_REDIRECT_URI || 'https://themajorities.com/oauth/callback/tiktok'
                    }).toString(),
              { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                  );
            const { access_token, open_id, expires_in } = tokenRes.data.data;
            await User.findByIdAndUpdate(userId, {
                    'oauthProviders.tiktok': {
                              id: open_id,
                              accessToken: encryptToken(access_token),
                              expiresAt: new Date(Date.now() + expires_in * 1000)
                    }
            });
            res.redirect(FRONTEND + '/profile?connected=tiktok');
      } catch (err) {
            console.error('TikTok OAuth error:', err.response?.data || err.message);
            res.redirect(FRONTEND + '/profile?error=tiktok_failed');
      }
  });

  apapp.delete('/api/auth/tiktok/disconnect', authMiddleware, async (req, res) => {
      tr  try {
            await User.findByIdAndUpdate(req.user._id, { $unset: { 'oauthProviders.tiktok': '' } });
            res.json({ success: true });
      } catch (err) { res.status(500).json({ error: 'Disconnect failed' }); }
  });

  // ============================================================
  // SOCIAL SHARE / PUBLISH
  // ============================================================
  apapp.get('/api/social/status', authMiddleware, async (req, res) => {
      tr  try {
            const user = await User.findById(req.user._id).select('oauthProviders');
            res.json({
                    instagram: !!(user?.oauthProviders?.instagram?.accessToken),
                    tiktok:    !!(user?.oauthProviders?.tiktok?.accessToken)
            });
      } catch (err) { res.status(500).json({ error: 'Status check failed' }); }
  });

  apapp.post('/api/social/share/instagram', authMiddleware, async (req, res) => {
      tr  try {
            const { videoUrl, caption = '' } = req.body;
            if (!videoUrl) return res.status(400).json({ error: 'videoUrl required' });
            const user = await User.findById(req.user._id);
            if (!user?.oauthProviders?.instagram?.accessToken) {
                    return res.status(401).json({ error: 'Instagram not connected' });
            }
            const token = decryptToken(user.oauthProviders.instagram.accessToken);
            const igId  = user.oauthProviders.instagram.id;
            const containerRes = await axios.post('https://graph.instagram.com/' + igId + '/media', null, {
                    params: { video_url: videoUrl, media_type: 'REELS', caption: caption.substring(0, 2200), access_token: token }
            });
            const containerId = containerRes.data.id;
            let statusCode = 'IN_PROGRESS';
            let attempts = 0;
            while (statusCode !== 'FINISHED' && attempts < 24) {
                    await new Promise(r => setTimeout(r, 5000));
                    const statusRes = await axios.get('https://graph.instagram.com/' + containerId, {
                              params: { fields: 'status_code', access_token: token }
                    });
                    statusCode = statusRes.data.status_code;
                    attempts++;
                    if (statusCode === 'ERROR') return res.status(500).json({ error: 'Instagram rejected the video' });
            }
            if (statusCode !== 'FINISHED') return res.status(504).json({ error: 'Processing timed out' });
            const publishRes = await axios.post('https://graph.instagram.com/' + igId + '/media_publish', null, {
                    params: { creation_id: containerId, access_token: token }
            });
            res.json({ success: true, postId: publishRes.data.id });
      } catch (err) {
            console.error('Instagram share error:', err.response?.data || err.message);
            res.status(500).json({ error: 'Failed to share: ' + (err.response?.data?.error?.message || err.message) });
      }
  });

  apapp.post('/api/social/share/tiktok', authMiddleware, async (req, res) => {
      tr  try {
            const { videoUrl, caption = '' } = req.body;
            if (!videoUrl) return res.status(400).json({ error: 'videoUrl required' });
            const user = await User.findById(req.user._id);
            if (!user?.oauthProviders?.tiktok?.accessToken) {
                    return res.status(401).json({ error: 'TikTok not connected' });
            }
            const token = decryptToken(user.oauthProviders.tiktok.accessToken);
            const initRes = await axios.post(
                    'https://open.tiktokapis.com/v2/post/publish/video/init/',
              {
                        post_info: { title: caption.substring(0, 150), privacy_level: 'SELF_ONLY', disable_duet: false, disable_comment: false, disable_stitch: false, video_cover_timestamp_ms: 1000 },
                        source_info: { source: 'PULL_FROM_URL', video_url: videoUrl }
              },
              { headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json; charset=UTF-8' } }
                  );
            res.json({ success: true, publishId: initRes.data.data.publish_id });
      } catch (err) {
            console.error('TikTok share error:', err.response?.data || err.message);
            res.status(500).json({ error: 'Failed to share: ' + (err.response?.data?.error?.message || err.message) });
      }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
