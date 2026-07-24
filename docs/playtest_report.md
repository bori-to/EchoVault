# Rapport de playtests — EchoVault

| Élément | Valeur |
|---|---|
| Type | Tests exploratoires et régressions manuelles |
| Testeur observé | Membre de l'équipe projet |
| Environnement observé | Chrome sous Windows, serveur local `localhost:5173` |
| Sources | Retours utilisateur, captures d'écran et journal de prompts du projet |
| Période | Développement itératif, état consolidé le 23 juillet 2026 |

## 1. Méthode et niveau de preuve

Ce rapport consolide les playtests réellement effectués pendant le développement. Chaque retour a été formulé après manipulation du jeu, souvent accompagné d'une capture d'écran, puis suivi d'une correction. Les références `Pxxx` correspondent aux entrées de `prompts_logs/01_prompts_utilisateur_exacts.md`.

Le rapport distingue trois états :

- **validé par retour** : la correction a été rejouée et le testeur a poursuivi sur un autre problème ;
- **couvert automatiquement** : le comportement logique possède aussi un test Vitest ;
- **à revalider** : la correction existe, mais une recette manuelle complète et indépendante reste nécessaire avant la soutenance.

Cette consolidation ne prétend pas être une nouvelle campagne de recette externe : les validations qui ne sont pas établies par les traces sont explicitement laissées ouvertes.

## 2. Sessions et résultats observés

| ID | Parcours testé | Références | Résultat observé | État actuel |
|---|---|---|---|---|
| PT-01 | Déplacement, murs, ennemis rouges et saut sur leur tête | P024–P025 | Mur trop bas, clignotement et collision d'écrasement incohérente détectés puis corrigés. | Validé par retour ; régression finale conseillée. |
| PT-02 | Pause avec `P`, affichage des paramètres et reprise | P027–P028 | Premier correctif insuffisant : écran figé sans paramètres. Le cycle des scènes et les boutons ont ensuite été repris. | À revalider sur une partie neuve, en cours de partie et après la fin. |
| PT-03 | Nouvelle partie après l'écran de fin | P028 | Le bouton ne relançait rien ; le nettoyage des scènes a été corrigé. | À revalider sur les deux fins. |
| PT-04 | Affichage sur écran large | P029 | Bandes noires visibles ; la mise à l'échelle a été remplacée par un mode d'expansion responsive. | Validé visuellement, à contrôler sur trois ratios d'écran. |
| PT-05 | Fluidité pendant le jeu | P030 | Micro-saccades ponctuelles signalées ; réduction des calculs et allocations répétées. | Amélioration validée par poursuite du playtest ; mesure longue à effectuer. |
| PT-06 | Paramètres audio et voix | P034–P035 | Mise en page incorrecte et voix de narration inadéquate ; interface corrigée et profils vocaux séparés. | À vérifier sur Chrome et Firefox, selon les voix installées. |
| PT-07 | Arrivée dans l'arène et combat du boss | P036–P043 | Crash à l'entrée, réinitialisation, collisions, portée et cadence ajustés ; portail de test ajouté puis désactivé par défaut. | Machine à états couverte automatiquement ; combat complet à revalider manuellement. |
| PT-08 | Bouclier initial | P044 | Effet perçu comme une boule bleue opaque ; visuel remplacé par un bouclier en couches. | Validé visuellement par l'itération suivante. |
| PT-09 | Arbre des succès et choix du personnage | P049–P050 | Les deux interfaces étaient décentrées sur écran large ; positions recalculées à partir de la zone visible. | Validé visuellement ; contrôle responsive final conseillé. |
| PT-10 | Accès aux succès depuis le menu `P` | P051–P052 | Le jeu semblait se figer car la scène de succès restait derrière l'overlay ; ordre des scènes corrigé. | À revalider avec retour vers les paramètres puis vers le jeu. |
| PT-11 | Lisibilité des textes | P053–P054 | Flou d'abord observé dans les succès, puis dans tout le jeu ; résolution interne et rendu texte améliorés. | Validé visuellement sur la capture suivante à produire ; contrôle multi-écran requis. |

## 3. Couverture fonctionnelle obtenue

Les playtests ont exercé les zones suivantes :

- déplacement, saut, collision avec les murs et élimination des ennemis ;
- interface principale, paramètres, pause, succès et écran de fin ;
- mise à l'échelle sur écran large et lisibilité des textes ;
- sons, voix françaises et séparation de la narration d'objectifs ;
- accès à l'arène, projectiles, bouclier et équilibrage des trois phases du boss ;
- sélection des quatre personnages et affichage de leurs statistiques et armes.

La logique pure complète ces observations avec **43 tests unitaires réussis**, détaillés dans le [rapport de tests](test_report.md).

## 4. Recette finale à exécuter avant soutenance

| Priorité | Scénario de recette | Critère d'acceptation | Statut |
|---|---|---|---|
| Critique | Mourir cinq fois, une fois dans chaque phase puis deux fois de suite | Boss à 100 %, phase 1, aucun ancien projectile ni cadence accélérée à chaque retour | À exécuter manuellement |
| Critique | Ouvrir `P`, afficher les succès, revenir aux paramètres puis reprendre | Aucun écran figé, aucun doublon de scène, contrôles immédiatement actifs | À exécuter manuellement |
| Critique | Choisir « Transmission » chez SOL puis terminer | Seule l'ascension du relais apparaît ; la voie basse et la fin Libération restent inaccessibles | À exécuter manuellement |
| Critique | Choisir « Libération » chez SOL puis terminer | Seul le couloir bas apparaît ; le noyau s'ouvre après exactement trois verrous et le relais reste inaccessible | À exécuter manuellement |
| Critique | Terminer chaque parcours puis cliquer sur Nouvelle partie | Une partie propre démarre à chaque fois et permet de choisir l'autre branche | À exécuter manuellement |
| Haute | Jouer un parcours complet avec chacun des quatre personnages | Arme, statistiques, dégâts et animations correspondent au choix | À exécuter manuellement |
| Haute | Parcourir les huit actes sans portail de test | Progression impossible à contourner, durée cible proche de 60 minutes | À chronométrer |
| Haute | Tester en 1366×768, 1920×1080 et fenêtre redimensionnée | Aucun texte flou, élément coupé ou interface décentrée | À exécuter manuellement |
| Moyenne | Faire une session continue de 20 minutes | Pas de micro-saccade croissante ni d'accumulation de projectiles/timers | À mesurer |
| Moyenne | Tester Chrome et Firefox | Contrôles, audio et voix fonctionnent ou se dégradent proprement | À exécuter manuellement |

## 5. Conclusion

Le prototype a fait l'objet d'un playtest exploratoire continu qui a permis d'identifier et de corriger quinze familles de défauts. Les retours couvrent les mécaniques centrales et l'interface, mais une session de recette finale chronométrée, multi-écran et multi-navigateur doit encore être signée avant de déclarer la version définitivement acceptée.
