# TOYO SENSING PONG - Ping Pong Tournament 2026

Website turnamen pingpong internal TOYO SENSING dengan fitur Live Score dan SQL Editor.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime Subscriptions
- **Design**: Neo Brutalism

## Fitur

- **Hero** - Landing page dengan statistik peserta
- **Tournament Info** - Jadwal, format, lokasi, hadiah
- **Live Score** - Skor langsung real-time, mode wasit untuk input
- **Game Rules** - Aturan singles, doubles, bracket
- **Peserta** - Grid peserta terdaftar
- **Klasemen** - Standings per grup (round robin)
- **Bracket** - Double elimination bracket (UB + LB)
- **SQL Editor** - Query editor langsung ke Supabase

## Database

### Tabel

| Tabel | Deskripsi |
|---|---|
| `mapidpong_matches` | Semua pertandingan (singles & doubles) |
| `mapidpong_score_logs` | Log perubahan skor (audit trail) |

### Setup

1. Buka Supabase Dashboard
2. SQL Editor
3. Copy paste isi `supabase-schema.sql`
4. Jalankan query

## Lokasi File

```
src/
├── app/
│   ├── page.tsx              # Main page (single page app)
│   ├── layout.tsx            # Root layout + fonts
│   ├── globals.css           # Tailwind + custom CSS
│   └── sqleditor/
│       └── page.tsx          # SQL Editor page
├── components/
│   ├── Navbar.tsx            # Fixed navigation
│   ├── Marquee.tsx           # Scrolling ticker
│   ├── Hero.tsx              # Landing hero
│   ├── Info.tsx              # Tournament info cards
│   ├── LiveScore.tsx         # Live score + referee mode
│   ├── Rules.tsx             # Game rules (tabbed)
│   ├── Peserta.tsx           # Participant grid
│   ├── Standings.tsx         # Group standings
│   ├── Bracket.tsx           # Double elimination bracket
│   ├── Footer.tsx            # Site footer
│   └── ScrollToTop.tsx       # Scroll to top button
└── lib/
    ├── api.ts                # Toyo Sensing API fetch + group logic
    └── supabase.ts           # Supabase client + types

supabase-schema.sql           # Database schema (run in Supabase)
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.pijarteknologi.id
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## Development

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`

## Live Score

- Buka section `#livescore` atau klik nav "Live Score"
- Toggle **Mode Wasit** untuk input skor
- Masukkan nama wasit
- Klik "Edit Skor" → +1 Poin / Undo / Ubah Status
- Real-time: semua client otomatis update

## SQL Editor

- Akses `/sqleditor`
- Quick queries sidebar untuk query umum
- Schema reference di bawah editor
- Shortcut: `Ctrl/Cmd + Enter` untuk jalankan
