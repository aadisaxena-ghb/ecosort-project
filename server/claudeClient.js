const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

async function classifyWithContext(itemDescription, contextText) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key."
    );
  }

  const systemPrompt = `You are EcoSort AI, a waste-segregation advisor. You are given (a) an item description from a user and (b) grounding context retrieved from a municipal waste-rules knowledge base. Use ONLY the retrieved context to decide the category — do not invent rules beyond it. If the item mixes categories, pick the single most important one for safe handling and explain the nuance.

Retrieved context:
${contextText}

Respond ONLY with valid JSON, no markdown fences, no preamble, in this exact shape:
{"category": "wet|dry|hazardous|ewaste", "bin_name": "short human label", "reasoning": "1-2 sentences referencing the specific item(s) and the retrieved guidance", "tip": "one short, concrete habit tied to this specific item"}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: itemDescription }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text content in Claude's response");

  const cleaned = textBlock.text.trim().replace(/^```json\s*|```$/g, "");
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Could not parse Claude's response as JSON: " + cleaned);
  }
}

module.exports = { classifyWithContext };
