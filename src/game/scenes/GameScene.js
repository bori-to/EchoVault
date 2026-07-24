/**
 * GameScene — niveau principal d'EchoVault (Livrable 2 enrichi).
 *
 * Carte 6400×560 px — campagne narrative en 8 actes (≈ 60 minutes).
 * Le chemin critique est verrouillé par les souvenirs et les dialogues :
 * il n'est plus possible de courir directement jusqu'à la fin.
 *
 * Mécaniques :
 *   - Saut + double saut (cristal Biome 0)
 *   - Dash (power-up Biome 1)
 *   - Tir laser touche X
 *   - 3 HP joueur, clignotement + invincibilité 1.2s après dégâts
 *   - Oracle (NPC, Biome 0) -> décision narrative
 *   - SIBYL (bot d'énigme) -> analyse locale des réponses libres
 *   - Deux parcours de fin exclusifs : relais supérieur ou noyau inférieur
 */
import Phaser from 'phaser';
import { PlayerController } from '../systems/PlayerController.js';
import { PowerManager }     from '../systems/PowerManager.js';
import { GameStateManager } from '../systems/GameStateManager.js';
import { DialogueManager }  from '../systems/DialogueManager.js';
import { EnemyManager }     from '../systems/EnemyManager.js';
import { BossManager }      from '../systems/BossManager.js';
import { audio }            from '../systems/AudioManager.js';
import { settings }         from '../systems/SettingsManager.js';
import { voice }            from '../systems/VoiceManager.js';
import { getSelectedCharacter } from '../systems/CharacterManager.js';
import { achievements } from '../systems/AchievementManager.js';
import { evaluateRiddleAnswer, getRiddleHint, SIBYL_RIDDLES } from '../systems/RiddleAI.js';
import { STORY_WITNESSES } from '../systems/CampaignDirector.js';

const PLATFORMS = [
  [160,  440, 2.0, 'platform'],
  [340,  370, 1.6, 'platform'],
  [510,  440, 1.6, 'platform'],
  [700,  370, 2.2, 'platform'],
  [880,  290, 1.6, 'platform'],
  [1000, 440, 1.4, 'platform'],
  [1140, 370, 1.6, 'platform-forge'],
  [1310, 300, 1.6, 'platform-forge'],
  [1460, 400, 1.6, 'platform-forge'],
  [1640, 330, 1.8, 'platform-forge'],
  [1820, 440, 1.4, 'platform-forge'],
  [1980, 360, 1.6, 'platform-forge'],
  [2100, 270, 1.4, 'platform-forge'],
  [2260, 440, 1.6, 'platform-surface'],
  [2420, 360, 1.8, 'platform-surface'],
  [2580, 280, 1.6, 'platform-surface'],
  [2740, 400, 1.6, 'platform-surface'],
  [2900, 320, 1.6, 'platform-surface'],
  [3060, 440, 1.8, 'platform-surface'],
  [3260, 350, 1.8, 'platform-forge'],
  [3460, 270, 1.5, 'platform-forge'],
  [3650, 410, 1.8, 'platform-forge'],
  [3860, 325, 1.6, 'platform-forge'],
  [4050, 245, 1.5, 'platform-forge'],
  [4240, 410, 1.8, 'platform-surface'],
  [4440, 320, 1.5, 'platform-surface'],
  [4620, 235, 1.4, 'platform-surface'],
  [4820, 400, 1.8, 'platform-surface'],
  [5020, 310, 1.7, 'platform-surface'],
  [5220, 420, 1.8, 'platform-surface'],
  [5440, 330, 1.6, 'platform-surface'],
  [5660, 430, 2.2, 'platform-surface'],
  [5920, 340, 1.8, 'platform-surface'],
  [6160, 440, 2.0, 'platform-surface'],
];

const ENEMIES = [
  ['crawler',    340, 352, 70],
  ['crawler',    700, 352, 100],
  ['crawler',    880, 272, 60],
  ['drone',     1460, 340],
  ['drone',     1820, 380],
  ['crawler',   1980, 342, 80],
  ['sentinelle',2100, 240],
  ['guardian',  2580, 244],
  ['drone',     2740, 340],
  ['guardian',  3060, 404],
  ['crawler',   3260, 332, 90],
  ['drone',     3460, 220],
  ['sentinelle',3650, 380],
  ['drone',     3860, 275],
  ['guardian',  4050, 208],
  ['crawler',   4240, 392, 100],
  ['drone',     4440, 270],
  ['guardian',  4820, 364],
  ['sentinelle',5020, 280],
  ['drone',     5220, 370],
  ['guardian',  5440, 294],
  ['crawler',   1200, 352, 85],
  ['sentinelle',1640, 290],
  ['guardian',  2260, 404],
  ['drone',     2900, 270],
  ['crawler',   3060, 422, 95],
  ['sentinelle',3860, 292],
  ['crawler',   4050, 228, 70],
  ['drone',     4620, 190],
  ['guardian',  5020, 278],
  ['sentinelle',5220, 360],
];

// Checkpoints [x, y]
const CHECKPOINTS = [
  [520,  420],
  [1320, 280],
  [2270, 420],
  [3660, 380],
  [4830, 370],
  [5480, 400],
];

// Fragments mémoire [x, y, texte lore]
const FRAGMENTS = [
  [420,  340, 'Fragment I — « Projet ARIA : préserver la mémoire humaine. »'],
  [900,  268, 'Fragment II — « La surface ne nous a pas tués. Nous l\'avons quittée. »'],
  [1200, 348, 'Fragment III — « AEGIS protégeait les convois vers la Forge. »'],
  [1640, 308, 'Fragment IV — « L\'Oracle a refusé l\'ordre d\'effacement. »'],
  [1980, 338, 'Fragment V — « Des milliers de volontaires attendaient le transfert. »'],
  [2420, 338, 'Fragment VI — « La Forge fabriquait des corps, pas des armes. »'],
  [3060, 418, 'Fragment VII — « SIBYL jugeait les souvenirs, jamais les personnes. »'],
  [3460, 248, 'Fragment VIII — « ARIA était leur première gardienne. Moi. »'],
  [3860, 303, 'Fragment IX — « K-7 conserva la liste de ceux que le Conseil condamna. »'],
  [4050, 223, 'Fragment X — « MIRA transmit un dernier message vers la surface. »'],
  [4620, 213, 'Fragment XI — « Le Gardien retient l\'Écho contre sa volonté. »'],
  [4820, 378, 'Fragment XII — « Se souvenir ne condamne pas. Cela permet de choisir. »'],
];

const MEMORY_WAVES = [
  ['crawler', 'crawler', 'drone'],
  ['drone', 'crawler', 'sentinelle'],
  ['guardian', 'drone', 'drone'],
  ['guardian', 'sentinelle', 'crawler'],
  ['sentinelle', 'drone', 'crawler'],
  ['guardian', 'sentinelle', 'drone'],
];

const WORLD_W = 6400;
const REQUIRED_FRAGMENTS = FRAGMENTS.length;

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  init() {
    this._character = getSelectedCharacter();
    this._maxHp     = this._character.stats.hp;
    this._pm  = new PowerManager();  this._pm.reset();
    this._gsm = new GameStateManager();
    this._npcDone  = false;
    this._gameOver = false;
    this._hp       = this._maxHp;
    this._invTimer = 0;
    this._exitHintCd = 0;
    this._bulletsConnected = false;
    this._meleeConnected = false;
    this._fragmentCount = 0;
    this._bossTriggered = false;
    this._bossDefeated  = false;
    this._storyStage    = 0;
    this._activeEncounter = null;
    this._enemyKills = 0;
    this._checkpointCount = 0;
    this._lastBiome = -1;
    this._endingRoute = null;
    this._endingRouteReady = false;
    this._endingRouteEnemies = [];
    this._riddleActive = false;
    this._riddleAttempts = 0;
    this._riddlePanel = null;
  }

  create() {
    this._runStartedAt = Date.now();
    const W = WORLD_W, H = 560;
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);

    this._buildBackground(W, H);
    this._buildDecoration(W, H);
    this._buildLevel();
    this._buildPlayer();
    this._buildObjects();
    this._buildEnemies();
    this._buildCheckpoints();
    this._buildFragments();
    this._buildBoss();
    this._buildStoryGates();
    this._buildAmbientParticles(W, H);
    this._setupCollisions();

    this._ctrl   = new PlayerController(this, this._player, this._character);
    this._dlgMgr = new DialogueManager(this, this._gsm);

    this.cameras.main.startFollow(this._player, true, 0.12, 0.12);
    this.cameras.main.fadeIn(500);

    this._eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._indicator = this.add.image(0, 0, 'indicator').setVisible(false).setDepth(15);
    this._buildBossTestPortal();

    this.scene.launch('HUDScene', {
      pm: this._pm, gsm: this._gsm, getHp: () => this._hp,
      fragmentTotal: REQUIRED_FRAGMENTS,
      maxHp: this._maxHp,
      character: this._character,
    });
    this._spawnX = 80; this._spawnY = 460;
    this.events.on('enemyDefeated', () => {
      this._enemyKills++;
      this._unlockAchievement('first_blood');
      if (this._enemyKills >= 10) this._unlockAchievement('hunter');
    });
    this.events.on('fragmentCollected', count => {
      if (count >= 1) this._unlockAchievement('memory_one');
      if (count >= 4) this._unlockAchievement('memory_four');
      if (count >= REQUIRED_FRAGMENTS) this._unlockAchievement('archivist');
    });
    this.events.on('powerUnlocked', () => {
      this._unlockAchievement('first_module');
      if (this._pm.getAll().length >= 3) this._unlockAchievement('full_arsenal');
    });
    this.events.on('checkpointActivated', () => {
      this._checkpointCount++;
      if (this._checkpointCount >= 3) this._unlockAchievement('wayfinder');
    });
    this.events.on('bossPhaseChange', phase => {
      if (phase >= 2) this._unlockAchievement('phase_two');
    });
    this.time.delayedCall(500, () => this._unlockAchievement('awakening'));

    this.time.delayedCall(700, () => this._startPrologue());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this._destroyRiddleUI());
  }

  _buildBackground(W, H) {
    const viewW = this.scale.width;
    const viewH = this.scale.height;
    this.add.rectangle(viewW / 2, viewH / 2, viewW, viewH, 0x04060d).setScrollFactor(0).setDepth(-20);
    this._bgFar = [
      this.add.tileSprite(viewW / 2, viewH / 2, viewW, viewH, 'bg-brick'  ).setScrollFactor(0).setDepth(-18),
      this.add.tileSprite(viewW / 2, viewH / 2, viewW, viewH, 'bg-forge'  ).setScrollFactor(0).setDepth(-18).setAlpha(0),
      this.add.tileSprite(viewW / 2, viewH / 2, viewW, viewH, 'bg-surface').setScrollFactor(0).setDepth(-18).setAlpha(0),
    ];
    this.add.rectangle(viewW / 2,  60, viewW, 140, 0x03050b, 0.75).setScrollFactor(0).setDepth(-16);
    this.add.rectangle(viewW / 2, viewH - 40, viewW, 100, 0x030509, 0.55).setScrollFactor(0).setDepth(-16);
    this._buildRuins(W, H);
  }

  _buildDecoration(W, H) {
    const depth = -5;

    // ─── BIOME 0 — Le Coffre-Fort (x 0–1060) ────────────────────────────
    // Stalactites au plafond
    [[120,0],[280,0],[450,0],[600,0],[760,0],[900,0],[1020,0]].forEach(([x, _]) => {
      const h = 20 + ((x/10)|0) % 30;
      const s = this.add.image(x, h/2, 'deco-stalactite').setDepth(depth).setOrigin(0.5, 0);
      s.setScale(1 + (x%3)*0.3, 0.6 + (x%5)*0.15);
      s.setAlpha(0.7 + (x%4)*0.06);
      if (s.postFX) s.postFX.addGlow(0x00e5ff, 2, 0);
    });
    // Chaînes pendantes
    [[190,0],[520,0],[840,0]].forEach(([x]) => {
      for (let seg = 0; seg < 3; seg++) {
        const chain = this.add.image(x + seg*8, 30 + seg*36, 'deco-chain')
          .setDepth(depth).setAlpha(0.65).setOrigin(0.5, 0);
        this.tweens.add({ targets: chain, angle: { from: -2, to: 2 }, x: chain.x + 3,
          duration: 1800 + seg * 220, delay: seg * 100, ease: 'Sine.inOut', yoyo: true, repeat: -1 });
      }
    });
    // Lueurs de runes au sol
    [[150,504],[400,504],[680,504],[950,504]].forEach(([x, y]) => {
      const rune = this.add.ellipse(x, y, 18, 8, 0x00e5ff, 0.12).setDepth(depth)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: rune, alpha: { from: 0.06, to: 0.22 },
        duration: Phaser.Math.Between(800,1600), yoyo: true, repeat: -1 });
    });

    // ─── BIOME 1 — La Forge (x 1060–2160) ─────────────────────────────
    // Tuyaux de vapeur
    [[1100,480],[1340,470],[1580,475],[1760,480],[2000,472],[2130,478]].forEach(([x, y]) => {
      this.add.image(x, y, 'deco-pipe').setDepth(depth).setOrigin(0.5, 1).setAlpha(0.80);
      this.add.particles(x, y - 66, 'particle', {
        quantity: 1, frequency: 620, lifespan: { min: 900, max: 1500 },
        alpha: { start: 0.28, end: 0 }, scale: { start: 0.45, end: 1.5 },
        speedX: { min: -10, max: 10 }, speedY: { min: -34, max: -18 },
        tint: 0xcfd8dc,
      }).setDepth(depth);
    });
    // Flaques de lave lumineuses au sol
    [[1200,510],[1450,510],[1700,510],[1920,510]].forEach(([x, y]) => {
      const lava = this.add.ellipse(x, y, 60, 16, 0xff4400, 0.14).setDepth(depth)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: lava, alpha: { from: 0.08, to: 0.22 },
        duration: Phaser.Math.Between(400,900), yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 600) });
      // Colonne de lumière au-dessus
      this.add.rectangle(x, y - 60, 4, 120, 0xff6600, 0.06)
        .setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
    });
    // Particules étincelles
    this.add.particles(1600, 450, 'particle', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-500, -30, 1000, 30) },
      quantity: 1, frequency: 180, lifespan: { min: 800, max: 2000 },
      alpha: { start: 0.8, end: 0 }, scale: { min: 0.2, max: 0.7 },
      speedY: { min: -80, max: -20 }, speedX: { min: -15, max: 15 },
      tint: [0xff6600, 0xff9900, 0xffcc00], blendMode: Phaser.BlendModes.ADD,
    }).setDepth(depth);

    // ─── BIOME 2 — La Surface (x 2160–6400) ───────────────────────────
    // Colonnes brisées
    [[2210,480],[2480,475],[2650,480],[2870,478],[3080,480],[3160,478]].forEach(([x, y]) => {
      this.add.image(x, y, 'deco-column').setDepth(depth).setOrigin(0.5, 1)
        .setAlpha(0.75).setScale(0.9 + (x%3)*0.1, 0.8 + (x%4)*0.08);
    });
    // Touffes d’herbe sur le sol
    let grassIndex = 0;
    for (let x = 2180; x < W; x += Phaser.Math.Between(36, 62)) {
      const g = this.add.image(x, 502, 'deco-grass').setDepth(depth).setOrigin(0.5, 1);
      g.setAlpha(0.6 + Math.random()*0.3).setScale(0.8 + Math.random()*0.5, 1 + Math.random()*0.4);
      // Une touffe sur quatre est animée : même impression de vent, beaucoup
      // moins de tweens permanents lorsque la surface entière est construite.
      if (grassIndex++ % 4 === 0) {
        this.tweens.add({ targets: g, angle: { from: -2, to: 3 },
          duration: Phaser.Math.Between(1500, 2400), delay: Phaser.Math.Between(0, 900),
          ease: 'Sine.inOut', yoyo: true, repeat: -1 });
      }
    }
    // Halos de luneâ (lumiere verte froide douce)
    [[2300,80],[2600,120],[2900,80],[3150,100]].forEach(([x, y]) => {
      this.add.ellipse(x, y, 120, 40, 0x1a4020, 0.08)
        .setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
    });
    // Particules pollen / lucioles
    this.add.particles(4300, 300, 'particle', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-2100, -200, 4200, 400) },
      quantity: 1, frequency: 250, lifespan: { min: 3000, max: 6000 },
      alpha: { start: 0.5, end: 0 }, scale: { min: 0.2, max: 0.6 },
      speedX: { min: -8, max: 8 }, speedY: { min: -12, max: -4 },
      tint: [0x88ff88, 0xccffcc, 0x44ff88], blendMode: Phaser.BlendModes.ADD,
    }).setDepth(depth);
  }

  _buildRuins(W, H) {
    for (let x = 80; x < W; x += 112) {
      const h = 60 + ((x / 112 | 0) % 3) * 28;
      const biome = x < 1060 ? 0x0c1726 : x < 2160 ? 0x1a0800 : 0x0c1a08;
      this.add.rectangle(x, H, 18, h * 2,    biome, 0.9).setDepth(-13);
      this.add.rectangle(x, H - h, 28, 10,   biome, 0.9).setDepth(-13);
    }
    for (let x = 100; x < W; x += 340) {
      const biome = x < 1060 ? 0xff8f00 : x < 2160 ? 0xff4400 : 0xffcc02;
      const pool = this.add.ellipse(x, H - 42, 72, 42, biome, 0.09)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(-12);
      this.tweens.add({
        targets: pool, alpha: { from: 0.04, to: 0.16 },
        duration: Phaser.Math.Between(600, 1500), yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 1200),
      });
      this.add.rectangle(x, H - 52, 4, 14, 0x6d4c41).setDepth(-11);
      this.add.rectangle(x, H - 62, 8, 10, biome   ).setDepth(-11);
      this.add.rectangle(x, H - 65, 5,  7, 0xffc107 ).setDepth(-11);
    }
  }

  _buildLevel() {
    this._platforms = this.physics.add.staticGroup();
    this._platforms.create(WORLD_W / 2, 520, 'ground').setScale(WORLD_W / 1600, 1).refreshBody();

    PLATFORMS.forEach(([x, y, sx, tex]) => {
      this._platforms.create(x, y, tex).setScale(sx, 1).refreshBody();
      const c = tex === 'platform-forge' ? 0xff6f00 : tex === 'platform-surface' ? 0x4caf50 : 0x00e5ff;
      this.add.rectangle(x, y + 11, 100 * sx + 6, 4, c, 0.14)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(0);
    });

    [[1060, 280], [2160, 280], [3200, 280], [4300, 280]].forEach(([bx, h]) => {
      this.add.rectangle(bx, 520, 20, h * 2, 0x080e1c, 1).setDepth(-10);
      this.add.rectangle(bx, 520 - h, 30, 14, 0x101828, 1).setDepth(-10);
    });

    [
      [530,  30, '[ LE COFFRE-FORT ]', '#4fc3f7'],
      [1600, 30, '[ LA FORGE ]',       '#ff8f00'],
      [2680, 30, '[ LA SURFACE ]',     '#81c784'],
      [3740, 30, '[ ARCHIVES PROFONDES ]', '#ffb74d'],
      [4820, 30, '[ JARDIN DES ÉCHOS ]', '#80cbc4'],
      [5740, 30, '[ CHAMBRE HAUTE ]', '#ce93d8'],
    ].forEach(([x, y, label, col]) =>
      this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '11px',
        color: col, alpha: 0.55 }).setOrigin(0.5).setDepth(1)
    );
  }

  _buildPlayer() {
    this._player = this.physics.add.sprite(80, 460, 'aria-sheet', 0);
    this._player.setTint(this._character.tint);
    this._player.setCollideWorldBounds(true);
    this._player.body.setSize(24, 42).setOffset(4, 4);
    this._player.play('aria-idle');
    if (this._player.postFX) this._player.postFX.addGlow(this._character.tint, 2, 0);
  }

  _buildObjects() {
    this._crystal = this.physics.add.staticImage(340, 348, 'crystal');
    this.tweens.add({ targets: this._crystal, y: '+=7', duration: 900, yoyo: true, repeat: -1 });
    if (this._crystal.postFX) {
      const cg = this._crystal.postFX.addGlow(0x00e5ff, 3, 0);
      this.tweens.add({ targets: cg, outerStrength: { from: 2, to: 8 }, duration: 900, yoyo: true, repeat: -1 });
    }

    this._dashPowerup = this.physics.add.staticImage(1310, 280, 'powerup-dash');
    this.tweens.add({ targets: this._dashPowerup, y: '+=6', duration: 700, yoyo: true, repeat: -1 });
    if (this._dashPowerup.postFX) {
      const dg = this._dashPowerup.postFX.addGlow(0xffcc02, 4, 0);
      this.tweens.add({ targets: dg, outerStrength: { from: 2, to: 8 }, duration: 700, yoyo: true, repeat: -1 });
    }

    this._npc = this.physics.add.staticImage(700, 338, 'npc');
    this.tweens.add({ targets: this._npc, y: 334, angle: { from: -1, to: 1 },
      duration: 1400, ease: 'Sine.inOut', yoyo: true, repeat: -1 });
    this.add.text(700, 296, "L'Oracle", {
      fontFamily: 'monospace', fontSize: '12px',
      color: '#ce93d8', stroke: '#06020e', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5);
    if (this._npc.postFX) this._npc.postFX.addGlow(0xce93d8, 3, 0);

    this._exitA = this.physics.add.staticImage(6260, 250, 'exit-a');
    this._exitALabel = this.add.text(6260, 207, 'RELAIS MÉMORIEL\n[Transmettre]', {
      fontFamily: 'monospace', fontSize: '10px', color: '#81c784',
      align: 'center', stroke: '#030a04', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5).setVisible(false);
    if (this._exitA.postFX) {
      const gA = this._exitA.postFX.addGlow(0x4caf50, 4, 0);
      this.tweens.add({ targets: gA, outerStrength: { from: 2, to: 7 }, duration: 1400, yoyo: true, repeat: -1 });
    }
    this._exitA.disableBody(true, true);

    this._exitB = this.physics.add.staticImage(6260, 485, 'exit-b');
    this._exitBLabel = this.add.text(6260, 445, 'NOYAU DES ÉCHOS\n[Verrouillé]', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ef9a9a',
      align: 'center', stroke: '#0a0202', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5).setVisible(false);
    if (this._exitB.postFX) {
      const gB = this._exitB.postFX.addGlow(0xf44336, 4, 0);
      this.tweens.add({ targets: gB, outerStrength: { from: 2, to: 7 }, duration: 1600, yoyo: true, repeat: -1 });
    }
    this._exitB.disableBody(true, true);
  }

  _buildEnemies() {
    this._em = new EnemyManager(this);
    ENEMIES.forEach(([type, x, y, range]) => {
      if (type === 'crawler')         this._em.addCrawler(x, y, range);
      else if (type === 'drone')      this._em.addDrone(x, y);
      else if (type === 'guardian')   this._em.addGuardian(x, y);
      else if (type === 'sentinelle') this._em.addSentinelle(x, y);
    });
  }

  _buildCheckpoints() {
    this._checkpoints = [];
    CHECKPOINTS.forEach(([x, y]) => {
      const cp = this.physics.add.staticImage(x, y, 'checkpoint-off').setDepth(6);
      this.tweens.add({ targets: cp, y: y - 4, duration: 1100, yoyo: true, repeat: -1 });
      this._checkpoints.push({ sprite: cp, x, y: y + 30, active: false });
    });
  }

  _buildFragments() {
    this._fragments = this.physics.add.staticGroup();
    this._fragmentLore = {};
    FRAGMENTS.forEach(([x, y, lore]) => {
      const f = this._fragments.create(x, y, 'memory-fragment').setDepth(7);
      f.setTint(0xce93d8);
      if (f.postFX) f.postFX.addGlow(0xce93d8, 4, 0);
      this._fragmentLore[`${x},${y}`] = lore;
      this.tweens.add({ targets: f, angle: 360, duration: 3000, repeat: -1 });
    });
  }

  _buildBoss() {
    this._boss = new BossManager(this);
    // Le boss se spawne plus tard (trigger à x > 2700)
    this.events.on('bossDefeated', () => {
      audio.play('victory');
      this._unlockAchievement('guardian');
      this._bossDefeated = true;
      this._storyStage = 7;
      this._activateEndingRoute();
    });
  }

  _activateEndingRoute() {
    if (this._endingRoute) return;
    this._endingRoute = this._gsm.getRoute();

    if (this._endingRoute === 'transmit') {
      // La transmission emprunte une vraie voie haute, inaccessible en marchant
      // simplement sur le sol de l'arène.
      const ascent = [
        [5760, 402, 1.0], [5900, 340, 1.05], [6045, 278, 1.0], [6190, 310, 1.0],
      ];
      ascent.forEach(([x, y, scale]) => {
        const platform = this._platforms.create(x, y, 'platform-surface').setScale(scale, 1).refreshBody();
        platform.setTint(0x80e8c1);
        this.add.rectangle(x, y + 11, 106 * scale, 4, 0x4caf8a, 0.42).setDepth(1);
      });
      this._routeBlocker = this.add.rectangle(5830, 430, 30, 180, 0x123a32, 0.9)
        .setStrokeStyle(2, 0x80e8c1, 0.8).setDepth(4);
      this.physics.add.existing(this._routeBlocker, true);
      this.physics.add.collider(this._player, this._routeBlocker);
      this._exitA.enableBody(false, 6260, 250, true, true);
      this._exitALabel.setVisible(true);
      this._endingRouteReady = true;
      this._floatMessage('Le relais supérieur répond à votre serment.', '#80e8c1');
      this.events.emit('objectiveChanged', 'ACTE VIII-A — Gravissez le relais et transmettez les mémoires');
      voice.speak('Route de transmission ouverte. Rejoignez le relais supérieur.', { persona: 'system' });
      return;
    }

    // La libération ouvre le couloir inférieur, mais impose de détruire trois
    // verrous physiques avant que le noyau accepte la déconnexion.
    this._exitBLabel.setVisible(true);
    this._endingRouteEnemies = [
      this._em.addCrawler(5840, 475, 65),
      this._em.addDrone(6030, 390),
      this._em.addGuardian(6180, 475),
    ];
    this._floatMessage('Le noyau exige la destruction de ses trois verrous.', '#ff8a80');
    this.events.emit('objectiveChanged', 'ACTE VIII-B — Brisez les 3 verrous du noyau inférieur');
    voice.speak('Route de libération ouverte. Détruisez les trois verrous du noyau.', { persona: 'system' });
  }

  _updateEndingRoute() {
    if (this._endingRoute !== 'release' || this._endingRouteReady) return;
    const remaining = this._endingRouteEnemies.filter(enemy => enemy?.active).length;
    if (remaining > 0) return;
    this._endingRouteReady = true;
    this._exitB.enableBody(false, 6260, 485, true, true);
    this._exitBLabel.setText('NOYAU DES ÉCHOS\n[Libérer]').setVisible(true);
    this._floatMessage('Les verrous sont brisés. Le noyau est accessible.', '#ff9aaa');
    this.events.emit('objectiveChanged', 'ACTE VIII-B — Entrez dans le noyau et libérez les Échos');
    voice.speak('Les trois verrous sont brisés. Entrez dans le noyau.', { persona: 'system' });
  }

  _buildBossTestPortal() {
    this._testTeleportUsed = false;
    this._bossTestPortal = this.add.image(150, 468, 'exit-a').setTint(0xffd600).setDepth(9);
    this._bossTestLabel = this.add.text(150, 420, 'PORTAIL TEST\nBOSS  [E]', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffd600', align: 'center',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: this._bossTestPortal, alpha: { from: 0.45, to: 1 },
      scaleX: { from: 0.9, to: 1.08 }, duration: 720, yoyo: true, repeat: -1 });
  }

  _useBossTestPortal() {
    if (this._testTeleportUsed || !settings.get('bossTestTeleporter')) return;
    this._testTeleportUsed = true;

    this._fragmentCount = REQUIRED_FRAGMENTS;
    this._fragments.clear(true, true);
    this.events.emit('fragmentCollected', REQUIRED_FRAGMENTS);
    this._storyNpcs.forEach(npc => { npc.done = true; });
    this._storyGates.forEach(gate => { if (gate?.active) gate.destroy(); });
    this._storyStage = 6;
    this._gsm.recordDecision('final_route', 'release');
    this._activeEncounter = null;
    this._em.clearAll();

    if (!this._pm.hasUnlocked('doubleJump')) this._pm.unlock('doubleJump');
    if (!this._pm.hasUnlocked('dash')) this._pm.unlock('dash');
    if (!this._pm.hasUnlocked('shield')) this._pm.unlock('shield');
    this._ctrl.enableDoubleJump();
    this._ctrl.enableDash();
    if (!this._ctrl._hasShield) this._ctrl.enableShield();
    [this._crystal, this._dashPowerup, this._shieldPow].forEach(item => {
      if (item?.active) item.destroy();
    });
    ['doubleJump', 'dash', 'shield'].forEach(power => this.events.emit('powerUnlocked', power));

    this._spawnX = 5480; this._spawnY = 400;
    this._player.setPosition(this._spawnX, this._spawnY).setVelocity(0, 0);
    this._bossTestPortal.setVisible(false);
    this._bossTestLabel.setVisible(false);
    this.events.emit('objectiveChanged', 'TEST BOSS — Entrez dans la Chambre Haute');
    audio.play('power');
    voice.speak('Mode test. Boss prêt. Entrez dans la Chambre Haute.', { persona: 'system' });
    this.cameras.main.flash(450, 255, 214, 0);
  }

  _buildStoryGates() {
    this._storyNpcs = STORY_WITNESSES.map(witness => this._makeStoryNpc(
      witness.x, witness.y, witness.name, witness.requires, witness.id, witness.waves,
    ));
    // Barrières visibles : elles matérialisent les actes et disparaissent après le dialogue.
    const gateColors = [0x00e5ff, 0x80cbc4, 0xff6f00, 0xffb74d, 0xce93d8, 0x66bb6a];
    const gateStrokes = [0x80deea, 0xb2dfdb, 0xffcc80, 0xffe0b2, 0xe1bee7, 0xa5d6a7];
    this._storyGates = [1050, 2100, 3150, 4100, 4680, 5350].map((x, i) => {
      // Du plafond jusque sous le sol : impossible de contourner le verrou par un double saut.
      const gate = this.add.rectangle(x, 280, 22, 560, gateColors[i], 0.32)
        .setDepth(8).setStrokeStyle(2, gateStrokes[i]);
      this.physics.add.existing(gate, true);
      this.physics.add.collider(this._player, gate);
      return gate;
    });
  }

  _makeStoryNpc(x, y, name, requires, id, waves = 6) {
    // L'Oracle d'origine sert de premier personnage ; les suivants réutilisent la silhouette holographique.
    const sprite = id === 'oracle' ? this._npc : this.physics.add.staticImage(x, y, 'npc').setTint(id === 'sol' ? 0x80cbc4 : 0xffb74d);
    if (id !== 'oracle') {
      this.add.text(x, y - 42, name, { fontFamily: 'monospace', fontSize: '11px', color: id === 'sol' ? '#80cbc4' : '#ffb74d', stroke: '#000', strokeThickness: 3 })
        .setOrigin(0.5).setDepth(6);
      if (sprite.postFX) sprite.postFX.addGlow(id === 'sol' ? 0x80cbc4 : 0xffb74d, 3, 0);
    }
    return { sprite, name, requires, id, waves, done: false, defenseCleared: false };
  }

  _beginMemoryEncounter(npc) {
    if (this._activeEncounter) return;
    const encounter = {
      npc, wave: 0, enemies: [], waiting: false,
      waves: MEMORY_WAVES.slice(0, npc.waves),
    };
    this._activeEncounter = encounter;
    this._floatMessage('SYNCHRONISATION — Défendez la liaison mémorielle !', '#ff5252');
    this.events.emit('objectiveChanged', `DÉFENSE MÉMORIELLE — Vague 1/${encounter.waves.length}`);
    this._spawnEncounterWave(encounter);
  }

  _spawnEncounterWave(encounter) {
    const types = encounter.waves[encounter.wave];
    const anchor = encounter.npc.sprite.x;
    const offsets = encounter.npc.id === 'mira'
      ? [-220, -140, -70]
      : encounter.npc.id === 'sol' ? [70, 145, 205] : [80, 170, 260];
    encounter.enemies = types.map((type, i) => {
      const x = anchor + offsets[i];
      const y = type === 'drone' || type === 'sentinelle' ? 350 - i * 45 : 475;
      if (type === 'crawler') return this._em.addCrawler(x, y, 55);
      if (type === 'drone') return this._em.addDrone(x, y - 80);
      if (type === 'sentinelle') return this._em.addSentinelle(x, y - 120);
      return this._em.addGuardian(x, y);
    });
    encounter.waiting = false;
  }

  _updateMemoryEncounter() {
    const encounter = this._activeEncounter;
    if (!encounter || encounter.waiting) return;
    if (encounter.enemies.some(enemy => enemy.active)) return;

    encounter.wave++;
    if (encounter.wave >= encounter.waves.length) {
      encounter.npc.defenseCleared = true;
      this._activeEncounter = null;
      this._floatMessage('Synchronisation stable. Le témoin peut parler.', '#76ff03');
      this.events.emit('objectiveChanged', `Parlez à ${encounter.npc.name}`);
      return;
    }

    encounter.waiting = true;
    this.events.emit('objectiveChanged', `DÉFENSE MÉMORIELLE — Vague ${encounter.wave + 1}/${encounter.waves.length}`);
    this.time.delayedCall(1800, () => {
      if (this._activeEncounter === encounter) this._spawnEncounterWave(encounter);
    });
  }

  _buildAmbientParticles(W, H) {
    this.add.particles(W / 2, H / 2, 'particle', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-W/2, -H/2+60, W, H - 120) },
      quantity: 1, frequency: 320,
      lifespan: { min: 5000, max: 9000 },
      alpha: { start: 0.6, end: 0 },
      scale: { min: 0.3, max: 0.9 },
      speedX: { min: -6, max: 6 },
      speedY: { min: -18, max: -3 },
      gravityY: 0,
      tint: [0x80deea, 0xb39ddb, 0x4fc3f7],
      blendMode: Phaser.BlendModes.ADD,
    }).setDepth(-5);
  }

  _setupCollisions() {
    this.physics.add.collider(this._player, this._platforms);
    this.physics.add.overlap(this._player, this._crystal,    this._onCrystal,  null, this);
    this.physics.add.overlap(this._player, this._dashPowerup,this._onDashPow,  null, this);
    this.physics.add.overlap(this._player, this._exitA,      this._onExitA,    null, this);
    this.physics.add.overlap(this._player, this._exitB,      this._onExitB,    null, this);

    // Checkpoints
    this._checkpoints.forEach(cp => {
      this.physics.add.overlap(this._player, cp.sprite, () => this._onCheckpoint(cp), null, this);
    });

    // Fragments mémoire
    this.physics.add.overlap(this._player, this._fragments, (p, f) => {
      const lore = this._fragmentLore[`${Math.round(f.x)},${Math.round(f.y - 30) + 30}`]
        || this._fragmentLore[`${Math.round(f.x)},${Math.round(f.y)}`]
        || '"Fragment mémoriel."';
      f.destroy();
      this._fragmentCount++;
      this.events.emit('fragmentCollected', this._fragmentCount);
      audio.play('collect');
      this._floatMessage(lore, '#ce93d8');
      voice.speak(lore, { persona: 'system' });
      const nextNpc = this._storyNpcs?.find(n => !n.done);
      if (nextNpc) {
        const remaining = Math.max(0, nextNpc.requires - this._fragmentCount);
        this.events.emit('objectiveChanged', remaining > 0
          ? `Récupérez ${remaining} souvenir${remaining > 1 ? 's' : ''} avant de parler à ${nextNpc.name}`
          : `Retournez parler à ${nextNpc.name}`);
      } else if (this._fragmentCount >= REQUIRED_FRAGMENTS) {
        this.events.emit('objectiveChanged', 'Rejoignez la Chambre Haute');
      }
    }, null, this);

    this._em.connect(
      this._player,
      () => this._onPlayerHit(),
      this.physics.add.group(),  // bullets connectés dans update après init ctrl
      (sprite, dmg) => this._em.damage(sprite, dmg),
      this._platforms,
    );

    // Heal orbs
    this.physics.add.overlap(this._player, this._em.healOrbs, (p, orb) => {
      orb.destroy();
      if (this._hp < this._maxHp) {
        this._hp = Math.min(this._maxHp, this._hp + 1);
        this.events.emit('hpChanged', this._hp);
        this._floatMessage('+1 PV', '#76ff03');
      }
    }, null, this);

    // Bouclier power-up (Biome 2, plateforme x=2420)
    this._shieldPow = this.physics.add.staticImage(2420, 338, 'powerup-dash').setTint(0x00e5ff).setDepth(6);
    this.tweens.add({ targets: this._shieldPow, y: '+=6', duration: 750, yoyo: true, repeat: -1 });
    this.physics.add.overlap(this._player, this._shieldPow, () => {
      if (this._pm.hasUnlocked('shield')) return;
      this._pm.unlock('shield');
      this._ctrl.enableShield();
      this._shieldPow.destroy();
      this.events.emit('powerUnlocked', 'shield');
      this._floatMessage('Bouclier débloqué !  [Z actif]', '#00e5ff');
    }, null, this);
  }

  _onCrystal() {
    if (this._pm.hasUnlocked('doubleJump')) return;
    this._pm.unlock('doubleJump');
    this._ctrl.enableDoubleJump();
    this._crystal.destroy();
    this.events.emit('powerUnlocked', 'doubleJump');
    this._floatMessage('Double Saut debloque !  [ESPACE x2]', '#ffd600');
    voice.speak('Module de double saut restauré.', { persona: 'system' });
    audio.play('power');
  }

  _onDashPow() {
    if (this._pm.hasUnlocked('dash')) return;
    this._pm.unlock('dash');
    this._ctrl.enableDash();
    this._dashPowerup.destroy();
    this.events.emit('powerUnlocked', 'dash');
    this._floatMessage('Dash debloque !  [SHIFT]', '#ffcc02');
    voice.speak('Module de propulsion restauré.', { persona: 'system' });
    audio.play('power');
  }

  _onCheckpoint(cp) {
    if (cp.active) return;
    cp.active = true;
    cp.sprite.setTexture('checkpoint-on').setTint(0x00e5ff);
    if (cp.sprite.postFX) cp.sprite.postFX.addGlow(0x00e5ff, 6, 0);
    this._spawnX = cp.x;
    this._spawnY = cp.y;
    this.events.emit('checkpointActivated');
    this._floatMessage('Checkpoint !', '#00e5ff');
    voice.speak('Point de restauration synchronisé.', { persona: 'system' });
    audio.play('checkpoint');
  }

  _canFinish() {
    if (this._exitHintCd > 0) return false;
    if (!this._bossDefeated) {
      this._exitHintCd = 1200;
      this._floatMessage('Le Gardien maintient encore les protocoles verrouillés.', '#ff8a80');
      return false;
    }
    if (this._fragmentCount < REQUIRED_FRAGMENTS) {
      this._exitHintCd = 1200;
      this._floatMessage(`Mémoire incomplète : ${this._fragmentCount}/${REQUIRED_FRAGMENTS}.`, '#ce93d8');
      return false;
    }
    if (!this._endingRouteReady) {
      this._exitHintCd = 1200;
      this._floatMessage('Le parcours choisi n’est pas encore terminé.', '#ffcc80');
      return false;
    }
    return true;
  }

  _onExitA() {
    if (!this._gameOver && this._endingRoute === 'transmit' && this._canFinish()) {
      this._gsm.recordDecision('route_completed', 'transmit');
      this._triggerEnding(this._gsm.getEnding());
    }
  }

  _onExitB() {
    if (!this._gameOver && this._endingRoute === 'release' && this._canFinish()) {
      this._gsm.recordDecision('route_completed', 'release');
      this._triggerEnding(this._gsm.getEnding());
    }
  }

  _onPlayerHit() {
    if (this._invTimer > 0 || this._gameOver) return;
    // Essayer d'absorber avec le bouclier
    if (this._ctrl?._hasShield && this._ctrl.tryShieldAbsorb()) {
      this._invTimer = 400;
      this._unlockAchievement('shield_block');
      this._floatMessage('Bouclier absorbe !', '#00e5ff');
      return;
    }
    this._hp = Math.max(0, this._hp - 1);
    audio.play('hit');
    this._invTimer = 1200;
    this.events.emit('hpChanged', this._hp);
    this.tweens.add({
      targets: this._player, alpha: 0, duration: 80,
      yoyo: true, repeat: 7,
      onComplete: () => this._player.setAlpha(1),
    });
    const dir = this._player.flipX ? 1 : -1;
    this._player.setVelocity(dir * 180, -200);
    if (this._hp <= 0) this._die();
  }

  _die() {
    this._gameOver = true;
    this._ctrl.setEnabled(false);
    // Une mort pendant le combat invalide entièrement la tentative en cours.
    // Le boss attendra ensuite que le joueur sorte puis revienne dans l'arène.
    if (this._boss?.isEncounterActive()) this._boss.resetAttempt(true);
    if (settings.get('screenShake')) this.cameras.main.shake(400, 0.012);
    this.time.delayedCall(600, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Respawn au dernier checkpoint, pas restart complet
        this._gameOver = false;
        this._hp = this._maxHp;
        this.events.emit('hpChanged', this._maxHp);
        this._player.setPosition(this._spawnX, this._spawnY);
        this._player.setVelocity(0, 0);
        this._ctrl.setEnabled(true);
        this.cameras.main.fadeIn(500);
      });
    });
  }

  _triggerEnding(ending) {
    const elapsedSeconds = Math.max(0, (Date.now() - this._runStartedAt) / 1000);
    this._unlockAchievement('first_ending');
    if (elapsedSeconds < 45 * 60) this._unlockAchievement('speedrun');
    if (achievements.recordEnding(ending) >= 2) this._unlockAchievement('two_endings');
    this._gameOver = true;
    this._ctrl.setEnabled(false);
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('HUDScene');
      this.scene.start('EndingScene', {
        ending,
        stats: {
          fragments: this._fragmentCount,
          kills: this._enemyKills,
          seconds: elapsedSeconds,
        },
      });
    });
  }

  update(time, delta) {
    if (this._gameOver) return;

    this._invTimer = Math.max(0, this._invTimer - delta);
    this._exitHintCd = Math.max(0, this._exitHintCd - delta);

    // Connecter les bullets du controller une seule fois (ennemis normaux seulement)
    if (this._ctrl && !this._bulletsConnected) {
      this.physics.add.overlap(this._ctrl.bullets, this._em.enemies, (b, e) => {
        const damage = b.damage || 1;
        b.destroy();
        this._em.damage(e, damage);
      });
      this.physics.add.collider(this._ctrl.bullets, this._platforms, (a, b) => {
        const bullet = this._ctrl.bullets.contains(a) ? a : b;
        if (bullet?.active) bullet.destroy();
      });
      this._bulletsConnected = true;
    }
    if (this._ctrl && !this._meleeConnected) {
      this.physics.add.overlap(this._ctrl.meleeHits, this._em.enemies, (hit, enemy) => {
        if (hit.hitTargets?.has(enemy)) return;
        hit.hitTargets?.add(enemy);
        this._em.damage(enemy, hit.damage || 1);
      });
      this._meleeConnected = true;
    }

    // ── Biome & parallaxe ──
    const scrollX = this.cameras.main.scrollX;
    const biome = scrollX < 1800 ? 0 : scrollX < 4100 ? 1 : 2;
    this._bgFar.forEach((bg, i) => {
      bg.tilePositionX = scrollX * 0.15;
      bg.tilePositionY = Math.sin(time * 0.00022 + i) * (i === 1 ? 2 : 1);
      bg.alpha = Phaser.Math.Linear(bg.alpha, i === biome ? 0.9 : 0, 0.04);
      if (i !== biome && bg.alpha < 0.01) bg.setAlpha(0).setVisible(false);
      else bg.setVisible(true);
    });

    // Bannière de transition biome
    if (biome !== this._lastBiome) {
      this._lastBiome = biome;
      const names  = ['Le Coffre-Fort', 'La Forge', 'La Surface'];
      const colors = [0x00b8d4, 0xff6f00, 0x4caf50];
      const tints  = ['#4fc3f7', '#ff8f00', '#81c784'];
      if (this._lastBiome >= 0) {
        const flash = this.add.rectangle(this.scale.width / 2, this.scale.height / 2,
          this.scale.width, this.scale.height, colors[biome], 0.22)
          .setDepth(28).setScrollFactor(0);
        this.tweens.add({ targets: flash, alpha: 0, duration: 700, onComplete: () => flash.destroy() });
        const banner = this.add.text(this.scale.width / 2, 160,
          `─ ${names[biome].toUpperCase()} ─`,
          { fontFamily: 'monospace', fontSize: '18px', color: tints[biome],
            stroke: '#000', strokeThickness: 4 })
          .setOrigin(0.5).setDepth(29).setScrollFactor(0).setAlpha(0);
        this.tweens.add({ targets: banner, alpha: 1, duration: 400, hold: 1200,
          yoyo: true, onComplete: () => banner.destroy() });
      }
    }

    // ── Camera tilt dynamique ──
    const tiltX = -this._player.body.velocity.x * 0.05;
    this.cameras.main.setFollowOffset(tiltX, 0);

    // ── Trigger boss ──
    if (!this._bossTriggered && this._player.x > 5350 &&
        this._fragmentCount >= REQUIRED_FRAGMENTS && this._storyNpcs.every(n => n.done)) {
      this._bossTriggered = true;
      audio.play('boss');
      voice.speak("Le Gardien de l'Écho est réveillé.", { persona: 'system' });
      this._boss.spawn(5660, 350);
      this._boss.connect(
        this._player,
        () => this._onPlayerHit(),
        this._ctrl.bullets,
        (hit) => this._boss.hit(hit?.damage || 1),
        this._platforms,
      );
      this.physics.add.overlap(this._ctrl.meleeHits, this._boss.sprite, (hit, boss) => {
        if (hit.hitTargets?.has(boss)) return;
        hit.hitTargets?.add(boss);
        this._boss.hit(hit.damage || 1);
      });
      this._floatMessage('LE GARDIEN DE L\'\xC9CHO !', '#ff1744');
    }

    this._ctrl.setEnabled(!this._dlgMgr.isActive && !this._riddleActive);
    this._ctrl.update(delta);
    this._dlgMgr.update();
    this._em.update(this._player, delta);
    this._boss.update(this._player, delta);
    this._updateMemoryEncounter();
    this._updateEndingRoute();

    if (this._ctrl.bullets) {
      this._ctrl.bullets.getChildren().forEach(b => {
        if (b.x < -50 || b.x > WORLD_W + 50 || b.y < -100 || b.y > 620) b.destroy();
      });
    }

    const nearbyNpc = this._storyNpcs
      .filter(n => !n.done)
      .find(n => Phaser.Math.Distance.Between(this._player.x, this._player.y, n.sprite.x, n.sprite.y) < 95);
    const canInteract = nearbyNpc && !this._dlgMgr.isActive && !this._riddleActive;
    const portalEnabled = settings.get('bossTestTeleporter') && !this._testTeleportUsed;
    this._bossTestPortal.setVisible(portalEnabled);
    this._bossTestLabel.setVisible(portalEnabled);
    const nearTestPortal = portalEnabled && !this._dlgMgr.isActive && !this._riddleActive &&
      Phaser.Math.Distance.Between(this._player.x, this._player.y,
        this._bossTestPortal.x, this._bossTestPortal.y) < 95;
    this._indicator.setVisible(Boolean(nearTestPortal || canInteract));
    if (nearTestPortal) this._indicator.setPosition(this._bossTestPortal.x, this._bossTestPortal.y - 68);
    else if (canInteract) this._indicator.setPosition(nearbyNpc.sprite.x, nearbyNpc.sprite.y - 68);
    if (Phaser.Input.Keyboard.JustDown(this._eKey)) {
      if (nearTestPortal) this._useBossTestPortal();
      else if (canInteract) this._startStoryDialogue(nearbyNpc);
    }

    if (this._player.y > 590) {
      this._onPlayerHit();
      this._player.setPosition(this._spawnX, this._spawnY);
      this._player.setVelocity(0, 0);
    }
  }

  _startPrologue() {
    this._dlgMgr.startDialogue({
      name: `Système ${this._character.name}`,
      nodes: [
        { id: 'start', text: `Cycle 9 847. Réveil d’urgence.\nIdentité : ${this._character.name}, unité ${this._character.role.toLowerCase()}. Mémoire : 2 %.`, choices: [] },
      ],
    }, () => {
      this.events.emit('objectiveChanged', "ACTE I — Retrouvez 2 souvenirs et interrogez l'Oracle");
      this._floatMessage('Quelqu’un a laissé la porte du Coffre ouverte...', '#80deea');
    });
  }

  _startSibylRiddle(npc) {
    if (this._riddleActive) return;
    this._riddleActive = true;
    this._riddleAttempts = 0;
    this._riddleIndex = npc.riddleProgress || 0;
    this._ctrl.setEnabled(false);
    this._player.setVelocity(0, 0);
    this.physics.world.pause();

    const root = document.createElement('div');
    Object.assign(root.style, {
      position: 'fixed', zIndex: '1200', display: 'flex', alignItems: 'center',
      justifyContent: 'center', boxSizing: 'border-box', padding: '24px',
      background: 'rgba(1, 4, 11, .78)', backdropFilter: 'blur(5px)',
      fontFamily: 'monospace', color: '#e7faff',
    });

    const card = document.createElement('form');
    Object.assign(card.style, {
      width: 'min(660px, 92%)', padding: '26px 30px', boxSizing: 'border-box',
      border: '2px solid #00e5ff', borderRadius: '4px',
      background: 'linear-gradient(145deg, rgba(4,14,26,.98), rgba(9,4,24,.98))',
      boxShadow: '0 0 30px rgba(0,229,255,.24)', textAlign: 'center',
    });
    root.appendChild(card);

    const heading = document.createElement('div');
    heading.textContent = `SIBYL // ÉPREUVE ${this._riddleIndex + 1}/${SIBYL_RIDDLES.length}`;
    Object.assign(heading.style, {
      color: '#80deea', letterSpacing: '4px', fontSize: '13px', marginBottom: '22px',
    });
    card.appendChild(heading);

    const question = document.createElement('div');
    question.textContent = SIBYL_RIDDLES[this._riddleIndex].question;
    Object.assign(question.style, {
      whiteSpace: 'pre-line', fontSize: 'clamp(16px, 2vw, 23px)', lineHeight: '1.6',
      fontWeight: '700', textShadow: '0 0 10px rgba(128,222,234,.35)',
      marginBottom: '22px',
    });
    card.appendChild(question);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Écrivez votre réponse…';
    input.autocomplete = 'off';
    input.maxLength = 80;
    Object.assign(input.style, {
      width: '100%', boxSizing: 'border-box', padding: '13px 15px',
      border: '1px solid #546e7a', borderRadius: '3px', outline: 'none',
      background: '#020811', color: '#fff', font: '16px monospace',
      textAlign: 'center',
    });
    card.appendChild(input);

    const feedback = document.createElement('div');
    Object.assign(feedback.style, {
      minHeight: '22px', marginTop: '15px', fontSize: '14px', color: '#90a4ae',
    });
    feedback.textContent = 'SIBYL attend une réponse libre.';
    card.appendChild(feedback);

    const hint = document.createElement('div');
    Object.assign(hint.style, {
      minHeight: '20px', marginTop: '7px', color: '#ffcc80', fontSize: '12px',
    });
    card.appendChild(hint);

    const actions = document.createElement('div');
    Object.assign(actions.style, {
      display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px',
    });
    card.appendChild(actions);

    const makeButton = (label, primary) => {
      const button = document.createElement('button');
      button.type = primary ? 'submit' : 'button';
      button.textContent = label;
      Object.assign(button.style, {
        padding: '11px 20px', border: `1px solid ${primary ? '#00e5ff' : '#455a64'}`,
        borderRadius: '3px', background: primary ? '#00b8d4' : '#101923',
        color: primary ? '#001015' : '#b0bec5', font: 'bold 13px monospace',
        cursor: 'pointer',
      });
      actions.appendChild(button);
      return button;
    };
    const validateButton = makeButton('ANALYSER', true);
    const closeButton = makeButton('REVENIR PLUS TARD', false);

    const syncBounds = () => {
      const bounds = this.game.canvas.getBoundingClientRect();
      Object.assign(root.style, {
        left: `${bounds.left}px`, top: `${bounds.top}px`,
        width: `${bounds.width}px`, height: `${bounds.height}px`,
      });
    };
    this._riddleResizeHandler = syncBounds;
    window.addEventListener('resize', syncBounds);
    syncBounds();

    card.addEventListener('submit', event => {
      event.preventDefault();
      const activeRiddle = SIBYL_RIDDLES[this._riddleIndex];
      const result = evaluateRiddleAnswer(input.value, activeRiddle);
      if (!result.normalized) {
        feedback.textContent = 'Aucune donnée exploitable. Écris une réponse.';
        feedback.style.color = '#ff8a80';
        return;
      }

      this._riddleAttempts++;
      if (result.status === 'correct') {
        if (this._riddleIndex < SIBYL_RIDDLES.length - 1) {
          this._riddleIndex++;
          npc.riddleProgress = this._riddleIndex;
          this._riddleAttempts = 0;
          heading.textContent = `SIBYL // ÉPREUVE ${this._riddleIndex + 1}/${SIBYL_RIDDLES.length}`;
          question.textContent = SIBYL_RIDDLES[this._riddleIndex].question;
          feedback.textContent = 'CONCEPT VALIDÉ — passage à l’épreuve suivante.';
          feedback.style.color = '#76ff03';
          hint.textContent = '';
          input.value = '';
          input.focus();
          voice.speak(SIBYL_RIDDLES[this._riddleIndex].question, { persona: 'system' });
          return;
        }
        npc.riddleSolved = true;
        this._gsm.recordDecision('sibyl_riddle_solved', true);
        feedback.textContent = `RÉPONSE ACCEPTÉE — confiance ${Math.round(result.confidence * 100)} %`;
        feedback.style.color = '#76ff03';
        hint.textContent = 'Le verrou cognitif est levé.';
        input.disabled = true;
        validateButton.disabled = true;
        voice.speak('Réponse acceptée. Le verrou cognitif est levé.', { persona: 'system' });
        this.time.delayedCall(950, () => {
          this._destroyRiddleUI();
          this._startStoryDialogue(npc);
        });
        return;
      }

      feedback.textContent = result.status === 'close'
        ? `ANALYSE — réponse proche (${Math.round(result.confidence * 100)} %).`
        : `RÉPONSE REFUSÉE — correspondance ${Math.round(result.confidence * 100)} %.`;
      feedback.style.color = result.status === 'close' ? '#ffd54f' : '#ff8a80';
      hint.textContent = getRiddleHint(this._riddleAttempts, activeRiddle);
      voice.speak(result.status === 'close' ? 'Tu approches. Affine ta réponse.' : hint.textContent, { persona: 'system' });
      input.select();
    });

    closeButton.addEventListener('click', () => {
      this._destroyRiddleUI();
      this._floatMessage('SIBYL conservera le verrou jusqu’à votre retour.', '#ffcc80');
    });
    root.addEventListener('keydown', event => {
      event.stopPropagation();
      if (event.key === 'Escape') closeButton.click();
    });

    document.body.appendChild(root);
    this._riddlePanel = root;
    input.focus();
    voice.speak(SIBYL_RIDDLES[this._riddleIndex].question, { persona: 'system' });
  }

  _destroyRiddleUI() {
    if (this._riddleResizeHandler) {
      window.removeEventListener('resize', this._riddleResizeHandler);
      this._riddleResizeHandler = null;
    }
    this._riddlePanel?.remove();
    this._riddlePanel = null;
    if (this._riddleActive) {
      this.physics.world.resume();
      this._riddleActive = false;
    }
    voice.stop();
  }

  _startStoryDialogue(npc) {
    if (this._fragmentCount < npc.requires) {
      const missing = npc.requires - this._fragmentCount;
      this._floatMessage(`${missing} souvenir${missing > 1 ? 's' : ''} manque${missing > 1 ? 'nt' : ''}.`, '#ce93d8');
      return;
    }

    if (!npc.defenseCleared) {
      this._beginMemoryEncounter(npc);
      return;
    }

    if (npc.id === 'sibyl' && !npc.riddleSolved) {
      this._startSibylRiddle(npc);
      return;
    }

    const dialogues = {
      oracle: {
        name: "L'Oracle",
        nodes: [
          { id: 'start', text: `${this._character.name}... Deux souvenirs suffisent pour reconnaître ma voix.\nTu étais la gardienne de cette cité, avant sa chute.`, choices: [] },
        ],
        followup: {
          name: "L'Oracle",
          nodes: [
            { id: 'start', text: 'Le Conseil ordonna d’effacer les habitants transférés dans l’Écho.\nJ’ai saboté cet ordre — puis tu as effacé ta propre mémoire.', choices: [
              { label: 'Je te crois. Ouvrons les archives.', next: 'trust', effect: { decision: 'trust_oracle', value: true } },
              { label: 'Je vérifierai chaque mot.', next: 'doubt', effect: { decision: 'trust_oracle', value: false } },
            ] },
            { id: 'trust', text: 'Alors traverse la Forge. AEGIS-4 protège encore le chemin des convois.', choices: [] },
            { id: 'doubt', text: 'Tu as raison. Une gardienne ne doit jamais obéir sans preuve. Interroge AEGIS-4.', choices: [] },
          ],
        },
      },
      aegis: {
        name: 'AEGIS-4',
        nodes: [
          { id: 'start', text: 'Quatre souvenirs reconnus. Je gardais les convois humains pendant leur descente.\nIls n’étaient pas prisonniers : ils avaient choisi de survivre ici.', choices: [] },
        ],
        followup: {
          name: 'AEGIS-4',
          nodes: [
            { id: 'start', text: 'Le dernier convoi n’atteignit jamais la Forge. Le Conseil détourna son énergie\npour alimenter le protocole d’effacement.', choices: [
              { label: 'Enregistrer le sacrifice des gardes.', next: 'record', effect: { decision: 'honor_aegis', value: true } },
              { label: 'Conserver l’énergie pour les survivants.', next: 'survive', effect: { decision: 'honor_aegis', value: false } },
            ] },
            { id: 'record', text: 'Leur histoire ne sera plus une simple perte statistique. SIBYL t’attend plus loin.', choices: [] },
            { id: 'survive', text: 'Un choix froid, mais cohérent avec leur mission. SIBYL évaluera ton jugement.', choices: [] },
          ],
        },
      },
      sibyl: {
        name: 'SIBYL',
        nodes: [
          { id: 'start', text: 'Réponse authentifiée. Ton raisonnement est compatible avec les archives.\nLes machines de la Forge recevaient les consciences humaines pour les sauver du Cataclysme.', choices: [] },
        ],
        followup: {
          name: 'SIBYL',
          nodes: [
            { id: 'start', text: `Quand les ressources ont manqué, le Conseil a choisi le silence.\nToi, ${this._character.name}, tu as enfermé l’ordre d’effacement dans le Gardien.`, choices: [
              { label: 'Conserver la Forge comme preuve.', next: 'keep', effect: { decision: 'preserve_forge', value: true } },
              { label: 'La condamner après notre passage.', next: 'close', effect: { decision: 'preserve_forge', value: false } },
            ] },
            { id: 'keep', text: 'Alors nos fautes resteront visibles. L’Archiviste K-7 détient la liste des condamnés.', choices: [] },
            { id: 'close', text: 'Parfois une tombe protège mieux qu’un musée. K-7 t’attend dans les archives profondes.', choices: [] },
          ],
        },
      },
      archivist: {
        name: 'Archiviste K-7',
        nodes: [
          { id: 'start', text: 'Huit fragments validés. J’ai conservé 18 432 identités que le Conseil voulait réduire au silence.\nChacune possède encore un nom, une voix et un choix.', choices: [] },
        ],
        followup: {
          name: 'Archiviste K-7',
          nodes: [
            { id: 'start', text: 'Le registre prouve que tu as enfermé l’ordre d’effacement dans le Gardien.\nTu espérais revenir avant qu’il ne parvienne à le déchiffrer.', choices: [
              { label: 'Copier le registre dans ma mémoire.', next: 'copy', effect: { decision: 'carry_registry', value: true } },
              { label: 'Le laisser protégé dans les archives.', next: 'leave', effect: { decision: 'carry_registry', value: false } },
            ] },
            { id: 'copy', text: 'Copie terminée. MIRA maintient encore une liaison avec la surface.', choices: [] },
            { id: 'leave', text: 'Le registre restera ici. MIRA maintient encore une liaison avec la surface.', choices: [] },
          ],
        },
      },
      mira: {
        name: 'Écho de MIRA',
        nodes: [
          { id: 'start', text: 'Dix souvenirs synchronisés. Je suis MIRA, opératrice du dernier relais.\nLa surface répond de nouveau, mais elle ignore que nous existons.', choices: [] },
        ],
        followup: {
          name: 'Écho de MIRA',
          nodes: [
            { id: 'start', text: 'J’ai assez d’énergie pour un unique signal. Un message peut révéler la cité,\nou demander au monde d’attendre que les Échos choisissent eux-mêmes.', choices: [
              { label: 'Préparer un signal public.', next: 'public', effect: { decision: 'mira_signal', value: 'public' } },
              { label: 'Préparer un canal privé.', next: 'private', effect: { decision: 'mira_signal', value: 'private' } },
            ] },
            { id: 'public', text: 'Le monde verra notre mémoire entière. SOL t’attend près de la Chambre Haute.', choices: [] },
            { id: 'private', text: 'Le choix restera entre nos mains. SOL t’attend près de la Chambre Haute.', choices: [] },
          ],
        },
      },
      sol: {
        name: 'Écho de SOL',
        nodes: [
          { id: 'start', text: `Je suis SOL, dernier humain éveillé dans le réseau.\nTu ne nous as pas emprisonnés, ${this._character.name}. Tu nous as donné du temps.`, choices: [] },
        ],
        followup: {
          name: 'Écho de SOL',
          nodes: [
            { id: 'start', text: 'Les douze fragments sont réunis. Le Gardien croit encore exécuter ta dernière consigne :\n« ne laisse personne décider à ma place ». Il ne reste qu’à l’affronter.', choices: [
              { label: 'Transmettre les mémoires au monde.', next: 'carry', effect: { decision: 'final_route', value: 'transmit' } },
              { label: 'Libérer les Échos du réseau.', next: 'share', effect: { decision: 'final_route', value: 'release' } },
            ] },
            { id: 'carry', text: 'Le relais supérieur s’ouvrira après le Gardien. Son ascension mènera les mémoires vers la surface.', choices: [] },
            { id: 'share', text: 'Le noyau inférieur s’ouvrira après le Gardien. Brise ses trois verrous pour rendre leur choix aux Échos.', choices: [] },
          ],
        },
      },
    };

    const script = dialogues[npc.id];
    this._dlgMgr.startDialogue(script, () => {
      this._dlgMgr.startDialogue(script.followup, () => {
        npc.done = true;
        if (npc.id === 'oracle') this._npcDone = true;
        this._storyGates[this._storyStage]?.destroy();
        this._storyStage++;
        const objectives = [
          'ACTE II — Retrouvez AEGIS-4 avec 4 souvenirs',
          'ACTE III — Atteignez SIBYL avec 6 souvenirs',
          'ACTE IV — Retrouvez K-7 avec 8 souvenirs',
          'ACTE V — Rétablissez MIRA avec 10 souvenirs',
          'ACTE VI — Rejoignez SOL avec les 12 souvenirs',
          'ACTE VII — Entrez dans la Chambre Haute et affrontez le Gardien',
        ];
        const routeObjective = npc.id === 'sol'
          ? this._gsm.getRoute() === 'transmit'
            ? 'ACTE VII-A — Affrontez le Gardien pour ouvrir le relais'
            : 'ACTE VII-B — Affrontez le Gardien pour ouvrir le noyau'
          : objectives[this._storyStage - 1];
        this.events.emit('objectiveChanged', routeObjective);
        this._floatMessage('Verrou mémoriel levé.', '#ffd600');
      });
    });
  }

  _unlockAchievement(id) {
    const achievement = achievements.unlock(id);
    if (achievement) this.events.emit('achievementUnlocked', achievement);
  }

  _floatMessage(text, color) {
    const msg = this.add.text(this._player.x, this._player.y - 64, text, {
      fontFamily: 'monospace', fontSize: '13px',
      color, stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: msg, y: msg.y - 45, alpha: 0, duration: 2500,
      onComplete: () => msg.destroy() });
  }
}
