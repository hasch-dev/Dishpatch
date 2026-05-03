'use client'

import * as React from 'react'
import { AlertCircle, QrCode, ArrowRight, Lock, MessageSquare, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function LedgerPage() {
  const [selectedDeal, setSelectedDeal] = React.useState<any | null>(null)
  const [isExpanding, setIsExpanding] = React.useState(false)

  // Determine payment phase based on DB state
  const isDepositPaid = selectedDeal?.deposit_paid
  const currentAmount = isDepositPaid 
    ? (selectedDeal?.agreed_price - selectedDeal?.deposit_amount) 
    : selectedDeal?.deposit_amount

  const handlePayment = async () => {
    setIsExpanding(true)
    // Backend Call: fetch('/api/payments/checkout', { ... })
  }

  return (
    <div className="min-h-screen bg-background p-8 font-sans selection:bg-primary/20">
      <header className="mb-12 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center gap-3 opacity-30">
          <div className="h-[1px] w-8 bg-foreground" />
          <p className="text-[9px] font-bold uppercase tracking-[0.5em]">Financial Archive</p>
        </div>
        <h1 className="text-6xl font-serif italic tracking-tighter">Client <span className="text-primary not-italic">Ledger</span></h1>
      </header>

      <main className="max-w-5xl mx-auto space-y-12">
        {/* Outstanding Balance Warning */}
        <div className="border border-destructive/30 bg-destructive/5 p-6 flex items-start gap-4">
          <Lock className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-destructive mb-1">Booking Lock Active</h3>
            <p className="text-sm opacity-70">New commissions are restricted until pending invoices are settled.</p>
          </div>
        </div>

        {/* List of Commissions (Deals) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setSelectedDeal({ id: '1', title: 'Private Tasting', agreed_price: 15000, deposit_amount: 7500, deposit_paid: false })}
            className="group border border-border/40 p-8 cursor-pointer hover:border-primary transition-all relative"
          >
            <p className="text-[9px] font-mono opacity-40 mb-4">DEAL_REF_ID</p>
            <h3 className="text-3xl font-serif italic mb-6">Private Tasting</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] uppercase tracking-widest opacity-40 mb-1">Current Due</p>
                <p className="text-4xl font-light">₱7,500</p>
              </div>
              <ArrowRight className="h-6 w-6 text-primary group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </section>
      </main>

      {/* Expanded Payment Interface */}
      <AnimatePresence>
        {selectedDeal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedDeal(null); setIsExpanding(false); }} className="absolute inset-0 bg-background/95 backdrop-blur-md" />
            
            <motion.div 
              layout 
              className={cn(
                "relative bg-card border border-border/40 shadow-2xl flex transition-all duration-500 overflow-hidden",
                isExpanding ? "w-full max-w-5xl h-[650px]" : "w-full max-w-xl h-[650px]"
              )}
            >
              {/* Info Pane */}
              <div className={cn("p-12 flex flex-col h-full border-r border-border/20", isExpanding ? "w-1/2" : "w-full")}>
                <div className="flex-1">
                  <h2 className="text-4xl font-serif italic mb-8">{selectedDeal.title}</h2>
                  <div className="space-y-6">
                    <div className="flex justify-between border-b border-border/20 pb-4">
                      <span className="text-[10px] uppercase tracking-widest opacity-40">Total Quote</span>
                      <span className="font-bold">₱{selectedDeal.agreed_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-4">
                      <span className="text-[10px] uppercase tracking-widest opacity-40">Status</span>
                      <span className="text-primary italic">{isDepositPaid ? 'Deposit Settled' : 'Awaiting Deposit'}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-8 space-y-4">
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold">Amount to Pay</p>
                    <p className="text-4xl font-light">₱{currentAmount.toLocaleString()}</p>
                  </div>
                  {!isExpanding ? (
                    <Button onClick={handlePayment} className="w-full h-16 rounded-none bg-primary text-[10px] uppercase tracking-widest font-bold">Initialize Payment</Button>
                  ) : (
                    <Button variant="ghost" onClick={() => setIsExpanding(false)} className="w-full text-[9px] uppercase opacity-40">Return to Details</Button>
                  )}
                </div>
              </div>

              {/* QR / Gateway Pane */}
              {isExpanding && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-1/2 p-12 bg-background flex flex-col items-center justify-center text-center">
                  <QrCode className="h-12 w-12 text-primary mb-6" />
                  <h3 className="text-2xl font-serif italic mb-2">Scan QR Ph</h3>
                  <p className="text-xs opacity-50 mb-10 max-w-xs">Scan using GCash, Maya, or any PH bank app to settle this commission.</p>
                  <div className="w-64 h-64 border-4 border-primary/20 bg-white p-4 flex items-center justify-center mb-10">
                    <QrCode className="h-32 w-32 text-black/10" />
                  </div>
                  <p className="text-[8px] uppercase tracking-[0.4em] opacity-30">Automatic e-receipt will be issued</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}