import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

      <div className="flex min-h-svh w-full bg-background">
        {/* We no longer need to pass role="chef" here */}
   
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>
  )
}