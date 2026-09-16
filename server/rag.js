const fs = require("fs");
const path = require("path");

function getRules() {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "rules.json"), "utf-8")
  );
}

/**
 * Intelligent keyword and semantic retrieval over municipal waste rules.
 */
function retrieve(query, topK = 4) {
  const rules = getRules();
  const normalizedQuery = query.toLowerCase();

  const scored = rules.map((rule) => {
    let score = 0;
    for (const keyword of rule.keywords) {
      const kLower = keyword.toLowerCase();
      if (normalizedQuery.includes(kLower)) {
        // Boost exact matches and longer specific keywords
        score += kLower.length * (normalizedQuery === kLower ? 3 : 1.5);
      }
    }
    return { rule, score };
  });

  const matched = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  if (matched.length > 0) {
    return matched.slice(0, topK).map((s) => s.rule);
  }

  // If no match was found, return a balanced sample from each category
  const fallback = [];
  const seen = new Set();
  for (const rule of rules) {
    if (!seen.has(rule.category)) {
      fallback.push(rule);
      seen.add(rule.category);
    }
  }
  return fallback;
}

function formatContext(matches) {
  return matches
    .map(
      (m, i) =>
        `${i + 1}. [${m.category}] ${m.bin_name}\n   Guidance: ${m.guidance}\n   Habit tip: ${m.tip}`
    )
    .join("\n\n");
}

module.exports = { retrieve, formatContext };
