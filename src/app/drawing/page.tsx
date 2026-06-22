"use client"
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Player } from "@/lib/api";

type GroupName = "A" | "B" | "C" | "D";
interface DrawnPlayer {
  id: string;
  name: string;
  wa: string;
  group_name: GroupName;
  type: "singles" | "doubles";
}

export default function LiveDrawingPage() {
  const [registrants, setRegistrants] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration
  const [type, setType] = useState<"singles" | "doubles">("singles");
  const [groupCount, setGroupCount] = useState<number>(4);

  // Drawing state
  const [drawingState, setDrawingState] = useState<"idle" | "drawing" | "completed">("idle");
  const [drawnGroups, setDrawnGroups] = useState<Record<GroupName, DrawnPlayer[]>>({
    A: [], B: [], C: [], D: []
  });
  const [currentDrawingItem, setCurrentDrawingItem] = useState<string>("");
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [drawProgress, setDrawProgress] = useState<number>(0);

  // Save states
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConfirmSave, setShowConfirmSave] = useState<boolean>(false);

  useEffect(() => {
    async function fetchRegistrants() {
      try {
        const res = await fetch("/api/players");
        if (!res.ok) {
          throw new Error("Gagal mengambil data dari API.");
        }
        const data: Player[] = await res.json();
        setRegistrants(data);
        // Initially select all
        setSelectedIds(new Set(data.map(p => p.id)));
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Terjadi kesalahan saat memuat pendaftar.");
      } finally {
        setLoading(false);
      }
    }

    fetchRegistrants();
  }, []);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectAll = () => {
    setSelectedIds(new Set(registrants.map(p => p.id)));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  // Helper to shuffle array
  const shuffle = <T,>(arr: T[]): T[] => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // Run the Live Drawing Animation
  const startDrawing = async () => {
    if (selectedIds.size === 0) {
      alert("Pilih minimal 1 pendaftar!");
      return;
    }

    setDrawingState("drawing");
    setSaveSuccess(false);
    setSaveError(null);
    
    // Clear groups
    setDrawnGroups({ A: [], B: [], C: [], D: [] });

    // Prepare participants list
    const selectedPlayers = registrants.filter(r => selectedIds.has(r.id));
    
    let itemsToDraw: { name: string; id: string; wa: string }[] = [];

    if (type === "singles") {
      itemsToDraw = selectedPlayers.map(p => ({
        id: p.id,
        name: p.name,
        wa: p.wa
      }));
    } else {
      // Doubles: Pair up players randomly
      const shuffledPlayers = shuffle(selectedPlayers);
      const pairs: typeof itemsToDraw = [];
      for (let i = 0; i < shuffledPlayers.length; i += 2) {
        if (i + 1 < shuffledPlayers.length) {
          pairs.push({
            id: `${shuffledPlayers[i].id}-${shuffledPlayers[i+1].id}`,
            name: `${shuffledPlayers[i].name} & ${shuffledPlayers[i+1].name}`,
            wa: `${shuffledPlayers[i].wa} / ${shuffledPlayers[i+1].wa}`
          });
        } else {
          // Odd player left out, gets paired with "TBD Partner" or stays single team
          pairs.push({
            id: shuffledPlayers[i].id,
            name: `${shuffledPlayers[i].name} & TBD`,
            wa: shuffledPlayers[i].wa
          });
        }
      }
      itemsToDraw = pairs;
    }

    const shuffledItems = shuffle(itemsToDraw);
    const groups: GroupName[] = ["A", "B", "C", "D"].slice(0, groupCount) as GroupName[];
    
    const tempGroups: Record<GroupName, DrawnPlayer[]> = {
      A: [], B: [], C: [], D: []
    };

    // Draw one by one with slot machine animation
    for (let i = 0; i < shuffledItems.length; i++) {
      const currentItem = shuffledItems[i];
      setIsRolling(true);

      // Roll effect: rapidly cycle through remaining items
      const rollDuration = 600; // ms
      const intervalTime = 60; // ms
      const startTime = Date.now();

      await new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          const elapsed = Date.now() - startTime;
          if (elapsed >= rollDuration) {
            clearInterval(timer);
            resolve();
          } else {
            // Pick a random remaining item to show
            const remIdx = Math.floor(Math.random() * (shuffledItems.length - i)) + i;
            setCurrentDrawingItem(shuffledItems[remIdx].name);
          }
        }, intervalTime);
      });

      setIsRolling(false);
      setCurrentDrawingItem(currentItem.name);

      // Flash/Delay on chosen name
      await new Promise(resolve => setTimeout(resolve, 300));

      // Assign to group (round-robin)
      const groupName = groups[i % groups.length];
      const drawnObj: DrawnPlayer = {
        id: currentItem.id,
        name: currentItem.name,
        wa: currentItem.wa,
        group_name: groupName,
        type: type
      };

      tempGroups[groupName].push(drawnObj);
      setDrawnGroups({ ...tempGroups });
      setDrawProgress(Math.round(((i + 1) / shuffledItems.length) * 100));

      // Small break before drawing next player
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setDrawingState("completed");
    setCurrentDrawingItem("");
  };

  // Reset/Clear DB on Supabase and Save new Draw
  const saveToSupabase = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // 1. Convert drawn players into flat list
      const playersList: DrawnPlayer[] = [];
      Object.keys(drawnGroups).forEach((key) => {
        playersList.push(...drawnGroups[key as GroupName]);
      });

      if (playersList.length === 0) {
        throw new Error("Tidak ada data peserta untuk disimpan.");
      }

      // 2. Prepare players payload
      const playersToInsert = playersList.map(p => ({
        id: p.id.includes("-") ? undefined : p.id, // Generate new UUID if it is a paired composite ID
        name: p.name,
        wa: p.wa,
        group_name: p.group_name,
        type: p.type
      }));

      // 3. Prepare matches payload
      const matchesToInsert: any[] = [];
      const groups: GroupName[] = ["A", "B", "C", "D"].slice(0, groupCount) as GroupName[];

      groups.forEach((gName) => {
        const groupPlayers = drawnGroups[gName];
        // Generate matches for each pair
        for (let i = 0; i < groupPlayers.length; i++) {
          for (let j = i + 1; j < groupPlayers.length; j++) {
            matchesToInsert.push({
              player1: groupPlayers[i].name,
              player2: groupPlayers[j].name,
              score1: 0,
              score2: 0,
              status: "upcoming",
              match_type: type,
              group_name: gName,
              round: "Group Stage"
            });
          }
        }
      });

      // 4. Send to our API Route
      const res = await fetch("/api/drawing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players: playersToInsert, matches: matchesToInsert })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan hasil drawing");
      }

      setSaveSuccess(true);
      setShowConfirmSave(false);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Gagal menyimpan hasil drawing ke server.");
    } finally {
      setSaving(false);
    }
  };

  const resetDatabase = async () => {
    if (!confirm("Apakah Anda yakin ingin RESET turnamen? Ini akan menghapus semua pemain, semua jadwal pertandingan, skor, dan log secara permanen!")) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/drawing/reset", {
        method: "POST"
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal reset database");
      }

      alert("Database turnamen berhasil di-reset sepenuhnya!");
      setDrawnGroups({ A: [], B: [], C: [], D: [] });
      setDrawingState("idle");
    } catch (err: any) {
      alert("Gagal reset database: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center font-mono text-white">
        <div className="text-4xl animate-bounce mb-4">🎲</div>
        <div className="tracking-widest uppercase font-bold text-xs animate-pulse">MEMUAT DATA PENDAFTAR...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <div className="box-neo bg-pink text-white p-8 max-w-md text-center font-mono">
          <h3 className="text-xl font-bold mb-4">Gagal Memuat Halaman</h3>
          <p className="text-sm mb-6">{error}</p>
          <a href="/" className="btn-neo bg-black text-white hover:bg-yellow hover:text-black py-2 px-4 inline-block">
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] font-mono text-xs font-bold uppercase tracking-wider bg-pink text-white mb-4">
            Admin Panel
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">🎲 Live Drawing Turnamen</h1>
          <p className="font-mono text-xs md:text-sm text-white/60 mt-3">
            Ambil data pendaftar Mapid secara live, acak grup kualifikasi secara otomatis, dan sinkronisasi ke Supabase.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Config and list */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Setting Box */}
            <div className="box-neo bg-white text-black p-6">
              <h3 className="font-mono text-base font-bold border-b-2 border-black pb-2 mb-4">⚙️ Konfigurasi Drawing</h3>
              
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block font-bold mb-1">Kategori Turnamen:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setType("singles")}
                      className={`flex-1 py-2 font-bold border-2 border-black rounded-none cursor-pointer ${
                        type === "singles" ? "bg-pink text-white" : "bg-gray-100 text-black"
                      }`}
                      disabled={drawingState === "drawing"}
                    >
                      👤 Singles
                    </button>
                    <button
                      onClick={() => setType("doubles")}
                      className={`flex-1 py-2 font-bold border-2 border-black rounded-none cursor-pointer ${
                        type === "doubles" ? "bg-blue text-white" : "bg-gray-100 text-black"
                      }`}
                      disabled={drawingState === "drawing"}
                    >
                      👥 Doubles
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Jumlah Grup:</label>
                  <select
                    value={groupCount}
                    onChange={(e) => setGroupCount(Number(e.target.value))}
                    className="w-full p-2 border-2 border-black rounded-none bg-white font-bold cursor-pointer"
                    disabled={drawingState === "drawing"}
                  >
                    <option value={2}>2 Grup (A, B)</option>
                    <option value={3}>3 Grup (A, B, C)</option>
                    <option value={4}>4 Grup (A, B, C, D)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={startDrawing}
                    disabled={drawingState === "drawing" || selectedIds.size === 0}
                    className="w-full btn-neo bg-green text-black hover:bg-yellow hover:text-black py-3 font-bold text-sm tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🚀 MULAI DRAWING LIVE
                  </button>
                </div>

                <div>
                  <button
                    onClick={resetDatabase}
                    disabled={saving || drawingState === "drawing"}
                    className="w-full btn-neo bg-pink text-white hover:bg-red-600 py-2.5 font-bold text-xs tracking-wider cursor-pointer"
                  >
                    ⚠️ RESET TOURNAMENT DATA
                  </button>
                </div>
              </div>
            </div>

            {/* Registrants Checkbox list */}
            <div className="box-neo bg-white text-black p-6 max-h-[500px] overflow-y-auto">
              <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
                <h3 className="font-mono text-base font-bold">📋 Pendaftar API ({registrants.length})</h3>
                <div className="flex gap-2 text-[10px] font-mono font-bold">
                  <button onClick={selectAll} className="underline text-blue hover:text-navy cursor-pointer">Semua</button>
                  <button onClick={selectNone} className="underline text-pink hover:text-navy cursor-pointer">Kosongkan</button>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {registrants.map((p) => {
                  const isChecked = selectedIds.has(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 p-2 border-2 border-black/10 hover:border-black cursor-pointer transition-colors ${
                        isChecked ? "bg-yellow/10 border-black" : "bg-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(p.id)}
                        disabled={drawingState === "drawing"}
                        className="cursor-pointer accent-black w-4 h-4"
                      />
                      <div className="truncate">
                        <div className="font-bold">{p.name}</div>
                        <div className="text-[10px] text-black/50">{p.wa}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right panel: Active drawing and groups */}
          <div className="lg:col-span-2 space-y-6">

            {/* Active drawing board */}
            {drawingState === "drawing" && (
              <div className="box-neo bg-yellow text-black p-8 text-center animate-pulse border-4">
                <span className="font-mono text-xs font-bold bg-black text-white px-3 py-1 uppercase tracking-widest">
                  Mengundi Live...
                </span>
                
                <div className="my-8 min-h-[70px] flex items-center justify-center">
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight uppercase font-mono">
                    {isRolling ? (
                      <span className="text-black/40">{currentDrawingItem}</span>
                    ) : (
                      <span className="text-black scale-110 transition-transform duration-200">{currentDrawingItem}</span>
                    )}
                  </h2>
                </div>

                <div className="w-full bg-black/10 h-4 border-2 border-black rounded-none overflow-hidden">
                  <div
                    className="bg-black h-full transition-all duration-300"
                    style={{ width: `${drawProgress}%` }}
                  />
                </div>
                <div className="font-mono text-xs mt-2 font-bold">{drawProgress}% Selesai</div>
              </div>
            )}

            {/* Success screen */}
            {drawingState === "completed" && !saveSuccess && (
              <div className="box-neo bg-green text-black p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold font-mono">✅ Drawing Selesai!</h3>
                  <p className="text-xs font-mono mt-1">Grup kualifikasi telah diacak. Silakan simpan hasil ini ke database Supabase.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmSave(true)}
                    className="btn-neo bg-black text-white hover:bg-yellow hover:text-black py-2.5 px-5 font-mono text-xs font-bold cursor-pointer"
                  >
                    💾 Simpan ke Supabase ➔
                  </button>
                  <button
                    onClick={startDrawing}
                    className="btn-neo bg-white text-black hover:bg-gray-100 py-2.5 px-4 font-mono text-xs font-bold cursor-pointer"
                  >
                    🔄 Acak Ulang
                  </button>
                </div>
              </div>
            )}

            {/* Save Confirmation Modal Overlay */}
            {showConfirmSave && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 backdrop-blur-xs">
                <div className="box-neo bg-white text-black p-8 max-w-md w-full font-mono">
                  <h3 className="text-xl font-bold mb-4 text-pink">🚨 PERINGATAN CRITICAL</h3>
                  <p className="text-xs md:text-sm mb-6 leading-relaxed">
                    Menyimpan drawing baru akan <strong>MENGHAPUS SEMUA</strong> data pemain lama, jadwal kualifikasi, skor pertandingan, dan log yang ada saat ini.
                    <br /><br />
                    Sistem juga akan otomatis menghasilkan jadwal pertandingan <strong>Round Robin</strong> baru untuk grup-grup di bawah ini.
                  </p>
                  
                  {saveError && (
                    <div className="p-3 bg-red-100 text-red-700 text-xs font-bold mb-4 border border-red-300">
                      ❌ Gagal: {saveError}
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowConfirmSave(false)}
                      disabled={saving}
                      className="border-2 border-black py-2 px-4 font-bold text-xs cursor-pointer hover:bg-gray-100"
                    >
                      Batal
                    </button>
                    <button
                      onClick={saveToSupabase}
                      disabled={saving}
                      className="bg-green text-black border-2 border-black py-2 px-4 font-bold text-xs cursor-pointer shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                    >
                      {saving ? "Menyimpan..." : "Ya, Reset & Simpan!"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save success screen */}
            {saveSuccess && (
              <div className="box-neo bg-yellow text-black p-6 border-black">
                <h3 className="text-xl font-bold font-mono">🎉 Hasil Drawing Berhasil Disimpan!</h3>
                <p className="text-xs font-mono mt-1 mb-4">
                  Data peserta baru dan jadwal kualifikasi Round Robin telah disinkronisasikan ke Supabase secara live.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="/peserta"
                    className="btn-neo bg-black text-white hover:bg-white hover:text-black py-2 px-4 font-mono text-xs font-bold"
                  >
                    👥 Lihat Peserta
                  </a>
                  <a
                    href="/livescore"
                    className="btn-neo bg-green text-black hover:bg-white py-2 px-4 font-mono text-xs font-bold"
                  >
                    🗓️ Mulai Pertandingan (Live Score)
                  </a>
                  <a
                    href="/standings"
                    className="btn-neo bg-blue text-white hover:bg-white hover:text-black py-2 px-4 font-mono text-xs font-bold"
                  >
                    📈 Lihat Klasemen
                  </a>
                </div>
              </div>
            )}

            {/* Groups Grid Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(["A", "B", "C", "D"].slice(0, groupCount) as GroupName[]).map((gName) => (
                <div key={gName} className="box-neo bg-white text-black overflow-hidden">
                  <div className="bg-black text-white p-3 font-mono font-bold text-xs uppercase tracking-wider">
                    Grup {gName} ({drawnGroups[gName].length} Peserta)
                  </div>
                  <div className="p-4 space-y-2 font-mono text-xs min-h-[150px]">
                    {drawnGroups[gName].length === 0 ? (
                      <div className="text-black/30 text-center py-10 italic">Belum diundi</div>
                    ) : (
                      drawnGroups[gName].map((player, idx) => (
                        <div
                          key={player.id}
                          className="flex justify-between items-center border-b border-black/10 py-1.5"
                        >
                          <div className="font-bold flex items-center gap-2">
                            <span className="text-black/40">{idx + 1}.</span>
                            <span>{player.name}</span>
                          </div>
                          <span className="text-[10px] text-black/50 bg-black/5 px-2 py-0.5 uppercase">
                            {player.type}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
