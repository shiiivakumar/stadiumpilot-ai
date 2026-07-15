// StadiumPilot AI - Fan Assistant Component
import React, { useState, useEffect, useRef } from 'react';
import { askGeminiFan } from '../services/aiService';
import { getRouteRecommendation } from '../services/decisionEngine';
import { STADIUM_ZONES, TRANSIT_OPTIONS } from '../data/stadiumData';
import StadiumMap from './StadiumMap';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Languages, 
  Accessibility, 
  Navigation, 
  Flame, 
  Timer, 
  Compass, 
  MapPin, 
  Train,
  Info,
  Clock
} from 'lucide-react';

const QUICK_QUESTIONS = [
  { text: "Which entrance is least crowded?", tag: "crowd" },
  { text: "Where is the nearest accessible restroom?", tag: "accessibility" },
  { text: "How do I reach Gate B?", tag: "routing" },
  { text: "Which transport option is best after the match?", tag: "transit" },
  { text: "Where is the nearest first aid point?", tag: "medical" },
  { text: "What should I do in an emergency?", tag: "emergency" }
];

const LANGUAGES = [
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Español (ES)' },
  { code: 'fr', name: 'Français (FR)' },
  { code: 'pt', name: 'Português (BR)' },
  { code: 'hi', name: 'हिन्दी (IN)' }
];

export default function FanAssistant({ 
  crowds, 
  transit, 
  accessibilitySettings, 
  toggleAccessibility, 
  selectedLanguage, 
  setSelectedLanguage 
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Welcome to StadiumPilot AI! I am your intelligent tournament guide. Select your language, enable accessibility features, or type any question below. You can ask for directions, food locations, accessible restrooms, or best transport departures.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSimulated: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [ttsActive, setTtsActive] = useState(true);
  
  // Route selection state
  const [startZone, setStartZone] = useState('');
  const [endZone, setEndZone] = useState('');
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = selectedLanguage === 'hi' ? 'hi-IN' : 
                 selectedLanguage === 'es' ? 'es-ES' : 
                 selectedLanguage === 'fr' ? 'fr-FR' : 
                 selectedLanguage === 'pt' ? 'pt-BR' : 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setSpeechActive(false);
      };

      rec.onerror = (e) => {
        console.error('Speech Recognition Error:', e);
        setSpeechActive(false);
      };

      rec.onend = () => {
        setSpeechActive(false);
      };

      recognitionRef.current = rec;
    }
  }, [selectedLanguage]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Text to Speech voice generation
  const speakText = (text) => {
    if (!ttsActive) return;
    window.speechSynthesis?.cancel(); // stop previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose speech language
    utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 
                     selectedLanguage === 'es' ? 'es-ES' : 
                     selectedLanguage === 'fr' ? 'fr-FR' : 
                     selectedLanguage === 'pt' ? 'pt-BR' : 'en-US';
                     
    window.speechSynthesis?.speak(utterance);
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: timestamp
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAiLoading(true);

    try {
      const response = await askGeminiFan(textToSend, { activeScenario: 'custom', crowds, transit, accessibilitySettings }, selectedLanguage);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSimulated: response.isSimulated
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Auto speak if enabled
      speakText(response.text.replace(/\*\*|__/g, '')); // Remove markdown asterisks for TTS
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "Error contacting AI service. Please check your network connection.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const triggerVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (speechActive) {
      recognitionRef.current.stop();
      setSpeechActive(false);
    } else {
      setSpeechActive(true);
      recognitionRef.current.start();
    }
  };

  // Get active route calculations
  const routeInfo = getRouteRecommendation(startZone, endZone, accessibilitySettings, crowds);

  // Transit logic computed based on active status
  const getBestTransitOption = () => {
    // If Metro A is critical, Metro B is recommended.
    const isMetroACrit = transit.metroA === 'critical';
    const isMetroBCrit = transit.metroB === 'critical';
    const accessibilityFilter = accessibilitySettings.wheelchair || accessibilitySettings.stepFree;
    
    if (isMetroACrit) {
      return {
        rec: TRANSIT_OPTIONS.metroB,
        reason: "Metro Terminal A is experiencing critical service delays (all trains suspended). Metro Terminal B is operating normally.",
        benefit: "Save approximately 25 minutes of platform congestion wait.",
        alt: "East Plaza shuttle bus loop."
      };
    }

    if (accessibilityFilter) {
      return {
        rec: TRANSIT_OPTIONS.metroB,
        reason: "Metro Terminal B features modern elevators, extra-wide accessible lanes, and level platform boarding.",
        benefit: "100% stair-free accessibility.",
        alt: "Tournament Shuttle Bus (ramp-equipped)."
      };
    }

    // Default Metro A
    return {
      rec: TRANSIT_OPTIONS.metroA,
      reason: "Metro Terminal A has high departure frequencies and is the most direct line to the main terminal station.",
      benefit: "Estimated transit time is 15 minutes.",
      alt: "Rideshare zone C (West Lot)."
    };
  };

  const recommendedTransit = getBestTransitOption();

  return (
    <div className="fan-assistant-layout">
      {/* LEFT COLUMN: Chat Assistant */}
      <div className="fan-chat-column">
        {/* Top bar for configuration */}
        <div className="chat-config-bar">
          <div className="config-selector">
            <Languages size={16} className="config-icon text-green" />
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="chat-select"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="chat-audio-controls">
            <button 
              className={`btn btn-sm btn-icon-only ${ttsActive ? 'active' : ''}`}
              onClick={() => {
                setTtsActive(!ttsActive);
                if (ttsActive) window.speechSynthesis?.cancel();
              }}
              title={ttsActive ? "Mute Read-Aloud" : "Enable Read-Aloud"}
            >
              {ttsActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="chat-messages-container">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
              <div className="chat-bubble">
                {msg.sender === 'ai' && (
                  <div className="bubble-header">
                    <Compass size={14} className="text-violet" />
                    <span>StadiumPilot AI</span>
                    {msg.isSimulated && <span className="sim-pill">AI Simulator</span>}
                  </div>
                )}
                
                {/* Parse Markdown-like double asterisks for bold headers */}
                <p className="bubble-text">
                  {msg.text.split('\n').map((line, idx) => {
                    if (line.startsWith('**') || line.includes('**')) {
                      // Basic regex to replace **text** with <strong>text</strong>
                      const parts = line.split('**');
                      return (
                        <span key={idx} style={{ display: 'block', margin: '4px 0' }}>
                          {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-gradient">{part}</strong> : part)}
                        </span>
                      );
                    }
                    return <span key={idx} style={{ display: 'block' }}>{line}</span>;
                  })}
                </p>

                <div className="bubble-footer">
                  <span>{msg.time}</span>
                  {msg.sender === 'ai' && (
                    <button className="btn btn-sm btn-icon-only tts-replay-btn" onClick={() => speakText(msg.text.replace(/\*\*|__/g, ''))} title="Speak response">
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isAiLoading && (
            <div className="chat-bubble-wrapper ai">
              <div className="chat-bubble loading">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion buttons */}
        <div className="quick-suggestions-row">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button 
              key={idx}
              className="quick-btn"
              onClick={() => handleSendMessage(q.text)}
            >
              {q.text}
            </button>
          ))}
        </div>

        {/* Input container */}
        <div className="chat-input-bar">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            placeholder={speechActive ? "Listening..." : "Ask me anything about match day..."}
            className="chat-input-field"
            disabled={isAiLoading}
          />
          
          {speechSupported && (
            <button 
              className={`chat-action-btn ${speechActive ? 'active-listening pulse-animation' : ''}`}
              onClick={triggerVoiceInput}
              title="Voice Input"
              disabled={isAiLoading}
            >
              {speechActive ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <button 
            className="chat-send-btn" 
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isAiLoading}
          >
            <Send size={18} />
          </button>
        </div>

        {/* Verification and disclaimers */}
        <div className="chat-disclosure">
          <span>⚠️ AI-assisted responses. Safety decisions remain with authorized venue staff.</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Navigation & Transit Dashboard */}
      <div className="fan-map-column">
        {/* Navigation Selector Dashboard */}
        <div className="navigation-controls-card">
          <div className="controls-header">
            <Navigation size={18} className="text-blue" />
            <h4>Pathfinder Route Planner</h4>
          </div>
          
          <div className="routing-selectors-grid">
            <div className="select-box-wrapper">
              <label>Current Location</label>
              <select 
                value={startZone} 
                onChange={(e) => setStartZone(e.target.value)}
                className="route-select"
              >
                <option value="">-- Choose Starting Point --</option>
                {Object.values(STADIUM_ZONES).map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>

            <div className="select-box-wrapper">
              <label>Destination Point</label>
              <select 
                value={endZone} 
                onChange={(e) => setEndZone(e.target.value)}
                className="route-select"
              >
                <option value="">-- Choose Destination --</option>
                {Object.values(STADIUM_ZONES).map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name} {zone.nameExtra ? `(${zone.nameExtra})` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Accessibility Mode Checkboxes */}
          <div className="accessibility-checkboxes-bar">
            <span className="checkbox-title">Preferences:</span>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.wheelchair}
                onChange={() => toggleAccessibility('wheelchair')}
              />
              <span>♿ Wheelchair Route</span>
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.stepFree}
                onChange={() => toggleAccessibility('stepFree')}
              />
              <span>Step-Free</span>
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={accessibilitySettings.reducedWalking}
                onChange={() => toggleAccessibility('reducedWalking')}
              />
              <span>Reduced Walking</span>
            </label>
          </div>

          {/* Render Route Calculations if active */}
          {routeInfo ? (
            <div className="route-results-container fade-in">
              <div className="route-stats-row">
                <div className="stat-pill">
                  <Clock size={14} />
                  <span>Est. Time: <strong>{routeInfo.estimatedMinutes} mins</strong></span>
                </div>
                <div className="stat-pill">
                  <MapPin size={14} />
                  <span>Distance: <strong>{routeInfo.distanceMeters}m</strong></span>
                </div>
                <div className="stat-pill">
                  <Flame size={14} />
                  <span>Crowd Safety: <strong className={routeInfo.crowdLevel === 'HIGH' ? 'text-red' : 'text-green'}>{routeInfo.crowdLevel}</strong></span>
                </div>
              </div>

              {/* Core GenAI format mapping (Recommended, Why, Expected, Alt) */}
              <div className="formatted-recommendation">
                <div className="rec-section-item">
                  <div className="rec-bullet-title">RECOMMENDED ROUTE:</div>
                  <div className="rec-bullet-desc">{routeInfo.recommendedAction}</div>
                </div>
                <div className="rec-section-item">
                  <div className="rec-bullet-title">WHY:</div>
                  <div className="rec-bullet-desc">{routeInfo.why}</div>
                </div>
                <div className="rec-section-item">
                  <div className="rec-bullet-title">EXPECTED BENEFIT:</div>
                  <div className="rec-bullet-desc">{routeInfo.expectedBenefit}</div>
                </div>
                <div className="rec-section-item">
                  <div className="rec-bullet-title">ALTERNATIVE OPTION:</div>
                  <div className="rec-bullet-desc">{routeInfo.alternative}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="routing-placeholder">
              <span>Select both a Start location and Destination to generate navigation routing path.</span>
            </div>
          )}
        </div>

        {/* Map View */}
        <StadiumMap 
          crowds={crowds}
          accessibilitySettings={accessibilitySettings}
          selectedStart={startZone}
          selectedEnd={endZone}
          onSelectStart={setStartZone}
          onSelectEnd={setEndZone}
          routeInfo={routeInfo}
        />

        {/* Recommended Transit Card */}
        <div className="transit-recommendation-card">
          <div className="card-header">
            <Train className="text-blue" />
            <h4>Best Matchday Departure Transit</h4>
          </div>

          <div className="transit-body">
            <div className="transit-top-info">
              <span className="transit-name">{recommendedTransit.rec.name}</span>
              <span className="transit-location">({recommendedTransit.rec.location})</span>
              <span className={`transit-status-pill status-${recommendedTransit.rec.status}`}>
                {recommendedTransit.rec.status.toUpperCase()}
              </span>
            </div>

            <p className="transit-reason"><strong>Recommendation:</strong> {recommendedTransit.reason}</p>
            <p className="transit-benefit"><strong>Expected Benefit:</strong> {recommendedTransit.benefit}</p>
            <p className="transit-alt"><strong>Alternative:</strong> {recommendedTransit.alt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
