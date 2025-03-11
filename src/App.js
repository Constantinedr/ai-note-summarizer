import { useState } from "react";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference("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"); 

function App() {
  const [text, setText] = useState("");  
  const [summary, setSummary] = useState("");  
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!text) return alert("Please enter some text!");
    setLoading(true);

    try {
      const result = await hf.summarization({
        model: "facebook/bart-large-cnn",  // Pre-trained summarization model
        inputs: text
      });

      setSummary(result.summary_text);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong! Check your API key.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>AI Note Summarizer</h1>
      <textarea
        rows="5"
        style={{ width: "100%", padding: "10px" }}
        placeholder="Enter your notes..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleSummarize} style={{ marginTop: "10px" }} disabled={loading}>
        {loading ? "Summarizing..." : "Summarize"}
      </button>
      {summary && (
        <div style={{ marginTop: "20px", padding: "10px", background: "#f0f0f0" }}>
          <strong>Summary:</strong>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default App;
