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
    const { players, matches, startDate = "2026-07-06", endDate = "2026-07-17", skipWeekends = true } = body;

    if (!players || players.length === 0) {
      return NextResponse.json({ error: "Data pemain kosong" }, { status: 400 });
    }

    // 1. Reset Database using our new dedicated RPC
    const { error: resetError } = await supabase.rpc("reset_tournament");
    if (resetError) {
      console.error("Reset Error:", resetError);
      return NextResponse.json({ error: "Gagal me-reset database." }, { status: 500 });
    }

    // 2. Insert Players
    const { error: insertPlayersError } = await supabase
      .from("mapidpong_players")
      .insert(players);
    if (insertPlayersError) {
      console.error("Insert Players Error:", insertPlayersError);
      return NextResponse.json({ error: "Gagal menyimpan pemain baru." }, { status: 500 });
    }

    // 3. Insert Matches
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
