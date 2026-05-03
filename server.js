require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/desiRoastDB");

// Schema
const Content = mongoose.model("Content", {
  input: String,
  output: String
});

// 🔥 AI Roast Generator
async function generateContent(input, lang="English", style="normal") {

  let extra = "";

  if (style === "mrbeast") {
    extra = "Make it extremely dramatic and exaggerated.";
  }

  if (style === "emotional") {
    extra = "Make it sarcastic but funny emotional.";
  }

  const prompt = `
You are a savage, funny Indian (desi) roast generator.

Create:
1 short savage roast
1 funny punchline
1 exaggerated insult (funny, not abusive)

${extra}
Language: ${lang}
Topic: ${input}

Make it:
- Funny 😆
- Relatable to Indian audience 🇮🇳
- Shareable (Instagram/Reels style)
`;

  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  return res.data.choices[0].message.content;
}

// API
app.post("/generate", async (req, res) => {
  const { input, lang, style } = req.body;

  const output = await generateContent(input, lang, style);

  await Content.create({ input, output });

  res.json({ output });
});

// History
app.get("/history", async (req, res) => {
  const data = await Content.find().sort({ _id: -1 }).limit(20);
  res.json(data);
});

app.listen(5000, () => console.log("🔥 Server running on http://localhost:5000"));
