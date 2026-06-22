import { api } from "@/lib/api";
import { Match } from "@/lib/supabase";
import LiveScoreClient from "@/components/LiveScoreClient";

export default async function LiveScorePage() {
  let matches: Match[] = [];

  try {
    matches = await api.getMatches();
  } catch (err) {
    console.error("Gagal sinkronisasi matches:", err);
  }

  return (
    <div className="py-8 bg-navy min-h-screen">
      <LiveScoreClient initialMatches={matches} />
    </div>
  );
}
