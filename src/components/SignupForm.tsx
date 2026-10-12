"use client";

import { useActionState } from "react";
import { signup } from "@/app/auth-actions";
import {
  authCardClass,
  fieldClass,
  labelClass,
  primaryButtonClass,
} from "@/components/styles";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, {});

  if (state.sent) {
    return (
      <div role="status" className={authCardClass}>
        <h2 className="font-medium">Check your email</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We sent a confirmation link to{" "}
          <strong className="font-medium">{state.values?.email}</strong>. Open it
          to finish creating your account, then sign in.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className={authCardClass}>
      <div className="space-y-1.5">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.values?.email}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-describedby="password-hint"
          className={fieldClass}
        />
        <p id="password-hint" className="text-xs text-zinc-500 dark:text-zinc-400">
          At least 8 characters.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm password
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
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
