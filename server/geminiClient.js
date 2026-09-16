const MODEL = "gemini-2.5-flash";

/**
 * Intelligent local RAG heuristic classifier that generates rich,
 * contextual waste segregation guidance when no external API key is set.
 */
function localClassify(itemDescription, matches = []) {
  const topMatch = matches[0] || {
    category: "dry",
    bin_name: "Dry / Recyclable bin (Blue)",
    guidance: "Most dry non-organic household packaging should be segregated into dry waste.",
    tip: "Keep recyclables clean and dry before disposal."
  };

  const itemLower = itemDescription.toLowerCase();

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
    isLocalFallback: true,
    engine: "EcoSort Local RAG"
  };
}

/**
 * Classifies an item using Google Gemini API grounded in municipal RAG context.
 */
async function classifyWithContext(itemDescription, contextText, retrievedMatches = []) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  // If no Google API key is configured, use local RAG classifier
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return localClassify(itemDescription, retrievedMatches);
  }

  const systemInstruction = `You are EcoSort AI, an expert municipal waste-segregation advisor for UN SDG 12.
You are given (a) an item description from a user and (b) grounding context retrieved from a municipal waste-rules knowledge base.
Use the retrieved context to decide the category (wet, dry, hazardous, ewaste). If the item mixes categories, pick the single most important one for safe handling and explain the nuance.

Retrieved Context:
${contextText}

You must return valid JSON matching this schema:
{
  "category": "wet" | "dry" | "hazardous" | "ewaste",
  "bin_name": "short human label (e.g. Wet / Organic bin (Green))",
  "reasoning": "1-2 concise sentences referencing the specific item and grounding guidance",
  "tip": "one short, concrete habit tied to this item"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: itemDescription }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.2,
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
      const errText = await response.text();
      console.warn(`Google Gemini API error (${response.status}): ${errText}. Using local RAG fallback.`);
      return localClassify(itemDescription, retrievedMatches);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) return localClassify(itemDescription, retrievedMatches);

    const parsed = JSON.parse(candidate);
    parsed.engine = "Google Gemini AI";
    return parsed;
  } catch (err) {
    console.warn("Gemini API call exception, using local RAG fallback:", err.message);
    return localClassify(itemDescription, retrievedMatches);
  }
}

module.exports = { classifyWithContext, localClassify };
