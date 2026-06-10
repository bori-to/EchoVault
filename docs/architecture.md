# Architecture Technique — EchoVault

**Projet :** MetroidvanIA — ESGI 4AL  
**Version :** 1.0 | **Date :** 10 juin 2026

---

## 1. Vue d'ensemble

EchoVault est structuré selon une **architecture modulaire orientée scènes** (pattern natif Phaser 3), où chaque responsabilité est isolée dans un module ES6 dédié. Les modules de logique pure (sans dépendance Phaser) sont testables unitairement.

```
┌──────────────────────────────────────────────────────┐
│                      PHASER 3 GAME                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │BootScene │→ │MenuScene │→ │   GameScene(s)   │   │
│  └──────────┘  └──────────┘  └────────┬─────────┘   │
│                                        │              │
│              ┌─────────────────────────┘              │
│              ↓                                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │              SYSTÈMES DE JEU                    │ │
│  │  PlayerController  │  PowerManager              │ │
│  │  DialogueManager   │  GameStateManager          │ │
│  │  CollisionManager  │  HUDManager                │ │
│  └─────────────────────────────────────────────────┘ │
│              ↑                                        │
│  ┌──────────────────────────────────┐                 │
│  │          DONNÉES / ASSETS        │                 │
│  │  dialogues/*.json  │  tilemaps/  │                 │
│  │  sprites/          │  audio/     │                 │
│  └──────────────────────────────────┘                 │
└──────────────────────────────────────────────────────┘
```

---

## 2. Structure des répertoires

```
EchoVault/
├── docs/
│   ├── feasibility_report.md     # Étude de faisabilité (Livrable 1)
│   ├── architecture.md           # Ce fichier
│   └── risk_analysis.md          # Analyse des risques
│
├── prompts_logs/
│   ├── 01_feasibility_prompts.md # Prompts séance 1
│   ├── 02_assets_prompts.md      # Prompts génération assets
│   └── 03_code_prompts.md        # Prompts génération code
│
├── src/
│   ├── game/
│   │   ├── scenes/
│   │   │   ├── BootScene.js      # Chargement assets initial
│   │   │   ├── MenuScene.js      # Menu principal
│   │   │   ├── GameScene.js      # Scène de jeu principale
│   │   │   ├── HUDScene.js       # HUD (overlay superposé)
│   │   │   └── EndingScene.js    # Écran de fin (A ou B)
│   │   │
│   │   ├── entities/
│   │   │   ├── Player.js         # Sprite joueur + état
│   │   │   └── NPC.js            # Classe PNJ générique
│   │   │
│   │   ├── systems/
│   │   │   ├── PlayerController.js   # Inputs → déplacement + saut
│   │   │   ├── PowerManager.js       # Unlock / check pouvoirs
│   │   │   ├── DialogueManager.js    # Système de dialogue JSON
│   │   │   ├── GameStateManager.js   # Décisions joueur → fin
│   │   │   └── CollisionManager.js   # Gestion collisions tilemap
│   │   │
│   │   └── main.js               # Point d'entrée Phaser
│   │
│   └── assets/
│       ├── sprites/              # Spritesheets joueur, PNJ, ennemis
│       ├── tilemaps/             # Fichiers .tmj (Tiled JSON)
│       ├── tilesets/             # Images tileset PNG
│       ├── audio/                # BGM + SFX (.ogg / .mp3)
│       └── dialogues/            # Fichiers JSON des dialogues
│           ├── npc_oracle.json
│           └── npc_fragment.json
│
├── tests/
│   ├── PowerManager.test.js
│   ├── GameStateManager.test.js
│   └── DialogueManager.test.js
│
├── build/                        # Output Vite (gitignored sauf CI)
├── ACKNOWLEDGEMENTS.md
├── README.md
├── LICENSE
├── index.html                    # Entry point web
├── vite.config.js
└── package.json
```

---

## 3. Description des modules

### 3.1 Scènes Phaser

| Module | Rôle | Dépendances |
|---|---|---|
| `BootScene` | Précharge tous les assets (images, audio, tilemaps) | Phaser.Scene |
| `MenuScene` | Affiche le menu, gère nouvelle partie / continue | BootScene terminée |
| `GameScene` | Scène principale : physique, tilemaps, entités | Tous les systèmes |
| `HUDScene` | Overlay transparent : vie, pouvoirs, minimap | GameStateManager |
| `EndingScene` | Affiche la fin A ou B selon GameStateManager | GameStateManager |

### 3.2 Systèmes (logique pure, testables)

| Module | Rôle | Interface principale |
|---|---|---|
| `PlayerController` | Lit les inputs curseur/WASD, applique vélocité et saut | `update(cursors)` |
| `PowerManager` | Stocke les pouvoirs débloqués (Set), conditionne les actions | `unlock(name)`, `hasUnlocked(name)` |
| `DialogueManager` | Charge JSON de dialogue, gère l'arbre de choix | `startDialogue(npcId)`, `next()`, `choose(index)` |
| `GameStateManager` | Enregistre les décisions morales, détermine la fin | `recordDecision(key, value)`, `getEnding()` |
| `CollisionManager` | Configure les collisions Arcade Physics entre joueur et layers | `setup(player, layers)` |

### 3.3 Format des données de dialogue

```json
{
  "id": "oracle_01",
  "portrait": "npc_oracle",
  "nodes": [
    {
      "id": "start",
      "text": "Fragment 3/7 retrouvé. Tu te souviens de moi ?",
      "choices": [
        { "label": "Oui, je me souviens", "next": "remember", "effect": { "decision": "trust_oracle", "value": true } },
        { "label": "Non, tu m'es inconnu", "next": "forget", "effect": { "decision": "trust_oracle", "value": false } }
      ]
    },
    {
      "id": "remember",
      "text": "Bien. Alors tu sais ce que tu dois protéger.",
      "choices": []
    },
    {
      "id": "forget",
      "text": "C'est normal. La mémoire efface ce qui fait mal.",
      "choices": []
    }
  ]
}
```

---

## 4. Dépendances entre modules

```
GameScene
  ├── instancie → Player (entity)
  ├── instancie → NPC[] (entities)
  ├── utilise   → PlayerController (update loop)
  ├── utilise   → CollisionManager (create)
  ├── utilise   → DialogueManager (overlap callbacks)
  └── lit       → PowerManager (conditionne portes/sauts)

EndingScene
  └── lit → GameStateManager.getEnding()

HUDScene
  └── observe → GameStateManager (décisions) + PowerManager (pouvoirs)

PowerManager ←→ PlayerController (double saut, dash conditionnels)
GameStateManager ← DialogueManager (effets des choix de dialogue)
```

---

## 5. Flux de jeu principal

```
BootScene → MenuScene → GameScene(Niveau 1)
                              ↓
                    [Exploration + collecte pouvoirs]
                              ↓
                    [Interactions PNJ → décisions]
                              ↓
                    [Déverrouillage zones / pouvoirs]
                              ↓
                    GameScene(Niveau 2) → ... → Point de bascule
                              ↓
              ┌───────────────┴───────────────┐
         [trust_oracle = true]         [trust_oracle = false]
              ↓                               ↓
       EndingScene(FIN A)             EndingScene(FIN B)
       "Gardienne des Ruines"         "Réinitialisation Totale"
```

---

## 6. Architecture CI/CD

```yaml
# .github/workflows/deploy.yml (simplifié)
on: push (branch: main)
jobs:
  build-and-deploy:
    - npm install
    - npm run build       # vite build → /build
    - deploy → gh-pages   # GitHub Pages
```

Le build est automatiquement déployé sur GitHub Pages à chaque push sur `main`. L'URL de jeu sera : `https://[username].github.io/EchoVault/`
