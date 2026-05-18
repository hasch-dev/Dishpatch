"use client";

import { GalleryCard } from "./gallery-card";

interface MasonryGridProps {
  photos: any[];
  onSelectPhoto: (photo: any) => void;
}

export function MasonryGrid({ photos, onSelectPhoto }: MasonryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
      {photos.map((photo, index) => {
        // We create "steps" by varying the top margin and height per index
        const isTall = index % 3 === 0;
        const isOffset = index % 2 !== 0;

        return (
          <div 
            key={photo.id} 
            className={`
              flex flex-col 
              ${isOffset ? "mt-12" : "mt-0"} 
              ${isTall ? "lg:mb-12" : "mb-0"}
            `}
          >
            <GalleryCard 
              photo={photo} 
              onClick={() => onSelectPhoto(photo)} 
              isTall={isTall}
            />
          </div>
        );
      })}
    </div>
  );
}