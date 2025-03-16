import { useState } from "react";
import { HfInference } from "@huggingface/inference";
import axios from "axios";
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/register', { username, password });
      setMessage('User registered successfully');
    } catch (error) {
      setMessage('Registration failed');
      console.error('Registration failed:');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username: loginUsername, password: loginPassword });
      setMessage(`Login successful! `);
    } catch (error) {
      setMessage('Login failed');
      console.error('Login failed:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>User Authentication</h1>
        <div className={styles.section}>
          <h2 className={styles.subtitle}>Register</h2>
          <div className={styles.inputWrapper}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className={styles.prettyInput} />
            
          </div>
          <br></br>
          <div className={styles.inputWrapper}>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.prettyInput} />
            
          </div>
          <button onClick={handleRegister} className={styles.button}>Register</button>
        </div>
        <div className={styles.section}>
          <h2 className={styles.subtitle}>Login</h2>
          <div className={styles.inputWrapper}>
            <input type="text" placeholder="Username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className={styles.prettyInput} />
            
          </div>
          <br></br>
          <div className={styles.inputWrapper}>
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={styles.prettyInput} />
          </div>
          <button onClick={handleLogin} className={styles.button}>Login</button>
        </div>
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
