"use client";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { authClient } from "~/server/better-auth/client";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { SignUpForm, SignInForm } from "../_components/forms";
import { redirect } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";
export default function AuthPage() {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { data: session } = authClient.useSession();
  const [form, setForm] = useState<"signUp" | "signIn">("signUp");
  function renderForm() {
    switch (form) {
      case "signUp":
        return <SignUpForm />;
      case "signIn":
        return <SignInForm />;
    }
  }

  async function handleMagicLinkSignIn() {
    setLoading(true);
    try {
      await authClient.signIn.magicLink({
        email: emailInput,
        callbackURL: "/profile",
      });
      setSent(true)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      await authClient.signIn.social({
        provider: "google",
      });
      redirect("/profile");
    } catch (error) {
      console.log("Error signing in with Google");
      // toast.error("Error signing in with Google");
    }
  }

  if (session) {
    redirect("/profile");
  }

  return (
    <div className="flex flex-col px-4 gap-4 items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <p className="text-muted-foreground">
        Enter your email to receive a magic link
      </p>
    {sent ? (
      <div className="flex flex-col text-center items-center justify-center">
        <CheckCircle2 />
        <p className="text-muted-foreground text-sm">
          A link to sign in has been sent to your email.
        </p>
      </div>
    ):(
      <div className="flex sm:flex-row flex-col  sm:gap-0 gap-4">
        <Input
          value={emailInput}
          placeholder="Enter your email "
          onChange={(e) => setEmailInput(e.target.value)}
          type="email"
          className="w-full sm:rounded-r-none py-6 w-[300px]"
        />
        <Button
          disabled={loading}
          className="sm:rounded-l-none py-6 "
          onClick={handleMagicLinkSignIn}
          variant="default"
        >
          {loading ? (
            "Sending..."
          ) : (
            <>
              <Mail />
              Send Magic Link
            </>
          )}
        </Button>
        
      </div>
    )}
     <p>Or</p>
      <Button onClick={handleGoogleSignIn} variant="outline">
        <SiGoogle />
        Continue with Google
      </Button>
      

     
    </div>
  );
}
