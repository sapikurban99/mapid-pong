export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Link from "next/link";

export default async function HomeDashboard() {
  // Fetch stats on the server — no loading spinner needed
  let playersCount = 0;
  let liveMatchesCount = 0;

  try {
    const [playersRes, matchesRes] = await Promise.all([
      supabase.from("mapidpong_players").select("id", { count: "exact", head: true }),
      api.getMatches()
    ]);

    playersCount = playersRes.count || 0;
    liveMatchesCount = matchesRes.filter(m => m.status === "live").length;
  } catch (err) {
    console.error("Error loading dashboard stats:", err);
  }

  const menuItems = [
    {
      title: "🔴 Live Score",
      description: "Pantau jalannya pertandingan secara langsung dengan pembaruan realtime.",
      href: "/livescore",
      bgClass: "bg-pink text-white border-black",
      btnText: "Buka Scoreboard"
    },
    {
      title: "📊 Klasemen Sementara",
      description: "Lihat peringkat, poin, dan statistik kemenangan dari setiap grup kualifikasi.",
      href: "/standings",
      bgClass: "bg-yellow text-black border-black",
      btnText: "Buka Klasemen"
    },
    {
      title: "👥 Peserta Turnamen",
      description: "Lihat daftar kontestan resmi singles & doubles yang siap berlaga di turnamen.",
      href: "/peserta",
      bgClass: "bg-green text-black border-black",
      btnText: "Lihat Peserta"
    },
    {
      title: "🏆 Bracket Turnamen",
      description: "Jalur knockout Double Elimination, dari semifinal hingga grand final reset.",
      href: "/bracket",
      bgClass: "bg-blue text-white border-black",
      btnText: "Buka Bracket"
    },
    {
      title: "📢 Tournament Info",
      description: "Informasi detail mengenai lokasi pertandingan, timeline, dan fasilitas meja.",
      href: "/info",
      bgClass: "bg-white text-black border-black",
      btnText: "Lihat Info"
    },
    {
      title: "📝 Regulasi & Aturan",
      description: "Aturan bermain singles diagonal ganda, servis deuce, dan skema bracket.",
      href: "/rules",
      bgClass: "bg-dark-blue text-white border-white/20",
      btnText: "Lihat Regulasi"
    },
    {
      title: "🎲 Live Drawing",
      description: "Halaman khusus admin untuk mengundi grup pendaftar Mapid secara live.",
      href: "/drawing",
      bgClass: "bg-pink text-white border-black",
      btnText: "Mulai Undian"
    }
  ];

  return (
    <>
      <Hero participantCount={playersCount} liveMatchCount={liveMatchesCount} />
      <Marquee />

      {/* Central Navigation Dashboard */}
      <section className="bg-dark-blue py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] font-mono text-xs font-bold uppercase tracking-wider bg-green text-black mb-4">
              Pintu Masuk Turnamen
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-sans">Dashboard Navigasi</h2>
            <p className="font-mono text-xs md:text-sm text-white/60 mt-3 max-w-lg mx-auto">
              Pilih menu di bawah ini untuk melihat detail informasi, livescore realtime, klasemen, atau bagan gugur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                className={`box-neo p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 ${item.bgClass}`}
              >
                <div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-xs md:text-sm font-medium mb-6 leading-relaxed opacity-90">
                    {item.description}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="btn-neo bg-black text-white hover:bg-yellow hover:text-black text-xs font-mono font-bold py-2.5 px-4 text-center block"
                >
                  {item.btnText} ➔
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}