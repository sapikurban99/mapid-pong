"use client";

import { useState, useMemo } from "react";
import { Match } from "@/lib/supabase";

interface BracketProps {
  matches: Match[];
}

type FilterType = "singles" | "doubles";



function SeedBadge({ seed }: { seed: string | null }) {
  if (!seed || seed === "?") {
    return (
      <span className="flex-none text-[10px] font-bold text-[#9fb3c8] bg-[#33475c] rounded-[3px] px-[5px] py-[2px] min-w-[26px] text-center">
        ?
      </span>
    );
  }
  return (
    <span className="flex-none text-[10px] font-bold text-[#08111c] bg-[#fdf6d8] rounded-[3px] px-[5px] py-[2px] min-w-[26px] text-center">
      {seed}
    </span>
  );
}

function TeamRow({
  name,
  score,
  isWin,
  isTbd,
}: {
  name: string;
  score?: number;
  isWin?: boolean;
  isTbd?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 bg-[#0a1420] border border-[#1e3a52] px-2.5 py-2.5 text-[13px] first:rounded-t-md first:border-b-0 last:rounded-b-md ${
        isWin
          ? "text-[#ffd60a] font-bold"
          : isTbd
            ? "text-[#6f879e]"
            : "text-[#e8eef5]"
      }`}
    >
      <SeedBadge seed={name ? "?" : null} />
      <span className="whitespace-nowrap overflow-hidden text-ellipsis flex-1">
        {name}
      </span>
      {score !== undefined && (
        <span className="text-[11px] font-bold text-[#c7d6e6] ml-auto">
          {score}
        </span>
      )}
    </div>
  );
}

function MatchCardGrid({
  showLabel,
  date,
  match,
}: {
  showLabel?: string;
  date?: string;
  match?: Match;
}) {
  const p1 = match?.player1 || "TBD";
  const p2 = match?.player2 || "TBD";
  const p1Win = match?.status === "finished" && match.score1 > match.score2;
  const p2Win = match?.status === "finished" && match.score2 > match.score1;

  return (
    <div className="relative mt-5 mb-2">
      <div className="absolute -top-5 left-[2px] right-0 flex justify-between pr-2">
        {showLabel && (
          <span className="text-[10px] text-[#5f7893] font-bold tracking-widest">
            {showLabel}
          </span>
        )}
        {date && (
          <span className="text-[10px] text-[#ffd60a] font-bold tracking-wider">
            {date}
          </span>
        )}
      </div>
      <div className="relative shadow-lg shadow-black/20">
        <TeamRow
          name={p1}
          score={match?.score1}
          isWin={p1Win}
          isTbd={!match?.player1}
        />
        <TeamRow
          name={p2}
          score={match?.score2}
          isWin={p2Win}
          isTbd={!match?.player2}
        />
      </div>
    </div>
  );
}

function MatchCard({
  showLabel,
  date,
  hasConnector = true,
  match,
}: {
  showLabel?: string;
  date?: string;
  hasConnector?: boolean;
  match?: Match;
}) {
  const p1 = match?.player1 || "TBD";
  const p2 = match?.player2 || "TBD";
  const p1Win = match?.status === "finished" && match.score1 > match.score2;
  const p2Win = match?.status === "finished" && match.score2 > match.score1;

  return (
    <div className="relative my-2.5">
      <div className="absolute -top-4 left-[2px] right-0 flex justify-between pr-1">
        {showLabel && (
          <span className="text-[9px] text-[#5f7893] tracking-widest">
            {showLabel}
          </span>
        )}
        {date && (
          <span className="text-[9px] text-[#ffd60a]/80 font-bold tracking-wider">
            {date}
          </span>
        )}
      </div>
      <div className="relative">
        <TeamRow
          name={p1}
          score={match?.score1}
          isWin={p1Win}
          isTbd={!match?.player1}
        />
        <TeamRow
          name={p2}
          score={match?.score2}
          isWin={p2Win}
          isTbd={!match?.player2}
        />

        {hasConnector && (
          <div className="absolute -right-6 top-1/2 w-6 h-px bg-[#1e3a52]" />
        )}
      </div>
    </div>
  );
}

function groupByRound(matches: Match[]): Record<string, Match[]> {
  const grouped: Record<string, Match[]> = {};
  for (const m of matches) {
    const round = m.round || "Unknown";
    if (!grouped[round]) grouped[round] = [];
    grouped[round].push(m);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => (a.match_order ?? 0) - (b.match_order ?? 0));
  }
  return grouped;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    const d = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2])
    );
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export default function Bracket({ matches }: BracketProps) {
  const [activeType, setActiveType] = useState<FilterType>("singles");

  const filtered = useMemo(
    () => matches.filter((m) => m.match_type === activeType),
    [matches, activeType]
  );

  const grouped = useMemo(() => groupByRound(filtered), [filtered]);

  const roundMatches = (round: string) => grouped[round] || [];

  const hasAnyKnockout = useMemo(
    () =>
      filtered.some((m) => m.round && m.round !== "Group Stage" && m.round !== "group"),
    [filtered]
  );

  return (
    <div className="bg-[#0d1b2a] text-[#e8eef5] font-mono min-h-screen pb-20 pt-4">
      {/* Filters */}
      <div className="flex justify-center gap-2 mb-4 px-5">
        <button
          onClick={() => setActiveType("singles")}
          className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-2 border-[#1e3a52] rounded-md transition-colors ${
            activeType === "singles"
              ? "bg-[#ffd60a] text-[#08111c]"
              : "bg-[#0a1420] text-[#c7d6e6] hover:bg-[#1e3a52]"
          }`}
        >
          👤 Singles
        </button>
        <button
          onClick={() => setActiveType("doubles")}
          className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-2 border-[#1e3a52] rounded-md transition-colors ${
            activeType === "doubles"
              ? "bg-[#ffd60a] text-[#08111c]"
              : "bg-[#0a1420] text-[#c7d6e6] hover:bg-[#1e3a52]"
          }`}
        >
          👥 Doubles
        </button>
      </div>

      <div className="text-center pt-6 px-5 pb-2.5">
        <span className="inline-block bg-[#ffd60a] text-[#08111c] font-bold tracking-[3px] text-xs px-4 py-[7px] rounded">
          BABAK GUGUR
        </span>
        <h1 className="text-[clamp(30px,6vw,58px)] font-extrabold tracking-tight mt-4 leading-none font-sans">
          Knockout Bracket
        </h1>
        <div className="text-[#8fa6bd] text-[13px] mt-3 tracking-widest uppercase">
          TOYO SENSING PING PONG TOURNAMENT 2026 · {activeType}
        </div>
      </div>

      {/* Seeding info */}
      <div className="max-w-[1000px] mx-auto mt-6 px-5 flex flex-wrap gap-2.5 justify-center">
        <div className="bg-[#0a1420] border border-[#1e3a52] rounded-md px-3.5 py-2 text-xs text-[#c7d6e6]">
          Seeding: <b className="text-[#ffd60a]">Juara 1 vs Juara 3</b> ·{" "}
          <b className="text-[#ffd60a]">Juara 2 vs Juara 4</b>
        </div>
        <div className="bg-[#0a1420] border border-[#1e3a52] rounded-md px-3.5 py-2 text-xs text-[#c7d6e6]">
          Satu grup <b className="text-[#ffd60a]">tidak bertemu</b>
        </div>
        <div className="bg-[#1e3a52] text-[#fdf6d8] rounded-md px-3.5 py-2 text-xs font-bold shadow-md">
          Pemenang ke Upper Bracket, Kalah ke Lower Bracket
        </div>
      </div>

      {!hasAnyKnockout && (
        <div className="max-w-[1000px] mx-auto mt-8 px-5">
          <div className="bg-[#0a1420] border border-[#1e3a52] rounded-lg p-8 text-center">
            <div className="text-[#ffd60a] text-2xl mb-3">🏓</div>
            <p className="text-[#c7d6e6] text-sm mb-1">
              Bracket <span className="font-bold text-[#ffd60a] uppercase">{activeType}</span> belum tersedia.
            </p>
            <p className="text-[#6f879e] text-xs">
              Bracket akan muncul setelah drawing knockout dilakukan oleh admin.
            </p>
          </div>
        </div>
      )}

      {hasAnyKnockout && (
        <>
          {/* PLACEMENT MATCHES (16 BESAR) */}
          {roundMatches("Placement").length > 0 && (
            <div className="max-w-[1000px] mx-auto pt-10 px-6 pb-12 border-b border-[#1e3a52]/50">
              <h2 className="text-lg font-bold text-[#e8eef5] uppercase mb-2 text-center tracking-widest">
                Placement Matches (16 Besar)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mt-6">
                {roundMatches("Placement").map((m, i) => (
                  <MatchCardGrid
                    key={m.id}
                    showLabel={`M${i + 1}`}
                    date={formatDate(m.scheduled_date)}
                    match={m}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TWO PARALLEL BRACKETS */}
          <div className="overflow-x-auto pt-12 px-6 pb-12 touch-pan-x relative">
            <div className="flex gap-24 min-w-max mx-auto justify-center">
              {/* UPPER BRACKET (KIRI) */}
              <div className="relative">
                <h2 className="text-sm font-bold text-[#bfe3ff] uppercase mb-6 flex items-center gap-2">
                  <span className="text-[#ffd60a]">▲</span> Upper Bracket
                </h2>
                <div className="flex gap-11">
                  {/* UB QF */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">
                      UB PEREMPAT FINAL
                    </div>
                    <div className="flex flex-col justify-around flex-1">
                      {roundMatches("UB Quarter Final").length > 0
                        ? roundMatches("UB Quarter Final").map((m) => (
                            <MatchCard
                              key={m.id}
                              showLabel={m.round}
                              date={formatDate(m.scheduled_date)}
                              match={m}
                            />
                          ))
                        : [1, 2, 3, 4].map((i) => (
                            <MatchCard
                              key={`UQF${i}`}
                              showLabel={`UQF${i}`}
                              date=""
                            />
                          ))}
                    </div>
                  </div>

                  {/* UB SF */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">
                      UB SEMIFINAL
                    </div>
                    <div className="flex flex-col justify-around flex-1">
                      {roundMatches("UB Semifinal").length > 0
                        ? roundMatches("UB Semifinal").map((m) => (
                            <MatchCard
                              key={m.id}
                              showLabel={m.round}
                              date={formatDate(m.scheduled_date)}
                              match={m}
                            />
                          ))
                        : [1, 2].map((i) => (
                            <MatchCard
                              key={`USF${i}`}
                              showLabel={`USF${i}`}
                              date=""
                            />
                          ))}
                    </div>
                  </div>

                  {/* UB FINAL */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">
                      UB FINAL
                    </div>
                    <div className="flex flex-col justify-around flex-1">
                      {roundMatches("UB Final").length > 0 ? (
                        roundMatches("UB Final").map((m) => (
                          <MatchCard
                            key={m.id}
                            showLabel="U-FINAL"
                            date={formatDate(m.scheduled_date)}
                            hasConnector={false}
                            match={m}
                          />
                        ))
                      ) : (
                        <MatchCard
                          showLabel="U-FINAL"
                          date=""
                          hasConnector={false}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="absolute -right-[48px] top-0 bottom-0 w-px bg-[#1e3a52]/50" />
              </div>

              {/* LOWER BRACKET (KANAN) */}
              <div>
                <h2 className="text-sm font-bold text-[#ffc2d4] uppercase mb-6 flex items-center gap-2">
                  <span className="text-[#ff5c8a]">▼</span> Lower Bracket
                </h2>
                <div className="flex gap-11">
                  {/* LB QF */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">
                      LB PEREMPAT FINAL
                    </div>
                    <div className="flex flex-col justify-around flex-1">
                      {roundMatches("LB Quarter Final").length > 0
                        ? roundMatches("LB Quarter Final").map((m) => (
                            <MatchCard
                              key={m.id}
                              showLabel={m.round}
                              date={formatDate(m.scheduled_date)}
                              match={m}
                            />
                          ))
                        : [1, 2, 3, 4].map((i) => (
                            <MatchCard
                              key={`LQF${i}`}
                              showLabel={`LQF${i}`}
                              date=""
                            />
                          ))}
                    </div>
                  </div>

                  {/* LB SF */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">
                      LB SEMIFINAL
                    </div>
                    <div className="flex flex-col justify-around flex-1">
                      {roundMatches("LB Semifinal").length > 0
                        ? roundMatches("LB Semifinal").map((m) => (
                            <MatchCard
                              key={m.id}
                              showLabel={m.round}
                              date={formatDate(m.scheduled_date)}
                              match={m}
                            />
                          ))
                        : [1, 2].map((i) => (
                            <MatchCard
                              key={`LSF${i}`}
                              showLabel={`LSF${i}`}
                              date=""
                            />
                          ))}
                    </div>
                  </div>

                  {/* LB FINAL */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">
                      LB FINAL
                    </div>
                    <div className="flex flex-col justify-around flex-1">
                      {roundMatches("LB Final").length > 0 ? (
                        roundMatches("LB Final").map((m) => (
                          <MatchCard
                            key={m.id}
                            showLabel="L-FINAL"
                            date={formatDate(m.scheduled_date)}
                            hasConnector={false}
                            match={m}
                          />
                        ))
                      ) : (
                        <MatchCard
                          showLabel="L-FINAL"
                          date=""
                          hasConnector={false}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GRAND FINAL */}
          <div className="max-w-[1000px] mx-auto pt-8 px-6 pb-12">
            <h2 className="text-xl font-bold text-[#ffd60a] uppercase mb-8 flex items-center justify-center gap-2">
              <span className="text-[#ffd60a]">★</span> Grand Final{" "}
              <span className="text-[#ffd60a]">★</span>
            </h2>
            <div className="flex flex-col items-center gap-8">
              <div className="w-[300px]">
                {roundMatches("Grand Final").length > 0 ? (
                  roundMatches("Grand Final").map((m) => (
                    <MatchCard
                      key={m.id}
                      showLabel="GRAND FINAL"
                      date={formatDate(m.scheduled_date)}
                      hasConnector={false}
                      match={m}
                    />
                  ))
                ) : (
                  <MatchCard
                    showLabel="GRAND FINAL"
                    date=""
                    hasConnector={false}
                  />
                )}
              </div>

              {/* ULTIMATE CHAMPION */}
              <div className="w-[260px]">
                <div className="border-2 border-[#ffd60a] shadow-[0_0_15px_rgba(255,214,10,0.3)] rounded-[12px] bg-gradient-to-b from-[#1a2c42] to-[#0a1420] p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#ffd60a]" />
                  <div className="text-[12px] tracking-[4px] font-bold text-[#ffd60a]">
                    TOYO SENSING
                  </div>
                  <div className="text-[10px] tracking-[3px] text-[#bfe3ff] mt-1">
                    CHAMPION
                  </div>
                  <div className="text-[44px] font-extrabold text-[#e8eef5] mt-2 drop-shadow-md">
                    🏆
                  </div>
                  <div className="text-[11px] text-[#7c93a9] mt-3 uppercase tracking-widest">
                    Pemenang Grand Final
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <footer className="text-center mt-12 text-[#5f7893] text-xs tracking-widest">
        🏓 Skema drawing knockout · dibuat dari klasemen sementara
      </footer>
    </div>
  );
}
