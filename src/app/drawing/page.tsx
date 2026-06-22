"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Player } from "@/lib/api";

type GroupName = "A" | "B" | "C" | "D";
type DrawPhase = "config" | "assign";
type DrawnPlayer = {
  id: string;
  name: string;
  wa: string;
  group_name: GroupName;
  type: "singles" | "doubles";
};
type DbPlayer = { id: string; name: string; wa: string | null; group_name: string | null; type: string };

export default function LiveDrawingPage() {
  // Data
  const [registrants, setRegistrants] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Config
  const [type, setType] = useState<"singles" | "doubles">("singles");
  const [groupCount, setGroupCount] = useState(4);
  const [startDate, setStartDate] = useState("2026-07-06");
  const [endDate, setEndDate] = useState("2026-07-17");
  const [skipWeekends, setSkipWeekends] = useState(true);

  // Phase
  const [phase, setPhase] = useState<DrawPhase>("config");

  // Existing data from DB
  const [existingSingles, setExistingSingles] = useState<DrawnPlayer[]>([]);
  const [existingDoubles, setExistingDoubles] = useState<DrawnPlayer[]>([]);

  // Assign state
  const [unassigned, setUnassigned] = useState<DrawnPlayer[]>([]);
  const [groups, setGroups] = useState<Record<GroupName, DrawnPlayer[]>>({
    A: [], B: [], C: [], D: []
  });

  // Save
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const activeGroups = (["A", "B", "C", "D"] as GroupName[]).slice(0, groupCount);

  // Load existing data from Supabase
  async function loadExisting() {
    try {
      const { data: players } = await supabase
        .from("mapidpong_players")
        .select("id, name, wa, group_name, type")
        .order("group_name");

      const playerRows = (players || []) as DbPlayer[];

      const singles = playerRows
        .filter(p => p.type === "singles" && p.group_name)
        .map(p => ({
          id: p.id,
          name: p.name,
          wa: p.wa || "",
          group_name: p.group_name as GroupName,
          type: "singles" as const
        }));

      const doubles = playerRows
        .filter(p => p.type === "doubles" && p.group_name)
        .map(p => ({
          id: p.id,
          name: p.name,
          wa: p.wa || "",
          group_name: p.group_name as GroupName,
          type: "doubles" as const
        }));

      setExistingSingles(singles);
      setExistingDoubles(doubles);
    } catch (err) {
      console.error("Gagal memuat data existing:", err);
    }
  }

  useEffect(() => {
    loadExisting();
  }, []);

  // Load registrants from API
  useEffect(() => {
    async function fetchRegistrants() {
      try {
        const res = await fetch("/api/players");
        if (!res.ok) throw new Error("Gagal mengambil data dari API.");
        const data: Player[] = await res.json();
        setRegistrants(data);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memuat pendaftar.");
      } finally {
        setLoading(false);
      }
    }
    fetchRegistrants();
  }, []);

  const getExistingForType = () => type === "singles" ? existingSingles : existingDoubles;

  // Enter assign phase
  const startAssign = () => {
    const existing = getExistingForType();
    if (existing.length > 0) {
      if (!confirm(`Data ${type} sudah ada. Ingin redraw? Data lama akan dihapus saat save.`)) {
        return;
      }
    }
    setGroups({ A: [], B: [], C: [], D: [] });
    setUnassigned([]);
    setSaveSuccess(false);
    setSaveError(null);
    setPhase("assign");
  };

  // Add registrants to unassigned pool
  const addToPool = (players: Player[]) => {
    const existingIds = new Set([
      ...unassigned.map(p => p.id),
      ...Object.values(groups).flat().map(p => p.id)
    ]);
    const existingForType = getExistingForType();
    const existingNames = new Set(existingForType.map(p => p.name));

    const newPlayers: DrawnPlayer[] = players
      .filter(p => !existingIds.has(p.id) && !existingNames.has(p.name))
      .map(p => ({
        id: p.id,
        name: p.name,
        wa: p.wa,
        group_name: "A" as GroupName,
        type
      }));

    setUnassigned(prev => [...prev, ...newPlayers]);
  };

  const removeFromPool = (id: string) => {
    setUnassigned(prev => prev.filter(p => p.id !== id));
  };

  // Assign player to group (singles)
  const assignToGroup = (player: DrawnPlayer, group: GroupName) => {
    setUnassigned(prev => prev.filter(p => p.id !== player.id));
    setGroups(prev => ({
      ...prev,
      [group]: [...prev[group], { ...player, group_name: group }]
    }));
  };

  // Move player between groups
  const moveToGroup = (player: DrawnPlayer, fromGroup: GroupName, toGroup: GroupName) => {
    if (fromGroup === toGroup) return;
    setGroups(prev => ({
      ...prev,
      [fromGroup]: prev[fromGroup].filter(p => p.id !== player.id),
      [toGroup]: [...prev[toGroup], { ...player, group_name: toGroup }]
    }));
  };

  // Remove player from group back to pool
  const removeFromGroup = (player: DrawnPlayer, fromGroup: GroupName) => {
    setGroups(prev => ({
      ...prev,
      [fromGroup]: prev[fromGroup].filter(p => p.id !== player.id)
    }));
    setUnassigned(prev => [...prev, { ...player, group_name: "A" }]);
  };

  // Doubles: create pair from unassigned players
  const createPair = (id1: string, id2: string) => {
    const p1 = unassigned.find(p => p.id === id1);
    const p2 = unassigned.find(p => p.id === id2);
    if (!p1 || !p2 || id1 === id2) return;

    const pair: DrawnPlayer = {
      id: `${id1}-${id2}`,
      name: `${p1.name} & ${p2.name}`,
      wa: `${p1.wa} / ${p2.wa}`,
      group_name: "A",
      type: "doubles"
    };

    setUnassigned(prev => prev.filter(p => p.id !== id1 && p.id !== id2));
    // Add pair to unassigned pool
    setUnassigned(prev => [...prev, pair]);
  };

  // Save to Supabase
  const saveToSupabase = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const allGrouped = Object.values(groups).flat();
      if (allGrouped.length === 0) {
        throw new Error("Tidak ada peserta yang diassign ke grup.");
      }

      // Generate matches (round-robin within each group)
      const matchesToInsert: any[] = [];
      activeGroups.forEach(gName => {
        const groupPlayers = groups[gName];
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

      const playersToInsert = allGrouped.map(p => ({
        id: p.id.includes("-") ? undefined : p.id,
        name: p.name,
        wa: p.wa,
        group_name: p.group_name,
        type: p.type
      }));

      const res = await fetch("/api/drawing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: playersToInsert,
          matches: matchesToInsert,
          type,
          startDate,
          endDate,
          skipWeekends
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan hasil drawing");
      }

      setSaveSuccess(true);
      await loadExisting();
    } catch (err: any) {
      setSaveError(err.message || "Gagal menyimpan hasil drawing ke server.");
    } finally {
      setSaving(false);
    }
  };

  // Reset only this type
  const resetType = async () => {
    if (!confirm(`Hapus semua data ${type}? Data ${type === "singles" ? "doubles" : "singles"} tetap tersimpan.`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/drawing/reset-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal reset");
      }
      alert(`Data ${type} berhasil dihapus!`);
      await loadExisting();
      setPhase("config");
      setGroups({ A: [], B: [], C: [], D: [] });
      setUnassigned([]);
    } catch (err: any) {
      alert("Gagal reset: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset everything
  const resetAll = async () => {
    if (!confirm("RESET SEMUA DATA? Ini akan menghapus semua pemain, jadwal, skor, dan log secara permanen!")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/drawing/reset", { method: "POST" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal reset");
      }
      alert("Database berhasil di-reset!");
      await loadExisting();
      setPhase("config");
      setGroups({ A: [], B: [], C: [], D: [] });
      setUnassigned([]);
    } catch (err: any) {
      alert("Gagal reset: " + err.message);
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
          <Link href="/" className="btn-neo bg-black text-white hover:bg-yellow hover:text-black py-2 px-4 inline-block">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] font-mono text-xs font-bold uppercase tracking-wider bg-pink text-white mb-4">
            Admin Panel
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Live Drawing Turnamen</h1>
          <p className="font-mono text-xs md:text-sm text-white/60 mt-3">
            Assign pemain ke grup secara manual. Singles dan doubles diundi terpisah.
          </p>
        </div>

        {/* Existing Status Bar */}
        <div className="box-neo bg-white text-black p-4 mb-8 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="font-bold">Singles:</span>{" "}
                <span className={existingSingles.length > 0 ? "text-green font-bold" : "text-black/40"}>
                  {existingSingles.length > 0 ? `${existingSingles.length} pemain` : "Belum diundi"}
                </span>
              </div>
              <div>
                <span className="font-bold">Doubles:</span>{" "}
                <span className={existingDoubles.length > 0 ? "text-green font-bold" : "text-black/40"}>
                  {existingDoubles.length > 0 ? `${existingDoubles.length} pasangan` : "Belum diundi"}
                </span>
              </div>
            </div>
            <button
              onClick={resetAll}
              disabled={saving}
              className="btn-neo bg-pink text-white py-1.5 px-3 font-bold text-[10px] cursor-pointer"
            >
              ⚠️ RESET SEMUA
            </button>
          </div>
        </div>

        {/* ==================== CONFIG PHASE ==================== */}
        {phase === "config" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Config Panel */}
            <div className="lg:col-span-1">
              <div className="box-neo bg-white text-black p-6">
                <h3 className="font-mono text-base font-bold border-b-2 border-black pb-2 mb-4">⚙️ Konfigurasi Drawing</h3>
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="block font-bold mb-1">Kategori Turnamen:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setType("singles")}
                        className={`flex-1 py-2 font-bold border-2 border-black cursor-pointer ${type === "singles" ? "bg-pink text-white" : "bg-gray-100 text-black"}`}
                      >
                        👤 Singles
                      </button>
                      <button
                        onClick={() => setType("doubles")}
                        className={`flex-1 py-2 font-bold border-2 border-black cursor-pointer ${type === "doubles" ? "bg-blue text-white" : "bg-gray-100 text-black"}`}
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
                      className="w-full p-2 border-2 border-black bg-white font-bold cursor-pointer"
                    >
                      <option value={2}>2 Grup (A, B)</option>
                      <option value={3}>3 Grup (A, B, C)</option>
                      <option value={4}>4 Grup (A, B, C, D)</option>
                    </select>
                  </div>

                  <div className="border-t-2 border-black/10 pt-3 space-y-3">
                    <h4 className="font-bold uppercase tracking-wider text-[10px] text-pink">📅 Pengaturan Jadwal</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-1 text-[10px]">Tgl Mulai:</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                          className="w-full p-1.5 border-2 border-black bg-white font-mono text-[10px] font-bold" />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px]">Tgl Selesai:</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-1.5 border-2 border-black bg-white font-mono text-[10px] font-bold" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px]">
                      <input type="checkbox" checked={skipWeekends} onChange={(e) => setSkipWeekends(e.target.checked)}
                        className="accent-black cursor-pointer" />
                      <span className="font-bold">Lewati Akhir Pekan</span>
                    </label>
                  </div>

                  <button onClick={startAssign}
                    className="w-full btn-neo bg-green text-black hover:bg-yellow hover:text-black py-3 font-bold text-sm tracking-wider cursor-pointer">
                    ✋ MULAI ASSIGN MANUAL
                  </button>

                  <button onClick={resetType} disabled={saving}
                    className="w-full btn-neo bg-pink text-white py-2.5 font-bold text-xs tracking-wider cursor-pointer">
                    ⚠️ Hapus Data {type === "singles" ? "Singles" : "Doubles"}
                  </button>
                </div>
              </div>
            </div>

            {/* Existing data preview */}
            <div className="lg:col-span-2">
              <div className="box-neo bg-white text-black p-6">
                <h3 className="font-mono text-base font-bold border-b-2 border-black pb-2 mb-4">
                  📊 Data {type === "singles" ? "Singles" : "Doubles"} Saat Ini
                </h3>
                {getExistingForType().length === 0 ? (
                  <div className="text-center py-12 text-black/30 font-mono text-sm">
                    Belum ada data {type}. Klik &quot;Mulai Assign Manual&quot; untuk memulai.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {activeGroups.map(gName => {
                      const groupPlayers = getExistingForType().filter(p => p.group_name === gName);
                      return (
                        <div key={gName} className="border-2 border-black/10 p-3">
                          <div className="font-bold text-xs mb-2 uppercase">Grup {gName} ({groupPlayers.length})</div>
                          <div className="space-y-1">
                            {groupPlayers.map(p => (
                              <div key={p.id} className="text-[10px] truncate">{p.name}</div>
                            ))}
                            {groupPlayers.length === 0 && (
                              <div className="text-[10px] text-black/30 italic">Kosong</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ASSIGN PHASE ==================== */}
        {phase === "assign" && (
          <div className="space-y-6">
            {/* Back + Save Bar */}
            <div className="box-neo bg-white text-black p-4 font-mono text-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button onClick={() => setPhase("config")}
                  className="btn-neo bg-gray-100 text-black py-2 px-4 font-bold cursor-pointer">
                  ← Kembali
                </button>
                <div className="font-bold">
                  Mode: <span className={type === "singles" ? "text-pink" : "text-blue"}>
                    {type === "singles" ? "👤 Singles" : "👥 Doubles"}
                  </span>
                </div>
                <div>
                  Diassign: {Object.values(groups).flat().length} | Belum: {unassigned.length}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveToSupabase} disabled={saving || Object.values(groups).flat().length === 0}
                  className="btn-neo bg-green text-black hover:bg-yellow py-2.5 px-5 font-bold cursor-pointer disabled:opacity-50">
                  {saving ? "Menyimpan..." : "💾 Simpan ke Supabase"}
                </button>
              </div>
            </div>

            {saveSuccess && (
              <div className="box-neo bg-green text-black p-4 font-mono text-xs font-bold">
                ✅ Berhasil disimpan! <a href="/livescore" className="underline ml-2">Lihat Live Score →</a>
              </div>
            )}
            {saveError && (
              <div className="box-neo bg-pink text-white p-4 font-mono text-xs font-bold">
                ❌ {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Player Pool */}
              <div className="lg:col-span-3 space-y-4">
                <div className="box-neo bg-white text-black p-4">
                  <h3 className="font-mono text-sm font-bold border-b-2 border-black pb-2 mb-3">📋 Pendaftar</h3>
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => addToPool(registrants)}
                      className="flex-1 bg-green text-black border-2 border-black py-1.5 text-[10px] font-bold cursor-pointer hover:bg-yellow">
                      + Tambah Semua
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto space-y-1">
                    {registrants.length === 0 ? (
                      <div className="text-xs text-black/30 py-4 text-center">Tidak ada pendaftar</div>
                    ) : (
                      registrants.map(p => {
                        const isAssigned = unassigned.some(u => u.id === p.id) ||
                          Object.values(groups).flat().some(g => g.name === p.name);
                        return (
                          <div key={p.id}
                            className={`flex items-center justify-between p-2 text-[10px] border border-black/10 ${
                              isAssigned ? "bg-green/10 opacity-50" : "hover:bg-yellow/10"
                            }`}>
                            <span className="font-bold truncate">{p.name}</span>
                            {!isAssigned && (
                              <button onClick={() => addToPool([p])}
                                className="bg-black text-white px-2 py-0.5 text-[9px] font-bold cursor-pointer hover:bg-green">
                                +Ambil
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Unassigned Pool */}
                <div className="box-neo bg-yellow text-black p-4">
                  <h3 className="font-mono text-sm font-bold border-b-2 border-black pb-2 mb-3">
                    🎯 Belum Diassign ({unassigned.length})
                  </h3>
                  <div className="max-h-[300px] overflow-y-auto space-y-1">
                    {unassigned.length === 0 ? (
                      <div className="text-xs text-black/30 py-4 text-center">Klik &quot;+Ambil&quot; dari pendaftar</div>
                    ) : (
                      unassigned.map(p => (
                        <div key={p.id}
                          className="flex items-center justify-between p-2 bg-white border-2 border-black text-[10px]">
                          <span className="font-bold truncate">{p.name}</span>
                          <button onClick={() => removeFromPool(p.id)}
                            className="text-pink font-bold cursor-pointer text-[9px]">✕</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Doubles Pairing (only visible in doubles mode) */}
                {type === "doubles" && unassigned.length >= 2 && (
                  <div className="box-neo bg-blue text-white p-4">
                    <h3 className="font-mono text-sm font-bold border-b-2 border-white/20 pb-2 mb-3">
                      👥 Buat Pasangan
                    </h3>
                    <DoublesPairing
                      unassigned={unassigned}
                      onCreatePair={createPair}
                    />
                  </div>
                )}
              </div>

              {/* Right: Group Buckets */}
              <div className="lg:col-span-9">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activeGroups.map(gName => (
                    <GroupBucket
                      key={gName}
                      group={groups[gName]}
                      groupName={gName}
                      activeGroups={activeGroups}
                      type={type}
                      onAssign={assignToGroup}
                      onMove={moveToGroup}
                      onRemove={removeFromGroup}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== SUB COMPONENTS ====================

function DoublesPairing({
  unassigned,
  onCreatePair
}: {
  unassigned: DrawnPlayer[];
  onCreatePair: (id1: string, id2: string) => void;
}) {
  const [sel1, setSel1] = useState<string>("");
  const [sel2, setSel2] = useState<string>("");

  const handleCreate = () => {
    if (sel1 && sel2 && sel1 !== sel2) {
      onCreatePair(sel1, sel2);
      setSel1("");
      setSel2("");
    }
  };

  return (
    <div className="space-y-2 font-mono text-[10px]">
      <select value={sel1} onChange={e => setSel1(e.target.value)}
        className="w-full p-1.5 border-2 border-black bg-white text-black font-bold">
        <option value="">-- Pilih Pemain 1 --</option>
        {unassigned.filter(p => !p.id.includes("-")).map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <div className="text-center text-white/50 font-bold">&amp;</div>
      <select value={sel2} onChange={e => setSel2(e.target.value)}
        className="w-full p-1.5 border-2 border-black bg-white text-black font-bold">
        <option value="">-- Pilih Pemain 2 --</option>
        {unassigned.filter(p => !p.id.includes("-") && p.id !== sel1).map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <button onClick={handleCreate} disabled={!sel1 || !sel2 || sel1 === sel2}
        className="w-full bg-black text-white py-2 font-bold cursor-pointer hover:bg-yellow hover:text-black disabled:opacity-50">
        + Buat Pasangan
      </button>
    </div>
  );
}

function GroupBucket({
  group,
  groupName,
  activeGroups,
  type,
  onAssign,
  onMove,
  onRemove
}: {
  group: DrawnPlayer[];
  groupName: GroupName;
  activeGroups: GroupName[];
  type: "singles" | "doubles";
  onAssign: (player: DrawnPlayer, group: GroupName) => void;
  onMove: (player: DrawnPlayer, from: GroupName, to: GroupName) => void;
  onRemove: (player: DrawnPlayer, from: GroupName) => void;
}) {
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);

  return (
    <div className="box-neo bg-white text-black overflow-hidden">
      <div className="bg-black text-white p-3 font-mono font-bold text-xs uppercase tracking-wider flex justify-between items-center">
        <span>Grup {groupName}</span>
        <span className="text-[10px] bg-yellow text-black px-2 py-0.5">{group.length}</span>
      </div>
      <div className="p-3 space-y-2 min-h-[200px] font-mono text-xs">
        {group.length === 0 ? (
          <div className="text-black/20 text-center py-10 italic text-[10px]">
            Klik pemain dari pool untuk assign ke sini
          </div>
        ) : (
          group.map((player, idx) => (
            <div key={player.id} className="relative">
              <div className="flex items-center justify-between border-b border-black/10 py-1.5">
                <div className="font-bold flex items-center gap-1">
                  <span className="text-black/40">{idx + 1}.</span>
                  <span className="truncate">{player.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {activeGroups.length > 1 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowMoveMenu(showMoveMenu === player.id ? null : player.id)}
                        className="text-[9px] bg-blue text-white px-1.5 py-0.5 font-bold cursor-pointer"
                      >
                        ↕
                      </button>
                      {showMoveMenu === player.id && (
                        <div className="absolute right-0 top-6 z-10 bg-white border-2 border-black shadow-md p-1 min-w-[80px]">
                          {activeGroups.filter(g => g !== groupName).map(g => (
                            <button key={g}
                              onClick={() => { onMove(player, groupName, g); setShowMoveMenu(null); }}
                              className="block w-full text-left px-2 py-1 text-[9px] hover:bg-yellow font-bold cursor-pointer">
                              → Grup {g}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => onRemove(player, groupName)}
                    className="text-pink font-bold cursor-pointer text-[9px] px-1">✕</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
