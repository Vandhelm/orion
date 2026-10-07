@AGENTS.md

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Conventions ORION

Ce projet est une application **Next.js** (App Router, code dans `src/`). Bun sert de gestionnaire de paquets et à lancer les scripts (`bun run dev`, `bun run build`, `bun run lint`). Les consignes Bun plus haut sur `Bun.serve()` et les imports HTML ne s'appliquent pas au frontend : les pages et les routes d'API passent par Next.js.

### Règles non négociables (interface)

- **Couleurs** : jamais d'hexadécimal, de `rgb()` ni de couleur arbitraire (`text-[#...]`) dans les composants. Utiliser uniquement les tokens sémantiques (`bg-accent`, `text-foreground`...), qui gèrent les thèmes clair et sombre. Pas de `dark:` pour les couleurs.
- **Palette et tokens** : définis dans `src/app/globals.css` (palette dans `@theme`, tokens dans `@theme inline`, thèmes dans `:root` et `.dark`). C'est le seul fichier où un hexadécimal peut apparaître. Un token manquant s'ajoute là, dans les deux thèmes.
- **Composants** : avant d'en créer un, toujours chercher s'il en existe déjà un qui fait la même chose (`src/components/`, `src/components/ui/`, `src/features/*/components/`, `_components` dans `src/app/`). Le réutiliser ou l'étendre ; n'en créer un nouveau que s'il est vraiment différent, et dire pourquoi.
- Pour le détail : skills `ui-conventions` (interface) et `code-conventions` (structure du code), agent `architecte` pour les gros refactorings.
