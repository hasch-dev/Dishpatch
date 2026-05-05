// app/(user)/layout.tsx
export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full bg-background">
      
      <section className="flex-1 w-full relative overflow-y-auto">
        {children}
      </section>
    </div>
  );
}