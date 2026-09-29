# Repository Guidelines

## Project Structure & Module Organization

`frontend/` is a React, Vite, and Tailwind CSS client; its `src/pages/` holds views, `src/components/` reusable UI, and `src/services/` API calls. `fullstack-todo-app-jwt-authentication/` is the TypeScript, Express, and Prisma backend. Its `src/` separates routes, controllers, services, repositories, middleware, and tests; `prisma/` holds the schema, migrations, and seed data. Root `validators/` contains separate JavaScript exercises. Project notes live in `memory-bank/` and `docs/ai-logs/`.

## Build, Test, and Development Commands

Run commands from the relevant application directory after `npm install`.

- Backend: `npm run dev` starts the TypeScript server; `npm run build` compiles to `dist/`; `npm start` runs the compiled server.
- Backend: `npm test` runs Jest serially; `npm run test:cov` adds a coverage report; `npm run seed` loads Prisma seed data.
- Frontend: `npm run dev` starts Vite; `npm run build` creates a production bundle; `npm run preview` serves that bundle locally.

Root `npm test` is a placeholder that exits with an error.

## Coding Style & Naming Conventions

Follow the surrounding code's two-space indentation and existing import style. Backend code uses TypeScript with strict type checking; frontend code uses JavaScript and JSX. Use PascalCase for React components and classes (`HomePage.jsx`, `LevelService`), camelCase for functions and service modules (`fetchLeaderboard`, `levelService.ts`), and descriptive route or controller names. No repository-wide formatter or lint command is configured; keep edits consistent with nearby files.

## Testing Guidelines

Backend tests use Jest, `ts-jest`, and Supertest. Add behavior-focused `*.test.ts` files under backend `src/tests/`, especially for changed routes, services, and repository behavior. Run `npm test` and `npm run build` in the backend after backend changes. No frontend test script or coverage threshold is configured; verify frontend changes with `npm run build` and a local browser check when UI behavior changes.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Fix Bug levelPage 34` and `Add Leaderboard to display Ranking from the Database`. Keep subjects concise and specific to the affected feature. In pull requests, explain the behavior change, identify affected areas, note validation commands, link related issues when available, and include screenshots for visible UI changes.

## Configuration & Secrets

Copy each application's `.env.example` to a local `.env` and set database, JWT, API, and Google OAuth values as needed. Keep secrets out of commits; `.env` files are ignored. Apply Prisma migrations when changing the database schema.
