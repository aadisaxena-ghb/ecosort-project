const MODEL = "gemini-2.5-flash";

/**
 * Intelligent local RAG heuristic classifier that generates accurate,
 * contextual waste segregation guidance.
 */
function localClassify(itemDescription, retrievalResult = {}) {
  const itemLower = itemDescription.toLowerCase().trim();
  const matches = retrievalResult.matches || (Array.isArray(retrievalResult) ? retrievalResult : []);
  const hasDirectMatch = retrievalResult.hasDirectMatch ?? (matches.length > 0);

  // 1. High-Priority Nuclear & Radioactive (Word boundaries to prevent false positives)
  if (/\b(uranium|plutonium|thorium|radium|radioactive|nuclear|radiation|isotope|americium)\b/i.test(itemLower)) {
    return {
      category: "hazardous",
      bin_name: "Specialized Radioactive / Nuclear Disposal (DO NOT BIN)",
      reasoning: "Radioactive elements and nuclear substances (such as Uranium or Radium) emit dangerous ionizing radiation. They must NEVER be placed in any household, municipal, or regular trash bin.",
      tip: "Contact national atomic energy authorities or licensed hazardous environmental regulators immediately.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  // 2. High-Priority Industrial Toxic Chemicals
  if (/\b(asbestos|cyanide|hydrochloric|sulfuric|acid|mercury|poison|arsenic|explosive|ammunition|gunpowder)\b/i.test(itemLower)) {
    return {
      category: "hazardous",
      bin_name: "Hazardous Chemical Collection (Red/Black)",
      reasoning: "Corrosive chemicals, toxic poisons, and industrial hazards cannot be processed at municipal compost or recycling facilities.",
      tip: "Keep sealed in original corrosion-resistant containers and schedule a certified hazardous chemical collection.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  // 3. Composite Pizza Box Nuance
  if (itemLower.includes("pizza") && itemLower.includes("box")) {
    return {
      category: "wet",
      bin_name: "Wet / Organic bin (Greasy Part) + Dry (Clean Lid)",
      reasoning: "Oil and grease seep into cardboard fibers, making the base unrecyclable at paper mills. The greasy base goes into wet waste/compost, while the clean top lid can be torn off and placed in the dry recycling bin.",
      tip: "Tear the box into two: clean lid in blue bin, greasy base in green bin.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  // 4. If RAG found a direct keyword match in our rules database, use the top rule!
  if (hasDirectMatch && matches.length > 0 && matches[0]) {
    const top = matches[0];
    return {
      category: top.category || "dry",
      bin_name: top.bin_name || "Dry / Recyclable bin (Blue)",
      reasoning: top.guidance,
      tip: top.tip,
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  // 5. Common Root Word Fallbacks
  if (/\b(egg|eggs|eggshell|banana|apple|fruit|vegetable|rice|bread|peel|peels|leftover|scraps|meat|food|salad|roti|curry|tea|coffee)\b/i.test(itemLower)) {
    return {
      category: "wet",
      bin_name: "Wet / Organic bin (Green)",
      reasoning: "Biodegradable organic matter and food scraps belong in the green wet waste bin for composting.",
      tip: "Keep a small kitchen countertop bin to separate wet food scraps cleanly at the source.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  if (/\b(bottle|paper|cardboard|box|plastic|can|tin|foil|glass|carton|bag|wrapper|metal)\b/i.test(itemLower)) {
    return {
      category: "dry",
      bin_name: "Dry / Recyclable bin (Blue)",
      reasoning: "Clean, dry packaging and recyclable materials belong in the blue dry waste bin.",
      tip: "Rinse food residue from containers before binning to ensure they can be recycled.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  if (/\b(battery|batteries|medicine|pill|tablet|chemical|paint|sanitary|pad|diaper)\b/i.test(itemLower)) {
    return {
      category: "hazardous",
      bin_name: "Hazardous Waste Collection (Red/Yellow)",
      reasoning: "Hazardous, sanitary, and chemical items require dedicated segregation for safe disposal.",
      tip: "Wrap sanitary items in paper and drop batteries/medicines at designated collection kiosks.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  if (/\b(phone|charger|cable|wire|laptop|computer|electronics|bulb|led|plug|device|appliance)\b/i.test(itemLower)) {
    return {
      category: "ewaste",
      bin_name: "E-Waste Collection (Grey/Purple)",
      reasoning: "Electronic accessories and broken devices contain recoverable precious metals alongside toxic flame retardants.",
      tip: "Take old electronic devices to certified municipal or retailer e-waste drop-off bins.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  // 6. Generic Unlisted Item
  return {
    category: "dry",
    bin_name: "Dry / General Waste (Check Local Guidance)",
    reasoning: `No specific rule was found for "${itemDescription}". For standard dry household items, place in the dry waste bin. If organic or food-based, place in the wet compost bin.`,
    tip: "When in doubt, keep recyclables dry and clean to prevent contamination of other materials.",
    isLocalFallback: true,
    engine: "EcoSort Local RAG"
  };
}

/**
 * Classifies an item using Google Gemini API grounded in municipal RAG context.
 */
async function classifyWithContext(itemDescription, contextText, retrievalResult = {}) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return localClassify(itemDescription, retrievalResult);
  }

  const systemInstruction = `You are EcoSort AI, an expert municipal waste-segregation advisor for UN SDG 12.
You are given (a) an item description from a user and (b) grounding context retrieved from a municipal waste-rules knowledge base.
Classify the item into one of the 4 streams:
- "wet": Biodegradable organic matter, food scraps, garden waste, eggshells, fruit peels.
- "dry": Recyclable clean paper, cardboard, plastic containers, glass, clean metals.
- "hazardous": Batteries, medicines, toxic chemicals, radioactive substances (e.g. Uranium/Radium), sanitary biomedical waste.
- "ewaste": Electronic devices, chargers, wires, circuits, broken appliances.

If an item is dangerous or radioactive (like Uranium), classify as "hazardous". If food/eggshell, classify as "wet".

Retrieved Context:
${contextText}

Respond ONLY with valid JSON in this exact shape:
{
  "category": "wet" | "dry" | "hazardous" | "ewaste",
  "bin_name": "short human label",
  "reasoning": "1-2 concise sentences referencing the specific item and safe handling",
  "tip": "one short practical tip"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: itemDescription }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`Gemini API error ${response.status}, using local RAG`);
      return localClassify(itemDescription, retrievalResult);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) return localClassify(itemDescription, retrievalResult);

    const parsed = JSON.parse(candidate);
    parsed.engine = "Google Gemini AI";
    return parsed;
  } catch (err) {
    console.warn("Gemini API call failed, using local RAG:", err.message);
    return localClassify(itemDescription, retrievalResult);
  }
}

module.exports = { classifyWithContext, localClassify };
