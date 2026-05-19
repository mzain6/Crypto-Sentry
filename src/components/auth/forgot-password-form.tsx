"use client";

import Link from "next/link";
import { useState } from "react";

import { FormMessage } from "./form-message";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
      }),
    });
    const body = (await response.json()) as { message?: string };

    setTone(response.ok ? "success" : "error");
    setMessage(body.message ?? "Could not create a reset link.");
    setIsSubmitting(false);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <FormMessage message={message} tone={tone} />
      <button className="button primary full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating link..." : "Create reset link"}
      </button>
      <div className="auth-links">
        <Link href="/login">Back to login</Link>
      </div>
    </form>
  );
}

