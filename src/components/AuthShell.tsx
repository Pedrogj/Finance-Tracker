import type { ReactNode } from "react";
import { WalletCards } from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white">
        <WalletCards className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight">MoneyFlow</span>
    </div>
  );
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6 transition-colors sm:px-8 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl">
        <BrandMark />
      </div>

      <section className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-md items-center py-10">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-emerald-700">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  );
}
