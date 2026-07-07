/**
 * HUDScene — overlay de jeu (HP, pouvoirs, contrôles).
 */
import Phaser from 'phaser';

export class HUDScene extends Phaser.Scene {
  constructor() { super({ key: 'HUDScene' }); }

  init(data) {
    this._pm    = data.pm;
    this._gsm   = data.gsm;
    this._getHp = data.getHp || (() => 3);
  }

  create() {
    const { width: W } = this.scale;

    // ── Barre de vie (3 cœurs) ────────────────────────────────────────────
    this.add.text(10, 10, 'HP', { fontFamily: 'monospace', fontSize: '11px', color: '#546e7a' });
    this._hearts = [];
    for (let i = 0; i < 3; i++) {
      this._hearts.push(this.add.text(34 + i * 20, 10, '♥', {
        fontFamily: 'monospace', fontSize: '16px', color: '#f44336',
      }));
    }

    // ── Pouvoirs ──────────────────────────────────────────────────────────
    this.add.text(10, 34, 'POUVOIRS', { fontFamily: 'monospace', fontSize: '10px', color: '#455a64' });
    this._powerLabel = this.add.text(10, 47, 'Aucun', {
      fontFamily: 'monospace', fontSize: '11px', color: '#78909c',
    });

    // ── Bouclier indicateur ───────────────────────────────────────────────
    this._shieldIcon = this.add.text(W - 10, 10, '🛡 PRÊT', {
      fontFamily: 'monospace', fontSize: '11px', color: '#00e5ff',
    }).setOrigin(1, 0).setVisible(false);

    // ── Fragments ─────────────────────────────────────────────────────────
    this._fragText = this.add.text(W - 10, 28, '◈ 0/5 fragments', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ce93d8',
    }).setOrigin(1, 0);

    // ── Boss HP bar (cachée jusqu'au spawn) ───────────────────────────────
    this._bossBarBg  = this.add.rectangle(W / 2, 18, 260, 10, 0x1a1a1a).setVisible(false).setDepth(25);
    this._bossBar    = this.add.rectangle(W / 2 - 130, 18, 260, 10, 0xff1744)
      .setOrigin(0, 0.5).setVisible(false).setDepth(26);
    this._bossLabel  = this.add.text(W / 2, 32, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ff5252',
    }).setOrigin(0.5).setVisible(false).setDepth(26);

    // ── Contrôles (bas) ───────────────────────────────────────────────────
    this.add.text(W / 2, 490, '←→ Bouger  ESPACE Sauter  SHIFT Dash  X Tirer(chargé)  Z Bouclier  E Parler', {
      fontFamily: 'monospace', fontSize: '9px', color: '#1e2d3a',
    }).setOrigin(0.5, 1);

    // Écoute GameScene
    const game = this.scene.get('GameScene');
    game.events.on('powerUnlocked',     this._onPowerUnlocked, this);
    game.events.on('hpChanged',         this._onHpChanged,     this);
    game.events.on('fragmentCollected', this._onFragment,      this);
    game.events.on('bossSpawned',       this._onBossSpawn,     this);
    game.events.on('shieldReady',       this._onShieldReady,   this);
    game.events.on('checkpointActivated', () => {
      const txt = this.add.text(W / 2, 80, '✓ Checkpoint', {
        fontFamily: 'monospace', fontSize: '13px', color: '#00e5ff',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(30);
      this.tweens.add({ targets: txt, alpha: 0, y: 60, duration: 1500, onComplete: () => txt.destroy() });
    });
  }

  _onPowerUnlocked(name) {
    const labels = { doubleJump: '⚡ Dbl-Saut', dash: '💨 Dash', shield: '🛡 Bouclier' };
    const all = this._pm.getAll().map(p => labels[p] || p);
    this._powerLabel.setText(all.join('  ')).setStyle({ color: '#ffd600' });
    if (name === 'shield') this._shieldIcon.setVisible(true);
  }

  _onHpChanged(hp) {
    this._hearts.forEach((h, i) => h.setStyle({ color: i < hp ? '#f44336' : '#263238' }));
    if (hp <= 1) this.tweens.add({ targets: this._hearts[0], alpha: 0, duration: 200, yoyo: true, repeat: 3 });
  }

  _onFragment(count) {
    this._fragText.setText(`◈ ${count}/5 fragments`).setStyle({ color: '#e040fb' });
    if (count >= 5) this._fragText.setStyle({ color: '#ffd600' });
  }

  _onBossSpawn({ max }) {
    this._bossMaxHp = max;
    this._bossBarBg.setVisible(true);
    this._bossBar.setVisible(true);
    this._bossLabel.setText('LE GARDIEN DE L\'ÉCHO').setVisible(true);
    const gs = this.scene.get('GameScene');
    if (gs) {
      gs.events.on('bossHit', (hp) => {
        const pct = Math.max(0, hp / max);
        this._bossBar.setScale(pct, 1);
      });
      gs.events.on('bossDefeated', () => {
        this.tweens.add({ targets: [this._bossBarBg, this._bossBar, this._bossLabel],
          alpha: 0, duration: 600, onComplete: () => {
            this._bossBarBg.setVisible(false);
            this._bossBar.setVisible(false);
            this._bossLabel.setVisible(false);
          }});
      });
    }
  }

  _onShieldReady() {
    if (this._shieldIcon.visible) {
      this._shieldIcon.setText('🛡 PRÊT').setStyle({ color: '#00e5ff' });
      this.tweens.add({ targets: this._shieldIcon, alpha: 0, duration: 120, yoyo: true, repeat: 3 });
    }
  }
}
