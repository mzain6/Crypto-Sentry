"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { forgotPasswordAction } from "@/lib/auth/password-actions";

import { FormMessage } from "./form-message";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button primary full" disabled={pending} type="submit">
      {pending ? "Creating link..." : "Create Recovery Link"}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(
    forgotPasswordAction,
    { message: null, tone: "error" },
  );

  return (
    <form action={formAction} className="auth-form">
      <label>
        Email Identifier
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <FormMessage message={state.message} tone={state.tone} />
      <SubmitButton />
      <div className="auth-links">
        <Link href="/login">Back to terminal</Link>
      </div>
    </form>
  );
}
