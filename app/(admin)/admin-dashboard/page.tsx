import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, Image as ImageIcon, MessageSquare } from "lucide-react";

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
    <div className="min-h-screen bg-background p-12 font-sans">
      <header className="mb-12 border-b-4 border-foreground pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          Command <span className="text-primary italic font-serif">Center</span>
        </h1>
        <div className="flex items-center gap-2 mt-2">
           <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
            Registry Admin: {user.email}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tools.map((tool) => (
          <Link key={tool.title} href={tool.href}>
            <div className="p-8 border-2 border-foreground/10 bg-card hover:border-primary transition-all cursor-pointer group h-full">
              <tool.icon className="mb-4 text-muted-foreground group-hover:text-primary transition-colors" size={28} />
              <h2 className="text-lg font-black uppercase tracking-widest group-hover:text-primary transition-colors">
                {tool.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-2 font-light leading-relaxed">
                {tool.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}