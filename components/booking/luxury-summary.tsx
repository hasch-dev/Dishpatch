// components/booking/LuxurySummary.tsx
"use client";

import React from "react";
import { format } from "date-fns";

type BookingDetails = {
  date: Date;
  guests: number;
  location: string;
  clientName: string;
  selectedDishes: Array<{ id: string; name: string; price: number; quantity: number }>;
  culinaryDirection: string;
};

export default function LuxurySummary({ details }: { details: BookingDetails }) {
  const subtotal = details.selectedDishes.reduce((acc, dish) => acc + (dish.price * dish.quantity), 0);
  const serviceCharge = subtotal * 0.18; // 18% service charge
  const total = subtotal + serviceCharge;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 md:p-12">
      {/* Outer border acting as the "book" cover/binding edge */}
      <div className="relative bg-[#faf9f6] dark:bg-[#1a1918] shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 rounded-sm p-1">
        
        {/* Inner menu border */}
        <div className="border border-double border-gray-300 dark:border-stone-700 p-8 sm:p-12 relative overflow-hidden">
          
          {/* Subtle background texture or watermark could go here */}
          
          <div className="text-center space-y-4 mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-widest text-gray-900 dark:text-[#e8e6e1] uppercase">
              Dishpatch
            </h1>
            <div className="w-24 h-px bg-gray-300 dark:bg-stone-700 mx-auto" />
            <p className="text-sm tracking-widest text-gray-500 dark:text-gray-400 uppercase">
              Private Culinary Experience
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm font-serif mb-12 border-y border-gray-200 dark:border-stone-800 py-6 text-gray-700 dark:text-gray-300">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">For</p>
              <p className="text-lg">{details.clientName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Date</p>
              <p className="text-lg">{format(details.date, "MMMM do, yyyy")}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Guests</p>
              <p className="text-lg">{details.guests} Persons</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Location</p>
              <p className="text-lg truncate">{details.location}</p>
            </div>
          </div>

          <div className="space-y-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="font-serif text-xl tracking-widest text-gray-900 dark:text-[#e8e6e1] uppercase">
                The Menu
              </h2>
              <p className="text-xs text-gray-500 italic mt-2">Direction: {details.culinaryDirection}</p>
            </div>

            <div className="space-y-6">
              {details.selectedDishes.map((dish) => (
                <div key={dish.id} className="flex items-baseline justify-between font-serif group">
                  <div className="flex-1 flex items-baseline">
                    <span className="text-base text-gray-800 dark:text-gray-200">
                      {dish.quantity > 1 ? `${dish.quantity}x ` : ''}{dish.name}
                    </span>
                    {/* Dotted line leader */}
                    <div className="flex-1 border-b border-dotted border-gray-300 dark:border-stone-700 mx-4 relative top-[-4px] group-hover:border-gray-400 transition-colors" />
                  </div>
                  <span className="text-base text-gray-800 dark:text-gray-200 tracking-wider">
                    ${(dish.price * dish.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-1/2 ml-auto space-y-2 border-t border-gray-200 dark:border-stone-800 pt-4 font-serif text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Service Charge (18%)</span>
              <span>${serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg text-gray-900 dark:text-[#e8e6e1] pt-2 border-t border-gray-200 dark:border-stone-800 mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer signature area */}
          <div className="mt-20 text-center space-y-2">
            <p className="font-serif italic text-gray-400 dark:text-stone-600">Awaiting your approval</p>
            <button className="px-8 py-3 bg-gray-900 dark:bg-[#e8e6e1] text-white dark:text-gray-900 font-serif tracking-widest text-sm uppercase hover:bg-black dark:hover:bg-white transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-offset-[#1a1918]">
              Confirm Reservation
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}