"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { updatePasswordAction } from "@/lib/auth/password-actions";

import { FormMessage } from "./form-message";

type UpdatePasswordFormProps = {
  token: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button primary full" disabled={pending} type="submit">
      {pending ? "Saving..." : "Save Passkey"}
    </button>
  );
}

export function UpdatePasswordForm({ token }: UpdatePasswordFormProps) {
  const [state, formAction] = useFormState(
    updatePasswordAction,
    { message: null, tone: "error" },
  );

  return (
    <form action={formAction} className="auth-form">
      <input name="token" type="hidden" value={token} />
      <label>
        New Passkey
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
      <FormMessage message={state.message} tone={state.tone} />
      <SubmitButton />
      <div className="auth-links">
        <Link href="/login">Back to terminal</Link>
      </div>
    </form>
  );
}
