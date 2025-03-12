require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const HF_API_KEY = "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"; // Replace with your Hugging Face API Key

app.post("/chat", async (req, res) => {

    res.json({ message: "Chat endpoint is working!" });
  try {
    const { input } = req.body;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct",
      { inputs: input },
      {
        headers: { Authorization: `Bearer ${HF_API_KEY}` },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
