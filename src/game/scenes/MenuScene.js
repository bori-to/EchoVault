/**
 * MenuScene — écran titre d'EchoVault.
 * Démarre GameScene sur clic ou touche ESPACE/ENTRÉE.
 */
import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const { width: W, height: H } = this.scale;
    const cx = W / 2, cy = H / 2;

    // Fond sombre
    this.add.rectangle(cx, cy, W, H, 0x05050f);

    // Lignes décoratives de fond (ruines)
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(
        Phaser.Math.Between(50, W - 50), Phaser.Math.Between(200, H),
        Phaser.Math.Between(40, 80), Phaser.Math.Between(60, 120),
        0x0d1b2a
      );
    }

    // Titre
    this.add.text(cx, cy - 110, 'ECHO VAULT', {
      fontFamily: 'monospace', fontSize: '52px', color: '#00e5ff',
      stroke: '#003d50', strokeThickness: 5,
    }).setOrigin(0.5);

    // Sous-titre clignotant
    const sub = this.add.text(cx, cy - 55, '◈  MetroidvanIA  ◈', {
      fontFamily: 'monospace', fontSize: '14px', color: '#4a148c',
    }).setOrigin(0.5);
    this.tweens.add({ targets: sub, alpha: { from: 0.2, to: 1 }, duration: 1400, yoyo: true, repeat: -1 });

    // Pitch
    this.add.text(cx, cy - 20, 'Un robot archéologue retrouve sa mémoire perdue.', {
      fontFamily: 'monospace', fontSize: '13px', color: '#546e7a',
    }).setOrigin(0.5);
    this.add.text(cx, cy - 3, 'Deux chemins. Deux fins. Un seul choix compte.', {
      fontFamily: 'monospace', fontSize: '13px', color: '#546e7a',
    }).setOrigin(0.5);

    // Bouton Jouer
    const btn = this.add.text(cx, cy + 55, '▶   NOUVELLE PARTIE', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ffffff',
      backgroundColor: '#006064', padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ color: '#00e5ff' }));
    btn.on('pointerout',  () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerdown', () => this._start());

    // Contrôles
    this.add.text(cx, cy + 115, '← → / A D : Déplacer    ESPACE : Sauter    E : Interagir    1/2 : Choisir', {
      fontFamily: 'monospace', fontSize: '11px', color: '#37474f',
    }).setOrigin(0.5);

    // Keyboard shortcut
    this.input.keyboard.once('keydown-SPACE', () => this._start());
    this.input.keyboard.once('keydown-ENTER', () => this._start());
  }

  _start() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
  }
}
