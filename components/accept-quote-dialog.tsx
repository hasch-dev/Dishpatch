"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { CheckCircle, Lock } from "lucide-react"

interface AcceptQuoteProps {
  bookingId: string
  conversationId: string
  currentUserId: string
  price: string | number
}

export function AcceptQuoteDialog({ bookingId, conversationId, currentUserId, price }: AcceptQuoteProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()

  async function handleAccept() {
    setLoading(true)

    // 1. Lock the booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'confirmed',
        // You could also add a 'locked_at' column if your schema allows
      })
      .eq('id', bookingId)

    if (!updateError) {
      // 2. Insert the definitive System Message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: `Handshake Complete: Quote of $${price} officially accepted and locked.`,
          sender_id: currentUserId,
          is_system: true
        })
      
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="text-[9px] uppercase tracking-widest h-10 rounded-none w-full bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle className="w-3 h-3 mr-2" /> Accept & Lock Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-2xl flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Confirm Deployment
          </DialogTitle>
          <DialogDescription className="pt-4 text-xs leading-relaxed font-light">
            By accepting, you agree to the current investment of <strong className="text-foreground">${price}</strong>. 
            Once locked, deployment terms and pricing cannot be modified without contacting Concierge.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            className="rounded-none text-[10px] uppercase tracking-widest border-border"
          >
            Review Again
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={loading}
            className="rounded-none text-[10px] uppercase tracking-widest bg-primary"
          >
            {loading ? "Locking..." : "Finalize Handshake"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}