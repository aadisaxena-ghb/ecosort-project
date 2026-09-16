const fs = require("fs");
const path = require("path");

const rules = JSON.parse(
  fs.readFileSync(path.join(__dirname, "rules.json"), "utf-8")
);

/**
 * Very small retrieval function: scores each rule entry by how many of
 * its keywords appear in the user's query, and returns the top matches.
 * This stands in for a vector-search retriever — same role in the
 * pipeline (fetch the most relevant grounding text before generation),
 * simplified so it needs no external embedding service to run.
 */
function retrieve(query, topK = 4) {
  const normalizedQuery = query.toLowerCase();

  const scored = rules.map((rule) => {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        // longer keyword matches count for more (more specific match)
        score += keyword.length;
      }
    }
    return { rule, score };
  });

  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.rule);

  // Fallback: if nothing matched by keyword, hand over one example from
  // each category so the model still has grounding context to reason from.
  if (matches.length === 0) {
    const seen = new Set();
    for (const rule of rules) {
      if (!seen.has(rule.category)) {
        matches.push(rule);
        seen.add(rule.category);
      }
    }
  }

  return matches;
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
