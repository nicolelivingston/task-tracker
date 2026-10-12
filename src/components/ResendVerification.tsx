"use client";

import { useActionState } from "react";
import { resendVerification, type MessageState } from "@/app/auth-actions";

export function ResendVerification({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<MessageState, FormData>(
    resendVerification,
    {},
  );

  return (
    <form
      action={formAction}
      className="mt-4 space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <p>
        Your email address hasn&apos;t been confirmed yet. Check your inbox for
        the link we sent.
      </p>
      <input type="hidden" name="email" value={email} />
      {state.message ? (
        <p role="status">{state.message}</p>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className="font-medium underline disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send a new link"}
        </button>
      )}
    </form>
  );
}
