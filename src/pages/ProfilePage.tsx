import {
  ArrowLeft,
  LogOut,
  Mail,
  Moon,
  Sun,
  UserRound,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export function ProfilePage() {
  const { signOut, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link className="flex items-center gap-3" to="/">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white">
              <WalletCards className="size-5" aria-hidden="true" />
            </span>
            <span className="font-semibold tracking-tight">MoneyFlow</span>
          </Link>

          <button
            type="button"
            onClick={() => void signOut()}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/">
            <ArrowLeft data-icon="inline-start" />
            Volver al resumen
          </Link>
        </Button>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-slate-950 px-6 py-8 text-white sm:px-8 dark:bg-emerald-950/40">
            <span className="grid size-16 place-items-center rounded-2xl bg-white text-xl font-semibold text-slate-950 dark:bg-emerald-500 dark:text-white">
              {initials}
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Perfil
            </h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-emerald-50/70">
              Información de la cuenta que estás usando en MoneyFlow.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:p-6">
            <div className="rounded-2xl border border-slate-200 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950/40">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <UserRound className="size-4" aria-hidden="true" />
                Nombre
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950 dark:text-slate-50">
                {user.name}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950/40">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <Mail className="size-4" aria-hidden="true" />
                Correo
              </p>
              <p className="mt-2 break-all text-base font-semibold text-slate-950 dark:text-slate-50">
                {user.email}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {isDark ? (
                      <Moon className="size-4" aria-hidden="true" />
                    ) : (
                      <Sun className="size-4" aria-hidden="true" />
                    )}
                    Apariencia
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950 dark:text-slate-50">
                    {isDark ? "Tema oscuro" : "Tema claro"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Cambia el aspecto visual de MoneyFlow en este navegador.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isDark}
                  onClick={toggleTheme}
                  className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 sm:w-44 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-emerald-500/60 dark:hover:bg-emerald-950/40"
                >
                  <span>{isDark ? "Oscuro" : "Claro"}</span>
                  <span
                    className={`flex size-8 items-center justify-center rounded-xl transition ${
                      isDark
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-amber-500 shadow-sm"
                    }`}
                  >
                    {isDark ? (
                      <Moon className="size-4" aria-hidden="true" />
                    ) : (
                      <Sun className="size-4" aria-hidden="true" />
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
