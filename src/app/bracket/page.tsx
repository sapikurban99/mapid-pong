import Bracket from "@/components/Bracket";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { DbPlayer } from "@/components/Peserta";

export const dynamic = "force-dynamic";

export default async function BracketPage() {
  let players: DbPlayer[] = [];
  let matches: Awaited<ReturnType<typeof api.getMatches>> = [];

  try {
    const [playersRes, matchesRes] = await Promise.all([
      supabase.from("mapidpong_players").select("*"),
      api.getMatches(),
    ]);

    if (!playersRes.error && playersRes.data) {
      players = playersRes.data;
    }
    matches = matchesRes || [];
  } catch (err) {
    console.error("Gagal load data bracket:", err);
  }

  return (
    <div className="py-8 bg-dark-blue min-h-screen">
      <Bracket players={players} matches={matches} />
    </div>
  );
}
