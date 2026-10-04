---
name: ui-conventions
description: Conventions d'interface pour Next.js, Tailwind et CSS — réutilisation des composants existants, palette de couleurs, tokens sémantiques, thèmes clair et sombre, CSS personnalisé, états UX, responsive et accessibilité. À utiliser dès qu'on crée ou modifie un composant, une page, un formulaire, un style, une couleur, un thème ou une animation, ou qu'on intègre une maquette.
---

# Conventions d'interface

Objectif : une interface cohérente, construite à partir des composants et des tokens qui existent déjà, qui fonctionne en thème clair et sombre.

## Méthode

1. **Lire l'existant avant d'écrire**
   - Vérifier les versions dans `package.json` (Next.js, React, Tailwind v3 ou v4) et les bibliothèques UI installées (shadcn/ui, Radix, Headless UI, `cva`, `clsx`, `tailwind-merge`...).
   - Ouvrir le fichier qui définit la palette et les tokens (souvent `app/globals.css`, sinon `tailwind.config`). Noter les tokens disponibles.
   - Regarder 2-3 composants voisins pour reprendre leur style d'écriture.
2. **Chercher un composant existant** (section suivante). C'est obligatoire.
3. **Construire** avec les tokens et les composants trouvés.
4. **Vérifier** (section « Vérification »).

## Réutiliser avant de créer (obligatoire)

Avant de créer un composant, un hook ou un utilitaire d'interface, **toujours chercher s'il en existe déjà un qui fait la même chose ou presque** :
- regarder `components/`, `components/ui/`, `features/*/components/`, les `_components` de `app/`, et `hooks/`, `lib/` ;
- chercher par nom (`Glob` sur `**/*Button*`, `**/*Modal*`, `**/*Dialog*`, `**/*Card*`...) **et** par rôle (`Grep` sur le texte, les props ou le balisage caractéristique), car un même composant peut porter un autre nom ;
- vérifier les bibliothèques UI déjà installées avant d'en ajouter une ou d'écrire un composant à la main.

Ensuite :
- **il existe et convient** → l'utiliser ;
- **il existe mais il manque quelque chose** → l'étendre (nouvelle variante, nouvelle prop optionnelle, `children`/slot) sans casser ses usages actuels, plutôt que d'en créer une copie ;
- **il est trop différent** (autre rôle, l'étendre le rendrait confus) → en créer un nouveau, et dire pourquoi l'existant ne convenait pas ;
- **des doublons existent déjà** (deux `Button`, deux modales...) → le signaler et proposer une fusion vers un seul composant.

## Couleurs : palette → tokens sémantiques → thèmes

Trois niveaux, avec les mécanismes natifs de Tailwind, définis en un seul endroit (le CSS global, ex. `app/globals.css`) :

1. **Palette** : chaque nom de couleur associé à son hexadécimal (`red-500` → `#8F301D`). C'est le **seul** endroit où un hexadécimal apparaît.
2. **Tokens sémantiques** : chaque rôle pointe vers une couleur de la palette (`accent` → `red-500`). Les composants n'utilisent **que** ces tokens.
3. **Thèmes** : le thème sombre redéfinit les tokens vers d'autres couleurs de la palette, sans toucher aux composants.

Tailwind v4 (config dans le CSS) :

```css
@import "tailwindcss";

/* Thème sombre piloté par la classe .dark sur <html> (au lieu de la préférence système) */
@custom-variant dark (&:where(.dark, .dark *));

/* 1. Palette : nom → hexadécimal. Génère bg-red-500, text-red-500, etc. */
@theme {
  /* --color-*: initial;  ← à décommenter pour retirer la palette par défaut de Tailwind */
  --color-red-300: #C9735F;
  --color-red-500: #8F301D;
  --color-neutral-50: #FAFAF9;
  --color-neutral-900: #1C1917;
}

/* 2. Tokens sémantiques. "inline" est nécessaire pour que le changement de thème se propage */
@theme inline {
  --color-accent: var(--accent);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

/* 3. Thèmes : clair par défaut, sombre sous .dark */
:root {
  --accent: var(--color-red-500);
  --background: var(--color-neutral-50);
  --foreground: var(--color-neutral-900);
}
.dark {
  --accent: var(--color-red-300);
  --background: var(--color-neutral-900);
  --foreground: var(--color-neutral-50);
}
```

Dans les composants on écrit `bg-accent`, `text-foreground`, `bg-background`.

### Si la palette n'existe pas encore : l'extraire de l'existant

Ne pas inventer de couleurs. La palette se reconstruit à partir de ce qui est déjà dans le code :

1. **Inventaire** : relever toutes les couleurs utilisées (`Grep` sur `#[0-9a-fA-F]{3,8}`, `rgb(`, `hsl(`, `oklch(`, `[#` pour les valeurs arbitraires Tailwind, et les classes de palette Tailwind comme `bg-zinc-50`). Chercher dans le CSS global, les CSS Modules, les composants, les SVG, et les maquettes HTML présentes dans le dépôt. Pour chaque couleur, noter où et comment elle est utilisée (fond, texte, bordure, focus, survol, illustration...).
2. **Source de vérité** : si une maquette ou un design dédié existe (fichier HTML, Figma), il prime sur le code de démarrage d'un générateur (create-next-app, etc.), qui sera remplacé.
3. **Fusionner les quasi-doublons** (couleurs presque identiques, comme `#000` et `#121212` utilisés pour le même rôle) et le signaler.
4. **Nommer la palette** par teinte et intensité, à la manière de Tailwind (`pink-500`, `lime-300`, `neutral-950`), en choisissant l'intensité la plus proche de l'échelle Tailwind.
5. **Déduire les tokens** des rôles observés à l'étape 1 (`background`, `foreground`, `border`, `accent`, `highlight`, `focus`...). Un token par rôle, pas par couleur.
6. **Construire le thème sombre** : si l'existant n'en a pas, inverser les neutres (fond ↔ texte, bordures) et garder les couleurs vives, sauf si elles posent un problème de contraste.
7. **Vérifier le contraste** de chaque paire texte/fond dans les deux thèmes (WCAG AA : 4,5:1 pour le texte). Une couleur vive illisible sous du blanc reçoit un token `*-foreground` fixe et sombre dans les deux thèmes.
8. **Écrire** la palette, les tokens et les thèmes dans le CSS global, avec un commentaire court sur le rôle de chaque couleur. Garder le comportement actuel du thème (par exemple, suivre la préférence système si c'était le cas).
9. **Ne pas remplacer en masse** les couleurs codées en dur dans les composants pendant cette étape. Présenter le tableau palette → tokens à la personne, puis migrer les composants ensuite, fichier par fichier.

Tailwind v3 : même principe. La palette va dans `theme.extend.colors` de `tailwind.config`, les tokens pointent vers des variables CSS (`accent: "var(--accent)"`), les variables sont définies dans `:root` / `.dark` du CSS global, et on règle `darkMode: "class"`.

Règles :
- **Aucun hexadécimal, `rgb()` ou valeur arbitraire de couleur** (`text-[#8F301D]`) dans les composants → utiliser le token correspondant (et l'ajouter à la palette ou aux tokens s'il manque).
- **Pas de couleur de palette dans les composants** (`bg-red-500`) quand un token existe pour ce rôle → utiliser le token (`bg-accent`).
- **Pas de `dark:` pour les couleurs** (`bg-white dark:bg-neutral-900`) : le token change déjà selon le thème. On garde `dark:` pour ce qui n'est pas une couleur (une image ou une ombre différente, par exemple).
- Avant d'ajouter un token, vérifier qu'un token existant ne joue pas déjà ce rôle. Nommer un token par son rôle (`accent`, `danger`, `muted`), jamais par sa valeur (`rouge-fonce`).
- Tout nouveau token est défini **dans les deux thèmes**.
- Respecter les noms déjà en place si le projet a sa propre convention (préfixe, etc.).
- Mêmes règles pour les autres valeurs répétées (espacements, rayons, ombres, polices) : les mettre dans `@theme` plutôt que de répéter `p-[18px]`.

## Tailwind

- Une longue liste de classes répétée → **un composant** (après avoir vérifié qu'il n'existe pas déjà), pas `@apply`. On garde `@apply` pour les rares cas sans composant (contenu Markdown, éléments tiers).
- Variantes (taille, couleur, état) → une table de variantes (`cva` ou un objet `Record<Variant, string>`), pas une chaîne de ternaires dans le `className`.
- Fusion des classes passées en props avec `cn()` (clsx + tailwind-merge) si le projet l'a déjà ou si des surcharges de classes posent problème.
- Ne pas extraire un composant pour 2 ou 3 classes : une duplication courte et lisible est acceptable.
- Ne jamais construire un nom de classe par concaténation (`bg-${couleur}-500`) : Tailwind ne le détecte pas. Utiliser une table de correspondance avec les classes complètes.
- Garder l'ordre des classes géré par `prettier-plugin-tailwindcss` s'il est installé ; sinon ne pas réordonner à la main (ça pollue le diff).

## CSS personnalisé (autorisé)

Le CSS personnalisé n'est pas banni. C'est le bon choix pour le visuel complexe que Tailwind exprime mal : animations à plusieurs étapes (`@keyframes`), `clip-path` et masques élaborés, dégradés complexes, pseudo-éléments décoratifs, sélecteurs avancés (`:has()`, enfants imbriqués), animations liées au défilement, styles de SVG ou de contenu tiers.
- Le placer dans un CSS Module colocalisé (`MonComposant.module.css`) si c'est propre à un composant, ou dans `@layer components` du CSS global si c'est partagé.
- Utiliser les variables du thème (`var(--color-accent)`, `var(--spacing)`...), jamais d'hexadécimal en dur, pour que le thème sombre fonctionne aussi.
- Garder Tailwind pour la mise en page, les espacements et la typographie, et ne mettre en CSS que la partie difficile. Ne pas définir la même propriété à la fois en Tailwind et en CSS sur le même élément.
- Ne pas convertir en Tailwind un CSS qui deviendrait illisible (longue chaîne de valeurs arbitraires) : dans ce cas le CSS est préférable.
- Respecter `prefers-reduced-motion` pour les animations marquées.

## UX : états et responsive

- Tout ce qui charge, liste ou envoie des données prévoit ses états : **chargement**, **vide**, **erreur**, **succès**. En Next.js, utiliser `loading.tsx`, `error.tsx`, `not-found.tsx` et `<Suspense>` plutôt que de bricoler ces états dans chaque page.
- Formulaires : message d'erreur près du champ concerné, bouton désactivé ou avec indicateur pendant l'envoi, pas de double soumission.
- Mobile d'abord : classes de base pour le petit écran, puis `sm:`, `md:`, `lg:`. Vérifier qu'il n'y a pas de défilement horizontal.
- Zones cliquables d'au moins 44 × 44 px sur mobile.

## Accessibilité de base

- Le bon élément HTML : `<button>` pour une action, `<a>`/`<Link>` pour une navigation, jamais un `<div onClick>`.
- Chaque champ a un `<label>` associé ; chaque image informative a un `alt`, une image décorative `alt=""`.
- Focus visible sur tous les éléments interactifs (`focus-visible:` avec un token, ex. `focus-visible:ring-accent`).
- Contraste suffisant (WCAG AA : 4,5:1 pour le texte normal) **dans les deux thèmes**. Le vérifier quand on ajoute ou change un token.
- Modales, menus et onglets : utiliser un composant accessible existant (Radix, shadcn/ui...) plutôt que de les réécrire.

## Vérification

- Typecheck et lint du projet.
- Si possible, ouvrir la page et regarder le résultat **en thème clair et en thème sombre**, sur une largeur mobile et une largeur bureau.
- Relire le diff : aucun hexadécimal hors du fichier de palette, aucun `dark:` de couleur, aucun composant en double créé.
- Dans le résumé final, indiquer les composants réutilisés, étendus ou créés (avec la raison pour les créés), et les tokens ajoutés.
