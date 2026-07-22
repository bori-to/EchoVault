/**
 * DialogueManager — gère l'affichage et la navigation des dialogues PNJ.
 * Déclenchement par appel à startDialogue(data, callback).
 * Navigation : touche E pour avancer, touches 1/2 pour les choix.
 * L'UI est fixée à la caméra (setScrollFactor 0).
 *
 * GÉNÉRÉ avec GitHub Copilot (Claude Sonnet 4.x) — revu et adapté manuellement.
 * Voir prompts_logs/03_code_prompts.md — Entrée #004
 */
import { audio } from './AudioManager.js';

export class DialogueManager {
  /**
   * @param {Phaser.Scene}      scene            - La scène Phaser active
   * @param {GameStateManager}  gameStateManager - Pour appliquer les effets des choix
   */
  constructor(scene, gameStateManager) {
    this.scene      = scene;
    this.gsm        = gameStateManager;
    this.isActive   = false;

    this._data        = null;
    this._nodeId      = null;
    this._onComplete  = null;
    this._uiElements  = [];

    // Touches de navigation
    this._eKey    = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._numKeys = [
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    ];

    this._buildUI();
    this._setUIVisible(false);
  }

  /**
   * Lance un dialogue.
   * @param {Object}   data       - Données JSON du dialogue { name, nodes[] }
   * @param {Function} onComplete - Appelé quand le dialogue se termine
   */
  startDialogue(data, onComplete = null) {
    this.isActive    = true;
    this._data       = data;
    this._onComplete = onComplete;
    this._setUIVisible(true);
    this._showNode('start');
  }

  /** À appeler dans update() de la scène. */
  update() {
    if (!this.isActive) return;

    const node = this._currentNode();
    if (!node) return;

    const hasChoices = node.choices && node.choices.length > 0;

    if (!hasChoices && Phaser.Input.Keyboard.JustDown(this._eKey)) {
      // Nœud terminal → fermeture
      this._endDialogue();
      return;
    }

    if (hasChoices) {
      for (let i = 0; i < Math.min(node.choices.length, 3); i++) {
        if (Phaser.Input.Keyboard.JustDown(this._numKeys[i])) {
          this._makeChoice(i);
          break;
        }
      }
    }
  }

  // ─── UI ────────────────────────────────────────────────────────────────────

  _buildUI() {
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    const panelH = 155;
    const panelY = H - panelH / 2 - 8; // centré en bas

    const makeFixed = (obj) => {
      obj.setScrollFactor(0).setDepth(100);
      this._uiElements.push(obj);
      return obj;
    };

    // Fond du panneau
    makeFixed(this.scene.add.rectangle(W / 2, panelY, W - 16, panelH, 0x050510, 0.92)
      .setStrokeStyle(2, 0x00e5ff));

    // Fond portrait
    makeFixed(this.scene.add.rectangle(52, panelY, 84, panelH - 16, 0x0d0d2e)
      .setStrokeStyle(1, 0x37474f));

    // Portrait (placeholder coloré)
    this._portrait = makeFixed(this.scene.add.rectangle(52, panelY, 52, 72, 0xce93d8));

    // Nom du PNJ
    this._nameTxt = makeFixed(this.scene.add.text(102, panelY - 62, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#00e5ff', fontStyle: 'bold',
    }));

    // Corps du texte
    this._bodyTxt = makeFixed(this.scene.add.text(102, panelY - 44, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#eceff1',
      wordWrap: { width: W - 130 }, lineSpacing: 4,
    }));

    // Slots de choix (3 max)
    this._choiceTxts = [];
    for (let i = 0; i < 3; i++) {
      const ct = makeFixed(this.scene.add.text(112, panelY + 28 + i * 20, '', {
        fontFamily: 'monospace', fontSize: '12px', color: '#90a4ae',
      }).setInteractive({ useHandCursor: true }));
      ct.on('pointerover', () => ct.setStyle({ color: '#00e5ff' }));
      ct.on('pointerout',  () => ct.setStyle({ color: '#90a4ae' }));
      ct.on('pointerdown', () => this._makeChoice(i));
      this._choiceTxts.push(ct);
    }

    // Astuce "Continuer"
    this._hintTxt = makeFixed(this.scene.add.text(W - 12, H - 12, '[E] Continuer', {
      fontFamily: 'monospace', fontSize: '10px', color: '#546e7a',
    }).setOrigin(1, 1));
  }

  _setUIVisible(visible) {
    this._uiElements.forEach(el => el.setVisible(visible));
  }

  // ─── Logique de navigation ─────────────────────────────────────────────────

  _showNode(nodeId) {
    const node = this._data.nodes.find(n => n.id === nodeId);
    if (!node) { this._endDialogue(); return; }

    this._nodeId = nodeId;
    audio.play('dialogue');
    this._nameTxt.setText(this._data.name || 'Inconnu');
    this._bodyTxt.setText(node.text);

    // Réinitialise les choix
    this._choiceTxts.forEach(ct => ct.setText(''));

    const hasChoices = node.choices && node.choices.length > 0;
    if (hasChoices) {
      node.choices.forEach((c, i) => {
        if (this._choiceTxts[i]) this._choiceTxts[i].setText(`[${i + 1}] ${c.label}`);
      });
      this._hintTxt.setVisible(false);
    } else {
      this._hintTxt.setVisible(true);
    }
  }

  _makeChoice(index) {
    const node = this._currentNode();
    if (!node?.choices || index >= node.choices.length) return;

    const choice = node.choices[index];
    audio.play('ui');

    // Applique l'effet sur le GameStateManager
    if (choice.effect && this.gsm) {
      this.gsm.recordDecision(choice.effect.decision, choice.effect.value);
    }

    choice.next ? this._showNode(choice.next) : this._endDialogue();
  }

  _endDialogue() {
    this.isActive = false;
    this._setUIVisible(false);
    if (this._onComplete) this._onComplete();
  }

  _currentNode() {
    return this._data?.nodes.find(n => n.id === this._nodeId);
  }
}
