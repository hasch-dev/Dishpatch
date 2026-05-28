"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TestimonialsDialog from "./testimonials-dialog";

export interface Testimonial {
  id: string;
  author: string;
  quote: string;
  location: string;
  date_string: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export default function TestimonialsTable() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState<Testimonial | null>(null);

  const supabase = createClient();
  const { toast } = useToast();

  const fetchTestimonials = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
    } else {
      setTestimonials(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (currentStatus === true) {
      const activeCount = testimonials.filter(t => t.is_active).length;
      if (activeCount <= 6) {
        toast({
          title: "Action Denied",
          description: "System requires a minimum of 6 active moments at all times for the public grid.",
          variant: "destructive",
        });
        return;
      }
    }

    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t));

    const { error } = await supabase.from("testimonials").update({ is_active: !currentStatus }).eq("id", id);
    if (error) {
      fetchTestimonials();
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status Updated", description: `Testimonial is now ${!currentStatus ? 'live' : 'hidden'}.` });
    }
  };

  const handleDelete = async (id: string, wasActive: boolean) => {
    if (wasActive) {
      const activeCount = testimonials.filter(t => t.is_active).length;
      if (activeCount <= 6) {
        toast({
          title: "Delete Blocked",
          description: "Cannot delete an active item if it brings the pool count below 6.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!confirm("Are you sure you want to scrub this record from the database?")) return;

    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) {
      toast({ title: "Deletion Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Record Erased", description: "The moment entry has been dropped." });
      fetchTestimonials();
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold">
            Total Registry: {testimonials.length}
          </Badge>
          <Badge variant="default" className="text-[10px] uppercase tracking-widest font-bold bg-primary/10 text-primary hover:bg-primary/20 border-0">
            Active: {testimonials.filter(t => t.is_active).length} (Min 6)
          </Badge>
        </div>
        
        <Button onClick={() => { setActiveTestimonial(null); setIsDialogOpen(true); }} size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest gap-2 rounded-none">
          <Plus className="w-3 h-3" /> Add Moment
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px]">Visual</TableHead>
              <TableHead>Author & Details</TableHead>
              <TableHead className="max-w-[300px]">Quote Snippet</TableHead>
              <TableHead className="text-center w-[120px]">Live Status</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="w-12 h-12 rounded-none" /></TableCell>
                  <TableCell><Skeleton className="w-32 h-4 mb-2" /><Skeleton className="w-24 h-3" /></TableCell>
                  <TableCell><Skeleton className="w-full h-4" /></TableCell>
                  <TableCell><Skeleton className="w-10 h-5 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="w-16 h-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : testimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                    <span className="text-xs uppercase tracking-widest font-bold">No moments recorded</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              testimonials.map((t) => (
                <TableRow key={t.id} className="group transition-colors">
                  <TableCell>
                    <div className="w-12 h-12 bg-muted relative overflow-hidden border border-border">
                      {t.image_url ? (
                        <img src={t.image_url} alt={t.author} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                      ) : (
                        <ImageIcon className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-sm">{t.author}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                      {t.location} • {t.date_string}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="text-xs text-muted-foreground truncate italic">
                      "{t.quote}"
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch 
                      checked={t.is_active}
                      onCheckedChange={() => handleToggleActive(t.id, t.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Button onClick={() => { setActiveTestimonial(t); setIsDialogOpen(true); }} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary rounded-none">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button onClick={() => handleDelete(t.id, t.is_active)} variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive rounded-none">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TestimonialsDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSuccess={fetchTestimonials} 
        testimonial={activeTestimonial}
      />
    </div>
  );
}