"use client";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { authClient } from "~/server/better-auth/client";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { SignUpForm, SignInForm } from "../_components/forms";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
export default function AuthPage() {
  const [emailInput, setEmailInput] = useState("");
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
    try {
      await authClient.signIn.magicLink({
        email: emailInput,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleGoogleSignIn() {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/profile",
      });
    } catch (error) {
      console.log("Error signing in with Google");
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
      <div className="flex sm:flex-row flex-col sm:gap-0 gap-4">
        <Input
          value={emailInput}
          placeholder="Enter your email "
          onChange={(e) => setEmailInput(e.target.value)}
          type="email"
          className="w-full sm:rounded-r-none py-6 w-[300px]"
        />
        <Button
          className="sm:rounded-l-none py-6 "
          onClick={handleMagicLinkSignIn}
          variant="default"
        >
          <Mail />
          Send Magic Link
        </Button>
      </div>

      {/*{renderForm()}*/}
      <div>
        {/*{form === "signUp" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setForm("signIn")}
              className="text-primary cursor-pointer underline"
            >
              Sign in
            </span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setForm("signUp")}
              className="text-primary cursor-pointer underline"
            >
              Sign in
            </span>
          </p>
        )}*/}
      </div>
      <p>Or</p>
      <Button onClick={handleGoogleSignIn} variant="outline">
        <SiGoogle />
        Continue with Google
      </Button>
    </div>
  );
}
