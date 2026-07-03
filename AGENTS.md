<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — dev server on :3000
- `npm run lint` — ESLint (Next.js config)
- `npm run build` — fails if static pages hit Supabase at build time without `force-dynamic`
- No `typecheck` script — `npx tsc --noEmit`

## Tech Stack

- **Next.js 16** (App Router) — read `node_modules/next/dist/docs/` before coding
- **React 19**, **Tailwind CSS v4** (PostCSS plugin, no `tailwind.config` — config is in `globals.css` via `@theme`)
- **Supabase** (self-hosted at `supabase.pijarteknologi.id`) — client in `src/lib/supabase.ts`
- **Design**: Neo Brutalism — use `.box-neo` / `.btn-neo` classes, not raw box-shadow

## Path Alias

`@/*` → `./src/*`

## Rules

### 1. Static Caching Prevention
Every page hitting Supabase dynamically must export `dynamic = "force-dynamic"` (already on `page.tsx`, `livescore`, `standings`, `peserta`, `bracket`). Static pages (`/info`, `/rules`) skip it.

### 2. Supabase Mutation — Two Valid Patterns
- **Direct client** (score updates): `api.ts` helpers (`updateScore`, `updateStatus`) call `supabase.from().update()` / `.insert()` from client components. RLS is disabled (schema runs `DISABLE ROW LEVEL SECURITY` on all tables), so this works.
- **API routes** (bulk ops): drawing save/reset, admin scheduling via `POST /api/drawing/*`, `POST /api/admin/*`.

### 3. pg_safeupdate Requires WHERE
Every `DELETE` needs a `WHERE` clause:
```sql
DELETE FROM mapidpong_matches WHERE id IS NOT NULL;
```

### 4. No styled-jsx
Use Tailwind or global CSS only.

### 5. Timezone-Safe Date Parsing
```typescript
const parts = dateStr.split("-");
const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
```
Used in `MatchCalendar.tsx:14-21`, `LiveScore.tsx:9-17`.

## Architecture Notes

- **Sub-page app**: `src/app/page.tsx` = Hero + Marquee + dashboard nav. Sections are separate routes under `src/app/{livescore,standings,peserta,bracket,drawing,info,rules}/page.tsx`.
- **API routes**: `src/app/api/players/` (Toyo Sensing API proxy), `src/app/api/drawing/save/`, `src/app/api/drawing/reset/` (calls `reset_tournament` RPC), `src/app/api/drawing/reset-type/`, `src/app/api/admin/schedule-existing/`.
- **Database**: `mapidpong_matches`, `mapidpong_score_logs`, `mapidpong_players` — schema in `supabase-schema.sql`.
- **Pending migration**: `wo` status + `wo_player` column not yet in schema or code (status CHECK is `'upcoming','live','finished'` only).
- **Realtime**: `LiveScoreClient` & `StandingsClient` subscribe to Supabase Realtime channels.
- **Bracket**: client component filtering by `match_type` + `round`. No Realtime — SSR data from `bracket/page.tsx`.
- **Env**: `.env*` is gitignored. `.env.local` exists locally with secrets; never commit.

## Drawing System

- Manual admin assignment from registrant list to groups A-D (no random draw).
- Singles/doubles drawn separately — one type doesn't wipe the other.
- **Doubles**: admin creates pairs (2 players) before group assign.
- Group names A-D are separate namespaces per type (filtered by `type`/`match_type`).
- Save: `POST /api/drawing/save` with `type` param resets only that type's data. Full reset: `POST /api/drawing/reset`. Type reset: `POST /api/drawing/reset-type`.
- Match generation: round-robin within groups, `round: "Group Stage"`.

## Scoring Rules

- **Poin = Menang × 2** (2 pts / win, 0 / loss). Computed in `Standings.tsx:75`.
- Only `status: "finished"` matches counted.
- Tiebreaker: Poin desc → Menang desc → Kalah asc → Nama asc (`Standings.tsx:80-86`).

## Filter Tabs Pattern

Peserta, Standings, LiveScore, Bracket all filter by type:
```typescript
type FilterType = "all" | "singles" | "doubles";
const [filter, setFilter] = useState<FilterType>("all");
const filtered = filter === "all" ? data : data.filter(item => item.type === filter);
```
