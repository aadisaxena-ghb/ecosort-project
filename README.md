# EcoSort AI

An AI-powered advisor that tells you exactly which bin an item belongs in — wet, dry, hazardous, or e-waste — with a short explanation and a habit tip, grounded in real municipal waste-segregation rules.

Built for the **1M1B AI for Sustainability Virtual Internship**, aligned with **UN SDG 12: Responsible Consumption and Production** (secondary: SDG 11, Sustainable Cities and Communities).

## Why this exists

Improper waste segregation at the point of disposal is one of the biggest reasons recyclable material ends up contaminated and sent to landfill anyway. Most people aren't unwilling to sort their waste correctly — they just don't have a fast way to check the right bin for an unusual or ambiguous item. EcoSort AI closes that gap: describe the item in plain language, and get an instant, explained answer.

## Pages

- **Home** (`/`) — landing page with hero, live stat counters, and feature highlights.
- **Try the Tool** (`/tool.html`) — the actual EcoSort AI classifier.
- **Impact & Data** (`/impact.html`) — sourced statistics and charts (Chart.js) on India's waste-management landscape.
- **News** (`/news.html`) — a hand-curated list of recent waste-management developments, linking out to original sources.
- **About** (`/about.html`) — project mission, responsible AI principles, and SDG alignment.

The site includes a fixed side navigation (collapsing to a hamburger menu on mobile), a custom cursor on desktop, and scroll-reveal / count-up animations powered by `public/js/site.js`.

## How it works

```
User input (text)
      │
      ▼
Retrieval step  ──►  looks up the most relevant entries in a local
                      waste-rules knowledge base (server/rules.json)
      │
      ▼
Claude API  ──►  reasons over the retrieved rules and the item
                  description, and returns a structured classification
      │
      ▼
Response  ──►  bin category + plain-language reasoning + a habit tip
```

This is a small, from-scratch **retrieval-augmented generation (RAG)** pipeline: instead of asking the model to guess from general knowledge, the app first retrieves the specific rules relevant to the item (`server/rag.js`) and only then asks Claude to reason over that grounded context (`server/claudeClient.js`). That keeps answers consistent and traceable back to an actual rule, rather than an unexplained model guess.

## Tech stack

- **Backend:** Node.js, Express
- **AI:** Claude API (Anthropic), called server-side so the API key is never exposed to the browser
- **Retrieval:** a lightweight keyword-scoring retriever over a local JSON knowledge base (no external vector database required to run)
- **Frontend:** vanilla HTML/CSS/JavaScript, no build step

## Project structure

```
ecosort-ai/
├── server/
│   ├── index.js          # Express app and API route
│   ├── rag.js             # retrieval logic over the knowledge base
│   ├── rules.json         # waste-segregation knowledge base
│   └── claudeClient.js    # Claude API integration
├── public/
│   ├── index.html          # Home
│   ├── tool.html           # The classifier
│   ├── impact.html         # Stats & charts
│   ├── news.html           # Curated news
│   ├── about.html          # About / mission
│   ├── css/site.css        # Shared design system
│   └── js/
│       ├── site.js         # Sidebar, custom cursor, scroll reveal, counters
│       ├── tool.js         # Classifier frontend logic
│       └── charts.js       # Chart.js configs for the Impact page
├── .env.example
├── package.json
└── README.md
```

## Running it locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add your API key**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and paste in a Claude API key from [console.anthropic.com](https://console.anthropic.com/).

3. **Start the server**
   ```bash
   npm start
   ```

4. Open **http://localhost:3000** in your browser.

## Responsible AI considerations

- **Fairness:** the retriever matches on plain-language keywords (not a single fixed vocabulary), so varied ways of describing the same item still surface the right context.
- **Transparency:** every response states the reasoning behind the classification, referencing the retrieved rule rather than giving an unexplained verdict.
- **Ethics:** positioned as a guidance tool for everyday items, not a substitute for professional handling of hazardous, medical, or biomedical waste.
- **Privacy:** only the item description is sent to the model; no personal data is collected or stored.

## Possible extensions

- Swap `server/rules.json` for a specific city's or campus's actual waste-segregation policy document.
- Add image input so users can photograph an item instead of describing it.
- Persist query history per user to show impact over time (e.g. items correctly sorted per week).
- Replace the keyword retriever with real embedding-based vector search for larger rule sets.

## Author

Aadi Saxena — SRMIST Delhi-NCR, Ghaziabad
Built as the final project for the 1M1B AI for Sustainability Virtual Internship (in collaboration with IBM SkillsBuild & AICTE).
