import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  participantCount: number;
  singlesCount: number;
  doublesCount: number;
  liveMatchCount: number;
}

export default function Hero({ participantCount, singlesCount, doublesCount, liveMatchCount }: HeroProps) {
  return (
    <section id="home" className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center p-6 bg-navy overflow-hidden z-10">
      {/* Background Gradient Decorative Neo Brutalism Mesh */}
      <div className="absolute inset-0 -z-10 opacity-30 mix-blend-screen bg-[radial-gradient(ellipse_at_center,rgba(0,119,255,0.2)_0%,transparent_60%),radial-gradient(ellipse_at_30%_50%,rgba(255,45,111,0.15)_0%,transparent_50%)] animate-pulse" />

      {/* Prominent Logo Image */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 shrink-0 transition-transform hover:scale-105 duration-300">
        <Image
          src="/logo.png"
          alt="TOYO SENSING PING PONG TOURNAMENT"
          fill
          sizes="(max-width: 768px) 256px, 320px"
          className="object-contain filter drop-shadow-[5px_5px_0px_#000]"
          priority
        />
      </div>

      <p className="text-lg md:text-xl text-white/80 font-mono font-medium max-w-2xl mb-10 tracking-tight leading-relaxed">
        Turnamen Ping Pong Internal TOYO SENSING — Kategori Singles & Doubles, Klasemen Grup Kualifikasi hingga Double Elimination Knockout!
      </p>

      <div className="flex flex-wrap gap-4 justify-center max-w-xl">
        <Link href="/peserta" className="btn-neo bg-yellow text-black font-mono font-bold px-6 py-3 uppercase text-xs sm:text-sm">Lihat Peserta</Link>
        <Link href="/standings" className="btn-neo bg-blue text-white font-mono font-bold px-6 py-3 uppercase text-xs sm:text-sm">Klasemen</Link>
        <Link href="/bracket" className="btn-neo bg-green text-black font-mono font-bold px-6 py-3 uppercase text-xs sm:text-sm">Bracket</Link>
        <Link href="/rules" className="btn-neo bg-transparent text-white border-white font-mono font-bold px-6 py-3 uppercase text-xs sm:text-sm">Baca Aturan</Link>
      </div>

      {/* Grid Statistik Dashboard */}
      <div className="flex flex-wrap justify-center gap-10 mt-16 max-w-4xl w-full">
        <div className="text-center min-w-[100px]">
          <div className="text-4xl md:text-5xl font-bold font-mono text-blue">{participantCount}</div>
          <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase mt-1">Total Peserta</div>
        </div>
        <div className="text-center min-w-[100px]">
          <div className="text-4xl md:text-5xl font-bold font-mono text-pink">{singlesCount}</div>
          <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase mt-1">Singles</div>
        </div>
        <div className="text-center min-w-[100px]">
          <div className="text-4xl md:text-5xl font-bold font-mono text-blue">{doublesCount}</div>
          <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase mt-1">Doubles</div>
        </div>
        <div className="text-center min-w-[100px]">
          <div className="text-4xl md:text-5xl font-bold font-mono text-green">{liveMatchCount}</div>
          <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase mt-1">Live Match</div>
        </div>
      </div>
    </section>
  );
}
