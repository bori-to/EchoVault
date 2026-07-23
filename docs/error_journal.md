# Journal des erreurs - EchoVault

**Projet :** MetroidvanIA - ESGI 4AL

**Périmètre :** prototype jouable et itérations jusqu'au 23 juillet 2026

**Sources :** prompts et outputs archivés dans `prompts_logs/Prompt_Log_EchoVault.pdf`

---

## 1. Objectif du journal

Ce document recense les anomalies réellement rencontrées pendant le développement d'EchoVault. Pour chaque problème, il conserve le symptôme observé, la cause identifiée, les essais insuffisants ou ratés, la correction finalement retenue et la méthode de validation.

Les numéros de prompts renvoient à `prompts_logs/01_prompts_utilisateur_exacts.md`. Les réponses complètes et les opérations réalisées sont conservées dans le Prompt Log PDF.

## 2. Synthèse

| ID | Domaine | Prompts | Gravité | Statut |
|---|---|---:|---|---|
| ERR-001 | Affichage plein écran | #006, #029 | Moyenne | Résolu |
| ERR-002 | Projectile joueur immobile | #010 | Haute | Résolu |
| ERR-003 | Boss détruit par un tir / barre incorrecte | #014 à #016 | Critique | Résolu |
| ERR-004 | Personnage affiché comme un carré | #019 à #021 | Haute | Résolu |
| ERR-005 | Murs, écrasement et ennemis clignotants | #024, #025 | Haute | Résolu |
| ERR-006 | Paramètres invisibles et nouvelle partie bloquée | #027, #028 | Critique | Résolu |
| ERR-007 | Micro-saccades pendant le jeu | #030 | Moyenne | Résolu |
| ERR-008 | Interface des paramètres décalée | #034 | Moyenne | Résolu |
| ERR-009 | Crash à l'apparition du boss | #037 | Critique | Résolu |
| ERR-010 | Projectiles traversant les murs ou restant actifs | #038, #039 | Haute | Résolu |
| ERR-011 | Portée et cadence du boss mal équilibrées | #040, #042 | Moyenne | Résolu |
| ERR-012 | Bouclier affiché comme une boule opaque | #041 | Faible | Résolu |
| ERR-013 | Écrans de succès et personnages non centrés | #049, #050 | Moyenne | Résolu |
| ERR-014 | Écran des succès invisible depuis la pause | #052 | Haute | Résolu |
| ERR-015 | Textes flous et difficiles à lire | #053, #054 | Haute | Résolu |

---

## 3. Fiches détaillées

### ERR-001 - Le jeu ne remplit pas l'écran

**Prompts associés :** #006 et #029

**Symptôme :** le canvas restait entouré de bandes noires sur les écrans larges.

**Cause :** la première version utilisait une taille logique fixe de 800 x 500 sans gestion de redimensionnement. Une première correction a ajouté `Phaser.Scale.FIT`, mais ce mode conserve strictement le ratio 8:5 et crée donc volontairement des marges lorsque le ratio de la fenêtre diffère.

**Tentative insuffisante :** `FIT` avec `CENTER_BOTH` agrandissait correctement le canvas mais ne pouvait pas supprimer les bandes latérales. Les colorer comme le fond du jeu masquait partiellement le problème sans le résoudre.

**Solution retenue :** remplacement de `FIT` par `Phaser.Scale.EXPAND`, adaptation des arrière-plans, du HUD, des dialogues et des effets plein écran à la largeur logique variable.

**Vérification :** tests automatisés réussis, build Vite régénéré et contrôle sur une fenêtre large.

---

### ERR-002 - Le laser reste sur place

**Prompt associé :** #010

**Symptôme :** le projectile apparaissait, mais sa position ne changeait pas.

**Cause :** le projectile recevait sa vélocité avant d'être ajouté au groupe physique. L'ajout au groupe pouvait réinitialiser les propriétés du body Arcade.

**Tentative ratée :** l'appel classique à `setVelocityX()` avant `group.add()` ne conservait pas toujours la vitesse.

**Solution retenue :** ajouter le projectile au groupe avant de fixer `body.velocity.x`.

**Vérification :** rafraîchissement du jeu et observation du déplacement réel du laser.

---

### ERR-003 - Le boss disparaît au premier tir et sa barre ne baisse pas

**Prompts associés :** #014, #015 et #016

**Symptômes :** un tir pouvait faire disparaître visuellement le boss alors que sa barre restait affichée ; lors d'une autre itération, la barre demeurait pleine malgré les dégâts.

**Causes successives :**

1. plusieurs projectiles pouvaient appeler `hit()` pendant la même frame, faute de délai d'invulnérabilité ;
2. la collision balle / boss était initialement enregistrée avant la création du sprite du boss ;
3. le callback d'overlap pouvait recevoir ses arguments dans un ordre inattendu et appeler `destroy()` sur le boss au lieu de la balle ;
4. deux barres de vie existaient : une dans `BossManager` et une dans `HUDScene`. La barre visible du HUD n'était pas mise à jour.

**Tentatives insuffisantes :** l'ajout d'un cooldown de dégâts et le déplacement de la connexion au moment du spawn ont limité les dégâts multiples, mais n'ont pas corrigé la destruction du mauvais objet. La barre dupliquée a ensuite révélé un second problème indépendant.

**Solution retenue :** identification explicite de la balle avec le groupe `playerBullets`, destruction de la balle uniquement, connexion après le spawn, ajout d'iframes, suppression de la barre locale du boss et émission de `bossHit` vers `HUDScene`.

**Vérification :** build réussi ; tirs simples et chargés testés ; diminution de la barre confirmée sans disparition prématurée du sprite.

---

### ERR-004 - Le personnage apparaît comme un carré

**Prompts associés :** #019 à #021

**Symptôme :** ARIA apparaissait comme un rectangle sombre bordé de cyan au lieu du robot attendu.

**Causes :** le `aria-sheet.png` du build était une ancienne version très sombre qui se confondait avec le fond. L'effet `postFX.addGlow` dessinait en plus le contour rectangulaire des limites 32 x 48 du sprite.

**Tentatives insuffisantes :** modifier le script de génération sans régénérer l'asset et le build laissait l'ancienne image servie au navigateur. Un simple rafraîchissement pouvait également conserver l'asset en cache.

**Solution retenue :** régénération du spritesheet, reconstruction du build, éclaircissement du personnage et suppression de l'effet produisant le rectangle visible.

**Vérification :** inspection de l'asset régénéré et rechargement forcé du navigateur avec `Ctrl+Shift+R`.

---

### ERR-005 - Ennemis rouges clignotants, mur franchissable et écrasement incomplet

**Prompts associés :** #024 et #025

**Symptômes :** les murs mémoriels pouvaient être franchis, les crawlers semblaient clignoter ou disparaître, et un saut sur deux ennemis regroupés n'en éliminait qu'un.

**Causes :** les murs ne couvraient pas toute la hauteur. Le traitement d'écrasement s'arrêtait au premier crawler détecté. Pour le clignotement, deux phénomènes se superposaient : un flash blanc à l'impact et surtout une téléportation du crawler entre les extrémités de sa patrouille.

**Tentative insuffisante :** supprimer le flash blanc et le remplacer par une compression visuelle n'a pas éliminé l'impression de disparition, car la cause principale se trouvait dans la logique de patrouille.

**Solution retenue :** murs étendus à toute la hauteur, traitement de tous les crawlers sous les pieds du joueur et demi-tour sur place aux limites de patrouille sans téléportation.

**Vérification :** 15 tests réussis et build de production régénéré.

---

### ERR-006 - La touche P fige le jeu et Nouvelle partie ne répond plus

**Prompts associés :** #027 et #028

**Symptômes :** `P` mettait la partie en pause sans rendre les paramètres visibles. Après une fin, le bouton Nouvelle partie ne lançait plus de partie.

**Causes :** le HUD se mettait en pause avant d'avoir terminé le lancement de `SettingsScene`. Phaser reportait encore certaines opérations, et la suspension pouvait empêcher la nouvelle scène de devenir active. Dans le menu, le verrou `_starting` conservait la valeur `true` lorsque la scène était réutilisée après une fin.

**Tentative insuffisante :** lancer les paramètres juste avant de suspendre le HUD n'a pas suffi, car l'ouverture restait dépendante de la file d'opérations Phaser.

**Solution retenue :** déplacer la pause dans `SettingsScene.create()`, donc après son affichage effectif, et réinitialiser `_starting` à chaque création / réaffichage du menu.

**Vérification incomplète puis finale :** la tentative de test automatisé dans un navigateur intégré a échoué car aucun navigateur n'était disponible. Les états ont été vérifiés dans le code, puis 15 tests et le build ont réussi. Un rechargement complet était nécessaire pour éliminer l'ancien bundle du cache.

---

### ERR-007 - Micro-saccades intermittentes

**Prompt associé :** #030

**Symptôme :** de petites baisses de fluidité apparaissaient pendant l'exploration et les combats.

**Causes :** chaque mort créait un nouveau système de particules ; les ennemis très éloignés continuaient leur physique, leur IA et leurs tirs ; plusieurs animations décoratives et arrière-plans invisibles restaient actifs.

**Approche écartée :** diminuer globalement la qualité graphique aurait masqué le coût sans traiter les mises à jour inutiles.

**Solution retenue :** pool de particules réutilisable, mise en sommeil des ennemis hors zone, réduction des animations permanentes et arrêt du rendu des arrière-plans invisibles.

**Vérification :** qualité conservée autour du joueur, 15 tests réussis et build régénéré.

---

### ERR-008 - Paramètres mal positionnés sur écran large

**Prompt associé :** #034

**Symptôme :** le panneau était centré, mais les libellés et boutons restaient ancrés sur des coordonnées prévues pour 800 pixels et sortaient du cadre.

**Cause :** mélange de coordonnées absolues et d'un canvas logique élargi par le mode `EXPAND`.

**Solution retenue :** calcul de toutes les positions relativement au centre du panneau, agrandissement des zones cliquables et réorganisation de l'espacement vertical.

**Vérification :** 15 tests réussis, build régénéré et contrôle sur affichage large.

---

### ERR-009 - Crash complet à l'arrivée dans l'arène du boss

**Prompt associé :** #037

**Symptôme :** le jeu levait une exception dès le déclenchement du boss.

**Cause :** `BossManager.spawn()` appelait `camera.stopShake()`, méthode inexistante dans la version de Phaser installée.

**Tentative de diagnostic :** l'hypothèse a d'abord été formulée à partir du chemin `spawn()` puis confirmée contre l'API réellement disponible.

**Solution retenue :** remplacement par `camera.shakeEffect.reset()`. Un portail de test configurable a été ajouté pour reproduire rapidement le combat ; il prépare souvenirs, pouvoirs et verrous avant la téléportation.

**Vérification :** 20 tests réussis, build régénéré et accès accéléré à l'arène. Le portail a ensuite été désactivé par défaut pour les joueurs normaux.

---

### ERR-010 - Projectiles sans collision ou durée de vie

**Prompts associés :** #038 et #039

**Symptômes :** lasers et balles traversaient les murs ; certains tirs du boss pouvaient rester dans l'arène beaucoup plus longtemps que les tirs du joueur.

**Cause :** les groupes de projectiles n'avaient pas tous de collision avec les plateformes. Les projectiles du boss dépendaient en plus des timers d'attaque et ne possédaient pas d'expiration autonome.

**Tentative insuffisante :** ajouter uniquement la collision murale a réglé les impacts, mais pas les balles qui ne rencontraient aucun obstacle.

**Solution retenue :** collision de tous les projectiles avec les plateformes, expiration individuelle contrôlée à chaque frame, destruction hors limites, durée de 1,9 seconde pour les tirs classiques et 1,45 seconde pour les vagues au sol.

**Vérification :** 20 tests réussis et build régénéré.

---

### ERR-011 - Boss : projectiles trop courts et cadence excessive

**Prompts associés :** #040 et #042

**Symptômes :** les munitions disparaissaient avant de parcourir l'arène et les enchaînements laissaient trop peu de récupération, particulièrement en phase 2.

**Cause :** limites spatiales et durées de vie trop faibles, combinées à des délais d'attaque trop courts.

**Solution retenue :** portée et durée de vie augmentées, cycles espacés dans les trois phases et délai de phase 2 multiplié par trois, de 1,38 à 4,14 secondes. La vitesse des projectiles n'a pas été modifiée.

**Vérification :** 20 tests réussis et build de production fonctionnel.

---

### ERR-012 - Le bouclier ressemble à une boule bleue

**Prompt associé :** #041

**Symptôme :** le pouvoir était représenté par un cercle cyan opaque qui cachait presque le personnage.

**Cause :** le premier prototype utilisait un unique objet `Circle` rempli.

**Solution retenue :** remplacement par une coque elliptique transparente composée de contours, segments, nœuds lumineux et animations d'absorption / recharge, sans modifier la mécanique de protection.

**Vérification :** 20 tests et build réussis.

---

### ERR-013 - Arbre des succès et sélection des personnages décentrés

**Prompts associés :** #049 et #050

**Symptôme :** sur écran large, les titres semblaient centrés, mais les branches de succès et les cartes des personnages restaient décalées vers la gauche.

**Cause :** les positions étaient calculées autour de `x = 400`, centre historique du canvas 800 x 500, au lieu d'utiliser la largeur logique courante.

**Solution retenue :** calcul des colonnes, connexions et groupes de cartes depuis le centre réel fourni par la scène.

**Vérification :** 28 tests réussis et build régénéré.

---

### ERR-014 - Voir les succès depuis P donne l'impression d'un gel

**Prompt associé :** #052

**Symptôme :** le jeu et le HUD restaient visibles mais figés après avoir choisi Voir les succès.

**Cause :** `AchievementsScene` était bien lancée, mais restait derrière `GameScene` et `HUDScene`, eux-mêmes mis en pause.

**Solution retenue :** faire passer explicitement l'écran des succès au premier plan et conserver le parcours de retour vers les paramètres.

**Parcours validé :** `P -> Voir les succès -> Retour aux paramètres -> Reprendre la partie`.

**Vérification :** 28 tests réussis et build fonctionnel.

---

### ERR-015 - Textes flous dans l'arbre puis dans tout le jeu

**Prompts associés :** #053 et #054

**Symptôme :** les textes de 7 à 9 pixels devenaient flous et trop sombres lorsque le canvas était agrandi en plein écran. Après correction de l'arbre des succès, le même défaut restait visible dans les autres écrans.

**Cause :** Phaser créait les textures de texte avec une résolution interne de 1, indépendamment du facteur d'agrandissement du canvas.

**Tentative insuffisante :** augmenter la taille, le contraste et la résolution uniquement dans `AchievementsScene` a amélioré cet écran, mais n'a pas corrigé menus, dialogues, HUD, paramètres, cinématique et fins.

**Solution retenue :** surcharge de la factory de texte Phaser afin d'appliquer automatiquement `resolution: 2` à chaque texte. Les sprites, particules et décors restent à leur résolution normale pour préserver les performances.

**Vérification :** contrôle des principaux écrans, 28 tests réussis et build régénéré.

---

## 4. Bilan des rebouclages

Les incidents qui ont nécessité plusieurs itérations sont particulièrement instructifs :

- **Boss :** cooldown de dégâts, ordre de création, mauvais objet détruit puis barre dupliquée ;
- **Paramètres :** ordre lancement / pause insuffisant, puis déplacement de la pause dans la scène cible ;
- **Ennemis rouges :** suppression du flash visuel, puis correction de la téléportation de patrouille ;
- **Projectiles :** collision avec les murs, puis expiration autonome des tirs du boss ;
- **Lisibilité :** correction locale de l'arbre, puis correction globale de la factory de texte ;
- **Plein écran :** `FIT` a conservé les bandes, `EXPAND` a finalement rempli la fenêtre.

Ces rebouclages montrent qu'un build réussi ne suffit pas à valider une anomalie liée au cycle de vie Phaser ou au rendu. Les prochaines corrections doivent combiner tests automatisés, reproduction dans le navigateur et contrôle visuel sur plusieurs ratios d'écran.

## 5. État actuel de validation

À la dernière vérification du projet :

- 5 suites Vitest réussissent ;
- 28 tests sur 28 réussissent ;
- `npm run build` produit le dossier `build/` ;
- le workflow GitHub Actions teste et déploie le build ;
- la version publique est accessible sur <https://bori-to.github.io/EchoVault/>.

