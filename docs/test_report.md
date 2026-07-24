# Rapport de tests — EchoVault

| Élément | Valeur |
|---|---|
| Projet | EchoVault 0.2.0 |
| Date d'exécution | 24 juillet 2026 |
| Environnement local | Windows, Node.js 23.10.0, npm 10.9.2 |
| Moteur et outils | Phaser 3.90.0, Vite 5.4.21, Vitest 1.6.1 |
| Copie testée | État local courant du projet |

## 1. Résultat global

**Verdict des contrôles automatisés : réussi.** Les cinq fichiers de tests passent, soit **29 tests réussis sur 29**, sans test ignoré ni échec. Le build de production est également généré avec succès.

Ce verdict porte sur le périmètre automatisé décrit ci-dessous. Il ne remplace pas les vérifications visuelles et les parcours de jeu du [rapport de playtests](playtest_report.md).

## 2. Procédure reproductible

Depuis la racine du projet :

```bash
npm ci
npm test
npm run build
```

L'exécution locale fraîche du 24 juillet 2026 a donné :

| Commande | Résultat | Détail |
|---|---|---|
| `npm test` | Réussi | 5 fichiers, 29 tests, durée totale 1,16 s |
| `npm run build` | Réussi | 32 modules transformés en 7,68 s |

## 3. Résultats unitaires détaillés

| Suite | Tests | Durée | Comportements vérifiés |
|---|---:|---:|---|
| `AchievementManager.test.js` | 4/4 | 7 ms | Déblocage unique, refus d'un identifiant inconnu, persistance des fins, validité de la hiérarchie parent-enfant. |
| `BossStateMachine.test.js` | 5/5 | 8 ms | Passage unique dans les trois phases, reset depuis chaque phase, restauration des 20 PV, effacement des transitions, cinq morts successives sans accumulation. |
| `CharacterManager.test.js` | 4/4 | 9 ms | Présence des quatre personnages, statistiques différentes, arme propre à chaque personnage, sélection valide et refus d'un identifiant invalide. |
| `GameStateManager.test.js` | 9/9 | 9 ms | Décisions narratives, priorité du parcours choisi avant le boss, deux fins, valeurs par défaut, écrasement et remise à zéro. |
| `PowerManager.test.js` | 7/7 | 11 ms | État initial, déblocage, liste, absence de doublons, refus des pouvoirs inconnus et reset. |

## 4. Vérification du build

Vite a produit le dossier `build/` sans erreur. Les principaux artefacts sont :

| Artefact | Taille produite | Taille gzip |
|---|---:|---:|
| `index.html` | 0,56 kB | 0,36 kB |
| Cinématique MP4 originale — 4 séquences | 10 384,17 kB | — |
| Bundle JavaScript principal | 1 608,27 kB | 377,08 kB |

Un avertissement non bloquant signale que le bundle JavaScript dépasse 500 kB après minification. Le jeu reste constructible et déployable, mais un découpage dynamique constitue une optimisation future.

## 5. Intégration continue

Le workflow `.github/workflows/deploy-pages.yml` exécute `npm ci`, les tests puis le build avant le déploiement GitHub Pages. Une exécution réussie est consultable dans [GitHub Actions](https://github.com/bori-to/EchoVault/actions/runs/30026851880), et le résultat est publié sur [GitHub Pages](https://bori-to.github.io/EchoVault/).

## 6. Couverture et limites

Les gestionnaires de progression les plus déterministes sont couverts, notamment le boss, les personnages, les pouvoirs, les succès et l'état narratif. Les limites actuelles sont les suivantes :

- aucun seuil de couverture de code n'est configuré ;
- `DialogueManager`, `EnemyManager`, `PlayerController`, `SettingsManager`, `AudioManager` et `VoiceManager` n'ont pas encore de suite unitaire dédiée ;
- aucune suite navigateur automatisée ne couvre les collisions Phaser, les changements de scène, le rendu ou les entrées clavier ;
- les voix dépendent aussi des capacités de synthèse vocale du navigateur ;
- les performances et la lisibilité doivent être confirmées sur plusieurs tailles d'écran.

Ces points sont suivis dans le [rapport de playtests](playtest_report.md) et le [rapport de bugs](bug_report.md).
