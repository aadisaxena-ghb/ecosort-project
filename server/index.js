require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { retrieve, formatContext } = require("./rag");
const { classifyWithContext } = require("./claudeClient");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.post("/api/classify", async (req, res) => {
  const { item } = req.body || {};

  if (!item || typeof item !== "string" || !item.trim()) {
    return res.status(400).json({ error: "Please provide an 'item' description." });
  }

  try {
    const matches = retrieve(item, 4);
    const context = formatContext(matches);
    const result = await classifyWithContext(item.trim(), context);
    res.json({ result, retrieved: matches.map((m) => m.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`EcoSort AI server running at http://localhost:${PORT}`);
});
