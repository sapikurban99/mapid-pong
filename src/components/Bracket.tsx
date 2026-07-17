"use client";

import { useState } from "react";
import { Match } from "@/lib/supabase";

interface BracketProps {
  matches: Match[];
}

const UB_R1_SINGLES = [
  { lbl: "M1", date: "17 Jul", t1: { seed: "A1", pos: 1, name: "Zhafran (Lower)" }, t2: { seed: "C3", pos: 3, name: "Hadi" } },
  { lbl: "M2", date: "17 Jul", t1: { seed: "B2", pos: 2, name: "Reza" },            t2: { seed: "D4", pos: 4, name: "otom" } },
  { lbl: "M3", date: "17 Jul", t1: { seed: "C1", pos: 1, name: "Difta" },           t2: { seed: "A3", pos: 3, name: "Egi" } },
  { lbl: "M4", date: "17 Jul", t1: { seed: "D2", pos: 2, name: "Dzulfiqar S.S." },  t2: { seed: "B4", pos: 4, name: "Fariz" } },
  { lbl: "M5", date: "18 Jul", t1: { seed: "B1", pos: 1, name: "Agus Subekti" },    t2: { seed: "D3", pos: 3, name: "Machrus" } },
  { lbl: "M6", date: "18 Jul", t1: { seed: "A2", pos: 2, name: "Yusuf🏓" },           t2: { seed: "C4", pos: 4, name: "alif" } },
  { lbl: "M7", date: "18 Jul", t1: { seed: "D1", pos: 1, name: "Dwi" },             t2: { seed: "B3", pos: 3, name: "Bagus I.D." } },
  { lbl: "M8", date: "18 Jul", t1: { seed: "C2", pos: 2, name: "Fathur" },          t2: { seed: "A4", pos: 4, name: "Adam" } },
];

function SeedBadge({ seed, pos }: { seed: string | null; pos?: number }) {
  if (!seed || seed === "?") {
    return <span className="flex-none text-[10px] font-bold text-[#9fb3c8] bg-[#33475c] rounded-[3px] px-[5px] py-[2px] min-w-[26px] text-center">?</span>;
  }
  let bg = "bg-[#fdf6d8]";
  if (pos === 1) bg = "bg-[#ffd60a]";
  if (pos === 2) bg = "bg-[#bfe3ff]";
  if (pos === 3) bg = "bg-[#ffd9a8]";
  if (pos === 4) bg = "bg-[#ffc2d4]";
  
  return (
    <span className={`flex-none text-[10px] font-bold text-[#08111c] rounded-[3px] px-[5px] py-[2px] min-w-[26px] text-center ${bg}`}>
      {seed}
    </span>
  );
}

function TeamRow({ seed, pos, name, isWin, isTbd }: { seed: string | null; pos?: number; name: string; isWin?: boolean; isTbd?: boolean }) {
  return (
    <div className={`flex items-center gap-2 bg-[#0a1420] border border-[#1e3a52] px-2.5 py-2.5 text-[13px] first:rounded-t-md first:border-b-0 last:rounded-b-md ${isWin ? 'text-[#ffd60a] font-bold' : isTbd ? 'text-[#6f879e]' : 'text-[#e8eef5]'}`}>
      <SeedBadge seed={seed} pos={pos} />
      <span className="whitespace-nowrap overflow-hidden text-ellipsis flex-1">
        {name}
      </span>
    </div>
  );
}

function MatchCardGrid({ 
  showLabel, 
  date,
  teams
}: { 
  showLabel?: string; 
  date?: string; 
  teams: { seed: string, pos?: number, name: string, isTbd?: boolean }[]
}) {
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
        <TeamRow {...teams[0]} />
        <TeamRow {...teams[1]} />
      </div>
    </div>
  );
}

function MatchCard({ 
  showLabel, 
  date, 
  hasConnector = true,
  teams
}: { 
  showLabel?: string; 
  date?: string; 
  hasConnector?: boolean;
  teams: { seed: string, pos?: number, name: string, isTbd?: boolean }[]
}) {
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
        <TeamRow {...teams[0]} />
        <TeamRow {...teams[1]} />
        
        {hasConnector && (
          <div className="absolute -right-6 top-1/2 w-6 h-px bg-[#1e3a52]"></div>
        )}
      </div>
    </div>
  );
}

export default function Bracket({ matches }: BracketProps) {
  const [activeType, setActiveType] = useState<"singles" | "doubles">("singles");

  return (
    <div className="bg-[#0d1b2a] text-[#e8eef5] font-mono min-h-screen pb-20 pt-4">
      
      {/* Filters */}
      <div className="flex justify-center gap-2 mb-4 px-5">
        <button
          onClick={() => setActiveType("singles")}
          className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-2 border-[#1e3a52] rounded-md transition-colors ${
            activeType === "singles" ? "bg-[#ffd60a] text-[#08111c]" : "bg-[#0a1420] text-[#c7d6e6] hover:bg-[#1e3a52]"
          }`}
        >
          👤 Singles
        </button>
        <button
          onClick={() => setActiveType("doubles")}
          className={`font-mono text-xs font-bold uppercase px-5 py-2.5 border-2 border-[#1e3a52] rounded-md transition-colors ${
            activeType === "doubles" ? "bg-[#ffd60a] text-[#08111c]" : "bg-[#0a1420] text-[#c7d6e6] hover:bg-[#1e3a52]"
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

      {activeType === "singles" ? (
        <>
          <div className="max-w-[1000px] mx-auto mt-6 px-5 flex flex-wrap gap-2.5 justify-center">
            <div className="bg-[#0a1420] border border-[#1e3a52] rounded-md px-3.5 py-2 text-xs text-[#c7d6e6]">
              Seeding: <b className="text-[#ffd60a]">Juara 1 vs Juara 3</b> · <b className="text-[#ffd60a]">Juara 2 vs Juara 4</b>
            </div>
            <div className="bg-[#0a1420] border border-[#1e3a52] rounded-md px-3.5 py-2 text-xs text-[#c7d6e6]">
              Satu grup <b className="text-[#ffd60a]">tidak bertemu</b>
            </div>
            <div className="bg-[#1e3a52] text-[#fdf6d8] rounded-md px-3.5 py-2 text-xs font-bold shadow-md">
              Pemenang ke Upper Bracket, Kalah ke Lower Bracket
            </div>
          </div>

          {/* PLACEMENT MATCHES (16 BESAR) */}
          <div className="max-w-[1000px] mx-auto pt-10 px-6 pb-12 border-b border-[#1e3a52]/50">
            <h2 className="text-lg font-bold text-[#e8eef5] uppercase mb-2 text-center tracking-widest">
              Placement Matches (16 Besar)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mt-6">
              {UB_R1_SINGLES.map((m) => (
                <MatchCardGrid 
                  key={m.lbl} 
                  showLabel={m.lbl} 
                  date={m.date}
                  teams={[ m.t1, m.t2 ]}
                />
              ))}
            </div>
          </div>

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
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">UB PEREMPAT FINAL</div>
                    <div className="flex flex-col justify-around flex-1">
                      {[1,2,3,4].map(i => (
                        <MatchCard 
                          key={`UQF${i}`} showLabel={`UQF${i}`} date="19 Jul"
                          teams={[
                            { seed: "?", name: `Pemenang M${i*2-1}`, isTbd: true },
                            { seed: "?", name: `Pemenang M${i*2}`, isTbd: true }
                          ]}
                        />
                      ))}
                    </div>
                  </div>

                  {/* UB SF */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">UB SEMIFINAL</div>
                    <div className="flex flex-col justify-around flex-1">
                      {[1,2].map(i => (
                        <MatchCard 
                          key={`USF${i}`} showLabel={`USF${i}`} date="20 Jul"
                          teams={[
                            { seed: "?", name: `Pemenang UQF${i*2-1}`, isTbd: true },
                            { seed: "?", name: `Pemenang UQF${i*2}`, isTbd: true }
                          ]}
                        />
                      ))}
                    </div>
                  </div>

                  {/* UB FINAL */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">UB FINAL</div>
                    <div className="flex flex-col justify-around flex-1">
                      <MatchCard 
                        showLabel="U-FINAL" date="21 Jul" hasConnector={false}
                        teams={[
                          { seed: "?", name: "Pemenang USF1", isTbd: true },
                          { seed: "?", name: "Pemenang USF2", isTbd: true }
                        ]}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Vertical Divider */}
                <div className="absolute -right-[48px] top-0 bottom-0 w-px bg-dashed bg-[#1e3a52]/50"></div>
              </div>

              {/* LOWER BRACKET (KANAN) */}
              <div>
                <h2 className="text-sm font-bold text-[#ffc2d4] uppercase mb-6 flex items-center gap-2">
                  <span className="text-[#ff5c8a]">▼</span> Lower Bracket
                </h2>
                <div className="flex gap-11">
                  {/* LB QF */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">LB PEREMPAT FINAL</div>
                    <div className="flex flex-col justify-around flex-1">
                      {[1,2,3,4].map(i => (
                        <MatchCard 
                          key={`LQF${i}`} showLabel={`LQF${i}`} date="19 Jul"
                          teams={[
                            { seed: "?", name: `Kalah M${i*2-1}`, isTbd: true },
                            { seed: "?", name: `Kalah M${i*2}`, isTbd: true }
                          ]}
                        />
                      ))}
                    </div>
                  </div>

                  {/* LB SF */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">LB SEMIFINAL</div>
                    <div className="flex flex-col justify-around flex-1">
                      {[1,2].map(i => (
                        <MatchCard 
                          key={`LSF${i}`} showLabel={`LSF${i}`} date="20 Jul"
                          teams={[
                            { seed: "?", name: `Pemenang LQF${i*2-1}`, isTbd: true },
                            { seed: "?", name: `Pemenang LQF${i*2}`, isTbd: true }
                          ]}
                        />
                      ))}
                    </div>
                  </div>

                  {/* LB FINAL */}
                  <div className="flex flex-col justify-around flex-none w-[210px]">
                    <div className="text-center text-[10px] tracking-widest text-[#ffd60a] mb-3.5 font-bold">LB FINAL</div>
                    <div className="flex flex-col justify-around flex-1">
                      <MatchCard 
                        showLabel="L-FINAL" date="21 Jul" hasConnector={false}
                        teams={[
                          { seed: "?", name: "Pemenang LSF1", isTbd: true },
                          { seed: "?", name: "Pemenang LSF2", isTbd: true }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* GRAND FINAL */}
          <div className="max-w-[1000px] mx-auto pt-8 px-6 pb-12">
            <h2 className="text-xl font-bold text-[#ffd60a] uppercase mb-8 flex items-center justify-center gap-2">
              <span className="text-[#ffd60a]">★</span> Grand Final <span className="text-[#ffd60a]">★</span>
            </h2>
            <div className="flex flex-col items-center gap-8">
              <div className="w-[300px]">
                <MatchCard 
                  showLabel="GRAND FINAL" date="21 Jul" hasConnector={false}
                  teams={[
                    { seed: "?", name: "Pemenang U-FINAL", isTbd: true },
                    { seed: "?", name: "Pemenang L-FINAL", isTbd: true }
                  ]}
                />
              </div>

              {/* ULTIMATE CHAMPION */}
              <div className="w-[260px]">
                <div className="border-2 border-[#ffd60a] shadow-[0_0_15px_rgba(255,214,10,0.3)] rounded-[12px] bg-gradient-to-b from-[#1a2c42] to-[#0a1420] p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#ffd60a]"></div>
                  <div className="text-[12px] tracking-[4px] font-bold text-[#ffd60a]">TOYO SENSING</div>
                  <div className="text-[10px] tracking-[3px] text-[#bfe3ff] mt-1">CHAMPION</div>
                  <div className="text-[44px] font-extrabold text-[#e8eef5] mt-2 drop-shadow-md">🏆</div>
                  <div className="text-[11px] text-[#7c93a9] mt-3 uppercase tracking-widest">Pemenang Grand Final</div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1000px] mx-auto px-5 flex flex-wrap gap-4 justify-center text-xs text-[#9fb3c8]">
            <span className="inline-flex items-center gap-1.5"><i className="w-[18px] h-3 rounded-[3px] inline-block bg-[#ffd60a]"></i> Juara 1 grup</span>
            <span className="inline-flex items-center gap-1.5"><i className="w-[18px] h-3 rounded-[3px] inline-block bg-[#bfe3ff]"></i> Juara 2 grup</span>
            <span className="inline-flex items-center gap-1.5"><i className="w-[18px] h-3 rounded-[3px] inline-block bg-[#ffd9a8]"></i> Juara 3 grup</span>
            <span className="inline-flex items-center gap-1.5"><i className="w-[18px] h-3 rounded-[3px] inline-block bg-[#ffc2d4]"></i> Juara 4 grup</span>
          </div>
        </>
      ) : (
        <div className="text-center text-[#8fa6bd] py-20 text-sm">
          Drawing Doubles belum tersedia.
        </div>
      )}

      <footer className="text-center mt-12 text-[#5f7893] text-xs tracking-widest">
        🏓 Skema drawing knockout · dibuat dari klasemen sementara
      </footer>
    </div>
  );
}
