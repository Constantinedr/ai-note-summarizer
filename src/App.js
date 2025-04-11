import React, { useState, useEffect } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { BrowserRouter as Router, Route, Routes, useSearchParams, Link } from "react-router-dom";
import styles from "./App.module.css";
import RGBComponent from "./RGBComponent.js";
import PersonalityTrait from "./Personality-trait.js";
import TextViewer from "./Text-viewer.js";
import Torn from "./Torn.js";
import TicTacToe from "./TicTacToe.js";
import PayPalButton from "./PayPalButton"; // ⬅️ Import this at the top

// Hugging Face API configuration
const HF_API_TOKEN = "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"; // Replace with your HF API token
const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

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

function Summarizer({ onLogout, darkMode, toggleDarkMode }) {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [pastSummaries, setPastSummaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const isLoggedIn = !!localStorage.getItem("token");
  const MAX_WORDS = 400;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

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

  const handleSummarize = async () => {
    if (!text) return alert("Please enter some text!");
    if (wordCount > MAX_WORDS) {
      return alert(`Text exceeds maximum word limit of ${MAX_WORDS} words. Current count: ${wordCount}.`);
    }
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        HF_API_URL,
        {
          inputs: text,
          parameters: {
            max_length: 100,
            min_length: 30,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const summaryText = response.data[0].summary_text;
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
      alert("Something went wrong! Check your API key or network status.");
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
      <h1 className={styles.title}> Mary AI </h1>
      <button className={styles.pastSummariesButton} onClick={toggleHistory}>
        {showHistory ? "Hide History" : "Past Summaries"}
      </button>
      {isLoggedIn && (
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      )}
      <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
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
          <div className={styles.wordCount}>
            Word count: {wordCount}/{MAX_WORDS}
            {wordCount > MAX_WORDS && (
              <span className={styles.wordCountError}> (Exceeds limit!)</span>
            )}
          </div>
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
      <h2 className={styles.subtitle}>More Options</h2>
      <div className={styles.rightSection2}>
        
        <Link to="/rgb-component">
          <button className={styles.button}>Go to RGB Component</button>
        </Link>
        <Link to="/personality-trait">
          <button className={styles.button}>Go to personality Component</button>
        </Link>
        <Link to="/text-viewer">
          <button className={styles.button}>Go to text viewer</button>
        </Link>
        <Link to="/Torn-game">
          <button className={styles.button}>Go to Torn</button>
        </Link>
        <Link to="/TicTacToe-game">
          <button className={styles.button}>Go to TicTacToe</button>
        </Link>
        <h2 className={styles.subtitle}>Support Us</h2>
<PayPalButton amount="3.00" onSuccess={(details) => {
  alert("Thank you for your support!");
  console.log("Payment Details:", details);
}} />
      </div>
    </div>
  );
}

function Auth({ onLogin, darkMode, toggleDarkMode }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
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
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!captchaToken) {
      return setMessage("Please complete the CAPTCHA.");
    }
    if (!isValidEmail(loginEmail)) {
      return setMessage("Please enter a valid email address.");
    }

    setLoading(true);
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
    setLoading(false);
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ""}`}>
      <div className={styles.card}>
        <h1 className={styles.title}>User Authentication</h1>
        <button className={styles.toggleButton} onClick={() => setShowLogin(!showLogin)}>
          Switch to {showLogin ? "Register" : "Login"}
        </button>
        <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
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
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.classList.toggle("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

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
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ""}`}>
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
                    ? "Log in"
                    : "Back to home"}
                </button>
                {showSummarizer ? (
                  <Summarizer onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                ) : (
                  <Auth onLogin={handleLogin} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                )}
              </>
              
            }
            
          />
          <Route path="/verify" element={<Verify />} />
          <Route path="/rgb-component" element={<RGBComponent darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/personality-trait" element={<PersonalityTrait darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/text-viewer" element={<TextViewer darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/Torn-game" element={<Torn darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          
          <Route path="/TicTacToe-game" element={<TicTacToe darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;