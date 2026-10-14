import type { Status } from "@/generated/prisma/enums";

// The "Your tasks" heading, which takes focus when a task card goes away.
export const TASKS_HEADING_ID = "your-tasks";

export const STATUSES: Status[] = ["todo", "in_progress", "done"];

export const STATUS_STYLES: Record<
  Status,
  { label: string; badge: string; dot: string; action: string; empty: string }
> = {
  todo: {
    label: "To do",
    badge:
      "bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-400/20",
    dot: "bg-zinc-400",
    action: "Start",
    empty: "No tasks waiting to start.",
  },
  in_progress: {
    label: "In progress",
    badge:
      "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    dot: "bg-amber-500",
    action: "Mark done",
    empty: "No tasks in progress.",
  },
  done: {
    label: "Done",
    badge:
      "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
    action: "Reopen",
    empty: "No completed tasks yet.",
  },
};

export function isStatus(value: unknown): value is Status {
  return STATUSES.includes(value as Status);
}
