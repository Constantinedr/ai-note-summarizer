import React, { useState, useEffect } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { BrowserRouter as Router, Route, Routes, useSearchParams } from "react-router-dom";
import Summarizer from "./Summarizer";
import Home from "./Home";
import OtherApps from "./OtherApps";
import styles from "./App.module.css";

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

  const handleCaptchaChange = (token) => setCaptchaToken(token);

  const handleRegister = async () => {
    if (!captchaToken) return setMessage("Please complete the CAPTCHA.");
    if (!isValidEmail(email)) return setMessage("Please enter a valid email address.");
    if (!isValidPassword(password))
      return setMessage("Password must be at least 8 characters with letters and numbers.");

    setLoading(true);
    try {
      const response = await axios.post("https://ai-note-summarizer.onrender.com/register", {
        username,
        email,
        password,
        captchaToken,
      });
      setMessage("User registered successfully. Please check your email to verify.");
      setUsername("");
      setEmail("");
      setPassword("");
      setCaptchaToken("");
    } catch (error) {
      const errorMsg = error.response?.data || "Registration failed.";
      setMessage(errorMsg);
      console.error("Registration failed:", error);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!captchaToken) return setMessage("Please complete the CAPTCHA.");
    if (!isValidEmail(loginEmail)) return setMessage("Please enter a valid email address.");

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
      const errorMsg = error.response?.data || "Login failed.";
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
        const errorMsg = error.response?.data || "Verification failed.";
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
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.classList.toggle("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Router>
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ""}`}>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Summarizer onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              ) : (
                <Auth onLogin={handleLogin} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              )
            }
          />
          <Route path="/home" element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route
            path="/other-apps"
            element={<OtherApps darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
          />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;