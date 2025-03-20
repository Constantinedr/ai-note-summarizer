import React, { useState, useEffect } from "react";
import { HfInference } from "@huggingface/inference";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { BrowserRouter as Router, Route, Routes, useSearchParams } from "react-router-dom";
import styles from "./App.module.css";

const hf = new HfInference("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");

// Password and email validation functions
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

function Summarizer({ onLogout }) {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [pastSummaries, setPastSummaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 500);
    } else {
      setProgress(100);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleSummarize = async () => {
    if (!text) return alert("Please enter some text!");
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const result = await hf.summarization({
        model: "facebook/bart-large-cnn", // Replace with DeepSeek if available
        inputs: text,
      });
      const summaryText = result.summary_text;
      setSummary(summaryText);
      setSavedSummaries([...savedSummaries, summaryText]);

      if (token) {
        await axios.post("https://ai-note-summarizer.onrender.com/summaries", {
          token,
          summary: summaryText,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong! Check your API key or login status.");
    }
    setLoading(false);
  };

  const toggleHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to view past summaries.");
      return;
    }

    if (!showHistory) {
      try {
        const response = await axios.get("https://ai-note-summarizer.onrender.com/summaries", {
          params: { token },
        });
        setPastSummaries(response.data);
      } catch (error) {
        console.error("Error fetching past summaries:", error);
        alert("Failed to fetch past summaries.");
        return;
      }
    }
    setShowHistory(!showHistory);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setSavedSummaries([]);
    setPastSummaries([]);
    setShowHistory(false);
    onLogout();
  };

  const filteredSummaries = pastSummaries.filter((item) =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ""}`}>
      <h1 className={styles.title}>Sum/mary</h1>
      <button className={styles.pastSummariesButton} onClick={toggleHistory}>
        {showHistory ? "Hide History" : "Past Summaries"}
      </button>
      {isLoggedIn && (
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      )}
      <button
        className={styles.darkModeToggle}
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <div className={styles.summarizerCard}>
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
          {loading && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
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
        <div className={`${styles.historyBox} ${showHistory ? "" : styles.hidden}`}>
          <h2 className={styles.subtitle}>Past Summaries</h2>
          <input
            type="text"
            className={styles.searchBar}
            placeholder="Search summaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {filteredSummaries.length === 0 ? (
            <p className={styles.noSummaries}>No past summaries found.</p>
          ) : (
            <ul className={styles.pastSummaryList}>
              {filteredSummaries.map((item, index) => (
                <li key={index} className={styles.summaryItem}>
                  <strong>Summary {index + 1}:</strong>
                  <p>{item.text}</p>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Auth({ onLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false); // New state for loading

  const recaptchaSiteKey = "6LcoWPgqAAAAAALZ1qlOO-uc34kWOU6uAEuk8vvI";

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleRegister = async () => {
    if (!captchaToken) {
      return setMessage("Please complete the CAPTCHA.");
    }
    if (!isValidEmail(email)) {
      return setMessage("Please enter a valid email address.");
    }
    if (!isValidPassword(password)) {
      return setMessage("Password must be at least 8 characters long and include letters and numbers.");
    }

    setLoading(true); // Start loading
    try {
      const response = await axios.post("https://ai-note-summarizer.onrender.com/register", {
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
    setLoading(false); // Stop loading
  };

  const handleLogin = async () => {
    if (!captchaToken) {
      return setMessage("Please complete the CAPTCHA.");
    }
    if (!isValidEmail(loginEmail)) {
      return setMessage("Please enter a valid email address.");
    }

    setLoading(true); // Start loading
    try {
      const response = await axios.post("https://ai-note-summarizer.onrender.com/login", {
        email: loginEmail,
        password: loginPassword,
        captchaToken,
      });
      localStorage.setItem("token", response.data.token);
      setMessage("Login successful!");
      setLoginEmail("");
      setLoginPassword("");
      setCaptchaToken("");
      onLogin();
    } catch (error) {
      const errorMsg = error.response?.data || "Login failed. Please try again.";
      setMessage(errorMsg);
      console.error("Login failed:", error);
    }
    setLoading(false); // Stop loading
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>User Authentication</h1>
        <button className={styles.toggleButton} onClick={() => setShowLogin(!showLogin)}>
          Switch to {showLogin ? "Register" : "Login"}
        </button>
        {showLogin ? (
          <div className={styles.section}>
            <h2 className={styles.subtitle}>Login</h2>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={styles.prettyInput}
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={handleCaptchaChange} />
            <button onClick={handleLogin} className={styles.button} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            {loading && <div className={styles.loadingWheel}></div>}
          </div>
        ) : (
          <div className={styles.section}>
            <h2 className={styles.subtitle}>Register</h2>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.prettyInput}
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={handleCaptchaChange} />
            <button onClick={handleRegister} className={styles.button} disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            {loading && <div className={styles.loadingWheel}></div>}
          </div>
        )}
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

function Verify() {
  const [message, setMessage] = useState("Verifying your email...");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setMessage("Invalid verification link. No token found.");
        return;
      }

      try {
        const response = await axios.get(`https://ai-note-summarizer.onrender.com/verify?token=${token}`);
        setMessage(response.data);
      } catch (error) {
        const errorMsg = error.response?.data || "Verification failed. Please try again.";
        setMessage(errorMsg);
        console.error("Verification error:", error);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Email Verification</h1>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}

function App() {
  const [showSummarizer, setShowSummarizer] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowSummarizer(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowSummarizer(true);
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <button
                  className={styles.switchButton}
                  onClick={() => setShowSummarizer(!showSummarizer)}
                  disabled={isLoggedIn}
                >
                  {isLoggedIn
                    ? "You are logged in"
                    : showSummarizer
                    ? "Switch to Auth"
                    : "Switch to Summarizer"}
                </button>
                {showSummarizer ? <Summarizer onLogout={handleLogout} /> : <Auth onLogin={handleLogin} />}
              </>
            }
          />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;