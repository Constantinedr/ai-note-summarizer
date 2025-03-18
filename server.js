const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors()); // Allow frontend origin
app.use(bodyParser.json());

// MongoDB connection
const atlasURI = 'mongodb+srv://kostalampadaris:7H6u5KGL7e62KVt@cluster0.uic4a.mongodb.net/ai?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(atlasURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB Atlas:', err));

// User schema with summaries field
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  additionalInfo: String,
  verified: { type: Boolean, default: false },
  verificationToken: String,
  summaries: [{ text: String, createdAt: { type: Date, default: Date.now } }], // Added for Feature 2
});

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model('User', userSchema);

// CAPTCHA bypass secret
const CAPTCHA_BYPASS_SECRET = 'my-secret-bypass-token';

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lampadarisconstantine@gmail.com',
    pass: 'smtr gceq ugov eehi', // Your App Password
  },
});

transporter.verify((error, success) => {
  if (error) console.error('Email transporter error:', error);
  else console.log('Email transporter is ready');
});

// Password validation function
const isValidPassword = (password) => {
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return password.length >= minLength && hasLetter && hasNumber;
};

// Email validation function (basic regex)
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: 'ai-note-summarizer <lampadarisconstantine@gmail.com>',
    to: email,
    subject: 'Verify Your Email',
    html: `<p>Click <a href="https://ai-note-summarizer.onrender.com/verify?token=${token}">here</a> to verify your email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, email, password, additionalInfo, captchaToken } = req.body;

  if (captchaToken !== CAPTCHA_BYPASS_SECRET) {
    console.log('Skipping CAPTCHA verification');
  }

  try {
    if (!isValidEmail(email)) {
      return res.status(400).send('Invalid email format');
    }
    if (!isValidPassword(password)) {
      return res.status(400).send('Password must be at least 8 characters long and include letters and numbers');
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).send('Email already registered');
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, 'verificationSecret', { expiresIn: '1h' });

    const user = new User({
      username,
      email,
      password: hashedPassword,
      additionalInfo,
      verificationToken,
    });
    await user.save();

    await sendVerificationEmail(email, verificationToken);
    res.status(201).send('User registered. Please check your email to verify your account.');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Failed to register user or send verification email');
  }
});

// Verify endpoint
app.get('/verify', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, 'verificationSecret');
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).send('Invalid token');
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send('Email verified successfully');
  } catch (error) {
    res.status(400).send('Invalid or expired token');
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password, captchaToken } = req.body;

  if (captchaToken !== CAPTCHA_BYPASS_SECRET) {
    console.log('Skipping CAPTCHA verification');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found');

    if (!user.verified) {
      return res.status(400).send('Please verify your email first');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password');

    const token = jwt.sign({ email }, 'secretkey');
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error during login');
  }
});

// Feature 2: Save Summary Endpoint
app.post('/summaries', async (req, res) => {
  const { token, summary } = req.body;
  try {
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).send('Unauthorized');

    user.summaries.push({ text: summary });
    await user.save();
    res.send('Summary saved successfully');
  } catch (error) {
    console.error('Error saving summary:', error);
    res.status(500).send('Failed to save summary');
  }
});

// Feature 2: Get Summaries Endpoint
app.get('/summaries', async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).send('Unauthorized');

    res.json(user.summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).send('Failed to fetch summaries');
  }
});

// Feature 4: Get Profile Endpoint
app.get('/profile', async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).send('Unauthorized');

    res.json({
      username: user.username,
      email: user.email,
      additionalInfo: user.additionalInfo,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).send('Failed to fetch profile');
  }
});

// Feature 4: Update Profile Endpoint
app.put('/profile', async (req, res) => {
  const { token, username, additionalInfo } = req.body;
  try {
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).send('Unauthorized');

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).send('Username already taken');
      user.username = username;
    }
    user.additionalInfo = additionalInfo !== undefined ? additionalInfo : user.additionalInfo;
    await user.save();

    res.send('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Failed to update profile');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});