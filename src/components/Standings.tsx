"use client"
import { useState } from "react";
import { Match } from "@/lib/supabase";
import { DbPlayer } from "./Peserta";

interface StandingsProps {
  players: DbPlayer[];
  matches: Match[];
}

interface PlayerStats {
  id: string;
  name: string;
  group: string;
  type: string;
  played: number;
  won: number;
  lost: number;
  pts: number;
}

type FilterType = "all" | "singles" | "doubles";

export default function Standings({ players, matches }: StandingsProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredPlayers = filter === "all"
    ? players
    : players.filter(p => p.type === filter);

  const filteredMatches = filter === "all"
    ? matches
    : matches.filter(m => m.match_type === filter);

  // Group players by group_name
  const groups: { [key: string]: PlayerStats[] } = {};

  filteredPlayers.forEach((player) => {
    const groupName = player.group_name ? `Grup ${player.group_name.toUpperCase()}` : "Tanpa Grup";
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    // Calculate stats from matches
    let played = 0;
    let won = 0;
    let lost = 0;

    const finishedMatches = filteredMatches.filter(
      (m) => m.status === "finished" && (m.player1 === player.name || m.player2 === player.name)
    );

    finishedMatches.forEach((m) => {
      played++;
      const isPlayer1 = m.player1 === player.name;
      const playerScore = isPlayer1 ? m.score1 : m.score2;
      const opponentScore = isPlayer1 ? m.score2 : m.score1;

      if (playerScore > opponentScore) {
        won++;
      } else {
        lost++;
      }
    });

    groups[groupName].push({
      id: player.id,
      name: player.name,
      group: groupName,
      type: player.type,
      played,
      won,
      lost,
      pts: won * 2, // 2 points per win
    });
  });

  // Sort players in each group by points desc, won desc, lost asc, name asc
  Object.keys(groups).forEach((gName) => {
    groups[gName].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.won !== a.won) return b.won - a.won;
      if (a.lost !== b.lost) return a.lost - b.lost;
      return a.name.localeCompare(b.name);
    });
  });

  const sortedGroupNames = Object.keys(groups).sort();
  const singlesCount = players.filter(p => p.type === "singles").length;
  const doublesCount = players.filter(p => p.type === "doubles").length;

  return (
    <section id="standings" className="bg-navy py-20 px-6 min-h-[60vh] flex items-center">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] font-mono text-xs font-bold uppercase tracking-wider bg-yellow text-black mb-4">
            Klasemen Sementara
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Group Standings</h2>
        </div>

        {players.length === 0 ? (
          <div className="box-neo bg-white text-black p-8 max-w-md mx-auto text-center font-mono">
            <p className="font-bold mb-4">Belum ada klasemen karena peserta belum di-draw.</p>
            <p className="text-xs text-black/60">
              Silakan lakukan drawing terlebih dahulu di halaman <a href="/drawing" className="text-blue underline font-bold">Live Drawing</a>.
            </p>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex justify-center gap-2 mb-8 font-mono text-xs">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 font-bold border-2 border-black cursor-pointer ${
                  filter === "all" ? "bg-yellow text-black" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Semua ({players.length})
              </button>
              <button
                onClick={() => setFilter("singles")}
                className={`px-4 py-2 font-bold border-2 border-black cursor-pointer ${
                  filter === "singles" ? "bg-pink text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                👤 Singles ({singlesCount})
              </button>
              <button
                onClick={() => setFilter("doubles")}
                className={`px-4 py-2 font-bold border-2 border-black cursor-pointer ${
                  filter === "doubles" ? "bg-blue text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                👥 Doubles ({doublesCount})
              </button>
            </div>

            {/* Standings Tables */}
            {sortedGroupNames.length === 0 ? (
              <div className="box-neo bg-white text-black p-6 text-center font-mono text-sm">
                Tidak ada data untuk filter ini.
              </div>
            ) : (
              <div className="space-y-12">
                {sortedGroupNames.map((grpName) => (
                  <div key={grpName} className="box-neo bg-white text-black overflow-hidden">
                    <div className="bg-black text-white p-4 font-mono font-bold uppercase tracking-wider text-sm flex justify-between items-center">
                      <span>📌 {grpName}</span>
                      <span className={`text-[10px] px-2 py-0.5 font-bold ${
                        groups[grpName][0]?.type === "doubles" ? "bg-blue text-white" : "bg-yellow text-black"
                      }`}>
                        {groups[grpName][0]?.type.toUpperCase() || "SINGLES"}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs md:text-sm">
                        <thead>
                          <tr className="bg-yellow/20 border-b-3 border-black font-bold">
                            <th className="p-4 w-12 text-center">Pos</th>
                            <th className="p-4">Nama Pemain</th>
                            <th className="p-4 text-center w-20">Main</th>
                            <th className="p-4 text-center w-20">M</th>
                            <th className="p-4 text-center w-20">K</th>
                            <th className="p-4 text-center w-24">Poin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black/10 font-medium">
                          {groups[grpName].map((p, idx) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="p-4 font-bold text-center">{idx + 1}</td>
                              <td className="p-4 font-sans font-bold">{p.name}</td>
                              <td className="p-4 text-center">{p.played}</td>
                              <td className="p-4 text-center text-green font-bold">{p.won}</td>
                              <td className="p-4 text-center text-pink font-bold">{p.lost}</td>
                              <td className="p-4 text-center font-bold bg-yellow/5">{p.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
