'use client'

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { authClient } from "~/server/better-auth/client";
import { toast } from "sonner";

export default function SignInForm() {
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