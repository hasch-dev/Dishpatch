import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh">
        <AppSidebar role="user" />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  )
}