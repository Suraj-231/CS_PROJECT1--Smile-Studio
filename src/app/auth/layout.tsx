"use client";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { authClient } from "~/server/better-auth/client";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Mail } from "lucide-react"
import { usePathname } from "next/navigation"

export default function AuthRoot({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { data: session } = authClient.useSession();
  const pathname = usePathname()

  async function handleMagicLinkSignIn() {
    setLoading(true);
      const {data, error } = await authClient.signIn.magicLink({
        email: emailInput,
        callbackURL: "/profile",
      });
      
      if (error) {
        console.log("Error sending magic link:", error);
        toast.error("Error sending magic link");
      } else {
        console.log("Magic link sent successfully:", data);
        setSent(true);
        toast.success("Magic link sent successfully");
      }
      setLoading(false);
   
    
  }

  async function handleGoogleSignIn() {
      const {data, error} = await authClient.signIn.social({
        provider: "google",
      });
      if (error) {
        console.log("Error signing in with Google", error);
        toast.error("Error signing in with Google");
      } else {
        redirect("/profile");
      }

  }

  if (session) {
    redirect("/profile");
  }

  return (
    <div className="flex flex-col px-4 gap-4 items-center justify-center min-h-screen">
     {children}
      <p>Or</p>
      <Link 
      className="hover:underline hover:text-primary"
      href={pathname === "/auth/sign-up" ? "/auth/sign-in" : "/auth/sign-up"}>
        {pathname === "/auth/sign-up" ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
      </Link>
      <Button onClick={handleGoogleSignIn} variant="outline">
        <SiGoogle />
        Continue with Google
      </Button>
    </div>
  );
}
