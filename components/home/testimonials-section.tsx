"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Testimonial {
  id: string;
  author: string;
  quote: string;
  location: string;
  date_string: string;
  image_url: string;
  is_active: boolean;
}

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true; 

    const fetchLiveTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        // DIAGNOSTIC LOG INJECTED HERE
        if (error) {
          console.error("SUPABASE SYSTEM HALT:", error.message, error.details, error.hint);
          throw error;
        }

        if (isMounted && data) {
          setTestimonials(data);
        }
      } catch (err) {
        console.error("Testimonial Fetch Aborted:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLiveTestimonials();

    return () => {
      isMounted = false; 
    };
  }, []);

  return (
    <section id="testimonials" className="py-32 border-y border-border bg-muted/5">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em]">
              Shared Moments
            </span>
            <h2 className="text-5xl font-black uppercase tracking-tighter mt-4">
              Food people love.
            </h2>
          </div>
          <p className="max-w-xs text-sm font-light text-muted-foreground">
            A look into the tables we've set and the stories we've helped tell across the region.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col border border-border bg-background p-8 space-y-6">
                <Skeleton className="w-full aspect-[4/3] rounded-none bg-muted" />
                <div className="flex justify-between"><Skeleton className="w-16 h-3" /><Skeleton className="w-12 h-3" /></div>
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-2/3 h-4" />
                <div className="pt-4 border-t border-border flex items-center gap-4">
                  <Skeleton className="w-8 h-px" />
                  <Skeleton className="w-24 h-3" />
                </div>
              </div>
            ))
          ) : testimonials.length === 0 ? (
            <Reveal>
              <div className="group flex flex-col justify-between h-full bg-background border border-dashed border-border p-12 text-left relative overflow-hidden min-h-[400px]">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Quote className="w-24 h-24 text-foreground" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-primary mb-6">
                    <span className="h-[2px] w-4 bg-primary" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">System Registry Idle</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4 max-w-[200px]">
                    The next chapter is yours.
                  </h3>
                  <p className="text-xs font-light text-muted-foreground leading-relaxed max-w-xs">
                    Our administrative team is preparing upcoming story profiles. Check back soon to read details regarding our next dining table events.
                  </p>
                </div>

                <div className="pt-6 mt-12 border-t border-border flex items-center gap-4 text-muted-foreground">
                  <Plus className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono">
                    Awaiting Entry Commit...
                  </span>
                </div>
              </div>
            </Reveal>
          ) : (
            testimonials.map((item, i) => (
              <Reveal key={item.id} delay={i * 0.1}>
                <div className="group flex flex-col h-full bg-background border border-border hover:border-primary/50 transition-colors">
                  <div className="aspect-[4/3] overflow-hidden relative bg-muted border-b border-border">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={`Event for ${item.author}`}
                        className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center opacity-20">
                        <Quote className="w-8 h-8 text-foreground" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md p-2 rounded-full shadow-sm">
                      <Quote className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-6 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>{item.location || "System Deployment"}</span>
                      <span>{item.date_string || "Recent"}</span>
                    </div>
                    
                    <p className="text-xl font-serif italic leading-relaxed text-foreground mb-8 flex-1">
                      "{item.quote}"
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-border flex items-center gap-4">
                      <div className="w-8 h-[1px] bg-primary" />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                        {item.author}
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  );
}