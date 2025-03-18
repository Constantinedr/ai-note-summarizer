import React, { useState, useEffect } from "react";
import { HfInference } from "@huggingface/inference";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { BrowserRouter as Router, Route, Routes, useSearchParams } from "react-router-dom";
import styles from "./App.module.css";

const hf = new HfInference("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");

// Password validation function (same as backend)
const isValidPassword = (password) => {
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return password.length >= minLength && hasLetter && hasNumber;
};

// Email validation function (same as backend)
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

function Summarizer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [showPastSummaries, setShowPastSummaries] = useState(false);

  const handleSummarize = async () => {
    if (!text) return alert("Please enter some text!");
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const result = await hf.summarization({
        model: "facebook/bart-large-cnn",
        inputs: text,
      });
      setSummary(result.summary_text);
      setSavedSummaries([...savedSummaries, result.summary_text]);

      if (token) {
        await axios.post("https://ai-note-summarizer.onrender.com/summaries", {
          token,
          summary: result.summary_text,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong! Check your API key or login status.");
    }
    setLoading(false);
  };

  const handleShowPastSummaries = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to view past summaries.");
      return;
    }

    try {
      const response = await axios.get("https://ai-note-summarizer.onrender.com/summaries", {
        params: { token },
      });
      const summaries = response.data.map((item, index) => 
        `${index + 1}. ${item.text} (Saved on: ${new Date(item.createdAt).toLocaleString()})`
      ).join('\n');
      alert(summaries || "No past summaries found.");
    } catch (error) {
      console.error("Error fetching past summaries:", error);
      alert("Failed to fetch past summaries.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI Note Summarizer</h1>
      <button
        className={styles.pastSummariesButton}
        onClick={handleShowPastSummaries}
        style={{ position: 'absolute', top: '10px', right: '10px' }}
      >
        Past Summaries
      </button>
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
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [captchaToken, setCaptchaToken] = useState("");

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
  };

  const handleLogin = async () => {
    if (!captchaToken) {
      return setMessage("Please complete the CAPTCHA.");
    }
    if (!isValidEmail(loginEmail)) {
      return setMessage("Please enter a valid email address.");
    }

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
          <div className={styles.section}>
            <h2 className={styles.subtitle}>Login</h2>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Email"
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
                >
                  Switch to {showSummarizer ? "Auth" : "Summarizer"}
                </button>
                {showSummarizer ? <Summarizer /> : <Auth />}
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