import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function FormField({
  label,
  error,
  id,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-950"
            : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 dark:border-slate-700 dark:focus:ring-emerald-950"
        } ${className ?? ""}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
