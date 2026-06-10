/**
 * PowerManager — stocke les pouvoirs débloqués (Set en mémoire + localStorage).
 * Module pur, sans dépendance Phaser → testable unitairement.
 *
 * GÉNÉRÉ avec GitHub Copilot (Claude Sonnet 4.x) — revu et adapté manuellement.
 * Voir prompts_logs/03_code_prompts.md — Entrée #002
 */
export class PowerManager {
  constructor() {
    this._powers = new Set();
    this._loadFromStorage();
  }

  /**
   * Débloque un pouvoir par son nom.
   * @param {string} powerName  ex: 'doubleJump', 'dash'
   */
  unlock(powerName) {
    this._powers.add(powerName);
    this._saveToStorage();
  }

  /**
   * Retourne true si le pouvoir est débloqué.
   * @param {string} powerName
   * @returns {boolean}
   */
  hasUnlocked(powerName) {
    return this._powers.has(powerName);
  }

  /**
   * Retourne la liste de tous les pouvoirs débloqués.
   * @returns {string[]}
   */
  getAll() {
    return [...this._powers];
  }

  /** Réinitialise tous les pouvoirs (nouvelle partie). */
  reset() {
    this._powers.clear();
    try { localStorage.removeItem('echovault_powers'); } catch (_) { /* non disponible */ }
  }

  // ── Persistance ──

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem('echovault_powers');
      if (raw) this._powers = new Set(JSON.parse(raw));
    } catch (_) { /* localStorage non disponible (ex: tests Node) */ }
  }

  _saveToStorage() {
    try {
      localStorage.setItem('echovault_powers', JSON.stringify([...this._powers]));
    } catch (_) { /* silencieux */ }
  }
}
