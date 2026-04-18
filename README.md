# ResQRoute

Monorepo full-stack starter with:

- Next.js (App Router, TypeScript, Tailwind CSS)
- Express + Node.js + TypeScript
- MongoDB (Mongoose)
- Socket.IO
- Zustand
- Anime.js
- Google Maps JS API

## Project Structure

apps/

- web: Next.js frontend
- api: Express backend

packages/

- types: shared TypeScript types

## Setup

1. Copy env files:

   - root `.env.example`
   - `apps/web/.env.example` to `apps/web/.env.local`
   - `apps/api/.env.example` to `apps/api/.env`

2. Install dependencies:

   npm install

3. Start both apps:

   npm run dev

## Useful Scripts

- `npm run dev` - run web and api concurrently
- `npm run dev` - auto-clears ports `3000`/`5000` and runs web + api concurrently
- `npm run dev:web` - run only Next.js app
- `npm run dev:api` - run only Express API
- `npm run build` - build shared types, api, and web
- `npm run lint` - run lint checks
- `npm run format` - format files with Prettier
- `npm run typecheck` - run TypeScript checks
