import React from "react";
import { Link } from "react-router-dom";
import styles from "./App.module.css";

function Home({ darkMode, toggleDarkMode }) {
  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ""}`}>
      <h1 className={styles.title}>Home</h1>
      <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <div className={styles.summarizerCard}>
        <p>Welcome to the Home page!</p>
        <Link to="/other-apps">
          <button className={styles.button}>Go to Other Apps</button>
        </Link>
        <Link to="/">
          <button className={styles.button}>Back to Summarizer</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;