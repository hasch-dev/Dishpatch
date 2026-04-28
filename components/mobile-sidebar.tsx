"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";

export default function MobileSidebar({
  role,
  profile,
}: {
  role: "chef" | "user";
  profile: any;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu size={16} />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 w-64">
        <Sidebar role={role} profile={profile} />
      </SheetContent>
    </Sheet>
  );
}