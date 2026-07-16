import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StadiumMap from '../components/StadiumMap';

describe('StadiumMap Component Tests', () => {
  const mockCrowds = {
    northGate: 'CRITICAL',
    southGate: 'LOW',
    eastConcourse: 'MODERATE',
    westConcourse: 'HIGH'
  };

  test('renders the SVG stadium layout and base structures', () => {
    const { container } = render(
      <StadiumMap
        crowds={mockCrowds}
        accessibilitySettings={{}}
        selectedStart=""
        selectedEnd=""
        onSelectStart={vi.fn()}
        onSelectEnd={vi.fn()}
        routeInfo={null}
      />
    );

    // Verify SVG is in document
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();

    // Verify text labels of major zones are present
    expect(screen.getByText(/North Gate/i)).toBeInTheDocument();
    expect(screen.getByText(/South Gate/i)).toBeInTheDocument();
  });

  test('contains interactive POI filters', () => {
    render(
      <StadiumMap
        crowds={mockCrowds}
        accessibilitySettings={{}}
        selectedStart=""
        selectedEnd=""
        onSelectStart={vi.fn()}
        onSelectEnd={vi.fn()}
        routeInfo={null}
      />
    );

    // Verify filter buttons are rendered
    expect(screen.getByRole('button', { name: /All POIs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restrooms/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /First Aid/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Food Court/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exits/i })).toBeInTheDocument();
  });

  test('updates filter choice when clicking filter badges', () => {
    render(
      <StadiumMap
        crowds={mockCrowds}
        accessibilitySettings={{}}
        selectedStart=""
        selectedEnd=""
        onSelectStart={vi.fn()}
        onSelectEnd={vi.fn()}
        routeInfo={null}
      />
    );

    const restroomsBtn = screen.getByRole('button', { name: 'Restrooms' });
    fireEvent.click(restroomsBtn);
    
    // The button gets marked as active
    expect(restroomsBtn).toHaveClass('active');
  });
});
