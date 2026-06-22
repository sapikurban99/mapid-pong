"use client"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface DbPlayer {
  id: string;
  name: string;
  wa?: string;
  group_name?: string;
  type: "singles" | "doubles";
}

interface PesertaProps {
  initialPlayers?: DbPlayer[];
}

type FilterType = "all" | "singles" | "doubles";

export default function Peserta({ initialPlayers }: PesertaProps) {
  const [players, setPlayers] = useState<DbPlayer[]>(initialPlayers || []);
  const [loading, setLoading] = useState<boolean>(!initialPlayers);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (initialPlayers) return;

    async function loadPlayers() {
      try {
        const { data, error } = await supabase
          .from("mapidpong_players")
          .select("*")
          .order("group_name", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;
        setPlayers(data || []);
      } catch (err: any) {
        console.error("Error loading players:", err);
        setError(err.message || "Gagal memuat daftar peserta.");
      } finally {
        setLoading(false);
      }
    }

    loadPlayers();
  }, [initialPlayers]);

  const filteredPlayers = filter === "all"
    ? players
    : players.filter(p => p.type === filter);

  const singlesCount = players.filter(p => p.type === "singles").length;
  const doublesCount = players.filter(p => p.type === "doubles").length;

  // Group by group_name for display
  const grouped: Record<string, DbPlayer[]> = {};
  filteredPlayers.forEach(p => {
    const g = p.group_name || "Tanpa Grup";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(p);
  });
  const sortedGroups = Object.keys(grouped).sort();

  return (
    <section id="peserta" className="bg-dark-blue py-20 px-6 min-h-[60vh] flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] font-mono text-xs font-bold uppercase tracking-wider bg-green text-black mb-4">
            Daftar Kontestan
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Peserta Turnamen</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center font-mono py-12">
            <div className="text-3xl animate-bounce mb-3">🏓</div>
            <div className="text-xs uppercase tracking-widest text-white/50 animate-pulse">Memuat Peserta...</div>
          </div>
        ) : error ? (
          <div className="box-neo bg-pink text-white p-6 max-w-md mx-auto text-center font-mono text-sm">
            ❌ {error}
          </div>
        ) : players.length === 0 ? (
          <div className="box-neo bg-white text-black p-8 max-w-md mx-auto text-center">
            <p className="font-mono font-bold mb-4">Belum ada peserta fix yang terdaftar.</p>
            <p className="text-xs text-black/60 font-mono">
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

            {/* Players by Group */}
            {sortedGroups.length === 0 ? (
              <div className="box-neo bg-white text-black p-6 text-center font-mono text-sm">
                Tidak ada peserta untuk filter ini.
              </div>
            ) : (
              <div className="space-y-8">
                {sortedGroups.map(grpName => (
                  <div key={grpName}>
                    <h3 className="font-mono text-sm font-bold text-yellow mb-3 uppercase tracking-wider">
                      📌 Grup {grpName} ({grouped[grpName].length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {grouped[grpName].map((p, i) => (
                        <div key={p.id || i} className="box-neo bg-white text-black p-4 flex flex-col justify-between">
                          <div>
                            <div className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 inline-block w-fit mb-2 ${
                              p.type === "singles"
                                ? "text-pink bg-pink/10"
                                : "text-blue bg-blue/10"
                            }`}>
                              {p.type}
                            </div>
                            <h4 className="text-lg font-bold truncate mb-1">{p.name}</h4>
                          </div>
                          {p.wa && (
                            <p className="font-mono text-xs text-black/50 mt-3 truncate">
                              WA: {p.wa}
                            </p>
                          )}
                        </div>
                      ))}
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
