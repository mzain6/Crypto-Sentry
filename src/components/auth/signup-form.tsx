"use client";

import Link from "next/link";
import { useState } from "react";

import { FormMessage } from "./form-message";

type SignupFormProps = {
  returnUrl: string;
};

export function SignupForm({ returnUrl: _returnUrl }: SignupFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      setMessage(body.message ?? "Could not create account.");
      setTone("error");
      setIsSubmitting(false);
      return;
    }

    const body = (await response.json()) as { message?: string };
    setMessage(
      body.message ??
        "Account created. Please check your email before logging in.",
    );
    setTone("success");
    setIsSubmitting(false);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>
        Operative Name
        <input name="name" type="text" autoComplete="name" minLength={2} required />
      </label>
      <label>
        Email Identifier
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Secure Passkey
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label>
        Confirm Passkey
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <FormMessage message={message} tone={tone} />
      <button className="button primary full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating access..." : "Create Access"}
      </button>
      <div className="auth-links">
        <Link href="/login">Already registered? Sign in</Link>
      </div>
    </form>
  );
}
