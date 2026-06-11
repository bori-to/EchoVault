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

const config = {
  type: Phaser.AUTO,
  width:  800,
  height: 500,
  backgroundColor: '#04060d',
  scale: {
    mode:        Phaser.Scale.FIT,
    autoCenter:  Phaser.Scale.CENTER_BOTH,
    width:       800,
    height:      500,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 520 },
      debug: false,
    },
  },
  // Boot → Menu → Game (+ HUD en parallèle) → Ending
  scene: [BootScene, MenuScene, GameScene, HUDScene, EndingScene],
};

export default new Phaser.Game(config);
