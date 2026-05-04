// app/(protected)/payments/page.tsx
'use client'

import * as React from 'react'
import { Lock, CheckCircle2, Loader2, CreditCard, FileText, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function LedgerPage() {
  const [deals, setDeals] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const supabase = createClient()

  React.useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Ensure we fetch through the booking to verify client ownership
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        bookings!inner ( title, status, event_date, user_id )
      `)
      .eq('bookings.user_id', user.id)
      .eq('final_paid', false)
      .order('created_at', { ascending: false })

    if (data && !error) {
      setDeals(data)
    }
    setLoading(false)
  }

  const handlePayment = async (deal: any) => {
    setProcessingId(deal.id)
    
    const isDepositPaid = deal.deposit_paid
    const paymentPhase = isDepositPaid ? 'final' : 'deposit'
    const amountToPay = isDepositPaid 
      ? (deal.agreed_price - deal.deposit_amount) 
      : deal.deposit_amount

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.id,
          amount: amountToPay,
          description: deal.bookings?.title || 'Private Chef Experience',
          paymentPhase
        })
      })

      const data = await response.json()
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl // Redirects to Xendit Invoice Page
      } else {
        console.error("No checkout URL returned:", data)
        setProcessingId(null)
      }
    } catch (error) {
      console.error("Payment failed to initialize:", error)
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8 font-sans selection:bg-primary/20">
      <header className="mb-12 max-w-5xl mx-auto space-y-4 pt-12">
        <div className="flex items-center gap-3 opacity-30">
          <div className="h-[1px] w-8 bg-foreground" />
          <p className="text-[9px] font-bold uppercase tracking-[0.5em]">Financial Archive</p>
        </div>
        <h1 className="text-6xl font-serif italic tracking-tighter">
          Client <span className="text-primary not-italic">Ledger</span>
        </h1>
      </header>

      <main className="max-w-5xl mx-auto space-y-12">
        {deals.length > 0 ? (
          <div className="border border-destructive/30 bg-destructive/5 p-6 flex items-start gap-4">
            <Lock className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-destructive mb-1">
                Pending Settlements
              </h3>
              <p className="text-sm opacity-70">
                You have outstanding invoices. Your chef's schedule and menu are only locked in once deposits are settled.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-border/40 p-16 flex flex-col items-center text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-6 opacity-80" />
            <h3 className="text-2xl font-serif italic mb-2">Your ledger is clear</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              All quotes and commissions have been settled. When you lock in a new deal with a chef, it will appear here.
            </p>
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {deals.map((deal) => {
              const isDepositPaid = deal.deposit_paid
              const remainingBalance = deal.agreed_price - deal.deposit_amount
              const amountToPay = isDepositPaid ? remainingBalance : deal.deposit_amount
              const phaseText = isDepositPaid ? 'Final Balance' : 'Initial Deposit'

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={deal.id}
                  className="group border border-border/40 bg-card flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm"
                >
                  <div className="p-8 border-b border-border/40 bg-muted/20">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        <p className="text-[10px] font-mono tracking-wider">
                          REF: {deal.id.split('-')[0].toUpperCase()}
                        </p>
                      </div>
                      <span className={cn(
                        "px-3 py-1 text-[9px] font-bold uppercase tracking-widest border",
                        isDepositPaid ? "border-primary text-primary" : "border-foreground text-foreground"
                      )}>
                        {phaseText}
                      </span>
                    </div>
                    
                    <h3 className="text-3xl font-serif italic mb-3">
                      {deal.bookings?.title || 'Private Chef Experience'}
                    </h3>
                    
                    {deal.bookings?.event_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(deal.bookings.event_date).toLocaleDateString('en-PH', { 
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Financial Breakdown */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Agreed Total</span>
                        <span>₱{deal.agreed_price?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Deposit {isDepositPaid ? '(Paid)' : '(Required)'}</span>
                        <span>₱{deal.deposit_amount?.toLocaleString()}</span>
                      </div>
                      <div className="h-px w-full bg-border/50 my-2" />
                      <div className="flex justify-between font-medium">
                        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">Amount Due Now</span>
                        <span className="text-3xl font-light tracking-tight">₱{amountToPay?.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handlePayment(deal)}
                      disabled={processingId === deal.id}
                      className="w-full h-14 rounded-none bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-foreground transition-colors relative overflow-hidden"
                    >
                      {processingId === deal.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2 z-10 relative">
                          <CreditCard className="w-4 h-4" /> Pay via Xendit
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </section>
      </main>
    </div>
  )
}