'use client'

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { authClient } from "~/server/better-auth/client";
import { toast } from "sonner";
export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  async function handleSignUp() {
    setLoading(true);
    if (!formData.email || !formData.password || !formData.name) {
      toast.error("Please fill in all fields", {
        description: "All fields are required to create an account.",
      });
      setLoading(false);
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      console.log("Passwords do not match");
      toast.error("Passwords do not match", {
        description: "Please make sure your passwords match.",
      });
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
        <div>
          <span>Confirm Password</span>
          <Input
          aria-invalid={formData.password.length>0 && formData.passwordConfirm.length>0 && formData.password !== formData.passwordConfirm}
            type="password"
            value={formData.passwordConfirm}
            onChange={(e) =>
              setFormData({ ...formData, passwordConfirm: e.target.value })
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