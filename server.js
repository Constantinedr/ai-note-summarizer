const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // For CAPTCHA verification

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection string
const atlasURI = 'mongodb+srv://kostalampadaris:7H6u5KGL7e62KVt@cluster0.uic4a.mongodb.net/ai?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(atlasURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB Atlas:', err));

// Define a User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  additionalInfo: String,
});

// Add a unique index to the username field
userSchema.index({ username: 1 }, { unique: true });

// Create the User model
const User = mongoose.model('User', userSchema);

// Google reCAPTCHA Secret Key (from your reCAPTCHA dashboard)
const RECAPTCHA_SECRET_KEY = '6Lc0TfYqAAAAALvUVhN-i65Sly-XMxxrP62HXRv5';

// Verify CAPTCHA token
const verifyCaptcha = async (captchaToken) => {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=6Lc0TfYqAAAAALvUVhN-i65Sly-XMxxrP62HXRv5&response=${captchaToken}`
    );
    return response.data.success; // true if CAPTCHA is valid
  } catch (error) {
    console.error('CAPTCHA verification failed:', error);
    return false;
  }
};

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password, additionalInfo, captchaToken } = req.body;

  // Verify CAPTCHA
  const isCaptchaValid = await verifyCaptcha(captchaToken);
  if (!isCaptchaValid) {
    return res.status(400).send('CAPTCHA verification failed');
  }

  // Check if the username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).send('Username already taken');
  }

  // If the username is unique, proceed with registration
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, additionalInfo });
  await user.save();
  res.status(201).send('User registered');
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password, captchaToken } = req.body;

  // Verify CAPTCHA
  const isCaptchaValid = await verifyCaptcha(captchaToken);
  if (!isCaptchaValid) {
    return res.status(400).send('CAPTCHA verification failed');
  }

  // Check if the user exists
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send('User not found');

  // Validate password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid password');

  // Generate JWT token
  const token = jwt.sign({ username }, 'secretkey');
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

