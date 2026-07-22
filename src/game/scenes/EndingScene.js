/**
 * EndingScene — affiche la fin appropriée selon le paramètre `ending`.
 * 'guardian' → Fin Gardienne (vert, coexistence)
 * 'reset'    → Fin Réinitialisation (rouge, effacement)
 */
import Phaser from 'phaser';

const CONTENT = {
  guardian: {
    bgColor:  0x071a07,
    accent:   '#4caf50',
    title:    '◈  FIN — TRANSMISSION  ◈',
    body:     'ARIA ouvre les archives au monde extérieur.\nLes Échos parlent enfin avec leurs propres voix.\nLa cité devient un phare, non un tombeau.\n\nARIA reste leur gardienne — par choix, cette fois.',
    particle: 0x81c784,
  },
  reset: {
    bgColor:  0x1a0707,
    accent:   '#f44336',
    title:    '◈  FIN — LIBÉRATION  ◈',
    body:     'ARIA brise le Coffre et rend chaque mémoire à l’Écho.\nLes voix choisissent de partir, de dormir ou de rester.\nÀ l’aube, les ruines sont silencieuses — mais libres.\n\nARIA marche vers la surface avec ses propres souvenirs.',
    particle: 0xf44336,
  },
};

export class EndingScene extends Phaser.Scene {
  constructor() { super({ key: 'EndingScene' }); }

  init(data) {
    this._ending = data.ending || 'reset';
  }

  create() {
    const { width: W, height: H } = this.scale;
    const cx = W / 2, cy = H / 2;
    const cfg = CONTENT[this._ending] || CONTENT.reset;

    // Fond
    this.add.rectangle(cx, cy, W, H, cfg.bgColor);

    // Particules décoratives
    for (let i = 0; i < 25; i++) {
      const p = this.add.rectangle(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H * 0.8), 2, 2, cfg.particle
      );
      this.tweens.add({
        targets: p, alpha: { from: 0.1, to: 0.9 },
        duration: Phaser.Math.Between(600, 2000), yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 1500),
      });
    }

    // Titre — fade in
    const title = this.add.text(cx, cy - 110, cfg.title, {
      fontFamily: 'monospace', fontSize: '30px',
      color: cfg.accent, stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 900, delay: 400 });

    // Corps
    const body = this.add.text(cx, cy - 30, cfg.body, {
      fontFamily: 'monospace', fontSize: '16px',
      color: '#eceff1', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: body, alpha: 1, duration: 900, delay: 1000 });

    // Bouton menu
    const btn = this.add.text(cx, cy + 100, '▶   RETOUR AU MENU', {
      fontFamily: 'monospace', fontSize: '20px',
      color: '#ffffff', backgroundColor: cfg.accent,
      padding: { x: 22, y: 10 },
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ color: '#000' }));
    btn.on('pointerout',  () => btn.setStyle({ color: '#fff' }));
    btn.on('pointerdown', () => this.scene.start('MenuScene'));
    this.tweens.add({ targets: btn, alpha: 1, duration: 700, delay: 2200 });

    // Raccourci clavier (après délai)
    this.time.delayedCall(2500, () => {
      this.input.keyboard.once('keydown', () => this.scene.start('MenuScene'));
    });
  }
}
