import { Metadata } from "next";
import TestimonialsTable from "@/components/admin/testimonials-table";

export const metadata: Metadata = {
  title: "Shared Moments | Dishpatch Admin",
  description: "Manage client testimonials and shared moments.",
};

export default function AdminTestimonialsPage() {
  return (
    <div className="flex-1 space-y-8 p-8 md:p-12 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Shared Moments</h2>
          <p className="text-muted-foreground text-sm font-light mt-1">
            Manage the stories and testimonials displayed on the live environment.
          </p>
        </div>
      </div>
      
      <div className="border border-border bg-background shadow-sm">
        <TestimonialsTable />
      </div>
    </div>
  );
}