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

export default function Peserta({ initialPlayers }: PesertaProps) {
  const [players, setPlayers] = useState<DbPlayer[]>(initialPlayers || []);
  const [loading, setLoading] = useState<boolean>(!initialPlayers);
  const [error, setError] = useState<string | null>(null);

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {players.map((p, i) => (
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
                <p className="font-mono text-xs text-black/50 mt-3">
                  {p.group_name ? `Grup ${p.group_name.toUpperCase()}` : "Belum ada grup"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}