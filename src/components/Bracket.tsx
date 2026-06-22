export default function Bracket() {
  return (
    <section id="bracket" className="bg-dark-blue py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] font-mono text-xs font-bold uppercase tracking-wider bg-pink text-white mb-4">
            Knockout Stage
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Double Elimination Bracket</h2>
        </div>

        <div className="space-y-12 font-mono text-xs">
          {/* Upper Bracket Container Node Tree Visualizer */}
          <div className="box-neo bg-white/5 p-6 border-blue">
            <h3 className="text-lg font-bold text-blue uppercase mb-6">▲ Upper Bracket (UB)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-4">
                <div className="bg-black p-3 border-2 border-white/20">
                  <div className="text-white/40 mb-1">UB Semifinal 1</div>
                  <div className="font-bold font-sans">Andi <span className="float-right text-yellow">0</span></div>
                  <div className="font-bold font-sans">Dewi <span className="float-right text-yellow">0</span></div>
                </div>
              </div>
              <div className="text-center text-xl text-white/20 hidden md:block">➔</div>
              <div>
                <div className="bg-black p-3 border-2 border-yellow">
                  <div className="text-yellow mb-1 font-bold">UB Finals</div>
                  <div className="text-white/40 font-sans">TBD Slot 1</div>
                  <div className="text-white/40 font-sans">TBD Slot 2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Bracket Container Node Tree Visualizer */}
          <div className="box-neo bg-white/5 p-6 border-pink">
            <h3 className="text-lg font-bold text-pink uppercase mb-6">▼ Lower Bracket (LB)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black p-3 border-2 border-white/20">
                <div className="text-white/40 mb-1">LB Tereliminasi Round 1</div>
                <div className="font-bold font-sans">Budi <span className="float-right text-pink">Kalah</span></div>
                <div className="font-bold font-sans">Citra <span className="float-right text-green">Maju LB</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}