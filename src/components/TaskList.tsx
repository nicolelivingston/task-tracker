import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TIME_ZONE_COOKIE, isValidTimeZone } from "@/lib/timezone";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { STATUSES, STATUS_STYLES, isStatus } from "@/lib/task-status";
import { TaskCard } from "@/components/TaskCard";
import type { Status } from "@/generated/prisma/enums";

// Formats in the viewer's zone (set by <TimeZoneSync />). Until that cookie exists,
// falls back to the server's zone, which is UTC on Vercel.
async function getDateFormat() {
  const zone = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    hourCycle: "h12",
    timeZone: isValidTimeZone(zone) ? zone : undefined,
  });
}

// Only called while rendering TaskList, after getUserId() has opted the render into
// request time, so reading the clock is fine under cacheComponents.
function isOverdue(status: Status, dueAt: Date | null) {
  return status !== "done" && dueAt !== null && dueAt.getTime() < Date.now();
}

function StatusFilter({
  active,
  counts,
}: {
  active: Status | null;
  counts: Record<Status | "all", number>;
}) {
  const options: { value: Status | null; label: string; count: number }[] = [
    { value: null, label: "All", count: counts.all },
    ...STATUSES.map((s) => ({
      value: s,
      label: STATUS_STYLES[s].label,
      count: counts[s],
    })),
  ];

  return (
    <nav aria-label="Filter tasks by status" className="mb-4">
      <ul className="flex flex-wrap gap-2">
        {options.map(({ value, label, count }) => {
          const current = value === active;
          return (
            <li key={label}>
              <Link
                href={value ? `/?status=${value}` : "/"}
                scroll={false}
                aria-current={current ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400 ${
                  current
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-white text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-zinc-900"
                }`}
              >
                {label}
                <span className="tabular-nums">{count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export async function TaskList({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const userId = await getUserId();
  if (userId === null) redirect("/login");

  const { status } = await searchParams;
  const filter = isStatus(status) ? status : null;

  // One query for everything: personal lists are small, and the filter counts
  // come from the same rows.
  const tasks = await prisma.task.findMany({
    where: { userId },
    // Earliest due date first; tasks from before due dates existed (null) go last.
    orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { id: "asc" }],
  });

  if (tasks.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-400">
        No tasks yet. Add your first one above.
      </p>
    );
  }

  const counts = { all: tasks.length, todo: 0, in_progress: 0, done: 0 };
  for (const task of tasks) counts[task.status]++;

  const shown = filter ? tasks.filter((t) => t.status === filter) : tasks;
  const dateFormat = await getDateFormat();

  return (
    <>
      <StatusFilter active={filter} counts={counts} />
      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-400">
          {STATUS_STYLES[filter!].empty}
        </p>
      ) : (
        <ul className="space-y-4">
          {shown.map((task) => (
            <TaskCard
              key={task.id}
              task={{
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                dueAtIso: task.dueAt?.toISOString() ?? null,
                dueLabel: task.dueAt ? dateFormat.format(task.dueAt) : null,
                completedAtIso: task.completedAt?.toISOString() ?? null,
                completedLabel: task.completedAt
                  ? dateFormat.format(task.completedAt)
                  : null,
                overdue: isOverdue(task.status, task.dueAt),
              }}
            />
          ))}
        </ul>
      )}
    </>
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
