import { ArrowLeft, LogOut, Mail, UserRound, WalletCards } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function ProfilePage() {
  const { signOut, user } = useAuth();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link className="flex items-center gap-3" to="/">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white">
              <WalletCards className="size-5" aria-hidden="true" />
            </span>
            <span className="font-semibold tracking-tight">Finance Tracker</span>
          </Link>

          <button
            type="button"
            onClick={() => void signOut()}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 px-6 py-8 text-white sm:px-8">
            <span className="grid size-16 place-items-center rounded-2xl bg-white text-xl font-semibold text-slate-950">
              {initials}
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Perfil
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Información de la cuenta que estás usando en Finance Tracker.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:p-6">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <UserRound className="size-4" aria-hidden="true" />
                Nombre
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {user.name}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <Mail className="size-4" aria-hidden="true" />
                Correo
              </p>
              <p className="mt-2 break-all text-base font-semibold text-slate-950">
                {user.email}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
