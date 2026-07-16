import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DemoPanel from '../components/DemoPanel';

describe('DemoPanel Component Tests', () => {
  
  test('renders scenario selectors and play/pause controls', () => {
    render(
      <DemoPanel
        activeScenario="normal"
        setScenario={vi.fn()}
        simulationRunning={true}
        setSimulationRunning={vi.fn()}
        currentRole="fan"
        setCurrentRole={vi.fn()}
      />
    );
    
    expect(screen.getByText(/Scenario Profiles/i)).toBeInTheDocument();
    expect(screen.getByText(/Crowd Surge/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pause Simulation/i })).toBeInTheDocument();
  });

  test('scenario buttons trigger setScenario callback', () => {
    const setScenarioSpy = vi.fn();
    render(
      <DemoPanel
        activeScenario="normal"
        setScenario={setScenarioSpy}
        simulationRunning={false}
        setSimulationRunning={vi.fn()}
        currentRole="fan"
        setCurrentRole={vi.fn()}
      />
    );

    const surgeBtn = screen.getByRole('button', { name: /Crowd Surge/i });
    fireEvent.click(surgeBtn);
    expect(setScenarioSpy).toHaveBeenCalledWith('surge');
  });

  test('toggling simulation play/pause triggers correct state hooks', () => {
    const toggleSimSpy = vi.fn();
    render(
      <DemoPanel
        activeScenario="normal"
        setScenario={vi.fn()}
        simulationRunning={false}
        setSimulationRunning={toggleSimSpy}
        currentRole="fan"
        setCurrentRole={vi.fn()}
      />
    );

    const playBtn = screen.getByRole('button', { name: /Run AI Simulation/i });
    fireEvent.click(playBtn);
    expect(toggleSimSpy).toHaveBeenCalledWith(true);
  });

  test('Judge Walkthrough opens and advances steps correctly', () => {
    const roleSpy = vi.fn();
    const scenarioSpy = vi.fn();
    const simSpy = vi.fn();

    render(
      <DemoPanel
        activeScenario="normal"
        setScenario={scenarioSpy}
        simulationRunning={false}
        setSimulationRunning={simSpy}
        currentRole="landing"
        setCurrentRole={roleSpy}
      />
    );

    // Open guide using 'Start Demo Tour' button
    const guideBtn = screen.getByRole('button', { name: /Start Demo Tour/i });
    fireEvent.click(guideBtn);
    expect(screen.getByText(/1. The Landing Experience/i)).toBeInTheDocument();

    // Trigger step 1 action (triggers trigger() callback and advances to step 2)
    const actionBtn = screen.getByRole('button', { name: /Enter Stadium/i });
    fireEvent.click(actionBtn);
    expect(roleSpy).toHaveBeenCalledWith('fan');
    expect(screen.getByText(/2. Trigger Crowd Surge/i)).toBeInTheDocument();
  });
});
