import { useState } from "react";
import { HfInference } from "@huggingface/inference";
import styles from "./App.module.css"; // Import the CSS Module

const hf = new HfInference("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");

function App() {
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
        {/* Left Section */}
        <div className={styles.leftSection}>
          <textarea
            className={styles.textarea}
            rows="5"
            placeholder="Enter your notes..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className={styles.button}
            onClick={handleSummarize}
            disabled={loading}
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>

        {/* Right Section for Saved Summaries */}
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

export default App;
