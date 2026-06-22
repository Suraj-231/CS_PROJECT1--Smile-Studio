"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Book,
  Loader2,
  Settings,
  LogOut,
  Calendar,
  RefreshCcw,
} from "lucide-react";
import { authClient } from "~/server/better-auth/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
const GRADIENTS = [
  { name: "modern iris", css: "from-[#667EEA] via-[#764BA2] to-[#AC92EC]" },
  { name: "vibrant mint", css: "from-[#43E97B] via-[#38F9D7] to-[#209CFF]" },
  { name: "sunset glow", css: "from-[#FBAB7E] via-[#F7CE68] to-[#F06292]" },
  { name: "electric cyan", css: "rom-[#4FACFE] via-[#00F2FE] to-[#43CBFF]" },
  { name: "cotton candy", css: "from-[#E0C3FC] via-[#8EC5FC] to-[#F8BBD0]" },
  { name: "coral blue", css: "from-[#1E3C72] via-[#2A5298] to-[#4286F4]" },
  { name: "fresh peach", css: "from-[#FF9A9E] via-[#FAD0C4] to-[#F9E79F]" },
  { name: "serene sky", css: "from-[#C2E9FB] via-[#A1C4FD] to-[#CE9FFC]" },
  { name: "morning mist", css: "from-[#A1FFCE] via-[#FAFFD1] to-[#FDFBFB]" },
  { name: "violent flame", css: "from-[#BB73E0] via-[#FF71B0] to-[#7E30E1]" },
];

export default function ProfilePage() {
  const [gradient, setGradient] = useState(
    GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
  );
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const {
    data: apps,
    isLoading: appsLoading,
    isError: appsError,
  } = api.apps.getForUser.useQuery({
    userId: session?.user.id,
    enabled: !!session?.user.id,
  });

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="flex  flex-col items-center justify-center min-h-screen">
      <div className="flex  items-center gap-4">
        <div className="border flex flex-col rounded-md p-2 w-80 h-96">
          <div
            className={`bg-gradient-to-br ${gradient?.css}  h-72 rounded-md`}
          />
          <Avatar size="lg" className="-mt-4">
            {session.user.image && (
              <AvatarImage src={session.user.image} alt={session.user.name} />
            )}
            <AvatarFallback>
              {session.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col mb-3">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl">{session.user.name}</h1>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" className="text-muted-foreground">
                      <Settings size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Profile Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setGradient(
                          GRADIENTS[
                            Math.ceil(Math.random() * GRADIENTS.length - 1)
                          ],
                        );
                      }}
                      variant="default"
                      className="cursor-pointer"
                    >
                      <RefreshCcw size={16} />
                      Change gradient
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      className="cursor-pointer"
                    >
                      <LogOut size={16} />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-xs text-muted-foreground ">
                {new Date(session.user.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground ">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="border overflow-y-auto p-2 rounded-lg w-80 h-96">
          <div className="flex gap-2 items-center">
            <Book size={16} />
            Appointment History
          </div>

          <div className="flex flex-col  gap-2">
            {appsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-full p-2 mb-2" />
              ))
            ) : apps.length > 0 ? (
              apps.map((app, i) => (
                <div
                  key={i}
                  className="w-full flex justify-between items-center px-4 py-2 "
                >
                  {app.date}
                  {app.service}
                  {app.startTime}
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center mt-10">
                No appointments found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
