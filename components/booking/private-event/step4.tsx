"use client";
export default function Step4Culinary({ data, update, onOpenCatalog }: any) {
  const DIRECTIONS = ["Modern Filipino", "Mediterranean", "Japanese Fusion", "Continental"];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 animate-in fade-in">
      <div className="space-y-12">
        <h3 className="text-3xl font-serif italic">Culinary Direction</h3>
        <div className="space-y-4">
          {DIRECTIONS.map(d => (
            <button key={d} onClick={() => update({ direction: d })} className={`w-full p-6 text-left border flex justify-between items-center ${data.direction === d ? "border-primary bg-primary/5" : "border-border"}`}>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">{d}</span>
              {data.direction === d && <div className="w-2 h-2 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
        <button onClick={onOpenCatalog} className="w-full py-8 border-2 border-dashed border-primary/40 text-primary text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary/5 transition-all">
          Open Culinary Catalog ({data.catalogItems.length} Items Selected)
        </button>
      </div>
      <div className="bg-muted/10 border border-border flex items-center justify-center grayscale opacity-50">
        <p className="text-[9px] uppercase tracking-widest">Visual moodboard for {data.direction}</p>
      </div>
    </div>
  );
}