"use client";
import {
  BookCheck,
  CalendarIcon,
  ChevronRight,
  DoorOpen,
  House,
  Menu,
  Shield,
  UserCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { authClient } from "~/server/better-auth/client";
import { useIsMobile } from "~/app/hooks/use-mobile";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
export function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const isMobile = useIsMobile();

  const { data: upcoming, isLoading } = api.apps.getLatest.useQuery();


  if(isPending){
    return (
      <div>
        <Skeleton className="h-10 w-40 rounded-full p-2" />
      </div>
    )
  }
  return (
    <div className="flex py-3 items-center justify-between px-8 border-b w-full">
      {isLoading ? (
        <div className="flex gap-2 items-center">
          <Skeleton className="w-40 rounded-full p-2" />
          <Skeleton className="w-40 rounded-full p-2" />
        </div>
      ) : upcoming?.[0] ? (
        <div className="text-xs flex text-primary items-center gap-2 hover:bg-muted px-4 py-1 rounded-full cursor-pointer">
          <div className="text-muted-foreground flex items-center gap-2">
            <CalendarIcon className="" size={10} />
            <p>Upcoming Appointment: </p>
          </div>
          {upcoming[0]?.date && (
            <p className="">
              {new Date(upcoming[0].date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
          <p>{upcoming[0]?.startTime.slice(0, 5)}</p>
        </div>
      ) : (
        <div />
      )}
      {isMobile ? (
        <div className={`flex gap-4`}>
          <Button onClick={() => setOpen(!open)}>
            <Menu />
          </Button>
          {open && (
            <div className="absolute self-stretch flex flex-col justify-center py-8 gap-8 items-center top-14 right-0 w-60 bg-white h-screen z-100 border-l transition-all duration-300">
              <Link href="/">
                <Button
                  onClick={() => {
                    router.push("/");
                    setOpen(false);
                  }}
                  variant={pathname === "/" ? "default" : "ghost"}
                >
                  Home
                </Button>
              </Link>
              {session?.user.role === "admin" && (
                <Button
                  onClick={() => {
                    router.push("/admin");
                    setOpen(false);
                  }}
                  variant={pathname.startsWith("/admin") ? "default" : "ghost"}
                >
                  Admin
                </Button>
              )}

              <Button
                onClick={() => {
                  router.push("/book");
                  setOpen(false);
                }}
                variant={pathname === "/book" ? "default" : "ghost"}
              >
                Book
              </Button>

              {session ? (
                <div className="flex flex-col items-center gap-8">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push("/profile");
                      setOpen(false);
                    }}
                  >
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
                  </Button>
                </div>
              ) : (
                <>
                <Button
                  onClick={() => {
                    router.push("/auth/sign-in");
                    setOpen(false);
                  }}
                  variant={pathname === "/auth/sign-in" ? "default" : "ghost"}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    router.push("/auth/sign-up");
                    setOpen(false);
                  }}
                  variant={pathname === "/auth/sign-up" ? "default" : "ghost"}
                >
                  Create an account
                </Button>
                </>
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
              <Button
                variant={pathname.startsWith("/admin") ? "default" : "ghost"}
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
              <div className="flex gap-2">
               <Link href="/auth/sign-in">
                <Button variant={pathname === "/auth/sign-in" ? "default" : "ghost"}>
                  Log in
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant={'outline'}>
                  Create an account
                  <ChevronRight />
                </Button>
              </Link>
              </div>
              
            )}
           
          </ButtonGroup>
        </div>
      )}
    </div>
  );
}
