import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getDatesInRange(startDateStr: string, endDateStr: string, skipWeekends: boolean = true): string[] {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (!skipWeekends || !isWeekend) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      // Body might be empty
    }

    const startDate = body.startDate || "2026-07-06";
    const endDate = body.endDate || "2026-07-17";
    const skipWeekends = body.skipWeekends !== undefined ? body.skipWeekends : true;

    // 1. Fetch matches sorted by match_order
    const { data: matches, error: fetchError } = await supabase
      .from("mapidpong_matches")
      .select("*")
      .order("match_order", { ascending: true });

    if (fetchError) {
      console.error("Fetch Matches Error:", fetchError);
      return NextResponse.json({ error: "Gagal mengambil data pertandingan." }, { status: 500 });
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({ message: "Tidak ada pertandingan yang ditemukan." }, { status: 200 });
    }

    // 2. Generate scheduling dates
    const dates = getDatesInRange(startDate, endDate, skipWeekends);
    if (dates.length === 0) {
      return NextResponse.json({ error: "Rentang tanggal tidak valid atau menghasilkan 0 hari kerja." }, { status: 400 });
    }

    const D = dates.length;
    const N = matches.length;

    // Distribute matches to dates using bucket fill
    const buckets = Array.from({ length: D }, () => 0);
    let remaining = N;
    for (let i = 0; remaining > 0; i = (i + 1) % D) {
      buckets[i]++;
      remaining--;
    }

    // Assign scheduled_date to each match and update in DB
    const updatePromises = [];
    let dateIdx = 0;
    let currentBucketCount = 0;

    for (let i = 0; i < N; i++) {
      if (currentBucketCount >= buckets[dateIdx]) {
        dateIdx++;
        currentBucketCount = 0;
      }
      
      const match = matches[i];
      const assignedDate = dates[dateIdx];
      
      updatePromises.push(
        supabase
          .from("mapidpong_matches")
          .update({ scheduled_date: assignedDate })
          .eq("id", match.id)
      );
      
      currentBucketCount++;
    }

    const results = await Promise.all(updatePromises);
    const failedUpdate = results.find(r => r.error);
    if (failedUpdate) {
      console.error("Update Match Error:", failedUpdate.error);
      return NextResponse.json({ error: "Beberapa pertandingan gagal diperbarui." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil menjadwalkan ${N} pertandingan dari tanggal ${startDate} sampai ${endDate}.`,
      total_days: D,
      distribution: buckets
    });
  } catch (err: any) {
    console.error("Schedule Existing Exception:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
