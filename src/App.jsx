// StadiumPilot AI - Root Application Component
import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import LandingPage from './components/LandingPage';
import FanAssistant from './components/FanAssistant';
import OpsCenter from './components/OpsCenter';
import DemoPanel from './components/DemoPanel';
import { 
  Compass, 
  Cpu, 
  Accessibility, 
  Radio
} from 'lucide-react';

function MainApp() {
  const [currentRole, setCurrentRole] = useState('landing');
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);
  
  const {
    activeScenario,
    setScenario,
    simulationRunning,
    setSimulationRunning,
    crowds,
    transit,
    accessibilitySettings,
    toggleAccessibility,
    selectedLanguage,
    setSelectedLanguage,
    incidents,
    addIncident,
    updateIncidentStatus,
    occupancy,
    averageEntryTime,
    operationsBrief,
    setOperationsBrief,
    activityFeed
  } = useSimulation();

  const activeAlerts = incidents.filter(i => i.status !== 'Resolved').length;

  return (
    <div className={`app-wrapper ${accessibilitySettings.highContrast ? 'high-contrast' : ''} ${accessibilitySettings.largeText ? 'large-text' : ''}`}>
      
      {/* GLOBAL HEADER BAR */}
      <header className="global-header">
        <div className="header-branding" onClick={() => setCurrentRole('landing')} style={{ cursor: 'pointer' }}>
          <Radio className="branding-icon pulse-animation" />
          <span className="branding-title">StadiumPilot <strong className="text-gradient">AI</strong></span>
          <span className="shared-intelligence-badge">Shared Stadium Intelligence</span>
        </div>

        {/* Navigation / Role Selector */}
        <nav className="header-nav">
          <button 
            className={`nav-link ${currentRole === 'landing' ? 'active' : ''}`}
            onClick={() => setCurrentRole('landing')}
          >
            Home
          </button>
          
          <button 
            className={`nav-link role-pill fan-pill ${currentRole === 'fan' ? 'active' : ''}`}
            onClick={() => setCurrentRole('fan')}
          >
            <Compass size={14} className="nav-pill-icon" />
            <span>Fan Assistant</span>
          </button>

          <button 
            className={`nav-link role-pill ops-pill ${currentRole === 'ops' ? 'active' : ''}`}
            onClick={() => setCurrentRole('ops')}
          >
            <Cpu size={14} className="nav-pill-icon" />
            <span>Command Center</span>
            {activeAlerts > 0 && (
              <span className="nav-alert-badge animate-pulse">{activeAlerts}</span>
            )}
          </button>
        </nav>

        {/* Accessibility Panel Quick Toggle */}
        <div className="header-actions">
          <button 
            className={`btn btn-sm btn-icon-only accessibility-toggle-btn ${showAccessDropdown ? 'active' : ''}`}
            onClick={() => setShowAccessDropdown(!showAccessDropdown)}
            title="Accessibility Preferences"
            aria-label="Accessibility Settings"
          >
            <Accessibility size={18} />
          </button>

          {showAccessDropdown && (
            <div className="accessibility-dropdown shadow-lg fade-in">
              <h5>Accessibility Options</h5>
              <hr />
              <label className="access-item">
                <input 
                  type="checkbox" 
                  checked={accessibilitySettings.wheelchair}
                  onChange={() => toggleAccessibility('wheelchair')}
                />
                <span>♿ Wheelchair Route</span>
              </label>
              
              <label className="access-item">
                <input 
                  type="checkbox" 
                  checked={accessibilitySettings.stepFree}
                  onChange={() => toggleAccessibility('stepFree')}
                />
                <span>Step-Free Routing</span>
              </label>

              <label className="access-item">
                <input 
                  type="checkbox" 
                  checked={accessibilitySettings.reducedWalking}
                  onChange={() => toggleAccessibility('reducedWalking')}
                />
                <span>Reduced Walking Paths</span>
              </label>

              <hr />

              <button 
                className={`btn btn-xs w-full mb-2 ${accessibilitySettings.highContrast ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => toggleAccessibility('highContrast')}
              >
                {accessibilitySettings.highContrast ? 'Disable High Contrast' : 'Enable High Contrast'}
              </button>

              <button 
                className={`btn btn-xs w-full ${accessibilitySettings.largeText ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => toggleAccessibility('largeText')}
              >
                {accessibilitySettings.largeText ? 'Disable Larger Text' : 'Larger Text (Scale up)'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CORE VIEW ROUTER */}
      <main className="main-content-area">
        {currentRole === 'landing' && (
          <LandingPage 
            onEnterFan={() => setCurrentRole('fan')}
            onEnterOps={() => setCurrentRole('ops')}
          />
        )}
        
        {currentRole === 'fan' && (
          <FanAssistant 
            crowds={crowds}
            transit={transit}
            accessibilitySettings={accessibilitySettings}
            toggleAccessibility={toggleAccessibility}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
        )}

        {currentRole === 'ops' && (
          <OpsCenter 
            crowds={crowds}
            incidents={incidents}
            transit={transit}
            occupancy={occupancy}
            averageEntryTime={averageEntryTime}
            addIncident={addIncident}
            updateIncidentStatus={updateIncidentStatus}
            operationsBrief={operationsBrief}
            setOperationsBrief={setOperationsBrief}
            activityFeed={activityFeed}
          />
        )}
      </main>

      {/* FLOATING DEMO CONTROL PANEL */}
      <DemoPanel 
        activeScenario={activeScenario}
        setScenario={setScenario}
        simulationRunning={simulationRunning}
        setSimulationRunning={setSimulationRunning}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />
      
      {/* Privacy Notice Disclaimer */}
      <div className="privacy-pill">
        <span>StadiumPilot AI demo does not require users to provide personal information. Simulation data is synthetic and used only for demonstration.</span>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <MainApp />
    </SimulationProvider>
  );
}
