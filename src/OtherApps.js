import React from "react";
import { Link } from "react-router-dom";
import styles from "./App.module.css";

function OtherApps({ darkMode, toggleDarkMode }) {
  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ""}`}>
      <Link to="/home">
        <button className={styles.topNavButton}>Home</button>
      </Link>
      <h1 className={styles.title}>Other Apps</h1>
      <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <div className={styles.summarizerCard}>
        <p>Explore more apps here! (Placeholder for future content.)</p>
        <Link to="/">
          <button className={styles.button}>Back to Summarizer</button>
        </Link>
      </div>
    </div>
  );
}

export default OtherApps;