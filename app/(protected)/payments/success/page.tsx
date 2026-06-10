import Link from "next/link"
import { ShieldCheck, ArrowRight } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="space-y-6 text-center max-w-md p-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
            <ShieldCheck className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <h1 className="text-5xl font-serif italic font-black text-foreground">
          Commission Secured
        </h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Your payment has been successfully placed in escrow.
        </p>
        
        <div className="pt-8">
          <Link 
            href="/messages" 
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all group"
          >
            Return to Mission Control
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}