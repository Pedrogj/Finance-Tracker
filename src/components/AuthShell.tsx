import type { ReactNode } from "react";
import { BarChart3, CheckCircle2, ShieldCheck, WalletCards } from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const benefits = [
  "Controla tus gastos en un solo lugar",
  "Visualiza el avance de tu presupuesto",
  "Toma decisiones con mayor claridad",
];

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
        <WalletCards className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight">Finance Tracker</span>
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
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute -left-24 top-1/3 size-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 size-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10">
          <BrandMark />
        </div>

        <div className="relative z-10 my-auto max-w-xl">
          <div className="mb-8 grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <BarChart3 className="size-7 text-emerald-400" aria-hidden="true" />
          </div>
          <h2 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight">
            Tu dinero, más claro. Tus metas, más cerca.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
            Una vista simple para entender cómo se mueve tu dinero y organizar
            cada mes con confianza.
          </p>

          <ul className="mt-10 space-y-4">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <CheckCircle2
                  className="size-5 text-emerald-400"
                  aria-hidden="true"
                />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Tus datos permanecen bajo tu control
        </p>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="lg:hidden">
          <BrandMark />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
