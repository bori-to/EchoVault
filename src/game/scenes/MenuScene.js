/**
 * MenuScene — écran titre atmosphérique d'EchoVault (style Hollow Knight).
 * Fond en briques de pierre avec particules flottantes et titre lumineux.
 */
import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const cx = W / 2, cy = H / 2;

    // ── Fond : mur de briques + couche sombre ─────────────────────────────
    this.add.rectangle(cx, cy, W, H, 0x040609);
    this.add.tileSprite(cx, cy, W, H, 'bg-brick').setAlpha(0.9);
    // Voile de profondeur (haut plus sombre)
    this.add.rectangle(cx, cy * 0.45, W, cy * 0.9, 0x04060c, 0.7);

    // ── Silhouettes architecturales ───────────────────────────────────────
    for (let i = 0; i < 8; i++) {
      const rx = 40 + i * 105, rh = 55 + (i % 3) * 28;
      this.add.rectangle(rx, H, 22, rh * 2, 0x080e1c, 0.9);
      this.add.rectangle(rx, H - rh, 32, 12, 0x080e1c, 0.9);
    }

    // ── Torches décoratives ───────────────────────────────────────────────
    [90, 310, 530, 700].forEach(tx => {
      const fl = this.add.rectangle(tx, H - 75, 36, 28, 0xff8f00, 0.08)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: fl, alpha: { from: 0.04, to: 0.14 },
        duration: Phaser.Math.Between(600, 1400), yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 800),
      });
      this.add.rectangle(tx, H - 70, 3, 10, 0x5d4037);
      this.add.rectangle(tx, H - 76, 6, 8, 0xef6c00);
      this.add.rectangle(tx, H - 78, 4, 5, 0xffc107);
    });

    // ── Particules flottantes ─────────────────────────────────────────────
    this.add.particles(cx, cy, 'particle', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-cx, -cy + 20, W, H - 40) },
      quantity:  1, frequency: 500,
      lifespan:  { min: 4000, max: 8000 },
      alpha:     { start: 0.55, end: 0 },
      scale:     { min: 0.3, max: 0.8 },
      speedX:    { min: -5, max: 5 },
      speedY:    { min: -14, max: -3 },
      gravityY:  0,
      tint:      [0x80deea, 0xb39ddb, 0x4fc3f7],
      blendMode: Phaser.BlendModes.ADD,
    });

    // ── Titre ─────────────────────────────────────────────────────────────
    // Ombre portée
    this.add.text(cx + 3, cy - 107, 'ECHO VAULT', {
      fontFamily: 'monospace', fontSize: '52px',
      color: '#002535', stroke: '#001018', strokeThickness: 8,
    }).setOrigin(0.5);
    // Titre principal
    const title = this.add.text(cx, cy - 110, 'ECHO VAULT', {
      fontFamily: 'monospace', fontSize: '52px',
      color: '#00e5ff', stroke: '#00455e', strokeThickness: 4,
    }).setOrigin(0.5);
    if (title.postFX) title.postFX.addGlow(0x00e5ff, 5, 0);

    // ── Sous-titre clignotant ─────────────────────────────────────────────
    const sub = this.add.text(cx, cy - 55, '◈  MetroidvanIA  ◈', {
      fontFamily: 'monospace', fontSize: '14px', color: '#7e57c2',
    }).setOrigin(0.5);
    this.tweens.add({ targets: sub, alpha: { from: 0.2, to: 1 }, duration: 1400, yoyo: true, repeat: -1 });

    // ── Pitch ─────────────────────────────────────────────────────────────
    this.add.text(cx, cy - 20, 'Cinq actes pour reconstruire une mémoire interdite.', {
      fontFamily: 'monospace', fontSize: '13px', color: '#4a6070',
    }).setOrigin(0.5);
    this.add.text(cx, cy - 3, 'Huit souvenirs. Trois témoins. Deux destins.', {
      fontFamily: 'monospace', fontSize: '13px', color: '#4a6070',
    }).setOrigin(0.5);

    // ── Bouton Jouer ──────────────────────────────────────────────────────
    const btn = this.add.text(cx, cy + 55, '▶   NOUVELLE PARTIE', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ffffff',
      backgroundColor: '#004d5c', padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ color: '#00e5ff', backgroundColor: '#006878' }));
    btn.on('pointerout',  () => btn.setStyle({ color: '#ffffff', backgroundColor: '#004d5c' }));
    btn.on('pointerdown', () => this._start());

    // ── Contrôles ─────────────────────────────────────────────────────────
    this.add.text(cx, cy + 115, '← → / A D : Déplacer    ESPACE : Sauter    E : Interagir    1/2 : Choisir', {
      fontFamily: 'monospace', fontSize: '11px', color: '#263040',
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.input.keyboard.once('keydown-SPACE', () => this._start());
    this.input.keyboard.once('keydown-ENTER', () => this._start());
  }

  _start() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
  }
}
