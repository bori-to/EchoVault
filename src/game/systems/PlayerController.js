/**
 * PlayerController — gère les entrées clavier → déplacement et saut d'ARIA.
 * Supporte la touche ESPACE / flèches / WASD.
 * Le double saut est conditionné au pouvoir débloqué via enableDoubleJump().
 *
 * GÉNÉRÉ avec GitHub Copilot (Claude Sonnet 4.x) — revu et adapté manuellement.
 * Voir prompts_logs/03_code_prompts.md — Entrée #001
 */
export class PlayerController {
  /**
   * @param {Phaser.Scene} scene   - La scène active Phaser
   * @param {Phaser.Physics.Arcade.Sprite} player - Le sprite joueur
   */
  constructor(scene, player) {
    this.scene   = scene;
    this.player  = player;
    this.speed   = 220;        // px/s horizontal
    this.jumpVel = -480;       // vélocité de saut
    this.maxJumps    = 1;      // passe à 2 après unlock double saut
    this._jumpCount  = 0;
    this._jumpHeld   = false;
    this.enabled     = true;

    // Bindings clavier
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd = {
      left:  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up:    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    };
    this._space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  /** Active le double saut (appeler après unlock du pouvoir). */
  enableDoubleJump() {
    this.maxJumps = 2;
  }

  /**
   * Active / désactive les inputs (utilisé pendant les dialogues).
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.player.setVelocityX(0);
  }

  /** À appeler dans le update() de la scène à chaque frame. */
  update() {
    if (!this.enabled) return;

    const body = this.player.body;
    const onGround = body.blocked.down;
    if (onGround) this._jumpCount = 0;

    // ── Déplacement horizontal ──
    const goLeft  = this._cursors.left.isDown  || this._wasd.left.isDown;
    const goRight = this._cursors.right.isDown || this._wasd.right.isDown;

    if (goLeft) {
      this.player.setVelocityX(-this.speed);
      this.player.setFlipX(true);
    } else if (goRight) {
      this.player.setVelocityX(this.speed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // ── Saut (détection de front montant pour éviter le maintien) ──
    const jumpDown = this._cursors.up.isDown || this._wasd.up.isDown || this._space.isDown;
    if (jumpDown && !this._jumpHeld && this._jumpCount < this.maxJumps) {
      this.player.setVelocityY(this.jumpVel);
      this._jumpCount++;
    }
    this._jumpHeld = jumpDown;
  }
}
