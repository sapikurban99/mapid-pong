import { supabase } from "@/lib/supabase";
import Peserta from "@/components/Peserta";
import { DbPlayer } from "@/components/Peserta";

export default async function PesertaPage() {
  let players: DbPlayer[] = [];

  try {
    const { data, error } = await supabase
      .from("mapidpong_players")
      .select("*")
      .order("group_name", { ascending: true })
      .order("name", { ascending: true });

    if (!error && data) {
      players = data;
    }
  } catch (err) {
    console.error("Error fetching players:", err);
  }

  return (
    <div className="py-8 bg-dark-blue min-h-screen">
      <Peserta initialPlayers={players} />
    </div>
  );
}
