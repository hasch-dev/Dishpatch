"use client";
import { usePathname } from "next/navigation";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSelectionPage = pathname === "/booking/new";

  // Selection page scrolls naturally
  if (isSelectionPage) {
    return <div className="h-full w-full overflow-y-auto">{children}</div>;
  }

  // Forms get the "Locked" layout
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {children}
    </div>
  );
}