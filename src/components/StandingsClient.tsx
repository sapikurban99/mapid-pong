"use client"
import { useEffect, useState } from "react";
import { supabase, Match } from "@/lib/supabase";
import { DbPlayer } from "@/components/Peserta";
import Standings from "@/components/Standings";

interface StandingsClientProps {
  initialPlayers: DbPlayer[];
  initialMatches: Match[];
}

export default function StandingsClient({ initialPlayers, initialMatches }: StandingsClientProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);

  useEffect(() => {
    // Subscribe to realtime matches updates only — initial data already rendered
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

  return <Standings players={initialPlayers} matches={matches} />;
}
