import { describe, test, expect } from 'vitest';
import { getRouteRecommendation, getOperationalRecommendations } from '../services/decisionEngine';

describe('Decision Engine Unit Tests', () => {
  
  describe('getRouteRecommendation()', () => {
    
    test('calculates correct base route and walking time under low crowd density', () => {
      const result = getRouteRecommendation('metroExit', 'northGate', {}, { metroExit: 'LOW', northGate: 'LOW' });
      expect(result).not.toBeNull();
      expect(result.distanceMeters).toBeGreaterThan(0);
      expect(result.estimatedMinutes).toBeGreaterThan(0);
      expect(result.accessibilityStatus).toBe('Standard Route');
      expect(result.crowdLevel).toBe('LOW');
    });

    test('recalculates path and delays walk times when crowds are critical', () => {
      const resultNormal = getRouteRecommendation('metroExit', 'northGate', {}, { metroExit: 'LOW', northGate: 'LOW' });
      const resultCrowded = getRouteRecommendation('metroExit', 'northGate', {}, { metroExit: 'CRITICAL', northGate: 'CRITICAL' });
      
      expect(resultCrowded.estimatedMinutes).toBeGreaterThanOrEqual(resultNormal.estimatedMinutes);
      expect(resultCrowded.crowdLevel).toBe('HIGH');
    });

    test('applies ramp and elevator directives when accessibility preferences are active', () => {
      const result = getRouteRecommendation('northGate', 'sectionA', { wheelchair: true });
      expect(result.accessibilityStatus).toBe('Accessible Route');
      expect(result.recommendedAction).toContain('Step-Free');
      expect(result.why).toContain('ramps and elevators');
    });
  });

  describe('getOperationalRecommendations()', () => {

    test('generates critical crowd redirections if North Gate is critical', () => {
      const recommendations = getOperationalRecommendations({ northGate: 'CRITICAL' }, [], {});
      const northGateRec = recommendations.find(r => r.id === 'rec-01');
      
      expect(northGateRec).toBeDefined();
      expect(northGateRec.severity).toBe('CRITICAL');
      expect(northGateRec.actionCategory).toBe('Crowd Redirect');
      expect(northGateRec.detectedSituation).toContain('exceeded 90% load');
    });

    test('issues emergency transit notifications when Metro A has critical errors', () => {
      const recommendations = getOperationalRecommendations({}, [], { metroA: 'critical' });
      const metroRec = recommendations.find(r => r.id === 'rec-02');
      
      expect(metroRec).toBeDefined();
      expect(metroRec.severity).toBe('HIGH');
      expect(metroRec.actionCategory).toBe('Transport Shift');
    });

    test('raises corridor clearance guidelines during open medical incidents', () => {
      const incidents = [{ id: 'inc-99', category: 'Medical', location: 'Section B', status: 'Active', description: 'Spectator collapsed' }];
      const recommendations = getOperationalRecommendations({}, incidents, {});
      const medicalRec = recommendations.find(r => r.id === 'rec-03');
      
      expect(medicalRec).toBeDefined();
      expect(medicalRec.severity).toBe('HIGH');
      expect(medicalRec.actionCategory).toBe('Emergency Access');
    });
  });
});
