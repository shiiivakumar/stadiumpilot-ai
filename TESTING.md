# Verification & Testing - StadiumPilot AI

This document outlines the validation procedures, test scenarios, manual verification protocols, and safety configurations for StadiumPilot AI.

## Automated Validation

The application code is validated using standard React/Vite compilation.
- **Command**: `npm run build`
- **Goal**: Verifies that all components, icons, context variables, and utilities bundle correctly without syntax errors, missing exports, or compiler warnings.

---

## Interactive Demo Testing Checklist

Verify the following steps to ensure a flawless presentation flow for judges:

### 1. Preset Scenarios Check
Select each scenario in the **Demo Control Panel** and verify the simulated UI reaction:
- [ ] **Normal Match Day**:
  - Occupancy is ~42,000. Avg entry time is ~4.5 mins.
  - Heatmap shows green (LOW) or yellow (MODERATE) circles.
  - Operations Brief logs a stable status. No active incidents are visible.
- [ ] **High Crowd Surge**:
  - Occupancy shifts to ~61,000. Avg entry time escalates to ~22.4 mins.
  - North Gate and Metro Terminal A turn red (CRITICAL).
  - Incident `inc-01` ("North Gate Entrance congestion") appears in the table.
  - AI recommendations generate a high-priority redirection warning.
- [ ] **Medical Incident**:
  - Seating Section B turns red (CRITICAL).
  - Incident `inc-02` ("Medical emergency in Section B") appears in the table.
- [ ] **Transport Disruption**:
  - Metro Terminal A is marked in red (CRITICAL) and shuttle bus is delayed.
  - Incidents `inc-03` and `inc-04` populate in the log.
- [ ] **Emergency Evacuation**:
  - All stadium zones pulse red (CRITICAL).
  - Occupancy is high, entry times freeze. Evacuation warning alarms logged in activity feed.

### 2. Incident Action plan & Status Changes
- [ ] Open the **Command Center**.
- [ ] Click on the **Medical incident** row in the table.
  - Verify: The AI Response Action Plan card opens and loads response steps (1. Dispatch Medical team, 2. Direct stewards, etc.).
- [ ] Click the **Assign** button next to the incident.
  - Verify: Status switches to `Assigned` with a yellow badge. Feed logs the update.
- [ ] Click the **Start** button.
  - Verify: Status switches to `In Progress` with a blue badge.
- [ ] Click the **Resolve** button.
  - Verify: Status switches to `Resolved` with a green badge. Metric count decreases.

### 3. Wayfinding Routing & Map Verification
- [ ] Open the **Fan Assistant**.
- [ ] In the Pathfinder controls, select:
  - **Start**: `Metro Terminal A`
  - **Destination**: `Seating Section A`
- [ ] Click on the map directly or select.
  - Verify: A route path is drawn on the SVG canvas connecting the points.
  - Verify: The Route results card displays distance, estimated time, and the formatted recommendation blocks (**Recommended Route**, **Why**, **Expected Benefit**, **Alternative**).
- [ ] Toggle **Wheelchair Route** checkbox:
  - Verify: The route details update to show an accessible path, and the path coordinates on the map shift or highlight step-free corridors (using the West Concourse bypass).

### 4. Multilingual & Audio Verification
- [ ] Switch language to **Español (ES)** or **Français (FR)** in the Chat Header:
  - Verify: The welcome bubble changes or subsequent questions simulate translated text output.
- [ ] Ask a quick question (e.g. click "Where is the nearest accessible restroom?"):
  - Verify: Chat generates a Spanish or French response, clearly mapping the formatted headers (**ACCIÓN RECOMENDADA**, **POR QUÉ**, etc.).
- [ ] Click the **Speaker icon** on the AI message bubble:
  - Verify: Browser vocal synthesis speaks the response in the chosen language.
- [ ] Toggle the **Microphone icon** (if SpeechRecognition is supported by your browser):
  - Verify: Input field updates using voice dictation.

### 5. Accessibility Controls
- [ ] Click the **Accessibility** button in the main header:
- [ ] Toggle **High Contrast Mode**:
  - Verify: Background switches to absolute black `#000000`, card backgrounds turn high-contrast dark, text colors turn high-contrast yellow/white, and borders turn solid white.
- [ ] Toggle **Larger Text Mode**:
  - Verify: Fonts scale up globally by 20% across headers, paragraphs, buttons, and selects.

---

## Known Limitations

1. **Local Speech Recognition**: Web Speech API (`window.webkitSpeechRecognition`) is browser-dependent and may not function on certain versions of Firefox or Safari without permission settings. Graceful text input fallbacks are fully active.
2. **SVG Wayfinding Waypoints**: Path routing is drawn using linear waypoint sequences rather than an exhaustive grid search (Dijkstra) of every seat row. This is optimized for fast, error-free demonstration.
