"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Hash, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PartnersPublicPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    const fetchPartners = async () => {
      const { data } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false });
      setPartners(data || []);
      setLoading(false);
    };
    fetchPartners();
  }, []);

  const filtered = partners.filter(p => filter === "all" || p.category === filter);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 max-w-[1600px] mx-auto space-y-12">
      <header className="space-y-4 pt-6">
        <div className="flex items-center gap-3 opacity-30">
          <Hash size={14} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">The Network</p>
        </div>
        <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter">The Syndicate</h1>
      </header>

      <Tabs value={filter} onValueChange={setFilter} className="border-y border-border/10 py-6">
        <TabsList className="bg-transparent gap-10">
          {['all', 'purveyors', 'venues', 'artisans'].map(cat => (
            <TabsTrigger key={cat} value={cat} className="uppercase text-[10px] font-black tracking-widest p-0 data-[state=active]:text-primary">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {filtered.map((partner) => (
          <div key={partner.id} className="group flex flex-col md:flex-row border border-border/20 overflow-hidden h-auto md:h-64">
            <div className="md:w-1/3 bg-muted overflow-hidden">
              <img src={partner.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="flex-1 p-8 flex flex-col justify-between bg-card/30">
              <div>
                <span className="text-[9px] text-primary font-bold uppercase tracking-widest">{partner.partner_type}</span>
                <h3 className="text-2xl font-serif italic mt-2">{partner.name}</h3>
                <p className="text-xs opacity-60 mt-4 line-clamp-2">{partner.description}</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border/10">
                <span className="text-[9px] uppercase opacity-40 flex items-center gap-2"><MapPin size={10}/>{partner.location}</span>
                <ExternalLink size={14} className="opacity-20 hover:opacity-100 cursor-pointer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}