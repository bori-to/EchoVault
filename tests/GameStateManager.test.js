/**
 * Tests unitaires — GameStateManager
 * Couvre : recordDecision, getDecision, getEnding, reset
 * Module pur sans dépendance Phaser → environnement Node.
 *
 * Lancer : npm test
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '../src/game/systems/GameStateManager.js';

describe('GameStateManager', () => {
  let gsm;

  beforeEach(() => {
    gsm = new GameStateManager();
  });

  // ─── Cas nominal ────────────────────────────────────────────────────────────

  it('devrait enregistrer une décision', () => {
    gsm.recordDecision('trust_oracle', true);
    expect(gsm.getDecision('trust_oracle')).toBe(true);
  });

  it('devrait retourner "guardian" si trust_oracle = true', () => {
    gsm.recordDecision('trust_oracle', true);
    expect(gsm.getEnding()).toBe('guardian');
  });

  it('devrait retourner "reset" si trust_oracle = false', () => {
    gsm.recordDecision('trust_oracle', false);
    expect(gsm.getEnding()).toBe('reset');
  });

  // ─── Cas limites ────────────────────────────────────────────────────────────

  it('devrait retourner "reset" sans aucune décision enregistrée', () => {
    expect(gsm.getEnding()).toBe('reset');
  });

  it('devrait retourner undefined pour une décision inconnue', () => {
    expect(gsm.getDecision('unknown_key')).toBeUndefined();
  });

  it('devrait permettre de surcharger une décision existante', () => {
    gsm.recordDecision('trust_oracle', true);
    gsm.recordDecision('trust_oracle', false); // changement d'avis
    expect(gsm.getDecision('trust_oracle')).toBe(false);
    expect(gsm.getEnding()).toBe('reset');
  });

  it('devrait accepter des valeurs non-booléennes', () => {
    gsm.recordDecision('score', 42);
    expect(gsm.getDecision('score')).toBe(42);
  });

  // ─── Reset ──────────────────────────────────────────────────────────────────

  it('reset devrait effacer toutes les décisions', () => {
    gsm.recordDecision('trust_oracle', true);
    gsm.recordDecision('collected_fragment', 3);
    gsm.reset();
    expect(gsm.getDecision('trust_oracle')).toBeUndefined();
    expect(gsm.getEnding()).toBe('reset');
  });
});
