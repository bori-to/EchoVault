import { describe, expect, it } from 'vitest';
import { evaluateRiddleAnswer, getRiddleHint, normalizeAnswer } from '../src/game/systems/RiddleAI.js';

describe('RiddleAI', () => {
  it('normalise les accents, articles et pluriels', () => {
    expect(normalizeAnswer('Les mémoires !')).toBe('memoire');
  });

  it.each(['un souvenir', 'la mémoire', 'une archive', 'des souvenirs humains'])(
    'accepte la réponse « %s »',
    answer => expect(evaluateRiddleAnswer(answer).status).toBe('correct'),
  );

  it('tolère une petite faute de frappe', () => {
    expect(evaluateRiddleAnswer('memore').status).toBe('correct');
  });

  it('signale une réponse sémantiquement proche', () => {
    expect(evaluateRiddleAnswer('histoire').status).toBe('close');
  });

  it('refuse une réponse sans rapport', () => {
    expect(evaluateRiddleAnswer('un robot rouge').status).toBe('wrong');
  });

  it('rend les indices progressivement plus explicites', () => {
    expect(getRiddleHint(1)).not.toBe(getRiddleHint(2));
    expect(getRiddleHint(99)).toContain('INDICE FINAL');
  });
});
