"use client";
import { BookCheck, DoorOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { authClient } from "~/server/better-auth/client";

export function Header() {
  const session = authClient.useSession();
  return (
    <div className="flex mb-8 py-8 items-center justify-between px-8 border-b w-full">
      <h1 className="text-2xl">Welcome to Smile Studio</h1>

      <div className="flex gap-4">
        <Link href="/book">
          <Button>
            Book <BookCheck />
          </Button>
        </Link>
        <ButtonGroup>
          <Button>
            {session.data ? `Welcome, ${session.data.user.name}` : "Sign In"}
            <DoorOpen />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
