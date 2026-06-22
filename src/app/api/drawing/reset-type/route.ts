import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type !== "singles" && type !== "doubles") {
      return NextResponse.json({ error: "Type harus 'singles' atau 'doubles'" }, { status: 400 });
    }

    // Delete matches of this type only
    const { error: matchError } = await supabase
      .from("mapidpong_matches")
      .delete()
      .eq("match_type", type)
      .not("id", "is", null);

    if (matchError) {
      console.error("Delete Matches Error:", matchError);
      return NextResponse.json({ error: "Gagal menghapus pertandingan." }, { status: 500 });
    }

    // Delete players of this type only
    const { error: playerError } = await supabase
      .from("mapidpong_players")
      .delete()
      .eq("type", type)
      .not("id", "is", null);

    if (playerError) {
      console.error("Delete Players Error:", playerError);
      return NextResponse.json({ error: "Gagal menghapus pemain." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reset Type Exception:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
