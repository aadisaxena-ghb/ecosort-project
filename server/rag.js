const fs = require("fs");
const path = require("path");

function getRules() {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "rules.json"), "utf-8")
  );
}

/**
 * Robust tokenized and bidirectional keyword retrieval.
 */
function retrieve(query, topK = 4) {
  const rules = getRules();
  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/[\s,./\-_+]+/).filter((t) => t.length > 0);

  const scored = rules.map((rule) => {
    let score = 0;
    for (const keyword of rule.keywords) {
      const kLower = keyword.toLowerCase().trim();
      const kTokens = kLower.split(/\s+/);

      // Exact full match
      if (cleanQuery === kLower) {
        score += 100 + kLower.length * 2;
      }
      // Substring match
      else if (cleanQuery.includes(kLower)) {
        score += 50 + kLower.length;
      }
      // Token overlap
      else if (queryTokens.some((qt) => qt === kLower || kTokens.includes(qt))) {
        score += 30 + kLower.length;
      }
      // Query token is prefix/substring of keyword
      else if (queryTokens.some((qt) => qt.length >= 3 && kLower.includes(qt))) {
        score += 15;
      }
    }
    return { rule, score };
  });

  const matched = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  if (matched.length > 0) {
    return {
      matches: matched.slice(0, topK).map((s) => s.rule),
      hasDirectMatch: true,
      topScore: matched[0].score
    };
  }

  // Fallback balanced sample
  const fallback = [];
  const seen = new Set();
  for (const rule of rules) {
    if (!seen.has(rule.category)) {
      fallback.push(rule);
      seen.add(rule.category);
    }
  }

  return {
    matches: fallback,
    hasDirectMatch: false,
    topScore: 0
  };
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
