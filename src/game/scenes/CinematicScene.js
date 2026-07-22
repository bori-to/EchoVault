import Phaser from 'phaser';
import { audio } from '../systems/AudioManager.js';
import { settings } from '../systems/SettingsManager.js';
import { voice } from '../systems/VoiceManager.js';

const SHOTS = [
  {
    eyebrow: 'ARCHIVE 00 — AVANT LE SILENCE',
    title: 'NOUS AVONS BÂTI LE COFFRE',
    body: 'Quand la surface a commencé à mourir,\nl’humanité a confié ses souvenirs à une cité souterraine.',
    focus: { x: 0.50, y: 0.48, from: 1.28, to: 1.02 }, color: 0x4fc3f7,
  },
  {
    eyebrow: 'ARCHIVE 01 — LE TRANSFERT',
    title: 'DES MILLIONS DE VOIX',
    body: 'Chaque lumière devint une conscience.\nChaque conscience attendait un nouveau monde.',
    focus: { x: 0.64, y: 0.32, from: 1.42, to: 1.16 }, color: 0xce93d8,
  },
  {
    eyebrow: 'ARCHIVE 02 — LE DERNIER ORDRE',
    title: 'PUIS LES RESSOURCES ONT MANQUÉ',
    body: 'Le Conseil ordonna l’effacement des Échos.\nUne gardienne refusa… et verrouilla sa propre mémoire.',
    focus: { x: 0.52, y: 0.55, from: 1.16, to: 1.48 }, color: 0xff6f60,
  },
  {
    eyebrow: 'CYCLE 9 847 — SIGNAL DÉTECTÉ',
    title: 'ARIA, RÉVEILLE-TOI',
    body: 'Le Coffre s’ouvre à nouveau.\nRetrouve la vérité. Décide ce qui mérite de survivre.',
    focus: { x: 0.245, y: 0.67, from: 2.25, to: 1.72 }, color: 0x00e5ff,
  },
];

export class CinematicScene extends Phaser.Scene {
  constructor() { super({ key: 'CinematicScene' }); }

  create() {
    const { width: W, height: H } = this.scale;
    this._finished = false;
    this._shot = -1;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000).setDepth(-20);

    this._image = this.add.image(W / 2, H / 2, 'cinematic-vault').setDepth(-15);
    this._fitImage(W, H);
    this._shade = this.add.rectangle(W / 2, H / 2, W, H, 0x02050c, 0.25).setDepth(-10);
    this._vignetteTop = this.add.rectangle(W / 2, 0, W, H * 0.30, 0x000000, 0.78).setOrigin(0.5, 0).setDepth(10);
    this._vignetteBottom = this.add.rectangle(W / 2, H, W, H * 0.34, 0x000000, 0.84).setOrigin(0.5, 1).setDepth(10);

    // Profondeur : poussière proche et capsules holographiques se déplacent à
    // des vitesses différentes du plan principal.
    this._dust = this.add.particles(W / 2, H / 2, 'particle', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-W / 2, -H / 2, W, H) },
      quantity: 1, frequency: 75, lifespan: { min: 1800, max: 4200 },
      speedX: { min: -18, max: 18 }, speedY: { min: -8, max: 12 },
      scale: { min: 0.25, max: 1.2 }, alpha: { start: 0.7, end: 0 },
      tint: [0x80deea, 0xce93d8, 0xffffff], blendMode: Phaser.BlendModes.ADD,
    }).setDepth(3);
    this._buildDepthFrames(W, H);

    this._eyebrow = this.add.text(W / 2, H - 132, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#78909c', letterSpacing: 3,
    }).setOrigin(0.5).setDepth(20);
    this._title = this.add.text(W / 2, H - 98, '', {
      fontFamily: 'monospace', fontSize: '25px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 5, align: 'center',
    }).setOrigin(0.5).setDepth(20);
    this._body = this.add.text(W / 2, H - 49, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#cfd8dc', align: 'center', lineSpacing: 4,
    }).setOrigin(0.5).setDepth(20);

    const skip = this.add.text(W - 18, 18, 'PASSER  [ÉCHAP]', {
      fontFamily: 'monospace', fontSize: '9px', color: '#78909c',
      backgroundColor: '#02050ccc', padding: { x: 9, y: 6 },
    }).setOrigin(1, 0).setDepth(30).setInteractive({ useHandCursor: true });
    skip.on('pointerover', () => skip.setStyle({ color: '#ffffff' }))
      .on('pointerout', () => skip.setStyle({ color: '#78909c' }))
      .on('pointerdown', () => this._finish());

    this.input.keyboard.on('keydown-ESC', () => this._finish());
    this.input.keyboard.on('keydown-SPACE', () => this._finish());
    this.input.keyboard.on('keydown-ENTER', () => this._finish());
    this.cameras.main.fadeIn(1200, 0, 0, 0);
    this.time.delayedCall(400, () => this._playShot(0));
  }

  _fitImage(W, H) {
    const source = this.textures.get('cinematic-vault').getSourceImage();
    const cover = Math.max(W / source.width, H / source.height);
    this._baseScale = cover;
    this._image.setScale(cover);
  }

  _buildDepthFrames(W, H) {
    this._rings = [];
    for (let i = 0; i < 5; i++) {
      const ring = this.add.ellipse(W * 0.535, H * 0.43, 100 + i * 70, 60 + i * 43, 0x000000, 0)
        .setStrokeStyle(1, i % 2 ? 0xce93d8 : 0x00e5ff, 0.13).setDepth(i - 8);
      this.tweens.add({ targets: ring, scaleX: 1.14, scaleY: 1.14, alpha: { from: 0.1, to: 0.52 },
        duration: 2400 + i * 330, yoyo: true, repeat: -1, delay: i * 160 });
      this._rings.push(ring);
    }
    this._scan = this.add.rectangle(W / 2, 0, W, 2, 0x00e5ff, 0.18).setDepth(8);
    this.tweens.add({ targets: this._scan, y: H, duration: 3900, repeat: -1, ease: 'Linear' });
  }

  _playShot(index) {
    if (this._finished) return;
    if (index >= SHOTS.length) { this._finish(); return; }
    this._shot = index;
    const shot = SHOTS[index];
    const { width: W, height: H } = this.scale;
    // Laisse à la narration française le temps de terminer naturellement.
    const duration = index === 3 ? 7600 : 8200;

    this.tweens.killTweensOf(this._image);
    this._image.setPosition(
      W / 2 + (0.5 - shot.focus.x) * W * 0.58,
      H / 2 + (0.5 - shot.focus.y) * H * 0.50,
    ).setScale(this._baseScale * shot.focus.from).setTint(0xffffff).setAlpha(0.35);
    this.tweens.add({
      targets: this._image,
      scaleX: this._baseScale * shot.focus.to,
      scaleY: this._baseScale * shot.focus.to,
      alpha: 1, duration, ease: 'Sine.inOut',
    });

    [this._eyebrow, this._title, this._body].forEach(t => t.setAlpha(0).setY(t.y + 8));
    this._eyebrow.setText(shot.eyebrow).setColor(Phaser.Display.Color.IntegerToColor(shot.color).rgba);
    this._title.setText(shot.title);
    this._body.setText(shot.body);
    this.tweens.add({ targets: [this._eyebrow, this._title, this._body], alpha: 1, y: '-=8',
      duration: 650, delay: this.tweens.stagger(170, { start: 260 }) });

    const flash = this.add.rectangle(W / 2, H / 2, W, H, shot.color, index === 2 ? 0.25 : 0.10).setDepth(12);
    this.tweens.add({ targets: flash, alpha: 0, duration: 900, onComplete: () => flash.destroy() });
    this._shade.setFillStyle(index === 2 ? 0x260309 : 0x02050c, index === 2 ? 0.32 : 0.22);
    audio.play(index === 2 ? 'boss' : index === 3 ? 'power' : 'collect');
    voice.speak(`${shot.title}. ${shot.body}`, {
      persona: 'narrator',
    });
    if (index === 2) this._glitch(W, H);
    if (index === 3 && settings.get('screenShake')) this.cameras.main.shake(500, 0.004);

    this.time.delayedCall(duration, () => {
      this.tweens.add({ targets: [this._eyebrow, this._title, this._body], alpha: 0, duration: 420 });
      this.time.delayedCall(500, () => this._playShot(index + 1));
    });
  }

  _glitch(W, H) {
    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 120, () => {
        if (this._finished) return;
        const bar = this.add.rectangle(W / 2 + Phaser.Math.Between(-35, 35), Phaser.Math.Between(50, H - 50),
          W, Phaser.Math.Between(2, 10), i % 2 ? 0xff1744 : 0x00e5ff, 0.17).setDepth(14);
        this.tweens.add({ targets: bar, x: bar.x + Phaser.Math.Between(-90, 90), alpha: 0,
          duration: 100, onComplete: () => bar.destroy() });
      });
    }
  }

  _finish() {
    if (this._finished) return;
    this._finished = true;
    voice.stop();
    audio.play('power');
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
  }
}
