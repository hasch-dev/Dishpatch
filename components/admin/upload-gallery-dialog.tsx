"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2, ImagePlus, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// 1. Define our new Asset Type to hold metadata locally before upload
type StagedAsset = {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
};

export default function UploadGalleryDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Dropzone, Step 2: Metadata
  
  const [assets, setAssets] = useState<StagedAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  
  const supabase = createClient();

  // Cleanup Object URLs to prevent memory leaks when dialog closes
  useEffect(() => {
    if (!isOpen) {
      assets.forEach(asset => URL.revokeObjectURL(asset.previewUrl));
      setAssets([]);
      setStep(1);
      setLoading(false);
    }
  }, [isOpen]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newAssets = filesArray.map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file), // Generate local preview
        title: file.name.split('.')[0], // Default title to filename
        description: "" // Empty description ready for input
      }));
      setAssets(newAssets);
    }
  };

  const handleMetadataChange = (id: string, field: 'title' | 'description', value: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  const handleBulkUpload = async () => {
    if (assets.length === 0) return;
    
    setLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < assets.length; i++) {
        setCurrentFileIndex(i + 1);
        const asset = assets[i];
        
        // 1. Storage Upload
        const fileExt = asset.file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, asset.file);

        if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(fileName);

        // 2. Registry Entry using custom Title and Description
        const { error: dbError } = await supabase.from("gallery_items").insert({
          title: asset.title.trim() || `Asset: ${asset.file.name.split('.')[0]}`, 
          description: asset.description.trim() || null,
          image_url: publicUrl,
          sort_order: 0, 
        });

        if (dbError) throw new Error(`Database Error: ${dbError.message}`);

        setUploadProgress(Math.round(((i + 1) / assets.length) * 100));
      }

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
      <div className="bg-card w-full max-w-2xl border border-foreground/10 p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        <button 
          onClick={() => { if(!loading) setIsOpen(false); }} 
          className="absolute top-6 right-6 opacity-40 hover:opacity-100 hover:rotate-90 transition-all duration-300 z-10"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="mb-8 shrink-0">
          <div className="flex items-center gap-4">
            {step === 2 && !loading && (
              <button 
                onClick={() => setStep(1)}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                {step === 1 ? "Batch" : "Asset"} <span className="text-primary italic font-serif">{step === 1 ? "Deployment" : "Configuration"}</span>
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2">
                {step === 1 ? "Staging visual assets for central archive" : `Detailing ${assets.length} staged assets`}
              </p>
            </div>
          </div>
        </div>
        
        {/* === STEP 1: FILE SELECTION === */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
            <div className={`relative border-2 border-dashed p-12 text-center transition-all duration-300 ${assets.length > 0 ? 'border-primary bg-primary/5' : 'border-foreground/10 hover:border-primary/50'}`}>
              {assets.length > 0 ? (
                <div className="flex flex-col items-center text-primary">
                  <CheckCircle2 className="mb-2 h-10 w-10 animate-in zoom-in" />
                  <p className="text-xs font-black uppercase tracking-widest">{assets.length} Assets Staged</p>
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
                onChange={handleFileSelection} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
            </div>

            <Button 
              onClick={() => setStep(2)} 
              disabled={assets.length === 0} 
              className="w-full rounded-none h-14 bg-primary text-black font-black uppercase tracking-[0.4em] text-[11px] transition-all hover:bg-primary/90 disabled:opacity-20 flex items-center justify-center gap-2"
            >
              Continue to Detailing <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* === STEP 2: METADATA CONFIGURATION === */}
        {step === 2 && (
          <div className="flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-300">
            
            {/* Scrollable list of staged assets */}
            <div className="overflow-y-auto flex-1 pr-2 space-y-6 mb-6 custom-scrollbar">
              {assets.map((asset, index) => (
                <div key={asset.id} className="flex gap-6 p-4 border border-foreground/5 bg-foreground/[0.02]">
                  {/* Image Preview */}
                  <div className="w-24 h-24 shrink-0 bg-muted relative overflow-hidden border border-foreground/10">
                    <img 
                      src={asset.previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Inputs */}
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest opacity-60">Asset Title *</label>
                      <input 
                        type="text" 
                        value={asset.title}
                        onChange={(e) => handleMetadataChange(asset.id, 'title', e.target.value)}
                        className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g., Wagyu Beef Tartare"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest opacity-60">Description (Optional)</label>
                      <textarea 
                        value={asset.description}
                        onChange={(e) => handleMetadataChange(asset.id, 'description', e.target.value)}
                        className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-none h-16"
                        placeholder="Detail the ingredients, origin, or culinary process..."
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Controls & Progress */}
            <div className="shrink-0 space-y-4 pt-4 border-t border-foreground/10 bg-card">
              {loading && (
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">
                      Transmitting {currentFileIndex} of {assets.length}
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
                disabled={loading} 
                className="w-full rounded-none h-14 bg-primary text-black font-black uppercase tracking-[0.4em] text-[11px] transition-all hover:bg-primary/90 disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin" /> Transmitting Archive...
                  </span>
                ) : (
                  "Finalize & Dispatch"
                )}
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}