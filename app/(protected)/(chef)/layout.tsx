import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh">
        <AppSidebar role="chef" />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  )
}