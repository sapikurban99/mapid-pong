"use client";

import { useState } from "react";
import { Match } from "@/lib/supabase";

interface BracketProps {
  matches: Match[];
}

type BracketType = "singles" | "doubles";

function groupByRound(matches: Match[]): { [round: string]: Match[] } {
  const grouped: { [round: string]: Match[] } = {};
  matches.forEach((m) => {
    if (!grouped[m.round]) grouped[m.round] = [];
    grouped[m.round].push(m);
  });
  Object.keys(grouped).forEach((r) => {
    grouped[r].sort((a, b) => (a.match_order ?? 0) - (b.match_order ?? 0));
  });
  return grouped;
}

function MatchCard({ match }: { match: Match }) {
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";
  const p1Won = isFinished && match.score1 > match.score2;
  const p2Won = isFinished && match.score2 > match.score1;

  return (
    <div
      className={`bg-black p-3 border-2 ${
        isLive
          ? "border-green animate-pulse"
          : isFinished
          ? "border-yellow"
          : "border-white/20"
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={`text-[10px] font-bold uppercase ${
            isLive ? "text-green" : isFinished ? "text-yellow" : "text-white/40"
          }`}
        >
          {isLive ? "LIVE" : isFinished ? "Selesai" : match.round}
        </span>
        {match.scheduled_date && (
          <span className="text-[10px] text-white/30">{match.scheduled_date}</span>
        )}
      </div>
      <div className="space-y-1">
        <div
          className={`flex justify-between items-center font-sans font-bold text-sm ${
            p1Won ? "text-yellow" : isFinished && !p1Won ? "text-white/50" : "text-white"
          }`}
        >
          <span className="truncate">{match.player1}</span>
          <span className="ml-2 shrink-0 tabular-nums">{match.score1}</span>
        </div>
        <div className="h-px bg-white/10" />
        <div
          className={`flex justify-between items-center font-sans font-bold text-sm ${
            p2Won ? "text-yellow" : isFinished && !p2Won ? "text-white/50" : "text-white"
          }`}
        >
          <span className="truncate">{match.player2}</span>
          <span className="ml-2 shrink-0 tabular-nums">{match.score2}</span>
        </div>
      </div>
      {match.referee_name && (
        <div className="text-[10px] text-white/20 mt-2 truncate">
          Ref: {match.referee_name}
        </div>
      )}
    </div>
  );
}

function RoundColumn({
  title,
  matches,
  color,
}: {
  title: string;
  matches: Match[];
  color: string;
}) {
  return (
    <div className="space-y-3">
      <div
        className={`text-[10px] font-bold uppercase tracking-wider text-center ${color}`}
      >
        {title}
      </div>
      <div className="space-y-3">
        {matches.length > 0 ? (
          matches.map((m) => <MatchCard key={m.id} match={m} />)
        ) : (
          <div className="bg-black/50 p-3 border-2 border-dashed border-white/10 text-center text-white/20 font-mono text-[10px]">
            Belum ada pertandingan
          </div>
        )}
      </div>
    </div>
  );
}

function BracketDisplay({ title, color, matches }: { title: string; color: string; matches: Match[] }) {
  const knockoutMatches = matches.filter((m) => !m.group_name);
  const grouped = groupByRound(knockoutMatches);

  const upperRounds = [
    "UB Quarterfinal 1",
    "UB Quarterfinal 2",
    "UB Semifinal",
    "UB Finals",
  ];
  const lowerRounds = ["LB Round 1", "LB Semifinal", "LB Finals"];
  const grandFinals = grouped["Grand Finals"] || [];

  if (knockoutMatches.length === 0) {
    return (
      <div className="box-neo bg-white text-black p-6 text-center font-mono text-sm">
        Bracket {title} belum tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-xs">
      <div className="text-center">
        <h3 className={`text-xl font-bold uppercase ${color}`}>{title}</h3>
        <p className="text-white/40 mt-1">{knockoutMatches.length} pertandingan knockout</p>
      </div>

      {/* Upper Bracket */}
      <div className="box-neo bg-white/5 p-6 border-blue">
        <h4 className="text-sm font-bold text-blue uppercase mb-4">▲ Upper Bracket (UB)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {upperRounds.map((round) => (
            <RoundColumn
              key={round}
              title={round.replace("UB ", "")}
              matches={grouped[round] || []}
              color="text-blue"
            />
          ))}
        </div>
      </div>

      {/* Lower Bracket */}
      <div className="box-neo bg-white/5 p-6 border-pink">
        <h4 className="text-sm font-bold text-pink uppercase mb-4">▼ Lower Bracket (LB)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lowerRounds.map((round) => (
            <RoundColumn
              key={round}
              title={round.replace("LB ", "")}
              matches={grouped[round] || []}
              color="text-pink"
            />
          ))}
        </div>
      </div>

      {/* Grand Finals */}
      <div className="box-neo bg-white/5 p-6 border-yellow">
        <h4 className="text-sm font-bold text-yellow uppercase mb-4 text-center">★ Grand Finals</h4>
        <div className="max-w-sm mx-auto">
          {grandFinals.length > 0 ? (
            grandFinals.map((m) => <MatchCard key={m.id} match={m} />)
          ) : (
            <div className="bg-black/50 p-3 border-2 border-dashed border-yellow/30 text-center text-white/20 font-mono text-[10px]">
              Menunggu pemenang UB & LB
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Bracket({ matches }: BracketProps) {
  const [activeType, setActiveType] = useState<BracketType>("singles");

  const singlesMatches = matches.filter(m => m.match_type === "singles");
  const doublesMatches = matches.filter(m => m.match_type === "doubles");

  return (
    <section id="bracket" className="bg-dark-blue py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] font-mono text-xs font-bold uppercase tracking-wider bg-pink text-white mb-4">
            Knockout Stage
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Double Elimination Bracket
          </h2>
        </div>

        {/* Type Filter */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveType("singles")}
            className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-2 border-black cursor-pointer ${
              activeType === "singles" ? "bg-pink text-white" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            👤 Singles ({singlesMatches.filter(m => !m.group_name).length})
          </button>
          <button
            onClick={() => setActiveType("doubles")}
            className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-2 border-black cursor-pointer ${
              activeType === "doubles" ? "bg-blue text-white" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            👥 Doubles ({doublesMatches.filter(m => !m.group_name).length})
          </button>
        </div>

        {activeType === "singles" ? (
          <BracketDisplay
            title="Singles"
            color="text-pink"
            matches={singlesMatches}
          />
        ) : (
          <BracketDisplay
            title="Doubles"
            color="text-blue"
            matches={doublesMatches}
          />
        )}
      </div>
    </section>
  );
}
