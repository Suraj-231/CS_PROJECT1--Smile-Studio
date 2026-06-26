"use client";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { authClient } from "~/server/better-auth/client";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { SignUpForm, SignInForm } from "../_components/forms";
export default function AuthPage() {
  const [form, setForm] = useState<"signUp" | "signIn">("signUp");
  function renderForm() {
    switch (form) {
      case "signUp":
        return <SignUpForm />;
      case "signIn":
        return <SignInForm />;
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

  return (
    <div className="flex flex-col px-4 gap-4 items-center justify-center min-h-screen">
      {renderForm()}
      <div>
        {form === "signUp" ? (
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
        )}
      </div>
      <p>Or</p>
      <Button onClick={handleGoogleSignIn} variant="outline">
        <SiGoogle />
        Continue with Google
      </Button>
    </div>
  );
}
