import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getDatesInRange(startDateStr: string, endDateStr: string, skipWeekends: boolean = true): string[] {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (!skipWeekends || !isWeekend) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { players, matches, type, startDate = "2026-07-06", endDate = "2026-07-17", skipWeekends = true } = body;

    if (!players || players.length === 0) {
      return NextResponse.json({ error: "Data pemain kosong" }, { status: 400 });
    }

    if (type !== "singles" && type !== "doubles") {
      return NextResponse.json({ error: "Type harus 'singles' atau 'doubles'" }, { status: 400 });
    }

    // 1. Delete only matches of this type (not full reset)
    const { error: deleteMatchError } = await supabase
      .from("mapidpong_matches")
      .delete()
      .eq("match_type", type)
      .not("id", "is", null);

    if (deleteMatchError) {
      console.error("Delete Matches Error:", deleteMatchError);
      return NextResponse.json({ error: "Gagal menghapus pertandingan lama." }, { status: 500 });
    }

    // 2. Delete only players of this type (not full reset)
    const { error: deletePlayerError } = await supabase
      .from("mapidpong_players")
      .delete()
      .eq("type", type)
      .not("id", "is", null);

    if (deletePlayerError) {
      console.error("Delete Players Error:", deletePlayerError);
      return NextResponse.json({ error: "Gagal menghapus pemain lama." }, { status: 500 });
    }

    // 3. Insert Players
    const { error: insertPlayersError } = await supabase
      .from("mapidpong_players")
      .insert(players);
    if (insertPlayersError) {
      console.error("Insert Players Error:", insertPlayersError);
      return NextResponse.json({ error: "Gagal menyimpan pemain baru." }, { status: 500 });
    }

    // 4. Insert Matches
    if (matches && matches.length > 0) {
      // Shuffle the matches array to interleave groups
      for (let i = matches.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [matches[i], matches[j]] = [matches[j], matches[i]];
      }

      // Generate scheduling dates
      const dates = getDatesInRange(startDate, endDate, skipWeekends);
      const D = dates.length;
      const N = matches.length;

      let dateIdx = 0;
      let currentBucketCount = 0;
      let buckets: number[] = [];

      if (D > 0) {
        buckets = Array.from({ length: D }, () => 0);
        let remaining = N;
        for (let i = 0; remaining > 0; i = (i + 1) % D) {
          buckets[i]++;
          remaining--;
        }
      }

      // Assign match_order and scheduled_date
      matches.forEach((m: any, index: number) => {
        m.match_order = index + 1;
        
        if (D > 0) {
          if (currentBucketCount >= buckets[dateIdx]) {
            dateIdx++;
            currentBucketCount = 0;
          }
          m.scheduled_date = dates[dateIdx];
          currentBucketCount++;
        } else {
          m.scheduled_date = null;
        }
      });

      const { error: insertMatchesError } = await supabase
        .from("mapidpong_matches")
        .insert(matches);
      if (insertMatchesError) {
        console.error("Insert Matches Error:", insertMatchesError);
        return NextResponse.json({ error: "Gagal menyimpan jadwal pertandingan." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Save Drawing Exception:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
