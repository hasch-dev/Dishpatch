"use client";

import Image from "next/image";
import { PackageOpen } from "lucide-react";

interface ProductImageGalleryProps {
  imageUrl: string | null;
  name: string;
}

export default function ProductImageGallery({ imageUrl, name }: ProductImageGalleryProps) {
  return (
    <div className="w-full md:w-5/12 h-[40vh] md:h-screen sticky top-0 bg-zinc-100 dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-foreground/10 relative">
      {imageUrl ? (
        <Image 
          src={imageUrl}
          alt={name}
          fill
          priority
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center opacity-10">
          <PackageOpen size={120} strokeWidth={0.5} />
        </div>
      )}
    </div>
  );
}