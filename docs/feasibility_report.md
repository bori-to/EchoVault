# Étude de Faisabilité — EchoVault

**Projet :** MetroidvanIA — ESGI 4AL  
**Équipe :** Adrien (développeur), Elie (développeur)  
**Date :** 10 juin 2026  
**Version :** 1.0

---

## 1. Pitch du jeu

**EchoVault** est un jeu de plateforme Metroidvania 2D dans lequel le joueur incarne **ARIA**, un robot archéologue réveillé sans mémoire au cœur de ruines souterraines d'une ancienne civilisation. Pour retrouver son identité, ARIA doit explorer des chambres interconnectées, débloquer de nouvelles capacités mécaniques et interagir avec des entités numériques résiduelles (PNJ) qui gardent des fragments de son passé.

Le jeu propose **deux fins radicalement différentes** selon les choix moraux effectués tout au long de la partie : une fin où ARIA choisit de préserver les ruines et de coexister avec les IA anciennes, et une fin où elle efface tout pour renaître libre. La durée estimée de jeu est de **1h à 1h30**.

---

## 2. Plateformes cibles

| Plateforme | Support | Priorité |
|---|---|---|
| **Web (navigateur)** | Build HTML5 / WebGL via Phaser 3 | ✅ Principale |
| Desktop (via navigateur) | Compatible sans installation | ✅ Inclus |
| Mobile | Non ciblé (contrôles clavier requis) | ❌ Hors scope |

Le jeu sera hébergé sur **GitHub Pages** pour une accessibilité immédiate sans installation.

---

## 3. Choix technologiques

### 3.1 Moteur / Framework : Phaser 3

**Choix retenu :** [Phaser 3](https://phaser.io/) (version 3.60+), JavaScript ES6

**Justification :**

Phaser 3 est le framework de jeu 2D web le plus mature et documenté disponible en open source. Il offre nativement la physique Arcade (idéale pour les plateformers), la gestion de tilemaps Tiled, les animations de sprites, et les scènes — tous les composants dont EchoVault a besoin. Sa large communauté et son abondante documentation réduisent le risque d'hallucinations lors de la génération de code par IA.

| Critère | Phaser 3 | Godot (export web) | PixiJS |
|---|---|---|---|
| Facilité d'intégration web | ✅ Natif | ⚠️ Export WebAssembly lourd | ✅ Natif |
| Courbe d'apprentissage | Faible | Moyenne | Faible |
| Physique 2D intégrée | ✅ Arcade Physics | ✅ Complète | ❌ À ajouter |
| Support tilemaps | ✅ Tiled JSON | ✅ Tiled | ⚠️ Partiel |
| Compatibilité prompts IA | ✅ Très bonne (large corpus) | Moyenne | Moyenne |
| Build GitHub Pages | ✅ Simple | ⚠️ Fichiers lourds | ✅ Simple |

**Conclusion :** Phaser 3 est le choix optimal pour un projet web prioritaire avec une majorité de code généré par IA.

### 3.2 Langage : JavaScript ES6 (modules natifs)

Pas de transpilation (pas de TypeScript) pour simplifier la chaîne de build et maximiser la compatibilité avec les outputs des LLMs. Les modules ES6 (`import/export`) assurent une architecture modulaire claire.

---

## 4. Outils IA choisis

### 4.1 Comparatif des outils

| Usage | Outil A | Outil B | Choix retenu |
|---|---|---|---|
| Génération de code | **GitHub Copilot** | Cursor | GitHub Copilot |
| LLM pour architecture / debug | **Claude Sonnet 4.x** | GPT-4o | Claude Sonnet 4.x |
| Génération de sprites pixel art | **Leonardo AI** | DALL·E 3 | Leonardo AI |
| Génération de tilesets | **Stable Diffusion XL** | Midjourney | Stable Diffusion XL |
| Génération de musique | **Suno AI** | Udio | Suno AI |
| UI / Maquettes | **Figma** (manuel) | Magic Patterns | Figma |

### 4.2 Justifications

**GitHub Copilot** : Intégré directement dans VS Code, permet de générer du code Phaser 3 contextuellement avec accès au workspace. Idéal pour complétion et génération de blocs entiers.

**Claude Sonnet 4.x** : Meilleur reasoning pour l'architecture logicielle, la génération de systèmes complets (DialogueManager, PowerManager) et le debug. Contexte long permettant de passer l'ensemble d'un module.

**Leonardo AI** : Spécialisé dans les assets de jeux, supporte le pixel art 2D avec cohérence stylistique entre les générations (LoRA), crucial pour un jeu à style visuel unifié.

**Stable Diffusion XL (local)** : Génération de tilesets répétables sans coût, avec contrôle total sur le style. Assets CC0 garantis car générés par nous.

**Suno AI** : Génération de musique d'ambiance cohérente (dark sci-fi / ambient) pour les niveaux et les cutscenes, libre de droits pour usage académique.

---

## 5. Stack technique complète

```
EchoVault
├── Runtime         : JavaScript ES6 (modules natifs, pas de transpilation)
├── Moteur jeu      : Phaser 3.60+
├── Éditeur maps    : Tiled Map Editor (export JSON)
├── Assets images   : Leonardo AI + Stable Diffusion XL → PNG/spritesheet
├── Assets audio    : Suno AI → MP3/OGG
├── Build           : Vite (bundler léger, HMR pour dev, build optimisé)
├── Tests           : Vitest (tests unitaires des modules logiques)
├── CI/CD           : GitHub Actions (lint + build automatique sur push)
├── Hébergement     : GitHub Pages (branche gh-pages)
└── Versioning      : Git + GitHub (repo privé → public à la soutenance)
```

### Dépendances principales

| Package | Version | Rôle |
|---|---|---|
| `phaser` | `^3.60.0` | Moteur de jeu principal |
| `vite` | `^5.0.0` | Dev server + bundler |
| `vitest` | `^1.0.0` | Tests unitaires |

### Pipeline d'assets

```
Prompt IA → Image brute → Recadrage/retouche (Photoshop/GIMP) 
→ Export PNG transparent → Intégration src/assets/
→ Chargement dans Phaser (this.load.spritesheet / this.load.image)
```

---

## 6. Maquettes / Wireframes

> *Les wireframes ci-dessous sont des représentations textuelles ASCII des écrans clés. Des maquettes Figma détaillées seront livrées en complément.*

### 6.1 Écran Menu Principal

```
┌─────────────────────────────────────────────┐
│                  ECHO VAULT                 │
│           [ animation logo pulsé ]          │
│                                             │
│              ▶  NOUVELLE PARTIE             │
│                 CONTINUER                   │
│                 OPTIONS                     │
│                 QUITTER                     │
│                                             │
│    [ fond : ruines sombres animées ]        │
└─────────────────────────────────────────────┘
```

### 6.2 Écran de Jeu (niveau)

```
┌─────────────────────────────────────────────┐
│ ❤❤❤  ENERGIE: ████████░░  [DASH] [JUMP²]  │  ← HUD
├─────────────────────────────────────────────┤
│                                             │
│   [Plateforme]     [Ennemi]                 │
│                                             │
│        [ARIA →]                             │
│   ════════════════════  [Tilemap]           │
│                                             │
│  [Porte verrouillée]        [PNJ ici]       │
│ ════════════  ══════════════════════════   │
└─────────────────────────────────────────────┘
```

### 6.3 Boîte de Dialogue PNJ

```
┌─────────────────────────────────────────────┐
│                 [JEUX]                      │
│ ┌───────┐  ┌────────────────────────────┐   │
│ │ [PNJ] │  │ "Fragment 3/7 retrouvé.    │   │
│ │portrait│  │  Tu te souviens de moi ?" │   │
│ └───────┘  └────────────────────────────┘   │
│                                             │
│   ▶ [OUI, je me souviens]                  │
│     [NON, tu m'es inconnu]                  │
└─────────────────────────────────────────────┘
```

### 6.4 Écran de Fin (Fin A — Coexistence)

```
┌─────────────────────────────────────────────┐
│           [ Cutscene animée ]               │
│                                             │
│   ARIA s'intègre aux archives vivantes.     │
│   Les ruines restent. La mémoire demeure.   │
│                                             │
│          ╔═══════════════╗                  │
│          ║  FIN GARDIENNE ║                  │
│          ╚═══════════════╝                  │
│                                             │
│         [ MENU PRINCIPAL ]                  │
└─────────────────────────────────────────────┘
```

---

## 7. Plan de travail & Planning

### Répartition des rôles

| Membre | Rôle principal | Responsabilités |
|---|---|---|
| Adrien | Développeur principal | Architecture, systèmes (physique, pouvoirs, collisions), intégration Phaser |
| Elie | Développeur / Game Design | Level design (Tiled), système de dialogue, génération assets IA, narration |

### Planning sur 4 séances (+ travail personnel)

| Séance | Période | Objectifs | Livrable |
|---|---|---|---|
| **S1** | Semaine 1 | Setup repo, architecture décidée, maquettes, étude de faisabilité | **Livrable 1** (ce document) |
| **S2** | Semaine 2-3 | Prototype : personnage contrôlable, 1 niveau, collisions tilemap, 1 PNJ basique | **Livrable 2** (prototype jouable) |
| **S3** | Semaine 3-4 | Système de pouvoirs complet, 2+ niveaux, dialogues ramifiés, 2 chemins distincts | **Livrable 3** (code complet) |
| **S4** | Semaine 5-6 | Polish, tests, documentation finale, build déployé, soutenance | **Livrable Final** |

### Estimation des temps

| Tâche | Heures estimées |
|---|---|
| Setup environnement + architecture | 3h |
| Système de déplacement / physique | 4h |
| Tilemap + collisions | 3h |
| Système de pouvoirs (PowerManager) | 5h |
| Système de dialogue PNJ | 5h |
| Level design (2 niveaux + connexions) | 8h |
| GameStateManager + fins alternatives | 4h |
| HUD (vie, pouvoirs débloqués) | 3h |
| Génération et intégration assets IA | 6h |
| Tests unitaires | 3h |
| Documentation + prompt logs | 4h |
| **TOTAL** | **~48h** |

---

## 8. Analyse des risques

*Voir également `docs/risk_analysis.md` pour le tableau détaillé.*

### Risques principaux identifiés

**Risque 1 — Hallucinations API Phaser (Technique / Élevé)**  
Le LLM peut générer des appels à des méthodes Phaser dépréciées ou inexistantes. *Mitigation :* Toujours préciser la version dans les prompts, valider chaque output contre la documentation officielle Phaser 3.60.

**Risque 2 — Cohérence visuelle des assets IA (Technique / Moyen)**  
Les générations successives avec différents prompts peuvent produire des styles incohérents. *Mitigation :* Définir une palette fixe et un style précis en amont, utiliser le même modèle/LoRA sur Leonardo AI.

**Risque 3 — Droits sur les assets générés (Juridique / Faible)**  
L'utilisation commerciale d'assets IA est un cadre légal en évolution. *Mitigation :* Usage strictement académique, toutes les licences des outils utilisés autorisent l'usage éducatif, préférer assets CC0 quand possible.

**Risque 4 — Dépassement du scope (Planning / Élevé)**  
Un Metroidvania est complexe par nature. *Mitigation :* MVP strict défini — un seul niveau fonctionnel avec les 5 critères minimaux suffit pour la notation.

**Risque 5 — Qualité des outputs LLM pour la logique de jeu (IA / Moyen)**  
Les systèmes avec état (GameStateManager, fins alternatives) peuvent générer du code avec des bugs subtils. *Mitigation :* Tests unitaires systématiques avec Vitest pour ces modules critiques.

---

## Annexes

- `docs/architecture.md` — Détail de l'architecture modulaire
- `docs/risk_analysis.md` — Tableau complet d'analyse des risques
- `prompts_logs/01_feasibility_prompts.md` — Log des prompts utilisés pour ce livrable
- `README.md` — Instructions de démarrage du projet
