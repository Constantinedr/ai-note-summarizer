import React, { useState } from "react";
import { HfInference } from "@huggingface/inference";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha"; // Import ReCAPTCHA
import styles from "./App.module.css";

const hf = new HfInference("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");

function Summarizer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedSummaries, setSavedSummaries] = useState([]);

  const handleSummarize = async () => {
    if (!text) return alert("Please enter some text!");
    setLoading(true);

    try {
      const result = await hf.summarization({
        model: "facebook/bart-large-cnn",
        inputs: text,
      });
      setSummary(result.summary_text);
      setSavedSummaries([...savedSummaries, result.summary_text]);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong! Check your API key.");
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI Note Summarizer</h1>
      <div className={styles.card}>
        <div className={styles.leftSection}>
          <textarea
            className={styles.textarea}
            rows="5"
            placeholder="Enter your notes..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className={styles.button} onClick={handleSummarize} disabled={loading}>
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>
        <div className={styles.rightSection}>
          <h2 className={styles.subtitle}>Saved Summaries</h2>
          {savedSummaries.length === 0 ? (
            <p className={styles.noSummaries}>No summaries saved yet.</p>
          ) : (
            <ul className={styles.summaryList}>
              {savedSummaries.map((item, index) => (
                <li key={index} className={styles.summaryItem}>
                  <strong>Summary {index + 1}:</strong>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Auth() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState(""); // Changed from loginUsername to loginEmail
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [captchaToken, setCaptchaToken] = useState("");

  // reCAPTCHA Site Key (from Google reCAPTCHA dashboard)
  const recaptchaSiteKey = "6Lc0TfYqAAAAAPrQckrIuryDDuUHg5pQqr_w5Sbs";

  // Handle CAPTCHA token change
  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleRegister = async () => {
    if (!captchaToken) {
      return setMessage("Please complete the CAPTCHA.");
    }

    try {
      const response = await axios.post("https://ai-note-summarizer.onrender.com/register", { // Changed to localhost:5000 for local testing
        username,
        email,
        password,
        captchaToken,
      });
      setMessage("User registered successfully. Please check your email to verify your account.");
      setUsername("");
      setEmail("");
      setPassword("");
      setCaptchaToken("");
    } catch (error) {
      const errorMsg = error.response?.data || "Registration failed. Please try again.";
      setMessage(errorMsg);
      console.error("Registration failed:", error);
    }
  };

  const handleLogin = async () => {
    if (!captchaToken) {
      return setMessage("Please complete the CAPTCHA.");
    }

    try {
      const response = await axios.post("https://ai-note-summarizer.onrender.com/login", { // Changed to localhost:5000 for local testing
        email: loginEmail, // Changed from username to email
        password: loginPassword,
        captchaToken,
      });
      localStorage.setItem("token", response.data.token); // Store JWT token
      setMessage("Login successful!");
      setLoginEmail("");
      setLoginPassword("");
      setCaptchaToken("");
    } catch (error) {
      const errorMsg = error.response?.data || "Login failed. Please try again.";
      setMessage(errorMsg);
      console.error("Login failed:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>User Authentication</h1>
        <button
          className={styles.toggleButton}
          onClick={() => setShowLogin(!showLogin)}
        >
          Switch to {showLogin ? "Register" : "Login"}
        </button>
        {showLogin ? (
          // Login Form
          <div className={styles.section}>
            <h2 className={styles.subtitle}>Login</h2>
            <div className={styles.inputWrapper}>
              <input
                type="email" // Changed to email type
                placeholder="Email" // Changed placeholder
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={styles.prettyInput}
              />
            </div>
            <br />
            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={styles.prettyInput}
              />
            </div>
            <ReCAPTCHA
              sitekey={recaptchaSiteKey}
              onChange={handleCaptchaChange}
            />
            <button onClick={handleLogin} className={styles.button}>
              Login
            </button>
          </div>
        ) : (
          // Register Form
          <div className={styles.section}>
            <h2 className={styles.subtitle}>Register</h2>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.prettyInput}
              />
            </div>
            <br />
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.prettyInput}
              />
            </div>
            <br />
            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.prettyInput}
              />
            </div>
            <ReCAPTCHA
              sitekey={recaptchaSiteKey}
              onChange={handleCaptchaChange}
            />
            <button onClick={handleRegister} className={styles.button}>
              Register
            </button>
          </div>
        )}
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

function App() {
  const [showSummarizer, setShowSummarizer] = useState(true);

  return (
    <div>
      <button className={styles.switchButton} onClick={() => setShowSummarizer(!showSummarizer)}>
        Switch to {showSummarizer ? "Auth" : "Summarizer"}
      </button>
      {showSummarizer ? <Summarizer /> : <Auth />}
    </div>
  );
}

export default App;