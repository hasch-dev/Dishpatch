"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExternalLink, MoreHorizontal, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface GalleryRegistryTableProps {
  initialItems: any[];
}

export default function GalleryRegistryTable({ initialItems }: GalleryRegistryTableProps) {
  // Sort initially by sort_order
  const [items, setItems] = useState([...initialItems].sort((a, b) => a.sort_order - b.sort_order));
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const supabase = createClient();

  // --- NATIVE DRAG AND DROP LOGIC ---
  const handleDragStart = (index: number) => setDraggedItem(index);
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newItems = [...items];
    const draggedData = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(index, 0, draggedData);
    
    setDraggedItem(index);
    setItems(newItems);
  };

  const handleDrop = async () => {
    setDraggedItem(null);
    // Persist the new order to Supabase
    const updates = items.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));

    // Update records in parallel
    await Promise.all(
      updates.map(update => 
        supabase.from("gallery_items").update({ sort_order: update.sort_order }).eq("id", update.id)
      )
    );
  };
  // ----------------------------------

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm("Remove this asset from the registry?")) return;
    
    await supabase.from("gallery_items").delete().eq("id", id);
    const fileName = imageUrl.split("/").pop();
    if (fileName) await supabase.storage.from("gallery").remove([fileName]);
    
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-foreground/10">
            <th className="p-4 w-12"></th>
            <th className="p-4 text-[9px] uppercase tracking-[0.3em] font-black opacity-40">Preview</th>
            <th className="p-4 text-[9px] uppercase tracking-[0.3em] font-black opacity-40">Identity & Desc</th>
            <th className="p-4 text-[9px] uppercase tracking-[0.3em] font-black opacity-40 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/5">
          {items.map((item, index) => (
            <tr 
              key={item.id} 
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDrop}
              className={`group transition-colors ${draggedItem === index ? 'bg-foreground/5 opacity-50' : 'hover:bg-foreground/[0.02]'}`}
            >
              <td className="p-4 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-foreground">
                <GripVertical className="h-4 w-4" />
              </td>
              <td className="p-4">
                <div className="h-16 w-16 bg-muted overflow-hidden border border-foreground/10">
                  <img src={item.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </div>
              </td>
              <td className="p-4">
                <p className="text-xs font-bold uppercase tracking-tighter">{item.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 max-w-md">
                  {item.description || "No description provided."}
                </p>
              </td>
              <td className="p-4 text-right">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-none border-foreground/10">
                    <DropdownMenuItem asChild>
                      <a href={item.image_url} target="_blank" rel="noreferrer" className="text-xs cursor-pointer"><ExternalLink className="mr-2 h-3 w-3" /> View Asset</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert("Open Edit Modal Here!")} className="text-xs cursor-pointer">
                      <Pencil className="mr-2 h-3 w-3" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(item.id, item.image_url)} className="text-xs text-destructive focus:bg-destructive/10 cursor-pointer">
                      <Trash2 className="mr-2 h-3 w-3" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}