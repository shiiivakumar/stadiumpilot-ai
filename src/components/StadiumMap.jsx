// StadiumPilot AI - Interactive Stadium Map Component
import React, { useState } from 'react';
import { STADIUM_ZONES, POINTS_OF_INTEREST, getRoutePath } from '../data/stadiumData';
import { 
  Info, 
  MapPin, 
  Flame, 
  ShieldAlert, 
  Heart, 
  Compass, 
  Utensils, 
  Accessibility, 
  RotateCcw,
  Navigation
} from 'lucide-react';

export default function StadiumMap({ 
  crowds, 
  accessibilitySettings, 
  selectedStart, 
  selectedEnd, 
  onSelectStart, 
  onSelectEnd,
  routeInfo 
}) {
  const [poiFilter, setPoiFilter] = useState('all'); // 'all' | 'restroom' | 'food' | 'medical' | 'info' | 'emergency_exit'
  const [hoveredZone, setHoveredZone] = useState(null);

  // Helper for crowd density styling
  const getCrowdColor = (density) => {
    switch (density) {
      case 'CRITICAL':
        return { fill: 'rgba(239, 68, 68, 0.35)', stroke: '#ef4444', text: '#fca5a5', pulse: 'critical-pulse' };
      case 'HIGH':
        return { fill: 'rgba(249, 115, 22, 0.3)', stroke: '#f97316', text: '#fdba74', pulse: 'warning-pulse' };
      case 'MODERATE':
        return { fill: 'rgba(245, 158, 11, 0.2)', stroke: '#f59e0b', text: '#fde047', pulse: '' };
      case 'LOW':
      default:
        return { fill: 'rgba(16, 185, 129, 0.15)', stroke: '#10b981', text: '#6ee7b7', pulse: '' };
    }
  };

  // POI color helper
  const getPoiColor = (type) => {
    switch (type) {
      case 'restroom': return '#3b82f6';
      case 'restroom_accessible': return '#8b5cf6';
      case 'medical': return '#ef4444';
      case 'food': return '#f59e0b';
      case 'info': return '#10b981';
      case 'emergency_exit': return '#ec4899';
      default: return '#94a3b8';
    }
  };

  // Generate path coordinates
  const routePoints = (selectedStart && selectedEnd) 
    ? getRoutePath(selectedStart, selectedEnd, accessibilitySettings)
    : [];

  const handleZoneClick = (zoneId) => {
    // If start is not set, set it. Otherwise set end. If both are set, reset and set start.
    if (!selectedStart) {
      onSelectStart(zoneId);
    } else if (!selectedEnd) {
      if (zoneId === selectedStart) return; // Can't route to same place
      onSelectEnd(zoneId);
    } else {
      onSelectStart(zoneId);
      onSelectEnd('');
    }
  };

  const handleResetMap = () => {
    onSelectStart('');
    onSelectEnd('');
  };

  return (
    <div className="stadium-map-card">
      <div className="map-header">
        <div className="map-title-box">
          <Navigation className="map-header-icon" />
          <h3>Interactive Stadium Navigation</h3>
          <span className="simulated-badge">Live Demo Simulation</span>
        </div>
        <button className="btn btn-sm btn-icon-only" onClick={handleResetMap} title="Reset Route">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* POI Filters */}
      <div className="poi-filters">
        <button 
          className={`filter-btn ${poiFilter === 'all' ? 'active' : ''}`}
          onClick={() => setPoiFilter('all')}
        >
          All POIs
        </button>
        <button 
          className={`filter-btn ${poiFilter === 'restroom' ? 'active' : ''}`}
          onClick={() => setPoiFilter('restroom')}
        >
          Restrooms
        </button>
        <button 
          className={`filter-btn ${poiFilter === 'medical' ? 'active' : ''}`}
          onClick={() => setPoiFilter('medical')}
        >
          First Aid
        </button>
        <button 
          className={`filter-btn ${poiFilter === 'food' ? 'active' : ''}`}
          onClick={() => setPoiFilter('food')}
        >
          Food Court
        </button>
        <button 
          className={`filter-btn ${poiFilter === 'emergency_exit' ? 'active' : ''}`}
          onClick={() => setPoiFilter('emergency_exit')}
        >
          Exits
        </button>
      </div>

      {/* SVG Canvas */}
      <div className="svg-map-container">
        <svg viewBox="0 0 800 850" className="interactive-svg">
          {/* Background Grid Lines (futuristic aesthetic) */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Exterior Boundaries */}
          <ellipse cx="400" cy="400" rx="360" ry="380" className="stadium-outer-ring" />
          <ellipse cx="400" cy="400" rx="300" ry="320" className="stadium-middle-ring" />
          <ellipse cx="400" cy="400" rx="200" ry="220" className="stadium-inner-ring" />

          {/* Zones Heatmap Overlay */}
          {Object.values(STADIUM_ZONES).map(zone => {
            const crowdState = crowds[zone.id] || 'LOW';
            const colors = getCrowdColor(crowdState);
            const isHovered = hoveredZone === zone.id;
            const isSelected = selectedStart === zone.id || selectedEnd === zone.id;

            return (
              <g 
                key={zone.id}
                className={`map-zone-group ${colors.pulse}`}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => handleZoneClick(zone.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Visual Area circle */}
                <circle 
                  cx={zone.x} 
                  cy={zone.y} 
                  r={zone.radius} 
                  fill={colors.fill}
                  stroke={isSelected ? '#7c3aed' : colors.stroke}
                  strokeWidth={isSelected ? 4 : (isHovered ? 3 : 1.5)}
                  className="map-zone-node"
                />

                {/* Highlight Selection Rings */}
                {isSelected && (
                  <circle 
                    cx={zone.x} 
                    cy={zone.y} 
                    r={zone.radius + 8} 
                    fill="none" 
                    stroke={selectedStart === zone.id ? '#10b981' : '#7c3aed'} 
                    strokeWidth="1.5" 
                    strokeDasharray="4,4"
                  />
                )}

                {/* Label text */}
                <text 
                  x={zone.x} 
                  y={zone.y + zone.labelYOffset} 
                  className={`zone-label-text ${isSelected ? 'selected' : ''}`}
                >
                  {zone.name}
                </text>
                <text 
                  x={zone.x} 
                  y={zone.y + zone.labelYOffset + 14} 
                  fill={colors.text} 
                  className="zone-label-density"
                >
                  {crowdState}
                </text>
              </g>
            );
          })}

          {/* Route path rendering */}
          {routePoints.length > 1 && (
            <g className="routing-layer">
              {/* Route line shadow glow */}
              <path
                d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke={accessibilitySettings.wheelchair || accessibilitySettings.stepFree ? '#8b5cf6' : '#2563eb'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
                className="route-glow-path"
              />
              {/* Actual route line */}
              <path
                d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke={accessibilitySettings.wheelchair || accessibilitySettings.stepFree ? '#c084fc' : '#3b82f6'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={accessibilitySettings.wheelchair || accessibilitySettings.stepFree ? '6,6' : 'none'}
                className="route-actual-path"
              />
              {/* Dynamic direction arrows moving along the route */}
              <path
                d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="10, 40"
                className="route-animation-flow"
              />
            </g>
          )}

          {/* Points of Interest Icons */}
          {POINTS_OF_INTEREST.filter(poi => {
            if (poiFilter === 'all') return true;
            if (poiFilter === 'restroom' && (poi.type === 'restroom' || poi.type === 'restroom_accessible')) return true;
            return poi.type === poiFilter;
          }).map(poi => {
            const isAccessibleRestroom = poi.type === 'restroom_accessible';
            const color = getPoiColor(poi.type);

            return (
              <g key={poi.id} className="poi-marker" transform={`translate(${poi.x}, ${poi.y})`}>
                <circle cx="0" cy="0" r="10" fill="#0d1426" stroke={color} strokeWidth="1.5" />
                
                {poi.type === 'medical' && (
                  <path d="M -5 0 L 5 0 M 0 -5 L 0 5" stroke="#ef4444" strokeWidth="2.5" />
                )}
                {poi.type === 'food' && (
                  <circle cx="0" cy="0" r="4" fill="#f59e0b" />
                )}
                {poi.type === 'info' && (
                  <text x="0" y="3.5" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">i</text>
                )}
                {poi.type === 'emergency_exit' && (
                  <polygon points="-4,-4 4,0 -4,4" fill="#ec4899" />
                )}
                {poi.type === 'restroom' && (
                  <text x="0" y="3" fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">WC</text>
                )}
                {isAccessibleRestroom && (
                  <text x="0" y="3" fill="#8b5cf6" fontSize="9" fontWeight="bold" textAnchor="middle">♿</text>
                )}

                {/* Hover label for POIs */}
                <title>{poi.name}</title>
              </g>
            );
          })}

          {/* Route Terminals Pins */}
          {selectedStart && (
            <g transform={`translate(${STADIUM_ZONES[selectedStart].x}, ${STADIUM_ZONES[selectedStart].y - 25})`} className="pin-marker start-pin">
              <path d="M 0 0 C -8 -12 -12 -16 -12 -24 C -12 -32 -6 -36 0 -36 C 6 -36 12 -32 12 -24 C 12 -16 8 -12 0 0 Z" fill="#10b981" />
              <circle cx="0" cy="-24" r="4" fill="white" />
              <text x="0" y="-42" className="pin-text">START</text>
            </g>
          )}
          {selectedEnd && (
            <g transform={`translate(${STADIUM_ZONES[selectedEnd].x}, ${STADIUM_ZONES[selectedEnd].y - 25})`} className="pin-marker end-pin">
              <path d="M 0 0 C -8 -12 -12 -16 -12 -24 C -12 -32 -6 -36 0 -36 C 6 -36 12 -32 12 -24 C 12 -16 8 -12 0 0 Z" fill="#7c3aed" />
              <circle cx="0" cy="-24" r="4" fill="white" />
              <text x="0" y="-42" className="pin-text">DESTINATION</text>
            </g>
          )}
        </svg>
      </div>

      <div className="map-legend">
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#10b981' }}></span> LOW</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span> MODERATE</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#f97316' }}></span> HIGH</div>
        <div className="legend-item animate-pulse"><span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span> CRITICAL</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span> RESTROOM</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span> ACCESSIBLE</div>
        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span> FIRST AID</div>
      </div>
      
      <div className="map-help-text">
        <Info size={14} className="info-icon" />
        <span>Click on any zone node directly on the map to set your Start and Destination points.</span>
      </div>
    </div>
  );
}
