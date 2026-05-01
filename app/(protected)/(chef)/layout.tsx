import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="flex min-h-svh w-full bg-background">
        <section className="flex-1 w-full overflow-y-auto">
          {children}
        </section>
      </div>
  )
}