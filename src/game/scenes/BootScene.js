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

    // ─── Platform 100×16 — pierre avec arête cyan ─────────────────────────
    {
      const g = mk();
      g.fillStyle(0x243040); g.fillRect(0, 0, 100, 16);
      // Arête lumineuse (teal)
      g.fillStyle(0x00e5ff); g.fillRect(0, 0, 100, 2);
      g.fillStyle(0x00b8d4); g.fillRect(0, 2, 100, 2);
      // Deux briques de pierre (50px chacune)
      g.fillStyle(0x2e3f52); g.fillRect(1, 4, 48, 11);
      g.fillStyle(0x374c62); g.fillRect(2, 5, 46, 5);
      g.fillStyle(0x2b3c4e); g.fillRect(51, 4, 48, 11);
      g.fillStyle(0x344959); g.fillRect(52, 5, 46, 5);
      // Joint de mortier
      g.fillStyle(0x151e2a); g.fillRect(49, 3, 2, 13);
      // Fissures
      g.fillStyle(0x151e2a); g.fillRect(16, 8, 1, 6);
      g.fillStyle(0x151e2a); g.fillRect(70, 10, 7, 1);
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

    // ─── bg-brick 64×64 — carreau mur de pierre (TileSprite fond) ─────────
    {
      const g = mk();
      g.fillStyle(0x070b12); g.fillRect(0, 0, 64, 64);
      // Rangée 1
      g.fillStyle(0x0b1220); g.fillRect(1, 1, 30, 18);
      g.fillStyle(0x0d1525); g.fillRect(2, 2, 28, 8);
      g.fillStyle(0x0b1220); g.fillRect(33, 1, 30, 18);
      g.fillStyle(0x0d1525); g.fillRect(34, 2, 28, 8);
      // Rangée 2 (décalée)
      g.fillStyle(0x091018); g.fillRect(1, 21, 14, 18);
      g.fillStyle(0x0b131e); g.fillRect(2, 22, 12, 7);
      g.fillStyle(0x091018); g.fillRect(17, 21, 30, 18);
      g.fillStyle(0x0b131e); g.fillRect(18, 22, 28, 7);
      g.fillStyle(0x091018); g.fillRect(49, 21, 14, 18);
      g.fillStyle(0x0b131e); g.fillRect(50, 22, 12, 7);
      // Rangée 3
      g.fillStyle(0x0b1220); g.fillRect(1, 41, 30, 22);
      g.fillStyle(0x0d1525); g.fillRect(2, 42, 28, 8);
      g.fillStyle(0x0b1220); g.fillRect(33, 41, 30, 22);
      g.fillStyle(0x0d1525); g.fillRect(34, 42, 28, 8);
      // Joints
      g.fillStyle(0x04080f);
      g.fillRect(0, 19, 64, 2);   g.fillRect(0, 39, 64, 2);
      g.fillRect(31, 0, 2, 19);   g.fillRect(31, 39, 2, 25);
      g.fillRect(15, 19, 2, 20);  g.fillRect(47, 19, 2, 20);
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
