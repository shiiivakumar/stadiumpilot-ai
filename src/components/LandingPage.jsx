// StadiumPilot AI - Landing Page Component
import React from 'react';
import { 
  Users, 
  MapPin, 
  Languages, 
  Accessibility, 
  Navigation, 
  ShieldAlert, 
  Cpu, 
  Radio, 
  BrainCircuit, 
  Compass, 
  FileText 
} from 'lucide-react';

export default function LandingPage({ onEnterFan, onEnterOps }) {
  return (
    <div className="landing-container">
      {/* Animated Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="glow-circle glow-blue"></div>
          <div className="glow-circle glow-violet"></div>
        </div>

        <div className="hero-content">
          <div className="badge">
            <Radio className="badge-icon pulse-animation" />
            <span>GLOBAL TOURNAMENT 2026 EDITION</span>
          </div>

          <h1 className="hero-title">
            StadiumPilot <span className="text-gradient">AI</span>
          </h1>
          
          <p className="hero-subtitle">
            "Smarter Stadiums. Safer Crowds. Better Match Days."
          </p>

          <p className="hero-description">
            AI-powered intelligence for fans and stadium operations — from personalized, barrier-free navigation to real-time predictive crowd decision support.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onEnterFan}>
              <Compass className="btn-icon" />
              <span>Enter Stadium (Fan)</span>
            </button>
            <button className="btn btn-secondary btn-lg" onClick={onEnterOps}>
              <Cpu className="btn-icon" />
              <span>Open Command Center (Ops)</span>
            </button>
          </div>
        </div>

        {/* Smart Connected Stadium Animated Graphic */}
        <div className="hero-visual">
          <div className="stadium-graphic-wrapper">
            <svg viewBox="0 0 400 400" className="stadium-svg">
              {/* Outer boundary */}
              <circle cx="200" cy="200" r="160" className="svg-ring-outer" />
              <circle cx="200" cy="200" r="120" className="svg-ring-inner" />
              
              {/* Pitch */}
              <rect x="150" y="160" width="100" height="80" rx="4" className="svg-pitch" />
              <line x1="200" y1="160" x2="200" y2="240" className="svg-pitch-line" />
              <circle cx="200" cy="200" r="20" className="svg-pitch-line" />

              {/* Pulsing smart nodes */}
              <g className="pulsing-nodes">
                {/* North Gate */}
                <circle cx="200" cy="50" r="6" className="node-pulse node-critical" />
                <circle cx="200" cy="50" r="2" className="node-dot" />
                <line x1="200" y1="50" x2="200" y2="120" className="node-link" />

                {/* South Gate */}
                <circle cx="200" cy="350" r="6" className="node-pulse node-safe" />
                <circle cx="200" cy="350" r="2" className="node-dot" />
                <line x1="200" y1="350" x2="200" y2="280" className="node-link" />

                {/* West Gate */}
                <circle cx="50" cy="200" r="6" className="node-pulse node-warning" />
                <circle cx="50" cy="200" r="2" className="node-dot" />
                <line x1="50" y1="200" x2="120" y2="200" className="node-link" />

                {/* East Gate */}
                <circle cx="350" cy="200" r="6" className="node-pulse node-safe" />
                <circle cx="350" cy="200" r="2" className="node-dot" />
                <line x1="350" y1="200" x2="280" y2="200" className="node-link" />

                {/* Core AI satellite link */}
                <circle cx="200" cy="200" r="10" className="node-core-pulse" />
                <circle cx="200" cy="200" r="5" className="node-core-dot" />
              </g>

              {/* Laser scanning effect */}
              <line x1="40" y1="200" x2="360" y2="200" className="scan-line" />
            </svg>
            <div className="radar-label">
              <span className="live-pill">LIVE SIMULATION ENGINE ACTIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Engine Pipeline Section */}
      <section className="engine-section">
        <h2 className="section-title">How StadiumPilot AI Works</h2>
        <p className="section-subtitle">Our context-aware decision stack processes live tournament conditions to protect fans and optimize stadium flow.</p>
        
        <div className="pipeline-flow">
          <div className="pipeline-step">
            <div className="step-num">1</div>
            <div className="step-icon-box"><Radio className="step-icon" /></div>
            <h3>Sense</h3>
            <p>Ingests real-time signals from ticketing gates, transit feeds, and fan location nodes.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          
          <div className="pipeline-step">
            <div className="step-num">2</div>
            <div className="step-icon-box"><BrainCircuit className="step-icon" /></div>
            <h3>Understand</h3>
            <p>AI maps individual safety risks, crowd congestion zones, and accessibility requirements.</p>
          </div>
          <div className="pipeline-arrow">→</div>

          <div className="pipeline-step">
            <div className="step-num">3</div>
            <div className="step-icon-box"><Cpu className="step-icon" /></div>
            <h3>Decide</h3>
            <p>Generates prioritized operational reroutings and personalized navigation courses.</p>
          </div>
          <div className="pipeline-arrow">→</div>

          <div className="pipeline-step">
            <div className="step-num">4</div>
            <div className="step-icon-box"><Navigation className="step-icon" /></div>
            <h3>Act</h3>
            <p>Guides venue stewards and matches spectators with instructions in real time.</p>
          </div>
          <div className="pipeline-arrow">→</div>

          <div className="pipeline-step">
            <div className="step-num">5</div>
            <div className="step-icon-box"><FileText className="step-icon" /></div>
            <h3>Explain</h3>
            <p>Clearly lists the exact reasons, expected savings, and safer alternatives behind actions.</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <h2 className="section-title">Key Operational Capabilities</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Users className="feature-icon text-blue" />
            <h3>AI Crowd Intelligence</h3>
            <p>Simulates and monitors bottlenecks at major gates, concourses, and seating bowls. Instantly updates routing profiles.</p>
          </div>
          
          <div className="feature-card">
            <MapPin className="feature-icon text-violet" />
            <h3>Smart Navigation</h3>
            <p>Dynamic routing paths calculated on active crowd density maps to find the quickest path to restrooms, seating, or medical bays.</p>
          </div>

          <div className="feature-card">
            <Languages className="feature-icon text-green" />
            <h3>Multilingual Assistance</h3>
            <p>Instant fan support translated across English, Spanish, French, Portuguese, and Hindi with speech capabilities.</p>
          </div>

          <div className="feature-card">
            <Accessibility className="feature-icon text-orange" />
            <h3>Accessibility First</h3>
            <p>Specialized routing mode for wheelchairs, step-free paths, low-clutter fonts, high-contrast layouts, and voice guidance.</p>
          </div>

          <div className="feature-card">
            <ShieldAlert className="feature-icon text-red" />
            <h3>Incident Intelligence</h3>
            <p>Centralized incident logs with automated emergency response instructions powered by Google Gemini API.</p>
          </div>

          <div className="feature-card">
            <Cpu className="feature-icon text-blue" />
            <h3>Operational Decision Support</h3>
            <p>Unified data dashboard linking logistics, transit, and security to maintain safety during massive sports events.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>StadiumPilot AI — A Hackathon GenAI Demonstration.</p>
        <p className="footer-disclaimer">Designed for large-scale global tournaments such as the 2026 football tournament. No official affiliation with FIFA or other sports organizations.</p>
      </footer>
    </div>
  );
}
