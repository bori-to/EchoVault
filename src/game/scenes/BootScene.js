/**
 * BootScene — génère toutes les textures programmatiquement (style Hollow Knight).
 * Palette sombre atmosphérique, sprites pixel-art détaillés, textures pour parallax.
 */
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    this._generateTextures();
    this._registerAnimations();
    this.scene.start('MenuScene');
  }

  _generateTextures() {
    const mk = () => this.make.graphics({ x: 0, y: 0, add: false });

    this._generatePlayerSheet(mk);

    // ─── Bullet joueur 12×4 — laser teal ────────────────────────────────
    {
      const g = mk();
      g.fillStyle(0x80deea, 0.4); g.fillRect(0, 0, 12, 4);
      g.fillStyle(0x00e5ff, 1.0); g.fillRect(1, 1, 10, 2);
      g.fillStyle(0xffffff, 0.9); g.fillRect(3, 1, 4,  2);
      g.generateTexture('bullet', 12, 4);
      g.destroy();
    }

    // ─── Enemy bullet 8×8 ────────────────────────────────────────────────
    {
      const g = mk();
      g.fillStyle(0xff6f00, 0.4); g.fillCircle(4, 4, 4);
      g.fillStyle(0xffcc02, 1.0); g.fillCircle(4, 4, 2);
      g.generateTexture('enemy-bullet', 8, 8);
      g.destroy();
    }

    // ─── Crawler 24×18 — araignée mécanique rouge ────────────────────────
    {
      const g = mk();
      // Corps
      g.fillStyle(0x5a0a0a); g.fillRect(4, 4, 16, 10);
      g.fillStyle(0x8b1010); g.fillRect(6, 5, 12, 8);
      // Yeux
      g.fillStyle(0xff4444); g.fillRect(7, 6, 3, 3);
      g.fillStyle(0xff4444); g.fillRect(14, 6, 3, 3);
      g.fillStyle(0xffaaaa); g.fillRect(8, 7, 1, 1);
      g.fillStyle(0xffaaaa); g.fillRect(15, 7, 1, 1);
      // Pattes (4 paires)
      g.fillStyle(0x3a0808);
      g.fillRect(0, 2, 4, 2);  g.fillRect(0, 8, 4, 2);
      g.fillRect(20, 2, 4, 2); g.fillRect(20, 8, 4, 2);
      g.fillRect(1, 4, 3, 6);  g.fillRect(20, 4, 3, 6);
      g.generateTexture('enemy-crawler', 24, 18);
      g.destroy();
    }

    // ─── Drone 28×16 — œil mécanique orange ──────────────────────────────
    {
      const g = mk();
      g.fillStyle(0x3a1a00); g.fillRect(0, 3, 28, 10);
      g.fillStyle(0x6d3200); g.fillRect(2, 4, 24, 8);
      g.fillStyle(0xff6f00); g.fillRect(10, 0, 8, 16);
      g.fillStyle(0xffcc02); g.fillCircle(14, 8, 5);
      g.fillStyle(0x1a0800); g.fillCircle(14, 8, 3);
      g.fillStyle(0xff6f00); g.fillCircle(14, 8, 1);
      g.fillStyle(0x6d3200); g.fillRect(0, 7, 4, 2);
      g.fillStyle(0x6d3200); g.fillRect(24, 7, 4, 2);
      g.generateTexture('enemy-drone', 28, 16);
      g.destroy();
    }

    // ─── Guardian 28×36 — golem de pierre violet ──────────────────────────
    {
      const g = mk();
      // Tête
      g.fillStyle(0x200830); g.fillRect(4, 0, 20, 14);
      g.fillStyle(0x3a1055); g.fillRect(6, 2, 16, 10);
      g.fillStyle(0x9c27b0); g.fillRect(8, 4, 5, 6);
      g.fillStyle(0x9c27b0); g.fillRect(15, 4, 5, 6);
      g.fillStyle(0xe040fb); g.fillRect(9, 5, 2, 4);
      g.fillStyle(0xe040fb); g.fillRect(16, 5, 2, 4);
      // Corps
      g.fillStyle(0x1a0628); g.fillRect(2, 14, 24, 16);
      g.fillStyle(0x2d0c44); g.fillRect(4, 16, 8, 12);
      g.fillStyle(0x2d0c44); g.fillRect(16, 16, 8, 12);
      g.fillStyle(0x4a0a6e); g.fillRect(10, 17, 8, 10);
      g.fillStyle(0x7b1fa2); g.fillRect(12, 19, 4, 6);
      // Jambes
      g.fillStyle(0x150522); g.fillRect(4, 30, 9, 6);
      g.fillStyle(0x150522); g.fillRect(15, 30, 9, 6);
      g.generateTexture('enemy-guardian', 28, 36);
      g.destroy();
    }

    // ─── bg-forge 64×64 — plaques métal industriel / lave (Biome 1) ───────
    {
      const g = mk();
      g.fillStyle(0x090400); g.fillRect(0, 0, 64, 64);
      // 4 plaques métalliques (grid 2×2, joints 3px)
      g.fillStyle(0x1e0e06); g.fillRect(0,  0, 29, 29);
      g.fillStyle(0x261408); g.fillRect(1,  1, 27, 27);
      g.fillStyle(0x2e1a0a); g.fillRect(1,  1, 27,  7);
      g.fillStyle(0x180c04); g.fillRect(1, 21, 27,  7);
      g.fillStyle(0x1c0c04); g.fillRect(32, 0, 32, 29);
      g.fillStyle(0x241206); g.fillRect(33, 1, 30, 27);
      g.fillStyle(0x2c1808); g.fillRect(33, 1, 30,  7);
      g.fillStyle(0x160a02); g.fillRect(33,21, 30,  7);
      g.fillStyle(0x1e0e06); g.fillRect(0, 32, 29, 32);
      g.fillStyle(0x261408); g.fillRect(1, 33, 27, 30);
      g.fillStyle(0x2c180a); g.fillRect(1, 33, 27,  7);
      g.fillStyle(0x1a0b04); g.fillRect(32,32, 32, 32);
      g.fillStyle(0x221006); g.fillRect(33,33, 30, 30);
      g.fillStyle(0x2a1608); g.fillRect(33,33, 30,  7);
      // Joints
      g.fillStyle(0x050200); g.fillRect(29, 0, 3, 64);
      g.fillStyle(0x050200); g.fillRect(0, 29, 64,  3);
      // Rivets
      const rivetF = (rx, ry) => {
        g.fillStyle(0x120800); g.fillRect(rx-2, ry-2, 5, 5);
        g.fillStyle(0x3c2010); g.fillRect(rx-1, ry-1, 3, 3);
        g.fillStyle(0x503018); g.fillRect(rx, ry, 1, 1);
      };
      [[5,5],[23,5],[5,23],[23,23],[37,5],[58,5],[37,23],[58,23],
       [5,37],[23,37],[5,58],[23,58],[37,37],[58,37],[37,58],[58,58]].forEach(([rx,ry])=>rivetF(rx,ry));
      // Fissures de lave
      g.fillStyle(0xff4400, 0.45); g.fillRect(30, 12, 1, 40);
      g.fillStyle(0xff6600, 0.22); g.fillRect(29, 12, 3, 40);
      g.fillStyle(0xff8800, 0.10); g.fillRect(28, 12, 5, 40);
      g.fillStyle(0xff3300, 0.35); g.fillRect(5, 50, 20, 1);
      g.fillStyle(0xff5500, 0.18); g.fillRect(5, 49, 20, 3);
      g.fillStyle(0xff6600, 0.35); g.fillRect(29,29, 5, 5);
      g.fillStyle(0xffaa00, 0.55); g.fillRect(30,30, 3, 3);
      g.fillStyle(0xffee00, 0.80); g.fillRect(31,31, 1, 1);
      g.fillStyle(0xff3300, 0.25); g.fillRect(44, 14, 10, 1);
      g.fillStyle(0xff5500, 0.12); g.fillRect(44, 13, 10, 3);
      g.generateTexture('bg-forge', 64, 64);
      g.destroy();
    }

    // ─── bg-surface 64×64 — ciel étoilé + ruines envahies (Biome 2) ───────
    {
      const g = mk();
      g.fillStyle(0x040a06); g.fillRect(0, 0, 64, 40);
      g.fillStyle(0x091508, 0.4); g.fillRect(0, 32, 64, 8);
      // Étoiles
      [[5,3],[13,8],[21,4],[29,2],[38,6],[47,3],[56,5],[3,13],[10,18],[19,11],
       [27,16],[36,10],[45,19],[54,12],[61,8],[7,23],[16,27],[24,20],[32,24],
       [41,21],[50,28],[8,32],[20,35],[33,30],[44,34],[55,26],[60,32]].forEach(([sx,sy]) => {
        if (sy < 36) {
          g.fillStyle(0xffffff, 0.45 + (sx % 4) * 0.14); g.fillRect(sx, sy, 1, 1);
          if ((sx * sy) % 11 === 0) {
            g.fillStyle(0xffffff, 0.18); g.fillRect(sx-1, sy, 3, 1);
            g.fillStyle(0xffffff, 0.18); g.fillRect(sx, sy-1, 1, 3);
          }
        }
      });
      // Silhouette ruine distante
      g.fillStyle(0x030603);
      g.fillRect(0,32,10,8); g.fillRect(0,28,4,4);
      g.fillRect(14,30,12,10); g.fillRect(18,26,4,4);
      g.fillRect(36,32,8,8); g.fillRect(50,29,14,11); g.fillRect(54,25,6,4);
      // Sol pierre (y:40-63)
      g.fillStyle(0x0c1a08); g.fillRect(0, 40, 64, 24);
      g.fillStyle(0x102010); g.fillRect(0,  40, 30, 11);
      g.fillStyle(0x142414); g.fillRect(1,  41, 28,  9);
      g.fillStyle(0x192c18); g.fillRect(1,  41, 28,  3);
      g.fillStyle(0x0e1e0c); g.fillRect(32, 40, 32, 11);
      g.fillStyle(0x12221a); g.fillRect(33, 41, 30,  9);
      g.fillStyle(0x172a14); g.fillRect(33, 41, 30,  3);
      g.fillStyle(0x0a1608); g.fillRect(0,  53, 14, 11);
      g.fillStyle(0x0e1c0c); g.fillRect(1,  54, 12,  9);
      g.fillStyle(0x0c1a0a); g.fillRect(16, 53, 30, 11);
      g.fillStyle(0x102010); g.fillRect(17, 54, 28,  9);
      g.fillStyle(0x162816); g.fillRect(17, 54, 28,  3);
      g.fillStyle(0x0e1e0c); g.fillRect(48, 53, 16, 11);
      g.fillStyle(0x040804); g.fillRect(0, 51, 64, 2);
      g.fillStyle(0x040804); g.fillRect(30,40, 2, 11);
      g.fillStyle(0x040804); g.fillRect(14,53, 2, 11);
      g.fillStyle(0x040804); g.fillRect(46,53, 2, 11);
      // Mousse
      g.fillStyle(0x1a3a0c, 0.45); g.fillRect(2, 41, 8, 4);
      g.fillStyle(0x1a3a0c, 0.40); g.fillRect(34,41, 10, 4);
      g.fillStyle(0x163008, 0.38); g.fillRect(18,54, 5, 3);
      g.fillStyle(0x224a10, 0.30); g.fillRect(50,54, 8, 3);
      g.fillStyle(0x2a5010, 0.60); g.fillRect(30,49, 2, 3);
      g.fillStyle(0x2a5010, 0.55); g.fillRect(14,51, 1, 2);
      g.generateTexture('bg-surface', 64, 64);
      g.destroy();
    }

    // ─── Platform forge 100×16 — plaque métal incandescente ───────────────
    {
      const g = mk();
      g.fillStyle(0x1a0e06); g.fillRect(0, 0, 100, 16);
      g.fillStyle(0xff5500); g.fillRect(0, 0, 100, 1);
      g.fillStyle(0xe03c00); g.fillRect(0, 1, 100, 1);
      g.fillStyle(0x602008); g.fillRect(0, 2, 100, 1);
      g.fillStyle(0x3a1606); g.fillRect(0, 3, 100, 1);
      g.fillStyle(0x281808); g.fillRect(1,  4, 47, 11);
      g.fillStyle(0x342010); g.fillRect(2,  5, 45,  5);
      g.fillStyle(0x1e120a); g.fillRect(2, 11, 45,  3);
      g.fillStyle(0x241606); g.fillRect(52, 4, 47, 11);
      g.fillStyle(0x301e0e); g.fillRect(53, 5, 45,  5);
      g.fillStyle(0x1c100a); g.fillRect(53,11, 45,  3);
      g.fillStyle(0x0e0602); g.fillRect(49, 3, 2, 13);
      const rF = (rx,ry) => { g.fillStyle(0x120800); g.fillRect(rx-1,ry-1,3,3); g.fillStyle(0x3e2010); g.fillRect(rx,ry,1,1); };
      [8,24,40,60,76,92].forEach(rx => rF(rx, 8));
      g.fillStyle(0xff3300, 0.35); g.fillRect(18, 6, 1, 8);
      g.fillStyle(0xff5500, 0.18); g.fillRect(17, 6, 3, 8);
      g.fillStyle(0xff3300, 0.28); g.fillRect(72,10,10, 1);
      g.fillStyle(0xff5500, 0.14); g.fillRect(72, 9,10, 3);
      g.generateTexture('platform-forge', 100, 16);
      g.destroy();
    }

    // ─── Platform surface 100×16 — pierre mousseuse + herbe ─────────────
    {
      const g = mk();
      g.fillStyle(0x111c09); g.fillRect(0, 0, 100, 16);
      g.fillStyle(0x4caf50); g.fillRect(0, 0, 100, 1);
      g.fillStyle(0x3a9940); g.fillRect(0, 1, 100, 1);
      // Brins d'herbe
      [[6,2],[14,2],[26,1],[38,2],[52,1],[64,2],[80,2],[92,1]].forEach(([bx,h])=>{
        g.fillStyle(0x66bb6a); g.fillRect(bx, 0, 1, 1);
        if (h>1) { g.fillStyle(0x56a858); g.fillRect(bx+1, -1, 1, 1); }
      });
      g.fillStyle(0x1e3010); g.fillRect(0, 2, 100, 3);
      g.fillStyle(0x162412); g.fillRect(1,  5, 32, 10);
      g.fillStyle(0x1c2c18); g.fillRect(2,  6, 30,  5);
      g.fillStyle(0x102010); g.fillRect(2, 12, 30,  2);
      g.fillStyle(0x162412); g.fillRect(35, 5, 30, 10);
      g.fillStyle(0x1c2c18); g.fillRect(36, 6, 28,  5);
      g.fillStyle(0x102010); g.fillRect(36,12, 28,  2);
      g.fillStyle(0x162412); g.fillRect(67, 5, 32, 10);
      g.fillStyle(0x1c2c18); g.fillRect(68, 6, 30,  5);
      g.fillStyle(0x102010); g.fillRect(68,12, 30,  2);
      g.fillStyle(0x0a1008); g.fillRect(33, 4, 2, 12);
      g.fillStyle(0x0a1008); g.fillRect(65, 4, 2, 12);
      g.fillStyle(0x1a3a0c, 0.40); g.fillRect(4,  6, 6, 4);
      g.fillStyle(0x1a3a0c, 0.35); g.fillRect(42, 6, 8, 3);
      g.fillStyle(0x1a3a0c, 0.30); g.fillRect(72, 7,10, 3);
      g.generateTexture('platform-surface', 100, 16);
      g.destroy();
    }

    // ─── Power-up dash 20×20 ──────────────────────────────────────────────
    {
      const g = mk();
      g.fillStyle(0xffcc02, 0.3); g.fillCircle(10, 10, 10);
      g.fillStyle(0xffcc02, 0.8); g.fillCircle(10, 10,  7);
      g.fillStyle(0xffffff, 1.0);
      // Flèche dash
      g.fillTriangle(4, 10, 10, 5, 10, 15);
      g.fillRect(10, 8, 8, 4);
      g.generateTexture('powerup-dash', 20, 20);
      g.destroy();
    }

    // ─── Checkpoint inactif 20×32 — cristal gris ─────────────────────────
    {
      const g = mk();
      g.fillStyle(0x263040); g.fillRect(8, 0, 4, 8);
      g.fillStyle(0x37464f);
      g.fillTriangle(10, 2, 18, 16, 2, 16);
      g.fillRect(2, 16, 16, 8);
      g.fillTriangle(2, 24, 18, 24, 10, 32);
      g.fillStyle(0x455a64);
      g.fillTriangle(10, 4, 16, 16, 4, 16);
      g.fillRect(4, 16, 12, 4);
      g.generateTexture('checkpoint-off', 20, 32);
      g.destroy();
    }

    // ─── Checkpoint actif 20×32 — cristal cyan pulsant ────────────────────
    {
      const g = mk();
      g.fillStyle(0x00b8d4); g.fillRect(8, 0, 4, 8);
      g.fillStyle(0x0097a7);
      g.fillTriangle(10, 2, 18, 16, 2, 16);
      g.fillRect(2, 16, 16, 8);
      g.fillTriangle(2, 24, 18, 24, 10, 32);
      g.fillStyle(0x26c6da);
      g.fillTriangle(10, 4, 16, 16, 4, 16);
      g.fillRect(4, 16, 12, 4);
      g.fillStyle(0x80deea); g.fillRect(9, 6, 2, 10);
      g.generateTexture('checkpoint-on', 20, 32);
      g.destroy();
    }

    // ─── Heal orb 14×14 — orbe rose ───────────────────────────────────────
    {
      const g = mk();
      g.fillStyle(0xe91e63, 0.4); g.fillCircle(7, 7, 7);
      g.fillStyle(0xf06292, 0.9); g.fillCircle(7, 7, 5);
      g.fillStyle(0xfce4ec, 1.0); g.fillCircle(5, 5, 2);
      g.generateTexture('heal-orb', 14, 14);
      g.destroy();
    }

    // ─── Memory fragment 16×16 — fragment hexagonal violet ───────────────
    {
      const g = mk();
      g.fillStyle(0x4a0080, 0.5); g.fillCircle(8, 8, 8);
      g.fillStyle(0x9c27b0, 0.9); g.fillCircle(8, 8, 6);
      g.fillStyle(0xce93d8);
      g.fillTriangle(8, 2, 13, 7, 8, 12);
      g.fillTriangle(8, 4, 3, 9, 8, 14);
      g.fillStyle(0xf3e5f5); g.fillRect(7, 5, 2, 6);
      g.generateTexture('memory-fragment', 16, 16);
      g.destroy();
    }

    // ─── Boss Guardian 64×80 — golem géant violet ────────────────────────
    {
      const g = mk();
      // Couronne
      g.fillStyle(0x4a0080);
      g.fillRect(14, 0, 6, 8);  g.fillRect(26, 0, 6, 8);  g.fillRect(38, 0, 6, 8);
      // Tête
      g.fillStyle(0x1a0630); g.fillRect(8, 6, 48, 24);
      g.fillStyle(0x2d0c50); g.fillRect(12, 9, 40, 18);
      // Yeux (grands)
      g.fillStyle(0x7b1fa2); g.fillRect(14, 12, 12, 10);
      g.fillStyle(0x7b1fa2); g.fillRect(38, 12, 12, 10);
      g.fillStyle(0xe040fb); g.fillRect(16, 13, 8, 7);
      g.fillStyle(0xe040fb); g.fillRect(40, 13, 8, 7);
      g.fillStyle(0xffffff); g.fillRect(17, 14, 3, 4);
      g.fillStyle(0xffffff); g.fillRect(41, 14, 3, 4);
      // Cou
      g.fillStyle(0x120420); g.fillRect(22, 30, 20, 6);
      // Corps
      g.fillStyle(0x0e021e); g.fillRect(4, 36, 56, 30);
      g.fillStyle(0x1e0836); g.fillRect(8, 40, 16, 22);
      g.fillStyle(0x1e0836); g.fillRect(40, 40, 16, 22);
      g.fillStyle(0x2d0c50); g.fillRect(24, 38, 16, 24);
      // Rune centrale (gros)
      g.fillStyle(0x9c27b0); g.fillRect(29, 42, 6, 2);
      g.fillStyle(0x9c27b0); g.fillRect(31, 40, 2, 6);
      g.fillStyle(0xe040fb); g.fillRect(30, 43, 4, 1);
      // Bras
      g.fillStyle(0x0e021e); g.fillRect(0, 38, 8, 20);
      g.fillStyle(0x0e021e); g.fillRect(56, 38, 8, 20);
      g.fillStyle(0x4a0080); g.fillRect(0, 56, 8, 4);
      g.fillStyle(0x4a0080); g.fillRect(56, 56, 8, 4);
      // Jambes
      g.fillStyle(0x0a011a); g.fillRect(10, 66, 18, 14);
      g.fillStyle(0x0a011a); g.fillRect(36, 66, 18, 14);
      g.fillStyle(0x1a0630); g.fillRect(8, 76, 22, 4);
      g.fillStyle(0x1a0630); g.fillRect(34, 76, 22, 4);
      g.generateTexture('boss', 64, 80);
      g.destroy();
    }

    // ═══ TEXTURES DÉCORATIVES ════════════════════════════════════════════

    // ─── deco-stalactite 12×28 — stalactite pierre bleue ──────────────────
    {
      const g = mk();
      g.fillStyle(0x0e1c2e); g.fillRect(2, 0, 8, 4);
      g.fillStyle(0x0c1828); g.fillRect(2, 4, 8, 6);
      g.fillStyle(0x101e30); g.fillRect(3, 0, 6, 22);
      g.fillStyle(0x142438); g.fillRect(3, 0, 3, 18);   // reflet gauche
      g.fillStyle(0x0a1624); g.fillRect(7, 0, 2, 18);   // ombre droite
      g.fillStyle(0x0e1a2a); g.fillRect(4, 22, 4, 4);
      g.fillStyle(0x0c1626); g.fillRect(5, 26, 2, 2);
      g.fillStyle(0x00b8d4, 0.20); g.fillRect(6, 2, 1, 20);
      g.fillStyle(0x00e5ff, 0.12); g.fillRect(5, 6, 1, 10);
      g.generateTexture('deco-stalactite', 12, 28);
      g.destroy();
    }

    // ─── deco-chain 8×36 — chaîne métallique ──────────────────────────────
    {
      const g = mk();
      for (let i = 0; i < 5; i++) {
        const y = i * 7;
        if (i % 2 === 0) {
          g.fillStyle(0x1c1410); g.fillRect(1, y+1, 6, 5);
          g.fillStyle(0x2c2018); g.fillRect(2, y+2, 4, 3);
          g.fillStyle(0x3a2a1c); g.fillRect(2, y+2, 2, 1);
          g.fillStyle(0x0e0c0a); g.fillRect(2, y+4, 4, 1);
        } else {
          g.fillStyle(0x1c1410); g.fillRect(3, y,  2, 7);
          g.fillStyle(0x2c2018); g.fillRect(3, y+1, 2, 5);
          g.fillStyle(0x3a2a1c); g.fillRect(3, y+1, 1, 2);
        }
      }
      g.generateTexture('deco-chain', 8, 36);
      g.destroy();
    }

    // ─── deco-pipe 14×52 — tuyau vapeur industriel ────────────────────────
    {
      const g = mk();
      g.fillStyle(0x1c1008); g.fillRect(2, 0, 10, 52);
      g.fillStyle(0x2c1c10); g.fillRect(3, 0,  8, 52);
      g.fillStyle(0x381e10); g.fillRect(3, 0,  4, 52);
      g.fillStyle(0x140c06); g.fillRect(9, 0,  3, 52);
      [8, 24, 40].forEach(by => {
        g.fillStyle(0x100a04); g.fillRect(0, by,   14, 6);
        g.fillStyle(0x2a1a0c); g.fillRect(1, by+1, 12, 4);
        g.fillStyle(0x3c2414); g.fillRect(2, by+1,  6, 2);
        g.fillStyle(0x0c0804); g.fillRect(2, by+3, 10, 1);
      });
      g.fillStyle(0xff6600, 0.18); g.fillRect(3, 18, 8, 1);
      g.fillStyle(0xff8800, 0.10); g.fillRect(3, 17, 8, 3);
      g.generateTexture('deco-pipe', 14, 52);
      g.destroy();
    }

    // ─── deco-column 22×70 — colonne brisée envahie de mousse ─────────────
    {
      const g = mk();
      g.fillStyle(0x18280e); g.fillRect(3, 0, 16, 56);
      g.fillStyle(0x1e3014); g.fillRect(4, 0, 14, 56);
      g.fillStyle(0x263818); g.fillRect(4, 0,  5, 56);
      g.fillStyle(0x141e0c); g.fillRect(13, 0,  5, 56);
      for (let i = 0; i < 3; i++) { g.fillStyle(0x1a2c10, 0.45); g.fillRect(5+i*4, 0, 1, 56); }
      g.fillStyle(0x162210); g.fillRect(0, 0, 22, 5);
      g.fillStyle(0x1c2c14); g.fillRect(1, 1, 20, 4);
      g.fillStyle(0x243618); g.fillRect(1, 1,  8, 2);
      g.fillStyle(0x14200c); g.fillRect(0, 52, 22, 8);
      g.fillStyle(0x1a2a12); g.fillRect(1, 53, 20, 6);
      g.fillStyle(0x223214); g.fillRect(1, 53,  7, 2);
      g.fillStyle(0x1a4008, 0.50); g.fillRect(3, 10, 5, 8);
      g.fillStyle(0x224a0c, 0.40); g.fillRect(14,18, 4, 6);
      g.fillStyle(0x1a4008, 0.35); g.fillRect(4, 34, 7, 4);
      g.fillStyle(0x2a5a10, 0.60); g.fillRect(3,  8, 2, 4);
      g.fillStyle(0x2a5a10, 0.50); g.fillRect(14,16, 2, 3);
      g.fillStyle(0x0c1a08); g.fillRect(11, 5, 1, 42);
      g.generateTexture('deco-column', 22, 70);
      g.destroy();
    }

    // ─── deco-grass 32×14 — touffe d'herbe ────────────────────────────────
    {
      const g = mk();
      [[2,6],[5,4],[7,5],[9,3],[11,6],[14,4],[16,3],[18,5],
       [20,6],[22,4],[24,3],[26,5],[28,6],[30,4]].forEach(([bx, h]) => {
        const dark = (bx%2===0) ? 0x2a5010 : 0x224010;
        const mid  = (bx%2===0) ? 0x3a7018 : 0x30601a;
        const tip  = (bx%2===0) ? 0x4a9020 : 0x408018;
        g.fillStyle(dark); g.fillRect(bx, 14-h, 1, h);
        g.fillStyle(mid);  g.fillRect(bx, 14-h, 1, Math.floor(h*0.65));
        g.fillStyle(tip);  g.fillRect(bx, 14-h, 1, 2);
      });
      g.generateTexture('deco-grass', 32, 14);
      g.destroy();
    }

    // ─── Platform 100×16 — pierre cristalline (Biome 0) ──────────────────
    {
      const g = mk();
      // Pierre cristalline (Biome 0) — 3 blocs avec shading
      g.fillStyle(0x182230); g.fillRect(0, 0, 100, 16);
      g.fillStyle(0x00e5ff); g.fillRect(0, 0, 100, 1);
      g.fillStyle(0x00c8dc); g.fillRect(0, 1, 100, 1);
      g.fillStyle(0x2a4056); g.fillRect(0, 2, 100, 2);
      g.fillStyle(0x243650); g.fillRect(1,  4, 32, 11);
      g.fillStyle(0x2e4460); g.fillRect(2,  5, 30,  5);
      g.fillStyle(0x1c2e46); g.fillRect(2, 11, 30,  3);
      g.fillStyle(0x243650); g.fillRect(35, 4, 30, 11);
      g.fillStyle(0x2e4460); g.fillRect(36, 5, 28,  5);
      g.fillStyle(0x1c2e46); g.fillRect(36,11, 28,  3);
      g.fillStyle(0x243650); g.fillRect(67, 4, 32, 11);
      g.fillStyle(0x2e4460); g.fillRect(68, 5, 30,  5);
      g.fillStyle(0x1c2e46); g.fillRect(68,11, 30,  3);
      g.fillStyle(0x10182a); g.fillRect(33, 3, 2, 13);
      g.fillStyle(0x10182a); g.fillRect(65, 3, 2, 13);
      g.fillStyle(0x00b8d4, 0.18); g.fillRect(14,  6, 1, 8);
      g.fillStyle(0x00b8d4, 0.14); g.fillRect(82, 10, 8, 1);
      g.fillStyle(0x0c1422); g.fillRect(0, 14, 100, 2);
      g.generateTexture('platform', 100, 16);
      g.destroy();
    }

    // ─── Ground 1600×40 — sol en briques pleine largeur ───────────────────
    {
      const g = mk();
      g.fillStyle(0x141e28); g.fillRect(0, 0, 1600, 40);
      // Surface supérieure
      g.fillStyle(0x354a60); g.fillRect(0, 0, 1600, 2);
      g.fillStyle(0x283a4e); g.fillRect(0, 2, 1600, 3);
      // Rangée 1 de briques (40 × 40px)
      for (let i = 0; i < 40; i++) {
        const bx = i * 40;
        const c = (i % 2 === 0) ? 0x1c2c3e : 0x1a2a3a;
        g.fillStyle(c);          g.fillRect(bx + 1, 6, 38, 14);
        g.fillStyle(c + 0x060a0e); g.fillRect(bx + 1, 7, 38, 5);
      }
      // Rangée 2 décalée
      for (let i = 0; i < 41; i++) {
        const bx = i * 40 - 20;
        if (bx + 1 >= 0 && bx + 39 <= 1600) {
          const c = (i % 2 === 0) ? 0x172232 : 0x15202e;
          g.fillStyle(c);          g.fillRect(bx + 1, 22, 38, 17);
          g.fillStyle(c + 0x040609); g.fillRect(bx + 1, 23, 38, 5);
        }
      }
      // Joints horizontaux
      g.fillStyle(0x0b1520); g.fillRect(0, 4,  1600, 2);
      g.fillStyle(0x0b1520); g.fillRect(0, 20, 1600, 2);
      // Joints verticaux rangée 1
      for (let i = 1; i < 40; i++) {
        g.fillStyle(0x0b1520); g.fillRect(i * 40, 6, 1, 14);
      }
      // Joints verticaux rangée 2
      for (let i = 0; i < 41; i++) {
        const bx = i * 40 - 20;
        if (bx > 0 && bx < 1600) { g.fillStyle(0x0b1520); g.fillRect(bx, 22, 1, 18); }
      }
      g.generateTexture('ground', 1600, 40);
      g.destroy();
    }

    // ─── bg-brick 64×64 — pierres gothiques avec runes (Biome 0) ──────────
    {
      const g = mk();
      g.fillStyle(0x030810); g.fillRect(0, 0, 64, 64);
      // Rangée 1
      g.fillStyle(0x0c1828); g.fillRect(0, 0, 30, 18);
      g.fillStyle(0x0e1c30); g.fillRect(1, 1, 28, 16);
      g.fillStyle(0x162a42); g.fillRect(1, 1, 28, 3);
      g.fillStyle(0x0a1622); g.fillRect(1, 14, 28, 3);
      g.fillStyle(0x14243c); g.fillRect(1, 1, 2, 16);
      g.fillStyle(0x0e1c2e); g.fillRect(32, 0, 32, 18);
      g.fillStyle(0x101e32); g.fillRect(33, 1, 30, 16);
      g.fillStyle(0x182e44); g.fillRect(33, 1, 30, 3);
      g.fillStyle(0x0c1826); g.fillRect(33, 14, 30, 3);
      g.fillStyle(0x020507); g.fillRect(0, 18, 64, 2);
      g.fillStyle(0x020507); g.fillRect(30, 0, 2, 18);
      // Rangée 2 décalée
      g.fillStyle(0x0a1624); g.fillRect(0, 20, 14, 18);
      g.fillStyle(0x0e1c2c); g.fillRect(1, 21, 12, 16);
      g.fillStyle(0x14243c); g.fillRect(1, 21, 12, 3);
      g.fillStyle(0x0c1a2a); g.fillRect(16, 20, 30, 18);
      g.fillStyle(0x10202e); g.fillRect(17, 21, 28, 16);
      g.fillStyle(0x162e44); g.fillRect(17, 21, 28, 3);
      g.fillStyle(0x0a1a26); g.fillRect(17, 34, 28, 3);
      g.fillStyle(0x0e1c2e); g.fillRect(48, 20, 16, 18);
      g.fillStyle(0x121e32); g.fillRect(49, 21, 14, 16);
      g.fillStyle(0x182e44); g.fillRect(49, 21, 14, 3);
      g.fillStyle(0x020507); g.fillRect(0, 38, 64, 2);
      g.fillStyle(0x020507); g.fillRect(14, 20, 2, 18);
      g.fillStyle(0x020507); g.fillRect(46, 20, 2, 18);
      // Rangée 3
      g.fillStyle(0x0c1828); g.fillRect(0, 40, 30, 18);
      g.fillStyle(0x0e1c30); g.fillRect(1, 41, 28, 16);
      g.fillStyle(0x162a42); g.fillRect(1, 41, 28, 3);
      g.fillStyle(0x0a1622); g.fillRect(1, 54, 28, 3);
      g.fillStyle(0x0e1c2e); g.fillRect(32, 40, 32, 18);
      g.fillStyle(0x101e32); g.fillRect(33, 41, 30, 16);
      g.fillStyle(0x182e44); g.fillRect(33, 41, 30, 3);
      g.fillStyle(0x020507); g.fillRect(0, 58, 64, 2);
      g.fillStyle(0x020507); g.fillRect(30, 40, 2, 18);
      // Rangée 4 partielle
      g.fillStyle(0x0a1624); g.fillRect(0, 60, 14, 4);
      g.fillStyle(0x0c1a2a); g.fillRect(16, 60, 30, 4);
      g.fillStyle(0x0e1c2e); g.fillRect(48, 60, 16, 4);
      g.fillStyle(0x020507); g.fillRect(14, 60, 2, 4);
      g.fillStyle(0x020507); g.fillRect(46, 60, 2, 4);
      // Lézarde cyan (pierre droite rangée 1)
      g.fillStyle(0x010305); g.fillRect(44, 2, 1, 13);
      g.fillStyle(0x003a5a, 0.22); g.fillRect(43, 2, 3, 13);
      // Rune gravée (pierre centrale rangée 2)
      g.fillStyle(0x020a1c); g.fillRect(23, 26, 8, 7);
      g.fillStyle(0x004466, 0.55); g.fillRect(26, 27, 2, 5);
      g.fillStyle(0x004466, 0.55); g.fillRect(24, 29, 6, 2);
      g.fillStyle(0x0090b8, 0.18); g.fillRect(23, 26, 8, 7);
      // Humidité (tache rangée 3)
      g.fillStyle(0x060c18, 0.35); g.fillRect(5, 43, 7, 11);
      g.generateTexture('bg-brick', 64, 64);
      g.destroy();
    }

    // ─── Crystal 24×28 — gemme teal à facettes ────────────────────────────
    {
      const g = mk();
      // Forme principale
      g.fillStyle(0x0097a7);
      g.fillTriangle(12, 0, 23, 12, 1, 12);
      g.fillRect(1, 12, 22, 8);
      g.fillTriangle(1, 20, 23, 20, 12, 28);
      // Facette claire
      g.fillStyle(0x26c6da);
      g.fillTriangle(12, 2, 20, 12, 4, 12);
      g.fillRect(4, 12, 16, 5);
      // Reflet
      g.fillStyle(0x80deea);
      g.fillTriangle(12, 4, 17, 11, 7, 11);
      g.fillRect(7, 11, 10, 4);
      // Spéculaire
      g.fillStyle(0xe0f7fa);
      g.fillTriangle(12, 5, 15, 10, 9, 10);
      g.fillRect(9, 10, 4, 2);
      // Ombre droite
      g.fillStyle(0x00626d);
      g.fillTriangle(14, 12, 23, 20, 23, 12);
      g.fillTriangle(14, 20, 23, 20, 12, 28);
      g.generateTexture('crystal', 24, 28);
      g.destroy();
    }

    // ─── NPC Oracle 32×48 — figure encapuchonnée aux yeux violets ─────────
    {
      const g = mk();
      // Capuche
      g.fillStyle(0x0e0620); g.fillTriangle(4, 0, 28, 0, 22, 8);
      g.fillStyle(0x0e0620); g.fillRect(4, 0, 24, 16);
      g.fillStyle(0x1a0c36); g.fillRect(6, 2, 20, 12);
      // Yeux lumineux
      g.fillStyle(0xce93d8); g.fillRect(8, 4, 5, 5);
      g.fillStyle(0xce93d8); g.fillRect(19, 4, 5, 5);
      g.fillStyle(0xf3e5f5); g.fillRect(9, 5, 2, 3);
      g.fillStyle(0xf3e5f5); g.fillRect(20, 5, 2, 3);
      g.fillStyle(0x4a0a6e); g.fillRect(10, 6, 2, 2);
      g.fillStyle(0x4a0a6e); g.fillRect(21, 6, 2, 2);
      // Robe
      g.fillStyle(0x09041a); g.fillRect(2, 16, 28, 22);
      g.fillStyle(0x120630); g.fillRect(4, 18, 10, 18);
      g.fillStyle(0x120630); g.fillRect(18, 18, 10, 18);
      // Rune pectorale
      g.fillStyle(0x9c27b0); g.fillRect(14, 20, 4, 2);
      g.fillStyle(0x9c27b0); g.fillRect(15, 18, 2, 6);
      g.fillStyle(0x7b1fa2); g.fillRect(12, 22, 8, 1);
      // Bas de robe
      g.fillStyle(0x09041a); g.fillRect(0, 36, 32, 12);
      g.fillStyle(0x180730); g.fillRect(2, 44, 12, 4);
      g.fillStyle(0x180730); g.fillRect(18, 44, 12, 4);
      g.generateTexture('npc', 32, 48);
      g.destroy();
    }

    // ─── Exit A 52×70 — portail gardienne (vert émeraude) ─────────────────
    {
      const g = mk();
      g.fillStyle(0x2a3640); g.fillRect(0, 8, 52, 62);
      g.fillStyle(0x3a4a5a); g.fillRect(0, 8, 7, 62);
      g.fillStyle(0x3a4a5a); g.fillRect(45, 8, 7, 62);
      g.fillStyle(0x3a4a5a); g.fillRect(0, 0, 52, 10);
      g.fillStyle(0x2e6b30); g.fillRect(16, 1, 20, 8);
      // Intérieur portal (dégradé concentrique)
      g.fillStyle(0x1a3d1a); g.fillRect(7, 10, 38, 60);
      g.fillStyle(0x2e7d32); g.fillRect(9, 12, 34, 56);
      g.fillStyle(0x43a047); g.fillRect(11, 14, 30, 52);
      g.fillStyle(0x66bb6a); g.fillRect(15, 18, 22, 44);
      g.fillStyle(0xa5d6a7); g.fillRect(19, 22, 14, 36);
      g.fillStyle(0xdcedc8); g.fillRect(23, 26, 6, 28);
      // Ornements
      g.fillStyle(0x4a7a44); g.fillRect(1, 22, 5, 2);
      g.fillStyle(0x4a7a44); g.fillRect(46, 22, 5, 2);
      g.fillStyle(0x4a7a44); g.fillRect(1, 38, 5, 2);
      g.fillStyle(0x4a7a44); g.fillRect(46, 38, 5, 2);
      g.generateTexture('exit-a', 52, 70);
      g.destroy();
    }

    // ─── Exit B 52×70 — portail reset (rouge sang) ────────────────────────
    {
      const g = mk();
      g.fillStyle(0x2a3640); g.fillRect(0, 8, 52, 62);
      g.fillStyle(0x3a4a5a); g.fillRect(0, 8, 7, 62);
      g.fillStyle(0x3a4a5a); g.fillRect(45, 8, 7, 62);
      g.fillStyle(0x3a4a5a); g.fillRect(0, 0, 52, 10);
      g.fillStyle(0x7a2020); g.fillRect(16, 1, 20, 8);
      g.fillStyle(0x3d0000); g.fillRect(7, 10, 38, 60);
      g.fillStyle(0xb71c1c); g.fillRect(9, 12, 34, 56);
      g.fillStyle(0xc62828); g.fillRect(11, 14, 30, 52);
      g.fillStyle(0xd32f2f); g.fillRect(15, 18, 22, 44);
      g.fillStyle(0xef5350); g.fillRect(19, 22, 14, 36);
      g.fillStyle(0xffcdd2); g.fillRect(23, 26, 6, 28);
      g.fillStyle(0x8a2020); g.fillRect(1, 22, 5, 2);
      g.fillStyle(0x8a2020); g.fillRect(46, 22, 5, 2);
      g.fillStyle(0x8a2020); g.fillRect(1, 38, 5, 2);
      g.fillStyle(0x8a2020); g.fillRect(46, 38, 5, 2);
      g.generateTexture('exit-b', 52, 70);
      g.destroy();
    }

    // ─── Indicateur [E] 24×24 ─────────────────────────────────────────────
    {
      const g = mk();
      g.fillStyle(0x061020);   g.fillRoundedRect(0, 0, 24, 24, 5);
      g.fillStyle(0x00e5ff);   g.fillRoundedRect(1, 1, 22, 22, 4);
      g.fillStyle(0x061020);   g.fillRoundedRect(2, 2, 20, 20, 3);
      g.fillStyle(0x00e5ff);
      g.fillRect(7, 5, 10, 2); g.fillRect(7, 11, 8, 2);
      g.fillRect(7, 17, 10, 2); g.fillRect(7, 5, 2, 14);
      g.generateTexture('indicator', 24, 24);
      g.destroy();
    }

    // ─── Glow 48×48 — halo radial pour blend additif ──────────────────────
    {
      const g = mk();
      [[24,0.03],[20,0.06],[16,0.12],[12,0.22],[8,0.38],[5,0.58],[2,0.9],[1,1.0]]
        .forEach(([r, a]) => { g.fillStyle(0xffffff, a); g.fillCircle(24, 24, r); });
      g.generateTexture('glow', 48, 48);
      g.destroy();
    }

    // ─── Particle 6×6 — orbe flottant ─────────────────────────────────────
    {
      const g = mk();
      g.fillStyle(0x4fc3f7, 0.3);  g.fillCircle(3, 3, 3);
      g.fillStyle(0x80deea, 0.65); g.fillCircle(3, 3, 2);
      g.fillStyle(0xe0f7fa, 1.0);  g.fillCircle(3, 3, 1);
      g.generateTexture('particle', 6, 6);
      g.destroy();
    }
  }

  // ─── Spritesheet ARIA (9 frames × 32px, hauteur 48px) ───────────────────
  _generatePlayerSheet(mk) {
    const g = mk();
    const C = {
      h1:0x07101e, h2:0x0d1f35, h3:0x1a3a5c, h4:0x2d5a80,
      v1:0x00e5ff, v2:0x80f7ff, v3:0x0097a7,
      b1:0x080f1e, b2:0x0d1f35, b3:0x1e3a5a,
      c1:0x00b8d4, c2:0x00e5ff, c3:0x80f7ff,
      a1:0x0a1929, a2:0x0f2238, a3:0x1d3d5e,
      l1:0x080f1e, l2:0x0d1a28, l3:0x162e4a, l4:0x254b6e,
    };

    // Dessine un frame à l'offset ox avec les paramètres d'animation donnés
    const f = (ox, opts = {}) => {
      const {
        by = 0,
        llx = 0, lly = 0,
        rlx = 0, rly = 0,
        lay = 0, ray = 0,
        vd = false, cb = false, dj = false,
        fwdLeg = 'r',
      } = opts;

      const vc   = dj ? C.v2 : vd ? C.v3 : C.v1;
      const core = dj ? C.c3 : cb ? C.c2 : C.c1;

      // Antenne
      g.fillStyle(C.h2); g.fillRect(ox+14, by,   4, 2);
      g.fillStyle(vc);   g.fillRect(ox+15, by,   2, 2);

      // Casque (approx arrondi)
      g.fillStyle(C.h1); g.fillRect(ox+10, by+2, 12, 2);
      g.fillStyle(C.h2); g.fillRect(ox+9,  by+2, 14, 2);
      g.fillStyle(C.h2); g.fillRect(ox+8,  by+3, 16,12);
      g.fillStyle(C.h3); g.fillRect(ox+10, by+4, 10, 8);
      g.fillStyle(C.h4); g.fillRect(ox+11, by+5,  4, 3);
      g.fillStyle(C.h4); g.fillRect(ox+11, by+5,  2, 5);

      // Visière
      g.fillStyle(vc);   g.fillRect(ox+9,  by+8, 14, 5);
      if (!vd) { g.fillStyle(C.v2); g.fillRect(ox+10, by+9, 5, 2); }
      g.fillStyle(C.h1);
      g.fillRect(ox+9,  by+8,  2, 2);  g.fillRect(ox+21, by+8,  2, 2);
      g.fillRect(ox+9,  by+11, 1, 2);  g.fillRect(ox+22, by+11, 1, 2);

      // Cou
      g.fillStyle(C.b1); g.fillRect(ox+13, by+15, 6, 3);

      // Épaulières
      g.fillStyle(C.h3); g.fillRect(ox+3,  by+14, 6, 8);
      g.fillStyle(C.h3); g.fillRect(ox+23, by+14, 6, 8);
      g.fillStyle(C.h4); g.fillRect(ox+4,  by+15, 4, 2);
      g.fillStyle(C.h4); g.fillRect(ox+24, by+15, 4, 2);

      // Torse
      g.fillStyle(C.b2); g.fillRect(ox+8,  by+14, 16, 16);
      g.fillStyle(C.b3); g.fillRect(ox+9,  by+16,  5, 12);
      g.fillStyle(C.b3); g.fillRect(ox+18, by+16,  5, 12);
      g.fillStyle(C.b1); g.fillRect(ox+8,  by+29, 16,  1);

      // Noyau pectoral
      g.fillStyle(core); g.fillRect(ox+13, by+18, 6, 8);
      g.fillStyle(C.c2); g.fillRect(ox+14, by+19, 4, 6);
      g.fillStyle(C.c3); g.fillRect(ox+14, by+19, 2, 2);
      if (dj) {
        g.fillStyle(0x00ffff);
        g.fillRect(ox+12, by+17, 8, 1); g.fillRect(ox+12, by+26, 8, 1);
        g.fillRect(ox+11, by+18, 1, 8); g.fillRect(ox+20, by+18, 1, 8);
      }

      // Bras
      g.fillStyle(C.a2); g.fillRect(ox+2,  by+16+lay, 5, 9);
      g.fillStyle(C.a3); g.fillRect(ox+3,  by+17+lay, 2, 6);
      g.fillStyle(C.a1); g.fillRect(ox+2,  by+25+lay, 4, 6);
      g.fillStyle(vc);   g.fillRect(ox+2,  by+30+lay, 4, 1);
      g.fillStyle(C.a2); g.fillRect(ox+25, by+16+ray, 5, 9);
      g.fillStyle(C.a3); g.fillRect(ox+26, by+17+ray, 2, 6);
      g.fillStyle(C.a1); g.fillRect(ox+25, by+25+ray, 4, 6);
      g.fillStyle(vc);   g.fillRect(ox+25, by+30+ray, 4, 1);

      // Bassin
      g.fillStyle(C.b1); g.fillRect(ox+9,  by+30, 14, 5);
      g.fillStyle(C.b2); g.fillRect(ox+10, by+30, 12, 4);
      g.fillStyle(C.b3); g.fillRect(ox+12, by+31,  8, 2);

      // Jambes (la jambe avant est dessinée en dernier)
      const drawL = () => {
        const Y = by + 35 + lly;
        g.fillStyle(C.l2); g.fillRect(ox+9+llx,  Y,    7, 6);
        g.fillStyle(C.l3); g.fillRect(ox+10+llx, Y+1,  3, 4);
        g.fillStyle(C.l1); g.fillRect(ox+9+llx,  Y+6,  6, 5);
        g.fillStyle(C.l3); g.fillRect(ox+8+llx,  Y+10, 9, 2);
        g.fillStyle(C.l4); g.fillRect(ox+9+llx,  Y+10, 6, 1);
      };
      const drawR = () => {
        const Y = by + 35 + rly;
        g.fillStyle(C.l2); g.fillRect(ox+16+rlx, Y,    7, 6);
        g.fillStyle(C.l3); g.fillRect(ox+17+rlx, Y+1,  3, 4);
        g.fillStyle(C.l1); g.fillRect(ox+16+rlx, Y+6,  6, 5);
        g.fillStyle(C.l3); g.fillRect(ox+15+rlx, Y+10, 9, 2);
        g.fillStyle(C.l4); g.fillRect(ox+16+rlx, Y+10, 6, 1);
      };
      if (fwdLeg === 'l') { drawR(); drawL(); }
      else                 { drawL(); drawR(); }
    };

    // ── 9 frames ──────────────────────────────────────────────────────────
    f(0*32);                                                              // 0 idle A
    f(1*32, { by:1, vd:true });                                          // 1 idle B
    f(2*32, { lly:-2, llx:-1, rly:1, lay:-2, ray:2, fwdLeg:'l' });     // 2 walk A
    f(3*32, { by:1 });                                                    // 3 walk B
    f(4*32, { rly:-2, rlx:-1, lly:1, ray:-2, lay:2 });                  // 4 walk C
    f(5*32, { by:1 });                                                    // 5 walk D
    f(6*32, { lly:-4, rly:-4, lay:-3, ray:-3, cb:true });               // 6 jump
    f(7*32, { lly:1,  rly:1,  llx:-1, rlx:1, lay:3,  ray:3  });        // 7 fall
    f(8*32, { lly:-5, rly:-5, lay:-4, ray:-4, dj:true });               // 8 djump

    g.generateTexture('aria-sheet', 32 * 9, 48);
    g.destroy();
  }

  _registerAnimations() {
    const T = (n) => ({ key: 'aria-sheet', frame: n });
    const sheet = this.textures.get('aria-sheet');
    for (let i = 0; i < 9; i++) sheet.add(i, 0, i * 32, 0, 32, 48);

    this.anims.create({ key:'aria-idle',  frames:[T(0),T(1)],                frameRate:3,  repeat:-1 });
    this.anims.create({ key:'aria-walk',  frames:[T(2),T(3),T(4),T(5)],     frameRate:10, repeat:-1 });
    this.anims.create({ key:'aria-jump',  frames:[T(6)],                     frameRate:1,  repeat:0  });
    this.anims.create({ key:'aria-fall',  frames:[T(7)],                     frameRate:1,  repeat:0  });
    this.anims.create({ key:'aria-djump', frames:[T(8)],                     frameRate:1,  repeat:0  });
  }
}
