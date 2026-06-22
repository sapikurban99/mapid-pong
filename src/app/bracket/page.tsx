import Bracket from "@/components/Bracket";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function BracketPage() {
  const matches = await api.getMatches();

  return (
    <div className="py-8 bg-dark-blue min-h-screen">
      <Bracket matches={matches} />
    </div>
  );
}
