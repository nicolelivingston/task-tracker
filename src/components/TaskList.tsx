import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { cycleTaskStatus } from "@/app/actions";
import type { Status } from "@/generated/prisma/enums";

const STATUS_STYLES: Record<Status, { label: string; badge: string; action: string }> = {
  todo: {
    label: "To do",
    badge:
      "bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-400/20",
    action: "Start",
  },
  in_progress: {
    label: "In progress",
    badge:
      "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    action: "Mark done",
  },
  done: {
    label: "Done",
    badge:
      "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    action: "Reopen",
  },
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export async function TaskList() {
  const userId = await getUserId();
  if (userId === null) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId },
    // Earliest due date first; tasks from before due dates existed (null) go last.
    orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { id: "asc" }],
  });

  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No tasks yet. Add your first one above.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => {
        const style = STATUS_STYLES[task.status];
        return (
          <li
            key={task.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`break-words font-medium ${
                    task.status === "done"
                      ? "text-zinc-500 line-through"
                      : "text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {task.title}
                </h3>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}
                >
                  {style.label}
                </span>
              </div>
              {task.description && (
                <p className="whitespace-pre-line break-words text-sm text-zinc-600 dark:text-zinc-400">
                  {task.description}
                </p>
              )}
              {task.dueAt && (
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Due{" "}
                  <time dateTime={task.dueAt.toISOString()}>
                    {dateFormat.format(task.dueAt)}
                  </time>
                </p>
              )}
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Created{" "}
                <time dateTime={task.createdAt.toISOString()}>
                  {dateFormat.format(task.createdAt)}
                </time>
              </p>
            </div>

            <form action={cycleTaskStatus.bind(null, task.id)}>
              <button
                type="submit"
                className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {style.action}
              </button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}

export function TaskListSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="h-20 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
        />
      ))}
    </ul>
  );
}
