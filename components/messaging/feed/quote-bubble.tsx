"use client"

import { useState, useEffect } from "react"
import { Check, X, Timer, RefreshCw, AlertTriangle, FileText, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

function NegotiationTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime()
      if (difference <= 0) {
        setTimeLeft("00:00")
        onExpire()
        return false
      }
      const minutes = Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, "0")
      const seconds = Math.floor((difference / 1000) % 60).toString().padStart(2, "0")
      setTimeLeft(`${minutes}:${seconds}`)
      return true
    }

    calculateTime()
    const interval = setInterval(() => {
      if (!calculateTime()) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest animate-pulse">
      <Timer size={12} /> {timeLeft}
    </div>
  )
}

export function QuoteBubble({
  message, isMe, isChefSession, bookingId, budgetMin = 0, budgetMax = 0, processingId, onResolveQuote, onExpire
}: {
  message: any
  isMe: boolean
  isChefSession: boolean
  bookingId?: string
  budgetMin?: number
  budgetMax?: number
  processingId: string | null
  onResolveQuote: (id: string, metadata: any, action: "accepted" | "rejected" | "counter", counterValue?: number) => void
  onExpire: (id: string) => void
}) {
  const [showCounterInput, setShowCounterInput] = useState(false)
  const [counterPrice, setCounterPrice] = useState("")
  const router = useRouter()

  const metadata = typeof message.metadata === 'string' ? JSON.parse(message.metadata) : (message.metadata || {})
  const { price, expires_at } = metadata
  
  const status = message.proposal_status
  const isPending = status === "pending"
  const isAccepted = status === "accepted"

  const numericCounterPrice = parseFloat(counterPrice) || 0
  const inlineCounterOutOfBounds = isChefSession && counterPrice !== "" && (
    (budgetMin > 0 && numericCounterPrice < budgetMin) || 
    (budgetMax > 0 && numericCounterPrice > budgetMax)
  )

  const handleCounterSubmit = () => {
    onResolveQuote(message.id, metadata, "counter", numericCounterPrice)
    setShowCounterInput(false)
    setCounterPrice("")
  }

  return (
    <div className="my-6 w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-200">
      <div className={`bg-card border rounded-2xl shadow-md overflow-hidden transition-all ${
        isAccepted ? "border-green-500/30 shadow-green-950/[0.02]" : "border-border"
      }`}>
        
        {/* Card Header */}
        <div className={`p-4 flex justify-between items-center border-b ${
          isAccepted ? "bg-green-500/[0.02] border-green-500/10" : "bg-primary/5 border-border"
        }`}>
          <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${
            isAccepted ? "text-green-600" : "text-primary"
          }`}>
            <FileText size={16} /> {isAccepted ? "Contract Verified" : "Official Proposal"}
          </div>
          {isPending && expires_at ? (
            <NegotiationTimer expiresAt={expires_at} onExpire={() => onExpire(message.id)} />
          ) : (
            <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full font-bold ${
              isAccepted ? "bg-green-500/10 text-green-600 border border-green-500/20" :
              status === "rejected" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
              status === "revised" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
              "bg-muted text-muted-foreground border border-border"
            }`}>{status || "Archived"}</span>
          )}
        </div>

        {/* Card Body */}
        <div className="p-8 text-center bg-background">
          <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-muted-foreground block mb-1">
            {isAccepted ? "Locked Final Escrow" : "Proposed Escrow Value"}
          </span>
          <h2 className={`text-4xl font-serif italic font-black ${isAccepted ? "text-green-600" : "text-foreground"}`}>
            ₱{Number(price).toLocaleString()}
          </h2>
        </div>

        {/* Action Controls Section */}
        <div className={`p-4 border-t ${isAccepted ? "bg-green-500/[0.01] border-green-500/10" : "bg-muted/30 border-border"}`}>
          {isPending ? (
            !isMe ? (
              <>
                {!showCounterInput ? (
                  <div className="flex gap-2 w-full">
                    <button 
                      disabled={processingId !== null} 
                      onClick={() => onResolveQuote(message.id, metadata, "accepted")} 
                      className="flex-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider py-3 rounded-xl hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button 
                      disabled={processingId !== null} 
                      onClick={() => setShowCounterInput(true)} 
                      className="flex-1 bg-background border border-foreground/10 hover:border-primary/30 text-[10px] font-black uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 text-foreground transition-all"
                    >
                      <RefreshCw size={14} /> Counter
                    </button>
                    <button 
                      disabled={processingId !== null} 
                      onClick={() => onResolveQuote(message.id, metadata, "rejected")} 
                      className="px-4 border border-foreground/10 hover:border-red-500/30 hover:bg-red-500/5 text-[10px] font-bold uppercase py-3 rounded-xl text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <X size={14} /> Refuse
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-150">
                    {isChefSession && budgetMin > 0 && budgetMax > 0 && (
                      <div className={`text-[9px] font-mono uppercase tracking-wider ${inlineCounterOutOfBounds ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                        Target Range: ₱{budgetMin.toLocaleString()} - ₱{budgetMax.toLocaleString()}
                      </div>
                    )}
                    <div className="flex gap-2 w-full">
                      <div className="flex-1 relative flex items-center">
                        <input 
                          type="number" placeholder="Enter counter..." value={counterPrice} 
                          onChange={(e) => setCounterPrice(e.target.value)} 
                          className={`w-full bg-background border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none transition-all ${
                            inlineCounterOutOfBounds ? "border-red-500 text-red-500" : "border-foreground/10 focus:border-primary"
                          }`} 
                        />
                        {inlineCounterOutOfBounds && <AlertTriangle size={14} className="absolute right-3 text-red-500" />}
                      </div>
                      <button onClick={handleCounterSubmit} disabled={inlineCounterOutOfBounds || !numericCounterPrice} className="bg-primary text-primary-foreground px-4 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-40 transition-all">Submit</button>
                      <button onClick={() => { setShowCounterInput(false); setCounterPrice("") }} className="bg-background border border-foreground/10 px-3 rounded-xl text-muted-foreground hover:bg-muted transition-all"><X size={14} /></button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full text-center py-2 text-[10px] font-mono text-muted-foreground tracking-widest uppercase italic opacity-70">
                Awaiting client action...
              </div>
            )
          ) : isAccepted ? (
            !isChefSession ? (
              <button 
                onClick={() => router.push(`/bookings/${bookingId}/payment`)}
                className="w-full bg-green-600 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-green-900/10"
              >
                <CreditCard size={14} /> Complete Secure Payment
              </button>
            ) : (
              <div className="w-full text-center py-2 text-[10px] font-mono text-green-600 font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
                <Check size={12} /> Approved & Transmitted to Client Escrow
              </div>
            )
          ) : (
             <div className="w-full text-center py-1 text-[10px] font-mono text-muted-foreground tracking-widest uppercase italic">
                Negotiation Cycle Concluded
             </div>
          )}
        </div>
      </div>
    </div>
  )
}