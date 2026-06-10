/**
 * Tests unitaires — PowerManager
 * Couvre : unlock, hasUnlocked, getAll, reset
 * Module pur sans dépendance Phaser → environnement Node.
 *
 * Lancer : npm test
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { PowerManager } from '../src/game/systems/PowerManager.js';

describe('PowerManager', () => {
  let pm;

  beforeEach(() => {
    pm = new PowerManager();
    pm.reset(); // état propre avant chaque test
  });

  // ─── Cas nominal ────────────────────────────────────────────────────────────

  it('devrait démarrer sans pouvoir débloqué', () => {
    expect(pm.getAll()).toHaveLength(0);
  });

  it('devrait débloquer un pouvoir', () => {
    pm.unlock('doubleJump');
    expect(pm.hasUnlocked('doubleJump')).toBe(true);
  });

  it('devrait retourner tous les pouvoirs débloqués', () => {
    pm.unlock('doubleJump');
    pm.unlock('dash');
    const all = pm.getAll();
    expect(all).toContain('doubleJump');
    expect(all).toContain('dash');
    expect(all).toHaveLength(2);
  });

  // ─── Cas limites ────────────────────────────────────────────────────────────

  it('ne devrait pas dupliquer un pouvoir déjà débloqué', () => {
    pm.unlock('doubleJump');
    pm.unlock('doubleJump'); // doublon
    expect(pm.getAll()).toHaveLength(1);
  });

  it('hasUnlocked devrait retourner false pour un pouvoir inconnu', () => {
    expect(pm.hasUnlocked('nonexistent')).toBe(false);
  });

  it('devrait retourner false pour une string vide', () => {
    expect(pm.hasUnlocked('')).toBe(false);
  });

  // ─── Reset ──────────────────────────────────────────────────────────────────

  it('reset devrait supprimer tous les pouvoirs', () => {
    pm.unlock('doubleJump');
    pm.unlock('dash');
    pm.reset();
    expect(pm.getAll()).toHaveLength(0);
    expect(pm.hasUnlocked('doubleJump')).toBe(false);
  });
});
