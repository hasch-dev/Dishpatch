"use client";

import { motion } from "framer-motion";
import { 
  X, Utensils, ScrollText, Hash, PhilippinePeso, Edit3, Trash2, Globe, ShieldCheck, Layers 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogItemDetailPopupProps {
  item: any;
  registryItems?: any[]; // ADDED: To look up course names
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CatalogItemDetailPopup({ 
  item, 
  registryItems = [], // Default to empty array
  onClose, 
  onEdit, 
  onDelete 
}: CatalogItemDetailPopupProps) {
  if (!item) return null;

  const isMenu = item.item_type === "grouped_menu";

  // Cross-reference IDs to get the actual course objects
  const linkedCourses = isMenu && item.linked_item_ids 
    ? registryItems.filter(regItem => item.linked_item_ids.includes(regItem.id))
    // Maintain the order of the linked_item_ids array if possible
    .sort((a, b) => item.linked_item_ids.indexOf(a.id) - item.linked_item_ids.indexOf(b.id))
    : [];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-3xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        className="relative w-full max-w-7xl bg-background border-[8px] border-foreground shadow-[30px_30px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[30px_30px_0px_0px_rgba(255,255,255,0.05)] flex flex-col md:flex-row max-h-[85vh] overflow-hidden"
      >
        {/* Media Sidebar */}
        <div className="w-full md:w-5/12 bg-muted/20 relative border-b-8 md:border-b-0 md:border-r-8 border-foreground flex flex-col">
          <div className="relative flex-1 bg-background">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-all duration-500" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                {isMenu ? <Layers size={120} strokeWidth={0.5} /> : <Utensils size={120} strokeWidth={0.5} />}
              </div>
            )}
          </div>
          
          <div className="p-8 space-y-6 bg-foreground text-background">
            <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50">System Actions</p>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={onEdit}
                    className="cursor-pointer w-full rounded-none bg-background text-foreground h-14 uppercase text-[10px] font-black tracking-[0.2em] hover:bg-primary hover:text-background transition-all border-0"
                  >
                    <Edit3 size={16} className="mr-3" /> Edit Entry
                  </Button>
                  <Button 
                    onClick={onDelete}
                    variant="outline"
                    className="cursor-pointer w-full h-14 rounded-none border-2 border-background/20 bg-transparent text-background hover:bg-foreground uppercase text-[10px] hover:text-background font-black tracking-[0.2em] hover:border-destructive transition-all"
                  >
                    <Trash2 size={16} className="mr-3" /> Purge Record
                  </Button>
                </div>
            </div>
          </div>
        </div>

        {/* Technical Data & Narrative */}
        <div className="flex-1 overflow-x-hidden w-full p-4 md:p-6 space-y-8 custom-scrollbar bg-background">
          <div className="flex justify-between items-start">
            <div className="flex flex-col space-y-6 w-full">
              <div className="flex items-center w-full justify-between">
                <div className="flex flex-row gap-4 items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] border-2 border-foreground px-4 py-1.5 bg-foreground text-background">
                    {item.item_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 italic">
                    // {isMenu ? (item.culinary_style || "General") : (item.food_category || "No Category")}
                  </span> 
                </div>
                <button onClick={onClose} className="group p-2">
                  <X size={36} strokeWidth={1} className="opacity-40 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-300" />
                </button>
              </div>
              <h2 className="text-2xl px-4 py-2 md:text-5xl font-serif italic tracking-tighter leading-[0.8]">{item.name}</h2>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-16 border-t-2 border-foreground/10 pt-12">
            <div className="w-full space-y-12">
              
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <ScrollText size={18} className="text-primary" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">The Specification</h4>
                </div>
                <div className="space-y-8">
                    <p className="text-xl font-serif italic leading-snug opacity-90 border-l-[6px] border-primary pl-8 py-2">
                      {item.story || "A unique culinary draft without an archived narrative."}
                    </p>
                    {item.description && (
                        <div className="text-[14px] leading-relaxed text-muted-foreground font-medium bg-muted/30 p-8 border-2 border-foreground/5 italic">
                            "{item.description}"
                        </div>
                    )}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  {isMenu ? <Layers size={18} className="text-primary" /> : <Hash size={18} className="text-primary" />}
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">
                    {isMenu ? "Menu Orchestration" : "Component Manifest"}
                  </h4>
                </div>

                {isMenu ? (
                  <div className="space-y-6">
                    {/* Top Badges */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-3 border-2 border-foreground px-5 py-3">
                        <Globe size={14} />
                        <span className="text-[10px] uppercase font-black tracking-widest">{item.culinary_style || "Contemporary"}</span>
                      </div>
                      <div className="flex items-center gap-3 border-2 border-foreground px-5 py-3">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] uppercase font-black tracking-widest">{item.classification?.replace(/_/g, ' ') || "Standard Package"}</span>
                      </div>
                    </div>

                    {/* Course List Display */}
                    <div className="flex flex-col border-t-[4px] border-foreground pt-4 mt-6">
                      <div className="mb-4">
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-3 py-1.5">
                          {linkedCourses.length} Distinct Courses
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        {linkedCourses.length > 0 ? linkedCourses.map((course, idx) => (
                          <div key={course.id} className="flex items-center gap-4 group p-3 hover:bg-muted/40 transition-colors border border-transparent hover:border-foreground/10">
                             <span className="text-[11px] font-mono font-bold opacity-30 group-hover:opacity-100 transition-opacity">
                               {(idx + 1).toString().padStart(2, '0')}
                             </span>
                             <span className="flex-1 font-serif italic text-xl leading-none truncate">
                               {course.name}
                             </span>
                             <span className="text-[9px] uppercase font-bold tracking-[0.2em] border border-foreground/20 px-2 py-1 shrink-0 opacity-60">
                               {course.food_category?.replace(/_/g, ' ') || "A LA CARTE"}
                             </span>
                          </div>
                        )) : (
                          <div className="p-4 border-2 border-dashed border-foreground/20 text-[11px] font-bold uppercase tracking-widest opacity-40 text-center italic">
                            No courses currently linked to this menu.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {item.ingredients?.length > 0 ? item.ingredients.map((ing: string, idx: number) => (
                      <span key={idx} className="text-[10px] uppercase font-black tracking-widest border-2 border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors">
                        {ing}
                      </span>
                    )) : (
                      <span className="text-[11px] italic opacity-40 font-serif text-lg">Ingredients restricted.</span>
                    )}
                  </div>
                )}
              </section>
            </div>

            <div className="w-full space-y-8 self-start pb-12">
              <div className="bg-foreground text-background p-10 space-y-8 border-[4px] border-foreground">
                <div className="flex items-center gap-3">
                  <PhilippinePeso size={20} />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Valuation Matrix</h4>
                </div>
                
                <div className="space-y-6">
                  {item.catalog_item_pricing?.length > 0 ? (
                    item.catalog_item_pricing.map((price: any) => (
                      <div key={price.id} className="flex justify-between items-end border-b-2 border-background/20 pb-4">
                        <span className="text-[10px] uppercase font-bold opacity-60 tracking-[0.2em]">{price.pax_range.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-sm opacity-40 font-mono">PHP</span>
                           <span className="font-serif italic text-3xl">{price.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center opacity-40 italic font-serif text-xl border-2 border-dashed border-background/20 text-background">
                      Pricing Structure TBD
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-2 border-foreground/10 text-[9px] uppercase font-bold tracking-widest leading-loose opacity-40 italic">
                Authorized Personnel Only: Modifications to this record will sync across all active client-facing dossiers immediately.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}