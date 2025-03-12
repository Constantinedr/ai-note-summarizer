import { useState } from "react";
import { HfInference } from "@huggingface/inference";

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
    
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-6">AI Note Summarizer</h1>
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-xl items-center justify-center">
        {/* Left Section */}
        <div className="w-full md:w-2/3 p-6 flex flex-col items-center justify-center">
          <textarea
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="5"
            placeholder="Enter your notes..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white font-bold py-2 px-4 rounded mt-4 disabled:opacity-50"
            onClick={handleSummarize}
            disabled={loading}
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>
        
        {/* Right Section for Saved Summaries */}
        <div className="w-full md:w-1/3 p-6 border-t md:border-l border-gray-700 overflow-y-auto max-h-96 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4 text-center">Saved Summaries</h2>
          {savedSummaries.length === 0 ? (
            <p className="text-gray-400 text-center">No summaries saved yet.</p>
          ) : (
            <ul className="space-y-3 w-full flex flex-col items-center">
              {savedSummaries.map((item, index) => (
                <li key={index} className="p-3 bg-gray-700 rounded-lg shadow text-center w-full">
                  <strong>Summary {index + 1}:</strong>
                  <p className="text-gray-300">{item}</p>
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
