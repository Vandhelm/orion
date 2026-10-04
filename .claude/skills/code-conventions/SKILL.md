---
name: code-conventions
description: Conventions de structure du code (DRY, SOLID, séparation des responsabilités, réutilisation de l'existant, nommage, taille des fonctions et fichiers), avec règles Next.js et TypeScript. À utiliser dès qu'on écrit ou modifie du code — nouvelle fonctionnalité, fonction, module, service, hook, Server Action, route d'API — et quand on demande de refactorer, nettoyer, découper, réorganiser du code ou éliminer des duplications.
---

# Conventions de code

Objectif : un code lisible, bien découpé, qui réutilise l'existant et reste facile à modifier. Ces règles s'appliquent **à l'écriture de nouveau code comme au refactoring**.

## Avant d'écrire du code (toujours)

- Repérer les conventions du projet (structure des dossiers, style, nommage, framework) en regardant 2-3 fichiers voisins. On s'y conforme, on n'impose pas les siennes.
- **Chercher avant de créer** : avant toute nouvelle fonction, hook, service, type ou utilitaire, chercher s'il en existe déjà un (voir « DRY » plus bas).
- Si `package.json` contient `next`, lire `references/nextjs-typescript.md` (dans le dossier de ce skill) et appliquer ses règles en plus de celles-ci.
- Si le travail touche à l'interface (composants visuels, classes Tailwind, couleurs, thèmes, CSS), appliquer aussi le skill `ui-conventions`.

## Écrire du nouveau code

1. **Situer** : décider dans quelle couche va chaque morceau (présentation, logique métier, accès aux données, intégration externe) et dans quel dossier, selon la structure existante.
2. **Réutiliser** ce qui existe ; étendre un élément existant plutôt que d'en créer une variante copiée.
3. **Écrire** en respectant les principes ci-dessous dès le départ : petites fonctions, logique métier pure, dépendances injectées, types partagés plutôt que redéclarés.
4. **Rester simple** : écrire ce que la fonctionnalité demande maintenant. Pas d'abstraction, d'interface ou de configuration « pour plus tard ».
5. **Vérifier** : tests, lint, typecheck. Ajouter des tests pour la logique métier nouvelle si le projet en a.
6. **Résumer** brièvement : ce qui a été ajouté, où, et ce qui a été réutilisé ou étendu.

Si le code autour est mal structuré, ne pas tout refactorer en douce : faire le minimum nécessaire pour bien intégrer la nouveauté, et **signaler** le reste comme refactoring possible.

## Refactorer du code existant

Objectif supplémentaire : **ne pas changer le comportement**. Toujours dans cet ordre :

1. **Comprendre avant de toucher**
   - Lire le code ciblé et ses appelants (`Grep` sur les noms exportés).
   - Repérer les tests existants et la commande pour les lancer.

2. **Diagnostiquer** — dresser la liste des problèmes concrets, chacun avec son emplacement (`fichier:ligne`) :
   - duplications (logique copiée, pas juste deux lignes qui se ressemblent) ;
   - fonctions ou classes qui font plusieurs choses ;
   - mélange de couches (accès données + logique métier + présentation au même endroit) ;
   - dépendances concrètes codées en dur là où une abstraction aiderait les tests ;
   - nommage flou, nombres magiques, conditions imbriquées profondes ;
   - code mort.

3. **Proposer un plan** avant les gros changements (déplacement de fichiers, nouvelle architecture, changement d'API publique) : quoi, où, pourquoi. Pour de petits nettoyages locaux, on peut y aller directement.

4. **Refactorer par petites étapes**, chacune laissant le code fonctionnel :
   - une transformation à la fois (extraire, renommer, déplacer, inverser une dépendance) ;
   - mettre à jour tous les appelants à chaque étape ;
   - ne pas mélanger refactoring et ajout de fonctionnalité ou correction de bug. Si un bug est trouvé, le signaler à part.

5. **Vérifier** : lancer les tests, le linter et le typecheck du projet. S'il n'y a pas de tests sur la zone touchée, le dire, et proposer d'en écrire quelques-uns de caractérisation **avant** un refactoring risqué.

6. **Résumer** : ce qui a changé, pourquoi, et ce qui reste à faire éventuellement.

## Principes et signaux concrets

### DRY — ne pas se répéter
- **Chercher avant de créer** : avant d'écrire un composant, une fonction, un hook ou un utilitaire, chercher (`Glob` par nom, `Grep` par rôle) s'il en existe déjà un. Réutiliser, ou étendre l'existant sans casser ses usages ; ne créer du neuf que s'il est vraiment différent, en disant pourquoi.
- Règle de trois : on factorise à la **troisième** occurrence, ou dès la deuxième si la logique est métier et doit évoluer ensemble.
- On factorise la *connaissance*, pas la ressemblance visuelle. Deux bouts de code identiques qui changent pour des raisons différentes doivent rester séparés.
- Préférer une petite fonction pure bien nommée à un utilitaire générique plein de paramètres booléens.

### SOLID
- **S — Responsabilité unique** : une unité = une raison de changer. Signal : le nom contient « et », « Manager », « Utils », « Helper », ou on doit lire tout le corps pour savoir ce qu'il fait.
- **O — Ouvert/fermé** : un `switch`/`if` sur un type qui se répète à plusieurs endroits → polymorphisme, table de correspondance ou stratégie.
- **L — Substitution de Liskov** : une sous-classe qui lève « non supporté » ou ignore une méthode héritée → mauvaise hiérarchie, préférer la composition.
- **I — Ségrégation des interfaces** : des implémentations qui laissent des méthodes vides → découper l'interface.
- **D — Inversion des dépendances** : la logique métier ne doit pas instancier directement base de données, HTTP, horloge, système de fichiers. Les injecter (paramètre, constructeur) pour pouvoir les remplacer en test.

### Séparation des responsabilités
- Couches distinctes : présentation / logique métier / accès aux données / intégrations externes.
- La logique métier reste pure autant que possible (entrées → sorties, pas d'effets de bord cachés).
- Les effets de bord sont poussés en bordure (contrôleurs, handlers, adaptateurs).
- Regrouper par fonctionnalité plutôt que par type technique quand le projet grandit, si c'est cohérent avec l'existant.

### Lisibilité
- Fonctions courtes et à un seul niveau d'abstraction (repère : ~20-30 lignes, à ajuster au langage).
- Fichiers cohérents (repère : au-delà de ~300-400 lignes, se demander s'il y a plusieurs sujets).
- Retours anticipés (*guard clauses*) plutôt que l'imbrication profonde.
- Noms qui disent l'intention ; constantes nommées au lieu de valeurs magiques.
- Au-delà de 3-4 paramètres, envisager un objet de paramètres.

## Ce qu'il ne faut PAS faire
- Sur-architecturer : pas d'interface avec une seule implémentation « au cas où », pas de factory/stratégie pour un seul cas.
- Abstraire trop tôt : une mauvaise abstraction coûte plus cher qu'une duplication.
- Changer le comportement, l'API publique ou le format des données sans le signaler explicitement.
- Reformater tout un fichier sans raison (pollue le diff).
- Supprimer des commentaires qui expliquent un *pourquoi*.

## Format du résumé final (refactoring)

```
## Refactoring : <zone>
**Problèmes traités**
- <problème> → <transformation> (fichiers)
**Vérification** : tests / lint / typecheck (résultat)
**Non traité / à surveiller**
- <points restants, bugs repérés, zones sans tests>
```
