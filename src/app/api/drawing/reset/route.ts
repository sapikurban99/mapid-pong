import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const resetSql = `
      WITH deleted_logs AS (DELETE FROM mapidpong_score_logs RETURNING *),
           deleted_matches AS (DELETE FROM mapidpong_matches RETURNING *),
           deleted_players AS (DELETE FROM mapidpong_players RETURNING *)
      SELECT 1 AS success
    `;
    const { error: resetError } = await supabase.rpc("exec_sql", { query_text: resetSql });
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
