const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // For email verification

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const atlasURI = 'mongodb+srv://kostalampadaris:7H6u5KGL7e62KVt@cluster0.uic4a.mongodb.net/ai?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(atlasURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB Atlas:', err));

// User schema with email
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true }, // Ensure email is unique
  password: String,
  additionalInfo: String,
  verified: { type: Boolean, default: false }, // Email verification status
  verificationToken: String, // Token for email verification
});

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true }); // Ensure email is unique
const User = mongoose.model('User', userSchema);

// Secret key for bypassing CAPTCHA
const CAPTCHA_BYPASS_SECRET = 'my-secret-bypass-token';

// Nodemailer setup for email verification
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lampadarisconstantine@gmail.com', // Your Gmail address
    pass: 'smtr gceq ugov eehi', // Replace with your Gmail App Password
  },
});

// Verify transporter setup on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send emails');
  }
});

// Send verification email with error handling
const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: 'God <lampadarisconstantine@gmail.com>', // Fixed 'from' field with display name
    to: email,
    subject: 'Verify Your Email',
    html: `<p>Click <a href="http://localhost:3000/verify?token=${token}">here</a> to verify your email.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}: ${info.response}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error; // Re-throw to handle in the endpoint
  }
};

// Register endpoint with error handling
app.post('/register', async (req, res) => {
  const { username, email, password, additionalInfo, captchaToken } = req.body;

  // Skip CAPTCHA check if using bypass token
  if (captchaToken !== CAPTCHA_BYPASS_SECRET) {
    console.log('Skipping CAPTCHA verification');
  }

  try {
    // Check if the email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).send('Email already registered');
    }

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already taken');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token
    const verificationToken = jwt.sign({ email }, 'verificationSecret', {
      expiresIn: '1h', // Token expires in 1 hour
    });

    // Save the user with the verification token
    const user = new User({
      username,
      email,
      password: hashedPassword,
      additionalInfo,
      verificationToken,
    });
    await user.save();

    // Send verification email
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
    // Verify the token
    const decoded = jwt.verify(token, 'verificationSecret');
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).send('Invalid token');
    }

    // Mark the user as verified
    user.verified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.send('Email verified successfully');
  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).send('Invalid or expired token');
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password, captchaToken } = req.body;

  // Skip CAPTCHA check if using bypass token
  if (captchaToken !== CAPTCHA_BYPASS_SECRET) {
    console.log('Skipping CAPTCHA verification');
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found');

    // Check if the user is verified
    if (!user.verified) {
      return res.status(400).send('Please verify your email first');
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password');

    // Generate JWT token
    const token = jwt.sign({ email }, 'secretkey');
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error during login');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});