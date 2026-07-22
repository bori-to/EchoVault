import { settings } from './SettingsManager.js';

const PERSONAS = {
  narrator: { pitch: 1.0, rate: 0.96, preferred: /henri|thomas|paul|claude|daniel|alain|natural.*male|male|homme/i },
  system:   { pitch: 0.98, rate: 0.95, preferred: /denise|audrey|google français|natural|online/i },
  oracle:   { pitch: 1.02, rate: 0.92, preferred: /denise|audrey|julie|am[eé]lie|hortense|marie|female|femme/i },
  archivist:{ pitch: 0.93, rate: 0.94, preferred: /henri|thomas|paul|claude|male|homme/i },
  sol:      { pitch: 0.99, rate: 0.90, preferred: /denise|audrey|natural|google français/i },
  aria:     { pitch: 1.04, rate: 0.97, preferred: /denise|julie|am[eé]lie|audrey|female|femme/i },
};

class VoiceManager {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this._lastText = '';
    this._lastAt = 0;
    if (this.synth) {
      this._loadVoices();
      this.synth.addEventListener?.('voiceschanged', () => this._loadVoices());
    }
  }

  _loadVoices() {
    const all = this.synth?.getVoices?.() || [];
    this.voices = all.filter(v => /^fr([-_]|$)/i.test(v.lang));
  }

  _clean(text) {
    return String(text || '')
      .replace(/\[[^\]]+\]/g, ' ')
      .replace(/[◈→←■□⚡♥]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  speak(text, options = {}) {
    if (!this.synth || settings.get('muted') || !settings.get('voiceEnabled')) return;
    if (options.category === 'guidance' && !settings.get('guidanceVoiceEnabled')) return;
    const clean = this._clean(text);
    if (!clean) return;
    const now = Date.now();
    if (clean === this._lastText && now - this._lastAt < 1800) return;
    this._lastText = clean; this._lastAt = now;

    const persona = PERSONAS[options.persona] || PERSONAS.narrator;
    if (options.interrupt !== false) this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'fr-FR';
    utterance.rate = options.rate || persona.rate;
    utterance.pitch = options.pitch || persona.pitch;
    utterance.volume = Math.max(0, Math.min(1, settings.get('volume')));

    utterance.voice = this._selectVoice(persona) || null;
    this.currentUtterance = utterance;
    utterance.onend = () => { if (this.currentUtterance === utterance) this.currentUtterance = null; };
    utterance.onerror = utterance.onend;
    this.synth.speak(utterance);
  }

  stop() { this.synth?.cancel(); this.currentUtterance = null; }

  _selectVoice(persona) {
    return [...this.voices].sort((a, b) => {
      const score = (v) =>
        (persona.preferred.test(v.name) ? 180 : 0) +
        (/natural|online|neural|google|premium/i.test(v.name) ? 100 : 0) +
        (!v.localService ? 12 : 0) +
        (v.default ? 4 : 0);
      return score(b) - score(a);
    })[0];
  }

  getSelectedVoiceName(persona = 'narrator') {
    const cfg = PERSONAS[persona] || PERSONAS.narrator;
    return this._selectVoice(cfg)?.name || 'Voix française du système';
  }
}

export const voice = new VoiceManager();
