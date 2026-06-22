import { supabase, Match } from "./supabase";

const API_URL =
  "https://geoserver.mapid.io/layers_new/get_layer?api_key=6015daaa36324bb885749c34fe56fe13&layer_id=6a338f426684a940bd414ba9&project_id=6a338ef5d56af8dd1ef9a322";

export interface Player {
  id: string;
  name: string;
  wa: string;
}

export interface PlayerWithStats extends Player {
  played: number;
  won: number;
  lost: number;
  pts: number;
}

export interface Groups {
  A: PlayerWithStats[];
  B: PlayerWithStats[];
  C: PlayerWithStats[];
  D: PlayerWithStats[];
}

export async function fetchPlayers(): Promise<Player[]> {
  const res = await fetch(API_URL, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data?.features)) {
    throw new Error("API response missing 'features' array");
  }
  return data.features.map((f: { id: string; properties: { Nama: string; "No. Wa": string } }) => ({
    id: f.id,
    name: f.properties.Nama || "Unknown",
    wa: f.properties["No. Wa"] || "-",
  }));
}

export function assignGroups(players: Player[]): Groups {
  const groups: Groups = { A: [], B: [], C: [], D: [] };
  const perGroup = [4, 4, 4, 3];
  const names: (keyof Groups)[] = ["A", "B", "C", "D"];
  let idx = 0;

  names.forEach((g, gi) => {
    for (let i = 0; i < perGroup[gi] && idx < players.length; i++) {
      groups[g].push({
        ...players[idx],
        played: 0,
        won: 0,
        lost: 0,
        pts: 0,
      });
      idx++;
    }
  });

  return groups;
}

export function getQualified(groups: Groups): string[] {
  const qualified: string[] = [];
  (["A", "B", "C", "D"] as (keyof Groups)[]).forEach((g) => {
    const top2 = groups[g].slice(0, 2);
    qualified.push(...top2.map((p) => p.name));
  });
  while (qualified.length < 8) qualified.push("TBD");
  return qualified.slice(0, 8);
}

export const api = {
  getMatches: async (): Promise<Match[]> => {
    const { data, error } = await supabase
      .from("mapidpong_matches")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data as Match[];
  },
  updateScore: async (
    matchId: string,
    p1New: number,
    p2New: number,
    action: string,
    refereeName: string,
    oldScores: { p1: number; p2: number }
  ) => {
    const scorer = p1New !== oldScores.p1 ? "player1" : p2New !== oldScores.p2 ? "player2" : "none";
    const newScore = p1New !== oldScores.p1 ? p1New : p2New;
    
    await supabase
      .from("mapidpong_matches")
      .update({ score1: p1New, score2: p2New })
      .eq("id", matchId);

    if (scorer !== "none") {
      await supabase.from("mapidpong_score_logs").insert({
        match_id: matchId,
        scorer,
        new_score: newScore,
        action,
        noted_by: refereeName || null,
      });
    }
  },
  updateStatus: async (matchId: string, status: "live" | "finished", refereeName: string) => {
    await supabase.from("mapidpong_matches").update({ status }).eq("id", matchId);
    // Optionally log the status change
    await supabase.from("mapidpong_score_logs").insert({
      match_id: matchId,
      scorer: "status_change",
      new_score: 0,
      action: status,
      noted_by: refereeName || null,
    });
  }
};
