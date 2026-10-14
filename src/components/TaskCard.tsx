"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  cycleTaskStatus,
  deleteTask,
  updateTask,
  type TaskFormState,
} from "@/app/actions";
import {
  dangerButtonClass,
  fieldClass,
  ghostButtonClass,
  labelClass,
  primaryButtonClass,
  subtleButtonClass,
} from "@/components/styles";
import { DueDateTimeFields } from "@/components/DueDateTimeFields";
import { prepareDueAt, toDateTimeLocal } from "@/lib/due-date";
import { STATUS_STYLES, TASKS_HEADING_ID } from "@/lib/task-status";
import type { Status } from "@/generated/prisma/enums";

// Dates arrive pre-formatted from the server, in the viewer's time zone.
export type TaskCardData = {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  dueAtIso: string | null;
  dueLabel: string | null;
  completedAtIso: string | null;
  completedLabel: string | null;
  overdue: boolean;
};

type Mode = "view" | "edit" | "confirm-delete";

export function TaskCard({ task }: { task: TaskCardData }) {
  const [mode, setMode] = useState<Mode>("view");
  const [deleting, startDelete] = useTransition();
  const editButton = useRef<HTMLButtonElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  // Where focus goes when returning to view mode, so keyboard users aren't
  // dropped at the top of the page.
  const returnFocusTo = useRef<"edit" | "delete" | null>(null);

  useEffect(() => {
    if (mode !== "view" || !returnFocusTo.current) return;
    (returnFocusTo.current === "edit" ? editButton : deleteButton).current?.focus();
    returnFocusTo.current = null;
  }, [mode]);

  // If this card leaves the page while it has focus (deleted, or filtered out
  // after a status change), move focus to the list heading instead of losing it.
  const hadFocus = useRef(false);
  useEffect(
    () => () => {
      const lost =
        !document.activeElement || document.activeElement === document.body;
      if (hadFocus.current && lost) {
        document.getElementById(TASKS_HEADING_ID)?.focus();
      }
    },
    [],
  );

  function backToView(focus: "edit" | "delete") {
    returnFocusTo.current = focus;
    setMode("view");
  }

  const style = STATUS_STYLES[task.status];
  const done = task.status === "done";

  return (
    <li
      onFocus={() => (hadFocus.current = true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) hadFocus.current = false;
      }}
      className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-900/5 transition hover:shadow-md hover:shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none dark:hover:border-zinc-700">
      {mode === "edit" ? (
        <EditTaskForm task={task} onDone={() => backToView("edit")} />
      ) : (
        <>
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
              <span aria-hidden className={`size-1.5 rounded-full ${style.dot}`} />
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
              {task.dueAtIso && (
                <p
                  className={`flex items-center gap-1.5 text-sm font-medium ${
                    task.overdue
                      ? "text-red-700 dark:text-red-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`size-4 ${
                      task.overdue
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
                    {task.overdue ? "Overdue · " : ""}Due{" "}
                    <time dateTime={task.dueAtIso}>{task.dueLabel}</time>
                  </span>
                </p>
              )}
              {done && task.completedAtIso && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Completed{" "}
                  <time dateTime={task.completedAtIso}>{task.completedLabel}</time>
                </p>
              )}
            </div>

            {mode === "confirm-delete" ? (
              <div
                role="group"
                aria-label={`Delete ${task.title}?`}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Delete this task?
                </span>
                <button
                  type="button"
                  autoFocus
                  disabled={deleting}
                  onClick={() => backToView("delete")}
                  className={ghostButtonClass}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => startDelete(() => deleteTask(task.id))}
                  className={dangerButtonClass}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  ref={editButton}
                  type="button"
                  aria-label={`Edit: ${task.title}`}
                  onClick={() => setMode("edit")}
                  className={ghostButtonClass}
                >
                  Edit
                </button>
                <button
                  ref={deleteButton}
                  type="button"
                  aria-label={`Delete: ${task.title}`}
                  onClick={() => setMode("confirm-delete")}
                  className={ghostButtonClass}
                >
                  Delete
                </button>
                <form action={cycleTaskStatus.bind(null, task.id)} className="ml-1">
                  {/* The title in the name tells screen reader users which "Start" this is. */}
                  <button
                    type="submit"
                    aria-label={`${style.action}: ${task.title}`}
                    className={subtleButtonClass}
                  >
                    {style.action}
                  </button>
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </li>
  );
}

// Mounted fresh each time editing starts, so an old error never lingers.
function EditTaskForm({
  task,
  onDone,
}: {
  task: TaskCardData;
  onDone: () => void;
}) {
  const id = useId();
  const [state, formAction, pending] = useActionState(
    async (prev: TaskFormState, formData: FormData) => {
      prepareDueAt(formData);
      const result = await updateTask(task.id, prev, formData);
      if (!result.error) onDone();
      return result;
    },
    {},
  );

  const errorId = `${id}-error`;
  const invalid = {
    "aria-invalid": state.error ? true : undefined,
    "aria-describedby": state.error ? errorId : undefined,
  };

  return (
    <form action={formAction} aria-label={`Edit ${task.title}`} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor={`${id}-title`} className={labelClass}>
          Title
        </label>
        <input
          id={`${id}-title`}
          name="title"
          type="text"
          required
          maxLength={200}
          autoFocus
          defaultValue={state.values?.title ?? task.title}
          {...invalid}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${id}-description`} className={labelClass}>
          Description{" "}
          <span className="font-normal text-zinc-500 dark:text-zinc-400">
            (optional)
          </span>
        </label>
        <textarea
          id={`${id}-description`}
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={state.values?.description ?? task.description ?? ""}
          {...invalid}
          className={fieldClass}
        />
      </div>

      <DueDateTimeFields
        defaultValue={
          state.values?.dueAt ??
          (task.dueAtIso ? toDateTimeLocal(task.dueAtIso) : undefined)
        }
        invalid={Boolean(state.error)}
        errorId={errorId}
      />

      <div className="flex items-center justify-between gap-4">
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onDone}
            className={ghostButtonClass}
          >
            Cancel
          </button>
          <button type="submit" disabled={pending} className={primaryButtonClass}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
