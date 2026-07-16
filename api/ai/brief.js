// Vercel Serverless Function: /api/ai/brief
import { generateFallbackBrief } from './_aiHelper.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
      console.error('Vercel Gemini Brief function failed:', err.message);
    }
  }

  const text = generateFallbackBrief(context);
  return res.status(200).json({ text, isSimulated: true });
}
