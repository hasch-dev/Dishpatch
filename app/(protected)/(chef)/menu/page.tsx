"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Plus, Utensils, Save, 
  Trash2, Edit3, Image as ImageIcon, 
  Sparkles, Loader2, Layers, Check
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function GastronomicMenu() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchive = async () => {
    setLoading(true);
    
    // Fetch Masterpieces
    const { data: itemsData, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Fetch Collections
    const { data: groupsData, error: groupsError } = await supabase
      .from('culinary_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (!itemsError && itemsData) setItems(itemsData);
    if (!groupsError && groupsData) setGroups(groupsData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchArchive();
  }, []);

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      toast.error("Failed to remove masterpiece.");
    } else {
      toast.success("Masterpiece removed.");
      fetchArchive();
    }
  };

  const handleDeleteGroup = async (id: string) => {
    const { error } = await supabase.from('culinary_groups').delete().eq('id', id);
    if (error) {
      toast.error("Failed to disband collection.");
    } else {
      toast.success("Collection disbanded.");
      fetchArchive();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 animate-in fade-in duration-700">
      {/* HEADER SECTION - Reduced Sizes */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary/80">
            <Sparkles className="h-3 w-3" />
            <span className="text-[9px] uppercase tracking-[0.4em] font-medium">Chef's Atelier</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic tracking-tighter leading-none text-foreground/90">
            Gastronomic <span className="text-primary/70">Menu</span>
          </h1>
        </div>
        <p className="max-w-xs text-[11px] font-light leading-relaxed text-muted-foreground italic border-l border-primary/20 pl-4 py-1">
          "Cuisine is the only art that nourishes the soul while delighting the senses."
        </p>
      </header>

      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="alacarte" className="w-full">
          <TabsList className="bg-transparent w-full justify-start rounded-none h-auto p-0 mb-10 border-b border-border/20 gap-8">
            <TabsTrigger 
              value="alacarte" 
              className="data-[state=active]:text-foreground data-[state=active]:border-foreground text-muted-foreground border-b-2 border-transparent rounded-none bg-transparent px-0 pb-4 pt-0 font-medium uppercase tracking-[0.2em] text-[10px] transition-all hover:text-foreground/80"
            >
              The Library
            </TabsTrigger>
            <TabsTrigger 
              value="grouped" 
              className="data-[state=active]:text-foreground data-[state=active]:border-foreground text-muted-foreground border-b-2 border-transparent rounded-none bg-transparent px-0 pb-4 pt-0 font-medium uppercase tracking-[0.2em] text-[10px] transition-all hover:text-foreground/80"
            >
              The Collections
            </TabsTrigger>
          </TabsList>

          {/* TAB: A LA CARTE */}
          <TabsContent value="alacarte" className="space-y-10 outline-none animate-in fade-in duration-500">
            <div className="flex justify-between items-end group">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif italic text-foreground/80">Individual Masterpieces</h2>
                <div className="h-[1px] w-8 bg-primary/40 transition-all duration-700 group-hover:w-20" />
              </div>
              <CreateItemDialog onRefresh={fetchArchive} />
            </div>

            {loading ? (
              <div className="flex justify-center py-32">
                <Loader2 className="animate-spin h-6 w-6 text-primary/30" />
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onDelete={() => handleDeleteItem(item.id)} 
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<Utensils className="h-8 w-8 stroke-[0.5px]" />} 
                title="Library is Awaiting Entry" 
                description="Begin archiving your culinary repertoire."
              />
            )}
          </TabsContent>

          {/* TAB: GROUPED MENU */}
          <TabsContent value="grouped" className="space-y-10 outline-none animate-in fade-in duration-500">
            <div className="flex justify-between items-end group">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif italic text-foreground/80">Bespoke Collections</h2>
                <div className="h-[1px] w-8 bg-primary/40 transition-all duration-700 group-hover:w-20" />
              </div>
              <CreateGroupDialog availableItems={items} onRefresh={fetchArchive} />
            </div>
            
            {loading ? (
              <div className="flex justify-center py-32">
                <Loader2 className="animate-spin h-6 w-6 text-primary/30" />
              </div>
            ) : groups.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {groups.map((group) => (
                   <GroupCard 
                     key={group.id} 
                     group={group} 
                     onDelete={() => handleDeleteGroup(group.id)} 
                   />
                 ))}
              </div>
            ) : (
              <EmptyState 
                icon={<Layers className="h-8 w-8 stroke-[0.5px]" />} 
                title="No Active Collections" 
                description="Curate themed experiences or event packages."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* --- COMPONENTS --- */

function ItemCard({ item, onDelete }: { item: any, onDelete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="group cursor-pointer space-y-4 flex flex-col">
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary/10 border border-border/10">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="object-cover w-full h-full transition-all duration-1000 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground/20 font-thin" />
              </div>
            )}
          </div>
          <div className="space-y-2 text-center px-2 flex-grow">
            <h3 className="font-serif text-lg italic text-foreground/90">{item.name}</h3>
            <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-muted-foreground">
              <span>{item.pax_count} Pax</span>
              <span className="h-1 w-1 rounded-full bg-primary/40" />
              <span className="font-medium text-foreground/70">₱{Number(item.price).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-[850px] w-[95vw] p-0 border border-border/20 bg-background/95 backdrop-blur-3xl overflow-hidden shadow-2xl rounded-none max-h-[90vh]">
        <ScrollArea className="h-full max-h-[90vh]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-secondary/10 relative overflow-hidden min-h-[300px]">
               {item.image_url ? (
                 <img src={item.image_url} alt={item.name} className="object-cover w-full h-full absolute inset-0" />
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center">
                   <ImageIcon className="h-10 w-10 text-muted-foreground/10 font-thin" />
                 </div>
               )}
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-between space-y-8">
              <div className="space-y-8">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.4em] text-primary/80 font-medium">Masterpiece Details</span>
                  <h2 className="text-3xl lg:text-4xl font-serif italic mt-2 text-foreground/90 leading-tight">{item.name}</h2>
                </div>
                
                <div className="space-y-6">
                  <section>
                    <Label className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border/10 pb-2 w-full flex">Ingredients</Label>
                    <p className="text-sm font-light leading-relaxed mt-4 italic text-foreground/70">
                      {item.ingredients || "Details of this creation are available upon request."}
                    </p>
                  </section>
                  
                  <div className="flex justify-between items-center text-sm pt-4 border-t border-border/10">
                    <span className="font-light text-muted-foreground text-[10px] uppercase tracking-widest">Rate</span>
                    <span className="font-serif italic text-2xl text-foreground/90">₱{Number(item.price).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-col gap-2">
                 <Button variant="outline" className="w-full rounded-none h-10 uppercase tracking-widest text-[9px] font-medium border-border/30 hover:bg-secondary/20 transition-all">
                   <Edit3 className="mr-2 h-3 w-3" /> Refine
                 </Button>
                 <Button 
                   variant="ghost" 
                   onClick={() => { onDelete(); setIsOpen(false); }}
                   className="w-full rounded-none h-10 uppercase tracking-widest text-[9px] text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all"
                 >
                   <Trash2 className="mr-2 h-3 w-3" /> Remove
                 </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function GroupCard({ group, onDelete }: { group: any, onDelete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="group cursor-pointer relative aspect-[16/7] overflow-hidden bg-secondary/10 border border-border/10 flex items-end">
          {group.image_url ? (
            <img src={group.image_url} alt={group.name} className="absolute inset-0 object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Layers className="h-8 w-8 text-muted-foreground/20 stroke-[0.5px]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          <div className="relative z-10 p-6 w-full flex justify-between items-end">
             <div className="space-y-1">
               <span className="text-[8px] uppercase tracking-[0.3em] text-primary/80 font-medium">Curated Collection</span>
               <h3 className="font-serif text-2xl italic tracking-tight text-foreground/90">{group.name}</h3>
             </div>
             <div className="h-8 w-8 rounded-full border border-border/30 backdrop-blur-md flex items-center justify-center group-hover:bg-primary/20 transition-all">
               <Plus className="h-3 w-3 text-foreground/70" />
             </div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-[700px] w-[95vw] p-0 border border-border/20 bg-background/95 backdrop-blur-3xl shadow-2xl rounded-none max-h-[90vh]">
        <ScrollArea className="h-full max-h-[90vh]">
          <div className="p-8 md:p-12 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[9px] uppercase tracking-[0.4em] text-primary/80 font-medium">The Collection</span>
              <h2 className="text-3xl md:text-4xl font-serif italic text-foreground/90">{group.name}</h2>
            </div>

            {group.image_url && (
              <div className="aspect-video w-full overflow-hidden border border-border/20">
                <img src={group.image_url} alt={group.name} className="object-cover w-full h-full" />
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground border-b border-border/10 pb-2 w-full flex">Philosophy</Label>
              <p className="text-sm font-light leading-relaxed italic text-foreground/70 text-center px-4">
                {group.description || "A masterfully curated sequence of flavors."}
              </p>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-3 border-t border-border/10">
               <Button variant="outline" className="flex-1 rounded-none h-10 uppercase tracking-widest text-[9px] font-medium border-border/30 hover:bg-secondary/20 transition-all">
                 <Edit3 className="mr-2 h-3 w-3" /> Edit
               </Button>
               <Button 
                 variant="ghost" 
                 onClick={() => { onDelete(); setIsOpen(false); }}
                 className="flex-1 rounded-none h-10 uppercase tracking-widest text-[9px] text-destructive/70 hover:bg-destructive/5 transition-all"
               >
                 <Trash2 className="mr-2 h-3 w-3" /> Disband
               </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function CreateItemDialog({ onRefresh }: { onRefresh: () => void }) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    
    let image_url = "";
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `item_${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage.from('dishpatch-media').upload(fileName, file);
      
      if (!uploadError && data) {
        const { data: urlData } = supabase.storage.from('dishpatch-media').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('menu_items').insert({
      name: formData.get('name'),
      pax_count: parseInt(formData.get('pax') as string),
      price: parseFloat(formData.get('price') as string),
      ingredients: formData.get('ingredients'),
      category: 'a-la-carte',
      image_url,
    });

    setUploading(false);
    if (error) {
      toast.error("Failed to archive.");
    } else {
      toast.success("Masterpiece archived.");
      setFile(null);
      setIsOpen(false);
      onRefresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-none h-10 px-6 bg-foreground hover:bg-foreground/90 text-background uppercase tracking-widest text-[9px] font-medium transition-all shadow-lg">
          <Plus className="mr-2 h-3 w-3" /> New Creation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] w-[95vw] p-0 rounded-none border border-border/20 bg-background/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]">
        <ScrollArea className="h-full max-h-[90vh]">
          <form onSubmit={handleSave} className="p-8 md:p-12">
            <DialogHeader className="text-center mb-10 space-y-2">
              <DialogTitle className="font-serif italic text-3xl text-foreground/90">Add to Library</DialogTitle>
              <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Definition of Craft</p>
            </DialogHeader>
            
            <div className="space-y-8">
              <div className="grid gap-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-foreground/60">Nomenclature</Label>
                <Input name="name" required className="rounded-none border-0 border-b border-border/30 bg-transparent px-0 h-10 focus-visible:ring-0 focus-visible:border-foreground transition-colors text-lg italic" placeholder="Signature Scallops..." />
              </div>
              
              <div className="grid grid-cols-2 gap-10">
                 <div className="grid gap-2">
                   <Label className="text-[9px] uppercase tracking-[0.3em] text-foreground/60">Pax</Label>
                   <Input name="pax" type="number" required defaultValue="1" className="rounded-none border-0 border-b border-border/30 bg-transparent px-0 h-10 focus-visible:ring-0 focus-visible:border-foreground transition-colors text-lg" />
                 </div>
                 <div className="grid gap-2">
                   <Label className="text-[9px] uppercase tracking-[0.3em] text-foreground/60">Price (₱)</Label>
                   <Input name="price" type="number" step="0.01" required className="rounded-none border-0 border-b border-border/30 bg-transparent px-0 h-10 focus-visible:ring-0 focus-visible:border-foreground transition-colors text-lg" placeholder="0.00" />
                 </div>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-foreground/60">Composition</Label>
                <Textarea name="ingredients" required className="rounded-none border border-border/20 bg-secondary/5 min-h-[100px] focus-visible:ring-1 focus-visible:ring-foreground/30 p-4 italic font-light text-sm resize-none" placeholder="Describe the elements..." />
              </div>

              <div className="grid gap-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-foreground/60">Visual Representation</Label>
                <div className="relative group border border-dashed border-border/30 p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors bg-secondary/5">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ImageIcon className="h-5 w-5 text-muted-foreground/40 font-thin group-hover:text-foreground/70 transition-colors" />
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      {file ? file.name : "Select Signature Image"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-12 sm:justify-center">
              <Button type="submit" disabled={uploading} className="w-full h-12 rounded-none uppercase tracking-widest text-[9px] font-medium bg-foreground text-background">
                {uploading ? <Loader2 className="animate-spin h-3 w-3 mr-3" /> : <Save className="mr-3 h-3 w-3" />}
                Archive Masterpiece
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function CreateGroupDialog({ availableItems, onRefresh }: { availableItems: any[], onRefresh: () => void }) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSaveGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    
    let image_url = "";
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `group_${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage.from('dishpatch-media').upload(fileName, file);
      
      if (!uploadError && data) {
        const { data: urlData } = supabase.storage.from('dishpatch-media').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('culinary_groups').insert({
      name: formData.get('name'),
      description: formData.get('description'),
      image_url,
      // You can store selectedItems as a JSONB array or handle them in a junction table
      item_ids: selectedItems 
    });

    setUploading(false);
    if (error) {
      toast.error("Failed to curate.");
    } else {
      toast.success("Collection curated.");
      setFile(null);
      setSelectedItems([]);
      setIsOpen(false);
      onRefresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-none h-10 px-6 border-border/40 hover:bg-secondary/20 uppercase tracking-widest text-[9px] font-medium transition-all">
          <Plus className="mr-2 h-3 w-3" /> New Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] w-[95vw] p-0 rounded-none border border-border/20 bg-background/95 backdrop-blur-2xl shadow-2xl max-h-[90vh]">
        <ScrollArea className="h-full max-h-[90vh]">
          <form onSubmit={handleSaveGroup} className="p-8 md:p-12">
            <DialogHeader className="text-center mb-10 space-y-2">
              <DialogTitle className="font-serif italic text-3xl text-foreground/90">Curate Collection</DialogTitle>
              <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Themed Narrative</p>
            </DialogHeader>
            
            <div className="space-y-8">
              <div className="grid gap-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-foreground/60">Collection Title</Label>
                <Input name="name" required className="rounded-none border-0 border-b border-border/30 bg-transparent px-0 h-10 focus-visible:ring-0 focus-visible:border-foreground transition-colors text-lg italic" placeholder="Tides & Terroir..." />
              </div>

              <div className="space-y-4">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-foreground/60">Select Masterpieces</Label>
                <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto p-3 border border-border/10 bg-secondary/5">
                  {availableItems.length > 0 ? availableItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 bg-background/50 hover:bg-background transition-colors border border-border/5">
                      <Checkbox 
                        id={item.id} 
                        checked={selectedItems.includes(item.id)} 
                        onCheckedChange={() => toggleItem(item.id)} 
                      />
                      <label htmlFor={item.id} className="text-xs italic cursor-pointer truncate flex-grow text-foreground/80">
                        {item.name} <span className="text-[9px] text-muted-foreground not-italic opacity-60 ml-2">₱{Number(item.price).toLocaleString()}</span>
                      </label>
                    </div>
                  )) : (
                    <p className="text-[10px] italic text-muted-foreground p-2">No masterpieces found in the library.</p>
                  )}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-foreground/60">Narrative Arc</Label>
                <Textarea name="description" required className="rounded-none border border-border/20 bg-secondary/5 min-h-[100px] focus-visible:ring-1 focus-visible:ring-foreground/30 p-4 italic font-light text-sm resize-none" placeholder="Describe the journey..." />
              </div>

              <div className="grid gap-2">
                <Label className="text-[9px] uppercase tracking-[0.3em] text-foreground/60">Collection Cover</Label>
                <div className="relative group border border-dashed border-border/30 p-8 text-center cursor-pointer hover:bg-secondary/10 transition-colors bg-secondary/5">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Layers className="h-5 w-5 text-muted-foreground/40 stroke-[1px] group-hover:text-foreground/70 transition-colors" />
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      {file ? file.name : "Select Cover Image"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-12 sm:justify-center">
              <Button type="submit" disabled={uploading} className="w-full h-12 rounded-none uppercase tracking-widest text-[9px] font-medium bg-foreground text-background">
                {uploading ? <Loader2 className="animate-spin h-3 w-3 mr-3" /> : <Save className="mr-3 h-3 w-3" />}
                Finalize Collection
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ icon, title, description }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-32 border border-border/10 bg-secondary/5 rounded-none group hover:bg-secondary/10 transition-all duration-700">
      <div className="mb-6 text-muted-foreground/30 group-hover:text-foreground/40 transition-colors transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="font-serif italic text-2xl text-foreground/60 mb-2">{title}</h3>
      <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/70 font-light max-w-sm text-center">{description}</p>
    </div>
  );
}