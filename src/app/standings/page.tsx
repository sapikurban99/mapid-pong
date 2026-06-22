"use client"
import { useEffect, useState } from "react";
import { supabase, Match } from "@/lib/supabase";
import { api } from "@/lib/api";
import { DbPlayer } from "@/components/Peserta";
import Standings from "@/components/Standings";

export default function StandingsPage() {
  const [players, setPlayers] = useState<DbPlayer[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch players and matches in parallel
        const [playersRes, matchesRes] = await Promise.all([
          supabase.from("mapidpong_players").select("*"),
          api.getMatches()
        ]);

        if (playersRes.error) throw playersRes.error;

        setPlayers(playersRes.data || []);
        setMatches(matchesRes || []);
      } catch (err) {
        console.error("Gagal sinkronisasi data standings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Subscribe to realtime matches update
    const channel = supabase
      .channel("realtime-standings")
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
        <div className="tracking-widest uppercase font-bold text-xs animate-pulse">SINKRONISASI DATA KLASEMEN...</div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-navy min-h-screen">
      <Standings players={players} matches={matches} />
    </div>
  );
}
