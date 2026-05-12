"use client";

import { Settings2, Trash2, Edit3, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function CatalogCard({ item, index, onEdit, onDelete }: any) {
  const smartNumber = String(index + 1).padStart(3, '0');

  return (
    <div className="group relative border border-border/40 bg-card/10 hover:bg-card/20 transition-all duration-500 cursor-pointer overflow-hidden">
      {/* Header Index & Settings */}
      <div className="p-5 flex items-center justify-between border-b border-border/5">
        <span className="text-[10px] font-mono font-black text-primary/40 tracking-tighter italic">ITEM_REF_{smartNumber}</span>
        <DropdownMenu>
            <DropdownMenuTrigger className="opacity-40 group-hover:opacity-100 transition-opacity outline-none">
                <MoreVertical size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-border/40 bg-background p-1">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-[10px] uppercase font-bold tracking-widest gap-4 cursor-pointer focus:bg-primary/10">
                    <Edit3 size={12} /> Edit Script
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-[10px] uppercase font-bold tracking-widest gap-4 text-destructive cursor-pointer focus:bg-destructive/10">
                    <Trash2 size={12} /> Terminate
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-8 space-y-6">
        <h3 className="font-serif italic text-3xl leading-none group-hover:text-primary transition-colors duration-500">{item.name}</h3>
        
        {/* Gradient into Picture Design */}
        <div className="relative aspect-video overflow-hidden border border-border/10">
            {/* The Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/20 to-transparent" />
            
            {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 scale-110 group-hover:scale-100 transition-all duration-1000" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <span className="text-[8px] uppercase tracking-[0.5em] opacity-20">No Visual Record</span>
                </div>
            )}
        </div>

        <div className="flex justify-between items-center pt-2">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">{item.section_type || "Standard"}</span>
            <div className="h-px flex-1 bg-border/20 mx-4" />
            <span className="font-serif italic text-lg opacity-80 group-hover:opacity-100 group-hover:text-primary transition-all">
                ₱{item.pricing?.fixed || item.pricing?.['2'] || '0'}
            </span>
        </div>
      </div>
    </div>
  );
}