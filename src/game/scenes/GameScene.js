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
    this._buildAmbientParticles(W, H);
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
    // ── Couche 0 : fond absolu ────────────────────────────────────────────
    this.add.rectangle(400, 250, 800, 500, 0x04060d)
      .setScrollFactor(0).setDepth(-20);

    // ── Couche 1 : mur de briques en tuile (parallax doux) ─────────────────
    this._bgFar = this.add.tileSprite(400, 250, 800, 500, 'bg-brick')
      .setScrollFactor(0).setDepth(-18).setAlpha(0.9);

    // ── Couche 2 : lavis sombre (dégradé haut→bas) ────────────────────────
    this.add.rectangle(400, 60, 800, 140, 0x03050b, 0.75)
      .setScrollFactor(0).setDepth(-16);
    this.add.rectangle(400, 460, 800, 100, 0x030509, 0.55)
      .setScrollFactor(0).setDepth(-16);

    // ── Couche 3 : silhouettes architecturales (espace monde) ─────────────
    this._buildRuins();
  }

  _buildRuins() {
    // Colonnes de pierre tout au long du niveau
    [
      [110, 500, 18, 110], [265, 508, 14, 88],  [435, 496, 22, 132],
      [625, 504, 16, 96],  [805, 498, 20, 118], [995, 502, 18, 104],
      [1175, 495, 22, 130],[1355, 500, 16, 96], [1535, 498, 20, 114],
    ].forEach(([x, y, w, h]) => {
      this.add.rectangle(x, y,     w,     h,  0x0c1726, 0.9).setDepth(-13);
      this.add.rectangle(x, y-h/2+5, w+10, 10, 0x0c1726, 0.9).setDepth(-13);
      this.add.rectangle(x, y+h/2-3, w+14,  6, 0x0c1726, 0.9).setDepth(-13);
    });

    // Poutres horizontales
    [[380, 422, 200, 7], [775, 395, 160, 7], [1225, 412, 220, 7]].forEach(
      ([x, y, w, h]) => this.add.rectangle(x, y, w, h, 0x0e1e2e, 0.8).setDepth(-13)
    );

    // Décombres au sol
    [[165,525,28,12],[362,528,18,8],[685,526,32,10],
     [918,524,22,14],[1172,527,16,8],[1462,525,26,10]]
      .forEach(([x, y, w, h]) =>
        this.add.rectangle(x, y, w, h, 0x0e1e30, 0.7).setDepth(-11)
      );

    // Torches murales avec halo chaud
    [130, 325, 535, 735, 955, 1145, 1365, 1545].forEach(tx => {
      // Halo orange (blend additif)
      const pool = this.add.ellipse(tx, 490, 72, 48, 0xff8f00, 0.09)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(-12);
      this.tweens.add({
        targets: pool,
        alpha: { from: 0.04, to: 0.15 },
        duration: Phaser.Math.Between(700, 1600),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 1200),
      });
      // Corps de la torche
      this.add.rectangle(tx, 482, 4, 14, 0x6d4c41).setDepth(-11);
      this.add.rectangle(tx, 473, 8, 10, 0xef6c00).setDepth(-11);
      this.add.rectangle(tx, 471, 5,  7, 0xffc107).setDepth(-11);
      this.add.rectangle(tx, 470, 3,  4, 0xfff8e1).setDepth(-11);
    });
  }

  _buildLevel() {
    this._platforms = this.physics.add.staticGroup();

    // Sol (texture pleine largeur 1600×40 — pas de setScale)
    this._platforms.create(800, 540, 'ground').refreshBody();

    // Plateformes avec sous-lueur teal
    PLATFORM_DATA.forEach(([x, y, sx]) => {
      this._platforms.create(x, y, 'platform').setScale(sx, 1).refreshBody();
      // Underlight (blend additif)
      this.add.rectangle(x, y + 11, 100 * sx + 8, 5, 0x00e5ff, 0.14)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(0);
      this.add.rectangle(x, y + 16, 100 * sx - 12, 3, 0x00b8d4, 0.06)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(0);
    });
  }

  _buildPlayer() {
    this._player = this.physics.add.sprite(80, 470, 'aria-sheet', 0);
    this._player.setCollideWorldBounds(true);
    this._player.body.setSize(24, 42);
    this._player.body.setOffset(4, 4);
    this._player.play('aria-idle');
    if (this._player.postFX) this._player.postFX.addGlow(0x00b8d4, 2, 0);
  }

  _buildObjects() {
    // ── Cristal (P2, y=370→top=362, cristal h=28→center=348) ─────────────
    this._crystal = this.physics.add.staticImage(380, 348, 'crystal');
    this.tweens.add({ targets: this._crystal, y: '+=8', duration: 800, yoyo: true, repeat: -1 });
    if (this._crystal.postFX) {
      const cg = this._crystal.postFX.addGlow(0x00e5ff, 3, 0);
      this.tweens.add({
        targets: cg, outerStrength: { from: 2, to: 8 },
        duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // ── NPC Oracle (P4, y=370→top=362, npc h=48→center=338) ───────────────
    this._npc = this.physics.add.staticImage(760, 338, 'npc');
    this.add.text(760, 298, "L'Oracle", {
      fontFamily: 'monospace', fontSize: '12px',
      color: '#ce93d8', stroke: '#06020e', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5);
    if (this._npc.postFX) this._npc.postFX.addGlow(0xce93d8, 3, 0);

    // ── Porte A (P7, y=290→top=282, exit h=70→center=247) ─────────────────
    this._exitA = this.physics.add.staticImage(1320, 247, 'exit-a');
    this.add.text(1320, 204, 'FIN A\n[Gardienne]', {
      fontFamily: 'monospace', fontSize: '10px', color: '#81c784',
      align: 'center', stroke: '#030a04', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5);
    if (this._exitA.postFX) {
      const gA = this._exitA.postFX.addGlow(0x4caf50, 4, 0);
      this.tweens.add({ targets: gA, outerStrength: { from: 2, to: 7 },
        duration: 1400, yoyo: true, repeat: -1 });
    }

    // ── Porte B (sol, top=520, exit h=70→center=485) ─────────────────────
    this._exitB = this.physics.add.staticImage(1540, 485, 'exit-b');
    this.add.text(1540, 442, 'FIN B\n[Reset]', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ef9a9a',
      align: 'center', stroke: '#0a0202', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5);
    if (this._exitB.postFX) {
      const gB = this._exitB.postFX.addGlow(0xf44336, 4, 0);
      this.tweens.add({ targets: gB, outerStrength: { from: 2, to: 7 },
        duration: 1600, yoyo: true, repeat: -1 });
    }
  }

  _buildAmbientParticles(W, H) {
    // Particules de poussière flottante (blend additif)
    this.add.particles(W / 2, H / 2, 'particle', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-W/2, -H/2+60, W, H-120) },
      quantity:  1,
      frequency: 380,
      lifespan:  { min: 5000, max: 9000 },
      alpha:     { start: 0.7, end: 0 },
      scale:     { min: 0.3,  max: 0.9 },
      speedX:    { min: -6,   max: 6   },
      speedY:    { min: -18,  max: -3  },
      gravityY:  0,
      tint:      [0x80deea, 0xb39ddb, 0x4fc3f7, 0x80cbc4],
      blendMode: Phaser.BlendModes.ADD,
    }).setDepth(-5);
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

    // Parallax fond (défilement lent)
    if (this._bgFar) {
      this._bgFar.tilePositionX = this.cameras.main.scrollX * 0.15;
    }

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
