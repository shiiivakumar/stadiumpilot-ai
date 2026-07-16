// StadiumPilot AI - Simulation Context & Global State Engine
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { DEMO_SCENARIOS, STADIUM_ZONES } from '../data/stadiumData';

const SimulationContext = createContext(null);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

export const SimulationProvider = ({ children }) => {
  const [activeScenario, setActiveScenario] = useState('normal');
  const [crowds, setCrowds] = useState(DEMO_SCENARIOS.normal.crowds);
  const [incidents, setIncidents] = useState(DEMO_SCENARIOS.normal.incidents);
  const [transit, setTransit] = useState(DEMO_SCENARIOS.normal.transit);
  const [occupancy, setOccupancy] = useState(DEMO_SCENARIOS.normal.occupancy);
  const [averageEntryTime, setAverageEntryTime] = useState(DEMO_SCENARIOS.normal.averageEntryTime);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [operationsBrief, setOperationsBrief] = useState('');
  const [activityFeed, setActivityFeed] = useState([
    { id: 'act-0', time: '10 mins ago', message: 'Stadium gates opened for match day.', type: 'info' },
    { id: 'act-1', time: '5 mins ago', message: 'All ticketing gates reported fully operational.', type: 'info' }
  ]);

  // Accessibility settings state
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    wheelchair: false,
    reducedWalking: false,
    stepFree: false,
    highContrast: false,
    largeText: false
  });

  // Multilingual state
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Load a scenario
  const setScenario = useCallback((scenarioId) => {
    const scenario = DEMO_SCENARIOS[scenarioId];
    if (!scenario) return;

    setActiveScenario(scenarioId);
    setCrowds({ ...scenario.crowds });
    setIncidents(scenario.incidents.map(inc => ({ ...inc })));
    setTransit({ ...scenario.transit });
    setOccupancy(scenario.occupancy);
    setAverageEntryTime(scenario.averageEntryTime);
    setOperationsBrief(''); // Reset brief to force AI recalculation

    // Log the scenario switch in activity feed
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityFeed(prev => [
      {
        id: `scenario-${Date.now()}`,
        time: timestamp,
        message: `Scenario shifted to: ${scenario.name}. Stadium parameters updated.`,
        type: 'scenario'
      },
      ...prev
    ]);
  }, []);

  // Update crowd in specific zone
  const updateZoneCrowd = useCallback((zoneId, newLevel) => {
    setCrowds(prev => ({
      ...prev,
      [zoneId]: newLevel
    }));
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityFeed(prev => [
      {
        id: `crowd-${Date.now()}`,
        time: timestamp,
        message: `Crowd in ${STADIUM_ZONES[zoneId]?.name || zoneId} updated to ${newLevel}.`,
        type: 'crowd'
      },
      ...prev
    ]);
  }, []);

  // Add a new incident manually or dynamically
  const addIncident = useCallback((category, location, severity, description) => {
    const newInc = {
      id: `inc-${Date.now()}`,
      category,
      location,
      time: 'Just now',
      severity,
      status: 'Open',
      description
    };
    
    setIncidents(prev => [newInc, ...prev]);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityFeed(prev => [
      {
        id: `inc-log-${Date.now()}`,
        time: timestamp,
        message: `ALERT: New ${severity} ${category} incident reported at ${location}.`,
        type: 'alert'
      },
      ...prev
    ]);
  }, []);

  // Update incident status
  const updateIncidentStatus = useCallback((id, status) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, status };
      }
      return inc;
    }));

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const incObj = incidents.find(i => i.id === id);
    setActivityFeed(prev => [
      {
        id: `inc-status-${Date.now()}`,
        time: timestamp,
        message: `Incident ${id} (${incObj?.category || 'General'}) marked as ${status}.`,
        type: 'info'
      },
      ...prev
    ]);
  }, [incidents]);

  // Toggle accessibility settings
  const toggleAccessibility = useCallback((key) => {
    setAccessibilitySettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      
      // Update HTML classes for global stylesheet toggles
      if (key === 'highContrast') {
        if (updated.highContrast) {
          document.documentElement.classList.add('accessibility-high-contrast');
        } else {
          document.documentElement.classList.remove('accessibility-high-contrast');
        }
      }
      if (key === 'largeText') {
        if (updated.largeText) {
          document.documentElement.classList.add('accessibility-large-text');
        } else {
          document.documentElement.classList.remove('accessibility-large-text');
        }
      }
      
      return updated;
    });
  }, []);

  // Simulation Loop
  useEffect(() => {
    let interval = null;
    if (simulationRunning) {
      interval = setInterval(() => {
        // Randomly modify occupancy by +- 20 spectators
        setOccupancy(prev => {
          const delta = Math.floor(Math.random() * 41) - 20;
          return Math.max(1000, prev + delta);
        });

        // Randomly adjust entry times slightly
        setAverageEntryTime(prev => {
          const delta = (Math.random() * 0.4 - 0.2);
          return Math.max(1.0, parseFloat((prev + delta).toFixed(1)));
        });

        // Small chance (10%) to shift a LOW/MODERATE zone to MODERATE/HIGH or vice versa
        if (Math.random() < 0.1) {
          const zoneKeys = Object.keys(STADIUM_ZONES).filter(key => !STADIUM_ZONES[key].isExternal);
          const randomZone = zoneKeys[Math.floor(Math.random() * zoneKeys.length)];
          
          setCrowds(prev => {
            const currentLevel = prev[randomZone];
            let nextLevel = currentLevel;
            if (currentLevel === 'LOW') nextLevel = 'MODERATE';
            else if (currentLevel === 'MODERATE') nextLevel = Math.random() > 0.5 ? 'HIGH' : 'LOW';
            else if (currentLevel === 'HIGH') nextLevel = Math.random() > 0.5 ? 'CRITICAL' : 'MODERATE';
            
            if (nextLevel !== currentLevel) {
              const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              setActivityFeed(prevFeed => [
                {
                  id: `crowd-${Date.now()}`,
                  time: timestamp,
                  message: `Crowd in ${STADIUM_ZONES[randomZone]?.name || randomZone} updated to ${nextLevel}.`,
                  type: 'crowd'
                },
                ...prevFeed
              ]);
              return {
                ...prev,
                [randomZone]: nextLevel
              };
            }
            return prev;
          });
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulationRunning]);

  // Value payload memoized for rendering efficiency
  const value = React.useMemo(() => ({
    activeScenario,
    crowds,
    incidents,
    transit,
    occupancy,
    averageEntryTime,
    simulationRunning,
    setSimulationRunning,
    operationsBrief,
    setOperationsBrief,
    activityFeed,
    setActivityFeed,
    accessibilitySettings,
    toggleAccessibility,
    selectedLanguage,
    setSelectedLanguage,
    setScenario,
    updateZoneCrowd,
    addIncident,
    updateIncidentStatus
  }), [
    activeScenario,
    crowds,
    incidents,
    transit,
    occupancy,
    averageEntryTime,
    simulationRunning,
    operationsBrief,
    activityFeed,
    accessibilitySettings,
    selectedLanguage,
    toggleAccessibility,
    setSelectedLanguage,
    setScenario,
    updateZoneCrowd,
    addIncident,
    updateIncidentStatus
  ]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};
