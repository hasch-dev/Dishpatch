"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { Testimonial } from "./testimonials-table";

interface TestimonialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testimonial?: Testimonial | null;
}

export default function TestimonialsDialog({
  isOpen,
  onClose,
  onSuccess,
  testimonial,
}: TestimonialDialogProps) {
  const supabase = createClient();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [dateString, setDateString] = useState("");
  const [quote, setQuote] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (testimonial) {
      setAuthor(testimonial.author);
      setLocation(testimonial.location || "");
      setDateString(testimonial.date_string || "");
      setQuote(testimonial.quote);
      setImagePreview(testimonial.image_url || "");
    } else {
      resetForm();
    }
  }, [testimonial, isOpen]);

  const resetForm = () => {
    setAuthor("");
    setLocation("");
    setDateString("");
    setQuote("");
    setImageFile(null);
    setImagePreview("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadImage = async (): Promise<string> => {
    if (!imageFile) return imagePreview;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `moments/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("testimonials")
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("testimonials").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalImageUrl = await handleUploadImage();

      const payload = {
        author,
        location,
        date_string: dateString,
        quote,
        image_url: finalImageUrl,
      };

      if (testimonial?.id) {
        const { error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", testimonial.id);

        if (error) throw error;
        toast({ title: "Moment Updated", description: "The registry has been updated successfully." });
      } else {
        const { error } = await supabase
          .from("testimonials")
          .insert([payload]);

        if (error) throw error;
        toast({ title: "Moment Created", description: "New story successfully integrated." });
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Database Registry Failure",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border border-border bg-background rounded-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight">
            {testimonial ? "Modify Registry Entry" : "Commit New Moment"}
          </DialogTitle>
          <DialogDescription className="text-xs font-light">
            Fill out the operational fields below. All items map directly to the home landscape.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Visual Assets</Label>
            <div className="border border-dashed border-border p-4 flex items-center justify-center gap-4 bg-muted/10 relative">
              {imagePreview ? (
                <div className="relative w-24 h-24 border border-border bg-muted">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(""); }}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-destructive text-destructive-foreground rounded-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4 w-full group">
                  <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Upload Experience Canvas</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="author" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Author Name</Label>
              <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder="Sarah Jenkins" className="rounded-none h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Manhattan, NY" className="rounded-none h-9 text-xs" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateString" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Timeline Flag</Label>
            <Input id="dateString" value={dateString} onChange={(e) => setDateString(e.target.value)} placeholder="October 2026" className="rounded-none h-9 text-xs" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote" className="text-[10px] font-bold uppercase tracking-widest opacity-60">The Core Narrative</Label>
            <Textarea id="quote" value={quote} onChange={(e) => setQuote(e.target.value)} required rows={4} placeholder="Type out customer experience ledger..." className="rounded-none text-xs resize-none" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-none text-[10px] font-bold uppercase tracking-wider h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-none text-[10px] font-bold uppercase tracking-wider h-9">
              {isSubmitting && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
              {testimonial ? "Commit Mutation" : "Publish Instance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}