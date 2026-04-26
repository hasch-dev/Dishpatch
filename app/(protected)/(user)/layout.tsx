import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background">
        {/* We no longer need to pass role="user" here */}
        <AppSidebar />
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}