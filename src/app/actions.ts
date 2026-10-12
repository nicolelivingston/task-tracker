"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { Status } from "@/generated/prisma/enums";

export type CreateTaskState = {
  error?: string;
  values?: { title: string; description: string; dueAt: string };
};

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 2000;

// What <input type="datetime-local"> submits: "YYYY-MM-DDTHH:mm" (seconds optional).
const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

export async function createTask(
  _prev: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  // Server actions are public endpoints; re-check the session here rather than
  // relying on the page having been gated.
  const userId = await getUserId();
  if (userId === null) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueAtRaw = String(formData.get("dueAt") ?? "").trim();

  // Echo the input back on failure: React resets uncontrolled forms after an
  // action, so without this the user would lose what they typed.
  const values = { title, description, dueAt: dueAtRaw };

  if (!title) return { error: "Title is required.", values };
  if (!dueAtRaw) return { error: "Due date and time are required.", values };
  // The value carries no timezone, so it is read in the server's local zone,
  // the same zone TaskList formats it in.
  const dueAt = DATETIME_LOCAL.test(dueAtRaw) ? new Date(dueAtRaw) : null;
  if (!dueAt || Number.isNaN(dueAt.getTime())) {
    return { error: "Due date and time are not valid.", values };
  }
  if (title.length > MAX_TITLE) {
    return { error: `Title must be ${MAX_TITLE} characters or fewer.`, values };
  }
  if (description.length > MAX_DESCRIPTION) {
    return {
      error: `Description must be ${MAX_DESCRIPTION} characters or fewer.`,
      values,
    };
  }

  await prisma.task.create({
    data: { title, description: description || null, dueAt, userId },
  });

  revalidatePath("/");
  return {};
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
  await prisma.task.updateMany({
    where: { id, userId, status: task.status },
    data: { status: NEXT_STATUS[task.status] },
  });

  revalidatePath("/");
}
