# EcoSort AI 🌿

An intelligent, AI-powered waste segregation advisor that tells you exactly which bin an item belongs in — **Wet**, **Dry**, **Hazardous**, or **E-Waste** — with clear reasoning and practical habit tips, grounded in municipal waste-segregation rules.

Aligned with **UN SDG 12: Responsible Consumption and Production** (secondary: SDG 11, Sustainable Cities and Communities).

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

## 🛠️ Tech Stack & AI Integration

- **AI Ideation & Workflow Design:** **IBM BOB** (used during Design Thinking stages to frame personas, define problem statements, and curate the municipal rules dataset).
- **AI Classification Engine:** Google Gemini API (`gemini-2.5-flash`), paired with a lightweight Retrieval-Augmented Generation (RAG) pipeline.
- **Backend:** Node.js, Express
- **Frontend:** Vanilla HTML5, CSS3 Custom Properties (Design Tokens & Glassmorphism), Vanilla JavaScript, Chart.js
- **No Heavy Build Steps:** Fast, lightweight, and responsive across all devices.

---

## 💡 Incorporation of IBM BOB

**IBM BOB** was incorporated into the project lifecycle across multiple stages:
1. **Ideation & Problem Definition (Stage 1 & 2):** Used IBM BOB to analyze municipal waste reports (CPCB), profile user pain points, and craft the central Design Thinking question: *"How might we use AI to guide instant, accurate waste segregation so that households and campuses can become more sustainable?"*
2. **Knowledge Base Structuring:** Utilized IBM BOB to extract and organize Indian Solid Waste Management (SWM) rules into structured JSON grounding categories (Wet, Dry, Hazardous, E-Waste).
3. **Prompt & RAG Architecture Design:** Iteratively refined system prompts and contextual retrieval schemas with IBM BOB to ensure explainable, hallucination-free outputs.

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

**Aadi Saxena** — Full-Stack AI Engineer · Creator of EcoSort AI  
[GitHub Profile](https://github.com/aadisaxena-ghb)

