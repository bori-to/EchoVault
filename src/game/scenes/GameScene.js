/**
 * GameScene — scène de jeu principale d'EchoVault.
 *
 * Niveau prototype (Livrable 2) :
 *   - Sol plat + 8 plateformes flottantes
 *   - Cristal de pouvoir → double saut débloqué
 *   - NPC Oracle avec dialogue binaire (faire confiance / refuser)
 *   - Deux sorties : Fin A (Gardienne, haute), Fin B (Reset, sol)
 *   - Respawn si chute hors-monde
 *
 * GÉNÉRÉ avec GitHub Copilot (Claude Sonnet 4.x) — revu et adapté manuellement.
 */
import Phaser from 'phaser';
import { PlayerController } from '../systems/PlayerController.js';
import { PowerManager }      from '../systems/PowerManager.js';
import { GameStateManager }  from '../systems/GameStateManager.js';
import { DialogueManager }   from '../systems/DialogueManager.js';

// Disposition des plateformes [center_x, center_y, scale_x]
const PLATFORM_DATA = [
  [200,  440, 1.6],   // P1
  [380,  370, 1.6],   // P2 — cristal dessus
  [560,  440, 1.6],   // P3
  [760,  370, 2.0],   // P4 — Oracle
  [960,  440, 1.6],   // P5
  [1140, 370, 1.6],   // P6
  [1320, 290, 1.6],   // P7 — haute (double saut utile)
  [1500, 430, 1.6],   // P8
];

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  // ─── Initialisation ────────────────────────────────────────────────────────

  init() {
    this._pm  = new PowerManager();   this._pm.reset();
    this._gsm = new GameStateManager();
    this._npcDone  = false;
    this._gameOver = false;
  }

  create() {
    const W = 1600, H = 560;
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);

    this._buildBackground(W, H);
    this._buildLevel();
    this._buildPlayer();
    this._buildObjects();
    this._setupCollisions();

    // Systèmes
    this._ctrl   = new PlayerController(this, this._player);
    this._dlgMgr = new DialogueManager(this, this._gsm);

    // Caméra suit le joueur
    this.cameras.main.startFollow(this._player, true, 0.1, 0.1);
    this.cameras.main.fadeIn(500);

    // Touche interaction
    this._eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Indicateur flottant [E]
    this._indicator = this.add.image(0, 0, 'indicator').setVisible(false).setDepth(10);

    // Lancement du HUD en scène parallèle
    this.scene.launch('HUDScene', { pm: this._pm, gsm: this._gsm });

    // Points de respawn
    this._spawnX = 80;
    this._spawnY = 470;
  }

  // ─── Construction du niveau ────────────────────────────────────────────────

  _buildBackground(W, H) {
    this.add.rectangle(W / 2, H / 2, W, H, 0x07070f).setDepth(-10);
    // Colonnes de ruines en arrière-plan
    [[180, 490, 50, 90], [500, 500, 35, 70], [830, 480, 65, 110],
     [1100, 495, 45, 75], [1380, 500, 55, 80]].forEach(([x, y, w, h]) => {
      this.add.rectangle(x, y, w, h, 0x0d1a26).setDepth(-5);
    });
  }

  _buildLevel() {
    this._platforms = this.physics.add.staticGroup();

    // Sol complet
    this._platforms.create(800, 540, 'ground').setScale(16, 1).refreshBody();

    // Plateformes flottantes
    PLATFORM_DATA.forEach(([x, y, sx]) => {
      this._platforms.create(x, y, 'platform').setScale(sx, 1).refreshBody();
    });
  }

  _buildPlayer() {
    this._player = this.physics.add.sprite(80, 470, 'player');
    this._player.setCollideWorldBounds(true);
    this._player.body.setSize(26, 44);  // hitbox légèrement réduite
  }

  _buildObjects() {
    // Cristal — positionné au-dessus de P2 (center y=370, top=362, cristal h=20 → y=352)
    this._crystal = this.physics.add.staticImage(380, 352, 'crystal');
    // Animé en oscillation verticale
    this.tweens.add({ targets: this._crystal, y: '+=8', duration: 800, yoyo: true, repeat: -1 });

    // NPC Oracle — P4 (y=370, top=362, npc h=44 → y=340)
    this._npc = this.physics.add.staticImage(760, 340, 'npc');
    this.add.text(760, 300, "L'Oracle", {
      fontFamily: 'monospace', fontSize: '12px',
      color: '#ce93d8', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5);

    // Porte A — P7 (y=290, top=282, exit h=60 → y=252)
    this._exitA = this.physics.add.staticImage(1320, 252, 'exit-a');
    this.add.text(1320, 212, 'FIN A\n[Gardienne]', {
      fontFamily: 'monospace', fontSize: '10px', color: '#81c784',
      align: 'center', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(5);

    // Porte B — sol (top=520, exit h=60 → y=490)
    this._exitB = this.physics.add.staticImage(1540, 490, 'exit-b');
    this.add.text(1540, 450, 'FIN B\n[Reset]', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ef9a9a',
      align: 'center', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(5);
  }

  _setupCollisions() {
    this.physics.add.collider(this._player, this._platforms);
    this.physics.add.overlap(this._player, this._crystal, this._onCrystal,  null, this);
    this.physics.add.overlap(this._player, this._exitA,   this._onExitA,    null, this);
    this.physics.add.overlap(this._player, this._exitB,   this._onExitB,    null, this);
  }

  // ─── Callbacks de collision ────────────────────────────────────────────────

  _onCrystal() {
    if (this._pm.hasUnlocked('doubleJump')) return;
    this._pm.unlock('doubleJump');
    this._ctrl.enableDoubleJump();
    this._crystal.destroy();
    this.events.emit('powerUnlocked', 'doubleJump');
    this._floatMessage('⚡ Double Saut débloqué !', '#ffd600');
  }

  _onExitA() {
    if (!this._gameOver) this._triggerEnding('guardian');
  }

  _onExitB() {
    if (!this._gameOver) this._triggerEnding('reset');
  }

  _triggerEnding(ending) {
    this._gameOver = true;
    this._ctrl.setEnabled(false);
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('HUDScene');
      this.scene.start('EndingScene', { ending });
    });
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  update() {
    if (this._gameOver) return;

    // Désactiver le mouvement pendant un dialogue
    this._ctrl.setEnabled(!this._dlgMgr.isActive);
    this._ctrl.update();
    this._dlgMgr.update();

    // Proximité NPC
    const dist = Phaser.Math.Distance.Between(
      this._player.x, this._player.y, this._npc.x, this._npc.y
    );
    const nearNPC = dist < 85 && !this._npcDone && !this._dlgMgr.isActive;

    this._indicator.setVisible(nearNPC);
    if (nearNPC) this._indicator.setPosition(this._npc.x, this._npc.y - 65);

    if (nearNPC && Phaser.Input.Keyboard.JustDown(this._eKey)) {
      this._startOracleDialogue();
    }

    // Respawn si le joueur tombe sous le sol
    if (this._player.y > 580) {
      this._player.setPosition(this._spawnX, this._spawnY);
      this._player.setVelocity(0, 0);
    }
  }

  // ─── Dialogue Oracle ───────────────────────────────────────────────────────

  _startOracleDialogue() {
    const data = {
      name: "L'Oracle",
      nodes: [
        {
          id: 'start',
          text: 'Fragment mémoriel #3 détecté.\nARIA... tu te souviens de moi ?',
          choices: [
            {
              label: 'Oui, quelque chose me revient...',
              next: 'remember',
              effect: { decision: 'trust_oracle', value: true },
            },
            {
              label: 'Non. Je ne te connais pas.',
              next: 'forget',
              effect: { decision: 'trust_oracle', value: false },
            },
          ],
        },
        {
          id: 'remember',
          text: 'Bien. Tu sais ce que tu dois protéger.\nLa chambre haute t\'attend. Va, Gardienne.',
          choices: [],
        },
        {
          id: 'forget',
          text: 'C\'est normal. La mémoire efface ce qui fait mal.\nChoisir l\'oubli est aussi une liberté.',
          choices: [],
        },
      ],
    };

    this._dlgMgr.startDialogue(data, () => {
      this._npcDone = true;
      const isGuardian = this._gsm.getEnding() === 'guardian';
      this._floatMessage(
        isGuardian ? '→ Rejoins la Chambre Haute (Fin A)' : '→ Sortie de Secours disponible (Fin B)',
        isGuardian ? '#81c784' : '#ef9a9a'
      );
    });
  }

  // ─── Utilitaires ───────────────────────────────────────────────────────────

  _floatMessage(text, color) {
    const msg = this.add.text(this._player.x, this._player.y - 60, text, {
      fontFamily: 'monospace', fontSize: '13px',
      color, stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: msg, y: msg.y - 45, alpha: 0, duration: 2200,
      onComplete: () => msg.destroy() });
  }
}
