import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Match = {
  id: string;
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  status: "upcoming" | "live" | "finished";
  match_type: "singles" | "doubles";
  group_name: string | null;
  round: string;
  referee_name: string | null;
  created_at: string;
  updated_at: string;
};

export type MatchInsert = Omit<
  Match,
  "id" | "created_at" | "updated_at"
>;
