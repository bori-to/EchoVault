const DEFAULTS = Object.freeze({
  volume: 0.65,
  muted: false,
  voiceEnabled: true,
  guidanceVoiceEnabled: true,
  bossTestTeleporter: false,
  sibylTestTeleporter: false,
  screenShake: true,
});
const SETTINGS_VERSION = 3;
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
      // Le portail etait actif par defaut dans la premiere version. Cette
      // migration le masque aussi pour les sauvegardes deja presentes, puis
      // laisse le joueur le reactiver normalement depuis les parametres.
      if (saved.settingsVersion !== SETTINGS_VERSION) {
        if (saved.settingsVersion !== 2) this.values.bossTestTeleporter = false;
        this.values.sibylTestTeleporter = false;
        this.values.settingsVersion = SETTINGS_VERSION;
        this.save();
      }
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
