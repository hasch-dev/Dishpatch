// components/catalog/CulinaryCatalog.tsx
"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Info, Plus, X } from "lucide-react";

type Dish = {
    id: string;
    name: string;
    description: string;
    story: string;
    ingredients: string[];
    calories: number;
    imageUrl: string;
    price: number;
};

type Chef = {
    id: string;
    name: string;
    specialty: string;
    imageUrl: string;
    dishes: Dish[];
};

export default function CulinaryCatalog({ chefs, onAddToBooking }: { chefs: Chef[], onAddToBooking: (dish: Dish) => void }) {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  return (
    <div className="space-y-12 pb-24">
      {chefs.map((chef) => (
        <section key={chef.id} className="flex flex-col md:flex-row gap-8 items-start">
          {/* Section 2: Layout - Standard Chef Name, Picture, Specialty on side */}
          <div className="md:w-1/4 sticky top-24 shrink-0 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 ring-4 ring-gray-100 dark:ring-stone-800 shadow-lg">
              <img src={chef.imageUrl} alt={chef.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white">{chef.name}</h2>
            <p className="text-sm font-medium text-primary uppercase tracking-wider mt-1">{chef.specialty}</p>
          </div>

          {/* Section 1 & 3: Chef's specified menu and a la carte items */}
          <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {chef.dishes.map((dish) => (
              <div 
                key={dish.id} 
                className="group relative rounded-xl border border-gray-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-stone-800 relative">
                   {/* Dish Image */}
                  <img src={dish.imageUrl} alt={dish.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Tooltip implementation */}
                  <div className="absolute top-2 right-2">
                    <Tooltip.Provider delayDuration={200}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button 
                            onClick={() => setSelectedDish(dish)}
                            className="bg-white/90 dark:bg-black/80 p-2 rounded-full backdrop-blur-sm hover:bg-primary hover:text-white transition-colors shadow-sm"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content className="z-50 px-3 py-1.5 text-sm bg-black dark:bg-white text-white dark:text-black rounded-md shadow-lg animate-in fade-in zoom-in-95">
                            View Dish Story & Ingredients
                            <Tooltip.Arrow className="fill-black dark:fill-white" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg dark:text-gray-100 truncate">{dish.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{dish.description}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-medium dark:text-gray-200">${dish.price}</span>
                    <button 
                      onClick={() => onAddToBooking(dish)}
                      className="flex items-center gap-1 text-sm font-medium text-white bg-black dark:bg-white dark:text-black px-3 py-1.5 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white dark:focus:ring-offset-stone-900"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Section 4: Details Dialog */}
      <Dialog.Root open={!!selectedDish} onOpenChange={(open) => !open && setSelectedDish(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white dark:bg-stone-900 p-0 shadow-2xl overflow-hidden focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            {selectedDish && (
              <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                <div className="md:w-1/2 relative bg-gray-100 dark:bg-stone-800 min-h-[250px]">
                  <img src={selectedDish.imageUrl} alt={selectedDish.name} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="md:w-1/2 p-6 overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <Dialog.Title className="text-2xl font-serif font-bold dark:text-white">
                      {selectedDish.name}
                    </Dialog.Title>
                    <Dialog.Close className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors">
                      <X className="w-5 h-5 dark:text-gray-400" />
                    </Dialog.Close>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">The Story</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                        {selectedDish.story}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Nutrition</h4>
                        <div className="bg-gray-50 dark:bg-stone-800 p-3 rounded-lg border border-gray-100 dark:border-stone-700">
                          <span className="text-xl font-bold dark:text-white">{selectedDish.calories}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">kcal</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Ingredients</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {selectedDish.ingredients.map((ing, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-primary" /> {ing}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-stone-800">
                    <button 
                      onClick={() => {
                        onAddToBooking(selectedDish);
                        setSelectedDish(null);
                      }}
                      className="w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-xl font-medium hover:scale-[1.02] transition-transform duration-300 active:scale-95"
                    >
                      Add to Booking — ${selectedDish.price}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}