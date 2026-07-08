/**
 * GameScene — niveau principal d'EchoVault (Livrable 2 enrichi).
 *
 * Carte 3200×560 px — 3 biomes :
 *   Biome 0 « Le Coffre-Fort »  x 0–1060    (palette bleue-nuit, Crawlers)
 *   Biome 1 « La Forge »        x 1060–2160  (lave, orange, Drones)
 *   Biome 2 « La Surface »      x 2160–3200  (verdure, lumière, Guardian)
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
];

// Checkpoints [x, y]
const CHECKPOINTS = [
  [520,  420],
  [1320, 280],
  [2270, 420],
];

// Fragments mémoire [x, y, texte lore]
const FRAGMENTS = [
  [420,  340, '"Fragment #1 — Je me souviens... de la tour."'],
  [900,  268, '"Fragment #2 — Quelqu\'un a effacé mes données."'],
  [1640, 308, '"Fragment #3 — Le Gardien protège quoi, au juste ?"'],
  [2420, 338, '"Fragment #4 — Les archives brûlent encore."'],
  [2900, 298, '"Fragment #5 — C\'est ici que tout a commencé."'],
];

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  init() {
    this._pm  = new PowerManager();  this._pm.reset();
    this._gsm = new GameStateManager();
    this._npcDone  = false;
    this._gameOver = false;
    this._hp       = 3;
    this._invTimer = 0;
    this._bulletsConnected = false;
    this._fragmentCount = 0;
    this._bossTriggered = false;
    this._lastBiome = -1;
  }

  create() {
    const W = 3200, H = 560;
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
    this._buildAmbientParticles(W, H);
    this._setupCollisions();

    this._ctrl   = new PlayerController(this, this._player);
    this._dlgMgr = new DialogueManager(this, this._gsm);

    this.cameras.main.startFollow(this._player, true, 0.12, 0.12);
    this.cameras.main.fadeIn(500);

    this._eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._indicator = this.add.image(0, 0, 'indicator').setVisible(false).setDepth(15);

    this.scene.launch('HUDScene', { pm: this._pm, gsm: this._gsm, getHp: () => this._hp });
    this._spawnX = 80; this._spawnY = 460;
  }

  _buildBackground(W, H) {
    this.add.rectangle(400, 250, 800, 500, 0x04060d).setScrollFactor(0).setDepth(-20);
    this._bgFar = [
      this.add.tileSprite(400, 250, 800, 500, 'bg-brick'  ).setDepth(-18),
      this.add.tileSprite(400, 250, 800, 500, 'bg-forge'  ).setDepth(-18).setAlpha(0),
      this.add.tileSprite(400, 250, 800, 500, 'bg-surface').setDepth(-18).setAlpha(0),
    ];
    this.add.rectangle(400,  60, 800, 140, 0x03050b, 0.75).setScrollFactor(0).setDepth(-16);
    this.add.rectangle(400, 460, 800, 100, 0x030509, 0.55).setScrollFactor(0).setDepth(-16);
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
        this.add.image(x + seg*8, 30 + seg*36, 'deco-chain').setDepth(depth).setAlpha(0.65);
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

    // ─── BIOME 2 — La Surface (x 2160–3200) ───────────────────────────
    // Colonnes brisées
    [[2210,480],[2480,475],[2650,480],[2870,478],[3080,480],[3160,478]].forEach(([x, y]) => {
      this.add.image(x, y, 'deco-column').setDepth(depth).setOrigin(0.5, 1)
        .setAlpha(0.75).setScale(0.9 + (x%3)*0.1, 0.8 + (x%4)*0.08);
    });
    // Touffes d’herbe sur le sol
    for (let x = 2180; x < 3200; x += Phaser.Math.Between(28, 55)) {
      const g = this.add.image(x, 502, 'deco-grass').setDepth(depth).setOrigin(0.5, 1);
      g.setAlpha(0.6 + Math.random()*0.3).setScale(0.8 + Math.random()*0.5, 1 + Math.random()*0.4);
    }
    // Halos de luneâ (lumiere verte froide douce)
    [[2300,80],[2600,120],[2900,80],[3150,100]].forEach(([x, y]) => {
      this.add.ellipse(x, y, 120, 40, 0x1a4020, 0.08)
        .setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
    });
    // Particules pollen / lucioles
    this.add.particles(2700, 300, 'particle', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-500, -200, 1000, 400) },
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
    this._platforms.create(1600, 520, 'ground').setScale(2, 1).refreshBody();

    PLATFORMS.forEach(([x, y, sx, tex]) => {
      this._platforms.create(x, y, tex).setScale(sx, 1).refreshBody();
      const c = tex === 'platform-forge' ? 0xff6f00 : tex === 'platform-surface' ? 0x4caf50 : 0x00e5ff;
      this.add.rectangle(x, y + 11, 100 * sx + 6, 4, c, 0.14)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(0);
    });

    [[1060, 280], [2160, 280]].forEach(([bx, h]) => {
      this.add.rectangle(bx, 520, 20, h * 2, 0x080e1c, 1).setDepth(-10);
      this.add.rectangle(bx, 520 - h, 30, 14, 0x101828, 1).setDepth(-10);
    });

    [
      [530,  30, '[ LE COFFRE-FORT ]', '#4fc3f7'],
      [1600, 30, '[ LA FORGE ]',       '#ff8f00'],
      [2680, 30, '[ LA SURFACE ]',     '#81c784'],
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
    this.add.text(700, 296, "L'Oracle", {
      fontFamily: 'monospace', fontSize: '12px',
      color: '#ce93d8', stroke: '#06020e', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5);
    if (this._npc.postFX) this._npc.postFX.addGlow(0xce93d8, 3, 0);

    this._exitA = this.physics.add.staticImage(2580, 230, 'exit-a');
    this.add.text(2580, 190, 'FIN A\n[Gardienne]', {
      fontFamily: 'monospace', fontSize: '10px', color: '#81c784',
      align: 'center', stroke: '#030a04', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5);
    if (this._exitA.postFX) {
      const gA = this._exitA.postFX.addGlow(0x4caf50, 4, 0);
      this.tweens.add({ targets: gA, outerStrength: { from: 2, to: 7 }, duration: 1400, yoyo: true, repeat: -1 });
    }

    this._exitB = this.physics.add.staticImage(3100, 485, 'exit-b');
    this.add.text(3100, 445, 'FIN B\n[Reset]', {
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
      this._floatMessage('Gardien vaincu ! La voie est libre.', '#ffd600');
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
      this._floatMessage(lore, '#ce93d8');
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
  }

  _onDashPow() {
    if (this._pm.hasUnlocked('dash')) return;
    this._pm.unlock('dash');
    this._ctrl.enableDash();
    this._dashPowerup.destroy();
    this.events.emit('powerUnlocked', 'dash');
    this._floatMessage('Dash debloque !  [SHIFT]', '#ffcc02');
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
  }

  _onExitA() { if (!this._gameOver) this._triggerEnding('guardian'); }
  _onExitB() { if (!this._gameOver) this._triggerEnding('reset'); }

  _onPlayerHit() {
    if (this._invTimer > 0 || this._gameOver) return;
    // Essayer d'absorber avec le bouclier
    if (this._ctrl?._hasShield && this._ctrl.tryShieldAbsorb()) {
      this._invTimer = 400;
      this._floatMessage('Bouclier absorbe !', '#00e5ff');
      return;
    }
    this._hp = Math.max(0, this._hp - 1);
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
    this.cameras.main.shake(400, 0.012);
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
      this.scene.start('EndingScene', { ending });
    });
  }

  update(time, delta) {
    if (this._gameOver) return;

    this._invTimer = Math.max(0, this._invTimer - delta);

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
    const biome = scrollX < 1060 ? 0 : scrollX < 2160 ? 1 : 2;
    this._bgFar.forEach((bg, i) => {
      bg.tilePositionX = scrollX * 0.15;
      bg.alpha = Phaser.Math.Linear(bg.alpha, i === biome ? 0.9 : 0, 0.04);
    });

    // Bannière de transition biome
    if (biome !== this._lastBiome) {
      this._lastBiome = biome;
      const names  = ['Le Coffre-Fort', 'La Forge', 'La Surface'];
      const colors = [0x00b8d4, 0xff6f00, 0x4caf50];
      const tints  = ['#4fc3f7', '#ff8f00', '#81c784'];
      if (this._lastBiome >= 0) {
        const flash = this.add.rectangle(400, 250, 800, 500, colors[biome], 0.22)
          .setDepth(28).setScrollFactor(0);
        this.tweens.add({ targets: flash, alpha: 0, duration: 700, onComplete: () => flash.destroy() });
        const banner = this.add.text(400, 160,
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
    if (!this._bossTriggered && this._player.x > 2700) {
      this._bossTriggered = true;
      this._boss.spawn(2820, 300);
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

    if (this._ctrl.bullets) {
      this._ctrl.bullets.getChildren().forEach(b => {
        if (b.x < -50 || b.x > 3250 || b.y < -100 || b.y > 620) b.destroy();
      });
    }

    const distNPC = Phaser.Math.Distance.Between(
      this._player.x, this._player.y, this._npc.x, this._npc.y
    );
    const nearNPC = distNPC < 90 && !this._npcDone && !this._dlgMgr.isActive;
    this._indicator.setVisible(nearNPC);
    if (nearNPC) this._indicator.setPosition(this._npc.x, this._npc.y - 68);
    if (nearNPC && Phaser.Input.Keyboard.JustDown(this._eKey)) this._startOracleDialogue();

    if (this._player.y > 590) {
      this._onPlayerHit();
      this._player.setPosition(this._spawnX, this._spawnY);
      this._player.setVelocity(0, 0);
    }
  }

  _startOracleDialogue() {
    const data = {
      name: "L'Oracle",
      nodes: [
        {
          id: 'start',
          text: 'Fragment memoriel #3 detecte.\nARIA... tu te souviens de moi ?',
          choices: [
            { label: 'Oui, quelque chose me revient...', next: 'remember',
              effect: { decision: 'trust_oracle', value: true } },
            { label: 'Non. Je ne te connais pas.', next: 'forget',
              effect: { decision: 'trust_oracle', value: false } },
          ],
        },
        { id: 'remember', text: 'Bien. Tu sais ce que tu dois proteger.\nLa Chambre Haute t\'attend. Va, Gardienne.', choices: [] },
        { id: 'forget',   text: 'La memoire efface ce qui fait mal.\nChoisir l\'oubli est aussi une liberte.', choices: [] },
      ],
    };
    this._dlgMgr.startDialogue(data, () => {
      this._npcDone = true;
      const guardian = this._gsm.getEnding() === 'guardian';
      this._floatMessage(
        guardian ? '-> Biome 2 : Chambre Haute (Fin A)' : '-> Biome 2 : Sortie (Fin B)',
        guardian ? '#81c784' : '#ef9a9a'
      );
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
