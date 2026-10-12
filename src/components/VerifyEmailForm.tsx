"use client";

import { useActionState } from "react";
import Link from "next/link";
import { verifyEmail, type TokenActionState } from "@/app/auth-actions";
import { authCardClass, linkClass, primaryButtonClass } from "@/components/styles";

export function VerifyEmailForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<TokenActionState, FormData>(
    verifyEmail,
    {},
  );

  if (state.done) {
    return (
      <div role="status" className={authCardClass}>
        <h2 className="font-medium">Email confirmed</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Your account is ready.{" "}
          <Link href="/login" className={linkClass}>
            Sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className={authCardClass}>
      <input type="hidden" name="token" value={token} />
      <p role="alert" className="min-h-5 text-sm text-red-600 dark:text-red-400">
        {state.error}
      </p>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Confirming…" : "Confirm my email"}
      </button>
    </form>
  );
}
