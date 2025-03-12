import { useState } from "react";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference("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"); // Replace with your Hugging Face API key

function App() {
  const [input, setInput] = useState("");  
  const [response, setResponse] = useState("");  
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (!input) return alert("Please enter a message!");
    setLoading(true);

    try {
      const result = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.1", // Mistral 7B Chat Model
        inputs: input,
        parameters: { max_new_tokens: 200, temperature: 0.7 }
      });

      setResponse(result.generated_text);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong! Check your API key.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>AI Chatbot (Mistral-7B)</h1>
      <textarea
        rows="3"
        style={{ width: "100%", padding: "10px" }}
        placeholder="Ask something..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleChat} style={{ marginTop: "10px" }} disabled={loading}>
        {loading ? "Thinking..." : "Send"}
      </button>
      {response && (
        <div style={{ marginTop: "20px", padding: "10px", background: "#f0f0f0" }}>
          <strong>AI Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
