# Prompt Log — Séance 3 — Code & Systèmes

**Équipe :** Adrien, Elie | **Projet :** EchoVault | **Promotion :** 4AL  
**Séance :** S3 | **Date :** 10 juin 2026

---

## Entrée #001

**Date :** 10/06/2026 | **Auteur :** Adrien | **Séance :** S3

**Contexte :** Générer PlayerController.js gérant les mouvements, le saut simple et le double saut avec détection de front montant (pas d'auto-répétition).

**Modèle & outil utilisé :** Claude Sonnet 4.x via GitHub Copilot (VS Code)

**Prompt envoyé :**

```
Génère un module JavaScript ES6 PlayerController pour Phaser 3 (Arcade Physics).
Contraintes :
- Constructeur prend (scene, player)
- Touches : flèches + WASD + ESPACE
- Mouvement horizontal : vitesse 180 px/s
- Saut avec détection de front montant (pas de rebond continu)
- Double saut : désactivé par défaut, activé via enableDoubleJump()
- setEnabled(bool) pour bloquer les inputs pendant dialogue
- update() appelé chaque frame
- Zéro dépendance externe (pas de this.scene.input en dehors du constructeur)
```

**Output reçu :**

```javascript
// Extrait
update() {
  if (!this._enabled) return;
  if (this._cursors.left.isDown || this._wasd.left.isDown) {
    this._player.setVelocityX(-180);
  } else if (...) { ... }
  // gestion du saut
  const onGround = this._player.body.blocked.down;
  if (onGround) this._jumpCount = 0;
  // ...
}
```

**Modifications manuelles apportées :** Ajout du flag `_jumpHeld` pour la détection de front montant ; correction du reset de `_jumpCount` lors du retour au sol.

**Décision d'intégration :**
- [ ] ✅ Accepté tel quel
- [x] 🔧 Accepté après modifications
- [ ] ❌ Rejeté — raison : ______

**Qualité estimée de la réponse :** ⭐⭐⭐⭐ *(1 = inutilisable, 5 = parfait)*

**Hallucination détectée ?**
- [x] Non
- [ ] Oui — description : ______

---

## Entrée #002

**Date :** 10/06/2026 | **Auteur :** Adrien | **Séance :** S3

**Contexte :** Générer PowerManager.js (pure class) stockant les pouvoirs débloqués en localStorage avec fallback Node.js pour les tests Vitest.

**Modèle & outil utilisé :** Claude Sonnet 4.x via GitHub Copilot (VS Code)

**Prompt envoyé :**

```
Génère un module ES6 PowerManager (classe pure, sans Phaser).
API requise :
- unlock(name) : débloque un pouvoir (ignore si déjà débloqué)
- hasUnlocked(name) : bool
- getAll() : string[]
- reset() : vide la liste

Persistance localStorage (clé 'echovault_powers').
IMPORTANT : wrapper try/catch autour de localStorage pour que les tests 
Vitest (environnement Node.js sans window) fonctionnent sans erreur.
```

**Output reçu :**

```javascript
export class PowerManager {
  constructor() {
    this._powers = new Set();
    try {
      const saved = localStorage.getItem('echovault_powers');
      if (saved) JSON.parse(saved).forEach(p => this._powers.add(p));
    } catch (_) {}
  }
  // ...
}
```

**Modifications manuelles apportées :** Aucune — output directement intégrable.

**Décision d'intégration :**
- [x] ✅ Accepté tel quel
- [ ] 🔧 Accepté après modifications
- [ ] ❌ Rejeté — raison : ______

**Qualité estimée de la réponse :** ⭐⭐⭐⭐⭐ *(1 = inutilisable, 5 = parfait)*

**Hallucination détectée ?**
- [x] Non
- [ ] Oui — description : ______

---

## Entrée #003

**Date :** 10/06/2026 | **Auteur :** Elie | **Séance :** S3

**Contexte :** Générer DialogueManager.js avec panneau de dialogue fixé à la caméra, texte de l'interlocuteur, et choix numérotés avec effet sur GameStateManager.

**Modèle & outil utilisé :** Claude Sonnet 4.x via GitHub Copilot (VS Code)

**Prompt envoyé :**

```
Génère un DialogueManager Phaser 3 ES6 module.
Contraintes :
- Constructeur (scene, gameStateManager)
- startDialogue(data, onComplete) : data = { name, nodes:[{id,text,choices:[{label,next,effect}]}] }
- Panneau bas d'écran 800x500, fixé caméra (setScrollFactor(0))
- Touche E pour avancer sans choix, touches 1/2/3 pour choisir
- effect appliqué → gsm.recordDecision(decision, value)
- isActive getter
- update() appelé chaque frame par GameScene
- Pas de Phaser.GameObjects.Container (problème scroll factor cascade)
```

**Output reçu :**

```javascript
startDialogue(data, onComplete) {
  this._data = data;
  this._onComplete = onComplete;
  this._currentNodeId = data.nodes[0].id;
  this._active = true;
  this._showNode(this._getNode(this._currentNodeId));
  this._uiElements.forEach(el => el.setVisible(true));
}
```

**Modifications manuelles apportées :** Correction du positionnement des éléments UI (panelY calculé pour canevas 800×500), ajout de `setDepth(100)` sur tous les éléments, correction du rendu des numKeys (1/2 → index 0/1).

**Décision d'intégration :**
- [ ] ✅ Accepté tel quel
- [x] 🔧 Accepté après modifications
- [ ] ❌ Rejeté — raison : ______

**Qualité estimée de la réponse :** ⭐⭐⭐⭐ *(1 = inutilisable, 5 = parfait)*

**Hallucination détectée ?**
- [x] Non
- [ ] Oui — description : ______

---

## Entrée #004

**Date :** 10/06/2026 | **Auteur :** Adrien | **Séance :** S3

**Contexte :** Générer GameScene.js — niveau principal du prototype avec layout de 8 plateformes, cristal de pouvoir, NPC Oracle, deux sorties alternatives.

**Modèle & outil utilisé :** Claude Sonnet 4.x via GitHub Copilot (VS Code)

**Prompt envoyé :**

```
Génère une GameScene Phaser 3 complète pour le prototype EchoVault.
Monde 1600x560, viewport caméra 800x500.

Éléments requis :
- Sol complet (texture 'ground', scale 16x1)
- 8 plateformes flottantes (texture 'platform')
- Cristal sur P2 → unlock('doubleJump') + enableDoubleJump() + events.emit('powerUnlocked')
- NPC Oracle sur P4, proximity check dist < 85, touche E → startDialogue()
- Porte verte (exit-a) sur P7 haute → fin 'guardian'
- Porte rouge (exit-b) sur sol → fin 'reset'
- Respawn si player.y > 580
- Lance HUDScene en parallèle via scene.launch('HUDScene', { pm, gsm })
- init() remet pm et gsm à zéro pour nouvelle partie

Utilise PlayerController, PowerManager, GameStateManager, DialogueManager.
```

**Output reçu :**

*La scène complète a été générée avec toutes les plateformes, collisions, callbacks de collision et dialogue inline.*

**Modifications manuelles apportées :** Ajout de `_floatMessage()` helper pour les notifications flottantes ; ajustement des positions Y des objets statiques pour correspondre exactement au sommet des plateformes ; ajout de la détection de proximité NPC dans `update()` avec indicateur visuel.

**Décision d'intégration :**
- [ ] ✅ Accepté tel quel
- [x] 🔧 Accepté après modifications
- [ ] ❌ Rejeté — raison : ______

**Qualité estimée de la réponse :** ⭐⭐⭐⭐ *(1 = inutilisable, 5 = parfait)*

**Hallucination détectée ?**
- [x] Non
- [ ] Oui — description : ______

---

## Registre des hallucinations — Séance 3

| # | Modèle | Prompt | Description | Correction |
|---|--------|--------|-------------|------------|
| — | —      | —      | Aucune hallucination détectée en S3 | — |
