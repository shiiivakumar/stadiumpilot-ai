// Vercel Serverless Function: /api/ai/incident-plan
import { generateFallbackIncidentPlan } from './_aiHelper.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
      console.error('Vercel Gemini Incident Plan function failed:', err.message);
    }
  }

  const text = generateFallbackIncidentPlan(incident);
  return res.status(200).json({ text, isSimulated: true });
}
