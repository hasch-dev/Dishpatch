import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, Image as ImageIcon, MessageSquare, ArrowRight } from "lucide-react";

const ADMIN_EMAILS = ["haschdevv@gmail.com", "dispatch5@gmail.com"];

export default async function AdminDashboard() {
  const supabase = await createClient(); 
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login"); 

  const userEmail = user.email?.toLowerCase();
  const isAdmin = userEmail && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(userEmail);

  if (!isAdmin) redirect("/"); 

  const tools = [
    {
      title: "Products Registry",
      desc: "CRUD operations for Dishpatch culinary products.",
      href: "/admin-products",
      icon: Package
    },
    {
      title: "Gallery Assets",
      desc: "Manage high-res visual assets and chef photography.",
      href: "/admin-gallery",
      icon: ImageIcon
    },
    {
      title: "Inquiry Feed",
      desc: "Review and respond to incoming client transmissions.",
      href: "/admin-inquiries",
      icon: MessageSquare
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8 md:p-12 font-sans">
      
      {/* Modernized Header */}
      <header className="mb-12 flex flex-col gap-3">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          Command <span className="text-primary">Center</span>
        </h1>
        <div className="flex items-center gap-2.5">
           {/* Upgraded pulsing status indicator */}
           <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
           </span>
           <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Registry Admin • {user.email}
          </p>
        </div>
      </header>

      {/* Pill-based Grid Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link key={tool.title} href={tool.href}>
            <div className="p-8 rounded-3xl border border-border/60 bg-card/40 hover:bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden">
              
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <tool.icon className="text-primary group-hover:text-primary-foreground transition-colors" size={26} strokeWidth={1.5} />
              </div>
              
              <h2 className="text-lg font-semibold tracking-tight text-foreground mb-2">
                {tool.title}
              </h2>
              
              <p className="text-sm text-muted-foreground font-normal leading-relaxed pr-6">
                {tool.desc}
              </p>

              {/* Seamless Action Indicator */}
              <div className="mt-auto pt-6 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Manage
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
              
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}