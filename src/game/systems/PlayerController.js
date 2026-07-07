/**
 * PlayerController — mouvement, saut, wall-jump, dash, tir chargé, bouclier.
 */
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

    // Stomp
    this._stomping = false;

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
    this._shieldSprite = this.scene.add.circle(0, 0, 22, 0x00e5ff, 0.28)
      .setDepth(14);
    if (this._shieldSprite.postFX)
      this._shieldSprite.postFX.addGlow(0x00e5ff, 5, 0);
  }

  /** Absorbe un hit de bouclier — retourne true si le hit est absorbé. */
  tryShieldAbsorb() {
    if (!this._shieldActive || this._shieldHp <= 0) return false;
    this._shieldHp--;
    this._shieldActive = false;
    this._shieldCd     = 8000;
    if (this._shieldSprite) {
      this.scene.tweens.add({
        targets: this._shieldSprite, alpha: 0, duration: 300,
        onComplete: () => {
          if (this._shieldSprite) {
            this._shieldSprite.setAlpha(0.28);
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

    // Recharge bouclier
    if (!this._shieldActive && this._shieldCd > 0) {
      this._shieldCd -= delta;
      if (this._shieldCd <= 0) {
        this._shieldActive = true;
        this._shieldHp     = 1;
        if (this._shieldSprite) this._shieldSprite.setVisible(true);
        this.scene.events.emit('shieldReady');
      }
    }
    // Position bouclier suit le joueur
    if (this._shieldSprite && this._shieldActive) {
      this._shieldSprite.setPosition(this.player.x, this.player.y);
    }

    const body     = this.player.body;
    const onGround = body.blocked.down;
    const onWallL  = body.blocked.left;
    const onWallR  = body.blocked.right;
    const onWall   = (onWallL || onWallR) && !onGround && this._hasWallJump;

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
    }

    // ── Dash ──
    if (this._dashTimer > 0) {
      this.player.setVelocityX(this._facing * this._dashSpeed);
      this._updateAnim(onGround, onWall);
      return;
    }

    // ── Déplacement horizontal ──
    const goLeft  = this._cursors.left.isDown  || this._wasd.left.isDown;
    const goRight = this._cursors.right.isDown || this._wasd.right.isDown;

    if (goLeft)       { this.player.setVelocityX(-this.speed); this.player.setFlipX(true);  this._facing = -1; }
    else if (goRight) { this.player.setVelocityX(this.speed);  this.player.setFlipX(false); this._facing = 1;  }
    else              { this.player.setVelocityX(0); }

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
      } else if (this._jumpCount < this.maxJumps) {
        this.player.setVelocityY(this.jumpVel);
        this._jumpCount++;
        if (this._jumpCount === 2) {
          this.player.play('aria-djump', false);
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
      this._spawnDashTrail();
    }

    // ── Tir laser / chargé (X) ──
    const xDown = this._xKey.isDown;
    if (xDown) {
      this._chargeT += delta;
      if (!this._xHeld) { this._xHeld = true; }
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
    }

    // Indicateur de charge (glow progressif)
    if (this._xHeld && this._chargeT > 500 && this.player.postFX) {
      const g = this.player.postFX.list?.[0];
      if (g) g.outerStrength = Math.min(12, 2 + (this._chargeT - 500) / 80);
    } else if (this.player.postFX?.list?.[0]) {
      this.player.postFX.list[0].outerStrength = 2;
    }

    this._updateAnim(onGround, onWall);
  }

  // ─── Tir normal ──────────────────────────────────────────────────────────
  _fireBullet() {
    const p = this.player;
    const bx = p.x + this._facing * 18;
    const by = p.y - 6;
    const b  = this.scene.physics.add.image(bx, by, 'bullet');
    this.bullets.add(b, true);
    b.setTint(0x00e5ff);
    b.body.setAllowGravity(false);
    b.body.velocity.x = this._facing * 500;
    b.setDepth(12);
    const fl = this.scene.add.rectangle(bx + this._facing * 8, by, 10, 4, 0xffffff, 0.9).setDepth(15);
    this.scene.time.delayedCall(60, () => fl.destroy());
    this.scene.time.delayedCall(800, () => { if (b.active) b.destroy(); });
  }

  // ─── Tir chargé (traverse ennemis, plus large) ───────────────────────────
  _fireCharged() {
    const p = this.player;
    const bx = p.x + this._facing * 18;
    const by = p.y - 8;
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
    this.scene.cameras.main.shake(80, 0.004);
  }

  _spawnDashTrail() {
    const p = this.player;
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 30, () => {
        if (!p.active) return;
        const g = this.scene.add.rectangle(p.x, p.y, 28, 42, 0x00e5ff, 0.35 - i * 0.06).setDepth(8);
        this.scene.tweens.add({ targets: g, alpha: 0, duration: 250, onComplete: () => g.destroy() });
      });
    }
  }

  _updateAnim(onGround, onWall) {
    const p   = this.player;
    const vx  = p.body.velocity.x;
    const vy  = p.body.velocity.y;
    const cur = p.anims.currentAnim?.key;
    if (cur === 'aria-djump' && p.anims.isPlaying) return;
    if (onWall && !onGround)  { p.play('aria-fall', true); p.setTintFill(0x00b8d4); return; }
    else                       { p.clearTint(); }
    if (!onGround)  { vy < -60 ? p.play('aria-jump', true) : p.play('aria-fall', true); }
    else if (Math.abs(vx) > 20) { p.play('aria-walk', true); }
    else                         { p.play('aria-idle', true); }
  }
}
