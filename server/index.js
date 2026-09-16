require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { retrieve, formatContext } = require("./rag");
const { classifyWithContext } = require("./geminiClient");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Load rules
const rulesPath = path.join(__dirname, "rules.json");
let rulesData = [];
try {
  rulesData = JSON.parse(fs.readFileSync(rulesPath, "utf-8"));
} catch (e) {
  console.error("Error reading rules.json:", e);
}

// Health check
app.get("/api/health", (req, res) => {
  const hasKey = Boolean(
    (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") ||
    (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== "your_google_api_key_here")
  );

  res.json({
    status: "ok",
    aiProvider: "Google Gemini",
    hasApiKey: hasKey,
    rulesCount: rulesData.length
  });
});

// All rules for directory search
app.get("/api/rules", (req, res) => {
  const { category, search } = req.query;
  let results = [...rulesData];

  if (category && category !== "all") {
    results = results.filter((r) => r.category === category);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter((r) =>
      r.keywords.some((k) => k.toLowerCase().includes(q)) ||
      r.bin_name.toLowerCase().includes(q) ||
      r.guidance.toLowerCase().includes(q)
    );
  }

  res.json({ rules: results });
});

// Curated Eco-Quiz Questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Where should a greasy pizza box base go?",
    options: [
      { text: "Dry / Blue Recycling Bin", isCorrect: false },
      { text: "Wet / Organic Bin (Greasy part cannot be recycled)", isCorrect: true },
      { text: "Hazardous Waste", isCorrect: false },
      { text: "E-Waste Bin", isCorrect: false }
    ],
    explanation: "Food oil and grease contaminate paper recycling fibers. Tear off the clean lid for recycling, and compost the greasy base!"
  },
  {
    id: 2,
    question: "How should you prepare a plastic shampoo bottle before binning it?",
    options: [
      { text: "Throw it as-is with liquid inside", isCorrect: false },
      { text: "Quick water rinse, empty it, and place in Dry/Recyclable bin", isCorrect: true },
      { text: "Put it in the hazardous waste bin", isCorrect: false },
      { text: "Burn it in backyard", isCorrect: false }
    ],
    explanation: "Residual chemicals/fluids can ruin a full batch of recyclables. A quick rinse ensures high-grade recycling."
  },
  {
    id: 3,
    question: "What is the safest way to dispose of old AA batteries?",
    options: [
      { text: "Throw in regular wet waste", isCorrect: false },
      { text: "Throw in dry recycling bin", isCorrect: false },
      { text: "Tape the terminals and drop off at an E-Waste / Hazardous kiosk", isCorrect: true },
      { text: "Bury them in garden soil", isCorrect: false }
    ],
    explanation: "Batteries contain toxic heavy metals (lithium, lead) that leach into water tables or cause fire hazards in trucks."
  },
  {
    id: 4,
    question: "What should you do with broken glass before throwing it away?",
    options: [
      { text: "Wrap securely in newspaper/box and label 'BROKEN GLASS'", isCorrect: true },
      { text: "Toss it loose into the plastic bin", isCorrect: false },
      { text: "Flush it down the toilet", isCorrect: false },
      { text: "Put it in the compost pile", isCorrect: false }
    ],
    explanation: "Wrapping and labeling broken glass protects sanitation workers and waste collectors from serious hand injuries."
  },
  {
    id: 5,
    question: "Can aluminum foil be recycled?",
    options: [
      { text: "No, foil is non-recyclable", isCorrect: false },
      { text: "Yes! Clean foil scrunched into a tight ball is 100% recyclable", isCorrect: true },
      { text: "Only if melted at home first", isCorrect: false },
      { text: "Only in the wet waste bin", isCorrect: false }
    ],
    explanation: "Aluminum is endlessly recyclable without quality loss. Scrunching foil prevents small pieces from blowing away at sorting centers."
  }
];

app.get("/api/quiz", (req, res) => {
  res.json({ questions: QUIZ_QUESTIONS });
});

// Waste classification endpoint
app.post("/api/classify", async (req, res) => {
  const { item } = req.body || {};

  if (!item || typeof item !== "string" || !item.trim()) {
    return res.status(400).json({ error: "Please provide an 'item' description." });
  }

  try {
    const retrievalResult = retrieve(item, 4);
    const matches = retrievalResult.matches || [];
    const context = formatContext(matches);
    const result = await classifyWithContext(item.trim(), context, retrievalResult);
    res.json({ result, retrieved: matches.map((m) => m.id) });
  } catch (err) {
    console.error("Classification error:", err);
    res.status(500).json({ error: err.message || "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`EcoSort AI server running at http://localhost:${PORT}`);
});
