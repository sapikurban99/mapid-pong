"use client"
import { useState } from "react";

export default function Rules() {
  const [activeTab, setActiveTab] = useState<"singles" | "doubles" | "bracket">("singles");

  return (
    <section id="rules" className="bg-navy py-20 px-6">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Table Ping Pong Styles */
        .ping-pong-table {
            background-color: #2f855a;
            border: 4px solid #000;
            position: relative;
            box-shadow: 6px 6px 0px #000;
            overflow: visible; 
        }
        
        .net {
            position: absolute;
            width: 6px;
            height: 108%;
            background: #000;
            left: 50%;
            top: -4%;
            transform: translateX(-50%);
            z-index: 10;
            border: 1px solid #fff;
        }

        .center-line {
            position: absolute;
            width: 100%;
            height: 2px;
            background: rgba(255,255,255,0.6);
            top: 50%;
            left: 0;
            transform: translateY(-50%);
        }

        /* The Ball */
        .ball {
            width: 12px;
            height: 12px;
            background: #ffd600; /* Yellow */
            border: 2px solid #000;
            border-radius: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
            z-index: 20;
        }

        /* The Players */
        .player {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
            border: 2px solid #000;
            z-index: 15;
            transition: opacity 0.3s;
            font-size: 10px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: monospace;
        }
        
        /* Player Colors */
        .team-left { background-color: #0077ff; } /* Blue 1 */
        .team-left-2 { background-color: #60a5fa; color: #000; } /* Blue 2 */
        .team-right { background-color: #ff2d6f; } /* Pink 1 */
        .team-right-2 { background-color: #f87171; color: #000; } /* Pink 2 */

        /* ================= ANIMATIONS ================= */
        
        /* --- SINGLES --- */
        @keyframes ballSingles {
            0% { left: 0%; top: 20%; }
            25% { left: 100%; top: 80%; }
            50% { left: 0%; top: 60%; }
            75% { left: 100%; top: 30%; }
            100% { left: 0%; top: 20%; }
        }

        @keyframes p1Singles {
            0% { left: -5%; top: 20%; }
            25% { left: -5%; top: 50%; } 
            50% { left: -5%; top: 60%; } 
            75% { left: -5%; top: 40%; } 
            100% { left: -5%; top: 20%; }
        }

        @keyframes p2Singles {
            0% { left: 105%; top: 50%; } 
            25% { left: 105%; top: 80%; } 
            50% { left: 105%; top: 55%; } 
            75% { left: 105%; top: 30%; } 
            100% { left: 105%; top: 50%; }
        }

        /* --- DOUBLES --- */
        @keyframes ballDoubles {
            0% { left: 0%; top: 80%; }
            25% { left: 100%; top: 20%; }
            50% { left: 0%; top: 20%; }
            75% { left: 100%; top: 80%; }
            100% { left: 0%; top: 80%; }
        }

        @keyframes dl1 {
            0% { left: 0; top: 80%; transform: translate(-100%, -50%); opacity: 1; }
            25% { left: -20px; top: 80%; transform: translate(-100%, -50%); opacity: 0.4; }
            50% { left: -20px; top: 80%; transform: translate(-100%, -50%); opacity: 0.4; }
            75% { left: -20px; top: 80%; transform: translate(-100%, -50%); opacity: 0.4; }
            100% { left: 0; top: 80%; transform: translate(-100%, -50%); opacity: 1; }
        }

        @keyframes dr1 {
            0% { left: 100%; top: 20%; transform: translate(20px, -50%); opacity: 0.4; }
            25% { left: 100%; top: 20%; transform: translate(0%, -50%); opacity: 1; }
            50% { left: 100%; top: 20%; transform: translate(20px, -50%); opacity: 0.4; }
            75% { left: 100%; top: 20%; transform: translate(20px, -50%); opacity: 0.4; }
            100% { left: 100%; top: 20%; transform: translate(20px, -50%); opacity: 0.4; }
        }

        @keyframes dl2 {
            0% { left: -20px; top: 20%; transform: translate(-100%, -50%); opacity: 0.4; }
            25% { left: -20px; top: 20%; transform: translate(-100%, -50%); opacity: 0.4; }
            50% { left: 0; top: 20%; transform: translate(-100%, -50%); opacity: 1; }
            75% { left: -20px; top: 20%; transform: translate(-100%, -50%); opacity: 0.4; }
            100% { left: -20px; top: 20%; transform: translate(-100%, -50%); opacity: 0.4; }
        }

        @keyframes dr2 {
            0% { left: 100%; top: 80%; transform: translate(20px, -50%); opacity: 0.4; }
            25% { left: 100%; top: 80%; transform: translate(20px, -50%); opacity: 0.4; }
            50% { left: 100%; top: 80%; transform: translate(20px, -50%); opacity: 0.4; }
            75% { left: 100%; top: 80%; transform: translate(0%, -50%); opacity: 1; }
            100% { left: 100%; top: 80%; transform: translate(20px, -50%); opacity: 0.4; }
        }

        /* Class Assignments */
        .anim-ball-singles { animation: ballSingles 3s infinite linear; }
        .anim-p1-singles { animation: p1Singles 3s infinite linear; }
        .anim-p2-singles { animation: p2Singles 3s infinite linear; }

        .anim-ball-doubles { animation: ballDoubles 4s infinite linear; }
        .anim-dl1 { animation: dl1 4s infinite linear; }
        .anim-dl2 { animation: dl2 4s infinite linear; }
        .anim-dr1 { animation: dr1 4s infinite linear; }
        .anim-dr2 { animation: dr2 4s infinite linear; }
      ` }} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] font-mono text-xs font-bold uppercase tracking-wider bg-blue text-white mb-4">
            Game Rules
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white font-sans">Regulasi Turnamen</h2>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex border-b-3 border-black mb-8">
          {(["singles", "doubles", "bracket"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center font-mono text-xs md:text-sm font-bold uppercase border-t-3 border-x-3 border-black -mb-[3px] transition-all rounded-none cursor-pointer ${activeTab === tab ? "bg-white text-black border-b-3 border-b-white" : "bg-white/5 text-white/60 border-b-3 border-b-black"
                }`}
            >
              {tab === "singles" ? "👤 Singles" : tab === "doubles" ? "👥 Doubles" : "🏆 Bracket"}
            </button>
          ))}
        </div>

        {/* Live Animation Board */}
        {activeTab !== "bracket" && (
          <div className="box-neo bg-white text-black p-8 flex flex-col items-center mb-8 border-3 border-black">
            <div className="ping-pong-table w-full max-w-sm md:max-w-md aspect-[2/1] rounded-sm">
              {/* Lines & Net */}
              <div className="center-line"></div>
              <div className="net"></div>
              
              {/* The Ball */}
              <div
                className={`ball ${activeTab === "singles" ? "anim-ball-singles" : "anim-ball-doubles"}`}
              />

              {/* Players (Left Side / Blue) */}
              <div
                className={`player team-left ${activeTab === "singles" ? "anim-p1-singles" : "anim-dl1"}`}
              >
                1
              </div>
              {activeTab === "doubles" && (
                <div className="player team-left-2 anim-dl2">2</div>
              )}
              
              {/* Players (Right Side / Pink) */}
              <div
                className={`player team-right ${activeTab === "singles" ? "anim-p2-singles" : "anim-dr1"}`}
              >
                1
              </div>
              {activeTab === "doubles" && (
                <div className="player team-right-2 anim-dr2">2</div>
              )}
            </div>
            
            <p className="mt-6 font-mono text-xs text-center text-black/60 font-bold uppercase tracking-wider">
              {activeTab === "singles"
                ? "🟢 Visualisasi: 1 Lawan 1 (Area Pukulan Bebas)"
                : "🔄 Visualisasi: Servis Diagonal Dilanjut Rotasi Tukeran Pemain (Rally)"}
            </p>
          </div>
        )}

        {/* Tab Contents View */}
        <div className="box-neo bg-white text-black p-6 md:p-10">
          {activeTab === "singles" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-blue uppercase border-b-2 border-black pb-2">Aturan Tunggal (Singles)</h3>
              <ol className="list-decimal pl-5 space-y-4 font-medium">
                <li><strong className="text-black">Sistem Skor:</strong> Game dimainkan hingga 11 poin mendahului. Jika terjadi deuce pada 10-10, pemenang harus unggul selisih 2 poin.</li>
                <li><strong className="text-black">Servis Bergantian:</strong> Hak servis berpindah otomatis setiap kelipatan 2 poin. Saat deuce, servis bergantian tiap 1 poin.</li>
                <li><strong className="text-black">Fleksibilitas Arah:</strong> Servis dan pengembalian bebas diarahkan ke area manapun pada meja lawan (tidak terikat diagonal).</li>
              </ol>
            </div>
          )}

          {activeTab === "doubles" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-green uppercase border-b-2 border-black pb-2">Aturan Ganda (Doubles)</h3>
              <ol className="list-decimal pl-5 space-y-4 font-medium">
                <li><strong className="text-black">Wajib Diagonal:</strong> Servis mutlak dilakukan menyilang dari kotak kanan server ke kotak kanan wilayah penerima lawan.</li>
                <li><strong className="text-black">Pukulan Sekuensial:</strong> Anggota tim wajib memukul bola bergantian secara estafet (Player A ➔ Enemy A ➔ Player B ➔ Enemy B).</li>
                <li><strong className="text-black">Rotasi Posisi:</strong> Setelah mendapatkan 2 poin servis, penerima servis sebelumnya akan naik menjadi server baru.</li>
              </ol>
            </div>
          )}

          {activeTab === "bracket" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-pink uppercase border-b-2 border-black pb-2">Double Elimination System</h3>
              <ol className="list-decimal pl-5 space-y-4 font-medium">
                <li><strong className="text-black">Penyaringan Kualifikasi:</strong> Peringkat 1 & 2 dari masing-masing grup Round Robin otomatis mengamankan slot ke Knockout.</li>
                <li><strong className="text-black">Jalur Penyelamatan LB:</strong> Kontestan yang gugur pertama kali di Upper Bracket diturunkan ke Lower Bracket untuk kesempatan kedua.</li>
                <li><strong className="text-black">Grand Final Reset:</strong> Jika Juara dari Lower Bracket mengalahkan Juara Upper Bracket di final, laga ulang (*Bracket Reset*) wajib digelar.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}