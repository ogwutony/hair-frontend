// server.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// ---------------- Middleware ----------------
app.use(express.json());
app.use(cors());

// ---------------- MongoDB ----------------
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => console.log("✅ SUCCESS: Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ ERROR:", err.message));

// ---------------- Schemas ----------------

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);


const OrderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  items: { type: Object, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  stripePaymentIntentId: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);

// ---------------- Routes ----------------

// HEALTH CHECK ROUTE (Crucial for Render Deployment)
app.get('/', (req, res) => {
  res.send('The Majority Backend is Live!');
});

/**
 * 1. Create Payment Intent
 */
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});


/**
 * 2. Save order
 */
app.post('/api/orders', async (req, res) => {
  try {
    const {
      userEmail,
      selection,
      status,
      totalPrice,
      stripePaymentIntentId
    } = req.body;

    const newOrder = await Order.create({
      userEmail,
      items: selection,
      totalPrice,
      status: status || 'Processing',
      stripePaymentIntentId
    });

    res.status(201).json({
      message: "Order saved successfully",
      order: newOrder
    });

  } catch (err) {
    console.error("Order Save Error:", err);
    res.status(500).json({ error: "Failed to save order to database" });
  }
});


/**
 * 3. Get orders for a user
 */
app.get('/api/orders/:email', async (req, res) => {
  try {
    const orders = await Order
      .find({ userEmail: req.params.email })
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch orders" });
  }
});


/**
 * 4. Auth routes
 */

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "User created" });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Email already exists or invalid data" });
  }
});


app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      success: true,
      email: user.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ---------------- Server ----------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}...`);
});
