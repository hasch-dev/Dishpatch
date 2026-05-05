"use client";
export default function Step7Summary({ data }: any) {
  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in">
      <h3 className="text-4xl font-serif italic text-center">Confirm Your Journey</h3>
      <div className="grid grid-cols-2 gap-y-8 border-t border-border pt-8">
        <div className="space-y-1">
          <p className="text-[8px] uppercase tracking-widest opacity-40">Event</p>
          <p className="text-lg font-serif">{data.eventName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] uppercase tracking-widest opacity-40">Occasion</p>
          <p className="text-lg font-serif">{data.occasion}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] uppercase tracking-widest opacity-40">Location</p>
          <p className="text-lg font-serif">{data.city}, {data.province}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] uppercase tracking-widest opacity-40">Budget</p>
          <p className="text-lg font-serif text-primary">₱{data.budget}</p>
        </div>
      </div>
      <div className="bg-primary/5 p-6 border border-primary/20 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Ready for Submission</p>
      </div>
    </div>
  );
}