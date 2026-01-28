# Project Conventions

## Tech Stack

- Runtime: Bun
- Framework: Next.js 16 (App Router)
- Database: Bun SQL (PostgreSQL)
- Auth: NextAuth v5 + Resend (magic links)
- Linting: Biome
- Git hooks: Lefthook
- Deployment: Coolify + Nixpacks

## Architecture

Hexagonal architecture (ports & adapters):

- `src/core/` - Pure domain logic, no I/O
- `src/db/` - Database client, migrations
- `src/infrastructure/` - External service adapters
- `src/services/` - Business orchestration
- `src/app/` - Next.js routes and pages
- `src/components/` - React UI components
- `src/lib/` - Utilities (auth, env validation)

## Code Standards

### Functional Programming (Mandatory)

- Arrow functions only: `export const fn = () => {}`
- No loops: use `map`, `filter`, `reduce`, `flatMap`
- Immutability: no `push`, `splice`, or direct mutation
- Early returns over nested ternaries

### TypeScript

- Let TypeScript infer return types
- Union types over optionals: `field: T | null` not `field?: T`
- `import type` for type-only imports
- Named exports only (except Next.js pages/layouts/routes)

### File Organization

- kebab-case file names
- Files under 300 lines
- Import order: types → external → internal

### Security (OWASP)

- Parameterized queries only (Bun SQL template literals)
- No `dangerouslySetInnerHTML`
- No hardcoded secrets
- Auth middleware on protected routes

## Git Conventions

### Branches

Pattern: `(feat|fix|chore)/kebab-case`

### Commits

Pattern: `type: lowercase present-tense description`
Types: feat, fix, chore, docs, refactor, test, style, perf, ci, build

Example: `feat: add user authentication`

## Commands

- `bun dev` - Start dev server
- `bun test` - Run tests
- `bun run lint` - Run Biome (with fixes)
- `bun run lint:check` - Run Biome (check only)
- `bun run typecheck` - TypeScript check
- `bun run build` - Production build

## Database

### Connection

Uses lazy initialization - no DATABASE_URL needed at build time:

```typescript
import { getDb } from '@/db/client'

const db = getDb()
const users = await db`SELECT * FROM users WHERE id = ${userId}`
```

### Migrations

- Stored in `src/db/migrations/`
- Auto-run on app startup via `instrumentation.ts`
- Lock prevents concurrent migration runs
- Add new migrations by creating numbered files and adding to `migrations/index.ts`

### Adding a Migration

1. Create `src/db/migrations/XXX-description.ts`
2. Export `id` and `up` function
3. Add to `migrations/index.ts` array
4. Deploy - migration runs automatically on startup

## Authentication

Using NextAuth v5 with custom Bun SQL adapter:

- Magic link auth via Resend
- JWT sessions (no sessions table)
- Protected routes use `auth()` from `@/lib/auth`

```typescript
import { auth } from '@/lib/auth'

const session = await auth()
if (!session) {
  redirect('/auth/signin')
}
```
