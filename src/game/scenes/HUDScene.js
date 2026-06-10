/**
 * HUDScene — overlay transparent affiché en parallèle de GameScene.
 * Montre les pouvoirs débloqués et un rappel des contrôles.
 */
import Phaser from 'phaser';

export class HUDScene extends Phaser.Scene {
  constructor() { super({ key: 'HUDScene' }); }

  init(data) {
    this._pm  = data.pm;
    this._gsm = data.gsm;
  }

  create() {
    const { width: W } = this.scale;

    // Rappel des contrôles (en bas)
    this.add.text(W / 2, 488, '← → Déplacer  |  ESPACE Sauter  |  E Interagir  |  1/2 Choisir', {
      fontFamily: 'monospace', fontSize: '10px', color: '#263238',
    }).setOrigin(0.5, 1);

    // Label Pouvoirs
    this.add.text(10, 10, 'POUVOIRS :', {
      fontFamily: 'monospace', fontSize: '11px', color: '#455a64',
    });

    this._powerLabel = this.add.text(10, 24, 'Aucun', {
      fontFamily: 'monospace', fontSize: '12px', color: '#78909c',
    });

    // Écoute les événements de la GameScene
    const game = this.scene.get('GameScene');
    game.events.on('powerUnlocked', this._onPowerUnlocked, this);
  }

  _onPowerUnlocked(powerName) {
    const labels = { doubleJump: '⚡ Double Saut' };
    const all = this._pm.getAll().map(p => labels[p] || p);
    this._powerLabel.setText(all.join(', ')).setStyle({ color: '#ffd600' });
  }
}
