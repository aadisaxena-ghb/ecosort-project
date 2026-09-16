const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

/**
 * Intelligent local RAG heuristic classifier that generates rich,
 * contextual waste segregation guidance even when no external API key is set.
 */
function localClassify(itemDescription, matches) {
  const topMatch = matches[0] || {
    category: "dry",
    bin_name: "Dry / Recyclable bin",
    guidance: "Most dry non-organic household packaging should be segregated into dry waste.",
    tip: "Keep recyclables clean and dry before disposal."
  };

  const itemLower = itemDescription.toLowerCase();

  // Fine-tune reasoning based on specific query nuances
  let reasoning = `${topMatch.guidance}`;
  let tip = `${topMatch.tip}`;
  let binName = topMatch.bin_name;
  let category = topMatch.category;

  if (itemLower.includes("pizza") && itemLower.includes("box")) {
    category = "wet";
    binName = "Wet / Organic bin (Greasy Part) + Dry (Clean Lid)";
    reasoning = "Oil and grease seep into cardboard fibers, making the base unrecyclable at paper mills. The greasy base goes into wet waste/compost, while the clean top lid can be torn off and placed in the dry recycling bin.";
    tip = "Tear the box into two: clean lid in blue bin, greasy base in green bin.";
  } else if (itemLower.includes("battery") || itemLower.includes("power bank")) {
    category = "hazardous";
    binName = "Hazardous Waste Collection (Red/Black)";
    reasoning = "Batteries contain reactive heavy metals (lithium, lead, cadmium) that can cause landfill fires or toxic leachate. They must never go into normal household bins.";
    tip = "Tape over the terminals with clear adhesive tape and drop them at an e-waste or hazardous waste collection kiosk.";
  } else if (itemLower.includes("medicine") || itemLower.includes("tablet") || itemLower.includes("pill")) {
    category = "hazardous";
    binName = "Hazardous / Pharmacy Return (Red)";
    reasoning = "Pharmaceuticals can leach active compounds into public waterways and soil. They require high-temperature incineration or pharmacy return.";
    tip = "Check if your local pharmacy runs a 'take-back' program for expired medications.";
  } else if (itemLower.includes("phone") || itemLower.includes("charger") || itemLower.includes("cable") || itemLower.includes("wire")) {
    category = "ewaste";
    binName = "E-Waste Collection (Grey/Purple)";
    reasoning = "Cables and electronics contain valuable metals (copper, gold) and plastic insulation that require specialized e-waste disassembly and shredding.";
    tip = "Bundle loose cables with a twist tie and store them in an e-waste box until your next bulk drop-off.";
  } else if (itemLower.includes("glass") || itemLower.includes("bottle")) {
    category = "dry";
    binName = "Dry / Glass Recyclable (Blue)";
    reasoning = "Glass is 100% endlessly recyclable and does not lose quality across recycling cycles.";
    tip = itemLower.includes("broken") 
      ? "Wrap broken glass pieces in newspaper or cardboard and label clearly before placing in the dry bin."
      : "Rinse out liquids and leave the metal/plastic cap on or recycle separately according to local bin rules.";
  }

  return {
    category,
    bin_name: binName,
    reasoning,
    tip,
    isLocalFallback: true
  };
}

async function classifyWithContext(itemDescription, contextText, retrievedMatches = []) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  // If no API key is provided, use our high-accuracy local RAG classifier
  if (!apiKey || apiKey === "your_anthropic_api_key_here") {
    return localClassify(itemDescription, retrievedMatches);
  }

  const systemPrompt = `You are EcoSort AI, a waste-segregation advisor. You are given (a) an item description from a user and (b) grounding context retrieved from a municipal waste-rules knowledge base. Use ONLY the retrieved context to decide the category — do not invent rules beyond it. If the item mixes categories, pick the single most important one for safe handling and explain the nuance.

Retrieved context:
${contextText}

Respond ONLY with valid JSON, no markdown fences, no preamble, in this exact shape:
{"category": "wet|dry|hazardous|ewaste", "bin_name": "short human label", "reasoning": "1-2 sentences referencing the specific item(s) and the retrieved guidance", "tip": "one short, concrete habit tied to this specific item"}`;

  try {
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
      console.warn(`Claude API returned status ${response.status}. Falling back to local RAG engine.`);
      return localClassify(itemDescription, retrievedMatches);
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    if (!textBlock) return localClassify(itemDescription, retrievedMatches);

    const cleaned = textBlock.text.trim().replace(/^```json\s*|```$/g, "");
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("Claude API call failed, using local RAG fallback:", err.message);
    return localClassify(itemDescription, retrievedMatches);
  }
}

module.exports = { classifyWithContext, localClassify };
