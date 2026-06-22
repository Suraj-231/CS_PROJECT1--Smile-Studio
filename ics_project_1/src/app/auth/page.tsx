"use client";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { authClient } from "~/server/better-auth/client";
import { SiGoogle } from "@icons-pack/react-simple-icons";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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
      });
    } catch (error) {
      console.log("Error signing up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col px-4 gap-4 items-center justify-center min-h-screen">
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
        <div>
          <p className="text-center">
            Already have an account?{" "}
            <Link className="text-primary underline" href="/login">
              Sign in here
            </Link>
          </p>
        </div>
        <Button onClick={handleSignUp} disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </Button>
      </div>
      <p>Or</p>
      <Button onClick={handleGoogleSignIn} variant="outline">
        <SiGoogle />
        Sign in with Google
      </Button>
    </div>
  );
}
