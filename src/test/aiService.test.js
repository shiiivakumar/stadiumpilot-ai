import { describe, test, expect, vi, beforeEach } from 'vitest';
import { askGeminiFan, generateOperationsBrief, generateIncidentResponsePlan } from '../services/aiService';

describe('AI Service API Bridge Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('askGeminiFan calls secure chat endpoint and returns server response', async () => {
    const mockJson = vi.fn().mockResolvedValue({ text: 'Reroute to Gate B', isSimulated: false });
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: mockJson });
    global.fetch = mockFetch;

    const result = await askGeminiFan('How to get in?', { crowds: {} }, 'en');
    
    expect(mockFetch).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
      method: 'POST',
      body: expect.any(String)
    }));
    expect(result.text).toBe('Reroute to Gate B');
    expect(result.isSimulated).toBe(false);
  });

  test('askGeminiFan falls back to simulated offline logic if API fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    const result = await askGeminiFan('How to get in?', { crowds: {} }, 'en');
    expect(result.isSimulated).toBe(true);
    expect(result.text).toBeDefined();
  });

  test('generateOperationsBrief calls brief endpoint and falls back on error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Down'));
    const result = await generateOperationsBrief({ activeScenario: 'surge', occupancy: 45000 });
    expect(result.isSimulated).toBe(true);
    expect(result.text).toContain('OPERATIONS WARNING');
  });

  test('generateIncidentResponsePlan calls incident endpoint and falls back on error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Down'));
    const result = await generateIncidentResponsePlan({ category: 'Medical', location: 'Section B' });
    expect(result.isSimulated).toBe(true);
    expect(result.text).toContain('RESPONSE PLAN');
  });
});
