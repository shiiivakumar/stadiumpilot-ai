import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '../components/LandingPage';

describe('LandingPage Component Tests', () => {
  test('renders page headers and key taglines', () => {
    render(<LandingPage onEnterFan={vi.fn()} onEnterOps={vi.fn()} />);
    
    expect(screen.getByRole('heading', { level: 1, name: /StadiumPilot/i })).toBeInTheDocument();
    expect(screen.getByText(/"Smarter Stadiums. Safer Crowds. Better Match Days."/i)).toBeInTheDocument();
    expect(screen.getByText(/LIVE SIMULATION ENGINE ACTIVE/i)).toBeInTheDocument();
  });

  test('triggers navigation callback when Fan Assistant is clicked', () => {
    const fanSpy = vi.fn();
    render(<LandingPage onEnterFan={fanSpy} onEnterOps={vi.fn()} />);
    
    const fanBtn = screen.getByRole('button', { name: /Enter Stadium/i });
    fireEvent.click(fanBtn);
    expect(fanSpy).toHaveBeenCalledTimes(1);
  });

  test('triggers navigation callback when Command Center is clicked', () => {
    const opsSpy = vi.fn();
    render(<LandingPage onEnterFan={vi.fn()} onEnterOps={opsSpy} />);
    
    const opsBtn = screen.getByRole('button', { name: /Open Command Center/i });
    fireEvent.click(opsBtn);
    expect(opsSpy).toHaveBeenCalledTimes(1);
  });
});
