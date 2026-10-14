import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/VerifyEmailForm";
import { linkClass } from "@/components/styles";

export const metadata: Metadata = {
  title: "Confirm your email · Task Tracker",
  // The token is in the URL; don't pass it along as a Referer to anything we link to.
  referrer: "no-referrer",
};

// Reading searchParams is request-time, so it sits behind Suspense and the rest
// of the page stays in the static shell.
async function VerifyForm({ searchParams }: Pick<PageProps<"/verify-email">, "searchParams">) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This link is missing its token.{" "}
        <Link href="/login" className={linkClass}>
          Sign in
        </Link>{" "}
        to get a new one.
      </p>
    );
  }
  return <VerifyEmailForm token={token} />;
}

export default function VerifyEmailPage(props: PageProps<"/verify-email">) {
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Confirm your email</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        One last step to activate your account.
      </p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <VerifyForm searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
