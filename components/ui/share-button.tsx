"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title?: string;
  text?: string;
  className?: string;
}

export default function ShareButton({ 
  title = "Dishpatch Stockhouse", 
  text = "Check live commissary availability.", 
  className 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: currentUrl,
        });
      } catch (error) {
        // Handle cancel or failure silently
        console.debug("Share aborted or failed:", error);
      }
    } else {
      // Desktop Fallback: Copy Link
      try {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Could not copy URL to clipboard", error);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all rounded-full select-none",
        copied 
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
          : "bg-background text-muted-foreground border-foreground/10 hover:text-foreground hover:border-foreground/30",
        className
      )}
    >
      {copied ? (
        <>
          <Check size={12} className="shrink-0" />
          <span>Copied Ledger Link</span>
        </>
      ) : (
        <>
          <Share2 size={12} className="shrink-0" />
          <span>Share Ledger</span>
        </>
      )}
    </button>
  );
}