# SenseForge

SenseForge is a greenfield AI intelligence infrastructure platform. This repo contains the web app, Chrome extension, shared type system, prompt intelligence engine, multi-provider AI adapter layer, and Supabase schema.

## Apps

- `apps/web`: Next.js web application and server API routes.
- `apps/extension`: Plasmo Chrome extension for the universal forge bar, highlighted-text actions, and page context.

## Packages

- `packages/shared`: Core schemas, types, constants, and seed data.
- `packages/prompt-engine`: Intent detection, prompt structuring, and output formatting.
- `packages/ai`: Server-side AI provider adapters and routing.

## Local Setup

```bash
npm install
npm run dev
```

Copy `apps/web/.env.example` to `apps/web/.env.local` for real provider and Supabase credentials.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build:web
```

