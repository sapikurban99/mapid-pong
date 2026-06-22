import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const { error: resetError } = await supabase.rpc("reset_tournament");
    if (resetError) {
      console.error("Reset Error:", resetError);
      return NextResponse.json({ error: "Gagal me-reset database." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reset Database Exception:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
