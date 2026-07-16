# Verification & Testing - StadiumPilot AI

This document outlines the validation procedures, automated unit/integration test suites, manual verification protocols, and safety configurations for StadiumPilot AI.

---

## 🧪 Automated Testing Suite

StadiumPilot AI features a comprehensive, modern automated testing suite built on top of **Vitest** and **React Testing Library**. It runs inside a simulated browser environment powered by **JSDOM**.

### 1. Executable Test Commands

Run these commands in the project root directory (`E:\Websites\Challenge 4`):

```bash
# Run the complete test suite once
npm run test

# Run Vitest in interactive watch mode (ideal for development)
npx vitest

# Run tests and generate code coverage reports
npx vitest run --coverage
```

### 2. Test Architecture & Files

The test suite covers both frontend UI rendering/interactivity and backend decision-making algorithms:

| Test File | Target Core | Test Cases Covered |
| :--- | :--- | :--- |
| **[decisionEngine.test.js](file:///e:/Websites/Challenge%204/src/test/decisionEngine.test.js)** | Deterministic Decision Core | - Base walking time computations under low crowds.<br>- Congestion multiplier delays under critical crowds.<br>- Ramping and step-free directions in wheelchair routing.<br>- Operations alert generation for gate overloads and medical issues. |
| **[aiService.test.js](file:///e:/Websites/Challenge%204/src/test/aiService.test.js)** | Generative AI Client Bridge | - Secure fetch payload structures targeting `/api/ai/*`.<br>- Dynamic backend request mocks.<br>- Resilient offline fallback routines when network requests fail. |
| **[LandingPage.test.jsx](file:///e:/Websites/Challenge%204/src/test/LandingPage.test.jsx)** | Landing Page UI Component | - Heading and tagline layouts.<br>- Navigation buttons trigger correct role triggers (`fan` / `ops`). |
| **[DemoPanel.test.jsx](file:///e:/Websites/Challenge%204/src/test/DemoPanel.test.jsx)** | Simulator Preset Panel | - Scenario selector rendering.<br>- Play/Pause simulation loop callback triggers.<br>- Complete 6-step Judge walkthrough progress workflow. |
| **[StadiumMap.test.jsx](file:///e:/Websites/Challenge%204/src/test/StadiumMap.test.jsx)** | Vector SVG Map | - Stadium layout rendering (North Gate, South Gate).<br>- Interactive POI filter buttons (`All POIs`, `Restrooms`, `First Aid`).<br>- Active status highlights on click. |

---

## 📋 Interactive Demo Testing Checklist

Verify the following steps to ensure a flawless presentation flow for judges:

### 1. Preset Scenarios Check
Select each scenario in the **Demo Control Panel** and verify the simulated UI reaction:
- [x] **Normal Match Day**:
  - Occupancy is ~42,000. Avg entry time is ~4.5 mins.
  - Heatmap shows green (LOW) or yellow (MODERATE) circles.
  - Operations Brief logs a stable status. No active incidents are visible.
- [x] **High Crowd Surge**:
  - Occupancy shifts to ~61,000. Avg entry time escalates to ~22.4 mins.
  - North Gate and Metro Terminal A turn red (CRITICAL).
  - Incident `inc-01` ("North Gate Entrance congestion") appears in the table.
  - AI recommendations generate a high-priority redirection warning.
- [x] **Medical Incident**:
  - Seating Section B turns red (CRITICAL).
  - Incident `inc-02` ("Medical emergency in Section B") appears in the table.
- [x] **Transport Disruption**:
  - Metro Terminal A is marked in red (CRITICAL) and shuttle bus is delayed.
  - Incidents `inc-03` and `inc-04` populate in the log.
- [x] **Emergency Evacuation**:
  - All stadium zones pulse red (CRITICAL).
  - Occupancy is high, entry times freeze. Evacuation warning alarms logged in activity feed.

### 2. Incident Action plan & Status Changes
- [x] Open the **Command Center**.
- [x] Click on the **Medical incident** row in the table.
  - Verify: The AI Response Action Plan card opens and loads response steps (1. Dispatch Medical team, 2. Direct stewards, etc.).
- [x] Click the **Assign** button next to the incident.
  - Verify: Status switches to `Assigned` with a yellow badge. Feed logs the update.
- [x] Click the **Start** button.
  - Verify: Status switches to `In Progress` with a blue badge.
- [x] Click the **Resolve** button.
  - Verify: Status switches to `Resolved` with a green badge. Metric count decreases.

### 3. Wayfinding Routing & Map Verification
- [x] Open the **Fan Assistant**.
- [x] In the Pathfinder controls, select:
  - **Start**: `Metro Terminal A`
  - **Destination**: `Seating Section A`
- [x] Click on the map directly or select.
  - Verify: A route path is drawn on the SVG canvas connecting the points.
  - Verify: The Route results card displays distance, estimated time, and the formatted recommendation blocks (**Recommended Route**, **Why**, **Expected Benefit**, **Alternative**).
- [x] Toggle **Wheelchair Route** checkbox:
  - Verify: The route details update to show an accessible path, and the path coordinates on the map shift or highlight step-free corridors (using the West Concourse bypass).

### 4. Multilingual & Audio Verification
- [x] Switch language to **Español (ES)** or **Français (FR)** in the Chat Header:
  - Verify: The welcome bubble changes or subsequent questions simulate translated text output.
- [x] Ask a quick question (e.g. click "Where is the nearest accessible restroom?"):
  - Verify: Chat generates a Spanish or French response, clearly mapping the formatted headers (**ACCIÓN RECOMENDADA**, **POR QUÉ**, etc.).
- [x] Click the **Speaker icon** on the AI message bubble:
  - Verify: Browser vocal synthesis speaks the response in the chosen language.
- [x] Toggle the **Microphone icon** (if SpeechRecognition is supported by your browser):
  - Verify: Input field updates using voice dictation.

### 5. Accessibility Controls
- [x] Click the **Accessibility** button in the main header:
- [x] Toggle **High Contrast Mode**:
  - Verify: Background switches to absolute black `#000000`, card backgrounds turn high-contrast dark, text colors turn high-contrast yellow/white, and borders turn solid white.
- [x] Toggle **Larger Text Mode**:
  - Verify: Fonts scale up globally by 20% across headers, paragraphs, buttons, and selects.

---

## ⚠️ Known Limitations

1. **Local Speech Recognition**: Web Speech API (`window.webkitSpeechRecognition`) is browser-dependent and may not function on certain versions of Firefox or Safari without permission settings. Graceful text input fallbacks are fully active.
2. **SVG Wayfinding Waypoints**: Path routing is drawn using linear waypoint sequences rather than an exhaustive grid search (Dijkstra) of every seat row. This is optimized for fast, error-free demonstration.
