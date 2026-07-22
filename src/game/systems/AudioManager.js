import { settings } from './SettingsManager.js';

const PRESETS = {
  ui:       { wave: 'sine',     from: 520, to: 720, duration: 0.07, gain: 0.18 },
  back:     { wave: 'sine',     from: 420, to: 260, duration: 0.10, gain: 0.16 },
  jump:     { wave: 'square',   from: 180, to: 360, duration: 0.12, gain: 0.10 },
  dash:     { wave: 'sawtooth', from: 160, to: 70,  duration: 0.16, gain: 0.10 },
  shoot:    { wave: 'square',   from: 760, to: 280, duration: 0.08, gain: 0.08 },
  charged:  { wave: 'sawtooth', from: 220, to: 920, duration: 0.28, gain: 0.12 },
  hit:      { wave: 'square',   from: 120, to: 55,  duration: 0.18, gain: 0.16 },
  enemy:    { wave: 'triangle', from: 190, to: 65,  duration: 0.13, gain: 0.11 },
  collect:  { wave: 'sine',     from: 440, to: 980, duration: 0.30, gain: 0.16 },
  power:    { wave: 'triangle', from: 260, to: 880, duration: 0.42, gain: 0.17 },
  dialogue: { wave: 'sine',     from: 330, to: 390, duration: 0.055,gain: 0.07 },
  checkpoint:{wave: 'sine',     from: 380, to: 760, duration: 0.34, gain: 0.13 },
  boss:     { wave: 'sawtooth', from: 90,  to: 45,  duration: 0.65, gain: 0.20 },
  victory:  { wave: 'sine',     from: 260, to: 1040,duration: 0.85, gain: 0.17 },
};

class AudioManager {
  constructor() { this.ctx = null; }

  unlock() {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) this.ctx = new AudioCtx();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  play(name) {
    if (settings.get('muted') || settings.get('volume') <= 0) return;
    const cfg = PRESETS[name] || PRESETS.ui;
    const ctx = this.unlock();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = cfg.wave;
    osc.frequency.setValueAtTime(cfg.from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, cfg.to), now + cfg.duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(cfg.gain * settings.get('volume'), now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + cfg.duration + 0.02);
  }

  chord(notes, spacing = 90) {
    notes.forEach((name, i) => setTimeout(() => this.play(name), i * spacing));
  }
}

export const audio = new AudioManager();

