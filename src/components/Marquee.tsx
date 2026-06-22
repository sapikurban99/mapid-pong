export default function Marquee() {
  return (
    <div className="w-full bg-pink border-y-3 border-black py-2.5 overflow-hidden select-none flex">
      <div className="animate-marquee whitespace-nowrap flex gap-8 font-mono text-xs font-bold text-black uppercase tracking-widest">
        {Array(10).fill("🏓 MAPID PONG TOURNAMENT 2026 — LIVE SCORE MODE ACTIVE — HIT THE BALL HARD — NO MERCY").map((text, idx) => (
          <span key={idx}>{text}</span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}