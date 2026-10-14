"use client";

import { useState, type InputHTMLAttributes } from "react";
import { fieldClass } from "@/components/styles";

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "className"
> & {
  // Names the toggle for screen readers, e.g. "Show confirm password".
  label: string;
};

// A password field with a Show/Hide toggle. Hidden by default.
export function PasswordInput({ label, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${fieldClass} pr-16`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={`${visible ? "Hide" : "Show"} ${label}`}
        aria-controls={props.id}
        className="absolute inset-y-1 right-1 rounded-md px-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-indigo-400"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
