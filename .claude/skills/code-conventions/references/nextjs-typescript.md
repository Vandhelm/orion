# Next.js (App Router) et TypeScript

À appliquer **en plus** des règles générales du skill. Commence toujours par vérifier les versions dans `package.json` et la config existante (`tsconfig.json`, `next.config`). On suit ce que le projet utilise déjà.

**Version de Next.js** : si `AGENTS.md` signale une version récente avec des changements cassants, lire le guide concerné dans `node_modules/next/dist/docs/` avant d'utiliser une API Next.js (Server Actions, `server-only`, `loading.tsx`, cache, revalidation...). Les règles ci-dessous décrivent l'intention ; si une API a changé de nom ou de forme, suivre la documentation de la version installée.

**Gestionnaire de paquets** : utiliser celui du projet (`packageManager` dans `package.json`). Avec Bun : `bun run <script>`, `bunx <outil>`, `bun install`.

Pour tout ce qui touche à l'interface (composants visuels, Tailwind, couleurs, thèmes, CSS), appliquer aussi le skill **`ui-conventions`**.

## Next.js : séparer serveur et client

**Composants serveur par défaut**
- `"use client"` uniquement sur les feuilles interactives (bouton, formulaire, menu), jamais sur une page ou un layout entier.
- Signal à corriger : une page complète passée en client pour un seul `useState`. On extrait la partie interactive dans un petit composant client et le reste redevient serveur.
- On passe des composants serveur aux composants client par `children` ou par props plutôt que de tout basculer côté client.

**Accès aux données**
- Requêtes BD et appels aux API privées dans une couche dédiée (`lib/`, `server/` ou `features/<x>/server/` selon le projet), marquée `import "server-only"`.
- Les pages et layouts appellent cette couche, ils ne contiennent ni SQL ni `fetch` détaillé.
- Signal : la même requête ou le même `fetch` copié dans plusieurs pages → une fonction de la couche données.

**Server Actions et Route Handlers**
- Server Actions dans des fichiers `actions.ts` avec `"use server"`, pas mélangés à du code client.
- Une action reste mince : elle valide l'entrée (Zod ou l'équivalent du projet), vérifie l'autorisation, appelle un service métier, puis revalide/redirige. La logique métier vit dans le service, pas dans l'action.
- Même règle pour `route.ts` : parser, valider, déléguer, répondre.
- Toujours vérifier l'authentification et l'autorisation **dans** l'action ou le handler, pas seulement dans l'UI.

**Organisation**
- Respecter la structure existante. Si elle est à créer : regrouper par fonctionnalité (`features/<nom>/{components,hooks,server,schemas,types}`) ou colocaliser dans `app/` avec des dossiers privés `_components`.
- Avant de créer un hook, un service ou un utilitaire, chercher s'il en existe déjà un (`hooks/`, `lib/`, `features/*/`).
- Logique client réutilisée (état, effets, abonnements) → hook personnalisé `useXxx`.
- Prop drilling sur plusieurs niveaux → composition (`children`, slots) d'abord, Context seulement si l'état est vraiment partagé largement.
- Ne jamais importer un module serveur depuis un composant client.

## TypeScript

- Pas de `any`. Utiliser `unknown` puis du rétrécissement (*narrowing*), ou un vrai type.
- Une seule source de vérité pour les types : les dériver du schéma (`z.infer<typeof schema>`), de l'ORM (Prisma, Drizzle) ou d'un fichier `types` partagé, au lieu de redéclarer la même forme côté client et serveur.
- Plusieurs booléens qui s'excluent (`isLoading`, `isError`, `isSuccess`) → union discriminée (`status: "loading" | "error" | "success"`).
- Unions de littéraux ou objets `as const` plutôt que `enum`, sauf si le projet utilise déjà des `enum`.
- `satisfies` pour vérifier un objet de config sans perdre l'inférence.
- `import type` pour les imports uniquement typés.
- Typer explicitement les retours des fonctions exportées de la couche données et des services.
- Les props d'un composant dans un type nommé (`type ButtonProps = ...`), pas en ligne quand elles sont nombreuses.

## Vérification spécifique

- Typecheck : le script du projet s'il existe, sinon `tsc --noEmit` (avec Bun : `bunx tsc --noEmit`).
- Le script de lint défini dans `package.json` (avec Bun : `bun run lint`).
- Les tests du projet s'il y en a (avec Bun : `bun test`).
- Si des frontières serveur/client ont bougé ou si des fichiers ont été déplacés dans `app/` : lancer le build (script `build`, avec Bun : `bun run build`) pour détecter les erreurs de composant serveur/client et de routage.
