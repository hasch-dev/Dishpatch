"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Hash, 
  MapPin, 
  ExternalLink, 
  ArrowUpRight, 
  Building2,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CATEGORIES = ['all', 'purveyors', 'venues', 'artisans'];

export default function PartnersPublicPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  // Simulated admin role check (Replace with your actual auth/role verification)
  const [isAdmin, setIsAdmin] = useState(false); 

  const supabase = createClient();

  useEffect(() => {
    const fetchPartnersData = async () => {
      try {
        // Fetch user role for admin gateway access
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Verify against your admin table or metadata
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (profile?.role === 'admin') setIsAdmin(true);
        }

        // Fetch verified partners
        const { data } = await supabase
          .from('partners')
          .select('*')
          .eq('is_active', true)
          .order('is_featured', { ascending: false });
          
        setPartners(data || []);
      } catch (err) {
        console.error("Syndicate Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPartnersData();
  }, [supabase]);

  const filteredPartners = useMemo(() => {
    return partners.filter(p => filter === "all" || p.category === filter);
  }, [partners, filter]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-5 font-sans text-foreground">
      <div className="text-[10px] tracking-[0.6em] text-muted-foreground animate-pulse uppercase font-black pl-[0.6em]">
        Curating_Syndicate
      </div>
      <div className="h-[1px] w-16 bg-primary/30 relative overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-primary w-1/2"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-24">
      
      {/* Admin Operations Gateway Banner */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-primary/5 border-b border-primary/20 overflow-hidden"
          >
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-3 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] font-black text-primary">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Admin Operations Override Authorized</span>
              </div>
              <button className="flex items-center gap-2 hover:text-foreground transition-colors group">
                Review Pending Inquiries 
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-16 md:pt-24 space-y-16">
        
        {/* Header Structure */}
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/20 pb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-[1px] w-8 bg-muted-foreground/40" />
                <p className="text-[9px] font-bold uppercase tracking-[0.35em] flex items-center gap-2">
                  <Hash className="h-3 w-3" /> The Network
                </p>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-none">
                Partnerships
              </h1>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 max-w-sm">
              <p className="text-xs text-muted-foreground font-serif italic md:text-right leading-relaxed">
                A highly curated registry of purveyors, conceptual venues, and artisans collaborating within our ecosystem.
              </p>
            </div>
          </div>

          {/* Precision Tab Navigation */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-border/20 overflow-x-auto no-scrollbar pt-4">
            {CATEGORIES.map((cat) => {
              const count = partners.filter(p => cat === 'all' || p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "flex items-center gap-2.5 pb-4 px-0.5 transition-all relative group shrink-0",
                    filter === cat ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground/80"
                  )}
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{cat}</span>
                  <span className="text-[9px] font-mono text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    [{count}]
                  </span>
                  {filter === cat && (
                    <motion.div 
                      layoutId="partner-tab-underline" 
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" 
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* Dynamic Micro-grid Ecosystem */}
        {filteredPartners.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-dashed border-border/40 p-16 md:p-24 text-center bg-muted/5 flex flex-col items-center justify-center gap-4"
          >
            <Building2 className="h-8 w-8 text-muted-foreground/30 stroke-[1]" />
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Sector in Curation</h3>
              <p className="text-sm font-serif italic text-muted-foreground max-w-md mx-auto">
                We are currently reviewing applications and establishing relationships within this specific operational sector. Please check back later.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 xl:grid-cols-2 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredPartners.map((partner) => (
                <motion.div
                  key={partner.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="group flex flex-col md:flex-row border border-border/20 bg-card/10 hover:border-border/60 transition-colors h-auto md:h-64"
                >
                  {/* Image Block */}
                  <div className="md:w-[40%] bg-muted relative overflow-hidden shrink-0 h-48 md:h-full border-b md:border-b-0 md:border-r border-border/20">
                    <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent z-10 transition-colors duration-500" />
                    {partner.image_url ? (
                      <img 
                        src={partner.image_url} 
                        alt={partner.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700 ease-out" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/50">
                        <Building2 className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Context Block */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">
                          {partner.partner_type || partner.category}
                        </span>
                        {partner.is_featured && (
                          <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 border border-primary/20 font-bold uppercase tracking-widest">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif italic text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {partner.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-serif italic mt-4 line-clamp-3 leading-relaxed pr-4">
                        {partner.description}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-6 mt-6 border-t border-border/10">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <MapPin size={10} className="text-primary" />
                        {partner.location || "Global Network"}
                      </span>
                      {partner.website_url && (
                        <a 
                          href={partner.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center border border-border/30 hover:border-primary/50 text-muted-foreground hover:text-primary bg-background/50 transition-all rounded-none"
                        >
                          <ArrowUpRight size={14} className="stroke-[1.5]" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Global Partnership Intake Gateway */}
        <div className="mt-24 border border-border/20 bg-card/20 p-8 md:p-12 relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-3 max-w-xl">
              <h3 className="text-2xl font-serif italic tracking-tighter text-foreground">
                Join the Network
              </h3>
              <p className="text-sm font-serif italic text-muted-foreground leading-relaxed">
                We are continually expanding our ecosystem. If your company provides exceptional resources, high-end venues, or artisanal services aligned with our standards, we invite you to submit an inquiry.
              </p>
            </div>
            
            <div className="shrink-0 w-full md:w-auto">
              <Button className="w-full md:w-auto rounded-none h-12 px-8 text-[9px] uppercase tracking-[0.2em] font-black bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.1)] hover:shadow-[0_0_25px_rgba(var(--primary),0.25)] transition-all duration-300 group">
                Submit Inquiry 
                <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}