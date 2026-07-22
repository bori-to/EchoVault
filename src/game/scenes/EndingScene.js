import Phaser from 'phaser';
import { audio } from '../systems/AudioManager.js';

const CONTENT = {
  guardian: {
    color: 0x4caf8a, accent: '#80e8c1', dark: 0x03130f,
    number: 'PROTOCOLE 01', title: 'TRANSMISSION', verdict: 'LA MÉMOIRE DEVIENT UN HÉRITAGE',
    body: 'ARIA ouvre les archives au monde extérieur.\nLes Échos parlent enfin avec leurs propres voix.\nLa cité devient un phare, non un tombeau.',
    epilogue: 'ARIA reste leur gardienne — par choix, cette fois.',
  },
  reset: {
    color: 0xe05a6f, accent: '#ff9aaa', dark: 0x160408,
    number: 'PROTOCOLE 02', title: 'LIBÉRATION', verdict: 'AUCUNE MÉMOIRE NE SERA POSSÉDÉE',
    body: 'ARIA brise le Coffre et rend chaque mémoire à l’Écho.\nLes voix choisissent de partir, de dormir ou de rester.\nÀ l’aube, les ruines sont silencieuses — mais libres.',
    epilogue: 'ARIA marche vers la surface avec ses propres souvenirs.',
  },
};

export class EndingScene extends Phaser.Scene {
  constructor() { super({ key: 'EndingScene' }); }
  init(data) { this._ending = data.ending || 'reset'; this._stats = data.stats || {}; }

  create() {
    const { width: W, height: H } = this.scale;
    const cfg = CONTENT[this._ending] || CONTENT.reset;
    this.add.rectangle(W / 2, H / 2, W, H, cfg.dark);
    this.add.tileSprite(W / 2, H / 2, W, H, 'bg-brick').setTint(cfg.color).setAlpha(0.18);

    const beam = this.add.rectangle(W / 2, H / 2, 160, H * 1.5, cfg.color, 0.08).setAngle(18);
    this.tweens.add({ targets: beam, alpha: { from: 0.03, to: 0.14 }, duration: 2200, yoyo: true, repeat: -1 });
    for (let i = 0; i < 34; i++) {
      const p = this.add.rectangle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), 2, Phaser.Math.Between(2, 8), cfg.color, 0.6);
      this.tweens.add({ targets: p, y: p.y - Phaser.Math.Between(40, 130), alpha: 0,
        duration: Phaser.Math.Between(1400, 3300), delay: Phaser.Math.Between(0, 1600), repeat: -1 });
    }

    this.add.text(W / 2, 42, cfg.number, { fontFamily: 'monospace', fontSize: '10px', color: '#607d8b', letterSpacing: 4 }).setOrigin(0.5);
    const title = this.add.text(W / 2, 82, cfg.title, { fontFamily: 'monospace', fontSize: '37px', color: cfg.accent, fontStyle: 'bold', letterSpacing: 5, stroke: '#000', strokeThickness: 5 }).setOrigin(0.5).setAlpha(0);
    const line = this.add.rectangle(W / 2, 119, 0, 2, cfg.color).setAlpha(0.8);
    this.tweens.add({ targets: title, alpha: 1, y: { from: 70, to: 82 }, duration: 850, delay: 250 });
    this.tweens.add({ targets: line, width: 510, duration: 900, delay: 500 });

    const body = this.add.text(W / 2, 186, cfg.body, { fontFamily: 'monospace', fontSize: '14px', color: '#dce7e9', align: 'center', lineSpacing: 7 }).setOrigin(0.5).setAlpha(0);
    const verdict = this.add.text(W / 2, 269, cfg.verdict, { fontFamily: 'monospace', fontSize: '11px', color: cfg.accent, letterSpacing: 1 }).setOrigin(0.5).setAlpha(0);
    const epilogue = this.add.text(W / 2, 302, cfg.epilogue, { fontFamily: 'monospace', fontSize: '12px', color: '#90a4ae', fontStyle: 'italic' }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: [body, verdict, epilogue], alpha: 1, duration: 750, delay: this.tweens.stagger(350, { start: 950 }) });

    const minutes = Math.floor((this._stats.seconds || 0) / 60);
    const seconds = Math.floor((this._stats.seconds || 0) % 60).toString().padStart(2, '0');
    this.add.rectangle(W / 2, 354, 380, 42, 0x020608, 0.7).setStrokeStyle(1, cfg.color, 0.4);
    this.add.text(W / 2, 354, `SOUVENIRS  ${this._stats.fragments || 8}/8     ÉCHOS APAISÉS  ${this._stats.kills || 0}     TEMPS  ${minutes}:${seconds}`,
      { fontFamily: 'monospace', fontSize: '10px', color: '#78909c' }).setOrigin(0.5);

    this._button(300, 420, 'REJOUER', () => { audio.play('power'); this.scene.start('GameScene'); }, cfg);
    this._button(500, 420, 'MENU PRINCIPAL', () => { audio.play('back'); this.scene.start('MenuScene'); }, cfg);
    this.add.text(W / 2, 470, 'Merci d’avoir joué à EchoVault', { fontFamily: 'monospace', fontSize: '9px', color: '#37474f' }).setOrigin(0.5);
    this.cameras.main.fadeIn(900);
    this.time.delayedCall(500, () => audio.chord(['collect', 'power', 'victory'], 230));
  }

  _button(x, y, label, action, cfg) {
    const btn = this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '13px', color: '#dce7e9', backgroundColor: '#0b1418', padding: { x: 18, y: 9 } })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => { btn.setStyle({ color: cfg.accent }); btn.setScale(1.04); })
      .on('pointerout', () => { btn.setStyle({ color: '#dce7e9' }); btn.setScale(1); })
      .on('pointerdown', action);
  }
}
