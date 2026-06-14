import type { ComponentType } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Plus,
  ReceiptText,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";

import { TransactionModal } from "@/components/TransactionModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/hooks/useFinance";

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

const currentDate = new Date();
const currentMonthKey = currentDate.toISOString().slice(0, 7);
const currentMonthStart = `${currentMonthKey}-01`;
const currentMonthLabel = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
}).format(currentDate);

const shortDate = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
});

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
  const {
    accounts,
    transactions,
    budgets,
    goals,
    isLoading,
    error,
  } = useFinance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  if (!user) return null;

  const monthTransactions = transactions.filter((transaction) =>
    transaction.transaction_date.startsWith(currentMonthKey),
  );
  const monthlyIncome = monthTransactions
    .filter((transaction) => transaction.transaction_type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const monthlyExpenses = monthTransactions
    .filter((transaction) => transaction.transaction_type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const balance =
    accounts.reduce(
      (total, account) => total + Number(account.initial_balance),
      0,
    ) +
    transactions.reduce(
      (total, transaction) =>
        total +
        (transaction.transaction_type === "income"
          ? Number(transaction.amount)
          : -Number(transaction.amount)),
      0,
    );

  const summaries = [
    {
      label: "Balance disponible",
      value: balance,
      change: `${accounts.length} ${accounts.length === 1 ? "cuenta activa" : "cuentas activas"}`,
      icon: WalletCards,
      tone: "emerald",
    },
    {
      label: "Ingresos del mes",
      value: monthlyIncome,
      change: `${monthTransactions.filter((item) => item.transaction_type === "income").length} movimientos`,
      icon: TrendingUp,
      tone: "blue",
    },
    {
      label: "Gastos del mes",
      value: monthlyExpenses,
      change:
        monthlyIncome > 0
          ? `${Math.round((monthlyExpenses / monthlyIncome) * 100)}% del ingreso`
          : "Sin ingresos registrados",
      icon: TrendingDown,
      tone: "amber",
    },
  ] as const;

  const categoryTotals = new Map<
    number,
    { name: string; amount: number; color: string }
  >();

  monthTransactions
    .filter((transaction) => transaction.transaction_type === "expense")
    .forEach((transaction) => {
      const current = categoryTotals.get(transaction.category_id);
      categoryTotals.set(transaction.category_id, {
        name: transaction.category?.name ?? "Sin categoría",
        color: transaction.category?.color ?? "#64748b",
        amount: (current?.amount ?? 0) + Number(transaction.amount),
      });
    });

  const categorySpending = Array.from(categoryTotals.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((category) => ({
      ...category,
      percentage:
        monthlyExpenses > 0
          ? Math.round((category.amount / monthlyExpenses) * 100)
          : 0,
    }));

  const currentBudgets = budgets.filter(
    (budget) => budget.month === currentMonthStart,
  );
  const totalBudget = currentBudgets.reduce(
    (total, budget) => total + Number(budget.amount),
    0,
  );
  const budgetPercentage =
    totalBudget > 0
      ? Math.min(Math.round((monthlyExpenses / totalBudget) * 100), 100)
      : 0;
  const availableBudget = Math.max(totalBudget - monthlyExpenses, 0);
  const highlightedGoal =
    goals.find((goal) => goal.status === "active") ?? goals[0];
  const goalPercentage = highlightedGoal
    ? Math.min(
        Math.round(
          (Number(highlightedGoal.current_amount) /
            Number(highlightedGoal.target_amount)) *
            100,
        ),
        100,
      )
    : 0;

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
                <span className="capitalize">{currentMonthLabel}</span>
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
                Este es el estado de tus finanzas durante{" "}
                <span className="lowercase">{currentMonthLabel}</span>.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setTransactionModalOpen(true)}
              className="h-10 rounded-xl bg-emerald-600 px-4 hover:bg-emerald-700"
            >
              <Plus data-icon="inline-start" />
              Nuevo movimiento
            </Button>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {isLoading && transactions.length === 0 && (
            <div className="mt-8 grid place-items-center rounded-2xl border border-slate-200 bg-white py-16">
              <span className="size-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
              <p className="mt-3 text-sm text-slate-500">
                Cargando tus finanzas...
              </p>
            </div>
          )}

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
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    Seguimiento de {currentMonthLabel}
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
                    {currency.format(monthlyExpenses)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    de {currency.format(totalBudget)} presupuestados
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-right">
                  <p className="text-xs font-medium text-emerald-700">
                    Aún disponible
                  </p>
                  <p className="mt-1 font-semibold text-emerald-900">
                    {currency.format(availableBudget)}
                  </p>
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>{budgetPercentage}% utilizado</span>
                <span>
                  {totalBudget > 0
                    ? `${Math.max(100 - budgetPercentage, 0)}% disponible`
                    : "Sin presupuesto configurado"}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
              <p className="text-sm font-semibold">Meta destacada</p>
              <div className="mt-5 flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                  <Target className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">
                    {highlightedGoal?.name ?? "Crea tu primera meta"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {highlightedGoal?.target_date
                      ? `Meta: ${new Intl.DateTimeFormat("es-CL", {
                          month: "long",
                          year: "numeric",
                        }).format(
                          new Date(`${highlightedGoal.target_date}T12:00:00`),
                        )}`
                      : "Define un objetivo de ahorro"}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Progreso</span>
                  <span className="font-medium">{goalPercentage}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${goalPercentage}%` }}
                  />
                </div>
                <p className="mt-4 text-sm">
                  <span className="font-semibold">
                    {currency.format(Number(highlightedGoal?.current_amount ?? 0))}
                  </span>
                  <span className="text-slate-500"> de </span>
                  <span className="text-slate-300">
                    {currency.format(Number(highlightedGoal?.target_amount ?? 0))}
                  </span>
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
                {categorySpending.map((category) => (
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
                        className="h-full rounded-full"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {categorySpending.length === 0 && (
                  <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Tus gastos por categoría aparecerán aquí.
                  </p>
                )}
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
                {transactions.slice(0, 4).map((transaction) => {
                  const positive = transaction.transaction_type === "income";
                  const TransactionIcon = positive
                    ? CircleDollarSign
                    : ReceiptText;
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3 px-5 py-3.5 sm:px-6"
                    >
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                          positive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <TransactionIcon className="size-5" aria-hidden={true} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {transaction.description}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {transaction.category?.name ?? "Sin categoría"} ·{" "}
                          {shortDate.format(
                            new Date(`${transaction.transaction_date}T12:00:00`),
                          )}
                        </p>
                      </div>
                      <p
                        className={`whitespace-nowrap text-sm font-semibold ${
                          positive ? "text-emerald-700" : "text-slate-900"
                        }`}
                      >
                        {positive ? "+" : ""}
                        {currency.format(Number(transaction.amount))}
                      </p>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <p className="px-6 py-12 text-center text-sm text-slate-500">
                    Aún no tienes movimientos. Registra el primero para comenzar.
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
      <TransactionModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
      />
    </div>
  );
}
