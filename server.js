const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to local MongoDB
const atlasURI = 'mongodb+srv://kostalampadaris:7H6u5KGL7e62KVt@cluster0.uic4a.mongodb.net/ai?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(atlasURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB Atlas:', err));

// Define a User schema with a lastRegistered field
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  additionalInfo: String,
  lastRegistered: { type: Date, default: null },
});

const User = mongoose.model('User', userSchema);

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password, additionalInfo } = req.body;

  // Check if username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    const now = new Date();
    const cooldown = 60 * 1000; // 1 minute cooldown
    const lastRegistered = existingUser.lastRegistered;

    if (lastRegistered && now - lastRegistered < cooldown) {
      return res.status(400).send('You can only register once per minute');
    }
  }

  // Hash password and save user
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    password: hashedPassword,
    additionalInfo,
    lastRegistered: new Date(),
  });

  await user.save();
  res.status(201).send('User registered');
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send('User not found');

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid password');

  const token = jwt.sign({ username }, 'secretkey');
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
