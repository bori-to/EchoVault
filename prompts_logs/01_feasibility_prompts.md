# Prompt Log — Séance 1 — Étude de faisabilité

**Équipe :** Adrien, Elie | **Projet :** EchoVault | **Promotion :** 4AL  
**Séance :** S1 | **Date :** 10 juin 2026

---

## Entrée #001

**Date :** 10/06/2026 | **Auteur :** Adrien | **Séance :** S1

**Contexte :** Générer l'architecture modulaire du projet Phaser 3 pour un jeu Metroidvania avec les systèmes requis (pouvoirs, dialogues, fins alternatives).

**Modèle & outil utilisé :** Claude Sonnet 4.x via GitHub Copilot (VS Code)

**Prompt envoyé :**

```
Tu es un architecte logiciel senior spécialisé en jeux web 2D.
Je développe un jeu Metroidvania 2D appelé EchoVault avec Phaser 3 (version 3.60+).
Contraintes : JavaScript ES6, pas de TypeScript, pas de libs supplémentaires sauf Phaser.

Génère une architecture de dossiers et modules commentée, avec :
- Structure de répertoires complète
- Rôle de chaque module en 1 phrase
- Dépendances entre modules

Modules obligatoires : PlayerController, PowerManager, DialogueManager, 
GameStateManager (fins alternatives), CollisionManager, HUDManager.

Format : arborescence en code block plain text + tableau des modules.
```

**Output reçu :** *(voir docs/architecture.md — structure générée et adaptée)*

**Modifications manuelles apportées :** Ajout du module `CollisionManager` non prévu dans la réponse initiale ; renommage de `UIManager` en `HUDScene` pour correspondre au pattern Phaser natif.

**Décision d'intégration :** 🔧 Accepté après modifications

**Qualité estimée de la réponse :** ⭐⭐⭐⭐ (4/5)

**Hallucination détectée ?**
- Oui — Le LLM a suggéré d'utiliser `this.physics.add.collider` avec une syntaxe Phaser 2. Corrigé vers l'API Phaser 3 correcte.

---

## Entrée #002

**Date :** 10/06/2026 | **Auteur :** Elie | **Séance :** S1

**Contexte :** Générer la section "Architecture technique" du dossier de faisabilité.

**Modèle & outil utilisé :** Claude Sonnet 4.x via GitHub Copilot (VS Code)

**Prompt envoyé :**

```
Rédige la section "Architecture technique" du dossier de faisabilité de mon jeu.

Informations à utiliser :
- Nom du jeu : EchoVault
- Stack technique : Phaser 3.60+, JavaScript ES6, Vite, Vitest
- Outils IA utilisés : GitHub Copilot, Leonardo AI, Stable Diffusion XL, Suno AI
- Modules principaux : PlayerController, PowerManager, DialogueManager, 
  GameStateManager, CollisionManager, HUDScene, EndingScene
- Hébergement prévu : GitHub Pages

Format : prose structurée avec sous-sections, 300-500 mots, ton professionnel.
Ne pas inventer de détails techniques non mentionnés.
```

**Output reçu :** *(section intégrée et reformatée dans feasibility_report.md)*

**Modifications manuelles apportées :** Reformatage en Markdown, ajout du tableau comparatif frameworks, précisions sur les raisons du choix Phaser vs Godot.

**Décision d'intégration :** 🔧 Accepté après modifications

**Qualité estimée de la réponse :** ⭐⭐⭐⭐ (4/5)

**Hallucination détectée ?** Non

---

## Entrée #003

**Date :** 10/06/2026 | **Auteur :** Adrien | **Séance :** S1

**Contexte :** Générer un tableau d'analyse des risques pour le projet.

**Modèle & outil utilisé :** Claude Sonnet 4.x via GitHub Copilot (VS Code)

**Prompt envoyé :**

```
Génère un tableau d'analyse de risques pour un projet de jeu vidéo avec les 
caractéristiques suivantes :
- Jeu Metroidvania 2D web, Phaser 3, JavaScript ES6
- Équipe de 2 développeurs étudiants
- Durée : 4-6 semaines
- Majorité du code générée par IA (GitHub Copilot / Claude)

Pour chaque risque, fournir :
- Description
- Probabilité (Faible / Moyenne / Élevée)
- Impact (Faible / Moyen / Élevé)
- Mesure de mitigation concrète
- Responsable suggéré

Couvrir au moins : risques techniques, risques liés aux LLMs,
risques juridiques (licences assets IA), risques de planning.

Format : tableau Markdown.
```

**Output reçu :** *(tableau intégré dans docs/risk_analysis.md avec modifications)*

**Modifications manuelles apportées :** Ajout des risques R08 (perte données Git) et R09 (biais narration IA) non couverts par le LLM ; ajout de la matrice probabilité/impact et du plan de contingence.

**Décision d'intégration :** 🔧 Accepté après modifications

**Qualité estimée de la réponse :** ⭐⭐⭐ (3/5) — incomplet sur les risques éthiques

**Hallucination détectée ?** Non

---

## Registre des hallucinations — Séance 1

| # | Date | Modèle | Description | Comment détectée | Correction |
|---|---|---|---|---|---|
| 1 | 10/06/2026 | Claude Sonnet 4.x | Syntaxe Phaser 2 pour `physics.add.collider` | Vérification doc Phaser 3.60 | Corrigé vers API v3 |

---

## Stats séance 1

| Métrique | Valeur |
|---|---|
| Prompts logés cette séance | 3 |
| Hallucinations détectées | 1 |
| % accepté sans modification | 0% |
| % accepté après modification | 100% |
| % rejeté | 0% |
