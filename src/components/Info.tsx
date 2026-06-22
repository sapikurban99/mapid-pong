export default function Info() {
  const cards = [
    { icon: "📍", title: "Lokasi", bg: "bg-yellow", items: ["MAPID Parking Lot Court", "Outdoor ping pong setup", "Meja standar turnamen internasional"] },
    { icon: "👤", title: "Singles Kualifikasi", bg: "bg-green", items: ["1 Lawan 1", "15 Peserta Terdaftar", "4 Grup Terpisah", "Top 2 Melaju ke Knockout"] },
    { icon: "👥", title: "Doubles Kualifikasi", bg: "bg-blue", items: ["2 Lawan 2", "8 Tim Utama", "2 Grup Kombinasi", "Saling Bertukar Pukulan"] },
    { icon: "🏆", title: "Format Turnamen", bg: "bg-pink", items: ["Fase 1: Group Stage Robin", "Fase 2: Double Elimination", "Sistem Upper & Lower Bracket", "Grand Final Reset Bracket"] },
  ];

  return (
    <section id="info" className="bg-dark-blue py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] font-mono text-xs font-bold uppercase tracking-wider bg-pink text-white mb-4">
            Tournament Info
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Informasi Turnamen</h2>
        </div>

        {/* Timeline Flow */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-16">
          <div className="box-neo bg-blue p-6 text-center w-full md:w-64">
            <span className="font-mono text-xs font-bold text-white/80 block mb-1 uppercase">Juli 2026</span>
            <h4 className="text-xl font-bold">Babak Kualifikasi</h4>
            <p className="text-xs mt-1 text-white/70">Group Stage Round Robin</p>
          </div>
          <div className="text-2xl text-white/30 hidden md:block">➔</div>
          <div className="box-neo bg-green text-black p-6 text-center w-full md:w-64">
            <span className="font-mono text-xs font-bold text-black/80 block mb-1 uppercase">Agustus 2026</span>
            <h4 className="text-xl font-bold">Knockout Phase</h4>
            <p className="text-xs mt-1 text-black/70">Upper & Lower Bracket Elimination</p>
          </div>
        </div>

        {/* Cards Grid Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <div key={i} className="box-neo bg-white text-black p-8 flex flex-col">
              <div className={`w-14 h-14 border-3 border-black flex items-center justify-center text-2xl ${c.bg} mb-6`}>
                {c.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{c.title}</h3>
              <ul className="space-y-2 text-sm text-black/80 list-none pl-0">
                {c.items.map((item, idx) => (
                  <li key={idx} className="before:content-['•'] before:mr-2 before:text-black font-medium">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}