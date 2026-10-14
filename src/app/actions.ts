"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { Status } from "@/generated/prisma/enums";

export type TaskFormState = {
  error?: string;
  values?: { title: string; description: string; dueAt: string };
};

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 2000;

// What <input type="datetime-local"> submits: "YYYY-MM-DDTHH:mm" (seconds optional).
const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
// What Date.prototype.toISOString() produces.
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

type TaskFields = { title: string; description: string | null; dueAt: Date };

// Shared by create and edit. Returns the fields to save, or the error to show.
function parseTaskForm(
  formData: FormData,
): { fields: TaskFields } | { state: TaskFormState } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueAtRaw = String(formData.get("dueAt") ?? "").trim();

  // Echo the input back on failure: React resets uncontrolled forms after an
  // action, so without this the user would lose what they typed.
  const values = { title, description, dueAt: dueAtRaw };
  const fail = (error: string) => ({ state: { error, values } });

  if (!title) return fail("Title is required.");
  if (!dueAtRaw) return fail("Due date and time are required.");
  // The forms convert the zoneless input to an exact moment in the browser. If a
  // caller sends only the raw value, read it in the server's zone (UTC on Vercel).
  const dueAtIso = String(formData.get("dueAtIso") ?? "");
  const dueAt = ISO_UTC.test(dueAtIso)
    ? new Date(dueAtIso)
    : DATETIME_LOCAL.test(dueAtRaw)
      ? new Date(dueAtRaw)
      : null;
  if (!dueAt || Number.isNaN(dueAt.getTime())) {
    return fail("Due date and time are not valid.");
  }
  if (title.length > MAX_TITLE) {
    return fail(`Title must be ${MAX_TITLE} characters or fewer.`);
  }
  if (description.length > MAX_DESCRIPTION) {
    return fail(`Description must be ${MAX_DESCRIPTION} characters or fewer.`);
  }

  return { fields: { title, description: description || null, dueAt } };
}

export async function createTask(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  // Server actions are public endpoints; re-check the session here rather than
  // relying on the page having been gated.
  const userId = await getUserId();
  if (userId === null) redirect("/login");

  const parsed = parseTaskForm(formData);
  if ("state" in parsed) return parsed.state;

  await prisma.task.create({ data: { ...parsed.fields, userId } });

  revalidatePath("/");
  return {};
}

export async function updateTask(
  id: number,
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const userId = await getUserId();
  if (userId === null) redirect("/login");
  if (!Number.isInteger(id)) throw new Error("Invalid task id");

  const parsed = parseTaskForm(formData);
  if ("state" in parsed) return parsed.state;

  // Scoped to the owner, so another user's task id behaves like a missing one.
  await prisma.task.updateMany({
    where: { id, userId },
    data: parsed.fields,
  });

  revalidatePath("/");
  return {};
}

export async function deleteTask(id: number) {
  const userId = await getUserId();
  if (userId === null) redirect("/login");
  if (!Number.isInteger(id)) throw new Error("Invalid task id");

  await prisma.task.deleteMany({ where: { id, userId } });

  revalidatePath("/");
}

const NEXT_STATUS: Record<Status, Status> = {
  todo: Status.in_progress,
  in_progress: Status.done,
  done: Status.todo,
};

export async function cycleTaskStatus(id: number) {
  const userId = await getUserId();
  if (userId === null) redirect("/login");
  if (!Number.isInteger(id)) throw new Error("Invalid task id");

  // Scoped to the owner, so another user's task id behaves like a missing one.
  const task = await prisma.task.findFirst({
    where: { id, userId },
    select: { status: true },
  });
  if (!task) return;

  // Conditional on the status we just read, so two quick clicks can't skip a step.
  // Stamp the completion time on the way to done; reopening clears it.
  const next = NEXT_STATUS[task.status];
  await prisma.task.updateMany({
    where: { id, userId, status: task.status },
    data: {
      status: next,
      completedAt: next === Status.done ? new Date() : null,
    },
  });

  revalidatePath("/");
}
