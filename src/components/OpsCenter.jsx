// StadiumPilot AI - Operations Command Center Component
import React, { useState, useEffect } from 'react';
import { generateOperationsBrief, generateIncidentResponsePlan } from '../services/aiService';
import { getOperationalRecommendations } from '../services/decisionEngine';
import { STADIUM_ZONES, POINTS_OF_INTEREST } from '../data/stadiumData';
import StadiumMap from './StadiumMap';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  Timer, 
  Map, 
  Train, 
  Leaf, 
  Activity, 
  RefreshCw, 
  Copy, 
  Printer, 
  AlertTriangle, 
  Plus, 
  FileText,
  Clock,
  Wrench,
  X
} from 'lucide-react';

export default function OpsCenter({ 
  crowds, 
  incidents, 
  transit, 
  occupancy, 
  averageEntryTime, 
  addIncident, 
  updateIncidentStatus,
  operationsBrief,
  setOperationsBrief,
  activityFeed
}) {
  const [briefLoading, setBriefLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentPlan, setIncidentPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  
  // Incident Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formCategory, setFormCategory] = useState('Crowd');
  const [formLocation, setFormLocation] = useState('northGate');
  const [formSeverity, setFormSeverity] = useState('High');
  const [formDescription, setFormDescription] = useState('');

  // Acknowledged recommendations state (to track functioning buttons)
  const [acknowledgedRecs, setAcknowledgedRecs] = useState({});

  // Compute decision-engine recommendations
  const activeRecommendations = getOperationalRecommendations(crowds, incidents, transit);

  // Fetch or generate operations brief
  const loadOperationsBrief = async (force = false) => {
    if (operationsBrief && !force) return;
    setBriefLoading(true);
    try {
      const res = await generateOperationsBrief({ occupancy, averageEntryTime, crowds, transit, incidents });
      setOperationsBrief(res.text);
    } catch (err) {
      setOperationsBrief("Unable to generate operations briefing at this time.");
    } finally {
      setBriefLoading(false);
    }
  };

  useEffect(() => {
    loadOperationsBrief();
  }, [occupancy, averageEntryTime, crowds, transit, incidents]);

  // Load AI response plan when selected incident changes
  const loadIncidentResponsePlan = async (incident) => {
    if (!incident) {
      setIncidentPlan(null);
      return;
    }
    setPlanLoading(true);
    try {
      const res = await generateIncidentResponsePlan(incident);
      setIncidentPlan(res.text);
    } catch (err) {
      setIncidentPlan("Failed to load emergency response steps.");
    } finally {
      setPlanLoading(false);
    }
  };

  const handleSelectIncident = (inc) => {
    setSelectedIncident(inc);
    loadIncidentResponsePlan(inc);
  };

  const handleCreateIncidentSubmit = (e) => {
    e.preventDefault();
    if (!formDescription.trim()) return;

    const locName = STADIUM_ZONES[formLocation]?.name || formLocation;
    addIncident(formCategory, locName, formSeverity, formDescription);
    
    // Reset form
    setFormDescription('');
    setShowCreateForm(false);
  };

  const handleCopyBrief = () => {
    navigator.clipboard.writeText(operationsBrief);
    alert("AI Daily Operations Brief copied to clipboard!");
  };

  const handlePrintBrief = () => {
    window.print();
  };

  // Find most congested zone
  const getMostCongestedZone = () => {
    let mostCongested = 'None';
    let maxWeight = 0;
    const weights = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 };
    
    Object.entries(crowds).forEach(([zoneId, level]) => {
      const w = weights[level] || 0;
      if (w > maxWeight) {
        maxWeight = w;
        mostCongested = STADIUM_ZONES[zoneId]?.name || zoneId;
      }
    });
    return mostCongested;
  };

  const activeAlertsCount = incidents.filter(i => i.status !== 'Resolved').length;
  const criticalIncidentsCount = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;

  return (
    <div className="ops-center-layout">
      
      {/* SECTION 1: TOP KEY METRICS GRID */}
      <div className="ops-metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Stadium Occupancy</span>
            <Users className="metric-icon text-blue" />
          </div>
          <div className="metric-value">{occupancy.toLocaleString()}</div>
          <div className="metric-trend text-green">Capacity: 75,000 (Live)</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Active Alerts</span>
            <ShieldAlert className="metric-icon text-orange" />
          </div>
          <div className="metric-value text-orange">{activeAlertsCount}</div>
          <div className="metric-trend">Monitoring all sectors</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Critical Incidents</span>
            <AlertTriangle className="metric-icon text-red" />
          </div>
          <div className="metric-value text-red">{criticalIncidentsCount}</div>
          <div className="metric-trend">Requires response team</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Average Entry Time</span>
            <Timer className="metric-icon text-blue" />
          </div>
          <div className="metric-value">{averageEntryTime}m</div>
          <div className="metric-trend">Turnstile wait processing</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Peak Congestion Zone</span>
            <Map className="metric-icon text-violet" />
          </div>
          <div className="metric-value font-sm">{getMostCongestedZone()}</div>
          <div className="metric-trend text-red">Critical crowd density</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Transit Dispatch Hub</span>
            <Train className="metric-icon text-green" />
          </div>
          <div className="metric-value font-sm">
            {transit.metroA === 'critical' ? 'DISRUPTED' : 'OPERATIONAL'}
          </div>
          <div className="metric-trend">Metro Terminal A & B</div>
        </div>
      </div>

      {/* DUAL COLUMN INTERFACE */}
      <div className="ops-columns-container">
        
        {/* LEFT COLUMN: Controls, Incidents, Recommendations */}
        <div className="ops-left-column">
          
          {/* AI OPERATIONS RECOMMENDATIONS LIST */}
          <div className="ops-section-card">
            <div className="card-header">
              <div className="header-title-box">
                <ShieldAlert className="text-violet" />
                <h4>Prioritized AI Recommendations</h4>
              </div>
            </div>
            
            <div className="recs-list">
              {activeRecommendations.map(rec => {
                const isAcked = acknowledgedRecs[rec.id];
                const sevLower = rec.severity.toLowerCase();
                return (
                  <div key={rec.id} className={`rec-item priority-${sevLower} ${isAcked ? 'acked' : ''}`}>
                    <div className="rec-top-row">
                      <span className={`priority-tag p-${sevLower}`}>{rec.severity} Priority</span>
                      <span className="rec-category">{rec.actionCategory}</span>
                    </div>
                    
                    <h5 className="rec-title">{rec.title}</h5>
                    
                    <div className="rec-details-panel">
                      <p><strong>Detected Situation:</strong> {rec.detectedSituation}</p>
                      <p><strong>Recommended Action:</strong> {rec.recommendedAction}</p>
                      <p><strong>Why:</strong> {rec.why}</p>
                      <p><strong>Expected Impact:</strong> {rec.expectedImpact}</p>
                      <p><strong>Alternative:</strong> {rec.alternative}</p>
                      <p><strong>Confidence Index:</strong> <span className="text-gradient" style={{ fontWeight: 'bold' }}>{rec.confidence}</span></p>
                    </div>

                    <div className="rec-actions-bar">
                      <button 
                        className={`btn btn-sm ${isAcked ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setAcknowledgedRecs(prev => ({ ...prev, [rec.id]: !prev[rec.id] }))}
                      >
                        {isAcked ? 'Awaiting Action' : 'Acknowledge Recommendation'}
                      </button>
                      <button className="btn btn-sm btn-outline" onClick={() => alert(`Assigning execution: "${rec.title}" to Response Unit.`)}>Assign Unit</button>
                      <button className="btn btn-sm btn-outline" onClick={() => alert(`Recommendation: "${rec.title}" marked as resolved.`)}>Resolve</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INCIDENT MANAGEMENT CENTER */}
          <div className="ops-section-card">
            <div className="card-header justify-between">
              <div className="header-title-box">
                <AlertTriangle className="text-red" />
                <h4>Live Incident Control Center</h4>
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => setShowCreateForm(true)}>
                <Plus size={14} className="btn-icon" />
                <span>Log Incident</span>
              </button>
            </div>

            {/* Create Incident Modal Drawer */}
            {showCreateForm && (
              <div className="incident-form-drawer">
                <div className="drawer-header">
                  <h5>Log New Incident Signal</h5>
                  <button className="close-btn" onClick={() => setShowCreateForm(false)}><X size={16} /></button>
                </div>
                <form onSubmit={handleCreateIncidentSubmit} className="drawer-form">
                  <div className="form-group">
                    <label>Category</label>
                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                      <option value="Medical">Medical Emergency</option>
                      <option value="Security">Security / Stewards</option>
                      <option value="Crowd">Crowd / Congestion</option>
                      <option value="Accessibility">Accessibility Facility</option>
                      <option value="Infrastructure">Infrastructure / Fire</option>
                      <option value="Transport">Transportation delay</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <select value={formLocation} onChange={(e) => setFormLocation(e.target.value)}>
                      {Object.values(STADIUM_ZONES).map(z => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Severity</label>
                    <select value={formSeverity} onChange={(e) => setFormSeverity(e.target.value)}>
                      <option value="Critical">Critical</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description Details</label>
                    <textarea 
                      value={formDescription} 
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Enter description, rows affected, or immediate help demands..."
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full">Deploy Incident Signal</button>
                </form>
              </div>
            )}

            {/* Active Incidents List Table */}
            <div className="incidents-table-wrapper">
              <table className="incidents-table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">No incidents active. Stadium is secure.</td>
                    </tr>
                  ) : (
                    incidents.map(inc => (
                      <tr 
                        key={inc.id} 
                        className={`incident-row ${selectedIncident?.id === inc.id ? 'selected' : ''}`}
                        onClick={() => handleSelectIncident(inc)}
                      >
                        <td>
                          <span className={`severity-badge ${inc.severity.toLowerCase()}`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td><strong>{inc.category}</strong></td>
                        <td>{inc.location}</td>
                        <td>
                          <span className={`status-badge status-${inc.status.replace(/\s+/g, '').toLowerCase()}`}>
                            {inc.status}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="table-actions">
                            {inc.status === 'Open' && (
                              <button className="btn btn-xs btn-outline" onClick={() => updateIncidentStatus(inc.id, 'Assigned')}>Assign</button>
                            )}
                            {inc.status === 'Assigned' && (
                              <button className="btn btn-xs btn-outline" onClick={() => updateIncidentStatus(inc.id, 'In Progress')}>Start</button>
                            )}
                            {inc.status !== 'Resolved' && (
                              <button className="btn btn-xs btn-primary" onClick={() => updateIncidentStatus(inc.id, 'Resolved')}>Resolve</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* AI Decision Support Incident Planner */}
            {selectedIncident && (
              <div className="incident-ai-plan-card fade-in">
                <div className="ai-plan-header">
                  <Activity className="plan-icon pulse-animation text-violet" />
                  <h5>AI Response Action Plan (Incident {selectedIncident.id})</h5>
                </div>
                
                <p className="incident-desc-preview"><strong>Description:</strong> {selectedIncident.description}</p>
                
                {planLoading ? (
                  <div className="plan-loader py-4 text-center">
                    <RefreshCw className="animate-spin text-violet" />
                    <p className="text-xs mt-2">Computing emergency response coordinates...</p>
                  </div>
                ) : (
                  incidentPlan && (
                    <div className="ai-plan-body">
                      {/* Formatted Output */}
                      <div className="plan-steps-container">
                        {incidentPlan.split('\n').map((line, idx) => {
                          if (line.startsWith('RESPONSE PLAN:') || line.startsWith('REASONING SUMMARY:') || line.startsWith('PRIORITY:') || line.startsWith('SUGGESTED TEAM:') || line.startsWith('ESTIMATED RESPONSE:')) {
                            const [label, val] = line.split(':');
                            return (
                              <p key={idx} className="plan-meta-line">
                                <strong>{label}:</strong> {val}
                              </p>
                            );
                          }
                          return <p key={idx} className="plan-step-line">{line}</p>;
                        })}
                      </div>

                      {/* Hard Disclaimer */}
                      <div className="plan-disclaimer">
                        <span>⚠️ <strong>AI decision-support guidance:</strong> Emergency and safety decisions remain with authorized venue personnel.</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* TRANSPORT STATUS MONITOR */}
          <div className="ops-section-card">
            <div className="card-header">
              <div className="header-title-box">
                <Train className="text-blue" />
                <h4>Transportation Logistics Feeds</h4>
              </div>
            </div>

            <div className="transport-grid">
              <div className="transport-card-item">
                <div className="item-header">
                  <span>Metro Terminal A (North)</span>
                  <span className={`status-dot dot-${transit.metroA}`}></span>
                </div>
                <div className="item-details">
                  <p>Status: <strong className={`text-${transit.metroA}`}>{transit.metroA.toUpperCase()}</strong></p>
                  <p>Passenger Density: {transit.metroA === 'critical' ? 'BLOCKED' : (transit.metroA === 'busy' ? 'HIGH' : 'LOW')}</p>
                </div>
              </div>

              <div className="transport-card-item">
                <div className="item-header">
                  <span>Metro Terminal B (South)</span>
                  <span className={`status-dot dot-${transit.metroB}`}></span>
                </div>
                <div className="item-details">
                  <p>Status: <strong className={`text-${transit.metroB}`}>{transit.metroB.toUpperCase()}</strong></p>
                  <p>Passenger Density: {transit.metroB === 'busy' ? 'HIGH' : 'STABLE'}</p>
                </div>
              </div>

              <div className="transport-card-item">
                <div className="item-header">
                  <span>Plaza Shuttle Buses</span>
                  <span className={`status-dot dot-${transit.shuttleBus}`}></span>
                </div>
                <div className="item-details">
                  <p>Status: <strong className={`text-${transit.shuttleBus}`}>{transit.shuttleBus.toUpperCase()}</strong></p>
                  <p>Bus Queue Load: {transit.shuttleBus === 'critical' ? 'OVERLOADED' : 'NORMAL'}</p>
                </div>
              </div>

              <div className="transport-card-item">
                <div className="item-header">
                  <span>West Ride-Share Hub</span>
                  <span className={`status-dot dot-${transit.rideshare}`}></span>
                </div>
                <div className="item-details">
                  <p>Status: <strong className={`text-${transit.rideshare}`}>{transit.rideshare.toUpperCase()}</strong></p>
                  <p>Avg Pickup Wait: {transit.rideshare === 'busy' ? '25 mins' : '8 mins'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Operations Brief, SVG map Heatmap, Sustainability, Logs */}
        <div className="ops-right-column">
          
          {/* AI OPERATIONS DAILY BRIEF */}
          <div className="ops-section-card">
            <div className="card-header justify-between">
              <div className="header-title-box">
                <FileText className="text-violet" />
                <h4>AI Daily Operations Brief</h4>
              </div>
              <div className="brief-actions">
                <button className="btn btn-xs btn-outline" onClick={() => loadOperationsBrief(true)} disabled={briefLoading}>
                  <RefreshCw size={12} className={`btn-icon ${briefLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button className="btn btn-xs btn-outline" onClick={handleCopyBrief}>
                  <Copy size={12} className="btn-icon" />
                  <span>Copy</span>
                </button>
                <button className="btn btn-xs btn-outline" onClick={handlePrintBrief}>
                  <Printer size={12} className="btn-icon" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="brief-content-box">
              {briefLoading ? (
                <div className="py-4 text-center">
                  <RefreshCw className="animate-spin text-violet mx-auto mb-2" />
                  <p className="text-xs">Re-summarizing stadium parameters...</p>
                </div>
              ) : (
                <p className="brief-paragraph">{operationsBrief || "No operations brief generated yet. Click refresh to query AI."}</p>
              )}
            </div>
            <div className="brief-footer-note">
              <span>* Generated by Gemini AI based on active crowd variables.</span>
            </div>
          </div>

          {/* SHARED HEATMAP MAP VIEW */}
          <StadiumMap 
            crowds={crowds}
            accessibilitySettings={{}}
            selectedStart=""
            selectedEnd=""
            onSelectStart={() => {}}
            onSelectEnd={() => {}}
            routeInfo={null}
          />

          {/* SUSTAINABILITY INTELLIGENCE */}
          <div className="ops-section-card">
            <div className="card-header">
              <div className="header-title-box">
                <Leaf className="text-green" />
                <h4>Sustainability & Green Intelligence</h4>
              </div>
            </div>
            
            <div className="sustainability-metrics-grid">
              <div className="sus-metric">
                <span className="sus-val">74.5%</span>
                <span className="sus-lbl">Public Transit Split</span>
              </div>
              <div className="sus-metric">
                <span className="sus-val">88.2%</span>
                <span className="sus-lbl">Waste Diversion</span>
              </div>
              <div className="sus-metric">
                <span className="sus-val">1.4 MWh</span>
                <span className="sus-lbl">Eco Grid Solar Yield</span>
              </div>
              <div className="sus-metric">
                <span className="sus-val">12.8t</span>
                <span className="sus-lbl">CO2 Emissions Avoided</span>
              </div>
            </div>

            <div className="sustainability-ai-card">
              <div className="sus-ai-header">
                <Leaf size={14} className="text-green" />
                <span>AI Green Action Recommendation</span>
              </div>
              <p className="sus-ai-text">
                "Increase digital stadium announcements and concourse signage directing spectators toward Metro Terminal B. Terminal B operates at lower density and shifting 10% of departing traffic there avoids 1.8 tons of private vehicle carbon emissions."
              </p>
            </div>
          </div>

          {/* SYSTEM ACTIVITY EVENT LOGS */}
          <div className="ops-section-card">
            <div className="card-header">
              <div className="header-title-box">
                <Activity className="text-blue" />
                <h4>Live Venue Activity Feed</h4>
              </div>
            </div>

            <div className="activity-feed-list">
              {activityFeed.map(feed => (
                <div key={feed.id} className="feed-item">
                  <span className="feed-time">[{feed.time}]</span>
                  <span className={`feed-message type-${feed.type}`}>{feed.message}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
