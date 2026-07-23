# EchoVault

> Mini-jeu Metroidvania 2D — Projet MetroidvanIA | ESGI 4AL | 2026

Un robot archéologue explore des ruines souterraines pour retrouver sa mémoire perdue. La campagne d'environ 15 minutes se déroule en cinq actes, avec huit souvenirs, trois témoins, un boss en trois phases et deux parcours de fin exclusifs décidés avant le combat final.

## Équipe

| Membre | Rôle | GitHub |
|---|---|---|
| Adrien | Développeur principal | — |
| Elie | Développeur / Game Design | — |

## Jouer

**Build en ligne :** [https://bori-to.github.io/EchoVault/](https://bori-to.github.io/EchoVault/)

## Lancer en local

```bash
# Prérequis : Node.js 18+
npm install
npm run dev        # Serveur de développement sur http://localhost:5173
npm run build      # Build de production dans /build
npm run test       # Tests unitaires (Vitest)
```

## Contrôles

| Action | Touche |
|---|---|
| Déplacement | `←` `→` ou `A` `D` |
| Saut | `Espace` |
| Double saut *(à débloquer)* | `Espace` × 2 |
| Dash *(à débloquer)* | `Shift` |
| Interaction / Dialogue | `E` |
| Paramètres / Pause | `P` |
| Portail de test du boss | `E` devant le portail jaune au départ *(désactivable dans Paramètres)* |

## Structure du projet

```
EchoVault/
├── docs/               # Dossier de faisabilité, architecture, risques
├── prompts_logs/       # Journal des échanges LLM (livrable évalué)
├── src/
│   ├── game/           # Code source Phaser 3
│   └── assets/         # Sprites, tilemaps, audio, dialogues
├── tests/              # Tests unitaires Vitest
└── build/              # Build de production (généré)
```

## Stack technique

- **Moteur :** Phaser 3.60+ (JavaScript ES6)
- **Bundler :** Vite
- **Tests :** Vitest
- **CI/CD :** GitHub Actions → GitHub Pages (`master`)
- **Graphismes :** textures procédurales Canvas/Phaser et une image de cinématique générée avec l'outil d'image OpenAI via Codex
- **Audio :** effets synthétisés avec Web Audio API ; aucun fichier musical tiers
- **Voix :** synthèse vocale française fournie à l'exécution par Web Speech API et les voix du navigateur/système

## Documents

- [Étude de faisabilité - PDF final (10 pages)](docs/feasibility_report.pdf)
- [Source Markdown de l'étude](docs/feasibility_report.md)
- [Architecture technique](docs/architecture.md)
- [Analyse des risques](docs/risk_analysis.md)
- [Rapport de tests](docs/test_report.md)
- [Rapport de playtests](docs/playtest_report.md)
- [Rapport de bugs](docs/bug_report.md)
- [Journal des erreurs et solutions](docs/error_journal.md)
- [Journal des prompts LLM](prompts_logs/)
- [Crédits et licences](ACKNOWLEDGEMENTS.md)
- [Licence MIT du projet](LICENSE)
- [Avis des composants tiers](public/THIRD_PARTY_NOTICES.txt)

## Licence

Le code et les contenus propres au projet sont distribués sous [licence MIT](LICENSE), dans la limite des droits détenus par l'équipe. Les assets, services IA et composants tiers sont détaillés dans [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md).
