const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
const allowedOrigins = [
  "https://spontaneous-parfait-de39c7.netlify.app", // Your frontend URL
  "http://localhost:3000", // For local development
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
    credentials: true, // Allow cookies and credentials
  })
);

// Your existing routes
app.post("/register", (req, res) => {
  res.send("User registered");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
// MongoDB connection
const atlasURI = "mongodb+srv://kostalampadaris:7H6u5KGL7e62KVt@cluster0.uic4a.mongodb.net/ai?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(atlasURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Failed to connect to MongoDB Atlas:", err));

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: { type: String, unique: true },
  verified: { type: Boolean, default: false },
  verificationToken: String,
});

const User = mongoose.model("User", userSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lampadarisconstantine@gmail.com", // Replace with your email
    pass: "l200520072009", // Replace with your email password or app-specific password
  },
});

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: "lampadarisconstantine@gmail.com",
    to: email,
    subject: "Verify Your Email",
    html: `<p>Click <a href="http://localhost:3000/verify?token=${token}">here</a> to verify your email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

// Register endpoint
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  // Check if the email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send("Email already registered");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a verification token
  const verificationToken = jwt.sign({ email }, "verificationSecret", {
    expiresIn: "1h", // Token expires in 1 hour
  });

  // Save the user with the verification token
  const user = new User({
    username,
    password: hashedPassword,
    email,
    verificationToken,
  });
  await user.save();

  // Send verification email
  await sendVerificationEmail(email, verificationToken);

  res.status(201).send("User registered. Please check your email to verify your account.");
});

// Verify endpoint
app.get("/verify", async (req, res) => {
  const { token } = req.query;

  try {
    // Verify the token
    const decoded = jwt.verify(token, "verificationSecret");
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).send("Invalid token");
    }

    // Mark the user as verified
    user.verified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.send("Email verified successfully");
  } catch (error) {
    res.status(400).send("Invalid or expired token");
  }
});

// Resend verification email endpoint
app.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("User not found");
  }

  if (user.verified) {
    return res.status(400).send("Email already verified");
  }

  // Generate a new verification token
  const verificationToken = jwt.sign({ email }, "verificationSecret", {
    expiresIn: "1h",
  });

  // Update the user's verification token
  user.verificationToken = verificationToken;
  await user.save();

  // Send the new verification email
  await sendVerificationEmail(email, verificationToken);

  res.send("Verification email sent");
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  // Check if the user is verified
  if (!user.verified) {
    return res.status(400).send("Please verify your email first");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password");

  const token = jwt.sign({ email }, "secretkey");
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});