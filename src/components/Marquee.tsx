export default function Marquee() {
  return (
    <div className="w-full bg-pink border-y-3 border-black py-2.5 overflow-hidden select-none flex">
      <div className="marquee-scroll whitespace-nowrap flex gap-8 font-mono text-xs font-bold text-black uppercase tracking-widest">
        {Array(10).fill("🏓 MAPID PONG TOURNAMENT 2026 — LIVE SCORE MODE ACTIVE — HIT THE BALL HARD — NO MERCY").map((text, idx) => (
          <span key={idx}>{text}</span>
        ))}
      </div>
    </div>
  );
}