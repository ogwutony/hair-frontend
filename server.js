const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());
app.use(cors());

// --- DATABASE ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ DB Error:", err.message));

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  email:            { type: String, required: true, unique: true },
  password:         { type: String },          // optional for Google-only users
  googleId:         { type: String },
  resetToken:       { type: String },
  resetTokenExpiry: { type: Date }
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

// --- HELPERS ---
const JWT_SECRET = process.env.JWT_SECRET || 'majority-hair-default-secret-change-me';

const generateToken = (userId, rememberMe = false) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '24h'
  });
};

const sendEmail = async (to, subject, html) => {
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

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/', (req, res) => res.send('The Majority Backend is Live!'));

// ------------------------------------------------------------
// SIGN UP
// ------------------------------------------------------------
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), password: hashed });
    const token = generateToken(user._id, false);

    res.status(201).json({ message: 'Account created', token, email: user.email });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

// ------------------------------------------------------------
// LOG IN
// ------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id, !!rememberMe);
    res.json({ success: true, token, email: user.email });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ------------------------------------------------------------
// VERIFY TOKEN  →  GET /api/auth/me
// ------------------------------------------------------------
app.get('/api/auth/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('email');
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ email: user.email });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// ------------------------------------------------------------
// GOOGLE OAUTH  →  POST /api/auth/google
// ------------------------------------------------------------
app.post('/api/auth/google', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'Access token required' });

    // Verify with Google and get user info
    const { data: googleUser } = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!googleUser.email) {
      return res.status(400).json({ error: 'Google authentication failed' });
    }

    // Find or create user
    let user = await User.findOne({ email: googleUser.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.id
      });
    } else if (!user.googleId) {
      user.googleId = googleUser.id;
      await user.save();
    }

    const token = generateToken(user._id, true); // Google users → 30 day token
    res.json({ success: true, token, email: user.email });
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// ------------------------------------------------------------
// FORGOT PASSWORD  →  POST /api/auth/forgot-password
// ------------------------------------------------------------
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    const SAFE_MSG = "If that email is registered, a reset link has been sent.";

    // Always respond the same to prevent email enumeration
    if (!user || !process.env.EMAIL_USER) {
      return res.json({ message: SAFE_MSG });
    }

    // Generate secure random token
    const rawToken       = crypto.randomBytes(32).toString('hex');
    const hashedToken    = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetToken      = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'https://majorityhairsolutions.com';
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    await sendEmail(
      user.email,
      'Reset Your Majority Hair Password',
      `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#222;">
        <h2 style="margin-bottom:8px;">Reset Your Password</h2>
        <p style="color:#666;margin-bottom:24px;">
          We received a request to reset the password for your Majority Hair Solutions account.
          Click the button below — this link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 28px;background:#222;color:#fff;
                  text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          Reset Password
        </a>
        <p style="color:#aaa;font-size:12px;margin-top:28px;">
          If you didn't request this, you can safely ignore this email.
          Your password will not change.
        </p>
      </div>
      `
    );

    res.json({ message: SAFE_MSG });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
  }
});

// ------------------------------------------------------------
// RESET PASSWORD  →  POST /api/auth/reset-password/:token
// ------------------------------------------------------------
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetToken:       hashedToken,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired' });
    }

    user.password        = await bcrypt.hash(password, 10);
    user.resetToken      = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

// ------------------------------------------------------------
// STRIPE PAYMENT INTENT
// ------------------------------------------------------------
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'usd',
      automatic_payment_methods: { enabled: true }
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
