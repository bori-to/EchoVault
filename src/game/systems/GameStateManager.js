/**
 * GameStateManager — enregistre les décisions morales du joueur
 * et détermine la fin selon ces décisions.
 * Module pur, sans dépendance Phaser → testable unitairement.
 *
 * GÉNÉRÉ avec GitHub Copilot (Claude Sonnet 4.x) — revu et adapté manuellement.
 * Voir prompts_logs/03_code_prompts.md — Entrée #003
 */
export class GameStateManager {
  constructor() {
    this._decisions = {};
  }

  /**
   * Enregistre une décision du joueur.
   * @param {string} key    - Identifiant de la décision (ex: 'trust_oracle')
   * @param {*}      value  - Valeur de la décision
   */
  recordDecision(key, value) {
    this._decisions[key] = value;
  }

  /**
   * Récupère la valeur d'une décision enregistrée.
   * @param {string} key
   * @returns {*} undefined si non enregistrée
   */
  getDecision(key) {
    return this._decisions[key];
  }

  /**
   * Retourne le parcours final choisi avant le combat du Gardien.
   * Le fallback conserve la compatibilité avec les anciennes parties/tests.
   * @returns {'transmit' | 'release'}
   */
  getRoute() {
    const route = this._decisions['final_route'];
    if (route === 'transmit' || route === 'release') return route;
    return this._decisions['trust_oracle'] === true ? 'transmit' : 'release';
  }

  /**
   * Détermine la fin à afficher selon les décisions accumulées.
   * - 'guardian' : joueur a fait confiance à l'Oracle → fin coexistence
   * - 'reset'    : joueur a refusé ou ignoré l'Oracle → fin effacement
   * @returns {'guardian' | 'reset'}
   */
  getEnding() {
    return this.getRoute() === 'transmit' ? 'guardian' : 'reset';
  }

  /** Réinitialise toutes les décisions (nouvelle partie). */
  reset() {
    this._decisions = {};
  }
}
