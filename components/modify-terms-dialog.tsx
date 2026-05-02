// components/modify-terms-dialog.tsx
"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"

export function ModifyTermsDialog({ booking, conversationId, currentUserId }: any) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const newPrice = formData.get("price")
    const newPax = formData.get("pax")
    
    // 1. Update the Booking Notes (JSON)
    const updatedNotes = {
      ...booking.notes,
      price: newPrice,
      guestRange: { min: newPax, max: newPax }
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ notes: updatedNotes })
      .eq('id', booking.id)

    if (!updateError) {
      // 2. Insert the System Message into the conversation
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: `Deployment terms updated: $${newPrice} for ${newPax} guests.`,
          sender_id: currentUserId, // Or a system UUID if preferred
          is_system: true
        })
      
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="text-[9px] uppercase tracking-widest h-10 rounded-none w-full">
          Modify Terms
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-2xl">Adjust Deployment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-[10px] uppercase tracking-widest">Investment (USD)</Label>
            <Input id="price" name="price" defaultValue={booking.notes?.price} className="rounded-none border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pax" className="text-[10px] uppercase tracking-widest">Guest Count</Label>
            <Input id="pax" name="pax" defaultValue={booking.notes?.guestRange?.max} className="rounded-none border-border" />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-none uppercase tracking-[0.2em] text-[10px]">
            {loading ? "Transmitting..." : "Update & Notify Client"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}