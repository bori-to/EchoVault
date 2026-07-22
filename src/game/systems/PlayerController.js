/**
 * PlayerController — mouvement, saut, wall-jump, dash, tir chargé, bouclier.
 */
import { audio } from './AudioManager.js';
import { settings } from './SettingsManager.js';

export class PlayerController {
  constructor(scene, player) {
    this.scene   = scene;
    this.player  = player;
    this.speed   = 200;
    this.jumpVel = -400;
    this.maxJumps    = 1;
    this._jumpCount  = 0;
    this._jumpHeld   = false;
    this.enabled     = true;

    // Tir laser
    this.bullets    = scene.physics.add.group();
    this._shootCd   = 0;
    this._chargeT   = 0;       // temps bouton X maintenu
    this._xHeld     = false;
    this._facing    = 1;

    // Dash
    this._dashCd    = 0;
    this._dashTimer = 0;
    this._dashSpeed = 520;
    this._hasDash   = false;

    // Wall-jump
    this._hasWallJump  = false;
    this._wallSliding  = false;
    this._wallJumpDir  = 0;
    this._wallJumpTimer = 0;

    // Bouclier
    this._hasShield     = false;
    this._shieldActive  = false;
    this._shieldCd      = 0;
    this._shieldHp      = 0;
    this._shieldSprite  = null;
    this._shieldOrbit   = null;

    // Stomp
    this._stomping = false;
    this._wasOnGround = false;
    this._landingTimer = 0;
    this._shootAnimTimer = 0;
    this._stepTimer = 0;
    this._chargeOrb = null;

    // Bindings clavier
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd = {
      left:  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up:    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    };
    this._space  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this._xKey   = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this._shiftL = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this._zKey   = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  }

  enableDoubleJump() { this.maxJumps = 2; }
  enableDash()       { this._hasDash = true; }
  enableWallJump()   { this._hasWallJump = true; }

  enableShield() {
    this._hasShield    = true;
    this._shieldHp     = 1;
    this._shieldActive = true;
    this._buildShieldSprite();
  }

  _buildShieldSprite() {
    if (this._shieldSprite) this._shieldSprite.destroy();

    // Une coque fine laisse Aria visible, contrairement a l'ancienne boule pleine.
    const shell = this.scene.add.graphics();
    shell.fillStyle(0x00bcd4, 0.055);
    shell.fillEllipse(0, 0, 51, 61);
    shell.lineStyle(2, 0x72f6ff, 0.9);
    shell.strokeEllipse(0, 0, 51, 61);
    shell.lineStyle(1, 0x00b8d4, 0.35);
    shell.strokeEllipse(0, 0, 45, 55);

    // Segments discontinus et points d'ancrage : aspect bouclier technologique.
    const orbit = this.scene.add.graphics();
    orbit.lineStyle(2, 0xffffff, 0.9);
    orbit.beginPath(); orbit.arc(0, 0, 27, -1.42, -0.55); orbit.strokePath();
    orbit.beginPath(); orbit.arc(0, 0, 27, 1.72, 2.58); orbit.strokePath();
    orbit.fillStyle(0x9ffaff, 1);
    orbit.fillCircle(0, -30, 2);
    orbit.fillCircle(0, 30, 2);
    orbit.fillCircle(-25, 0, 1.5);
    orbit.fillCircle(25, 0, 1.5);

    if (shell.postFX) shell.postFX.addGlow(0x00e5ff, 2, 0);
    this._shieldOrbit = orbit;
    this._shieldSprite = this.scene.add.container(0, 0, [shell, orbit])
      .setDepth(14);
  }

  /** Absorbe un hit de bouclier — retourne true si le hit est absorbé. */
  tryShieldAbsorb() {
    if (!this._shieldActive || this._shieldHp <= 0) return false;
    this._shieldHp--;
    this._shieldActive = false;
    this._shieldCd     = 8000;
    if (this._shieldSprite) {
      this.scene.tweens.add({
        targets: this._shieldSprite,
        alpha: 0,
        scaleX: 1.35,
        scaleY: 1.18,
        duration: 220,
        onComplete: () => {
          if (this._shieldSprite) {
            this._shieldSprite.setAlpha(1).setScale(1);
            this._shieldSprite.setVisible(false);
          }
        },
      });
    }
    return true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.player.setVelocityX(0);
      this.player.play('aria-idle', true);
    }
  }

  update(delta = 16) {
    if (!this.enabled) return;

    this._shootCd     = Math.max(0, this._shootCd  - delta);
    this._dashCd      = Math.max(0, this._dashCd   - delta);
    this._dashTimer   = Math.max(0, this._dashTimer - delta);
    this._wallJumpTimer = Math.max(0, this._wallJumpTimer - delta);
    this._landingTimer  = Math.max(0, this._landingTimer - delta);
    this._shootAnimTimer = Math.max(0, this._shootAnimTimer - delta);

    // Recharge bouclier
    if (!this._shieldActive && this._shieldCd > 0) {
      this._shieldCd -= delta;
      if (this._shieldCd <= 0) {
        this._shieldActive = true;
        this._shieldHp     = 1;
        if (this._shieldSprite) {
          this._shieldSprite.setAlpha(0).setScale(0.75).setVisible(true);
          this.scene.tweens.add({
            targets: this._shieldSprite,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 260,
            ease: 'Back.Out',
          });
        }
        this.scene.events.emit('shieldReady');
      }
    }
    // Position bouclier suit le joueur
    if (this._shieldSprite && this._shieldActive) {
      this._shieldSprite.setPosition(this.player.x, this.player.y);
      if (this._shieldOrbit) this._shieldOrbit.rotation += delta * 0.00045;
    }

    const body     = this.player.body;
    const onGround = body.blocked.down;
    const onWallL  = body.blocked.left;
    const onWallR  = body.blocked.right;
    const onWall   = (onWallL || onWallR) && !onGround && this._hasWallJump;

    if (onGround && !this._wasOnGround && body.velocity.y >= 0) {
      this._landingTimer = 130;
      this._spawnLandingDust();
    }
    this._wasOnGround = onGround;

    if (onGround) {
      this._jumpCount  = 0;
      this._stomping   = false;
      this._wallSliding = false;
    }

    // ── Stomp (bas pendant saut) ──
    const goDown = this._cursors.down.isDown;
    if (goDown && !onGround && !this._stomping) {
      this._stomping = true;
      this.player.setVelocityY(500);
      this.player.play('aria-stomp', true);
      this._spawnActionRing(0x00b8d4, 18, 120);
    }

    // ── Dash ──
    if (this._dashTimer > 0) {
      this.player.setVelocityX(this._facing * this._dashSpeed);
      this.player.play('aria-dash', true);
      this._updateAnim(onGround, onWall);
      return;
    }

    // ── Déplacement horizontal ──
    const goLeft  = this._cursors.left.isDown  || this._wasd.left.isDown;
    const goRight = this._cursors.right.isDown || this._wasd.right.isDown;

    if (goLeft)       { this.player.setVelocityX(-this.speed); this.player.setFlipX(true);  this._facing = -1; }
    else if (goRight) { this.player.setVelocityX(this.speed);  this.player.setFlipX(false); this._facing = 1;  }
    else              { this.player.setVelocityX(0); }

    if (onGround && Math.abs(this.player.body.velocity.x) > 20) {
      this._stepTimer -= delta;
      if (this._stepTimer <= 0) {
        this._spawnFootstep();
        this._stepTimer = 180;
      }
    } else this._stepTimer = 0;

    // ── Wall-slide ──
    if (onWall) {
      this._wallSliding = true;
      this._wallJumpDir = onWallL ? 1 : -1;
      if (body.velocity.y > 60) this.player.body.setVelocityY(60); // glisse lent
    } else {
      this._wallSliding = false;
    }

    // ── Saut / Wall-jump ──
    const jumpDown = this._cursors.up.isDown || this._wasd.up.isDown || this._space.isDown;
    if (jumpDown && !this._jumpHeld) {
      if (this._wallSliding && this._wallJumpTimer <= 0) {
        // Wall-jump
        this.player.setVelocityY(this.jumpVel);
        this.player.setVelocityX(this._wallJumpDir * this.speed * 1.4);
        this.player.setFlipX(this._wallJumpDir < 0);
        this._facing = this._wallJumpDir;
        this._wallJumpTimer = 300;
        this._jumpCount = 1;
        audio.play('jump');
      } else if (this._jumpCount < this.maxJumps) {
        this.player.setVelocityY(this.jumpVel);
        this._jumpCount++;
        audio.play('jump');
        if (this._jumpCount === 1) this._spawnJumpImpulse();
        if (this._jumpCount === 2) {
          this.player.play('aria-djump', false);
          this._spawnActionRing(0x80f7ff, 12, 260);
          this.scene.time.delayedCall(220, () => {
            if (this.player.active && !this.player.body.blocked.down)
              this.player.play('aria-jump', true);
          });
        }
      }
    }
    this._jumpHeld = jumpDown;

    // ── Dash ──
    if (Phaser.Input.Keyboard.JustDown(this._shiftL) && this._hasDash && this._dashCd <= 0) {
      this._dashTimer = 160;
      this._dashCd    = 1400;
      this.player.play('aria-dash', true);
      this._spawnDashTrail();
      audio.play('dash');
    }

    // ── Tir laser / chargé (X) ──
    const xDown = this._xKey.isDown;
    if (xDown) {
      this._chargeT += delta;
      if (!this._xHeld) { this._xHeld = true; }
      if (this._chargeT > 180) this._updateChargeOrb();
    } else {
      if (this._xHeld && this._shootCd <= 0) {
        if (this._chargeT > 500) {
          this._fireCharged();
          this._shootCd = 700;
        } else {
          this._fireBullet();
          this._shootCd = 280;
        }
      }
      this._chargeT = 0;
      this._xHeld   = false;
      this._destroyChargeOrb();
    }

    // Indicateur de charge (glow progressif)
    if (this._xHeld && this._chargeT > 500 && this.player.postFX) {
      const g = this.player.postFX.list?.[0];
      if (g) g.outerStrength = Math.min(12, 2 + (this._chargeT - 500) / 80);
    } else if (this.player.postFX?.list?.[0] && this.player.postFX.list[0].outerStrength !== 2) {
      this.player.postFX.list[0].outerStrength = 2;
    }

    this._updateAnim(onGround, onWall);
  }

  // ─── Tir normal ──────────────────────────────────────────────────────────
  _fireBullet() {
    audio.play('shoot');
    const p = this.player;
    const bx = p.x + this._facing * 18;
    const by = p.y - 6;
    const b  = this.scene.physics.add.image(bx, by, 'bullet');
    this.bullets.add(b, true);
    b.setTint(0x00e5ff);
    b.body.setAllowGravity(false);
    b.body.velocity.x = this._facing * 500;
    b.setDepth(12);
    this._shootAnimTimer = 140;
    p.play('aria-shoot', true);
    const fl = this.scene.add.rectangle(bx + this._facing * 8, by, 10, 4, 0xffffff, 0.9).setDepth(15);
    this.scene.time.delayedCall(60, () => fl.destroy());
    this.scene.time.delayedCall(800, () => { if (b.active) b.destroy(); });
  }

  // ─── Tir chargé (traverse ennemis, plus large) ───────────────────────────
  _fireCharged() {
    audio.play('charged');
    const p = this.player;
    const bx = p.x + this._facing * 18;
    const by = p.y - 8;
    this._shootAnimTimer = 180;
    p.play('aria-shoot', true);
    for (let lane = -1; lane <= 1; lane++) {
      const b = this.scene.physics.add.image(bx, by + lane * 8, 'bullet');
      this.bullets.add(b, true);
      b.setTint(0xffffff);
      b.setScale(1.8, 2.2);
      b.body.setAllowGravity(false);
      b.body.velocity.x = this._facing * 450;
      b.body.velocity.y = lane * 20;
      b.setDepth(12);
      b.setAlpha(0.92);
      this.scene.time.delayedCall(1100, () => { if (b.active) b.destroy(); });
    }
    // Flash puissant
    const fl = this.scene.add.rectangle(bx + this._facing * 14, by, 22, 18, 0xffffff, 0.95).setDepth(16);
    this.scene.tweens.add({ targets: fl, alpha: 0, duration: 120, onComplete: () => fl.destroy() });
    if (settings.get('screenShake')) this.scene.cameras.main.shake(80, 0.004);
    this._spawnActionRing(0xffffff, 10, 220);
  }

  _spawnDashTrail() {
    const p = this.player;
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 30, () => {
        if (!p.active) return;
        const ghost = this.scene.add.image(p.x, p.y, 'aria-sheet', 13)
          .setFlipX(p.flipX).setTint(0x00e5ff).setAlpha(0.38 - i * 0.05).setDepth(8);
        this.scene.tweens.add({ targets: ghost, alpha: 0, scaleX: 0.82, scaleY: 1.12,
          duration: 260, onComplete: () => ghost.destroy() });
      });
    }
  }

  _spawnFootstep() {
    const p = this.player;
    const dust = this.scene.add.ellipse(p.x - this._facing * 7, p.y + 22, 8, 3, 0x80deea, 0.28).setDepth(7);
    this.scene.tweens.add({ targets: dust, x: dust.x - this._facing * 5, alpha: 0,
      scaleX: 1.8, duration: 240, onComplete: () => dust.destroy() });
  }

  _spawnJumpImpulse() {
    const p = this.player;
    const impulse = this.scene.add.ellipse(p.x, p.y + 21, 22, 5, 0x00e5ff, 0.3).setDepth(7);
    this.scene.tweens.add({ targets: impulse, alpha: 0, scaleX: 1.7, scaleY: 0.35,
      duration: 220, ease: 'Quad.out', onComplete: () => impulse.destroy() });
  }

  _spawnActionRing(color, startRadius, duration) {
    const p = this.player;
    const ring = this.scene.add.circle(p.x, p.y, startRadius, color, 0)
      .setStrokeStyle(2, color, 0.75).setDepth(9);
    this.scene.tweens.add({ targets: ring, scale: 2.2, alpha: 0,
      duration, ease: 'Quad.out', onComplete: () => ring.destroy() });
  }

  _updateChargeOrb() {
    const p = this.player;
    if (!this._chargeOrb) {
      this._chargeOrb = this.scene.add.circle(p.x, p.y, 3, 0x80f7ff, 0.85)
        .setBlendMode('ADD').setDepth(15);
      this.scene.tweens.add({ targets: this._chargeOrb, scale: { from: 0.7, to: 1.5 },
        alpha: { from: 0.45, to: 1 }, duration: 180, yoyo: true, repeat: -1 });
    }
    this._chargeOrb.setPosition(p.x + this._facing * 18, p.y);
  }

  _destroyChargeOrb() {
    if (!this._chargeOrb) return;
    this._chargeOrb.destroy();
    this._chargeOrb = null;
  }

  _spawnLandingDust() {
    const p = this.player;
    [-1, 1].forEach(dir => {
      const dust = this.scene.add.ellipse(p.x + dir * 7, p.y + 22, 9, 3, 0x80deea, 0.34).setDepth(7);
      this.scene.tweens.add({ targets: dust, x: dust.x + dir * 14, alpha: 0,
        scaleX: 1.7, duration: 300, onComplete: () => dust.destroy() });
    });
  }

  _updateAnim(onGround, onWall) {
    const p   = this.player;
    const vx  = p.body.velocity.x;
    const vy  = p.body.velocity.y;
    const cur = p.anims.currentAnim?.key;
    if (this._dashTimer > 0 || this._shootAnimTimer > 0) return;
    if (this._xHeld && this._chargeT > 160) { p.play('aria-charge', true); return; }
    if (cur === 'aria-djump' && p.anims.isPlaying) return;
    if (this._landingTimer > 0 && onGround) { p.play('aria-land', true); return; }
    if (this._stomping && !onGround) { p.play('aria-stomp', true); return; }
    if (onWall && !onGround)  { p.play('aria-wall', true); p.setTintFill(0x00b8d4); return; }
    else                       { p.clearTint(); }
    if (!onGround)  { vy < -60 ? p.play('aria-jump', true) : p.play('aria-fall', true); }
    else if (Math.abs(vx) > 20) { p.anims.timeScale = Phaser.Math.Clamp(Math.abs(vx) / 180, 0.8, 1.25); p.play('aria-walk', true); }
    else                         { p.play('aria-idle', true); }
  }
}
