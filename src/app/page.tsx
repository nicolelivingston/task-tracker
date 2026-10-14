import { Suspense } from "react";
import { TaskForm } from "@/components/TaskForm";
import { TASKS_HEADING_ID } from "@/lib/task-status";
import { TaskList, TaskListSkeleton } from "@/components/TaskList";
import { SignOutButton } from "@/components/SignOutButton";
import { TimeZoneSync } from "@/components/TimeZoneSync";
import { getSession } from "@/lib/auth";

// Reads the session cookie, so it streams in behind Suspense rather than
// blocking the static shell.
async function UserBar() {
  const session = await getSession();
  return (
    <div className="flex items-center gap-3">
      <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">
        {session?.user?.email}
      </span>
      <SignOutButton />
    </div>
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:py-16">
      <TimeZoneSync />
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

      <section aria-labelledby={TASKS_HEADING_ID} className="mt-10">
        {/* Focusable from script only: takes focus when a task card disappears. */}
        <h2
          id={TASKS_HEADING_ID}
          tabIndex={-1}
          className="mb-3 focus:outline-none text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          Your tasks
        </h2>
        {/* Tasks are read from the DB on every request, so they stream in behind Suspense. */}
        <Suspense fallback={<TaskListSkeleton />}>
          <TaskList searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
