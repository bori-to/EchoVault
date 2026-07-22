/**
 * BossManager — Boss final "Le Gardien de l'Écho" (Chambre Haute, x≈5660).
 * 3 phases selon les PV restants.
 *   Phase 1 (hp 9-12) : patrouille lente + slam occasionnel
 *   Phase 2 (hp 5-8)  : charge + rafale de 3 projectiles
 *   Phase 3 (hp 1-4)  : multishot rapide + ondes de choc au sol
 */
import Phaser from 'phaser';

const MAX_HP = 12;

export class BossManager {
  constructor(scene) {
    this.scene   = scene;
    this.active  = false;
    this.sprite  = null;
    this.bullets = scene.physics.add.group();
    this._hp     = MAX_HP;
    this._phase  = 1;
    this._cd     = 0;
    this._hitCd  = 0;   // iframes entre deux dégâts
    this._dir    = -1;
    this._shockwaves = [];
    this._onDeath = null;
  }

  // ─── Spawn ───────────────────────────────────────────────────────────────
  spawn(x, y) {
    if (this.active) return;
    this.active = true;
    this._hp    = MAX_HP;
    this._phase = 1;
    this._cd    = 1500;

    this.sprite = this.scene.physics.add.sprite(x, y, 'boss');
    this.sprite.setTint(0xb71c1c);
    this.sprite.setDepth(10);
    // Corps physique
    this.sprite.body.setSize(48, 68);
    this.sprite.body.setCollideWorldBounds(true);

    // Aura postFX
    if (this.sprite.postFX) this.sprite.postFX.addGlow(0xff1744, 10, 0);

    this.scene.events.emit('bossSpawned', { max: MAX_HP });
    this.scene.cameras.main.shake(300, 0.012);
  }

  // ─── Connexion physique (appelée depuis GameScene) ────────────────────────
  connect(player, onPlayerHit, playerBullets, onHit, platforms) {
    const s = this.scene;
    s.physics.add.collider(this.sprite, platforms);
    s.physics.add.overlap(player, this.sprite, () => onPlayerHit(), null, s);
    s.physics.add.overlap(player, this.bullets, (p, b) => {
      // 'b' peut être inversé selon la version de Phaser — identifier la balle
      const bullet = this.bullets.contains(b) ? b : p;
      bullet.destroy();
      onPlayerHit();
    }, null, s);
    s.physics.add.overlap(playerBullets, this.sprite, (a, b) => {
      // Phaser peut passer (sprite, bullet) ou (bullet, sprite) selon le contexte
      const bullet = playerBullets.contains(a) ? a : b;
      if (bullet && bullet.active) bullet.destroy();
      onHit();
    }, null, s);
  }

  registerDeathCallback(cb) { this._onDeath = cb; }

  /** Inflige 1 dégât (avec cooldown pour éviter les hits multiples d'une même volée). */
  hit() {
    if (!this.active || this._hitCd > 0) return;
    this._hitCd = 350;   // ~350ms d'iframes
    this._hp--;
    if (this.sprite.active) {
      this.sprite.setTintFill(0xffffff);
      this.scene.time.delayedCall(80, () => {
        if (this.sprite?.active) this.sprite.clearTint();
      });
    }
    this._updatePhase();
    this.scene.events.emit('bossHit', this._hp);
    if (this._hp <= 0) this._die();
  }

  update(player, delta) {
    if (!this.active || !this.sprite?.active) return;
    this._cd    = Math.max(0, this._cd    - delta);
    this._hitCd = Math.max(0, this._hitCd - delta);

    // Suivi lent du joueur en X
    const dx = player.x - this.sprite.x;
    const baseSpeed = this._phase === 1 ? 55 : this._phase === 2 ? 95 : 140;
    this.sprite.setVelocityX(Math.sign(dx) * baseSpeed);
    this.sprite.setFlipX(dx < 0);

    if (this._cd > 0) return;

    switch (this._phase) {
      case 1: this._actPhase1(player); break;
      case 2: this._actPhase2(player); break;
      case 3: this._actPhase3(player); break;
    }
  }

  // ─── Actions de phase ────────────────────────────────────────────────────
  _actPhase1(player) {
    // Slam — saute sur le joueur
    const dy = player.y - this.sprite.y;
    if (Math.abs(dy) < 80) {
      this.sprite.setVelocityY(-400);
    }
    this._cd = 2200;
  }

  _actPhase2(player) {
    // Charge rapide + burst 3 projectiles
    const dir = player.x < this.sprite.x ? -1 : 1;
    this.sprite.setVelocityX(dir * 340);
    this.scene.time.delayedCall(180, () => {
      if (!this.active) return;
      [-15, 0, 15].forEach(offset => {
        const ang = Phaser.Math.Angle.Between(
          this.sprite.x, this.sprite.y, player.x + offset, player.y);
        this._spawnBullet(this.sprite.x, this.sprite.y, ang);
      });
    });
    this._cd = 1600;
  }

  _actPhase3(player) {
    // Multishot 5 balles en éventail
    for (let i = -2; i <= 2; i++) {
      const ang = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y, player.x, player.y) + i * 0.18;
      this._spawnBullet(this.sprite.x, this.sprite.y, ang);
    }
    // Onde de choc au sol
    this._spawnShockwave();
    this._cd = 900;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  _spawnBullet(x, y, angle) {
    const b = this.scene.physics.add.image(x, y, 'enemy-bullet');
    b.setTint(0xff1744);
    b.setScale(1.4);
    this.bullets.add(b);
    this.scene.physics.velocityFromAngle(
      Phaser.Math.RadToDeg(angle), 260, b.body.velocity);
    b.body.setAllowGravity(false);
    this.scene.time.delayedCall(2400, () => { if (b.active) b.destroy(); });
  }

  _spawnShockwave() {
    const sw = this.scene.add.rectangle(
      this.sprite.x, this.sprite.y + 34, 20, 12, 0xff5722, 0.85).setDepth(9);
    this.scene.tweens.add({
      targets: sw, scaleX: 14, alpha: 0, duration: 700, ease: 'Power2',
      onComplete: () => sw.destroy(),
    });
    // Hitbox temporaire (overlap ajouté depuis GameScene via `_bossShockwaves`)
    this._shockwaves.push(sw);
    this.scene.time.delayedCall(700, () => {
      this._shockwaves = this._shockwaves.filter(s => s !== sw);
    });
  }

  _updatePhase() {
    const prev = this._phase;
    if (this._hp <= 4) this._phase = 3;
    else if (this._hp <= 8) this._phase = 2;
    else this._phase = 1;

    if (this._phase !== prev) {
      this.scene.events.emit('bossPhaseChange', this._phase);
      // Flash + secousse
      this.scene.cameras.main.shake(200, 0.016);
      const flash = this.scene.add.rectangle(400, 250, 800, 500,
        this._phase === 2 ? 0xff6f00 : 0xff1744, 0.35).setDepth(30);
      this.scene.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() });
    }
  }

  _die() {
    this.active = false;
    const ex = this.sprite.x;
    const ey = this.sprite.y;
    // Série d'explosions
    for (let i = 0; i < 8; i++) {
      this.scene.time.delayedCall(i * 120, () => {
        const px = ex + Phaser.Math.Between(-40, 40);
        const py = ey + Phaser.Math.Between(-40, 40);
        const p = this.scene.add.particles(px, py, 'particle', {
          speed: { min: 80, max: 200 }, angle: { min: 0, max: 360 },
          scale: { start: 1.5, end: 0 }, lifespan: 600, quantity: 12,
          blendMode: Phaser.BlendModes.ADD, tint: [0xff1744, 0xff6f00, 0xffd600],
        });
        this.scene.time.delayedCall(700, () => p.destroy());
      });
    }
    this.scene.time.delayedCall(800, () => {
      if (this.sprite?.active) this.sprite.destroy();
      this.scene.cameras.main.shake(400, 0.022);
      this.scene.events.emit('bossDefeated');
      if (this._onDeath) this._onDeath();
    });
  }
}
