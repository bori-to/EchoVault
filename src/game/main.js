/**
 * main.js — point d'entrée Phaser 3 pour EchoVault.
 * Configure le jeu et enregistre toutes les scènes.
 */
import Phaser from 'phaser';
import { BootScene }   from './scenes/BootScene.js';
import { MenuScene }   from './scenes/MenuScene.js';
import { GameScene }   from './scenes/GameScene.js';
import { HUDScene }    from './scenes/HUDScene.js';
import { EndingScene } from './scenes/EndingScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { CinematicScene } from './scenes/CinematicScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';

const config = {
  type: Phaser.AUTO,
  width:  800,
  height: 500,
  backgroundColor: '#04060d',
  scale: {
    // EXPAND occupe toute la surface disponible tout en conservant le ratio
    // du rendu 800×500. Contrairement à FIT, la zone visible du canvas est
    // élargie au lieu d'être complétée par des bandes noires.
    mode:        Phaser.Scale.EXPAND,
    autoCenter:  Phaser.Scale.CENTER_BOTH,
    width:       800,
    height:      500,
    expandParent: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 700 },
      debug: false,
    },
  },
  // Boot → Menu → Game (+ HUD en parallèle) → Ending
  scene: [BootScene, MenuScene, CharacterSelectScene, SettingsScene, CinematicScene, GameScene, HUDScene, EndingScene],
};

export default new Phaser.Game(config);
