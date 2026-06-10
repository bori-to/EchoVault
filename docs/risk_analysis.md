# Analyse des Risques — EchoVault

**Projet :** MetroidvanIA — ESGI 4AL  
**Équipe :** Adrien, Elie  
**Date :** 10 juin 2026

---

## Tableau des risques

| # | Risque | Catégorie | Probabilité | Impact | Mesure de mitigation | Responsable |
|---|---|---|---|---|---|---|
| R01 | **Hallucinations API Phaser** — Le LLM génère des méthodes Phaser inexistantes ou dépréciées (ex: méthodes v2 en v3) | Technique / IA | Élevée | Élevé | Toujours préciser `Phaser 3.60+` dans les prompts ; valider chaque output contre la [doc officielle](https://newdocs.phaser.io/) ; utiliser le prompt de vérification (auto-validation) | Adrien |
| R02 | **Incohérence visuelle des assets IA** — Les générations successives produisent des styles incompatibles | Technique / IA | Moyenne | Moyen | Définir une charte visuelle fixe avant toute génération (palette, style, résolution) ; utiliser le même modèle/seed sur Leonardo AI pour toute une série | Elie |
| R03 | **Dépassement du scope** — Le Metroidvania est complexe ; risque de ne pas finir à temps | Planning | Élevée | Élevé | MVP défini strictement : 1 niveau jouable, 1 pouvoir, 1 PNJ, 1 chemin alternatif suffisent pour le Livrable 2 ; prioriser la mécanique sur le contenu | Adrien + Elie |
| R04 | **Qualité du code généré pour la logique d'état** — GameStateManager et fins alternatives sont complexes et peuvent avoir des bugs subtils | Technique / IA | Moyenne | Élevé | Tests unitaires Vitest obligatoires pour tous les modules de logique pure ; ne pas intégrer de code non testé pour ces systèmes | Adrien |
| R05 | **Droits sur les assets IA générés** — Cadre légal incertain pour les images générées par IA | Juridique | Faible | Moyen | Usage strictement académique, non commercial ; documenter tous les outils et leurs CGU dans ACKNOWLEDGEMENTS.md ; préférer CC0 pour tout asset tiers | Elie |
| R06 | **Droits sur la musique** — Suno AI impose des restrictions de licence selon les plans | Juridique | Moyenne | Faible | Vérifier les CGU Suno pour usage académique ; alternative : OpenGameArt (CC0) ou freemusicarchive.org | Elie |
| R07 | **Performances web** — Jeu lent sur certains navigateurs (tilemaps lourdes, trop de sprites) | Technique | Faible | Moyen | Limiter les tilemaps à 32x32 tiles max par niveau ; utiliser des spritesheets (pas d'images isolées) ; profiler avec Chrome DevTools | Adrien |
| R08 | **Perte de données / code** — Corruption ou perte accidentelle du travail | Planning | Faible | Élevé | Commits Git fréquents (après chaque fonctionnalité) ; au moins 1 push par séance ; ne jamais travailler directement sur `main` | Adrien + Elie |
| R09 | **Biais des LLMs dans la narration** — L'IA peut générer des dialogues stéréotypés ou culturellement biaisés | Éthique | Moyenne | Faible | Relecture systématique de tous les textes générés ; adapter ou réécrire les dialogues qui ne correspondent pas aux valeurs du projet | Elie |
| R10 | **Dépendance à un service IA tiers** — Leonardo AI, Suno ou GitHub Copilot peuvent être indisponibles ou changer leurs tarifs | IA / Planning | Faible | Moyen | Identifier des alternatives pour chaque outil ; ne pas bloquer l'avancement sur un seul outil ; conserver les outputs générés localement | Adrien + Elie |

---

## Matrice probabilité / impact

```
         │ Faible Impact │ Moyen Impact  │ Élevé Impact
─────────┼───────────────┼───────────────┼──────────────
Élevée   │               │               │  R01, R03
─────────┼───────────────┼───────────────┼──────────────
Moyenne  │    R09        │   R02, R06    │  R04, R10*
         │               │               │  (* impact moyen)
─────────┼───────────────┼───────────────┼──────────────
Faible   │               │   R05, R07    │  R08
```

### Risques prioritaires (à surveiller en continu)

1. **R01** — Hallucinations Phaser : vérification systématique obligatoire
2. **R03** — Scope creep : revue hebdomadaire du backlog
3. **R04** — Logique d'état : tests unitaires avant intégration

---

## Plan de contingence

| Si ce risque se matérialise... | Action de repli |
|---|---|
| R01 — code Phaser incorrect | Ouvrir la doc Phaser, corriger manuellement, documenter dans le prompt log |
| R03 — retard planning | Couper les niveaux supplémentaires, garder 1 niveau complet fonctionnel |
| R04 — bug GameStateManager | Simplifier à un flag booléen unique pour déterminer la fin |
| R05 / R06 — problème licence | Remplacer par assets CC0 (Kenney.nl, OpenGameArt) |
| R08 — perte code | Restaurer depuis GitHub ; dernier commit sauvé |
