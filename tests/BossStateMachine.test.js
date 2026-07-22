import { describe, it, expect } from 'vitest';
import { BossStateMachine, BossStates } from '../src/game/systems/BossStateMachine.js';

describe('BossStateMachine', () => {
  it('parcourt les trois phases une seule fois par tentative', () => {
    const boss = new BossStateMachine(20);
    boss.start();
    for (let i = 0; i < 7; i++) boss.damage(); // 65 %
    expect(boss.state).toBe(BossStates.TRANSITION);
    expect(boss.pendingPhase).toBe(2);
    boss.completeTransition();
    expect(boss.state).toBe(BossStates.PHASE2);
    expect(boss.damage()).not.toHaveProperty('transition');
    for (let i = 0; i < 7; i++) boss.damage(); // sous 30 %
    expect(boss.pendingPhase).toBe(3);
    boss.completeTransition();
    expect(boss.state).toBe(BossStates.PHASE3);
  });

  it.each([BossStates.PHASE1, BossStates.PHASE2, BossStates.PHASE3])(
    'reset depuis %s restaure entièrement la tentative', (target) => {
      const boss = new BossStateMachine(20); boss.start();
      if (target !== BossStates.PHASE1) {
        for (let i = 0; i < 8; i++) boss.damage(); boss.completeTransition();
      }
      if (target === BossStates.PHASE3) {
        for (let i = 0; i < 7; i++) boss.damage(); boss.completeTransition();
      }
      boss.reset();
      expect(boss.hp).toBe(20);
      expect(boss.phase).toBe(1);
      expect(boss.state).toBe(BossStates.RESET);
      expect(boss.triggeredTransitions.size).toBe(0);
    },
  );

  it('supporte plusieurs morts successives sans conserver les transitions', () => {
    const boss = new BossStateMachine(20);
    for (let attempt = 0; attempt < 5; attempt++) {
      boss.start();
      for (let i = 0; i < 7; i++) boss.damage();
      expect(boss.pendingPhase).toBe(2);
      boss.reset();
      expect(boss.triggeredTransitions.size).toBe(0);
    }
  });
});
