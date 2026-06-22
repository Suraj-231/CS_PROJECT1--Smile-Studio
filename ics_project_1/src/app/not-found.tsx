"use client";
import { ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen">
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button onClick={() => router.back()}>
        <ChevronLeft />
        Go back
      </Button>
    </div>
  );
}
