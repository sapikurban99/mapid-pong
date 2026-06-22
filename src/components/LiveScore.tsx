"use client"
import { useState } from "react";
import { Match } from "@/lib/supabase";
import { api } from "@/lib/api";

interface LiveScoreProps {
  matches: Match[];
}

export default function LiveScore({ matches }: LiveScoreProps) {
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "finished">("all");
  const [refereeMode, setRefereeMode] = useState<boolean>(false);
  const [refereeName, setRefereeName] = useState<string>("");
  const [activeEditId, setActiveEditId] = useState<string | null>(null);

  const filteredMatches = matches.filter(m => filter === "all" || m.status === filter);
  const liveCount = matches.filter(m => m.status === "live").length;

  const handleAddPoint = async (match: Match, playerNum: 1 | 2) => {
    if (!refereeName.trim()) return alert("Masukkan nama wasit terlebih dahulu!");
    const p1New = playerNum === 1 ? match.score1 + 1 : match.score1;
    const p2New = playerNum === 2 ? match.score2 + 1 : match.score2;
    await api.updateScore(match.id, p1New, p2New, "point_add", refereeName, { p1: match.score1, p2: match.score2 });
  };

  const handleUndo = async (match: Match, playerNum: 1 | 2) => {
    if (!refereeName.trim()) return alert("Masukkan nama wasit terlebih dahulu!");
    const p1New = playerNum === 1 ? Math.max(0, match.score1 - 1) : match.score1;
    const p2New = playerNum === 2 ? Math.max(0, match.score2 - 1) : match.score2;
    await api.updateScore(match.id, p1New, p2New, "undo", refereeName, { p1: match.score1, p2: match.score2 });
  };

  const handleChangeStatus = async (matchId: string, nextStatus: "live" | "finished") => {
    if (!refereeName.trim()) return alert("Masukkan nama wasit terlebih dahulu!");
    await api.updateStatus(matchId, nextStatus, refereeName);
  };

  return (
    <section id="livescore" className="bg-dark-blue py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] font-mono text-xs font-bold uppercase tracking-wider bg-pink text-white mb-4">
            Live Score
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Skor Langsung</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-3 h-3 bg-pink rounded-full animate-ping" />
            <span className="font-mono text-sm font-bold text-pink">{liveCount} Pertandingan Sedang Berlangsung</span>
          </div>
        </div>

        {/* Filter Toolbar Nav */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {(["all", "live", "upcoming", "finished"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-3 border-black shadow-[3px_3px_0_#000] cursor-pointer transition-all ${filter === t ? "bg-yellow text-black" : "bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => setRefereeMode(!refereeMode)}
            className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-3 border-black shadow-[3px_3px_0_#000] cursor-pointer transition-all ${refereeMode ? "bg-green text-black" : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            Mode Wasit {refereeMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* Input Otentikasi Wasit Sederhana */}
        {refereeMode && (
          <div className="max-w-md mx-auto mb-10 font-mono text-sm">
            <label className="block mb-2 text-white/70">Nama Otoritas Wasit:</label>
            <input
              type="text"
              value={refereeName}
              onChange={(e) => setRefereeName(e.target.value)}
              placeholder="Ketik nama Anda untuk log audit..."
              className="w-full bg-white/10 border-3 border-black text-white p-3 font-mono outline-none focus:border-yellow"
            />
          </div>
        )}

        {/* Grid Render Match Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <div key={match.id} className={`box-neo p-6 transition-all ${match.status === "live" ? "bg-pink/10 border-pink" : "bg-white/5 border-black"}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-mono text-[10px] font-bold text-white/50 tracking-wider uppercase">
                  MATCH #{match.match_order || '?'} • {match.round} {match.group_name && `/ ${match.group_name}`}
                </span>
                <span className={`font-mono text-[10px] font-bold px-3 py-1 border-2 border-black uppercase ${match.status === "live" ? "bg-pink text-white" : match.status === "finished" ? "bg-green text-black" : "bg-white/20 text-white"
                  }`}>
                  {match.status}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 my-6">
                <div className="flex-1 text-center">
                  <div className="font-bold text-lg line-clamp-1">{match.player1}</div>
                  <div className={`text-5xl font-mono font-bold mt-2 ${match.score1 > match.score2 && match.status !== "upcoming" ? "text-yellow" : "text-white"}`}>
                    {match.score1}
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-white/30">VS</div>
                <div className="flex-1 text-center">
                  <div className="font-bold text-lg line-clamp-1">{match.player2}</div>
                  <div className={`text-5xl font-mono font-bold mt-2 ${match.score2 > match.score1 && match.status !== "upcoming" ? "text-yellow" : "text-white"}`}>
                    {match.score2}
                  </div>
                </div>
              </div>

              {/* Referee Panel Panel Editor */}
              {refereeMode && (
                <div className="mt-4 pt-4 border-t-2 border-dashed border-white/20">
                  {activeEditId !== match.id ? (
                    <button
                      onClick={() => setActiveEditId(match.id)}
                      className="w-full bg-green text-black text-xs font-mono font-bold py-2 border-2 border-black"
                    >
                      Buka Panel Wasit
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <button onClick={() => handleAddPoint(match, 1)} className="w-full bg-blue text-white text-xs font-mono py-1.5 border-2 border-black font-bold">+1 P1</button>
                          <button onClick={() => handleUndo(match, 1)} className="w-full bg-white/10 text-white text-[10px] font-mono py-1 border-2 border-black">Undo</button>
                        </div>
                        <div className="flex-1 space-y-1">
                          <button onClick={() => handleAddPoint(match, 2)} className="w-full bg-pink text-white text-xs font-mono py-1.5 border-2 border-black font-bold">+1 P2</button>
                          <button onClick={() => handleUndo(match, 2)} className="w-full bg-white/10 text-white text-[10px] font-mono py-1 border-2 border-black">Undo</button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {match.status === "upcoming" && (
                          <button onClick={() => handleChangeStatus(match.id, "live")} className="flex-1 bg-green text-black text-[10px] font-mono font-bold py-1.5 border-2 border-black">MULAI LIVE</button>
                        )}
                        {match.status === "live" && (
                          <button onClick={() => handleChangeStatus(match.id, "finished")} className="flex-1 bg-yellow text-black text-[10px] font-mono font-bold py-1.5 border-2 border-black">SELESAIKAN GAME</button>
                        )}
                      </div>

                      <button onClick={() => setActiveEditId(null)} className="w-full bg-white/20 text-white text-[10px] font-mono py-1">Tutup Panel</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}