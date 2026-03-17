const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Validate critical environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️ WARNING: STRIPE_SECRET_KEY is not defined in .env");
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- DATABASE ---
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ DB Error:", err.message));
} else {
  console.error("❌ Error: MONGODB_URI is missing from environment variables.");
}

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  email:            { type: String, required: true, unique: true },
  password:         { type: String },
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

// --- ROUTES ---

// Health check
app.get('/', (req, res) => res.send('The Majority Backend is Live!'));

// SIGN UP
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be 8+ chars' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Account already exists' });

    const hashed = await bcrypt.hash(password, 12); // Increased security
    const user = await User.create({ email: email.toLowerCase(), password: hashed });
    const token = generateToken(user._id, false);

    res.status(201).json({ message: 'Account created', token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// LOG IN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user._id, !!rememberMe);
    res.json({ success: true, token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// FORGOT PASSWORD
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
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

// RESET PASSWORD (FIXED PATH PARAM)
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params; // Extract from URL path

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
  try {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));