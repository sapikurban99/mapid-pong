export const dynamic = "force-dynamic";
import { supabase, Match } from "@/lib/supabase";
import { api } from "@/lib/api";
import { DbPlayer } from "@/components/Peserta";
import StandingsClient from "@/components/StandingsClient";

export default async function StandingsPage() {
  let players: DbPlayer[] = [];
  let matches: Match[] = [];

  try {
    const [playersRes, matchesRes] = await Promise.all([
      supabase.from("mapidpong_players").select("*"),
      api.getMatches()
    ]);

    if (!playersRes.error && playersRes.data) {
      players = playersRes.data;
    }
    matches = matchesRes || [];
  } catch (err) {
    console.error("Gagal sinkronisasi data standings:", err);
  }

  return (
    <div className="py-8 bg-navy min-h-screen">
      <StandingsClient initialPlayers={players} initialMatches={matches} />
    </div>
  );
}
