const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection
const atlasURI = 'mongodb+srv://kostalampadaris:7H6u5KGL7e62KVt@cluster0.uic4a.mongodb.net/ai?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(atlasURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err.message));

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  additionalInfo: String,
  verified: { type: Boolean, default: false },
  verificationToken: String,
  summaries: [{ text: String, createdAt: { type: Date, default: Date.now } }], // Array of summaries
  textSubmitted: { text: String, createdAt: { type: Date, default: Date.now } }, // Single text submission
});

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model('User', userSchema);

// Result Schema (unchanged)
const resultSchema = new mongoose.Schema({
  userId: String,
  scores: {
    mind: { type: Number, default: 0 },
    energy: { type: Number, default: 0 },
    nature: { type: Number, default: 0 },
    tactics: { type: Number, default: 0 },
    identity: { type: Number, default: 0 },
  },
  timestamp: { type: Date, default: Date.now },
});

const Result = mongoose.model('Result', resultSchema);

// CAPTCHA bypass secret
const CAPTCHA_BYPASS_SECRET = 'my-secret-bypass-token';

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lampadarisconstantine@gmail.com',
    pass: 'smtr gceq ugov eehi',
  },
});

transporter.verify((error, success) => {
  if (error) console.error('Email transporter error:', error);
  else console.log('Email transporter is ready');
});

// Validation functions
const isValidPassword = (password) => {
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return password.length >= minLength && hasLetter && hasNumber;
};

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
    if (existingEmail) return res.status(400).send('Email already registered');

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send('Username already taken');

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

    if (!user) return res.status(400).send('Invalid token');

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
    if (!user.verified) return res.status(400).send('Please verify your email first');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password');

    const token = jwt.sign({ email }, 'secretkey');
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error during login');
  }
});

// Save Summary Endpoint (unchanged)
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

// Get Summaries Endpoint (unchanged)
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

// Save Text Endpoint (new, for textSubmitted)
app.post('/text', async (req, res) => {
  const { token, text } = req.body;
  try {
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).send('Unauthorized');

    user.textSubmitted = { text, createdAt: new Date() }; // Overwrites existing textSubmitted
    await user.save();
    res.send('Text saved successfully');
  } catch (error) {
    console.error('Error saving text:', error);
    res.status(500).send('Failed to save text');
  }
});

// Get Text Endpoint (new, for textSubmitted)
app.get('/text', async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(401).send('Unauthorized');

    res.json(user.textSubmitted || null); // Return null if no text submitted
  } catch (error) {
    console.error('Error fetching text:', error);
    res.status(500).send('Failed to fetch text');
  }
});

// Save Results Endpoint (unchanged)
app.post('/api/results', async (req, res) => {
  console.time('POST /api/results');
  const { userId, scores } = req.body;
  console.log('Received data:', { userId, scores });

  if (!userId || !scores) {
    console.error('Invalid request data:', req.body);
    return res.status(400).json({ error: 'Missing userId or scores' });
  }

  try {
    const result = new Result({ 
      userId, 
      scores: {
        mind: scores.mind || scores.Mind || 0,
        energy: scores.energy || scores.Energy || 0,
        nature: scores.nature || scores.Nature || 0,
        tactics: scores.tactics || scores.Tactics || 0,
        identity: scores.identity || scores.Identity || 0,
      }
    });
    const savedResult = await result.save();
    console.log('Saved to MongoDB:', savedResult);
    res.json({ message: 'Results saved successfully', id: savedResult._id });
  } catch (error) {
    console.error('Error saving result:', error.message);
    res.status(500).json({ error: 'Failed to save results' });
  } finally {
    console.timeEnd('POST /api/results');
  }
});

// Get Results Endpoint (unchanged)
app.get('/api/results', async (req, res) => {
  console.time('GET /api/results');
  try {
    const results = await Result.find().sort({ timestamp: -1 }).limit(50);
    console.log('Fetched results:', results.length);
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error.message);
    res.status(500).json({ error: 'Failed to fetch results' });
  } finally {
    console.timeEnd('GET /api/results');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});