# System Architecture - StadiumPilot AI

StadiumPilot AI is built as a unified intelligent stadium platform. Both the Fan Assistant and the Operations Command Center tap into a **shared, context-aware simulation and decision core**. This architecture guarantees that data changes (e.g. crowd surge, incidents) propagate instantly to both experiences.

## Architectural Layers

```
                                      [ USER INTERFACE ]
             +----------------------------------+----------------------------------+
             |                                  |                                  |
             v                                  v                                  v
      [ Landing Page ]                  [ Fan Assistant ]                [ Command Center ]
             |                                  |                                  |
             +----------------------------------+----------------------------------+
                                                |
                                                v
                                  [ SimulationContext.jsx ]
                                      (Shared state)
                                                |
                             +------------------+------------------+
                             |                                     |
                             v                                     v
                   [ decisionEngine.js ]                     [ aiService.js ]
                  (Deterministic logic)                   (Frontend API Client)
                             |                                     |
                             +------------------+------------------+
                                                |
                             +------------------+------------------+
                             |                                     |
                             v                                     v
                  [ api/ai/* (Vercel) ]                 [ server.js (Express) ]
                 (Serverless Deployment)                (Local & Cloud Run Host)
                             |                                     |
                             +------------------+------------------+
                                                |
                                                v
                                     +----------+----------+
                                     |                     |
                                     v                     v
                           [ Google Gemini API ]    [ api/ai/_aiHelper.js ]
                           (Secure Server Key)       (Shared Fallback Core)
```

### 1. Secure Backend Frameworks (Vercel Serverless & Express server.js)
- **Vercel Serverless Framework (`api/ai/*.js`)**:
  - Leverages Vercel's edge/serverless infrastructure.
  - Matches paths to serverless function files: `chat.js`, `brief.js`, and `incident-plan.js`.
  - Reads `GEMINI_API_KEY` from Vercel’s environment settings, protecting it from frontend exposure.
- **Express Backend Server (`server.js`)**:
  - Maintained for local development and future Google Cloud Run Docker compatibility.
  - Hosts static built files and acts as a local proxy on port `8080`.
- **Shared AI Logic Helper (`api/ai/_aiHelper.js`)**:
  - Centralizes simulated fallback routines to keep the architecture DRY. Both Vercel functions and Express handlers import from this module.

### 2. Data Core (`src/data/stadiumData.js`)
- Houses structural definitions of the venue layout (coordinates, radii, names).
- Defines Points of Interest (POIs) such as concessions, medical tents, and toilets, categorizing accessible properties.
- Models baseline values for 5 tournament scenarios: Normal, Surge, Medical, Transport, and Evacuation.
- Provides a simple wayfinding path graph to calculate route coordinates.

### 3. State & Simulation Core (`src/context/SimulationContext.jsx`)
- Uses React Context to store reactive states for:
  - Active scenario name and properties.
  - Crowd congestion densities for all gates and concourses.
  - Interactive incident arrays.
  - Transit schedules and delay variables.
  - Dynamic metrics (ticketing delay, total occupancy).
  - Selected language ('en', 'es', 'fr', 'pt', 'hi').
  - User accessibility settings (wheelchair, step-free, high-contrast, large text).
- Spawns a lightweight background update loop that mimics minor fluctuation of spectators and crowd shifts when simulation is running.

### 4. Decision Core (`src/services/decisionEngine.js`)
- A deterministic layer that processes structural data.
- **Wayfinding Recommendations**: Computes distance, walking speed adjustments, crowd congestion factors, and accessibility criteria to yield route summaries (Action, Why, Benefit, Alternative).
- **Operations Alerts**: Scans the stadium zones and transport status logs. If gate limits or transit networks fail, it issues structured high-priority actions for operations staff.

### 5. Generative AI Client (`src/services/aiService.js`)
- Triggers POST requests to relative paths `/api/ai/chat`, `/api/ai/brief`, and `/api/ai/incident-plan`.
- In Vercel deployments, Vercel routes these dynamically to `api/ai/*.js`.
- In local development, Vite proxies `/api` calls directly to `http://localhost:8080`.

### 6. UI Elements
- **App.jsx**: Global router, role switching header, and accessibility CSS controller.
- **StadiumMap.jsx**: Interactive Vector SVG drawing mapping zone densities, POIs, and wayfinding lines.
- **FanAssistant.jsx**: Spectator chat console, translation bar, SpeechSynthesis triggers, and route results panel.
- **OpsCenter.jsx**: Metrics grids, live table logs, incident creation fields, and sustainability metrics.
- **DemoPanel.jsx**: Evaluator scenario switcher and interactive Judge walkthrough guide.
