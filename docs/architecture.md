# Architecture technique - EchoVault

**Projet :** MetroidvanIA - ESGI 4AL

**Version :** 2.0

**Mise à jour :** 23 juillet 2026

**Application déployée :** <https://bori-to.github.io/EchoVault/>

---

## 1. Vue d'ensemble

EchoVault est une application web monopage développée avec **Phaser 3** et **JavaScript ES6**. Son architecture repose sur deux niveaux :

1. des **scènes Phaser**, responsables des écrans, de l'affichage et du cycle de jeu ;
2. des **systèmes spécialisés**, responsables des règles de gameplay, des états persistants, des ennemis, du boss, des dialogues, du son et des paramètres.

Le jeu utilise une scène principale continue de 6 400 pixels de largeur. `GameScene` orchestre les cinq actes, les huit souvenirs, les trois PNJ narratifs, les pouvoirs, les ennemis, les checkpoints, le combat de boss et deux parcours finaux exclusifs.

```text
main.js
  |
  +-- BootScene
  |     Génération des textures et enregistrement des animations
  |
  +-- MenuScene
  |     +-- CharacterSelectScene
  |     +-- AchievementsScene
  |     +-- SettingsScene
  |
  +-- CinematicScene
  |
  +-- GameScene -------------------------+
  |     +-- HUDScene (en parallèle)      |
  |     +-- contrôleurs et managers      |
  |     +-- physique Arcade              |
  |     +-- événements de gameplay       |
  |                                      |
  +-- EndingScene <----------------------+
```

Le rendu logique utilise une base de 800 x 500 pixels avec `Phaser.Scale.EXPAND`. Les textes sont créés avec une résolution interne doublée afin de rester lisibles lors de l'agrandissement plein écran.

---

## 2. Structure réelle du dépôt

La structure ci-dessous correspond aux fichiers présents dans le dépôt au 23 juillet 2026.

```text
EchoVault/
|-- .github/
|   `-- workflows/
|       `-- deploy-pages.yml
|
|-- LICENSE
|-- ACKNOWLEDGEMENTS.md
|
|-- docs/
|   |-- architecture.md
|   |-- bug_report.md
|   |-- error_journal.md
|   |-- feasibility_report.md
|   |-- feasibility_report.pdf
|   |-- playtest_report.md
|   |-- risk_analysis.md
|   `-- test_report.md
|
|-- output/
|   `-- pdf/
|       `-- EchoVault_Livrable_1_Etude_Faisabilite.pdf
|
|-- public/
|   `-- THIRD_PARTY_NOTICES.txt
|
|-- prompts_logs/
|   |-- 00_conversation_piece_jointe_brute.txt
|   |-- 01_prompts_utilisateur_exacts.md
|   |-- 02_tracabilite_integrations_ia.md
|   `-- Prompt_Log_EchoVault.pdf
|
|-- scripts/
|   |-- generate-feasibility-pdf.mjs
|   `-- generate-prompt-log.mjs
|
|-- src/
|   |-- assets/
|   |   |-- cinematics/
|   |   |   `-- echo-vault-opening.jpg
|   |   `-- dialogues/
|   |       `-- npc_oracle.json
|   |
|   `-- game/
|       |-- main.js
|       |-- scenes/
|       |   |-- AchievementsScene.js
|       |   |-- BootScene.js
|       |   |-- CharacterSelectScene.js
|       |   |-- CinematicScene.js
|       |   |-- EndingScene.js
|       |   |-- GameScene.js
|       |   |-- HUDScene.js
|       |   |-- MenuScene.js
|       |   `-- SettingsScene.js
|       `-- systems/
|           |-- AchievementManager.js
|           |-- AudioManager.js
|           |-- BossManager.js
|           |-- BossStateMachine.js
|           |-- CharacterManager.js
|           |-- DialogueManager.js
|           |-- EnemyManager.js
|           |-- GameStateManager.js
|           |-- PlayerController.js
|           |-- PowerManager.js
|           |-- SettingsManager.js
|           `-- VoiceManager.js
|
|-- tests/
|   |-- AchievementManager.test.js
|   |-- BossStateMachine.test.js
|   |-- CharacterManager.test.js
|   |-- GameStateManager.test.js
|   `-- PowerManager.test.js
|
|-- build/
|   |-- assets/
|   `-- index.html
|
|-- ACKNOWLEDGEMENTS.md
|-- README.md
|-- index.html
|-- package.json
|-- package-lock.json
`-- vite.config.js
```

Il n'existe actuellement ni dossier `entities/`, ni classe `NPC.js`, ni `CollisionManager.js`, ni fichier `npc_fragment.json`. Les PNJ, les collisions et la géométrie du niveau sont assemblés directement par `GameScene` avec les managers spécialisés.

---

## 3. Point d'entrée et configuration Phaser

Le fichier `src/game/main.js` :

- importe et enregistre les neuf scènes ;
- configure Phaser en mode `AUTO` ;
- active Arcade Physics avec une gravité verticale de 700 ;
- configure le redimensionnement plein écran ;
- améliore la résolution des objets texte ;
- instancie l'unique objet `Phaser.Game` de l'application.

L'ordre d'enregistrement des scènes est :

```text
BootScene
MenuScene
CharacterSelectScene
AchievementsScene
SettingsScene
CinematicScene
GameScene
HUDScene
EndingScene
```

---

## 4. Scènes Phaser

| Scène | Responsabilité réelle | Entrées / sorties principales |
|---|---|---|
| `BootScene` | Charge l'image de cinématique, génère les textures procédurales et enregistre les animations. | Démarre `MenuScene`. |
| `MenuScene` | Affiche le menu principal et réinitialise son état lorsqu'une scène est réutilisée. | Ouvre la sélection, les succès ou les paramètres. |
| `CharacterSelectScene` | Présente ARIA, NYX, ATLAS et VOLT avec leurs statistiques et armes. | Enregistre le personnage puis ouvre `CinematicScene`. |
| `AchievementsScene` | Affiche l'arbre de 15 succès et son état persistant. | Retourne au menu ou aux paramètres en jeu. |
| `SettingsScene` | Gère volume, son, voix, guidage, secousses et portail de test du boss. | Reprend la partie, ouvre les succès ou retourne au menu. |
| `CinematicScene` | Joue l'introduction avec profondeur simulée, mouvements, narration et effets de glitch. | Démarre `GameScene`. |
| `GameScene` | Construit et orchestre le niveau, le joueur, les ennemis, les PNJ, les pouvoirs, le boss et deux parcours finaux exclusifs. | Lance `HUDScene`, puis `EndingScene`. |
| `HUDScene` | Affiche vie, pouvoirs, souvenirs, objectif, boss et notifications de succès. | Écoute les événements de `GameScene`. |
| `EndingScene` | Affiche la fin Gardienne ou Réinitialisation ainsi que les statistiques finales. | Permet une nouvelle partie ou un retour au menu. |

`HUDScene` fonctionne en parallèle de `GameScene`. Les autres scènes sont principalement exclusives et se remplacent avec `scene.start()`.

---

## 5. Systèmes de jeu

### 5.1 Systèmes de logique et de persistance

| Module | Rôle | Interface utile |
|---|---|---|
| `AchievementManager` | Définit 15 succès, enregistre les succès et les fins découvertes dans `localStorage`. | `unlock()`, `recordEnding()`, `isUnlocked()` |
| `BossStateMachine` | Machine à états du boss : reset, attente, phases 1 à 3, transitions et défaite. | `reset()`, `start()`, `damage()`, `completeTransition()` |
| `CharacterManager` | Déclare les quatre personnages, leurs statistiques et leurs armes. | `getCharacters()`, `selectCharacter()`, `getSelectedCharacter()` |
| `GameStateManager` | Enregistre les décisions morales, le parcours choisi et détermine la fin narrative. | `recordDecision()`, `getDecision()`, `getRoute()`, `getEnding()`, `reset()` |
| `PowerManager` | Stocke les pouvoirs débloqués et les persiste localement. | `unlock()`, `hasUnlocked()`, `getAll()`, `reset()` |
| `SettingsManager` | Stocke les options et migre les anciennes sauvegardes de paramètres. | `get()`, `set()`, `reset()` |

Ces modules contiennent peu ou pas de dépendances Phaser et constituent le cœur testable de l'application.

### 5.2 Systèmes liés au runtime Phaser

| Module | Rôle | Interface utile |
|---|---|---|
| `PlayerController` | Déplacements, saut, dash, bouclier et quatre familles d'armes. | `update()`, `setEnabled()`, `enableDoubleJump()`, `enableDash()`, `enableShield()` |
| `DialogueManager` | Construit l'interface de dialogue, navigue dans les nœuds et applique les effets de choix. | `startDialogue()`, `update()` |
| `EnemyManager` | Crée quatre types d'ennemis, gère leur IA, leurs tirs et leurs collisions. | `addCrawler()`, `addDrone()`, `addGuardian()`, `addSentinelle()`, `connect()`, `update()` |
| `BossManager` | Relie la machine à états aux sprites, projectiles, attaques, effets et temporisations du combat. | `spawn()`, `connect()`, `update()`, `hit()`, `resetAttempt()` |
| `AudioManager` | Produit les effets sonores synthétiques avec Web Audio API. | `play()`, `chord()` |
| `VoiceManager` | Sélectionne des voix françaises et pilote Web Speech API selon la persona. | `speak()`, `stop()`, `getSelectedVoiceName()` |

---

## 6. Personnages, armes et pouvoirs

`CharacterManager` fournit quatre profils :

| Personnage | Rôle | Arme |
|---|---|---|
| ARIA | Équilibrée | Laser Arc |
| NYX | Éclaireuse rapide | Lame d'Écho |
| ATLAS | Bastion résistant | Marteau sismique |
| VOLT | Assaut à distance | Canon plasma |

Les capacités de progression gérées par `PowerManager` et `PlayerController` sont :

- double saut ;
- dash ;
- bouclier absorbant un impact.

Les armes sont propres aux personnages, tandis que les pouvoirs sont acquis pendant la partie.

---

## 7. Niveau, narration et fins

Le monde est construit par `GameScene` sans tilemap externe. Les plateformes, murs, zones décoratives, ennemis, souvenirs, checkpoints et portes narratives sont décrits par des constantes et créés avec Arcade Physics.

Le déroulement principal est :

```text
Cinématique d'introduction
  -> Acte I : souvenirs et Oracle
  -> Acte II : Archiviste K-7
  -> Acte III : Écho de SOL et choix irréversible du parcours
       |-- Transmission
       |     -> Acte IV-A : arène du Gardien
       |     -> Acte V-A : ascension par les plateformes du relais
       |     `-> Fin Gardienne
       `-- Libération
             -> Acte IV-B : arène du Gardien
             -> Acte V-B : couloir inférieur et trois verrous ennemis
             `-> Fin Réinitialisation
```

Le choix chez SOL enregistre `final_route` avant le combat. Le boss n'apparaît que lorsque les huit souvenirs sont collectés et que les trois PNJ sont validés. Après sa défaite, `GameScene` ne construit et n'active que le parcours choisi : une voie verticale vers le relais de transmission, ou une voie basse dont la sortie reste verrouillée jusqu'à la destruction de trois ennemis. L'autre fin est inaccessible pendant cette partie. Le portail de test du boss sélectionne la route de libération pour permettre la recette rapide et reste désactivé par défaut dans `SettingsManager`.

### Format de dialogue

`DialogueManager.startDialogue()` reçoit un objet contenant un nom de PNJ et un tableau de nœuds. La navigation commence sur le nœud `start`. Un choix peut enregistrer un effet dans `GameStateManager`.

```json
{
  "name": "L'Oracle",
  "nodes": [
    {
      "id": "start",
      "text": "ARIA... tu te souviens de moi ?",
      "choices": [
        {
          "label": "Je te crois.",
          "next": "trust",
          "effect": {
            "decision": "trust_oracle",
            "value": true
          }
        }
      ]
    }
  ]
}
```

Le fichier `src/assets/dialogues/npc_oracle.json` conserve une version sérialisée du dialogue de l'Oracle. Les trois scripts narratifs actuellement joués sont assemblés par `GameScene` afin d'y intégrer les conditions propres aux actes.

---

## 8. Communication entre modules

`GameScene` utilise les événements Phaser pour découpler le gameplay du HUD.

| Événement | Émetteur | Consommateur | Usage |
|---|---|---|---|
| `hpChanged` | `GameScene` | `HUDScene` | Actualisation des points de vie. |
| `fragmentCollected` | `GameScene` | `HUDScene` | Compteur de souvenirs. |
| `powerUnlocked` | `GameScene` | `HUDScene` | Liste des pouvoirs et succès associés. |
| `objectiveChanged` | `GameScene` | `HUDScene` | Objectif narratif courant. |
| `bossSpawned`, `bossHit`, `bossPhaseChange` | `BossManager` via la scène | `HUDScene` | Affichage de la barre, des points de vie et de la phase du boss. |
| `achievementUnlocked` | `GameScene` | `HUDScene` | Notification de succès. |

Les dépendances principales sont :

```text
GameScene
  |-- PlayerController
  |-- EnemyManager
  |-- BossManager -> BossStateMachine
  |-- DialogueManager -> GameStateManager
  |-- PowerManager
  |-- SettingsManager
  |-- CharacterManager
  |-- AudioManager
  `-- VoiceManager

HUDScene
  `-- événements de GameScene

EndingScene
  `-- résultat et statistiques transmis par GameScene
```

---

## 9. Stockage local

Le jeu ne possède aucun serveur ni base de données. Les données persistantes sont enregistrées dans le navigateur :

| Clé | Contenu |
|---|---|
| `echovault.settings.v1` | Volume, son, voix, guidage, secousses et portail de test. |
| `echovault.achievements.v1` | Succès débloqués et fins découvertes. |
| `echovault_powers` | Pouvoirs débloqués ; réinitialisés au lancement d'une nouvelle partie. |

La sélection du personnage reste en mémoire JavaScript pour la partie courante.

---

## 10. Tests automatisés

Le projet utilise **Vitest 1.6.1** avec l'environnement Node. Cinq suites couvrent 29 tests :

| Suite | Domaine couvert |
|---|---|
| `AchievementManager.test.js` | Déblocage, doublons et persistance des succès. |
| `BossStateMachine.test.js` | Phases, transitions uniques, défaite et reset. |
| `CharacterManager.test.js` | Profils, sélection et armes. |
| `GameStateManager.test.js` | Décisions, priorité du parcours final, fins et réinitialisation. |
| `PowerManager.test.js` | Déblocage, lecture, persistance et reset des pouvoirs. |

Commandes reproductibles :

```bash
npm ci
npm test
npm run build
```

Les résultats de l'exécution locale, le détail des 29 cas et les limites de couverture sont consignés dans [`docs/test_report.md`](test_report.md). Les essais en jeu et la recette manuelle restante sont séparés dans [`docs/playtest_report.md`](playtest_report.md). Le registre consolidé des anomalies est disponible dans [`docs/bug_report.md`](bug_report.md), avec les analyses complètes dans [`docs/error_journal.md`](error_journal.md).

---

## 11. Build et déploiement continu

Le workflow réel est `.github/workflows/deploy-pages.yml`. Il se déclenche :

- à chaque push sur la branche `master` ;
- manuellement avec `workflow_dispatch`.

Pipeline :

```text
Checkout
  -> Node.js 20
  -> npm ci
  -> npm test
  -> npm run build
  -> upload du dossier build/
  -> déploiement GitHub Pages
```

Le job de déploiement dispose uniquement des permissions nécessaires : lecture du dépôt, écriture Pages et émission du jeton d'identité GitHub. La concurrence `pages` annule un ancien déploiement si une version plus récente est poussée.

**Dépôt :** <https://github.com/bori-to/EchoVault>

**Jeu publié :** <https://bori-to.github.io/EchoVault/>

**Branche de déploiement :** `master`

---

## 12. Limites connues et évolutions

- Les scripts des trois PNJ pourraient être déplacés dans des fichiers JSON séparés pour réduire la taille de `GameScene`.
- `GameScene` centralise encore la construction du monde et plusieurs règles narratives ; un découpage en données de niveau faciliterait l'ajout de contenu.
- `DialogueManager`, `EnemyManager`, `PlayerController`, `SettingsManager`, `AudioManager` et `VoiceManager` ne disposent pas encore de tests unitaires dédiés.
- Le bundle Phaser principal dépasse 500 Ko après minification ; un découpage dynamique pourrait améliorer le chargement initial.
- La licence MIT du projet, l'inventaire des assets et les conditions des outils sont documentés dans `LICENSE`, `ACKNOWLEDGEMENTS.md` et `public/THIRD_PARTY_NOTICES.txt`.

Cette documentation décrit uniquement les éléments effectivement présents. Toute nouvelle scène, donnée ou dépendance devra être ajoutée simultanément au code, aux tests et à ce document.
