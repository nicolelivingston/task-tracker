import { Suspense } from "react";
import { TaskForm } from "@/components/TaskForm";
import { TaskList, TaskListSkeleton } from "@/components/TaskList";
import { SignOutButton } from "@/components/SignOutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Reads the session cookie, so it streams in behind Suspense rather than
// blocking the static shell.
async function UserBar() {
  const session = await getServerSession(authOptions);
  return (
    <div className="flex items-center gap-3">
      <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">
        {session?.user?.email}
      </span>
      <SignOutButton />
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:py-16">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <Suspense fallback={null}>
          <UserBar />
        </Suspense>
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Keep track of what needs doing.
      </p>

      <div className="mt-8">
        <TaskForm />
      </div>

      <section aria-labelledby="all-tasks" className="mt-10">
        <h2
          id="all-tasks"
          className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          All tasks
        </h2>
        {/* Tasks are read from the DB on every request, so they stream in behind Suspense. */}
        <Suspense fallback={<TaskListSkeleton />}>
          <TaskList />
        </Suspense>
      </section>
    </main>
  );
}
