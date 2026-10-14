import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TIME_ZONE_COOKIE, isValidTimeZone } from "@/lib/timezone";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { cycleTaskStatus } from "@/app/actions";
import type { Status } from "@/generated/prisma/enums";

const STATUS_STYLES: Record<
  Status,
  { label: string; badge: string; dot: string; action: string }
> = {
  todo: {
    label: "To do",
    badge:
      "bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-400/20",
    dot: "bg-zinc-400",
    action: "Start",
  },
  in_progress: {
    label: "In progress",
    badge:
      "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    dot: "bg-amber-500",
    action: "Mark done",
  },
  done: {
    label: "Done",
    badge:
      "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
    action: "Reopen",
  },
};

// Formats in the viewer's zone (set by <TimeZoneSync />). Until that cookie exists,
// falls back to the server's zone, which is UTC on Vercel.
async function getDateFormat() {
  const zone = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: isValidTimeZone(zone) ? zone : undefined,
  });
}

// Only called while rendering TaskList, after getUserId() has opted the render into
// request time, so reading the clock is fine under cacheComponents.
function isOverdue(status: Status, dueAt: Date | null) {
  return status !== "done" && dueAt !== null && dueAt.getTime() < Date.now();
}

export async function TaskList() {
  const userId = await getUserId();
  if (userId === null) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId },
    // Earliest due date first; tasks from before due dates existed (null) go last.
    orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { id: "asc" }],
  });

  const dateFormat = await getDateFormat();

  if (tasks.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-400">
        No tasks yet. Add your first one above.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {tasks.map((task) => {
        const style = STATUS_STYLES[task.status];
        const done = task.status === "done";
        const overdue = isOverdue(task.status, task.dueAt);
        return (
          <li
            key={task.id}
            className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-900/5 transition hover:shadow-md hover:shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none dark:hover:border-zinc-700"
          >
            <div className="flex items-start justify-between gap-3">
              <h3
                className={`min-w-0 break-words text-base font-semibold leading-snug ${
                  done
                    ? "text-zinc-500 line-through decoration-zinc-400 dark:text-zinc-500"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.badge}`}
              >
                <span
                  aria-hidden
                  className={`size-1.5 rounded-full ${style.dot}`}
                />
                {style.label}
              </span>
            </div>

            {task.description && (
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {task.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <div className="space-y-0.5">
                {task.dueAt && (
                  <p
                    className={`flex items-center gap-1.5 text-sm font-medium ${
                      overdue
                        ? "text-red-700 dark:text-red-400"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`size-4 ${
                        overdue
                          ? "text-red-500 dark:text-red-400"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {overdue ? "Overdue · " : ""}Due{" "}
                      <time dateTime={task.dueAt.toISOString()}>
                        {dateFormat.format(task.dueAt)}
                      </time>
                    </span>
                  </p>
                )}
                {done && task.completedAt && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Completed{" "}
                    <time dateTime={task.completedAt.toISOString()}>
                      {dateFormat.format(task.completedAt)}
                    </time>
                  </p>
                )}
              </div>

              <form action={cycleTaskStatus.bind(null, task.id)}>
                {/* The title in the name tells screen reader users which "Start" this is. */}
                <button
                  type="submit"
                  aria-label={`${style.action}: ${task.title}`}
                  className="shrink-0 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  {style.action}
                </button>
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function TaskListSkeleton() {
  return (
    <>
      <p role="status" className="sr-only">
        Loading tasks…
      </p>
      <ul className="space-y-4" aria-hidden>
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="h-36 animate-pulse rounded-2xl border border-zinc-200/80 bg-zinc-100 motion-reduce:animate-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        ))}
      </ul>
    </>
  );
}
