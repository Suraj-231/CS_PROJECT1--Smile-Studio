"use client";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { authClient } from "~/server/better-auth/client";
import { SiGoogle } from "@icons-pack/react-simple-icons";

import { toast } from "sonner";

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

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  async function handleSignUp() {
    setLoading(true);
    if (!formData.email || !formData.password || !formData.name) {
      console.log("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        callbackURL: "/profile",
      });
    } catch (error) {
      toast.error("Error creating an account", {
        description: "Please try again.",
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex flex-col gap-4 w-80 justify-self-center">
      <div className="text-center mb-4">
        <h1 className="text-xl ">Create an Account</h1>
        <p className="text-muted-foreground">
          To be able to book appointments, you will have to create an account
          first.
        </p>
      </div>
      <div className="flex flex-col gap-4 w-80">
        <div>
          <span>Name</span>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <span>Email</span>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <span>Password</span>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <Button onClick={handleSignUp} disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSignIn() {
    setLoading(true);
    try {
      await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/profile",
      });
    } catch (error) {
      toast.error("Error logging in.", { description: "Please try again." });
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 w-80 justify-self-center">
      <div className="text-center mb-4">
        <h1 className="text-xl ">Sign In</h1>
        <p className="text-muted-foreground">
          Welcome back! Please sign in to continue.
        </p>
      </div>
      <div>
        <span>Email</span>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <span>Password</span>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </div>

      <Button onClick={handleSignIn} disabled={loading}>
        {loading ? "Loading..." : "Submit"}
      </Button>
    </div>
  );
}
