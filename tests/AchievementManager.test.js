import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, AchievementManager } from '../src/game/systems/AchievementManager.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe('AchievementManager', () => {
  it('débloque un succès une seule fois', () => {
    const manager = new AchievementManager(memoryStorage());
    expect(manager.unlock('awakening')?.id).toBe('awakening');
    expect(manager.unlock('awakening')).toBeNull();
    expect(manager.getUnlockedCount()).toBe(1);
  });

  it('refuse un succès inconnu', () => {
    const manager = new AchievementManager(memoryStorage());
    expect(manager.unlock('inconnu')).toBeNull();
  });

  it('conserve les succès et les fins entre deux sessions', () => {
    const storage = memoryStorage();
    const first = new AchievementManager(storage);
    first.unlock('first_ending');
    first.recordEnding('guardian');
    const second = new AchievementManager(storage);
    expect(second.isUnlocked('first_ending')).toBe(true);
    expect(second.recordEnding('reset')).toBe(2);
  });

  it('possède des parents valides pour toutes les branches', () => {
    const ids = new Set(ACHIEVEMENTS.map(item => item.id));
    ACHIEVEMENTS.filter(item => item.parent).forEach(item => expect(ids.has(item.parent)).toBe(true));
  });
});
