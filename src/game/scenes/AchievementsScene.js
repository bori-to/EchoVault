import Phaser from 'phaser';
import { audio } from '../systems/AudioManager.js';
import { ACHIEVEMENTS, achievements } from '../systems/AchievementManager.js';

export class AchievementsScene extends Phaser.Scene {
  constructor() { super({ key: 'AchievementsScene' }); }

  init(data) { this._fromGame = data?.from === 'game'; }

  create() {
    const { width: W, height: H } = this.scale;
    // Depuis le menu de pause, GameScene et HUDScene restent visibles mais
    // suspendues. L'arbre doit donc explicitement passer devant ces scènes.
    this.scene.bringToTop();
    this.add.rectangle(W / 2, H / 2, W, H, 0x02050b);
    this.add.tileSprite(W / 2, H / 2, W, H, 'bg-brick').setAlpha(0.28);
    this.add.text(W / 2, 24, 'ARBRE DES SUCCÈS', {
      fontFamily: 'monospace', fontSize: '25px', color: '#e9fbff', fontStyle: 'bold', letterSpacing: 3,
    }).setOrigin(0.5).setResolution(2);
    this.add.text(W / 2, 53, `${achievements.getUnlockedCount()} / ${achievements.getTotal()} DÉBLOQUÉS`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#00e5ff', letterSpacing: 2,
    }).setOrigin(0.5).setResolution(2);

    const positions = new Map();
    ACHIEVEMENTS.forEach(item => positions.set(item.id, this._position(item)));
    ACHIEVEMENTS.filter(item => item.parent).forEach(item => {
      const from = positions.get(item.parent);
      const to = positions.get(item.id);
      const active = achievements.isUnlocked(item.id);
      const line = this.add.graphics().setDepth(1);
      line.lineStyle(active ? 2 : 1, active ? 0x00e5ff : 0x263238, active ? 0.72 : 0.55);
      line.beginPath(); line.moveTo(from.x, from.y + 27); line.lineTo(to.x, to.y - 27); line.strokePath();
    });
    ACHIEVEMENTS.forEach(item => this._node(item, positions.get(item.id)));

    const backLabel = this._fromGame ? '← RETOUR AUX PARAMÈTRES' : '← RETOUR AU MENU';
    const back = this.add.text(W / 2, H - 20, backLabel, {
      fontFamily: 'monospace', fontSize: '11px', color: '#90a4ae',
      backgroundColor: '#0b1621', padding: { x: 16, y: 7 },
    }).setOrigin(0.5).setResolution(2).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setStyle({ color: '#00e5ff' }))
      .on('pointerout', () => back.setStyle({ color: '#90a4ae' }))
      .on('pointerdown', () => this._back());
    this.input.keyboard.on('keydown-ESC', () => this._back());
    this.cameras.main.fadeIn(300);
  }

  _position(item) {
    const W = this.scale.width;
    if (item.row === 0) return { x: W / 2, y: 91 };

    // EXPAND peut rendre la zone logique bien plus large que 800 px.
    // Répartir les quatre branches sur toute la largeur conserve un arbre
    // réellement centré, quel que soit le ratio de l'écran.
    const margin = Math.max(95, W * 0.10);
    const columnGap = (W - margin * 2) / 3;
    return { x: margin + item.column * columnGap, y: 154 + (item.row - 1) * 72 };
  }

  _node(item, pos) {
    const unlocked = achievements.isUnlocked(item.id);
    const color = unlocked ? 0x00e5ff : 0x37474f;
    const bg = this.add.rectangle(pos.x, pos.y, 170, 58, unlocked ? 0x0b2931 : 0x07101a, 0.98)
      .setStrokeStyle(unlocked ? 2 : 1, unlocked ? color : 0x546e7a, unlocked ? 0.95 : 0.82).setDepth(3);
    this.add.text(pos.x, pos.y - 11, unlocked ? `◆ ${item.title}` : `◇ ${item.title}`, {
      fontFamily: 'monospace', fontSize: '10px', color: unlocked ? '#b9fbff' : '#90a4ae',
      fontStyle: unlocked ? 'bold' : 'normal',
    }).setOrigin(0.5).setDepth(4).setResolution(2);
    this.add.text(pos.x, pos.y + 11, item.description, {
      fontFamily: 'monospace', fontSize: '9px', color: unlocked ? '#d7e6e9' : '#78909c',
      align: 'center', wordWrap: { width: 158 }, lineSpacing: 1,
    }).setOrigin(0.5).setDepth(4).setResolution(2);
    if (unlocked) {
      const glow = this.add.circle(pos.x, pos.y, 30, 0x00e5ff, 0.035).setDepth(2);
      this.tweens.add({ targets: glow, scale: 1.8, alpha: 0.08, duration: 1800, yoyo: true, repeat: -1 });
    }
    return bg;
  }

  _back() {
    audio.play('back');
    this.scene.start(this._fromGame ? 'SettingsScene' : 'MenuScene',
      this._fromGame ? { from: 'game' } : undefined);
  }
}
