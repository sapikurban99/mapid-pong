import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { players, matches } = body;

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
