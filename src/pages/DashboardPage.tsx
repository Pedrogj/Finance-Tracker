import type { ComponentType } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Plus,
  ReceiptText,
  Settings,
  ShoppingBag,
  Target,
  TrendingDown,
  TrendingUp,
  Utensils,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

const currency = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const navigation: { label: string; icon: Icon; active?: boolean }[] = [
  { label: "Resumen", icon: LayoutDashboard, active: true },
  { label: "Movimientos", icon: ReceiptText },
  { label: "Presupuestos", icon: PiggyBank },
  { label: "Metas", icon: Target },
];

const summaries = [
  {
    label: "Balance disponible",
    value: 1284500,
    change: "+8,4% este mes",
    icon: WalletCards,
    tone: "emerald",
  },
  {
    label: "Ingresos del mes",
    value: 1850000,
    change: "+4,2% vs. mayo",
    icon: TrendingUp,
    tone: "blue",
  },
  {
    label: "Gastos del mes",
    value: 565500,
    change: "32% del ingreso",
    icon: TrendingDown,
    tone: "amber",
  },
] as const;

const categories = [
  { name: "Vivienda", amount: 280000, percentage: 49, color: "bg-emerald-500" },
  { name: "Alimentación", amount: 125500, percentage: 22, color: "bg-cyan-500" },
  { name: "Transporte", amount: 82000, percentage: 15, color: "bg-violet-500" },
  { name: "Otros", amount: 78000, percentage: 14, color: "bg-amber-400" },
];

const transactions: {
  title: string;
  category: string;
  date: string;
  amount: number;
  icon: Icon;
  positive?: boolean;
  iconStyle: string;
}[] = [
  {
    title: "Supermercado Líder",
    category: "Alimentación",
    date: "12 jun, 18:24",
    amount: -48590,
    icon: ShoppingBag,
    iconStyle: "bg-cyan-50 text-cyan-700",
  },
  {
    title: "Pago de salario",
    category: "Ingresos",
    date: "10 jun, 09:00",
    amount: 1850000,
    icon: CircleDollarSign,
    positive: true,
    iconStyle: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Restaurante",
    category: "Alimentación",
    date: "08 jun, 21:15",
    amount: -32900,
    icon: Utensils,
    iconStyle: "bg-orange-50 text-orange-700",
  },
  {
    title: "Suscripción digital",
    category: "Servicios",
    date: "05 jun, 08:30",
    amount: -7990,
    icon: CreditCard,
    iconStyle: "bg-violet-50 text-violet-700",
  },
];

function Sidebar({
  open,
  onClose,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          aria-label="Cerrar menú"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white">
              <WalletCards className="size-5" aria-hidden="true" />
            </span>
            <span className="font-semibold tracking-tight">Finance Tracker</span>
          </div>
          <button
            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-9 space-y-1" aria-label="Navegación principal">
          {navigation.map(({ label, icon: NavigationIcon, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <NavigationIcon className="size-5" aria-hidden={true} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-slate-100 pt-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900">
            <Settings className="size-5" aria-hidden="true" />
            Configuración
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-700"
            onClick={onLogout}
          >
            <LogOut className="size-5" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!user) return null;

  const firstName = user.name.split(" ")[0];
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-950">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={() => void signOut()}
      />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu className="size-5" />
              </button>
              <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
                <CalendarDays className="size-4" aria-hidden="true" />
                Junio 2026
                <ChevronDown className="size-4" aria-hidden="true" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="relative grid size-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                aria-label="Notificaciones"
              >
                <Bell className="size-5" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-emerald-500" />
              </button>
              <span className="h-7 w-px bg-slate-200" />
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {initials}
                </span>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-4">{user.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Resumen financiero
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Hola, {firstName}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Este es el estado de tus finanzas durante junio.
              </p>
            </div>
            <Button
              size="lg"
              className="h-10 rounded-xl bg-emerald-600 px-4 hover:bg-emerald-700"
            >
              <Plus data-icon="inline-start" />
              Nuevo movimiento
            </Button>
          </div>

          <section
            className="mt-7 grid gap-4 md:grid-cols-3"
            aria-label="Resumen del mes"
          >
            {summaries.map(
              ({ label, value, change, icon: SummaryIcon, tone }) => (
                <article
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        {currency.format(value)}
                      </p>
                    </div>
                    <span
                      className={`grid size-10 place-items-center rounded-xl ${
                        tone === "emerald"
                          ? "bg-emerald-50 text-emerald-700"
                          : tone === "blue"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <SummaryIcon className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                  <p
                    className={`mt-4 flex items-center gap-1.5 text-xs font-medium ${
                      tone === "amber" ? "text-slate-500" : "text-emerald-700"
                    }`}
                  >
                    {tone === "amber" ? (
                      <ArrowDownLeft className="size-3.5" aria-hidden="true" />
                    ) : (
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    )}
                    {change}
                  </p>
                </article>
              ),
            )}
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Presupuesto mensual</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Seguimiento general de junio
                  </p>
                </div>
                <button className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                  Administrar
                </button>
              </div>

              <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Gastado</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight">
                    {currency.format(565500)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    de {currency.format(900000)} disponibles
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-right">
                  <p className="text-xs font-medium text-emerald-700">
                    Aún disponible
                  </p>
                  <p className="mt-1 font-semibold text-emerald-900">
                    {currency.format(334500)}
                  </p>
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[63%] rounded-full bg-emerald-500" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>63% utilizado</span>
                <span>37% disponible</span>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
              <p className="text-sm font-semibold">Meta destacada</p>
              <div className="mt-5 flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                  <Target className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">Fondo de emergencia</p>
                  <p className="mt-1 text-xs text-slate-400">Meta: diciembre 2026</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Progreso</span>
                  <span className="font-medium">42%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[42%] rounded-full bg-emerald-400" />
                </div>
                <p className="mt-4 text-sm">
                  <span className="font-semibold">{currency.format(1260000)}</span>
                  <span className="text-slate-500"> de </span>
                  <span className="text-slate-300">{currency.format(3000000)}</span>
                </p>
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Gastos por categoría</p>
                  <p className="mt-1 text-xs text-slate-500">Distribución del mes</p>
                </div>
                <span className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-500">
                  <CircleDollarSign className="size-5" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-6 space-y-5">
                {categories.map((category) => (
                  <div key={category.name}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">
                        {category.name}
                      </span>
                      <span className="text-slate-500">
                        {currency.format(category.amount)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
              <div className="flex items-center justify-between px-5 py-5 sm:px-6">
                <div>
                  <p className="text-sm font-semibold">Movimientos recientes</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tus últimas transacciones
                  </p>
                </div>
                <button className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                  Ver todos
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {transactions.map(
                  ({
                    title,
                    category,
                    date,
                    amount,
                    icon: TransactionIcon,
                    positive,
                    iconStyle,
                  }) => (
                    <div
                      key={`${title}-${date}`}
                      className="flex items-center gap-3 px-5 py-3.5 sm:px-6"
                    >
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl ${iconStyle}`}
                      >
                        <TransactionIcon className="size-5" aria-hidden={true} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{title}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {category} · {date}
                        </p>
                      </div>
                      <p
                        className={`whitespace-nowrap text-sm font-semibold ${
                          positive ? "text-emerald-700" : "text-slate-900"
                        }`}
                      >
                        {positive ? "+" : ""}
                        {currency.format(amount)}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
