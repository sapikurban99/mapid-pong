<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Toyo Sensing Pong — Agent Guidelines

Compact rules to avoid known pitfalls. Every line here is something an agent would likely get wrong without help.

## Commands

- `npm run dev` — dev server on :3000
- `npm run lint` — ESLint (Next.js config)
- `npm run build` — production build (will fail if static pages hit Supabase at build time without `force-dynamic`)
- No `typecheck` script — use `npx tsc --noEmit` manually

## Tech Stack

- **Next.js 16** (App Router) — read `node_modules/next/dist/docs/` before writing code
- **React 19**, **Tailwind CSS v4** (PostCSS plugin, no `tailwind.config` file — all config is in `globals.css` via `@theme`)
- **Supabase** (self-hosted at `supabase.pijarteknologi.id`) — client in `src/lib/supabase.ts`
- **Neo Brutalism** design system — use `.box-neo` / `.btn-neo` classes, not raw box-shadow

## Path Alias

`@/*` maps to `./src/*` (tsconfig `paths`).

## Rules (non-negotiable)

### 1. Static Caching Prevention
Every page or route handler that queries Supabase data dynamically MUST export:
```typescript
export const dynamic = "force-dynamic";
```
Without this, Next.js serves stale build-time data.

### 2. Supabase Mutations — Server-Side Only
Never run `insert`/`update`/`delete` from client components. Adblockers and CORS block direct mutations to the self-hosted Supabase. All mutations must go through API routes under `src/app/api/`.

### 3. pg_safeupdate Requires WHERE Clause
The self-hosted database has `pg_safeupdate` enabled. Every `DELETE` needs a `WHERE` clause:
```sql
DELETE FROM mapidpong_matches WHERE id IS NOT NULL;
```

### 4. No styled-jsx
Use Tailwind CSS or global CSS only. `styled-jsx` causes build errors in this setup.

### 5. Timezone-Safe Date Parsing
`new Date("YYYY-MM-DD")` is parsed as UTC, causing off-by-one in local timezone. Always construct manually:
```typescript
const parts = dateStr.split("-");
const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
```

## Architecture Notes

- **Single page app**: main page at `src/app/page.tsx` composes all sections; sub-pages exist for `/livescore`, `/standings`, `/peserta`, `/drawing`, `/bracket`, `/rules`, `/info`
- **API routes**: `src/app/api/players/` (external Toyo Sensing API proxy), `src/app/api/drawing/save/` (insert matches), `src/app/api/drawing/reset/` (calls `reset_tournament` RPC), `src/app/api/drawing/reset-type/` (deletes only one type), `src/app/api/admin/schedule-existing/` (redistribute match dates)
- **Database tables**: `mapidpong_matches`, `mapidpong_score_logs`, `mapidpong_players` — schema in `supabase-schema.sql`
- **Pending DB migration**: Add `wo` to status CHECK + `wo_player TEXT` column (SQL provided in conversation)
- **Realtime**: `LiveScoreClient` and `StandingsClient` subscribe to Supabase Realtime channels for live score updates
- **Fonts**: Space Grotesk (sans) + Space Mono (mono), loaded via `next/font/google`
- **Supabase client**: shared singleton in `src/lib/supabase.ts` — uses env vars `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Match type**: `src/lib/supabase.ts` defines `Match` with `status: "upcoming" | "live" | "finished"` (will add `"wo"` after migration)

## Drawing System (Singles & Doubles)

- **Manual assignment**: Admin picks players from registrant list, assigns them to groups (A-D) by clicking. No random draw.
- **Singles vs Doubles**: Drawn separately. Drawing one type does NOT wipe the other type's data.
- **Doubles pairs**: Admin manually creates pairs (2 players) before assigning to groups.
- **Group naming**: Both singles and doubles use group names A-D, but they are separate namespaces (filtered by `type`/`match_type` columns).
- **Save flow**: `POST /api/drawing/save` accepts a `type` parameter and only resets data for that type, not all data.
- **Reset**: Full reset (`/api/drawing/reset`) calls `reset_tournament()` RPC. Type-specific reset (`/api/drawing/reset-type`) deletes only one type.
- **Match generation**: Round-robin within each group. Matches have `match_type` set to the drawing type and `round: "Group Stage"`.

## Scoring Rules

- **Menang = 3 poin**, **Kalah = 1 poin**, **Walk Out (WO) = 0 poin**
- Standings dihitung client-side di `Standings.tsx` — hanya pertandingan `status: "finished"` atau `status: "wo"` yang dihitung
- Tiebreaker: Poin desc → Menang desc → Kalah asc → Nama alfabetikal
- Match `wo`: skor otomatis 0-0, `wo_player` field menandai siapa yang WO

## Filter Tabs Pattern

Peserta, Standings, LiveScore, and Bracket pages all support filtering by type (Semua / Singles / Doubles). Use the pattern:
```typescript
type FilterType = "all" | "singles" | "doubles";
const [filter, setFilter] = useState<FilterType>("all");
const filtered = filter === "all" ? data : data.filter(item => item.type === filter);
```
