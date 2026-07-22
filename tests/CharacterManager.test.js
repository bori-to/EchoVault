import { beforeEach, describe, expect, it } from 'vitest';
import { getCharacters, getSelectedCharacter, selectCharacter } from '../src/game/systems/CharacterManager.js';

describe('CharacterManager', () => {
  beforeEach(() => selectCharacter('aria'));

  it('propose plusieurs personnages aux statistiques différentes', () => {
    const characters = getCharacters();
    expect(characters).toHaveLength(4);
    expect(new Set(characters.map(c => c.stats.speed)).size).toBeGreaterThan(1);
    expect(new Set(characters.map(c => c.stats.hp)).size).toBeGreaterThan(1);
  });

  it('attribue une arme unique et configurée à chaque personnage', () => {
    const characters = getCharacters();
    expect(new Set(characters.map(c => c.weapon.id)).size).toBe(characters.length);
    characters.forEach(character => {
      expect(character.weapon.name).toBeTruthy();
      expect(character.weapon.damage).toBeGreaterThan(0);
      expect(character.weapon.cooldown).toBeGreaterThan(0);
    });
  });

  it('sélectionne un personnage valide', () => {
    expect(selectCharacter('nyx')).toBe(true);
    expect(getSelectedCharacter().id).toBe('nyx');
  });

  it('refuse un identifiant inconnu et conserve le choix actuel', () => {
    selectCharacter('atlas');
    expect(selectCharacter('inconnu')).toBe(false);
    expect(getSelectedCharacter().id).toBe('atlas');
  });
});
