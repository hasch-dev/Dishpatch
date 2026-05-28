"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExternalLink, MoreHorizontal, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface GalleryRegistryTableProps {
  initialItems: any[];
}

export default function GalleryRegistryTable({ initialItems }: GalleryRegistryTableProps) {
  const [items, setItems] = useState([...initialItems].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<{ id: string; title: string; description: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? items.map((item) => item.id) : []);
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

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
    
    // Performance Fix: Only extract items whose index doesn't match their old sort_order
    const changedItems = items
      .map((item, index) => ({ id: item.id, new_order: index, old_order: item.sort_order }))
      .filter(item => item.new_order !== item.old_order);

    if (changedItems.length === 0) return;

    // Instantly update UI state to reflect new sort orders locally
    setItems(items.map((item, index) => ({ ...item, sort_order: index })));

    // Fire DB updates ONLY for the rows that actually moved
    await Promise.all(
      changedItems.map(update => 
        supabase.from("gallery_items").update({ sort_order: update.new_order }).eq("id", update.id)
      )
    );
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm("Remove this asset from the registry?")) return;
    
    // Optimistic UI update for instant feel
    setItems(items.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));

    await supabase.from("gallery_items").delete().eq("id", id);
    const fileName = imageUrl.split("/").pop();
    if (fileName) await supabase.storage.from("gallery").remove([fileName]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected assets?`)) return;

    const itemsToDelete = items.filter((item) => selectedIds.includes(item.id));
    const fileNames = itemsToDelete.map((item) => item.image_url.split("/").pop()).filter(Boolean) as string[];

    setItems(items.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);

    await supabase.from("gallery_items").delete().in("id", selectedIds);
    if (fileNames.length > 0) {
      await supabase.storage.from("gallery").remove(fileNames);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("gallery_items")
      .update({ title: editingItem.title, description: editingItem.description })
      .eq("id", editingItem.id);

    if (!error) {
      setItems(items.map((item) => item.id === editingItem.id ? { ...item, title: editingItem.title, description: editingItem.description } : item));
      setEditingItem(null);
    } else {
      console.error("Error updating item:", error);
    }
    setIsSaving(false);
  };

  return (
    <div className="w-full space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 text-destructive">
          <p className="text-xs font-medium uppercase tracking-wider">
            {selectedIds.length} asset{selectedIds.length > 1 ? "s" : ""} selected
          </p>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-8 text-xs font-bold uppercase tracking-tight rounded-none">
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Group
          </Button>
        </div>
      )}

      <div className="overflow-x-auto border border-foreground/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-foreground/10 bg-foreground/[0.01]">
              <th className="p-4 w-10 text-center">
                <input type="checkbox" checked={items.length > 0 && selectedIds.length === items.length} onChange={handleSelectAll} className="rounded-none border-foreground/30 accent-foreground h-3.5 w-3.5 cursor-pointer" />
              </th>
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
                className={`group ${draggedItem === index ? 'bg-foreground/5 opacity-50' : selectedIds.includes(item.id) ? 'bg-foreground/[0.03]' : 'hover:bg-foreground/[0.02]'}`}
              >
                <td className="p-4 text-center" onDragOver={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectRow(item.id)} className="rounded-none border-foreground/30 accent-foreground h-3.5 w-3.5 cursor-pointer" />
                </td>
                <td className="p-4 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-foreground">
                  <GripVertical className="h-4 w-4" />
                </td>
                <td className="p-4">
                  <div className="h-16 w-16 bg-muted overflow-hidden border border-foreground/10">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-xs font-bold uppercase tracking-tighter">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 max-w-md">{item.description || "No description provided."}</p>
                </td>
                <td className="p-4 text-right" onDragOver={(e) => e.stopPropagation()}>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-foreground/10">
                      <DropdownMenuItem asChild><a href={item.image_url} target="_blank" rel="noreferrer" className="text-xs cursor-pointer"><ExternalLink className="mr-2 h-3 w-3" /> View Asset</a></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingItem({ id: item.id, title: item.title, description: item.description || "" })} className="text-xs cursor-pointer"><Pencil className="mr-2 h-3 w-3" /> Edit Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(item.id, item.image_url)} className="text-xs text-destructive focus:bg-destructive/10 cursor-pointer"><Trash2 className="mr-2 h-3 w-3" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-xs text-muted-foreground uppercase tracking-wider">No assets found in registry.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-foreground/10 bg-background p-6 rounded-none shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Edit Asset Details</h3>
              <button onClick={() => setEditingItem(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Title</label>
                <input type="text" required value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-xs rounded-none focus:outline-none focus:border-foreground" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Description</label>
                <textarea rows={3} value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-xs rounded-none focus:outline-none focus:border-foreground resize-none" />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" size="sm" className="rounded-none text-xs" onClick={() => setEditingItem(null)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" size="sm" className="rounded-none text-xs font-bold" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}