"use client";
import { BookCheck, DoorOpen, UserCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { authClient } from "~/server/better-auth/client";

export function Header() {
  const session = authClient.useSession();
  return (
    <div className="flex py-3 items-center justify-between px-8 border-b w-full">
      <h1 className="text-xl text-muted-foreground">Welcome to Smile Studio</h1>

      <div className="flex gap-4">
        <Link href="/book">
          <Button>
            Book <BookCheck />
          </Button>
        </Link>
        <ButtonGroup>
          {session.data ? (
            <Link href="/profile">
              <Button>
                Welcome, {session.data.user.name}
                <UserCircle2 />
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button>
                Sign In
                <DoorOpen />
              </Button>
            </Link>
          )}
        </ButtonGroup>
      </div>
    </div>
  );
}
