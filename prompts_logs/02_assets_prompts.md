# Prompt Log — Séance 2 — Assets & Prototype

**Équipe :** Adrien, Elie | **Projet :** EchoVault | **Promotion :** 4AL  
**Séance :** S2 | **Date :** 10 juin 2026

---

## Entrée #001

**Date :** 10/06/2026 | **Auteur :** Adrien | **Séance :** S2

**Contexte :** Générer des textures 2D procédurales dans Phaser 3 pour le prototype, sans assets externes, afin d'éviter la gestion du chargement de fichiers images.

**Modèle & outil utilisé :** Claude Sonnet 4.x via GitHub Copilot (VS Code)

**Prompt envoyé :**

```
Je développe un jeu Phaser 3 (Metroidvania 2D). Pour le prototype je ne veux pas 
de fichiers images externes. Génère une BootScene Phaser 3 qui crée programmatiquement 
toutes les textures nécessaires avec graphics.generateTexture() :
- player (32x44 robot cyan)
- platform (100x16 gris avec bord en haut)
- ground (100x40 sombre)
- crystal (24x20 diamant jaune)
- npc (32x44 robot violet)
- exit-a (48x60 porte verte)
- exit-b (48x60 porte rouge)
- indicator (22x22 icône [E])

Après create(), démarre la scène MenuScene.
Utilise la syntaxe Phaser 3.60+ (pas d'alias dépréciés).
```

**Output reçu :**

```javascript
// Extrait représentatif de la réponse
create() {
  const g = this.make.graphics({ x: 0, y: 0, add: false });
  // player
  g.fillStyle(0x00bcd4);
  g.fillRect(0, 0, 32, 44);
  g.generateTexture('player', 32, 44);
  g.clear();
  // ... (suite pour chaque texture)
  this.scene.start('MenuScene');
}
```

**Modifications manuelles apportées :** Ajout de détails visuels (bord teal sur platform, contour blanc sur crystal, liseré de la porte). Correction de l'ordre des appels `g.clear()` pour éviter accumulation de draw calls.

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

**Date :** 10/06/2026 | **Auteur :** Elie | **Séance :** S2

**Contexte :** Créer la MenuScene Phaser 3 avec un écran titre soigné : titre, sous-titre clignotant, bouton Nouvelle Partie, décor de ruines.

**Modèle & outil utilisé :** Claude Sonnet 4.x via GitHub Copilot (VS Code)

**Prompt envoyé :**

```
Génère une MenuScene Phaser 3 pour un jeu Metroidvania 2D appelé EchoVault.
Exigences :
- Fond sombre (#1a1a2e)
- Titre "ECHO VAULT" en grand (monospace, 64px, couleur cyan)
- Sous-titre clignotant "Appuie sur ESPACE pour commencer" (tween alpha)
- Bouton interactif "NOUVELLE PARTIE" qui lance la GameScene avec fadeOut 600ms
- Décorations : colonnes de ruines en arrière-plan (rectangles)
- ESPACE ou ENTRÉE déclenchent aussi le démarrage

Utilise la syntaxe Phaser 3.60+ ES6 module.
```

**Output reçu :**

```javascript
// Extrait représentatif
create() {
  this.add.rectangle(400, 250, 800, 500, 0x1a1a2e);
  this.add.text(400, 160, 'ECHO VAULT', { fontSize: '64px', ... })
    .setOrigin(0.5);
  const sub = this.add.text(400, 240, 'Appuie sur ESPACE...', {...}).setOrigin(0.5);
  this.tweens.add({ targets: sub, alpha: 0, yoyo: true, repeat: -1, duration: 900 });
  // ... bouton et gestion clavier
}
```

**Modifications manuelles apportées :** Ajout d'un effet de fondu en entrée (`cameras.main.fadeIn`), ajustement des couleurs du bouton (hover effect), annotation de chaque section du code.

**Décision d'intégration :**
- [ ] ✅ Accepté tel quel
- [x] 🔧 Accepté après modifications
- [ ] ❌ Rejeté — raison : ______

**Qualité estimée de la réponse :** ⭐⭐⭐⭐⭐ *(1 = inutilisable, 5 = parfait)*

**Hallucination détectée ?**
- [x] Non
- [ ] Oui — description : ______

---

*(Dupliquer le bloc ci-dessus pour chaque nouvel échange)*
