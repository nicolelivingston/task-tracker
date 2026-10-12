import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { linkClass } from "@/components/styles";

export const metadata: Metadata = {
  title: "Choose a new password · Task Tracker",
  // The token is in the URL; don't pass it along as a Referer to anything we link to.
  referrer: "no-referrer",
};

// Reading searchParams is request-time, so it sits behind Suspense and the rest
// of the page stays in the static shell.
async function ResetForm({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This link is missing its token.{" "}
        <Link href="/forgot-password" className={linkClass}>
          Request a new one
        </Link>
        .
      </p>
    );
  }
  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage(props: PageProps<"/reset-password">) {
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-4 py-16 sm:py-24">
      <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
      <div className="mt-8">
        <Suspense fallback={null}>
          <ResetForm searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
