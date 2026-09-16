const MODEL = "gemini-2.5-flash";

/**
 * Intelligent local RAG heuristic classifier that generates rich,
 * contextual waste segregation guidance when no external API key is set.
 */
function localClassify(itemDescription, matches = []) {
  const itemLower = itemDescription.toLowerCase();

  // 1. High Priority Hazard & Nuclear Checks
  if (/uranium|plutonium|thorium|radium|radioactive|nuclear|isotope|radiation/.test(itemLower)) {
    return {
      category: "hazardous",
      bin_name: "Specialized Radioactive / Nuclear Disposal (DO NOT BIN)",
      reasoning: "Radioactive elements and nuclear substances (such as Uranium or Radium) emit ionizing radiation. They pose extreme public health risks and must NEVER be placed in any household or municipal waste bin.",
      tip: "Contact national atomic energy authorities or authorized environmental hazardous containment facilities immediately.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  if (/asbestos|cyanide|hydrochloric|sulfuric|acid|mercury|poison|arsenic|explosive|ammunition|gunpowder/.test(itemLower)) {
    return {
      category: "hazardous",
      bin_name: "Hazardous Chemical Collection (Red/Black)",
      reasoning: "Corrosive chemicals, industrial poisons, and hazardous materials cannot be treated at municipal facilities and pose toxic fire or burn hazards.",
      tip: "Keep sealed in original corrosion-resistant containers and schedule a certified hazardous chemical collection.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  // 2. Specific composite/mixed item heuristics
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

  if (/battery|batteries|power bank|lithium|cell/.test(itemLower)) {
    return {
      category: "hazardous",
      bin_name: "Hazardous Waste Collection (Red/Black)",
      reasoning: "Batteries contain reactive heavy metals (lithium, lead, cadmium) that can cause landfill fires or toxic groundwater leaching. They must never go into normal household bins.",
      tip: "Tape over battery terminals with clear tape and drop off at an e-waste or battery recycling bin.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  if (/medicine|tablet|pill|syrup|capsule|blister pack|syringe/.test(itemLower)) {
    return {
      category: "hazardous",
      bin_name: "Hazardous / Pharmacy Return (Red/Yellow)",
      reasoning: "Pharmaceuticals can contaminate municipal water systems and encourage antimicrobial resistance. They require high-temperature incineration or pharmacy return.",
      tip: "Take expired medicines back to participating pharmacies with drug take-back boxes.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  if (/phone|charger|cable|wire|laptop|computer|electronics|keyboard|mouse|headphone|earphone/.test(itemLower)) {
    return {
      category: "ewaste",
      bin_name: "E-Waste Collection (Grey/Purple)",
      reasoning: "Electronics and accessories contain recyclable copper and gold alongside toxic flame retardants, requiring dedicated e-waste recycling.",
      tip: "Store electronics safely until you can drop them at an e-waste collection drive or authorized retail kiosk.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  if (/glass|bottle|jar/.test(itemLower)) {
    const isBroken = /broken|shatter/.test(itemLower);
    return {
      category: "dry",
      bin_name: "Dry / Recyclable bin (Blue)",
      reasoning: "Glass is 100% endlessly recyclable dry waste.",
      tip: isBroken
        ? "Wrap broken glass pieces securely in newspaper and mark 'BROKEN GLASS' to protect sanitation workers."
        : "Give the bottle a quick rinse and recycle with dry recyclables.",
      isLocalFallback: true,
      engine: "EcoSort Local RAG"
    };
  }

  // 3. Fallback to top matched rule from knowledge base if score matched
  if (matches.length > 0 && matches[0]) {
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

  // 4. Truly unrecognized generic item
  return {
    category: "dry",
    bin_name: "Dry / General Waste (Blue/Grey)",
    reasoning: `No specific municipal rule was found for "${itemDescription}". For standard dry, non-hazardous household items, place in the dry waste bin. For chemical or electronic items, check with local authorities.`,
    tip: "When in doubt, keep recyclables dry and clean to prevent contamination of other materials.",
    isLocalFallback: true,
    engine: "EcoSort Local RAG"
  };
}

/**
 * Classifies an item using Google Gemini API grounded in municipal RAG context.
 */
async function classifyWithContext(itemDescription, contextText, retrievedMatches = []) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return localClassify(itemDescription, retrievedMatches);
  }

  const systemInstruction = `You are EcoSort AI, an expert municipal waste-segregation advisor for UN SDG 12.
You are given (a) an item description from a user and (b) grounding context retrieved from a municipal waste-rules knowledge base.
Classify the item into one of the 4 streams:
- "wet": Biodegradable organic matter, food scraps, garden waste.
- "dry": Recyclable clean paper, cardboard, plastic containers, glass, clean metals.
- "hazardous": Batteries, medicines, toxic chemicals, radioactive substances (e.g. Uranium/Radium), sanitary biomedical waste.
- "ewaste": Electronic devices, chargers, wires, circuits, broken appliances.

If an item is dangerous, toxic, or radioactive (like Uranium), you MUST classify it as "hazardous" with specialized warning.

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
      console.warn(`Gemini API error ${response.status}, falling back to local classifier`);
      return localClassify(itemDescription, retrievedMatches);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) return localClassify(itemDescription, retrievedMatches);

    const parsed = JSON.parse(candidate);
    parsed.engine = "Google Gemini AI";
    return parsed;
  } catch (err) {
    console.warn("Gemini API call failed, using local RAG:", err.message);
    return localClassify(itemDescription, retrievedMatches);
  }
}

module.exports = { classifyWithContext, localClassify };
