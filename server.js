// StadiumPilot AI - Secure Backend Production Server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { STADIUM_ZONES } from './src/data/stadiumData.js';

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

// ----------------------------------------------------
// BACKEND FALLBACK SIMULATOR LOGIC
// ----------------------------------------------------

function generateFallbackFanResponse(message, context, lang) {
  const normalizedMsg = message.toLowerCase();
  const isWheelchair = context?.accessibilitySettings?.wheelchair || context?.accessibilitySettings?.stepFree;
  const crowds = context?.crowds || {};
  const transit = context?.transit || {};

  const strings = {
    en: {
      route_gate_b: `**RECOMMENDED ACTION:** Go via West Concourse corridor.\n**WHY:** North Concourse is currently experiencing elevated densities.\n**EXPECTED BENEFIT:** Avoid congested bottlenecks, 6-minute estimated walk.\n**ALTERNATIVE:** Use East Concourse (has stairs).`,
      route_gate_b_acc: `**RECOMMENDED ACTION:** Take the elevators in West Concourse to Gate B.\n**WHY:** Standard concourse route contains stairs near Gate A.\n**EXPECTED BENEFIT:** 100% step-free accessibility path.\n**ALTERNATIVE:** North Ramp (slightly longer distance, 4% incline).`,
      restroom_acc: `**RECOMMENDED ACTION:** Head to the Accessible Restroom near South Gate (Station A) or North Gate.\n**WHY:** These locations are equipped with wide-berth doors, support bars, and tactile indicators.\n**EXPECTED BENEFIT:** 100% compliant step-free access, currently no queue.\n**ALTERNATIVE:** East Concourse accessible unit.`,
      restroom: `**RECOMMENDED ACTION:** Use the Food Court rest facilities or East Concourse restrooms.\n**WHY:** These sections have higher capacity and currently show lower congestion levels.\n**EXPECTED BENEFIT:** Avoid queues, approximately 3-minute wait.\n**ALTERNATIVE:** North Gate restrooms (highly congested).`,
      crowded_entrance: `**RECOMMENDED ACTION:** Enter through the South Gate.\n**WHY:** The North Gate has a crowd density of ${crowds.northGate || 'LOW'} due to arrivals from Metro Terminal A.\n**EXPECTED BENEFIT:** Save approximately 15 minutes of queuing.\n**ALTERNATIVE:** East Concourse Gates (MODERATE congestion).`,
      transport: `**RECOMMENDED ACTION:** Depart via Metro Terminal B or the East Plaza Shuttle Bus.\n**WHY:** Metro Terminal A is currently showing ${transit.metroA === 'critical' ? 'CRITICAL DELAYS (trains halted)' : 'busy conditions'}.\n**EXPECTED BENEFIT:** Faster boarding and departure times.\n**ALTERNATIVE:** Ride-share zone (high surge pricing).`,
      general: `**RECOMMENDED ACTION:** Follow digital guide signs toward the South Gate concourse.\n**WHY:** Current operational intelligence reports optimal traffic flow through the Southern sectors.\n**EXPECTED BENEFIT:** Comfort and safety in low-density sections.\n**ALTERNATIVE:** Consult the nearest Information Booth.`
    },
    es: {
      route_gate_b: `**ACCIÓN RECOMENDADA:** Diríjase por el pasillo del West Concourse.\n**POR QUÉ:** El North Concourse experimenta alta congestión.\n**BENEFICIO ESPERADO:** Evitar embotellamientos, caminata estimada de 6 minutos.\n**ALTERNATIVA:** Concourse Este (incluye escaleras).`,
      route_gate_b_acc: `**ACCIÓN RECOMENDADA:** Tome los ascensores en West Concourse hacia la Puerta B.\n**POR QUÉ:** La ruta estándar contiene escaleras cerca de la Puerta A.\n**BENEFICIO ESPERADO:** Ruta 100% libre de escalones.\n**ALTERNATIVA:** Rampa Norte (distancia ligeramente mayor, inclinación del 4%).`,
      restroom_acc: `**ACCIÓN RECOMENDADA:** Use el baño accesible cerca de la Puerta Sur o la Puerta Norte.\n**POR QUÉ:** Tienen barras de apoyo e indicaciones táctiles.\n**BENEFICIO ESPERADO:** Acceso garantizado y sin filas actualmente.\n**ALTERNATIVA:** Baño accesible del Concourse Este.`,
      restroom: `**ACCIÓN RECOMENDADA:** Use los baños del Patio de Comidas o del Concourse Este.\n**POR QUÉ:** Mayor capacidad y niveles de congestión muy bajos.\n**BENEFICIO ESPERADO:** Evitar esperas, tiempo estimado de 3 minutos.\n**ALTERNATIVA:** Baños de la Puerta Norte (congestión crítica).`,
      crowded_entrance: `**ACCIÓN RECOMENDADA:** Acceda por la Puerta Sur.\n**POR QUÉ:** La Puerta Norte está en estado ${crowds.northGate || 'LOW'} por la llegada del Metro A.\n**BENEFICIO ESPERADO:** Ahorro de 15 minutos en fila.\n**ALTERNATIVA:** Puertas del Concourse Este (congestión MODERADA).`,
      transport: `**ACCIÓN RECOMENDADA:** Utilice el Metro Terminal B o el autobús de enlace de la Plaza Este.\n**POR QUÉ:** La Terminal A del Metro muestra ${transit.metroA === 'critical' ? 'DEMORAS CRÍTICAS (servicio suspendido)' : 'alta congestión'}.\n**BENEFICIO ESPERADO:** Salida fluida sin esperas prolongadas.\n**ALTERNATIVA:** Zona de vehículos de aplicación (tarifas dinámicas altas).`,
      general: `**ACCIÓN RECOMENDADA:** Siga las señales digitales hacia el Concourse Sur.\n**POR QUÉ:** El análisis de operaciones muestra flujo óptimo en sectores del sur.\n**BENEFICIO ESPERADO:** Tránsito cómodo por zonas de baja densidad.\n**ALTERNATIVA:** Acuda al stand de información más cercano.`
    },
    fr: {
      route_gate_b: `**ACTION RECOMMANDÉE:** Passer par le couloir du West Concourse.\n**POURQUOI:** Le North Concourse est actuellement très encombré.\n**BÉNÉFICE ATTENDU:** Éviter les goulots d'étranglement, 6 minutes de marche.\n**ALTERNATIVE:** East Concourse (comporte des escaliers).`,
      route_gate_b_acc: `**ACTION RECOMMANDÉE:** Prendre les ascenseurs du West Concourse pour rejoindre la Porte B.\n**POURQUOI:** L'itinéraire classique comprend des marches près de la Porte A.\n**BÉNÉFICE ATTENDU:** Trajet 100% accessible et sans marches.\n**ALTERNATIVE:** Rampe Nord (distance légèrement supérieure, pente de 4%).`,
      restroom_acc: `**ACTION RECOMMANDÉE:** Se diriger vers les toilettes accessibles près de la Porte Sud ou de la Porte Nord.\n**POURQUOI:** Équipées de portes larges, barres d'appui et repères tactiles.\n**BÉNÉFICE ATTENDU:** Accessibilité garantie sans file d'attente.\n**ALTERNATIVE:** Bloc sanitaire accessible du Concourse Est.`,
      restroom: `**ACTION RECOMMANDÉE:** Utiliser les toilettes du Food Court ou du Concourse Est.\n**POURQUOI:** Plus grande capacité et fréquentation plus faible.\n**BÉNÉFICE ATTENDU:** Temps d'attente estimé à moins de 3 minutes.\n**ALTERNATIVE:** Sanitaires de la Porte Nord (très encombrés).`,
      crowded_entrance: `**ACTION RECOMMANDÉE:** Entrer par la Porte Sud.\n**POURQUOI:** La Porte Nord affiche une densité ${crowds.northGate || 'LOW'} liée au flux du Métro A.\n**BÉNÉFICE ATTENDU:** Gain de temps d'environ 15 minutes.\n**ALTERNATIVE:** Entrées du Concourse Est (densité MODÉRÉE).`,
      transport: `**ACTION RECOMMANDÉE:** Partir via le Métro Terminal B ou la navette de l'East Plaza.\n**POURQUOI:** La gare de Métro Terminal A est en ${transit.metroA === 'critical' ? 'ARRÊT CRITIQUE (trains suspendus)' : 'forte affluence'}.\n**BÉNÉFICE ATTENDU:** Départ plus rapide et sans stress.\n**ALTERNATIVE:** Zone de covoiturage (tarifs élevés).`,
      general: `**ACTION RECOMMANDÉE:** Suivre la signalétique vers le Concourse Sud.\n**POURQUOI:** La régulation signale un flux fluide sur les secteurs du Sud.\n**BÉNÉFICE ATTENDU:** Déplacement sécurisé dans des zones calmes.\n**ALTERNATIVE:** Consulter le stand d'information le plus proche.`
    },
    pt: {
      route_gate_b: `**AÇÃO RECOMENDADA:** Siga pelo corredor do West Concourse.\n**POR QUÊ:** O North Concourse está com tráfego congestionado.\n**BENEFÍCIO ESPERADO:** Evitar gargalos, caminhada de aproximadamente 6 min.\n**ALTERNATIVA:** Concourse Leste (possui escadas).`,
      route_gate_b_acc: `**AÇÃO RECOMENDADA:** Utilize os elevadores no West Concourse para acessar o Portão B.\n**POR QUÊ:** O caminho convencional possui escadas próximas ao Portão A.\n**BENEFÍCIO ESPERADO:** Caminho 100% plano e acessível.\n**ALTERNATIVE:** Rampa Norte (distância um pouco maior, inclinação de 4%).`,
      restroom_acc: `**AÇÃO RECOMENDADA:** Vá ao banheiro acessível perto do Portão Sul ou Portão Norte.\n**POR QUÊ:** Espaço equipado com barras e portas largas.\n**BENEFÍCIO ESPERADO:** Acesso livre sem filas no momento.\n**ALTERNATIVA:** Unidade acessível do Concourse Leste.`,
      restroom: `**AÇÃO RECOMENDADA:** Use as instalações do Food Court ou do Concourse Leste.\n**POR QUÊ:** Alta capacidade instalada e fluxo moderado atualmente.\n**BENEFÍCIO ESPERADO:** Evitar esperas, tempo médio de 3 minutos.\n**ALTERNATIVA:** Banheiros do Portão Norte (alta concentração de pessoas).`,
      crowded_entrance: `**AÇÃO RECOMENDADA:** Entre pelo Portão Sul.\n**POR QUÊ:** O Portão Norte registra congestionamento ${crowds.northGate || 'LOW'} por conta do fluxo do Metro A.\n**BENEFÍCIO ESPERADO:** Redução de 15 minutos na fila de entrada.\n**ALTERNATIVA:** Portões do Concourse Leste (congestionamento MODERADO).`,
      transport: `**AÇÃO RECOMENDADA:** Embarque pelo Metro Terminal B ou ônibus de integração da Plaza Leste.\n**POR QUÊ:** A estação Metro Terminal A apresenta ${transit.metroA === 'critical' ? 'FALHA CRÍTICA (trens parados)' : 'alta lotação'}.\n**BENEFÍCIO ESPERADO:** Deslocamento ágil e seguro.\n**ALTERNATIVA:** Ponto de aplicativo de transporte (tarifa dinâmica elevada).`,
      general: `**AÇÃO RECOMENDADA:** Siga as placas digitais em direção ao Concourse Sul.\n**POR QUÊ:** Nossa central aponta tráfego livre em toda a ala Sul.\n**BENEFÍCIO ESPERADO:** Caminhada segura em área de baixa densidade.\n**ALTERNATIVA:** Dirija-se ao balcão de informações.`
    },
    hi: {
      route_gate_b: `**अनुशंसित कार्रवाई:** वेस्ट कॉनकोर्स कॉरिडोर से जाएं।\n**कारण:** नॉर्थ कॉनकोर्स में फिलहाल भीड़ ज्यादा है।\n**अपेक्षित लाभ:** भीड़भाड़ से बचें, अनुमानित 6 मिनट की पैदल दूरी।\n**विकल्प:** ईस्ट कॉनकोर्स का उपयोग करें (सीढ़ियां हैं)।`,
      route_gate_b_acc: `**अनुशंसित कार्रवाई:** गेट बी तक पहुंचने के लिए वेस्ट कॉनकोर्स में लिफ्ट लें।\n**कारण:** मानक कॉनकोर्स मार्ग में गेट ए के पास सीढ़ियां हैं।\n**अपेक्षित लाभ:** 100% सीढ़ी-मुक्त सुलभ मार्ग।\n**विकल्प:** नॉर्थ रैंप (थोड़ी अधिक दूरी, 4% झुकाव)।`,
      restroom_acc: `**अनुशंसित कार्रवाई:** साउथ गेट या नॉर्थ गेट के पास सुलभ शौचालय की ओर जाएं।\n**कारण:** इन स्थानों पर चौड़े दरवाजे, सपोर्ट बार और स्पर्श संकेत हैं।\n**अपेक्षित लाभ:** 100% सीढ़ी-मुक्त प्रवेश, फिलहाल कोई कतार नहीं।\n**विकल्प:** ईस्ट कॉनकोर्स सुलभ शौचालय।`,
      restroom: `**अनुशंसित कार्रवाई:** फूड कोर्ट या ईस्ट कॉनकोर्स शौचालयों का उपयोग करें।\n**कारण:** इन क्षेत्रों में अधिक क्षमता है और भीड़ का स्तर कम है।\n**अपेक्षित लाभ:** कतारों से बचें, लगभग 3 मिनट का प्रतीक्षा समय।\n**विकल्प:** नॉर्थ गेट शौचालय (अत्यधिक भीड़)।`,
      crowded_entrance: `**अनुशंसित कार्रवाई:** साउथ गेट से प्रवेश करें।\n**कारण:** मेट्रो टर्मिनल ए से आने वालों के कारण नॉर्थ गेट पर भीड़ का स्तर ${crowds.northGate || 'LOW'} है।\n**अपेक्षित लाभ:** कतार में लगभग 15 मिनट की बचत।\n**विकल्प:** ईस्ट कॉनकोर्स गेट्स (मध्यम भीड़)।`,
      transport: `**अनुशंसित कार्रवाई:** मेट्रो टर्मिनल बी या ईस्ट प्लाजा शटल बस से प्रस्थान करें।\n**कारण:** मेट्रो टर्मिनल ए में वर्तमान में ${transit.metroA === 'critical' ? 'गंभीर देरी (ट्रेनें रुकी हुई हैं)' : 'भीड़' } है।\n**अपेक्षित लाभ:** तेजी से बोर्डिंग और प्रस्थान।\n**विकल्प:** राइड-शेयर ज़ोन (अधिक किराया)।`,
      general: `**अनुशंसित कार्रवाई:** साउथ गेट कॉनकोर्स की ओर डिजिटल गाइड संकेतों का पालन करें।\n**कारण:** वर्तमान संचालन डेटा दक्षिणी क्षेत्रों के माध्यम से इष्टतम यातायात प्रवाह की रिपोर्ट करता है।\n**अपेक्षित लाभ:** कम भीड़ वाले हिस्से में सुविधा और सुरक्षा।\n**विकल्प:** निकटतम सूचना केंद्र से संपर्क करें।`
    }
  };

  const activeLang = strings[lang] ? lang : 'en';

  if (normalizedMsg.includes('gate b') || normalizedMsg.includes('entrance b') || normalizedMsg.includes('gate a')) {
    return isWheelchair ? strings[activeLang].route_gate_b_acc : strings[activeLang].route_gate_b;
  }
  if (normalizedMsg.includes('restroom') || normalizedMsg.includes('toilet') || normalizedMsg.includes('washroom') || normalizedMsg.includes('bathroom') || normalizedMsg.includes('loo')) {
    return isWheelchair ? strings[activeLang].restroom_acc : strings[activeLang].restroom;
  }
  if (normalizedMsg.includes('crowd') || normalizedMsg.includes('entrance') || normalizedMsg.includes('least crowded') || normalizedMsg.includes('gate')) {
    return strings[activeLang].crowded_entrance;
  }
  if (normalizedMsg.includes('transport') || normalizedMsg.includes('metro') || normalizedMsg.includes('bus') || normalizedMsg.includes('rideshare') || normalizedMsg.includes('taxi') || normalizedMsg.includes('hotel') || normalizedMsg.includes('get back') || normalizedMsg.includes('leave') || normalizedMsg.includes('go home')) {
    return strings[activeLang].transport;
  }
  
  return strings[activeLang].general;
}

function generateFallbackBrief(context) {
  if (!context) return 'No context available.';
  const incidents = context.incidents || [];
  const crowds = context.crowds || {};
  const transit = context.transit || {};
  const incidentCount = incidents.filter(inc => inc.status !== 'Resolved').length;
  
  if (context.activeScenario === 'normal') {
    return `Stadium operations are currently STABLE. Occupancy is at ${context.occupancy} spectators with an average entry wait time of ${context.averageEntryTime} minutes. All transit hubs are operating normally. No critical incidents reported.`;
  }
  if (context.activeScenario === 'surge') {
    return `OPERATIONS WARNING: A high crowd surge is detected near North Gate. Ticketing queues have extended, raising average entry wait times to ${context.averageEntryTime} minutes. Redirection of incoming fans from Metro Terminal A to East Gate is advised. 1 critical crowd incident is active.`;
  }
  if (context.activeScenario === 'medical') {
    return `OPERATIONS UPDATE: A critical medical emergency is active in Section B seating area. Occupancy stands at ${context.occupancy}. High crowd density in Section B requires emergency personnel routing support. Local stewards have been deployed. All transit routes remain normal.`;
  }
  if (context.activeScenario === 'transport') {
    return `TRANSIT EMERGENCY: Metro Terminal A is completely suspended due to a track technical failure. Severe crowd backlog is forming at East Plaza Shuttle bus terminals. Redirecting fans toward Metro Terminal B. ${incidentCount} high-priority incidents require coordination.`;
  }
  if (context.activeScenario === 'evacuation') {
    return `CRITICAL EMERGENCY ALERT: Venue evacuation is underway due to an active infrastructure incident (smoke detection) in the Food Court area. Stadium occupants are being guided through all emergency exits. Average entry is frozen, and focus has shifted entirely to life safety coordination.`;
  }

  return `Stadium operations are stable. Occupancy is ${context.occupancy} fans. There are ${incidentCount} open incidents requiring monitoring. Please review the live heatmap.`;
}

function generateFallbackIncidentPlan(incident) {
  if (!incident) return 'No incident payload.';
  if (incident.category === 'Medical') {
    return `RESPONSE PLAN:
1. Dispatch Medical Response Team B-South immediately with trauma bag and stretcher.
2. Direct local Section B stewards to clear seating stairwell rows 12-16.
3. Coordinate with emergency dispatch for external ambulance standby at South Gate Tunnel.
4. Log status checks with chief safety officer and monitor vitals.

REASONING SUMMARY: Immediate medical access is required while clearing public congestion to allow paramedic ingress.
PRIORITY: CRITICAL
SUGGESTED TEAM: Medical Division South / Section B Stewards
ESTIMATED RESPONSE: 2-3 minutes`;
  }
  if (incident.category === 'Crowd') {
    return `RESPONSE PLAN:
1. Dispatch Crowd Management Unit 2 to the external plaza boundary.
2. Dynamically update external digital sign boards to display: "North Gate Congested. Please proceed to East Gate".
3. Open two auxiliary ticketing lanes at the North-East bypass fence.
4. Coordinate with transit supervisors to throttle arrival train counts at Metro Terminal A if necessary.

REASONING SUMMARY: Diverts inflow before gate barriers exceed safe crowd load capacities.
PRIORITY: CRITICAL
SUGGESTED TEAM: Crowd Security Division / Digital Signage Hub
ESTIMATED RESPONSE: 4-5 minutes`;
  }
  if (incident.category === 'Transport') {
    return `RESPONSE PLAN:
1. Request municipal transit dispatch to deploy 12 additional backup double-decker shuttle buses to East Plaza.
2. Reposition 8 transit stewards to form orderly queuing lines at Shuttle Terminal.
3. Push push-notifications to fan smartphone apps recommending Metro Terminal B departure.
4. Broadcast audio announcement in North Concourse regarding train suspension.

REASONING SUMMARY: Maximizes substitute bus capacity while utilizing digital channels to disperse stranded passengers.
PRIORITY: HIGH
SUGGESTED TEAM: Transport Coordination Division / Municipal Transit Dispatch
ESTIMATED RESPONSE: 8-10 minutes`;
  }
  
  return `RESPONSE PLAN:
1. Dispatch standard inspection team to investigate the reported facility area.
2. Place a perimeter hazard barricade or warning notices if physical risk exists.
3. Notify nearest supervisor and log incident parameters in logs.
4. Resolve issue or coordinate vendor escalation.

REASONING SUMMARY: Safety verification and physical separation of hazard from public traffic.
PRIORITY: MEDIUM
SUGGESTED TEAM: Facilities Operations Team
ESTIMATED RESPONSE: 10 minutes`;
}
