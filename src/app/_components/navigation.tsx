"use client";
import {
  BookCheck,
  DoorOpen,
  House,
  Menu,
  Shield,
  UserCircle2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { authClient } from "~/server/better-auth/client";
import { useIsMobile } from "~/app/hooks/use-mobile";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const isMobile = useIsMobile();
  return (
    <div className="flex py-3 items-center justify-between px-8 border-b w-full">
      <div />
      {isMobile ? (
        <div className={`flex gap-4`}>
          <Button onClick={() => setOpen(!open)}>
            <Menu />
          </Button>
          {open && (
            <div className="absolute self-stretch flex flex-col justify-center py-8 gap-8 items-center top-14 right-0 w-60 bg-white h-screen z-100 border-l transition-all duration-300">
              <Link href="/">
                <Button variant={pathname === "/" ? "default" : "ghost"}>
                  Home
                </Button>
              </Link>
              {session?.user.role === "admin" && (
                <Link href="/admin">
                  <Button
                    variant={
                      pathname.startsWith("/admin") ? "default" : "ghost"
                    }
                  >
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/book">
                <Button variant={pathname === "/book" ? "default" : "ghost"}>
                  Book
                </Button>
              </Link>

              {session ? (
                <div className="flex flex-col items-center gap-8">
                  <Link href="/profile">
                    <Button>Profile</Button>
                  </Link>
                  <Avatar>
                    {session?.user?.image && (
                      <AvatarImage
                        src={session?.user?.image}
                        alt={session?.user?.name ?? ""}
                      />
                    )}
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <Link href="/auth">
                  <Button variant={pathname === "/auth" ? "default" : "ghost"}>
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/">
            <Button variant={pathname === "/" ? "default" : "ghost"}>
              Home
            </Button>
          </Link>
          {session?.user.role === "admin" && (
            <Link href="/admin">
              <Button variant={pathname === "/admin" ? "default" : "ghost"}>
                Admin
              </Button>
            </Link>
          )}
          <Link href="/book">
            <Button variant={pathname === "/book" ? "default" : "ghost"}>
              Book
            </Button>
          </Link>
          <ButtonGroup>
            {session ? (
              <Link href="/profile">
                <Button
                  variant={pathname === "/profile" ? "default" : "ghost"}
                  className={pathname === "/profile" ? "text-white" : ""}
                >
                  <Avatar size="sm">
                    {session.user.image && (
                      <AvatarImage
                        src={session.user.image}
                        alt={session.user.name}
                      />
                    )}

                    <AvatarFallback>
                      {session.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {session.user.name}
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant={pathname === "/auth" ? "default" : "ghost"}>
                  Sign In
                </Button>
              </Link>
            )}
          </ButtonGroup>
        </div>
      )}
    </div>
  );
}
