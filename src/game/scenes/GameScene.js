/**
 * GameScene — niveau principal d'EchoVault (Livrable 2 enrichi).
 *
 * Carte 6400×560 px — campagne narrative en 5 actes (≈ 15 minutes).
 * Le chemin critique est verrouillé par les souvenirs et les dialogues :
 * il n'est plus possible de courir directement jusqu'à la fin.
 *
 * Mécaniques :
 *   - Saut + double saut (cristal Biome 0)
 *   - Dash (power-up Biome 1)
 *   - Tir laser touche X
 *   - 3 HP joueur, clignotement + invincibilité 1.2s après dégâts
 *   - Oracle (NPC, Biome 0) -> décision narrative
 *   - Deux portes de fin (haut biome 2 et sol biome 2)
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
  [1640, 308, 'Fragment III — « L\'Oracle a refusé l\'ordre d\'effacement. »'],
  [2420, 338, 'Fragment IV — « La Forge fabriquait des corps, pas des armes. »'],
  [3460, 248, 'Fragment V — « ARIA était leur première gardienne. Moi. »'],
  [4050, 223, 'Fragment VI — « SOL : le dernier esprit humain transféré. »'],
  [4620, 213, 'Fragment VII — « Le Gardien retient l\'Écho contre sa volonté. »'],
  [5220, 398, 'Fragment VIII — « Se souvenir ne condamne pas. Cela permet de choisir. »'],
];

const WORLD_W = 6400;
const REQUIRED_FRAGMENTS = FRAGMENTS.length;

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  init() {
    this._pm  = new PowerManager();  this._pm.reset();
    this._gsm = new GameStateManager();
    this._npcDone  = false;
    this._gameOver = false;
    this._hp       = 3;
    this._invTimer = 0;
    this._exitHintCd = 0;
    this._bulletsConnected = false;
    this._fragmentCount = 0;
    this._bossTriggered = false;
    this._bossDefeated  = false;
    this._storyStage    = 0;
    this._activeEncounter = null;
    this._enemyKills = 0;
    this._lastBiome = -1;
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

    this._ctrl   = new PlayerController(this, this._player);
    this._dlgMgr = new DialogueManager(this, this._gsm);

    this.cameras.main.startFollow(this._player, true, 0.12, 0.12);
    this.cameras.main.fadeIn(500);

    this._eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._indicator = this.add.image(0, 0, 'indicator').setVisible(false).setDepth(15);

    this.scene.launch('HUDScene', {
      pm: this._pm, gsm: this._gsm, getHp: () => this._hp,
      fragmentTotal: REQUIRED_FRAGMENTS,
    });
    this._spawnX = 80; this._spawnY = 460;
    this.events.on('enemyDefeated', () => { this._enemyKills++; });

    this.time.delayedCall(700, () => this._startPrologue());
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
    this._player.setCollideWorldBounds(true);
    this._player.body.setSize(24, 42).setOffset(4, 4);
    this._player.play('aria-idle');
    if (this._player.postFX) this._player.postFX.addGlow(0x00b8d4, 2, 0);
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

    this._exitA = this.physics.add.staticImage(5920, 290, 'exit-a');
    this.add.text(5920, 250, 'FIN A\n[Transmettre]', {
      fontFamily: 'monospace', fontSize: '10px', color: '#81c784',
      align: 'center', stroke: '#030a04', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5);
    if (this._exitA.postFX) {
      const gA = this._exitA.postFX.addGlow(0x4caf50, 4, 0);
      this.tweens.add({ targets: gA, outerStrength: { from: 2, to: 7 }, duration: 1400, yoyo: true, repeat: -1 });
    }

    this._exitB = this.physics.add.staticImage(6260, 485, 'exit-b');
    this.add.text(6260, 445, 'FIN B\n[Libérer]', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ef9a9a',
      align: 'center', stroke: '#0a0202', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5);
    if (this._exitB.postFX) {
      const gB = this._exitB.postFX.addGlow(0xf44336, 4, 0);
      this.tweens.add({ targets: gB, outerStrength: { from: 2, to: 7 }, duration: 1600, yoyo: true, repeat: -1 });
    }
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
      this._bossDefeated = true;
      this._storyStage = 4;
      this._floatMessage('Le Gardien est libre. Les deux protocoles répondent.', '#ffd600');
      this.events.emit('objectiveChanged', 'ACTE V — Choisissez le destin des mémoires');
    });
  }

  _buildStoryGates() {
    this._storyNpcs = [
      this._makeStoryNpc(700, 338, "L'Oracle", 2, 'oracle'),
      this._makeStoryNpc(2740, 368, 'Archiviste K-7', 4, 'archivist'),
      this._makeStoryNpc(4440, 288, 'Écho de SOL', 6, 'sol'),
    ];
    // Barrières visibles : elles matérialisent les actes et disparaissent après le dialogue.
    this._storyGates = [1050, 3150, 4680].map((x, i) => {
      // Du plafond jusque sous le sol : impossible de contourner le verrou par un double saut.
      const gate = this.add.rectangle(x, 280, 22, 560, [0x00e5ff, 0xff6f00, 0xce93d8][i], 0.32)
        .setDepth(8).setStrokeStyle(2, [0x80deea, 0xffcc80, 0xe1bee7][i]);
      this.physics.add.existing(gate, true);
      this.physics.add.collider(this._player, gate);
      return gate;
    });
  }

  _makeStoryNpc(x, y, name, requires, id) {
    // L'Oracle d'origine sert de premier personnage ; les suivants réutilisent la silhouette holographique.
    const sprite = id === 'oracle' ? this._npc : this.physics.add.staticImage(x, y, 'npc').setTint(id === 'sol' ? 0x80cbc4 : 0xffb74d);
    if (id !== 'oracle') {
      this.add.text(x, y - 42, name, { fontFamily: 'monospace', fontSize: '11px', color: id === 'sol' ? '#80cbc4' : '#ffb74d', stroke: '#000', strokeThickness: 3 })
        .setOrigin(0.5).setDepth(6);
      if (sprite.postFX) sprite.postFX.addGlow(id === 'sol' ? 0x80cbc4 : 0xffb74d, 3, 0);
    }
    return { sprite, name, requires, id, done: false, defenseCleared: false };
  }

  _beginMemoryEncounter(npc) {
    if (this._activeEncounter) return;
    const encounter = {
      npc, wave: 0, enemies: [], waiting: false,
      waves: [
        ['crawler', 'crawler', 'drone'],
        ['drone', 'crawler', 'sentinelle'],
        ['guardian', 'drone', 'drone'],
        ['guardian', 'sentinelle', 'crawler'],
      ],
    };
    this._activeEncounter = encounter;
    this._floatMessage('SYNCHRONISATION — Défendez la liaison mémorielle !', '#ff5252');
    this.events.emit('objectiveChanged', `DÉFENSE MÉMORIELLE — Vague 1/${encounter.waves.length}`);
    this._spawnEncounterWave(encounter);
  }

  _spawnEncounterWave(encounter) {
    const types = encounter.waves[encounter.wave];
    const anchor = encounter.npc.sprite.x;
    const offsets = encounter.npc.id === 'sol' ? [70, 145, 205] : [80, 170, 260];
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
      if (this._hp < 3) {
        this._hp = Math.min(3, this._hp + 1);
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
    audio.play('power');
  }

  _onDashPow() {
    if (this._pm.hasUnlocked('dash')) return;
    this._pm.unlock('dash');
    this._ctrl.enableDash();
    this._dashPowerup.destroy();
    this.events.emit('powerUnlocked', 'dash');
    this._floatMessage('Dash debloque !  [SHIFT]', '#ffcc02');
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
    return true;
  }

  _onExitA() {
    if (!this._gameOver && this._canFinish()) {
      this._gsm.recordDecision('final_choice', 'transmit');
      this._triggerEnding('guardian');
    }
  }

  _onExitB() {
    if (!this._gameOver && this._canFinish()) {
      this._gsm.recordDecision('final_choice', 'release');
      this._triggerEnding('reset');
    }
  }

  _onPlayerHit() {
    if (this._invTimer > 0 || this._gameOver) return;
    // Essayer d'absorber avec le bouclier
    if (this._ctrl?._hasShield && this._ctrl.tryShieldAbsorb()) {
      this._invTimer = 400;
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
    if (settings.get('screenShake')) this.cameras.main.shake(400, 0.012);
    this.time.delayedCall(600, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Respawn au dernier checkpoint, pas restart complet
        this._gameOver = false;
        this._hp = 3;
        this.events.emit('hpChanged', 3);
        this._player.setPosition(this._spawnX, this._spawnY);
        this._player.setVelocity(0, 0);
        this._ctrl.setEnabled(true);
        this.cameras.main.fadeIn(500);
      });
    });
  }

  _triggerEnding(ending) {
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
          seconds: Math.max(0, (Date.now() - this._runStartedAt) / 1000),
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
        b.destroy();
        this._em.damage(e, 1);
      });
      this._bulletsConnected = true;
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
      this._boss.spawn(5660, 350);
      this._boss.connect(
        this._player,
        () => this._onPlayerHit(),
        this._ctrl.bullets,
        () => this._boss.hit(),
        this._platforms,
      );
      this._floatMessage('LE GARDIEN DE L\'\xC9CHO !', '#ff1744');
    }

    this._ctrl.setEnabled(!this._dlgMgr.isActive);
    this._ctrl.update(delta);
    this._dlgMgr.update();
    this._em.update(this._player, delta);
    this._boss.update(this._player, delta);
    this._updateMemoryEncounter();

    if (this._ctrl.bullets) {
      this._ctrl.bullets.getChildren().forEach(b => {
        if (b.x < -50 || b.x > WORLD_W + 50 || b.y < -100 || b.y > 620) b.destroy();
      });
    }

    const nearbyNpc = this._storyNpcs
      .filter(n => !n.done)
      .find(n => Phaser.Math.Distance.Between(this._player.x, this._player.y, n.sprite.x, n.sprite.y) < 95);
    const canInteract = nearbyNpc && !this._dlgMgr.isActive;
    this._indicator.setVisible(Boolean(canInteract));
    if (canInteract) this._indicator.setPosition(nearbyNpc.sprite.x, nearbyNpc.sprite.y - 68);
    if (canInteract && Phaser.Input.Keyboard.JustDown(this._eKey)) this._startStoryDialogue(nearbyNpc);

    if (this._player.y > 590) {
      this._onPlayerHit();
      this._player.setPosition(this._spawnX, this._spawnY);
      this._player.setVelocity(0, 0);
    }
  }

  _startPrologue() {
    this._dlgMgr.startDialogue({
      name: 'Système ARIA',
      nodes: [
        { id: 'start', text: 'Cycle 9 847. Réveil d’urgence.\nIdentité : ARIA, unité archéologue. Mémoire : 2 %.', choices: [] },
      ],
    }, () => {
      this.events.emit('objectiveChanged', "ACTE I — Retrouvez 2 souvenirs et interrogez l'Oracle");
      this._floatMessage('Quelqu’un a laissé la porte du Coffre ouverte...', '#80deea');
    });
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

    const dialogues = {
      oracle: {
        name: "L'Oracle",
        nodes: [
          { id: 'start', text: 'ARIA... Deux souvenirs suffisent pour reconnaître ma voix.\nTu étais la gardienne de cette cité, avant sa chute.', choices: [] },
        ],
        followup: {
          name: "L'Oracle",
          nodes: [
            { id: 'start', text: 'Le Conseil ordonna d’effacer les habitants transférés dans l’Écho.\nJ’ai saboté cet ordre — puis tu as effacé ta propre mémoire.', choices: [
              { label: 'Je te crois. Ouvrons les archives.', next: 'trust', effect: { decision: 'trust_oracle', value: true } },
              { label: 'Je vérifierai chaque mot.', next: 'doubt', effect: { decision: 'trust_oracle', value: false } },
            ] },
            { id: 'trust', text: 'Alors traverse la Forge. K-7 conserve le registre des derniers jours.', choices: [] },
            { id: 'doubt', text: 'Tu as raison. Une gardienne ne doit jamais obéir sans preuve. Trouve K-7.', choices: [] },
          ],
        },
      },
      archivist: {
        name: 'Archiviste K-7',
        nodes: [
          { id: 'start', text: 'Quatre fragments authentifiés. Voici la vérité : les machines de la Forge\nrecevaient les consciences humaines pour les sauver du Cataclysme.', choices: [] },
        ],
        followup: {
          name: 'Archiviste K-7',
          nodes: [
            { id: 'start', text: 'Quand les ressources ont manqué, le Conseil a choisi le silence.\nToi, ARIA, tu as enfermé l’ordre d’effacement dans le Gardien.', choices: [
              { label: 'Conserver la Forge comme preuve.', next: 'keep', effect: { decision: 'preserve_forge', value: true } },
              { label: 'La condamner après notre passage.', next: 'close', effect: { decision: 'preserve_forge', value: false } },
            ] },
            { id: 'keep', text: 'Alors nos fautes resteront visibles. SOL vous attend dans le Jardin des Échos.', choices: [] },
            { id: 'close', text: 'Parfois une tombe protège mieux qu’un musée. SOL vous attend plus haut.', choices: [] },
          ],
        },
      },
      sol: {
        name: 'Écho de SOL',
        nodes: [
          { id: 'start', text: 'Je suis SOL, dernier humain éveillé dans le réseau.\nTu ne nous as pas emprisonnés, ARIA. Tu nous as donné du temps.', choices: [] },
        ],
        followup: {
          name: 'Écho de SOL',
          nodes: [
            { id: 'start', text: 'Le Gardien croit encore exécuter ta dernière consigne : « ne laisse personne décider à ma place ».\nRassemble les deux fragments restants, puis affronte-le.', choices: [
              { label: 'Je porterai encore cette responsabilité.', next: 'carry', effect: { decision: 'accept_past', value: true } },
              { label: 'Cette fois, les Échos choisiront.', next: 'share', effect: { decision: 'accept_past', value: false } },
            ] },
            { id: 'carry', text: 'Alors monte à la Chambre Haute. Mais souviens-toi : protéger n’est pas posséder.', choices: [] },
            { id: 'share', text: 'Alors monte à la Chambre Haute. Fais de ton choix le dernier ordre imposé.', choices: [] },
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
          'ACTE II — Traversez la Forge et rassemblez 4 souvenirs',
          'ACTE III — Retrouvez SOL avec 6 souvenirs',
          'ACTE IV — Complétez les 8 souvenirs et gagnez la Chambre Haute',
        ];
        this.events.emit('objectiveChanged', objectives[this._storyStage - 1]);
        this._floatMessage('Verrou mémoriel levé.', '#ffd600');
      });
    });
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
