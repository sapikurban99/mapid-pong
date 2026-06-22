<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mapid Pong Developer Guidelines

To ensure the application remains stable and functional, all future agents working on this codebase MUST follow these guidelines:

### 1. Next.js Static Caching Prevention
- **Issue**: Next.js statically renders pages at build time. Since the Supabase database is initially empty or changes dynamically, pages will show stale or empty data unless configured.
- **Rule**: Every page or API route that queries Supabase data dynamically (e.g., `/livescore`, `/standings`, `/peserta`) MUST include the following export to bypass static generation caching:
  ```typescript
  export const dynamic = "force-dynamic";
  ```

### 2. Supabase Mutations & CORS Proxying
- **Issue**: Direct client-side updates/mutations to the Supabase endpoint (`https://supabase.pijarteknologi.id`) are frequently blocked by browser adblockers or CORS constraints.
- **Rule**: Do NOT run `insert`, `update`, or `delete` statements directly from client-side components. All mutations must be proxied through server-side API routes under `src/app/api/...` (e.g., `/api/drawing/save`, `/api/drawing/reset`). Reading data is fine via the client client, but mutations must happen server-side.

### 3. Database safe_update Bypass
- **Issue**: The self-hosted Supabase database has `pg_safeupdate` enabled, which blocks `DELETE` operations that do not have a `WHERE` clause.
- **Rule**: When deleting all rows in a table (e.g. during database reset), you must append `WHERE id IS NOT NULL`. For example, in postgres functions:
  ```sql
  DELETE FROM mapidpong_matches WHERE id IS NOT NULL;
  ```

### 4. CSS & Styling Restrictions
- **Rule**: Do NOT use `styled-jsx` for styling components. It causes compilation errors during Next.js builds. Stick to standard Tailwind CSS classes or global CSS.

### 5. Timezone-Safe Date Parsing
- **Issue**: Standard JS parsing of `YYYY-MM-DD` date strings using `new Date("YYYY-MM-DD")` treats the input as UTC, causing off-by-one-day shifts when displaying in local timezone.
- **Rule**: Always split the date string by `-` and construct the date object using individual parameters (year, month - 1, day):
  ```typescript
  const parts = dateStr.split("-");
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  ```
