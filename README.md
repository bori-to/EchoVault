# EchoVault

> Mini-jeu Metroidvania 2D — Projet MetroidvanIA | ESGI 4AL | 2026

Un robot archéologue explore des ruines souterraines pour retrouver sa mémoire perdue. La campagne d'environ 15 minutes se déroule en cinq actes, avec huit souvenirs, trois témoins, un boss en trois phases et deux fins selon votre choix final.

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
- **Assets IA :** Leonardo AI (sprites), Stable Diffusion XL (tilesets), Suno AI (audio)

## Documents

- [Étude de faisabilité - PDF final (10 pages)](docs/feasibility_report.pdf)
- [Source Markdown de l'étude](docs/feasibility_report.md)
- [Architecture technique](docs/architecture.md)
- [Analyse des risques](docs/risk_analysis.md)
- [Journal des prompts LLM](prompts_logs/)
- [Crédits et licences](ACKNOWLEDGEMENTS.md)

## Licence

Ce projet est réalisé dans un cadre académique. Voir [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md) pour les licences des assets et outils utilisés.
