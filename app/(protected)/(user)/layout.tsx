

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="flex min-h-svh w-full bg-background">
        {/* We no longer need to pass role="user" here */}
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>

  )
}