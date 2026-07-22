/**
 * EnemyManager — Crawler, Drone, Guardian, Sentinelle.
 * Nouvelles features: stomp-kill, drop heal-orb, Sentinelle (rayon vertical).
 */
import Phaser from 'phaser';
import { audio } from './AudioManager.js';

export class EnemyManager {
  constructor(scene) {
    this.scene     = scene;
    this.enemies   = scene.physics.add.group();
    this.bullets   = scene.physics.add.group();
    this._data     = [];
    this._healOrbs = scene.physics.add.staticGroup();
    // Un seul émetteur réutilisé pour toutes les morts. Créer/détruire un
    // système complet à chaque ennemi provoquait des pics de garbage collector.
    this._deathParticles = scene.add.particles(0, 0, 'particle', {
      speed: { min: 60, max: 140 }, angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 }, lifespan: 500,
      blendMode: Phaser.BlendModes.ADD,
      tint: [0xff6f00, 0xffd600, 0xffffff],
      emitting: false,
    }).setDepth(12);
  }

  // ─── Getters utiles ──────────────────────────────────────────────────────
  get healOrbs() { return this._healOrbs; }

  // ─── API publique ────────────────────────────────────────────────────────
  addCrawler(x, y, range = 80) {
    const s = this._makeSprite(x, y, 'enemy-crawler', 0xe53935);
    s.setSize(20, 16);
    this._data.push({ sprite: s, type: 'crawler', originX: x, range, dir: 1, speed: 55, hp: 2 });
    return s;
  }

  addDrone(x, y) {
    const s = this._makeSprite(x, y, 'enemy-drone', 0xff6f00);
    s.setSize(18, 12);
    s.body.setAllowGravity(false);
    this._data.push({ sprite: s, type: 'drone', originX: x, originY: y,
      t: Math.random() * Math.PI * 2, shootCd: 0, hp: 1 });
    return s;
  }

  addGuardian(x, y) {
    const s = this._makeSprite(x, y, 'enemy-guardian', 0x7b1fa2);
    s.setSize(24, 30);
    this._data.push({ sprite: s, type: 'guardian', originX: x, dir: 1, speed: 0, chargeTimer: 0, hp: 4 });
    return s;
  }

  /** Sentinelle : fixe, tire un rayon vertical vers le bas toutes les 2 s. */
  addSentinelle(x, y) {
    const s = this._makeSprite(x, y, 'enemy-guardian', 0x0097a7);
    s.setSize(24, 30);
    s.body.setAllowGravity(false);
    this._data.push({ sprite: s, type: 'sentinelle', x, y, shootCd: 2000, hp: 3 });
    return s;
  }

  /**
   * Connecte overlaps joueur/ennemis/projectiles.
   * onPlayerHit accepte un param optionnel `absorbed` (pour le bouclier).
   */
  connect(player, onPlayerHit, playerBullets, onEnemyHit, platforms) {
    const scene = this.scene;
    scene.physics.add.collider(this.enemies, platforms);

    // Contact ennemi → joueur (vérifie stomp d'abord)
    scene.physics.add.overlap(player, this.enemies, (p, e) => {
      const playerFeet = p.body.bottom;
      const enemyHead = e.body.top;
      const playerIsAbove = p.y < e.y && playerFeet <= enemyHead + 14;
      const fallingDown   = p.body.velocity.y > 80;
      if (playerIsAbove && fallingDown) {
        // Un même impact élimine tout le petit groupe situé sous les pieds d'ARIA.
        // Cela évite que deux crawlers superposés ne laissent survivre arbitrairement le second.
        const stomped = this._data.filter(d =>
          d.sprite.active &&
          Math.abs(d.sprite.x - p.x) <= 34 &&
          d.sprite.body.top >= playerFeet - 16 &&
          d.sprite.body.top <= playerFeet + 24
        );
        stomped.forEach(d => this._killEnemy(d));
        p.body.velocity.y = -300;   // rebond
        scene.events.emit('enemyStomped', stomped.length);
      } else {
        onPlayerHit();
      }
    }, null, scene);

    // Bullet ennemi → joueur
    scene.physics.add.overlap(player, this.bullets, (p, b) => {
      b.destroy();
      onPlayerHit();
    }, null, scene);

    // Bullet joueur → ennemi
    scene.physics.add.overlap(playerBullets, this.enemies, (b, e) => {
      b.destroy();
      onEnemyHit(e, 1);
    }, null, scene);
  }

  /**
   * Inflige des dégâts à un ennemi.
   * @returns {boolean} true si mort
   */
  damage(enemySprite, dmg) {
    const d = this._data.find(x => x.sprite === enemySprite);
    if (!d) return false;
    d.hp -= dmg;
    // Retour d'impact sans flash blanc : légère compression du sprite.
    enemySprite.setScale(1.12, 0.88);
    this.scene.tweens.add({
      targets: enemySprite, scaleX: 1, scaleY: 1,
      duration: 100, ease: 'Quad.out',
    });
    if (d.hp <= 0) {
      this._killEnemy(d);
      return true;
    }
    return false;
  }

  update(player, delta) {
    for (const d of this._data) {
      if (!d.sprite.active) continue;

      // Les corps et l'IA situés à plus d'un écran du joueur sont suspendus.
      // Ils sont restaurés avant d'entrer dans le champ de la caméra.
      const shouldSleep = Math.abs(d.sprite.x - player.x) > 1050;
      if (shouldSleep) {
        if (!d.sleeping) {
          d.sleeping = true;
          d.sprite.body.enable = false;
          d.sprite.setVisible(false);
        }
        continue;
      }
      if (d.sleeping) {
        d.sleeping = false;
        d.sprite.setVisible(true);
        d.sprite.body.enable = true;
      }
      switch (d.type) {
        case 'crawler':    this._updateCrawler(d, delta);          break;
        case 'drone':      this._updateDrone(d, player, delta);    break;
        case 'guardian':   this._updateGuardian(d, player, delta); break;
        case 'sentinelle': this._updateSentinelle(d, player, delta); break;
      }
    }
    this.bullets.getChildren().forEach(b => {
      if (b.x < -100 || b.x > this.scene.physics.world.bounds.width + 100 || b.y < -200 || b.y > 800) b.destroy();
    });
  }

  // ─── Comportements ───────────────────────────────────────────────────────

  _updateCrawler(d, delta) {
    const s = d.sprite;
    s.setVelocityX(d.dir * d.speed);
    s.setFlipX(d.dir < 0);
    const minX = d.originX - d.range;
    const maxX = d.originX + d.range;

    // Rester sur la limite atteinte puis repartir dans l'autre sens.
    // L'ancien calcul utilisait la nouvelle direction pour repositionner le
    // crawler, ce qui le téléportait à l'extrémité opposée de sa patrouille.
    if (s.x >= maxX && d.dir > 0) {
      s.setX(maxX);
      d.dir = -1;
      s.setVelocityX(-d.speed);
    } else if (s.x <= minX && d.dir < 0) {
      s.setX(minX);
      d.dir = 1;
      s.setVelocityX(d.speed);
    }
  }

  _updateDrone(d, player, delta) {
    const s = d.sprite;
    d.t += delta * 0.0018;
    s.x = d.originX + Math.sin(d.t) * 70;
    s.y = d.originY + Math.sin(d.t * 0.7) * 30;
    const dist = Phaser.Math.Distance.Between(s.x, s.y, player.x, player.y);
    d.shootCd -= delta;
    if (dist < 200 && d.shootCd <= 0) {
      this._shootAt(s, player);
      d.shootCd = 2200;
    }
    s.setFlipX(player.x < s.x);
  }

  _updateGuardian(d, player, delta) {
    const s = d.sprite;
    const dist = Phaser.Math.Distance.Between(s.x, s.y, player.x, player.y);
    if (dist < 160 && d.chargeTimer <= 0) {
      d.speed = (player.x < s.x) ? -220 : 220;
      d.chargeTimer = 800;
    }
    d.chargeTimer -= delta;
    if (d.chargeTimer <= 0) {
      d.speed = (s.x < d.originX) ? 30 : (s.x > d.originX + 4) ? -30 : 0;
    }
    s.setVelocityX(d.speed);
    s.setFlipX(d.speed < 0);
  }

  _updateSentinelle(d, player, delta) {
    // Fixe, pivote vers le joueur (flip uniquement)
    const s = d.sprite;
    s.setFlipX(player.x < s.x);
    d.shootCd -= delta;
    if (d.shootCd <= 0) {
      this._shootVertical(s);
      d.shootCd = 2000;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  _makeSprite(x, y, texture, tint) {
    const s = this.scene.physics.add.sprite(x, y, texture);
    s.setTint(tint);
    this.enemies.add(s);
    return s;
  }

  _shootAt(from, target) {
    const b = this.scene.physics.add.image(from.x, from.y, 'enemy-bullet');
    b.setTint(0xff6f00);
    this.bullets.add(b);
    const ang = Phaser.Math.Angle.Between(from.x, from.y, target.x, target.y);
    this.scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(ang), 200, b.body.velocity);
    b.body.setAllowGravity(false);
  }

  _shootVertical(from) {
    const b = this.scene.physics.add.image(from.x, from.y + 20, 'enemy-bullet');
    b.setTint(0x00e5ff);
    b.setScale(0.8, 1.6);
    this.bullets.add(b);
    b.body.setVelocity(0, 280);
    b.body.setAllowGravity(false);
  }

  /** Mort d'un ennemi: particules + drop aléatoire (15%). */
  _killEnemy(d) {
    const ex = d.sprite.x;
    const ey = d.sprite.y;
    this._spawnDeathParticles(ex, ey);
    audio.play('enemy');
    d.sprite.destroy();
    this._data = this._data.filter(x => x !== d);
    this.scene.events.emit('enemyDefeated', { type: d.type, x: ex, y: ey });
    // Drop heal-orb 15%
    if (Math.random() < 0.15) this._dropHealOrb(ex, ey);
  }

  _dropHealOrb(x, y) {
    const orb = this._healOrbs.create(x, y, 'heal-orb');
    orb.setTint(0x76ff03);
    if (orb.postFX) orb.postFX.addGlow(0x76ff03, 4, 0);
    // Petite anim de rebond
    this.scene.tweens.add({
      targets: orb, y: y - 22, yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut',
    });
  }

  _spawnDeathParticles(x, y) {
    this._deathParticles.setPosition(x, y);
    this._deathParticles.explode(8);
  }
}
