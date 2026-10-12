"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword, type TokenActionState } from "@/app/auth-actions";
import {
  authCardClass,
  fieldClass,
  labelClass,
  linkClass,
  primaryButtonClass,
} from "@/components/styles";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<TokenActionState, FormData>(
    resetPassword,
    {},
  );

  if (state.done) {
    return (
      <div role="status" className={authCardClass}>
        <h2 className="font-medium">Password updated</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You can now{" "}
          <Link href="/login" className={linkClass}>
            sign in
          </Link>{" "}
          with your new password.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className={authCardClass}>
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1.5">
        <label htmlFor="password" className={labelClass}>
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className={fieldClass}
        />
      </div>
      <p role="alert" className="min-h-5 text-sm text-red-600 dark:text-red-400">
        {state.error}
      </p>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
