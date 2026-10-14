"use client";

import { useActionState } from "react";
import { createTask, type TaskFormState } from "@/app/actions";
import {
  cardClass,
  fieldClass,
  primaryButtonClass,
} from "@/components/styles";
import { DueDateTimeFields } from "@/components/DueDateTimeFields";
import { prepareDueAt } from "@/lib/due-date";

const initialState: TaskFormState = {};

export function TaskForm() {
  const [state, formAction, pending] = useActionState(createTask, initialState);

  function submit(formData: FormData) {
    prepareDueAt(formData);
    formAction(formData);
  }

  return (
    <form
      action={submit}
      className={cardClass}
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
          aria-describedby={state.error ? "task-error" : undefined}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Description{" "}
          <span className="font-normal text-zinc-500 dark:text-zinc-400">
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

      <DueDateTimeFields
        defaultValue={state.values?.dueAt}
        invalid={Boolean(state.error)}
        errorId="task-error"
      />

      <div className="flex items-center justify-between gap-4">
        <p
          id="task-error"
          role="alert"
          className="text-sm text-red-600 dark:text-red-400"
        >
          {state.error}
        </p>
        <button
          type="submit"
          disabled={pending}
          className={`shrink-0 ${primaryButtonClass}`}
        >
          {pending ? "Adding…" : "Add task"}
        </button>
      </div>
    </form>
  );
}
