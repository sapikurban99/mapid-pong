import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black border-t-3 border-black py-12 px-6 text-center">
      <div className="text-xl font-bold font-mono tracking-tight text-white mb-2">
        🏓 TOYO SENSING PING PONG TOURNAMENT 2026
      </div>
      <div className="font-mono text-xs text-white/40 mb-6">
        Sponsored by — <a href="https://toyo-sensing.co.id" target="_blank" rel="noreferrer" className="text-yellow hover:underline">toyo-sensing.co.id</a>
      </div>
      <div className="flex flex-wrap justify-center gap-6 font-mono text-xs">
        <Link href="/" className="text-white/60 hover:text-yellow">Home</Link>
        <Link href="/info" className="text-white/60 hover:text-yellow">Info</Link>
        <Link href="/livescore" className="text-white/60 hover:text-yellow">Live Score</Link>
        <Link href="/rules" className="text-white/60 hover:text-yellow">Aturan</Link>
        <Link href="/peserta" className="text-white/60 hover:text-yellow">Peserta</Link>
        <Link href="/standings" className="text-white/60 hover:text-yellow">Klasemen</Link>
        <Link href="/bracket" className="text-white/60 hover:text-yellow">Bracket</Link>
        <Link href="/drawing" className="text-white/60 hover:text-yellow">Live Drawing</Link>
      </div>
    </footer>
  );
}