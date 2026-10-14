"use client";

import { useActionState } from "react";
import { requestPasswordReset, type MessageState } from "@/app/auth-actions";
import {
  cardClass,
  fieldClass,
  labelClass,
  primaryButtonClass,
} from "@/components/styles";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<MessageState, FormData>(
    requestPasswordReset,
    {},
  );

  if (state.message) {
    return (
      <div role="status" className={cardClass}>
        <h2 className="font-medium">Check your email</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className={cardClass}>
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
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "form-error" : undefined}
          className={fieldClass}
        />
      </div>
      <p id="form-error" role="alert" className="min-h-5 text-sm text-red-600 dark:text-red-400">
        {state.error}
      </p>
      <button type="submit" disabled={pending} className={`w-full ${primaryButtonClass}`}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
