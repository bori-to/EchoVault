/**
 * BootScene — génère toutes les textures programmatiquement (pas d'assets externes).
 * Approche prototype : graphismes en rectangle/cercle pour validation des mécaniques.
 * Les assets pixel-art réels seront intégrés en Livrable 3.
 */
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    this._generateTextures();
    this.scene.start('MenuScene');
  }

  _generateTextures() {
    const G = (w, h, fn) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      fn(g);
      g.generateTexture(null, w, h); // will be overwritten by key below
      return g;
    };

    // ── Player (ARIA) — robot cyan ──
    const pg = this.make.graphics({ x: 0, y: 0, add: false });
    pg.fillStyle(0x00e5ff); pg.fillRect(4, 0, 24, 14);   // tête
    pg.fillStyle(0x007c91); pg.fillRect(0, 14, 32, 26);  // corps
    pg.fillStyle(0xff1744); pg.fillRect(8, 3, 16, 8);    // visière
    pg.fillStyle(0x00b8d4); pg.fillRect(0, 36, 12, 8);   // jambe gauche
    pg.fillStyle(0x00b8d4); pg.fillRect(20, 36, 12, 8);  // jambe droite
    pg.generateTexture('player', 32, 44);
    pg.destroy();

    // ── Plateforme ──
    const platG = this.make.graphics({ x: 0, y: 0, add: false });
    platG.fillStyle(0x455a64); platG.fillRect(0, 0, 100, 16);
    platG.fillStyle(0x80cbc4); platG.fillRect(0, 0, 100, 3);   // bord lumineux
    platG.generateTexture('platform', 100, 16);
    platG.destroy();

    // ── Sol ──
    const gndG = this.make.graphics({ x: 0, y: 0, add: false });
    gndG.fillStyle(0x263238); gndG.fillRect(0, 0, 100, 40);
    gndG.fillStyle(0x455a64); gndG.fillRect(0, 0, 100, 5);
    gndG.generateTexture('ground', 100, 40);
    gndG.destroy();

    // ── Cristal de pouvoir (losange jaune) ──
    const cG = this.make.graphics({ x: 0, y: 0, add: false });
    cG.fillStyle(0xffd600); cG.fillRect(8, 0, 8, 8);
    cG.fillRect(4, 4, 16, 8); cG.fillRect(8, 12, 8, 8);
    cG.fillStyle(0xfff59d); cG.fillRect(9, 2, 4, 4);   // reflet
    cG.generateTexture('crystal', 24, 20);
    cG.destroy();

    // ── NPC Oracle — robot violet ──
    const nG = this.make.graphics({ x: 0, y: 0, add: false });
    nG.fillStyle(0xce93d8); nG.fillRect(4, 0, 24, 14);
    nG.fillStyle(0x6a1b9a); nG.fillRect(0, 14, 32, 26);
    nG.fillStyle(0x4a148c); nG.fillRect(8, 3, 16, 8);   // visière sombre
    nG.fillStyle(0xe040fb); nG.fillRect(14, 22, 4, 8);  // emblème
    nG.generateTexture('npc', 32, 44);
    nG.destroy();

    // ── Porte Fin A (Gardienne) — verte ──
    const eaG = this.make.graphics({ x: 0, y: 0, add: false });
    eaG.fillStyle(0x1b5e20); eaG.fillRect(0, 0, 48, 60);
    eaG.fillStyle(0x43a047); eaG.fillRect(4, 4, 40, 52);
    eaG.fillStyle(0xa5d6a7); eaG.fillRect(8, 8, 14, 14); eaG.fillRect(26, 8, 14, 14); // fenêtres
    eaG.fillStyle(0x1b5e20); eaG.fillRect(20, 42, 8, 14); // poignée
    eaG.generateTexture('exit-a', 48, 60);
    eaG.destroy();

    // ── Porte Fin B (Reset) — rouge ──
    const ebG = this.make.graphics({ x: 0, y: 0, add: false });
    ebG.fillStyle(0x7f0000); ebG.fillRect(0, 0, 48, 60);
    ebG.fillStyle(0xe53935); ebG.fillRect(4, 4, 40, 52);
    ebG.fillStyle(0xffcdd2); ebG.fillRect(8, 8, 14, 14); ebG.fillRect(26, 8, 14, 14);
    ebG.fillStyle(0x7f0000); ebG.fillRect(20, 42, 8, 14);
    ebG.generateTexture('exit-b', 48, 60);
    ebG.destroy();

    // ── Indicateur d'interaction [E] ──
    const iG = this.make.graphics({ x: 0, y: 0, add: false });
    iG.fillStyle(0xffffff, 0.9); iG.fillRoundedRect(0, 0, 22, 22, 4);
    iG.fillStyle(0x000000);
    iG.fillRect(5, 4, 10, 2); iG.fillRect(5, 10, 8, 2);   // E
    iG.fillRect(5, 16, 10, 2); iG.fillRect(5, 4, 2, 14);
    iG.generateTexture('indicator', 22, 22);
    iG.destroy();
  }
}
