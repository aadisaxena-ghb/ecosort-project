# EcoSort AI 🌿

An intelligent, AI-powered waste segregation advisor that tells you exactly which bin an item belongs in — **Wet**, **Dry**, **Hazardous**, or **E-Waste** — with clear reasoning and practical habit tips, grounded in municipal waste-segregation rules.

Built for the **1M1B AI for Sustainability Virtual Internship**, aligned with **UN SDG 12: Responsible Consumption and Production** (secondary: SDG 11, Sustainable Cities and Communities).

---

## 🌟 Key Features

- 💬 **Smart AI Advisor:** Describe any item in natural language for instant classification.
- 📸 **Camera & Photo Scanner:** Drag-and-drop photos or capture images with your webcam/camera.
- 🧠 **Smart Offline RAG AI:** Functions immediately out of the box with zero setup (and connects seamlessly to **Google Gemini AI** when configured).
- 🌓 **Dark & Light Mode:** Modern glassmorphism interface with instant theme switching and persistent memory.
- 📖 **Searchable Waste Directory:** Browse and filter 20+ municipal waste items by stream.
- 🏆 **Eco-Quiz, Streaks & Badges:** Gamified 5-round interactive recycling quiz with streak tracking and unlockable badges.
- 📊 **Household Impact Calculator:** Interactive footprint calculator estimating annual landfill diversion, CO₂e saved, and compost generated.

---

## 🚀 How it works

```
User Input (Text / Photo)
       │
       ▼
Retrieval Step  ──►  Fetches the most relevant grounding rules from
                     the municipal knowledge base (server/rules.json)
       │
       ▼
Google Gemini AI ──► Reasons over the grounding rules and item query,
                     returning structured classification JSON
       │
       ▼
Response        ──►  Bin Category + Color Tag + Plain-Language Reason + Habit Tip
```

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **AI:** Google Gemini API (`gemini-2.5-flash`), with built-in smart local RAG fallback
- **Frontend:** Vanilla HTML5, CSS3 Custom Properties (Design Tokens & Glassmorphism), Vanilla JavaScript, Chart.js
- **No Heavy Build Steps:** Fast, lightweight, and responsive across all devices.

---

## 📁 Project Structure

```
ecosort-ai/
├── server/
│   ├── index.js          # Express app & API routes (/api/classify, /api/rules, /api/quiz)
│   ├── rag.js            # Retrieval logic over municipal knowledge base
│   ├── rules.json        # Expanded waste-segregation rules knowledge base
│   └── geminiClient.js   # Google Gemini AI client with smart local fallback
├── public/
│   ├── index.html        # Home & Hero Showcase
│   ├── tool.html         # Sorter (Text Advisor, Camera Scanner, Directory, Quiz)
│   ├── impact.html       # Analytics, Charts & Household Impact Calculator
│   ├── news.html         # Curated sustainability news
│   ├── about.html        # Project mission & SDG 12 alignment
│   ├── css/site.css      # Modern design system (Light/Dark mode, animations)
│   └── js/
│       ├── site.js       # Theme toggle, daily streak tracker, navigation
│       ├── tool.js       # Tab controller, camera upload, directory, quiz
│       └── charts.js     # Interactive impact calculator & Chart.js configs
├── .env.example
├── package.json
└── README.md
```

---

## 🏃 Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **(Optional) Add your Google Gemini API Key:**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: EcoSort AI works seamlessly out of the box even without an API key using its built-in local RAG engine!)*

3. **Start the server:**
   ```bash
   npm start
   ```

4. Open **http://localhost:3000** in your browser.

---

## 👤 Author

**Aadi Saxena** — SRMIST Delhi-NCR, Ghaziabad  
Built as the final project for the 1M1B AI for Sustainability Virtual Internship (in collaboration with IBM SkillsBuild & AICTE).
