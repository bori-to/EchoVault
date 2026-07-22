import Phaser from 'phaser';
import { settings } from './SettingsManager.js';
import { audio } from './AudioManager.js';
import { BossStateMachine, BossStates } from './BossStateMachine.js';

const MAX_HP = 20;
const ARENA_LEFT = 5520;
const ARENA_RIGHT = 5980;
const PROJECTILE_LEFT = 5150;
const PROJECTILE_RIGHT = 6370;
const SAFETY_DELAY = 1900;
const PHASE_COLORS = { 1: 0xb71c1c, 2: 0xff6f00, 3: 0xe040fb };

/** Combat final centralisé. Une tentative ne possède qu'un seul ensemble de
 * timers, projectiles et effets, tous supprimés par resetAttempt(). */
export class BossManager {
  constructor(scene) {
    this.scene = scene;
    this.machine = new BossStateMachine(MAX_HP);
    this.active = false;
    this.sprite = null;
    this.bullets = scene.physics.add.group();
    this._timers = new Set();
    this._effects = new Set();
    this._cd = 0;
    this._hitCd = 0;
    this._safety = 0;
    this._actionIndex = 0;
    this._mustLeaveArena = false;
    this._spawnX = 5660;
    this._spawnY = 350;
    this._onDeath = null;
  }

  spawn(x, y) {
    if (this.active) return;
    this.active = true;
    this._spawnX = x; this._spawnY = y;
    this.sprite = this.scene.physics.add.sprite(x, y, 'boss').setDepth(10);
    this.sprite.body.setSize(48, 68);
    this.sprite.body.setCollideWorldBounds(true);
    if (this.sprite.postFX) this._aura = this.sprite.postFX.addGlow(PHASE_COLORS[1], 7, 0);
    this.resetAttempt(false);
    this.scene.events.emit('bossSpawned', { max: MAX_HP });
  }

  connect(player, onPlayerHit, playerBullets, onHit, platforms) {
    const s = this.scene;
    s.physics.add.collider(this.sprite, platforms);
    s.physics.add.collider(this.bullets, platforms, (a, b) => {
      const bullet = this.bullets.contains(a) ? a : b;
      if (bullet?.active) bullet.destroy();
    });
    s.physics.add.overlap(player, this.sprite, () => {
      if (this._canDamagePlayer()) onPlayerHit();
    }, null, s);
    s.physics.add.overlap(player, this.bullets, (p, b) => {
      const bullet = this.bullets.contains(b) ? b : p;
      bullet.destroy();
      if (this._canDamagePlayer()) onPlayerHit();
    }, null, s);
    s.physics.add.overlap(playerBullets, this.sprite, (a, b) => {
      const bullet = playerBullets.contains(a) ? a : b;
      const damage = bullet?.damage || 1;
      if (bullet?.active) bullet.destroy();
      onHit({ damage });
    }, null, s);
  }

  registerDeathCallback(cb) { this._onDeath = cb; }
  isEncounterActive() { return this.active && this.machine.state !== BossStates.DEFEATED; }

  /** Réinitialisation atomique appelée dès que le joueur meurt. */
  resetAttempt(fromPlayerDeath = true) {
    if (!this.sprite) return;
    this._clearAttemptObjects();
    this.scene.cameras.main.shakeEffect?.reset();
    this.machine.reset();
    this.active = true;
    this._cd = 0; this._hitCd = 0; this._safety = 0; this._actionIndex = 0;
    this._mustLeaveArena = fromPlayerDeath;
    this.sprite.setActive(true).setVisible(true).setPosition(this._spawnX, this._spawnY)
      .setVelocity(0, 0).clearTint().setTint(PHASE_COLORS[1]).setAlpha(0.72);
    this.sprite.body.enable = true;
    if (this._aura) { this._aura.color = PHASE_COLORS[1]; this._aura.outerStrength = 4; }
    this.scene.events.emit('bossHit', MAX_HP);
    this.scene.events.emit('bossAttemptReset', { max: MAX_HP });
  }

  hit(damage = 1) {
    if (!this.active || this._hitCd > 0) return;
    const result = this.machine.damage(damage);
    if (!result.accepted) return;
    this._hitCd = 260;
    audio.play('hit');
    this.sprite.setScale(1.06, 0.94);
    this.scene.tweens.add({ targets: this.sprite, scaleX: 1, scaleY: 1, duration: 90 });
    this.scene.events.emit('bossHit', this.machine.hp);
    if (result.defeated) this._die();
    else if (result.transition) this._beginTransition(result.transition);
  }

  update(player, delta) {
    if (!this.active || !this.sprite?.active) return;
    this._cleanupProjectiles();
    this._hitCd = Math.max(0, this._hitCd - delta);

    if (this.machine.state === BossStates.RESET) {
      this.sprite.setVelocity(0, 0);
      if (this._mustLeaveArena) {
        if (player.x < ARENA_LEFT - 15) this._mustLeaveArena = false;
        return;
      }
      if (player.x >= ARENA_LEFT && player.x <= ARENA_RIGHT) this._startAttempt();
      return;
    }
    if (this.machine.state === BossStates.TRANSITION) return;

    this._safety = Math.max(0, this._safety - delta);
    this._cd = Math.max(0, this._cd - delta);
    if (this._safety > 0) {
      this.sprite.setVelocityX(0).setAlpha(0.75 + Math.sin(this._safety * 0.02) * 0.15);
      return;
    }
    this.sprite.setAlpha(1);

    const dx = player.x - this.sprite.x;
    const speeds = { 1: 80, 2: 145, 3: 205 };
    this.sprite.setVelocityX(Math.sign(dx) * speeds[this.machine.phase]);
    if (this.sprite.x < ARENA_LEFT + 35) this.sprite.setX(ARENA_LEFT + 35);
    if (this.sprite.x > ARENA_RIGHT - 35) this.sprite.setX(ARENA_RIGHT - 35);
    this.sprite.setFlipX(dx < 0);
    if (this._cd > 0) return;

    if (this.machine.phase === 1) this._actPhase1(player);
    else if (this.machine.phase === 2) this._actPhase2(player);
    else this._actPhase3(player);
  }

  _startAttempt() {
    if (!this.machine.start()) return;
    this._safety = SAFETY_DELAY;
    this._cd = SAFETY_DELAY;
    this.sprite.setTint(PHASE_COLORS[1]).setAlpha(0.75);
    this.scene.events.emit('bossPhaseChange', 1);
    this.scene.events.emit('bossAttemptStarted');
  }

  _actPhase1(player) {
    this._actionIndex++;
    if (this._actionIndex % 2 === 0) {
      // Tir simple télégraphié puis éventail étroit.
      this._telegraph(0xff5252, 210, () => this._aimedFan(player, 3, 0.12, 285));
    } else {
      this._telegraph(0xff8a80, 240, () => {
        if (this._isPhase(1)) this.sprite.setVelocityY(-430);
      });
    }
    this._cd = 1800;
  }

  _actPhase2(player) {
    this._actionIndex++;
    const dir = player.x < this.sprite.x ? -1 : 1;
    this._telegraph(0xff9800, 150, () => {
      if (!this._isPhase(2)) return;
      this.sprite.setVelocityX(dir * 440);
      this._aimedFan(player, 5, 0.16, 330);
      this._schedule(320, () => this._isPhase(2) && this._aimedFan(player, 4, 0.20, 350));
    });
    if (this._actionIndex % 2 === 0) this._schedule(380, () => this._spawnGroundWave(dir));
    // Phase 2 : conserve ses salves, mais laisse trois fois plus de temps
    // au joueur avant le prochain enchainement complet.
    this._cd = 4140;
  }

  _actPhase3(player) {
    const dir = player.x < this.sprite.x ? -1 : 1;
    this._telegraph(0xe040fb, 90, () => {
      if (!this._isPhase(3)) return;
      this.sprite.setVelocityX(dir * 560);
      this._aimedFan(player, 7, 0.19, 390);
      this._spawnGroundWave(-1);
      this._spawnGroundWave(1);
      this._schedule(260, () => this._isPhase(3) && this._radialBurst(10, 330));
    });
    this._cd = 880;
  }

  _beginTransition(nextPhase) {
    this._cancelAttackTimers();
    // La transition nettoie la volée précédente pour rester lisible et évite
    // que des timers de destruction annulés laissent des projectiles orphelins.
    this.bullets.clear(true, true);
    this.sprite.setVelocity(0, 0).setAlpha(1).setTint(PHASE_COLORS[nextPhase]);
    const color = PHASE_COLORS[nextPhase];
    if (this._aura) { this._aura.color = color; this._aura.outerStrength = nextPhase === 3 ? 13 : 9; }
    const ring = this.scene.add.circle(this.sprite.x, this.sprite.y, 22, color, 0)
      .setStrokeStyle(4, color, 0.9).setDepth(18);
    this._trackEffect(ring);
    this.scene.tweens.add({ targets: ring, scale: 9, alpha: 0, duration: 850,
      onComplete: () => this._destroyEffect(ring) });
    const flash = this.scene.add.rectangle(this.scene.scale.width / 2, this.scene.scale.height / 2,
      this.scene.scale.width, this.scene.scale.height, color, 0.28).setScrollFactor(0).setDepth(30);
    this._trackEffect(flash);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: 650,
      onComplete: () => this._destroyEffect(flash) });
    if (settings.get('screenShake')) this.scene.cameras.main.shake(280, nextPhase === 3 ? 0.022 : 0.014);
    audio.play('boss');
    this.scene.events.emit('bossPhaseChange', nextPhase);
    this._schedule(900, () => {
      if (!this.machine.completeTransition()) return;
      this._cd = nextPhase === 3 ? 350 : 600;
    });
  }

  _telegraph(color, delay, action) {
    if (!this.sprite?.active) return;
    const marker = this.scene.add.circle(this.sprite.x, this.sprite.y, 10, color, 0.18)
      .setStrokeStyle(2, color, 0.9).setDepth(17);
    this._trackEffect(marker);
    this.scene.tweens.add({ targets: marker, scale: 3.3, alpha: 0, duration: delay,
      onComplete: () => this._destroyEffect(marker) });
    this._schedule(delay, action);
  }

  _aimedFan(player, count, spread, speed) {
    if (!this.sprite?.active) return;
    const base = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.x, player.y);
    const center = (count - 1) / 2;
    for (let i = 0; i < count; i++) this._spawnBullet(base + (i - center) * spread, speed);
  }

  _radialBurst(count, speed) {
    for (let i = 0; i < count; i++) this._spawnBullet((Math.PI * 2 * i) / count, speed);
  }

  _spawnBullet(angle, speed) {
    if (!this.sprite?.active) return;
    const b = this.scene.physics.add.image(this.sprite.x, this.sprite.y, 'enemy-bullet')
      .setTint(this.machine.phase === 3 ? 0xe040fb : 0xff1744).setScale(this.machine.phase === 3 ? 1.5 : 1.2);
    this.bullets.add(b);
    b.body.setAllowGravity(false);
    b.setData('expiresAt', this.scene.time.now + 2800);
    this.scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), speed, b.body.velocity);
  }

  _spawnGroundWave(dir) {
    if (![BossStates.PHASE2, BossStates.PHASE3].includes(this.machine.state)) return;
    const b = this.scene.physics.add.image(this.sprite.x + dir * 28, 485, 'enemy-bullet')
      .setTint(this.machine.phase === 3 ? 0xe040fb : 0xff6f00).setScale(3.2, 0.8);
    this.bullets.add(b); b.body.setAllowGravity(false); b.setVelocityX(dir * (this.machine.phase === 3 ? 430 : 340));
    b.setData('expiresAt', this.scene.time.now + 2100);
  }

  _cleanupProjectiles() {
    const now = this.scene.time.now;
    this.bullets.getChildren().forEach(bullet => {
      if (!bullet.active) return;
      const expired = now >= (bullet.getData('expiresAt') || now + 1);
      const outsideArena = bullet.x < PROJECTILE_LEFT || bullet.x > PROJECTILE_RIGHT ||
        bullet.y < -80 || bullet.y > 620;
      if (expired || outsideArena) bullet.destroy();
    });
  }

  _canDamagePlayer() {
    return this.active && this._safety <= 0 &&
      [BossStates.PHASE1, BossStates.PHASE2, BossStates.PHASE3].includes(this.machine.state);
  }
  _isPhase(phase) { return this.active && this.machine.phase === phase && this.machine.state === `phase${phase}`; }

  _schedule(delay, callback) {
    const timer = this.scene.time.delayedCall(delay, () => {
      this._timers.delete(timer);
      if (this.active) callback();
    });
    this._timers.add(timer);
    return timer;
  }

  _cancelAttackTimers() {
    this._timers.forEach(timer => timer.remove(false));
    this._timers.clear();
  }
  _trackEffect(effect) { this._effects.add(effect); return effect; }
  _destroyEffect(effect) {
    this._effects.delete(effect);
    if (effect?.active) effect.destroy();
  }

  _clearAttemptObjects() {
    this._cancelAttackTimers();
    this.bullets.clear(true, true);
    this._effects.forEach(effect => {
      this.scene.tweens.killTweensOf(effect);
      if (effect?.active) effect.destroy();
    });
    this._effects.clear();
    this.scene.tweens.killTweensOf(this.sprite);
  }

  _die() {
    this.active = false;
    this._clearAttemptObjects();
    const ex = this.sprite.x, ey = this.sprite.y;
    this.sprite.setVelocity(0, 0);
    for (let i = 0; i < 6; i++) {
      this.scene.time.delayedCall(i * 110, () => {
        const burst = this.scene.add.circle(ex + Phaser.Math.Between(-35, 35), ey + Phaser.Math.Between(-35, 35),
          8, i % 2 ? 0xe040fb : 0xff6f00, 0.9).setDepth(20);
        this.scene.tweens.add({ targets: burst, scale: 5, alpha: 0, duration: 480,
          onComplete: () => burst.destroy() });
      });
    }
    this.scene.time.delayedCall(760, () => {
      if (this.sprite?.active) this.sprite.destroy();
      if (settings.get('screenShake')) this.scene.cameras.main.shake(400, 0.022);
      this.scene.events.emit('bossDefeated');
      if (this._onDeath) this._onDeath();
    });
  }
}
