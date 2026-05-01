'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ChefQuoteAction({ bookingId, onQuoteSent }: { bookingId: string, onQuoteSent: () => void }) {
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendQuote = async () => {
    setIsSubmitting(true);
    const res = await fetch('/api/bookings/set-quote', {
      method: 'PATCH',
      body: JSON.stringify({ bookingId, finalPrice: parseFloat(price) }),
    });

    if (res.ok) {
      alert("Quote sent! The client can now fund the commission.");
      onQuoteSent();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 border-t border-border bg-muted/5 space-y-4">
      <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Chef Administrative Actions</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40">₱</span>
          <Input 
            type="number" 
            placeholder="Final Agreed Amount" 
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="pl-8 bg-background rounded-none border-border/40"
          />
        </div>
        <Button 
          disabled={!price || isSubmitting} 
          onClick={handleSendQuote}
          className="rounded-none uppercase text-[9px] tracking-widest"
        >
          {isSubmitting ? 'Sending...' : 'Lock Price'}
        </Button>
      </div>
    </div>
  );
}