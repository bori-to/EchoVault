# Rapport de bugs — EchoVault

| Élément | Valeur |
|---|---|
| Date de consolidation | 23 juillet 2026 |
| Source détaillée | [Journal des erreurs et solutions](error_journal.md) |
| Nombre de familles de bugs | 15 |
| Bloquants ouverts connus | 0 |

## 1. Synthèse

| Sévérité | Nombre | État déclaré |
|---|---:|---|
| Critique | 3 | Corrigés, recette manuelle finale requise |
| Haute | 6 | Corrigés, régressions ciblées à terminer |
| Moyenne | 5 | Corrigés ou améliorés |
| Faible | 1 | Corrigé |
| **Total** | **15** | **15 corrections intégrées** |

Le statut « corrigé » signifie que la cause a été traitée dans le code et que le développement a pu continuer. Il ne signifie pas qu'une équipe QA indépendante a clôturé le ticket. Les validations restantes figurent dans le [rapport de playtests](playtest_report.md).

## 2. Registre consolidé

| ID | Sévérité | Domaine | Symptôme | Correction intégrée | Validation disponible |
|---|---|---|---|---|---|
| ERR-001 | Moyenne | Affichage | Bandes noires, jeu ne remplissant pas la fenêtre | Mise à l'échelle responsive et caméra adaptée à la zone visible | Build + observation visuelle |
| ERR-002 | Haute | Combat | Laser immobile à sa création | Vitesse physique calculée après création du projectile | Playtest exploratoire |
| ERR-003 | Critique | Boss | Boss invisible après un tir, barre de vie incohérente | Séparation des objets visuels, dégâts et synchronisation de la barre | Tests de machine à états + playtest |
| ERR-004 | Haute | Personnage | Sprite remplacé par un carré | Protection des textures et fallback visuel contrôlé | Observation visuelle |
| ERR-005 | Haute | Ennemis/collisions | Clignotement, mur franchissable, un seul ennemi écrasable | Bornes de patrouille stables, collision du mur et écrasement généralisé | Playtest exploratoire |
| ERR-006 | Critique | Scènes/UI | `P` fige le jeu et Nouvelle partie ne répond pas | Cycle explicite pause/reprise, réveil des scènes et nettoyage au redémarrage | Playtest partiel ; recette finale requise |
| ERR-007 | Moyenne | Performance | Micro-saccades intermittentes | Réduction des allocations et opérations répétées dans la boucle | Ressenti amélioré ; mesure longue requise |
| ERR-008 | Moyenne | Paramètres | Panneau et libellés décalés | Conteneur central et coordonnées relatives | Observation visuelle |
| ERR-009 | Critique | Boss | Crash à l'arrivée dans l'arène | Machine à états centralisée et références défensives | 5 tests unitaires + playtest partiel |
| ERR-010 | Haute | Projectiles | Lasers traversant les murs ou persistant indéfiniment | Collision avec les murs et durée de vie pour tous les projectiles | Playtest exploratoire |
| ERR-011 | Moyenne | Équilibrage | Portée trop courte et tirs du boss trop fréquents | Portée augmentée, délais revus, phase 2 trois fois plus lente | Playtest exploratoire |
| ERR-012 | Faible | Effets visuels | Bouclier ressemblant à une boule opaque | Anneaux, contour, noyau transparent et pulsation | Observation visuelle |
| ERR-013 | Moyenne | UI responsive | Succès et personnages décentrés | Centrage depuis la zone visible de la caméra | Captures d'écran et playtest |
| ERR-014 | Haute | Scènes/UI | Succès ouverts depuis `P` invisibles, impression de gel | Gestion explicite de l'ordre et du retour des scènes | Playtest partiel ; recette finale requise |
| ERR-015 | Haute | Rendu | Textes flous dans les succès puis dans tout le jeu | Résolution interne, arrondi des coordonnées et styles texte ajustés | Observation visuelle ; multi-écran requis |

## 3. Répartition des causes

| Famille de cause | Bugs concernés | Enseignement |
|---|---|---|
| Cycle de vie des scènes | ERR-006, ERR-014 | Les scènes superposées doivent avoir des transitions et retours explicites. |
| Physique et durée de vie | ERR-002, ERR-005, ERR-010 | Les projectiles et ennemis exigent des collisions homogènes et un nettoyage systématique. |
| État du boss | ERR-003, ERR-009, ERR-011 | Une machine à états unique évite les timers dupliqués et les resets incomplets. |
| Responsive et rendu | ERR-001, ERR-008, ERR-013, ERR-015 | Les coordonnées doivent dépendre de la zone visible et rester alignées sur les pixels. |
| Assets et effets | ERR-004, ERR-012 | Les fallbacks ne doivent pas masquer les sprites ni produire un effet opaque. |
| Boucle temps réel | ERR-007 | Les allocations et recalculs par frame doivent rester limités. |

## 4. Risques résiduels et anomalies non bloquantes

- le bundle JavaScript principal dépasse le seuil d'avertissement de 500 kB de Vite ;
- aucune automatisation navigateur ne vérifie encore les transitions de scènes et les collisions réelles Phaser ;
- la disponibilité et le timbre des voix peuvent varier selon le navigateur et le système ;
- une session longue est encore nécessaire pour exclure une accumulation lente de timers ou de projectiles ;
- la durée cible d'environ 60 minutes doit être mesurée sans utiliser le portail de test.

## 5. Critères de clôture définitive

Le registre pourra être clôturé après :

1. réussite de la recette critique pause/succès/reprise ;
2. réussite des deux parcours de fin suivis d'une nouvelle partie ;
3. cinq défaites successives contre le boss sans état résiduel ;
4. contrôle visuel sur trois résolutions et deux navigateurs ;
5. conservation des 43 tests unitaires et du build au vert.
