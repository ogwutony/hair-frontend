const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Initializing Stripe with the Secret Key from your Render Environment variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("SUCCESS: Connected to MongoDB Atlas"))
  .catch(err => console.error("ERROR:", err.message));

// --- SCHEMAS ---
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiry: Date
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  userEmail: { type: String, required: true },
  items: { type: Object, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  stripePaymentIntentId: String,
  createdAt: { type: Date, default: Date.now }
}));

// --- EMAIL TRANSPORTER ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => res.send('The Majority Backend is Live!'));

// SIGNUP ROUTE: Creates a new user and hashes the password
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword });
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: "Signup failed: Account may already exist" });
  }
});

// LOGIN ROUTE: Verifies credentials
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ success: true, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});

// FORGOT PASSWORD ROUTE: Sends a reset link to the user's email
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();
    const resetLink = 'https://www.majorityhairsolutions.com/reset-password?token=' + token;
    const mailOptions = {
      from: '"Majority Hair Solutions" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Reset Your Password - Majority Hair Solutions',
      html: '<p>You requested a password reset.</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="' + resetLink + '">Reset My Password</a></p><p>If you did not request this, please ignore this email.</p>'
    };
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// RESET PASSWORD ROUTE: Updates the password using the reset token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// STRIPE ROUTE: Creates the payment intent
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
    res.status(500).json({ error: err.message });
  }
});

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Backend running on port ' + PORT + '...'));
