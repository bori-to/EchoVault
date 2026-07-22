const DEFAULTS = Object.freeze({ volume: 0.65, muted: false, screenShake: true });
const STORAGE_KEY = 'echovault.settings.v1';

class SettingsManager {
  constructor() {
    this.values = { ...DEFAULTS };
    this.load();
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      this.values = { ...DEFAULTS, ...saved };
    } catch (_) { this.values = { ...DEFAULTS }; }
    this.values.volume = Math.max(0, Math.min(1, Number(this.values.volume) || 0));
  }

  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.values)); } catch (_) { /* stockage indisponible */ }
  }

  set(key, value) { this.values[key] = value; this.save(); }
  get(key) { return this.values[key]; }
  reset() { this.values = { ...DEFAULTS }; this.save(); }
}

export const settings = new SettingsManager();

