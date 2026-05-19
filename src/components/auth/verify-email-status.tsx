"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { FormMessage } from "./form-message";

type VerifyEmailStatusProps = {
  token: string;
};

export function VerifyEmailStatus({ token }: VerifyEmailStatusProps) {
  const [message, setMessage] = useState("Verifying your email...");
  const [tone, setTone] = useState<"error" | "success">("success");

  useEffect(() => {
    let cancelled = false;

    async function verifyEmail() {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = (await response.json()) as { message?: string };

      if (cancelled) {
        return;
      }

      setTone(response.ok ? "success" : "error");
      setMessage(body.message ?? "Could not verify email.");
    }

    verifyEmail().catch(() => {
      if (!cancelled) {
        setTone("error");
        setMessage("Could not verify email.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="auth-form">
      <FormMessage message={message} tone={tone} />
      <div className="auth-links">
        <Link href="/login">Go to terminal</Link>
      </div>
    </div>
  );
}
