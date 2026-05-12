"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Users2 } from "lucide-react";

const PAX_RANGES = ["2", "3-6", "7-10", "10+"];

export default function PricingStrategyInput({ pricing, setPricing, isFixed, setIsFixed }: any) {
  return (
    <div className="py-8 border-y border-border/10 space-y-6">
      <div className="flex justify-between items-center">
        <label className="text-[9px] uppercase font-black tracking-widest opacity-50">Pricing Configuration</label>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsFixed(!isFixed)}
          className="h-7 rounded-none text-[8px] uppercase tracking-tighter border-primary/30 hover:bg-primary/5"
        >
          {isFixed ? <Users2 size={10} className="mr-2" /> : <CircleDollarSign size={10} className="mr-2" />}
          {isFixed ? "Switch to Pax Pricing" : "Set Fixed Price"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          {isFixed ? (
            <div className="space-y-2">
              <span className="text-[10px] font-mono opacity-40 uppercase">Flat Rate (Global)</span>
              <Input 
                type="number"
                placeholder="0.00"
                value={pricing["fixed"] || ""}
                onChange={(e) => setPricing({ ...pricing, fixed: e.target.value })}
                className="rounded-none border-0 border-b border-border/40 bg-transparent h-10 text-xl font-serif italic"
              />
            </div>
          ) : (
            PAX_RANGES.map((range) => (
              <div key={range} className="flex items-center gap-4 group">
                <span className="text-[10px] w-16 font-mono opacity-40 group-hover:opacity-100 transition-opacity">{range} PAX</span>
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={pricing[range] || ""}
                  onChange={(e) => setPricing({ ...pricing, [range]: e.target.value })}
                  className="rounded-none border-0 border-b border-border/40 bg-transparent h-8 focus-visible:border-primary transition-colors"
                />
              </div>
            ))
          )}
        </div>

        <div className="bg-muted/10 p-8 border border-border/20 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5"><CircleDollarSign size={80} /></div>
          <p className="text-[9px] uppercase font-black tracking-widest opacity-30 mb-6 text-center">Live Quote Preview</p>
          <div className="space-y-4">
            {isFixed ? (
               <div className="flex justify-between items-end border-b border-dotted border-border/40 pb-1">
                 <span className="text-[10px] uppercase tracking-tighter opacity-60">Flat Rate</span>
                 <span className="font-serif italic text-2xl text-primary">₱{Number(pricing["fixed"] || 0).toLocaleString()}</span>
               </div>
            ) : (
              PAX_RANGES.map((range) => (
                <div key={range} className="flex justify-between items-end border-b border-dotted border-border/40 pb-1">
                  <span className="text-[10px] uppercase tracking-tighter opacity-60">{range} Guests</span>
                  <span className="font-serif italic text-lg">₱{Number(pricing[range] || 0).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}