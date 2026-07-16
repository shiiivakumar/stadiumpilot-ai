// StadiumPilot AI - Secure Backend Production Server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateFallbackFanResponse, generateFallbackBrief, generateFallbackIncidentPlan } from './api/ai/_aiHelper.js';

// Load environmental variables (development only)
dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic Port configuration for Google Cloud Run
const PORT = process.env.PORT || 8080;

// Serve Vite production build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Shared helper to query the Gemini API securely
async function callGeminiBackend(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: promptText }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned an empty text payload.');
  }
  return text;
}

// ----------------------------------------------------
// SECURE BACKEND API ENDPOINTS
// ----------------------------------------------------

// 1. Fan Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message, context, lang } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Safe input length defense
  const safeMessage = (message || '').substring(0, 500);

  if (apiKey) {
    const prompt = `
      You are "StadiumPilot AI", a conversational fan assistant for a large 2026 stadium tournament (not officially affiliated with FIFA).
      The user is asking: "${safeMessage}"
      
      Current Stadium Context:
      - active scenario: ${context.activeScenario}
      - crowd levels: North Gate is ${context.crowds?.northGate}, South Gate is ${context.crowds?.southGate}, East Concourse is ${context.crowds?.eastConcourse}, West Concourse is ${context.crowds?.westConcourse}, Food Court is ${context.crowds?.foodCourt}.
      - transport status: Metro Terminal A is ${context.transit?.metroA}, Metro Terminal B is ${context.transit?.metroB}, Shuttle Bus is ${context.transit?.shuttleBus}.
      - accessibility preferences enabled: ${JSON.stringify(context.accessibilitySettings)}
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
      const resultText = await callGeminiBackend(prompt);
      return res.json({ text: resultText, isSimulated: false });
    } catch (err) {
      console.error('Gemini Backend Chat failed, reverting to simulation:', err.message);
    }
  }

  // Fallback if API key missing or endpoint failed
  const resultText = generateFallbackFanResponse(safeMessage, context, lang);
  return res.json({ text: resultText, isSimulated: true });
});

// 2. Operations Brief Endpoint
app.post('/api/ai/brief', async (req, res) => {
  const { context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && context) {
    const activeIncidentsStr = (context.incidents || [])
      .map(inc => `[ID: ${inc.id}, Category: ${inc.category}, Loc: ${inc.location}, Severity: ${inc.severity}, Status: ${inc.status}] - ${inc.description}`)
      .join('\n');

    const prompt = `
      You are "StadiumPilot AI", the operations dashboard coordinator for a 2026 global tournament stadium.
      Provide a professional daily operations brief summary of the stadium based on the following:
      
      Stadium Parameters:
      - Occupancy: ${context.occupancy} fans
      - Average ticketing entry wait time: ${context.averageEntryTime} mins
      - Crowd Heatmap:
        * North Gate: ${context.crowds?.northGate}
        * South Gate: ${context.crowds?.southGate}
        * East Concourse: ${context.crowds?.eastConcourse}
        * West Concourse: ${context.crowds?.westConcourse}
        * Food Court: ${context.crowds?.foodCourt}
      - Transport Status:
        * Metro Terminal A: ${context.transit?.metroA}
        * Metro Terminal B: ${context.transit?.metroB}
        * Shuttle Buses: ${context.transit?.shuttleBus}
      - Active Incidents:
        ${activeIncidentsStr || 'None. Stadium operations are stable.'}
        
      Instructions:
      - Generate a concise, objective summary (3-4 sentences max).
      - Outline current crowd hotspots, top operational risks (e.g., transit delay, critical incidents), and immediate recommended action.
      - Do not exceed 100 words. Keep a technical, command-center tone.
    `;

    try {
      const resultText = await callGeminiBackend(prompt);
      return res.json({ text: resultText, isSimulated: false });
    } catch (err) {
      console.error('Gemini Backend Brief failed, reverting to simulation:', err.message);
    }
  }

  const resultText = generateFallbackBrief(context);
  return res.json({ text: resultText, isSimulated: true });
});

// 3. Incident Plan Endpoint
app.post('/api/ai/incident-plan', async (req, res) => {
  const { incident } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && incident) {
    const prompt = `
      You are the "StadiumPilot AI" decision support system.
      Generate a 4-step emergency action plan for this stadium operational incident:
      
      Category: ${incident.category}
      Location: ${incident.location}
      Severity: ${incident.severity}
      Description: ${incident.description}
      
      Format the response EXACTLY like this:
      RESPONSE PLAN:
      1. [First operational action]
      2. [Second routing/communication action]
      3. [Third safety coordination action]
      4. [Fourth closure or recovery step]
      
      REASONING SUMMARY: [Explain why this order was suggested in one short sentence]
      PRIORITY: [CRITICAL | HIGH | MEDIUM | LOW]
      SUGGESTED TEAM: [e.g. First Aid Squad C, Crowds Division North, Facilities Maintenance]
      ESTIMATED RESPONSE: [e.g. 2-3 minutes, Immediate, 10 minutes]
    `;

    try {
      const resultText = await callGeminiBackend(prompt);
      return res.json({ text: resultText, isSimulated: false });
    } catch (err) {
      console.error('Gemini Backend Incident Plan failed, reverting to simulation:', err.message);
    }
  }

  const resultText = generateFallbackIncidentPlan(incident);
  return res.json({ text: resultText, isSimulated: true });
});

// Serve index.html for SPA fallback routing (e.g. refresh on other paths)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Launch Server
app.listen(PORT, () => {
  console.log(`StadiumPilot AI secure server running on port ${PORT}`);
});

// Shared simulation fallback logic imported from './api/ai/_aiHelper.js'
