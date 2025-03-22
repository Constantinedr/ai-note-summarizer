import React, { useState, useEffect } from "react";
import { Route, Routes, Link } from "react-router-dom";
import Summarizer from "./Summarizer";
import RGBController from "./RGBController";
import Login from "./Login";
import styles from "./App.module.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.classList.toggle("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ""}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Home</h1>
        <div className={styles.authStatus}>
          Status: {isLoggedIn ? "Logged In" : "Logged Out"}
        </div>
        <Link to="/login">
          <button className={styles.button}>Login</button>
        </Link>
        {isLoggedIn && (
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        )}
        <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <div className={styles.summarizerCard}>
              <h2 className={styles.subtitle}>Welcome to the Home Page</h2>
              <p>Choose an app to get started:</p>
              <Link to="/summarizer">
                <button className={styles.button}>Summarizer</button>
              </Link>
              <Link to="/rgb-controller">
                <button className={styles.button}>RGB Controller</button>
              </Link>
            </div>
          }
        />
        <Route
          path="/summarizer"
          element={
            <Summarizer
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              isLoggedIn={isLoggedIn}
              handleLogout={handleLogout}
            />
          }
        />
        <Route
          path="/rgb-controller"
          element={
            <RGBController
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              isLoggedIn={isLoggedIn}
              handleLogout={handleLogout}
            />
          }
        />
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        />
      </Routes>
    </div>
  );
}

export default App;