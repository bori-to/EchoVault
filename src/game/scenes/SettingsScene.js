import Phaser from 'phaser';
import { settings } from '../systems/SettingsManager.js';
import { audio } from '../systems/AudioManager.js';
import { voice } from '../systems/VoiceManager.js';

export class SettingsScene extends Phaser.Scene {
  constructor() { super({ key: 'SettingsScene' }); }

  init(data) { this._fromGame = data?.from === 'game'; }

  create() {
    const { width: W, height: H } = this.scale;
    const cx = W / 2;
    this.add.rectangle(W / 2, H / 2, W, H, 0x03050b);
    this.add.tileSprite(W / 2, H / 2, W, H, 'bg-brick').setAlpha(0.35);
    this.add.rectangle(W / 2, H / 2, 540, 470, 0x060b16, 0.96).setStrokeStyle(2, 0x00b8d4, 0.7);
    this.add.text(W / 2, 74, 'PARAMÈTRES', {
      fontFamily: 'monospace', fontSize: '30px', color: '#80deea', stroke: '#00151b', strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(W / 2, 108, 'CONFIGURATION DU SYSTÈME ARIA', {
      fontFamily: 'monospace', fontSize: '10px', color: '#546e7a', letterSpacing: 2,
    }).setOrigin(0.5);

    this._volumeText = this._row(130, 'VOLUME DES EFFETS', () => this._volumeLabel());
    this._smallButton(cx + 155, 130, '−', () => this._changeVolume(-0.1));
    this._smallButton(cx + 205, 130, '+', () => this._changeVolume(0.1));
    this._muteText = this._row(180, 'SON', () => settings.get('muted') ? 'MUET' : 'ACTIF', () => {
      settings.set('muted', !settings.get('muted')); this._refresh(); audio.play('ui');
    });
    this._voiceText = this._row(230, 'VOIX FRANÇAISES', () => settings.get('voiceEnabled') ? 'ACTIVES' : 'DÉSACTIVÉES', () => {
      const enabled = !settings.get('voiceEnabled');
      settings.set('voiceEnabled', enabled); this._refresh();
      if (enabled) voice.speak('Voix françaises activées.', { persona: 'system' });
      else voice.stop();
      audio.play('ui');
    });
    this._guidanceText = this._row(280, 'VOIX DES OBJECTIFS', () => settings.get('guidanceVoiceEnabled') ? 'ACTIVE' : 'DÉSACTIVÉE', () => {
      const enabled = !settings.get('guidanceVoiceEnabled');
      settings.set('guidanceVoiceEnabled', enabled); this._refresh();
      if (enabled) voice.speak('Guidage vocal activé.', { persona: 'system', category: 'guidance' });
      else voice.stop();
      audio.play('ui');
    });
    this._shakeText = this._row(330, 'SECOUSSES ÉCRAN', () => settings.get('screenShake') ? 'ACTIVES' : 'DÉSACTIVÉES', () => {
      settings.set('screenShake', !settings.get('screenShake')); this._refresh(); audio.play('ui');
    });
    this._bossTestText = this._row(375, 'PORTAIL TEST DU BOSS', () => settings.get('bossTestTeleporter') ? 'VISIBLE' : 'MASQUÉ', () => {
      settings.set('bossTestTeleporter', !settings.get('bossTestTeleporter'));
      this._refresh(); audio.play('ui');
    });

    this._button(W / 2, 415, 'RÉTABLIR PAR DÉFAUT', () => { settings.reset(); this._refresh(); audio.play('power'); });
    this._button(W / 2, 454, this._fromGame ? 'REPRENDRE LA PARTIE' : 'RETOUR AU MENU', () => this._back(), true);
    this.add.text(W / 2, 487, '[ÉCHAP] Retour', { fontFamily: 'monospace', fontSize: '10px', color: '#37474f' }).setOrigin(0.5);
    this.input.keyboard.on('keydown-ESC', () => this._back());
    this.cameras.main.fadeIn(220);

    // Cette scène est maintenant active et visible : on peut suspendre sans
    // risque les scènes de jeu situées derrière elle.
    if (this._fromGame) {
      this.scene.pause('GameScene');
      this.scene.pause('HUDScene');
      this.scene.bringToTop();
    }
  }

  _volumeLabel() {
    const bars = Math.round(settings.get('volume') * 10);
    return `${'■'.repeat(bars)}${'□'.repeat(10 - bars)}  ${bars * 10}%`;
  }

  _row(y, label, value, action = null) {
    const cx = this.scale.width / 2;
    const bg = this.add.rectangle(cx, y, 460, 40, 0x0b1420, 0.62)
      .setStrokeStyle(1, 0x1b3440, 0.65);
    this.add.text(cx - 210, y, label, {
      fontFamily: 'monospace', fontSize: '13px', color: '#90a4ae',
    }).setOrigin(0, 0.5);
    const txt = this.add.text(cx + 95, y, value(), {
      fontFamily: 'monospace', fontSize: '13px', color: '#00e5ff',
    }).setOrigin(1, 0.5);
    if (action) {
      bg.setInteractive({ useHandCursor: true })
        .on('pointerover', () => bg.setFillStyle(0x10303a, 0.82))
        .on('pointerout', () => bg.setFillStyle(0x0b1420, 0.62))
        .on('pointerdown', action);
      txt.setInteractive({ useHandCursor: true }).on('pointerdown', action);
    }
    txt._value = value;
    return txt;
  }

  _smallButton(x, y, label, action) {
    const b = this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '20px', color: '#fff', backgroundColor: '#12313b', padding: { x: 10, y: 3 } })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    b.on('pointerover', () => b.setStyle({ backgroundColor: '#006978' })).on('pointerout', () => b.setStyle({ backgroundColor: '#12313b' })).on('pointerdown', action);
  }

  _button(x, y, label, action, primary = false) {
    const b = this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '15px', color: primary ? '#001014' : '#b0bec5', backgroundColor: primary ? '#00b8d4' : '#101923', padding: { x: 22, y: 9 } })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    b.on('pointerover', () => b.setScale(1.04)).on('pointerout', () => b.setScale(1)).on('pointerdown', action);
  }

  _changeVolume(delta) {
    settings.set('volume', Phaser.Math.Clamp(Math.round((settings.get('volume') + delta) * 10) / 10, 0, 1));
    this._refresh(); audio.play('ui');
  }

  _refresh() {
    [this._volumeText, this._muteText, this._voiceText, this._guidanceText,
      this._shakeText, this._bossTestText]
      .forEach(t => t.setText(t._value()));
  }

  _back() {
    audio.play('back');
    if (this._fromGame) {
      this.scene.resume('GameScene'); this.scene.resume('HUDScene'); this.scene.stop();
    } else this.scene.start('MenuScene');
  }
}
