"use client"
import { useEffect, useState } from "react";
import { supabase, Match } from "@/lib/supabase";
import { api } from "@/lib/api";
import LiveScore from "@/components/LiveScore";

export default function LiveScorePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Fetch initial matches
    api.getMatches()
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch(err => console.error("Gagal sinkronisasi matches:", err));

    // 2. Subscribe to Supabase Realtime changes
    const channel = supabase
      .channel("realtime-livescore")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mapidpong_matches" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updatedMatch = payload.new as Match;
            setMatches((prev) => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
          } else if (payload.eventType === "INSERT") {
            setMatches((prev) => [...prev, payload.new as Match]);
          } else if (payload.eventType === "DELETE") {
            setMatches((prev) => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-navy flex flex-col items-center justify-center font-mono text-white">
        <div className="text-4xl animate-bounce mb-4">🏓</div>
        <div className="tracking-widest uppercase font-bold text-xs animate-pulse">SINKRONISASI REALTIME SUPABASE...</div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-navy min-h-screen">
      <LiveScore matches={matches} />
    </div>
  );
}
