"use client";

import { useActionState } from "react";
import { createTask, type CreateTaskState } from "@/app/actions";
import { fieldClass } from "@/components/styles";

const initialState: CreateTaskState = {};

export function TaskForm() {
  const [state, formAction, pending] = useActionState(createTask, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="space-y-1.5">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={state.values?.title}
          placeholder="What needs doing?"
          aria-invalid={state.error ? true : undefined}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Description{" "}
          <span className="font-normal text-zinc-400 dark:text-zinc-500">
            (optional)
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={state.values?.description}
          placeholder="Add some detail…"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="dueAt"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Due date and time
        </label>
        <input
          id="dueAt"
          name="dueAt"
          type="datetime-local"
          required
          defaultValue={state.values?.dueAt}
          className={fieldClass}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <p
          role="alert"
          aria-live="polite"
          className="text-sm text-red-600 dark:text-red-400"
        >
          {state.error}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add task"}
        </button>
      </div>
    </form>
  );
}
