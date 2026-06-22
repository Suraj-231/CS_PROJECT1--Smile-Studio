"use client";
import { Calendar1, ChartColumn, PanelLeft, Users2Icon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div
      className={`flex gap-4 py-10 h-screen self-stretch bg-muted w-20 flex-col transition-all duration-300 items-center ${open ? "w-72" : ""}`}
    >
      <Button
        className="mb-20"
        variant={pathname === "/" ? "default" : "ghost"}
        onClick={() => setOpen(!open)}
      >
        <PanelLeft />
      </Button>

      <div className="flex flex-col gap-8 items-center">
        <Link href="/admin">
          <Button variant={pathname === "/admin" ? "default" : "ghost"}>
            <ChartColumn />
            {open && <span>Reports</span>}
          </Button>
        </Link>
        <Link href="/admin/calendar">
          <Button
            variant={pathname === "/admin/calendar" ? "default" : "ghost"}
          >
            <Calendar1 />
            {open && <span>Calendar</span>}
          </Button>
        </Link>
        <Link href="/admin/patients" className="mb-20">
          <Button
            variant={pathname === "/admin/patients" ? "default" : "ghost"}
          >
            <Users2Icon />
            {open && <span>Patients</span>}
          </Button>
        </Link>

        <Button variant="ghost">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </div>
  );
}
