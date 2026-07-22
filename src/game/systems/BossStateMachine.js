export const BossStates = Object.freeze({
  RESET: 'reset',
  PHASE1: 'phase1',
  PHASE2: 'phase2',
  PHASE3: 'phase3',
  TRANSITION: 'transition',
  DEFEATED: 'defeated',
});

export class BossStateMachine {
  constructor(maxHp = 20) { this.maxHp = maxHp; this.reset(); }

  reset() {
    this.hp = this.maxHp;
    this.state = BossStates.RESET;
    this.phase = 1;
    this.pendingPhase = null;
    this.triggeredTransitions = new Set();
  }

  start() {
    if (this.state !== BossStates.RESET) return false;
    this.state = BossStates.PHASE1;
    this.phase = 1;
    return true;
  }

  damage(amount = 1) {
    if (![BossStates.PHASE1, BossStates.PHASE2, BossStates.PHASE3].includes(this.state)) {
      return { accepted: false };
    }
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) {
      this.state = BossStates.DEFEATED;
      return { accepted: true, defeated: true };
    }

    const ratio = this.hp / this.maxHp;
    const nextPhase = ratio < 0.30 ? 3 : ratio <= 0.65 ? 2 : null;
    if (nextPhase && nextPhase > this.phase && !this.triggeredTransitions.has(nextPhase)) {
      this.triggeredTransitions.add(nextPhase);
      this.pendingPhase = nextPhase;
      this.state = BossStates.TRANSITION;
      return { accepted: true, transition: nextPhase };
    }
    return { accepted: true };
  }

  completeTransition() {
    if (this.state !== BossStates.TRANSITION || !this.pendingPhase) return false;
    this.phase = this.pendingPhase;
    this.state = this.phase === 2 ? BossStates.PHASE2 : BossStates.PHASE3;
    this.pendingPhase = null;
    return true;
  }
}
