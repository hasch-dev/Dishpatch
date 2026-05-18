"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2, ImagePlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function UploadGalleryDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  
  const supabase = createClient();

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentFileIndex(i + 1);
        const file = selectedFiles[i];
        
        // 1. Generate unique identifier
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        // 2. Transmission to 'gallery' bucket
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, file);

        if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

        // 3. Generate the Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(fileName);

        // 4. Registry Entry (Database)
        // We explicitly capture the error here to prevent "silent failures"
        const { error: dbError } = await supabase.from("gallery_items").insert({
          title: `Asset: ${file.name.split('.')[0]}`, 
          image_url: publicUrl,
          sort_order: 0, 
          description: "" 
        });

        if (dbError) {
          // If the DB rejects it (likely RLS or Schema issues), we stop immediately
          console.error("Database Registry Failure:", dbError);
          throw new Error(`Database Error: ${dbError.message}`);
        }

        // Update overall progress percentage
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      // Success: Full environment refresh
      window.location.reload(); 
    } catch (err: any) {
      console.error("Batch Transmission Failure:", err);
      alert(`Deployment Interrupted: ${err.message}`);
      setLoading(false);
    }
  };

  if (!isOpen) return (
    <Button 
      onClick={() => setIsOpen(true)} 
      className="rounded-none bg-primary text-black font-black uppercase tracking-[0.3em] text-[10px] h-10 px-6 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
    >
      <Plus className="mr-2 h-4 w-4" /> Initialize Batch
    </Button>
  );

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-xl border border-foreground/10 p-10 shadow-2xl relative overflow-hidden">
        
        <button 
          onClick={() => { if(!loading) setIsOpen(false); }} 
          className="absolute top-6 right-6 opacity-40 hover:opacity-100 hover:rotate-90 transition-all duration-300"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tighter">
            Batch <span className="text-primary italic font-serif">Deployment</span>
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2">
            Staging visual assets for central archive
          </p>
        </div>
        
        <div className="space-y-8">
          <div className={`relative border-2 border-dashed p-12 text-center transition-all duration-300 ${selectedFiles.length > 0 ? 'border-primary bg-primary/5' : 'border-foreground/10 hover:border-primary/50'}`}>
            {selectedFiles.length > 0 ? (
              <div className="flex flex-col items-center text-primary">
                <CheckCircle2 className="mb-2 h-10 w-10 animate-in zoom-in" />
                <p className="text-xs font-black uppercase tracking-widest">{selectedFiles.length} Assets Staged</p>
                <p className="text-[9px] uppercase mt-2 opacity-60">Ready for transmission</p>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-40">
                <ImagePlus className="mb-4 h-10 w-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select Asset Range</p>
                <p className="text-[8px] uppercase mt-2 tracking-widest">Images only • No quantity limit</p>
              </div>
            )}
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              disabled={loading}
              onChange={handleFileSelection} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
          </div>

          {loading && (
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">
                  Processing Asset {currentFileIndex} of {selectedFiles.length}
                </span>
                <span className="text-[10px] font-mono font-bold">{uploadProgress}%</span>
              </div>
              <div className="h-1 w-full bg-foreground/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-primary"
                  transition={{ ease: "easeOut", duration: 0.5 }}
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleBulkUpload} 
            disabled={loading || selectedFiles.length === 0} 
            className="w-full rounded-none h-16 bg-primary text-black font-black uppercase tracking-[0.5em] text-xs transition-all hover:bg-primary/90 disabled:opacity-20"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin" /> Transmitting...
              </span>
            ) : (
              "Finalize Deployment"
            )}
          </Button>
          
          {selectedFiles.length > 0 && !loading && (
            <button 
              onClick={() => setSelectedFiles([])}
              className="w-full text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}