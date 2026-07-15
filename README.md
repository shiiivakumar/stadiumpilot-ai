# StadiumPilot AI

### "One AI command center for smarter, safer, and more accessible stadium experiences."

StadiumPilot AI is an intelligent matchday companion and real-time operations console built for large-scale global tournaments, such as the 2026 football tournament. By combining a spectator-facing assistant with an operational command center, the platform ensures that crucial safety, crowd, and accessibility details propagate instantly across the venue.

---

## 💡 What Makes StadiumPilot AI Different?

Most stadium software is siloed — fan applications focus strictly on navigation, while operational tools are restricted to venue managers.

**StadiumPilot AI unifies these experiences through a Shared Intelligence Layer.** When a bottleneck is detected at a gate (e.g., North Gate) or transit terminal, the Operations Command Center immediately receives alert warnings and provides redirection recommendations. Crucially, the **same shared context** is instantly made available to the Fan Assistant: when the fan requests directions or entrances, the chatbot and Pathfinder automatically redirect them away from the bottleneck and guide them toward a safer, less congested entry point.

---

## 🏆 2-Minute Judge Demo

To experience StadiumPilot AI's strongest features in under 2 minutes:

1. **Start the Demo Tour**: Click **Start Demo Tour** inside the floating controller drawer in the bottom-right corner.
2. **Step 1 (Landing Page)**: Review the sports-broadcasting style hero section and animated stadium scanning grid. Click **Enter Stadium**.
3. **Step 2 (Simulate Surge)**: Under "Preset Scenario Profiles," select **Crowd Surge**. 
4. **Step 3 (Observe Crowds)**: Notice how the **North Gate** and **Metro Terminal A** turn pulsating red (CRITICAL) on the fan map. Look at the *Pathfinder Route Planner* panel. It automatically flags gate congestion and recommends rerouting to the East Gate.
5. **Step 4 (Switch to Command Center)**: Click the **Command Center** link in the top navigation bar.
6. **Step 5 (Process Operations Alerts)**: Note the metrics. The AI Decision Engine has generated a CRITICAL priority card. Read the **Detected Situation**, **Expected Impact**, and **Confidence Index**, then click **Acknowledge Recommendation**.
7. **Step 6 (Interactive Incident Plan)**: Click the medical or crowd incident rows in the table. Watch the **AI Emergency Response Plan** dynamically compute safety checklists and teams.
8. **Step 7 (Confirm Shared Intelligence)**: Switch back to **Fan Assistant** on the top navigation. Select `Metro Terminal A` as starting location. The Pathfinder and Chatbot now immediately direct you via the safer **West Concourse**, demonstrating seamless cross-role context synchronization.

---

## 🔍 The Problem & Solution

### The Problem
Coordinating upward of 70,000 spectators in dynamic match environments is high-risk. Turnstile overloads, sudden transit disruptions, and medical emergencies are frequently siloed. Spectators walk into bottleneck queues, safety coordinators struggle to dispatch personnel, and visitors with accessibility needs encounter barriers.

### The Solution
StadiumPilot AI orchestrates safety, flow, and comfort using a **Sense → Understand → Decide → Act → Explain** pipeline:
- **Sense**: Reads simulated turnstile sensors, regional transit delays, and spectator coordinates.
- **Understand**: Maps real-time crowd heatmaps and individual accessibility preferences.
- **Decide**: Computes wayfinding paths for fans and priority-ranked actions for controllers.
- **Act**: Renders route lines on an SVG map overlay and logs dispatch assignments.
- **Explain**: Communicates the exact reasoning, expected travel times, benefits, and alternatives.

---

## 🛠️ Key Features

- **Interactive SVG Stadium Map**: Renders live crowd heatmaps (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), clickable start/destination pins, and glowing wayfinding routes.
- **Explainable AI Recommendations**: Operational recommendations show Situation, Severity, Action, Reasoning, Impact, Alternatives, and a deterministic Confidence Index.
- **Incident Management Desk**: Log custom emergencies. The backend generates 4-step emergency checklists with disclaimers and suggested response times.
- **Multilingual Support & Speech**: Switch UI instantly between English, Spanish, French, Portuguese, and Hindi. Voice input (STT) and vocal read-aloud (TTS) are fully active.
- **Accessibility Modes**: Toggle Wheelchair, Step-Free, or Reduced Walking routes. System themes support **High Contrast Colors** and **Larger Text scaling (+20%)** globally.
- **Transit & Green Dashboards**: Displays eco-travel carbon emissions avoided, transit delays, and solar yield statistics.

---

## 🤖 Google Services Integration

StadiumPilot AI integrates Google Cloud capabilities to secure intelligence:
- **Google Gemini API**: Generates operations summaries, chatbot replies, and emergency checklists.
- **Google Cloud Run**: Runs the final compiled container in an autoscaling serverless environment.
- **Secure Server-Side Architecture**: Frontend scripts communicate through secure local endpoints `/api/ai/*`. The Node backend (`server.js`) calls the Gemini API securely using the server environment variable `GEMINI_API_KEY` (never exposing client-side credentials).
- *See [GOOGLE_SERVICES.md](file:///e:/Websites/Challenge%204/GOOGLE_SERVICES.md) for actual vs future enhancements directory (including Vertex AI, Firebase, and Google Maps).*

---

## 📂 Architecture

- [server.js](file:///e:/Websites/Challenge%204/server.js): Production Node/Express server serving the Vite application build and routing API proxy routes.
- [src/data/stadiumData.js](file:///e:/Websites/Challenge%204/src/data/stadiumData.js): Seating layouts, POI coordinates, and graph waypoint routing logic.
- [src/context/SimulationContext.jsx](file:///e:/Websites/Challenge%204/src/context/SimulationContext.jsx): Stores reactive variables and drives the fluctuation timer loop.
- [src/services/decisionEngine.js](file:///e:/Websites/Challenge%204/src/services/decisionEngine.js): Determines route times, distances, and prioritizes operational alerts.
- [src/services/aiService.js](file:///e:/Websites/Challenge%204/src/services/aiService.js): Frontend service proxy. Falls back to browser mock logic if server is offline.
- *See [ARCHITECTURE.md](file:///e:/Websites/Challenge%204/ARCHITECTURE.md) for full details.*

---

## 🚀 Installation & Local Run

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Steps
1. Navigate to the project directory:
   ```bash
   cd "E:\Websites\Challenge 4"
   ```
2. Install the production and developer dependencies:
   ```bash
   npm install
   ```
3. Setup environmental files (API Key is optional; runs on high-fidelity simulation if missing):
   ```bash
   copy .env.example .env
   ```
   Add your key to `.env`:
   ```bash
   GEMINI_API_KEY=your_google_studio_key_here
   ```
4. Build the Vite application assets:
   ```bash
   npm run build
   ```
5. Launch the secure Express server:
   ```bash
   npm start
   ```
   Open `http://localhost:8080` in your web browser.

---

## 🐳 Cloud Run Deployment

Deploy to Google Cloud Run in a single container using standard commands:

```bash
# Build the container image in Google Artifact Registry
gcloud builds submit --tag gcr.io/your-project-id/stadiumpilot-ai

# Deploy the container to Google Cloud Run
gcloud run deploy stadiumpilot-ai \
    --image gcr.io/your-project-id/stadiumpilot-ai \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080
```

---

## 🛡️ Security & Safe Handling
- **No Client Secrets**: VITE variables are removed. Secrets are restricted to backend environment calls.
- **Safe Inputs**: Chat characters are trimmed at 500 characters, preventing payload buffer attempts.
- **Simulation Disclaimer**: StadiumPilot AI is an evaluator support concept. Emergency and safety decisions remain with authorized venue safety marshals.
- **Privacy Statement**: StadiumPilot AI demo does not require users to provide personal information. Simulation data is synthetic and used only for demonstration.

---

## ♿ Accessibility Compliance
- Keyboard support (with visible `:focus-visible` outline rings).
- Semantic HTML tags, button structures, and ARIA labels.
- Wheelchair route updates map lines and recalculates steps warnings.

---

## 👥 Author
Prepared for the 2026 GenAI Smart Stadium Hackathon.
