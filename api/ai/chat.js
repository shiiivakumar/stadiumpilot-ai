// Vercel Serverless Function: /api/ai/chat
import { generateFallbackFanResponse } from './_aiHelper.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, context, lang } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Safe input length limit defense
  const safeMessage = (message || '').substring(0, 500);

  if (apiKey) {
    const prompt = `
      You are "StadiumPilot AI", a conversational fan assistant for a large 2026 stadium tournament (not officially affiliated with FIFA).
      The user is asking: "${safeMessage}"
      
      Current Stadium Context:
      - active scenario: ${context?.activeScenario}
      - crowd levels: North Gate is ${context?.crowds?.northGate}, South Gate is ${context?.crowds?.southGate}, East Concourse is ${context?.crowds?.eastConcourse}, West Concourse is ${context?.crowds?.westConcourse}, Food Court is ${context?.crowds?.foodCourt}.
      - transport status: Metro Terminal A is ${context?.transit?.metroA}, Metro Terminal B is ${context?.transit?.metroB}, Shuttle Bus is ${context?.transit?.shuttleBus}.
      - accessibility preferences enabled: ${JSON.stringify(context?.accessibilitySettings)}
      - response language: ${lang} (Provide the reply entirely in this language)
      
      Guidelines:
      - Keep responses concise, direct, helpful, and under 150 words.
      - If the user asks for directions, recommend routes that avoid high or critical crowd zones.
      - If accessibility is active, prioritize step-free paths, escalators, and accessible restrooms.
      - Structure recommendations using a clear format:
        RECOMMENDED ACTION: (what gate or path to take)
        WHY: (reasoning comparing crowd sizes)
        EXPECTED BENEFIT: (e.g. save time, easier route)
        ALTERNATIVE: (another route option)
    `;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return res.status(200).json({ text, isSimulated: false });
        }
      }
    } catch (err) {
      console.error('Vercel Gemini Chat function failed:', err.message);
    }
  }

  // Local fallback response
  const text = generateFallbackFanResponse(safeMessage, context, lang);
  return res.status(200).json({ text, isSimulated: true });
}
