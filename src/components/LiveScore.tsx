"use client"
import { useState } from "react";
import { Match } from "@/lib/supabase";
import { api } from "@/lib/api";
import MatchCalendar from "@/components/MatchCalendar";

const formatDateIndonesian = (dateStr: string | null | undefined) => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
  }
  return dateStr;
};

interface LiveScoreProps {
  matches: Match[];
  onUpdate: (updatedMatch: Match) => void;
}

type TypeFilter = "all" | "singles" | "doubles";
type StageFilter = "all" | "group" | "bracket";

export default function LiveScore({ matches, onUpdate }: LiveScoreProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "finished">("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [refereeMode, setRefereeMode] = useState<boolean>(false);
  const [refereeName, setRefereeName] = useState<string>("");
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [searchName, setSearchName] = useState<string>("");

  const isGroupStage = (m: Match) => m.round === "group" || m.round === "Group Stage";
  const isBracketStage = (m: Match) => !isGroupStage(m);

  const filteredMatches = matches.filter((m) => {
    const statusOk = statusFilter === "all" || m.status === statusFilter;
    const dateOk = !selectedDate || m.scheduled_date === selectedDate;
    const typeOk = typeFilter === "all" || m.match_type === typeFilter;
    const stageOk = stageFilter === "all" || (stageFilter === "group" && isGroupStage(m)) || (stageFilter === "bracket" && isBracketStage(m));
    const searchOk = !searchName || 
      m.player1.toLowerCase().includes(searchName.toLowerCase()) || 
      m.player2.toLowerCase().includes(searchName.toLowerCase());
    return statusOk && dateOk && typeOk && stageOk && searchOk;
  });
  const liveCount = matches.filter(m => m.status === "live").length;
  const selectedDateLabel = formatDateIndonesian(selectedDate);

  const singlesMatches = matches.filter(m => m.match_type === "singles");
  const doublesMatches = matches.filter(m => m.match_type === "doubles");
  const groupMatches = matches.filter(isGroupStage);
  const bracketMatches = matches.filter(isBracketStage);

  const handleAddRound = async (match: Match, playerNum: 1 | 2) => {
    if (!refereeName.trim()) return alert("Masukkan nama wasit terlebih dahulu!");
    const p1New = playerNum === 1 ? match.score1 + 1 : match.score1;
    const p2New = playerNum === 2 ? match.score2 + 1 : match.score2;
    await api.updateScore(match.id, p1New, p2New, "round_win", refereeName, { p1: match.score1, p2: match.score2 });
    onUpdate({ ...match, score1: p1New, score2: p2New });
  };

  const handleUndo = async (match: Match, playerNum: 1 | 2) => {
    if (!refereeName.trim()) return alert("Masukkan nama wasit terlebih dahulu!");
    const p1New = playerNum === 1 ? Math.max(0, match.score1 - 1) : match.score1;
    const p2New = playerNum === 2 ? Math.max(0, match.score2 - 1) : match.score2;
    await api.updateScore(match.id, p1New, p2New, "undo_round", refereeName, { p1: match.score1, p2: match.score2 });
    onUpdate({ ...match, score1: p1New, score2: p2New });
  };

  const handleChangeStatus = async (match: Match, nextStatus: "live" | "finished") => {
    if (!refereeName.trim()) return alert("Masukkan nama wasit terlebih dahulu!");
    await api.updateStatus(match.id, nextStatus, refereeName);
    onUpdate({ ...match, status: nextStatus });
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

        {/* Type Filter */}
        <div className="flex justify-center gap-2 mb-4">
          {([
            { key: "all" as TypeFilter, label: "Semua", count: matches.length },
            { key: "singles" as TypeFilter, label: "👤 Singles", count: singlesMatches.length },
            { key: "doubles" as TypeFilter, label: "👥 Doubles", count: doublesMatches.length },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={`font-mono text-[10px] font-bold uppercase px-4 py-2 border-2 border-black cursor-pointer transition-all ${
                typeFilter === t.key
                  ? t.key === "singles" ? "bg-pink text-white" : t.key === "doubles" ? "bg-blue text-white" : "bg-yellow text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Stage Filter */}
        <div className="flex justify-center gap-2 mb-6">
          {([
            { key: "all" as StageFilter, label: "Semua Fase", count: matches.length },
            { key: "group" as StageFilter, label: "🏆 Group Stage", count: groupMatches.length },
            { key: "bracket" as StageFilter, label: "🎯 Bracket", count: bracketMatches.length },
          ]).map(s => (
            <button
              key={s.key}
              onClick={() => setStageFilter(s.key)}
              className={`font-mono text-[10px] font-bold uppercase px-4 py-2 border-2 border-black cursor-pointer transition-all ${
                stageFilter === s.key
                  ? s.key === "group" ? "bg-green text-black" : s.key === "bracket" ? "bg-purple text-white" : "bg-yellow text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>

        {/* Status Filter Toolbar */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {(["all", "live", "upcoming", "finished"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setStatusFilter(t)}
              className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-3 border-black shadow-[3px_3px_0_#000] cursor-pointer transition-all ${statusFilter === t ? "bg-yellow text-black" : "bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => setShowCalendar((v) => !v)}
            className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-3 border-black shadow-[3px_3px_0_#000] cursor-pointer transition-all flex items-center gap-2 ${showCalendar || selectedDate ? "bg-blue text-white" : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            <span>📅</span>
            <span>Kalender</span>
            {selectedDate && <span className="bg-yellow text-black px-1.5 py-0.5 border border-black text-[9px]">1</span>}
          </button>
          <button
            onClick={() => setRefereeMode(!refereeMode)}
            className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-3 border-black shadow-[3px_3px_0_#000] cursor-pointer transition-all ${refereeMode ? "bg-green text-black" : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            Mode Wasit {refereeMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* Name Filter */}
        <div className="max-w-md mx-auto mb-6">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="🔍 Cari nama pemain..."
            className="w-full bg-white/10 border-3 border-black text-white p-3 font-mono outline-none focus:border-yellow text-center placeholder:text-white/40"
          />
        </div>

        {/* Calendar Filter */}
        {showCalendar && (
          <MatchCalendar
            matches={matches}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {/* Active Date Indicator */}
        {selectedDate && selectedDateLabel && (
          <div className="max-w-2xl mx-auto mb-6 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
            <span className="text-white/60 uppercase">Menampilkan tanggal:</span>
            <span className="bg-yellow text-black px-3 py-1 border-2 border-black shadow-[2px_2px_0_#000] font-bold uppercase">
              {selectedDateLabel}
            </span>
            <button
              onClick={() => setSelectedDate(null)}
              className="bg-white/10 text-white px-3 py-1 border-2 border-black shadow-[2px_2px_0_#000] font-bold uppercase hover:bg-white/20 cursor-pointer"
            >
              ✕ Hapus
            </button>
          </div>
        )}

        {/* Input Otentikasi Wasit */}
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

        {filteredMatches.length === 0 && (
          <div className="text-center py-16 font-mono text-white/60">
            <div className="text-5xl mb-3">🏓</div>
            <div className="text-sm uppercase tracking-wider">Tidak ada pertandingan untuk filter ini</div>
          </div>
        )}

        {/* Grid Render Match Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => {
            const formattedDate = formatDateIndonesian(match.scheduled_date);
            const p1Wins = match.score1;
            const p2Wins = match.score2;
            const isP1Leading = p1Wins > p2Wins && match.status !== "upcoming";
            const isP2Leading = p2Wins > p1Wins && match.status !== "upcoming";
            return (
              <div key={match.id} className={`box-neo p-6 transition-all ${match.status === "live" ? "bg-pink/10 border-pink" : "bg-white/5 border-black"}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-[10px] font-bold text-white/50 tracking-wider uppercase">
                    {match.match_type === "doubles" ? "👥" : "👤"} #{match.match_order || '?'} • {match.round} {match.group_name && `/ ${match.group_name}`}
                  </span>
                  <span className={`font-mono text-[10px] font-bold px-3 py-1 border-2 border-black uppercase ${match.status === "live" ? "bg-pink text-white" : match.status === "finished" ? "bg-green text-black" : "bg-white/20 text-white"
                    }`}>
                    {match.status}
                  </span>
                </div>

                {formattedDate && (
                  <div className="mb-4 -mt-2 flex items-center gap-1.5 font-mono text-[10px] text-yellow font-bold uppercase">
                    <span>📅</span>
                    <span>{formattedDate}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 my-6">
                  <div className="flex-1 text-center">
                    <div className="font-bold text-lg line-clamp-1">{match.player1}</div>
                    <div className={`text-5xl font-mono font-bold mt-2 ${isP1Leading ? "text-yellow" : "text-white"}`}>
                      {p1Wins}
                    </div>
                    <div className="font-mono text-[10px] text-white/40 mt-1 uppercase tracking-wider">Ronde</div>
                  </div>
                  <div className="font-mono text-xs font-bold text-white/30">VS</div>
                  <div className="flex-1 text-center">
                    <div className="font-bold text-lg line-clamp-1">{match.player2}</div>
                    <div className={`text-5xl font-mono font-bold mt-2 ${isP2Leading ? "text-yellow" : "text-white"}`}>
                      {p2Wins}
                    </div>
                    <div className="font-mono text-[10px] text-white/40 mt-1 uppercase tracking-wider">Ronde</div>
                  </div>
                </div>

                {/* Referee Panel */}
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
                        <div className="text-center font-mono text-[10px] text-white/50 uppercase tracking-wider">
                          Klik untuk menambah ronde yang dimenangkan
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 space-y-1">
                            <button onClick={() => handleAddRound(match, 1)} className="w-full bg-blue text-white text-xs font-mono py-1.5 border-2 border-black font-bold">+1 Ronde P1</button>
                            <button onClick={() => handleUndo(match, 1)} className="w-full bg-white/10 text-white text-[10px] font-mono py-1 border-2 border-black">Undo</button>
                          </div>
                          <div className="flex-1 space-y-1">
                            <button onClick={() => handleAddRound(match, 2)} className="w-full bg-pink text-white text-xs font-mono py-1.5 border-2 border-black font-bold">+1 Ronde P2</button>
                            <button onClick={() => handleUndo(match, 2)} className="w-full bg-white/10 text-white text-[10px] font-mono py-1 border-2 border-black">Undo</button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {match.status === "upcoming" && (
                            <button onClick={() => handleChangeStatus(match, "live")} className="flex-1 bg-green text-black text-[10px] font-mono font-bold py-1.5 border-2 border-black">MULAI LIVE</button>
                          )}
                          {match.status === "live" && (
                            <button onClick={() => handleChangeStatus(match, "finished")} className="flex-1 bg-yellow text-black text-[10px] font-mono font-bold py-1.5 border-2 border-black">SELESAIKAN GAME</button>
                          )}
                        </div>

                        <button onClick={() => setActiveEditId(null)} className="w-full bg-white/20 text-white text-[10px] font-mono py-1">Tutup Panel</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
