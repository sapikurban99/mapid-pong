import { fetchPlayers } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const players = await fetchPlayers();
    return NextResponse.json(players);
  } catch (error: any) {
    console.error("Failed to proxy players request:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch players" }, { status: 500 });
  }
}
