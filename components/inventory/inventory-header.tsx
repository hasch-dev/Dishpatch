import Link from "next/link";
import { ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InventoryHeader() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/10 pb-6">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
          <ShieldCheck className="text-primary h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tighter text-foreground">
            Inventory Ledger
          </h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 mt-1">
            Beginning Balance ± Operation Δ = Account Balance Matrix
          </p>
        </div>
      </div>

      <Link href="/distributions">
        <Button className="rounded-lg h-11 bg-primary px-5 text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all flex items-center gap-2.5 shadow-md shadow-primary/5">
          <Truck className="h-4 w-4" strokeWidth={2} />
          View Distribution Matrix
        </Button>
      </Link>
    </header>
  );
}