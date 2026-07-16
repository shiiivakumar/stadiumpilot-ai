// StadiumPilot AI - Demo Control Panel & Judge Walkthrough
import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Sliders, 
  ChevronRight, 
  Award,
  BookOpen,
  X
} from 'lucide-react';

export default function DemoPanel({ 
  activeScenario, 
  setScenario, 
  simulationRunning, 
  setSimulationRunning,
  setCurrentRole
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [walkthroughActive, setWalkthroughActive] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const scenariosList = [
    { id: 'normal', name: 'Normal Day', color: 'green' },
    { id: 'surge', name: 'Crowd Surge', color: 'orange' },
    { id: 'medical', name: 'Medical Alert', color: 'red' },
    { id: 'transport', name: 'Transport Delays', color: 'blue' },
    { id: 'evacuation', name: 'Evacuation', color: 'critical' }
  ];

  const walkthroughSteps = [
    {
      title: "1. The Landing Experience",
      text: "You are on the landing page of StadiumPilot AI. Notice the animated stadium scanning nodes. To start, click below to load the Fan Companion.",
      actionLabel: "Enter Stadium",
      trigger: () => {
        setCurrentRole('fan');
      }
    },
    {
      title: "2. Trigger Crowd Surge",
      text: "A massive train arrives. Let's simulate a crowd bottleneck at the gates. Click below to load the High Crowd Surge scenario.",
      actionLabel: "Trigger Surge Scenario",
      trigger: () => {
        setScenario('surge');
        setSimulationRunning(true);
      }
    },
    {
      title: "3. Check the Fan Map",
      text: "Look at the map. The North Gate and Metro Terminal A have turned pulsating red (CRITICAL). Look at the 'Pathfinder Route Planner' below. It warns about gate congestion and dynamically advises entering from the East Gate.",
      actionLabel: "Analyze Fan Map",
      trigger: () => {
        // Just highlight map
      }
    },
    {
      title: "4. Load Command Center",
      text: "Let's inspect how the stadium control staff handles this. Click below to switch to the Operations Command Center.",
      actionLabel: "Switch to Operations",
      trigger: () => {
        setCurrentRole('ops');
      }
    },
    {
      title: "5. Process AI Recommendations",
      text: "In the Command Center, the AI Decision Engine instantly displays a high priority 'North Gate Congestion' card. Read the reasoning and click 'Acknowledge Recommendation' to signal dispatch teams.",
      actionLabel: "Review Recommendations",
      trigger: () => {
        // Focus recommendations
      }
    },
    {
      title: "6. Shared intelligence",
      text: "Finally, switch back to Fan mode. Notice that the Fan Chatbot and map route planner now immediately direct new fans to the East Gate, utilizing the same shared real-time operations database.",
      actionLabel: "Finish Demo Walkthrough",
      trigger: () => {
        setCurrentRole('fan');
      }
    }
  ];

  const handleNextStep = () => {
    const currentStepConfig = walkthroughSteps[walkthroughStep];
    if (currentStepConfig.trigger) {
      currentStepConfig.trigger();
    }

    if (walkthroughStep < walkthroughSteps.length - 1) {
      setWalkthroughStep(prev => prev + 1);
    } else {
      // Complete
      setWalkthroughActive(false);
      setWalkthroughStep(0);
      alert("Evaluation completed! StadiumPilot AI demonstrated seamless shared intelligence between Fan and Operations views.");
    }
  };

  const handleStartWalkthrough = () => {
    setWalkthroughActive(true);
    setWalkthroughStep(0);
    setCurrentRole('landing');
    setScenario('normal');
  };

  const handleStopWalkthrough = () => {
    setWalkthroughActive(false);
    setWalkthroughStep(0);
  };

  return (
    <>
      {/* Small floating toggle button if closed */}
      {!isOpen && (
        <button className="demo-panel-toggle pulse-animation" onClick={() => setIsOpen(true)}>
          <Sliders size={20} />
          <span>Demo Controller</span>
        </button>
      )}

      {/* Slide-out drawer panel */}
      {isOpen && (
        <div className="demo-panel-container fade-in">
          <div className="demo-panel-header">
            <div className="header-title">
              <Sliders size={16} className="text-blue" />
              <span>Demo Scenario Simulator</span>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="demo-panel-body">
            {/* Live Indicator */}
            <div className="live-indicator-row">
              <span className="live-dot pulse-animation"></span>
              <span className="live-text">LIVE SIMULATOR CONTEXT</span>
            </div>

            {/* AI Simulation Loop Toggle */}
            <div className="sim-control-box">
              <span className="control-label">AI Simulation Loops</span>
              <button 
                className={`btn btn-sm ${simulationRunning ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => setSimulationRunning(!simulationRunning)}
              >
                {simulationRunning ? <Pause size={14} className="btn-icon" /> : <Play size={14} className="btn-icon" />}
                <span>{simulationRunning ? 'Pause Simulation' : 'Run AI Simulation'}</span>
              </button>
            </div>

            {/* Scenarios Preset Buttons */}
            <div className="scenarios-presets-box">
              <span className="control-label">Preset Scenario Profiles:</span>
              <div className="scenario-buttons-grid">
                {scenariosList.map(sc => (
                  <button 
                    key={sc.id}
                    className={`scenario-btn btn-border-${sc.color} ${activeScenario === sc.id ? 'active' : ''}`}
                    onClick={() => setScenario(sc.id)}
                  >
                    {sc.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="divider" />

            {/* Judge Walkthrough Tour */}
            <div className="judge-walkthrough-box">
              <div className="walkthrough-title-row">
                <Award size={16} className="text-violet" />
                <span>2-Minute Evaluation Guide</span>
              </div>
              
              {!walkthroughActive ? (
                <div className="walkthrough-intro">
                  <p className="text-xs">Let our guided checklist walk you through the shared intelligence demo flow.</p>
                  <button className="btn btn-secondary btn-sm w-full" onClick={handleStartWalkthrough}>
                    <BookOpen size={14} className="btn-icon" />
                    <span>Start Demo Tour</span>
                  </button>
                </div>
              ) : (
                <div className="walkthrough-active-card fade-in">
                  <div className="step-badge">STEP {walkthroughStep + 1} OF {walkthroughSteps.length}</div>
                  <h5 className="step-title">{walkthroughSteps[walkthroughStep].title}</h5>
                  <p className="step-text">{walkthroughSteps[walkthroughStep].text}</p>
                  
                  <div className="step-actions">
                    <button className="btn btn-primary btn-sm" onClick={handleNextStep}>
                      <span>{walkthroughSteps[walkthroughStep].actionLabel}</span>
                      <ChevronRight size={14} className="btn-icon-right" />
                    </button>
                    <button className="btn btn-outline btn-xs" onClick={handleStopWalkthrough}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
