# Crédits, provenance et licences — EchoVault

État vérifié le **23 juillet 2026**. Ce document décrit les éléments réellement présents dans le dépôt et distingue les services utilisés des outils seulement étudiés. Les CGU citées sont des contrats de service, pas des licences open source. Elles peuvent évoluer ; les liens officiels font foi.

## 1. Licence du projet

Le code source original et les contenus propres à EchoVault sont distribués sous la [licence MIT](LICENSE), dans la limite des droits détenus par l'équipe. Cette licence ne remplace pas les conditions applicables aux composants tiers et aux services d'IA décrits ci-dessous.

Copyright © 2026 Adrien et Elie — équipe EchoVault.

## 2. Inventaire exact des assets livrés

### Image de la cinématique

| Champ | Valeur |
|---|---|
| Fichier | `src/assets/cinematics/echo-vault-opening.jpg` |
| Usage | Arrière-plan de l'introduction dans `CinematicScene` |
| Dimensions | 1672 × 941 pixels |
| Taille | 265 063 octets |
| SHA-256 | `F4A9E5F67A10A1F1484641F64C58AF7A626BEE5710B3D9F42492D62A623AF22C` |
| Date du fichier | 22 juillet 2026 |
| Provenance | Génération d'image OpenAI demandée depuis Codex pour le prompt utilisateur nº 031 |
| Prompt source | « ok ajoute une cinematique en 3D de fou au debut du jeu pour expliquer l'histoire/introduire » |
| Modèle | Outil de génération d'images OpenAI exposé dans Codex ; l'identifiant exact du modèle d'image n'a pas été enregistré dans les traces |
| Retouches manuelles | Aucune déclarée |
| Conditions applicables | [Conditions d'utilisation OpenAI — section Contenu](https://openai.com/policies/row-terms-of-use/) |

Selon ces conditions, dans la relation entre l'utilisateur et OpenAI et dans la mesure permise par la loi, l'utilisateur conserve ses droits sur les entrées et possède les sorties. OpenAI avertit également que les sorties peuvent ne pas être uniques. Cette attribution contractuelle ne constitue pas une garantie qu'un droit d'auteur existe sur chaque image générée.

### Graphismes du jeu

Les sprites, tiles, personnages, ennemis, armes, plateformes, interfaces et effets sont générés procéduralement par `src/game/scenes/BootScene.js` avec les API Canvas/Phaser. Le build courant ne contient aucun fichier de sprite Leonardo AI et aucun tileset Stable Diffusion XL. Aucun asset graphique tiers téléchargé n'a été identifié.

Le fichier `src/assets/dialogues/npc_oracle.json` est un contenu textuel du projet et relève de la licence du projet, sous réserve des conditions des assistants IA ayant aidé à produire le code et les textes.

### Sons et musique

Le dépôt ne contient **aucun MP3, OGG, WAV ni musique Suno**. Tous les effets sonores sont synthétisés en temps réel dans `src/game/systems/AudioManager.js` à partir d'oscillateurs, de fréquences et d'enveloppes programmés avec la [Web Audio API du W3C](https://www.w3.org/TR/webaudio/). Il n'existe donc aucun enregistrement sonore tiers à créditer ou redistribuer.

### Voix françaises

Le dépôt ne contient **aucun fichier vocal préenregistré ou généré**. `src/game/systems/VoiceManager.js` appelle `window.speechSynthesis` et `SpeechSynthesisUtterance`, conformément à la [spécification Web Speech API](https://webaudio.github.io/web-speech-api/).

Les voix disponibles et leur nom exact dépendent du navigateur et du système d'exploitation de chaque joueur. EchoVault ne copie ni ne redistribue ces voix. Leur utilisation reste soumise aux conditions du fournisseur de la voix installé chez l'utilisateur, par exemple Microsoft, Google ou Apple. Le projet ne peut donc pas attribuer une licence unique à la sortie vocale ni garantir qu'une même voix sera sélectionnée sur toutes les machines.

## 3. Assistants IA effectivement utilisés

| Service et modèle déclaré | Usage vérifiable | Modifications manuelles déclarées | Conditions applicables |
|---|---|---|---|
| GitHub Copilot avec Claude Sonnet 4.6 High | Génération de code et réponses pour les prompts nº 001 à 022 | Aucune | [GitHub Terms of Service, section J — AI Features](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#j-ai-features-training-and-your-data) et [GitHub Terms for Additional Products](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#github-copilot) |
| OpenAI Codex 5.6 Sol Medium | Génération de code, documentation et corrections à partir du prompt nº 023 | Aucune | [OpenAI Terms of Use](https://openai.com/policies/row-terms-of-use/) et [OpenAI Service Terms](https://openai.com/policies/service-terms/) |
| Génération d'images OpenAI via Codex | Création de l'unique JPEG de cinématique pour le prompt nº 031 | Aucune | [OpenAI Terms of Use](https://openai.com/policies/row-terms-of-use/) |

Les décisions d'acceptation ou de rejet, modèles déclarés et numéros de prompts sont détaillés dans `prompts_logs/02_tracabilite_integrations_ia.md`. L'avatar associé au prompt nº 019 a été rejeté et n'est pas présent dans le build.

Claude Sonnet a été utilisé à travers GitHub Copilot : les conditions du service effectivement utilisé sont donc celles de GitHub Copilot. Aucun appel direct à un service Anthropic n'est documenté dans le projet.

## 4. Outils étudiés mais absents du build

Ces outils figurent dans l'étude de faisabilité, mais l'inventaire du dépôt ne permet pas d'affirmer qu'un de leurs outputs est livré. Ils ne doivent pas être présentés comme sources des assets actuels.

| Outil évalué | Usage envisagé | Situation réelle | Licence ou CGU officielle |
|---|---|---|---|
| Leonardo AI | Sprites pixel art | Aucun fichier Leonardo identifié | [Leonardo AI Terms of Service](https://leonardo.ai/terms-of-service) : les droits diffèrent notamment entre abonnements gratuits et payants |
| Stable Diffusion XL 1.0 | Tilesets | Aucun poids de modèle ni output SDXL identifié | [Fiche officielle SDXL 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) et [CreativeML Open RAIL++-M](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md), et non Apache 2.0 |
| Suno AI | Musique d'ambiance | Aucun fichier audio Suno identifié | [Suno Terms of Service](https://suno.com/terms/) : le régime des outputs dépend du forfait utilisé au moment de la génération |

## 5. Bibliothèques et outils logiciels

Les versions ci-dessous proviennent de l'installation locale et du fichier de verrouillage du projet.

| Composant | Version résolue | Rôle | Licence | Avis |
|---|---:|---|---|---|
| Phaser | 3.90.0 | Moteur inclus dans le bundle de production | MIT | [Licence officielle](https://github.com/phaserjs/phaser/blob/v3.90.0/LICENSE.md) ; copie publiée dans `public/THIRD_PARTY_NOTICES.txt` |
| Vite | 5.4.21 | Outil de build, non livré comme bibliothèque applicative | MIT | [Licence officielle](https://github.com/vitejs/vite/blob/v5.4.21/LICENSE) |
| Vitest | 1.6.1 | Outil de tests, non livré dans le jeu | MIT | [Licence officielle](https://github.com/vitest-dev/vitest/blob/v1.6.1/LICENSE) |

Le fichier `public/THIRD_PARTY_NOTICES.txt` est copié automatiquement par Vite dans le build GitHub Pages afin que l'avis MIT de Phaser accompagne aussi la version distribuée.

## 6. Déclarations de traçabilité

- Tous les prompts disponibles sont conservés dans `prompts_logs/`.
- Aucune modification manuelle des outputs ou du code généré n'a été déclarée par l'équipe.
- Toutes les intégrations ont été acceptées sauf l'avatar du prompt nº 019.
- Aucun asset externe non identifié n'a été trouvé dans `src/assets/` au 23 juillet 2026.
- Toute introduction future d'une image, police, musique, voix enregistrée ou autre asset devra ajouter ici le fichier, l'auteur, la source, la date d'obtention et la licence exacte avant intégration.
