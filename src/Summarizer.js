import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./App.module.css";

const HF_API_TOKEN = "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";
const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

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
      interval = setInterval(() => setProgress((prev) => (prev < 90 ? prev + 10 : prev)), 500);
    } else {
      setProgress(100);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSummarize = async () => {
    if (!text) return alert("Please enter some text!");
    if (wordCount > MAX_WORDS) return alert(`Text exceeds ${MAX_WORDS} words. Current: ${wordCount}.`);
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        HF_API_URL,
        { inputs: text, parameters: { max_length: 100, min_length: 30 } },
        { headers: { Authorization: `Bearer ${HF_API_TOKEN}`, "Content-Type": "application/json" } }
      );
      const summaryText = response.data[0].summary_text;
      setSummary(summaryText);
      setSavedSummaries([...savedSummaries, summaryText]);
      if (token) {
        await axios.post("https://ai-note-summarizer.onrender.com/summaries", { token, summary: summaryText });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
    setLoading(false);
  };

  const toggleHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in to view past summaries.");
    if (!showHistory) {
      try {
        const response = await axios.get("https://ai-note-summarizer.onrender.com/summaries", { params: { token } });
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
      <Link to="/App">
        <button className={styles.topNavButton}>Home</button>
      </Link>
      <h1 className={styles.title}>Mary AI</h1>
      <button className={styles.pastSummariesButton} onClick={toggleHistory}>
        {showHistory ? "Hide History" : "Past Summaries"}
      </button>
      {isLoggedIn && (
        <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
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
            {wordCount > MAX_WORDS && <span className={styles.wordCountError}> (Exceeds limit!)</span>}
          </div>
          <button className={styles.button} onClick={handleSummarize} disabled={loading}>
            {loading ? "Summarizing..." : "Summarize"}
          </button>
          {loading && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
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

export default Summarizer;