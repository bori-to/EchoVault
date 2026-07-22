import Phaser from 'phaser';
import { audio } from '../systems/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    // Les instances de scènes Phaser sont réutilisées après une fin.
    // Réinitialiser ce verrou permet de lancer une nouvelle partie.
    this._starting = false;
    const { width: W, height: H } = this.scale;
    this.add.rectangle(W / 2, H / 2, W, H, 0x02050b);
    const wall = this.add.tileSprite(W / 2, H / 2, W, H, 'bg-brick').setAlpha(0.48);
    this.tweens.add({ targets: wall, tilePositionX: 40, duration: 28000, repeat: -1 });

    // Puits central et anneaux de l'Écho.
    for (let i = 0; i < 5; i++) {
      const ring = this.add.circle(560, 245, 48 + i * 34, 0x000000, 0)
        .setStrokeStyle(1, i % 2 ? 0x7e57c2 : 0x00b8d4, 0.16).setScale(0.8);
      this.tweens.add({ targets: ring, scale: 1.15, alpha: { from: 0.15, to: 0.55 },
        duration: 2600 + i * 400, delay: i * 210, yoyo: true, repeat: -1 });
    }
    const aria = this.add.image(560, 248, 'aria-sheet', 16).setScale(2.25).setTint(0x80deea).setAlpha(0.88);
    if (aria.postFX) aria.postFX.addGlow(0x00e5ff, 7, 0);
    this.tweens.add({ targets: aria, y: 240, duration: 1800, ease: 'Sine.inOut', yoyo: true, repeat: -1 });

    this.add.rectangle(0, H / 2, 320, H, 0x030711, 0.94).setOrigin(0, 0.5);
    this.add.rectangle(320, H / 2, 2, H - 60, 0x00b8d4, 0.32);
    this.add.text(42, 58, 'ECHO', { fontFamily: 'monospace', fontSize: '50px', color: '#eefcff', fontStyle: 'bold', letterSpacing: 5 }).setAlpha(0);
    const vault = this.add.text(42, 105, 'VAULT', { fontFamily: 'monospace', fontSize: '50px', color: '#00e5ff', fontStyle: 'bold', letterSpacing: 5 }).setAlpha(0);
    if (vault.postFX) vault.postFX.addGlow(0x00b8d4, 4, 0);
    this.children.list.filter(o => o.type === 'Text' && (o.text === 'ECHO' || o.text === 'VAULT')).forEach((t, i) =>
      this.tweens.add({ targets: t, alpha: 1, x: { from: 25, to: 42 }, duration: 650, delay: 150 + i * 120 }));

    this.add.text(44, 166, 'LES MÉMOIRES NE MEURENT PAS.\nELLES ATTENDENT.', {
      fontFamily: 'monospace', fontSize: '11px', color: '#607d8b', lineSpacing: 5,
    });
    this._menuButton(46, 238, 'NOUVELLE PARTIE', 'RECONSTRUIRE ARIA', () => this._start());
    this._menuButton(46, 310, 'PARAMÈTRES', 'SON · AFFICHAGE', () => {
      audio.play('ui'); this.scene.start('SettingsScene', { from: 'menu' });
    });

    this.add.text(44, 407, 'CAMPAGNE NARRATIVE · ≈ 15 MIN', { fontFamily: 'monospace', fontSize: '10px', color: '#455a64' });
    this.add.text(44, 428, 'ESPACE / ENTRÉE POUR COMMENCER', { fontFamily: 'monospace', fontSize: '10px', color: '#00b8d4' });
    this.add.text(W - 18, H - 18, 'ARCHIVE 09.847', { fontFamily: 'monospace', fontSize: '9px', color: '#263238' }).setOrigin(1);

    this.add.particles(560, 250, 'particle', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-210, -210, 420, 420) },
      quantity: 1, frequency: 170, lifespan: { min: 1800, max: 4200 },
      alpha: { start: 0.65, end: 0 }, scale: { min: 0.25, max: 0.75 },
      speedY: { min: -22, max: -5 }, speedX: { min: -8, max: 8 },
      tint: [0x00e5ff, 0x7e57c2, 0xce93d8], blendMode: Phaser.BlendModes.ADD,
    });
    this.cameras.main.fadeIn(650);
    this.input.keyboard.once('keydown-SPACE', () => this._start());
    this.input.keyboard.once('keydown-ENTER', () => this._start());
  }

  _menuButton(x, y, title, subtitle, action) {
    const bg = this.add.rectangle(x, y, 232, 54, 0x0b1621, 0.92).setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x29434e).setInteractive({ useHandCursor: true });
    const marker = this.add.rectangle(x, y, 3, 54, 0x00b8d4).setOrigin(0, 0.5).setAlpha(0.5);
    this.add.text(x + 18, y - 12, title, { fontFamily: 'monospace', fontSize: '15px', color: '#eceff1' });
    this.add.text(x + 18, y + 10, subtitle, { fontFamily: 'monospace', fontSize: '9px', color: '#546e7a' });
    bg.on('pointerover', () => { bg.setFillStyle(0x10303a); marker.setAlpha(1).setScale(2, 1); })
      .on('pointerout', () => { bg.setFillStyle(0x0b1621, 0.92); marker.setAlpha(0.5).setScale(1); })
      .on('pointerdown', action);
  }

  _start() {
    if (this._starting) return;
    this._starting = true; audio.play('power');
    this.cameras.main.fadeOut(450);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
  }
}
