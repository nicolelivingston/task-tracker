"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ResendVerification } from "@/components/ResendVerification";
import { EMAIL_NOT_VERIFIED } from "@/lib/credentials";
import {
  cardClass,
  fieldClass,
  labelClass,
  linkClass,
  primaryButtonClass,
} from "@/components/styles";

type LoginState = { error?: string; email?: string; unverified?: boolean };

export function LoginForm() {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: LoginState, formData: FormData): Promise<LoginState> => {
      const email = String(formData.get("email") ?? "");
      const result = await signIn("credentials", {
        email,
        password: String(formData.get("password") ?? ""),
        redirect: false,
      });
      if (result?.error === EMAIL_NOT_VERIFIED) {
        return { email, unverified: true };
      }
      if (!result || result.error) {
        // One message for unknown email and wrong password, so it doesn't reveal which accounts exist.
        return { error: "Incorrect email or password.", email };
      }
      router.replace("/");
      // Re-run server components so they read the new session cookie.
      router.refresh();
      return { email };
    },
    {},
  );

  return (
    <>
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

        <div className="space-y-1.5">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            label="password"
            required
            autoComplete="current-password"
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "form-error" : undefined}
          />
          <p className="text-right text-sm">
            <Link href="/forgot-password" className={linkClass}>
              Forgot password?
            </Link>
          </p>
        </div>

        <p id="form-error" role="alert" className="min-h-5 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
        <button type="submit" disabled={pending} className={`w-full ${primaryButtonClass}`}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {state.unverified && state.email && (
        <ResendVerification email={state.email} />
      )}
    </>
  );
}
