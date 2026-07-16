import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock browser SpeechSynthesis API
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => [
    { name: 'Google US English', lang: 'en-US', default: true }
  ]),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  paused: false,
  pending: false,
  speaking: false
};

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true
});

class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.lang = '';
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
  }
}
Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
  writable: true
});

// Mock webkitSpeechRecognition / SpeechRecognition API
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.start = vi.fn();
    this.stop = vi.fn();
    this.abort = vi.fn();
  }
}
Object.defineProperty(window, 'SpeechRecognition', {
  value: MockSpeechRecognition,
  writable: true
});
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: MockSpeechRecognition,
  writable: true
});
