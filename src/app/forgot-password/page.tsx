import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { linkClass } from "@/components/styles";

export const metadata: Metadata = { title: "Forgot password · Task Tracker" };

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Enter your email and we&apos;ll send you a link to choose a new one.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/login" className={linkClass}>
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
