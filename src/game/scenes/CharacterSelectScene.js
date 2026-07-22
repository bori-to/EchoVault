import Phaser from 'phaser';
import { audio } from '../systems/AudioManager.js';
import { getCharacters, getSelectedCharacter, selectCharacter } from '../systems/CharacterManager.js';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'CharacterSelectScene' }); }

  create() {
    this._locked = false;
    this._characters = getCharacters();
    this._index = Math.max(0, this._characters.findIndex(c => c.id === getSelectedCharacter().id));
    const { width: W, height: H } = this.scale;

    this.add.rectangle(W / 2, H / 2, W, H, 0x02050b);
    this.add.tileSprite(W / 2, H / 2, W, H, 'bg-brick').setAlpha(0.34);
    this.add.text(W / 2, 36, 'CHOISISSEZ VOTRE UNITÉ', {
      fontFamily: 'monospace', fontSize: '27px', color: '#e9fbff', fontStyle: 'bold', letterSpacing: 3,
    }).setOrigin(0.5);
    this.add.text(W / 2, 70, 'Chaque unité possède ses propres forces et faiblesses', {
      fontFamily: 'monospace', fontSize: '11px', color: '#607d8b',
    }).setOrigin(0.5);

    const cardGap = 196;
    const cardsCenter = (this._characters.length - 1) / 2;
    this._cards = this._characters.map((character, index) =>
      this._makeCard(W / 2 + (index - cardsCenter) * cardGap, 242, character, index));
    this._hint = this.add.text(W / 2, 453, '← → CHOISIR     ENTRÉE CONFIRMER     ÉCHAP RETOUR', {
      fontFamily: 'monospace', fontSize: '10px', color: '#546e7a',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-LEFT', () => this._move(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this._move(1));
    this.input.keyboard.on('keydown-ENTER', () => this._confirm());
    this.input.keyboard.on('keydown-SPACE', () => this._confirm());
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));
    this._refresh();
    this.cameras.main.fadeIn(300);
  }

  _makeCard(x, y, character, index) {
    const bg = this.add.rectangle(x, y, 178, 324, 0x07101a, 0.95)
      .setStrokeStyle(1, 0x29434e, 0.8).setInteractive({ useHandCursor: true });
    const portraitBack = this.add.circle(x, y - 92, 43, character.tint, 0.09)
      .setStrokeStyle(1, character.tint, 0.55);
    const portrait = this.add.image(x, y - 91, 'aria-sheet', 0).setScale(1.65).setTint(character.tint);
    if (portrait.postFX) portrait.postFX.addGlow(character.tint, 3, 0);
    const name = this.add.text(x, y - 34, character.name, {
      fontFamily: 'monospace', fontSize: '19px', color: character.accent, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(x, y - 9, character.role, {
      fontFamily: 'monospace', fontSize: '9px', color: '#90a4ae', letterSpacing: 2,
    }).setOrigin(0.5);
    this.add.text(x, y + 17, character.description, {
      fontFamily: 'monospace', fontSize: '9px', color: '#78909c', align: 'center',
      wordWrap: { width: 150 }, lineSpacing: 3,
    }).setOrigin(0.5, 0);
    this.add.text(x, y + 67, `ARME // ${character.weapon.name}`, {
      fontFamily: 'monospace', fontSize: '8px', color: character.accent, align: 'center',
      wordWrap: { width: 152 },
    }).setOrigin(0.5);

    const s = character.stats;
    const values = [s.hp / 5, s.speed / 250, Math.abs(s.jumpVelocity) / 445,
      character.weapon.power];
    ['VIE', 'VITESSE', 'SAUT', 'PUISSANCE'].forEach((label, row) => {
      const sy = y + 91 + row * 22;
      this.add.text(x - 72, sy, label, { fontFamily: 'monospace', fontSize: '8px', color: '#607d8b' }).setOrigin(0, 0.5);
      this.add.rectangle(x + 17, sy, 66, 5, 0x14232c).setOrigin(0, 0.5);
      this.add.rectangle(x + 17, sy, 66 * Phaser.Math.Clamp(values[row], 0.18, 1), 5, character.tint)
        .setOrigin(0, 0.5);
    });

    bg.on('pointerover', () => { this._index = index; this._refresh(); })
      .on('pointerdown', () => { this._index = index; this._confirm(); });
    return { bg, portraitBack, portrait, name, character };
  }

  _move(direction) {
    this._index = Phaser.Math.Wrap(this._index + direction, 0, this._characters.length);
    audio.play('ui');
    this._refresh();
  }

  _refresh() {
    this._cards.forEach((card, index) => {
      const selected = index === this._index;
      card.bg.setStrokeStyle(selected ? 3 : 1, selected ? card.character.tint : 0x29434e, selected ? 1 : 0.8);
      card.bg.setFillStyle(selected ? 0x10232d : 0x07101a, selected ? 1 : 0.95);
      card.portrait.setScale(selected ? 1.85 : 1.65);
      card.portraitBack.setAlpha(selected ? 1 : 0.62);
      card.name.setAlpha(selected ? 1 : 0.68);
    });
  }

  _confirm() {
    if (this._locked) return;
    this._locked = true;
    selectCharacter(this._characters[this._index].id);
    audio.play('power');
    this.cameras.main.fadeOut(350);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('CinematicScene'));
  }
}
