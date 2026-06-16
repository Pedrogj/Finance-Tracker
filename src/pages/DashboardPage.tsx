import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  LogOut,
  Pencil,
  Plus,
  ReceiptText,
  Tags,
  Target,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";
import { es } from "date-fns/locale";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Link } from "react-router";

import { DeleteTransactionDialog } from "@/components/DeleteTransactionDialog";
import { CategoryManagerModal } from "@/components/CategoryManagerModal";
import { TransactionModal } from "@/components/TransactionModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/hooks/useFinance";
import type { FinanceTransaction } from "@/types/finance";

const currency = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
});
const shortDate = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
});

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthDate(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1, 12);
}

function shiftMonth(monthKey: string, offset: number) {
  const date = getMonthDate(monthKey);
  date.setMonth(date.getMonth() + offset);
  return getMonthKey(date);
}

const currentMonthKey = getMonthKey(new Date());
const currentDay = new Date().getDate();

function getLastAvailableDay(monthKey: string) {
  if (monthKey === currentMonthKey) {
    return currentDay;
  }

  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function getAvailableMonthRange(monthKey: string): DateRange {
  const [year, month] = monthKey.split("-").map(Number);
  return {
    from: new Date(year, month - 1, 1, 12),
    to: new Date(year, month - 1, getLastAvailableDay(monthKey), 12),
  };
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const { accounts, transactions, budgets, goals, isLoading, error } =
    useFinance();
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonthKey);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    getAvailableMonthRange(currentMonthKey),
  );
  const [editingTransaction, setEditingTransaction] =
    useState<FinanceTransaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<FinanceTransaction | null>(null);

  if (!user) return null;

  const periodLabel = monthFormatter.format(getMonthDate(selectedMonthKey));
  const availableMonthKeys = [
    currentMonthKey,
    ...transactions.map((transaction) =>
      transaction.transaction_date.slice(0, 7),
    ),
    ...budgets.map((budget) => budget.month.slice(0, 7)),
  ].sort();
  const earliestMonthKey = availableMonthKeys[0];
  const isCurrentMonth = selectedMonthKey === currentMonthKey;
  const canGoBack = selectedMonthKey > earliestMonthKey;
  const canGoForward = selectedMonthKey < currentMonthKey;
  const availableRange = getAvailableMonthRange(selectedMonthKey);
  const startDate = dateRange?.from ?? availableRange.from!;
  const endDate = dateRange?.to ?? dateRange?.from ?? availableRange.to!;
  const startDateKey = formatDateKey(startDate);
  const endDateKey = formatDateKey(endDate);

  const periodTransactions = transactions.filter(
    (transaction) =>
      transaction.transaction_date >= startDateKey &&
      transaction.transaction_date <= endDateKey,
  );
  const periodIncome = periodTransactions
    .filter((transaction) => transaction.transaction_type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const periodExpenses = periodTransactions
    .filter((transaction) => transaction.transaction_type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const balance =
    accounts.reduce(
      (total, account) => total + Number(account.initial_balance),
      0,
    ) +
    transactions
      .filter(
        (transaction) => transaction.transaction_date <= endDateKey,
      )
      .reduce(
      (total, transaction) =>
        total +
        (transaction.transaction_type === "income"
          ? Number(transaction.amount)
          : -Number(transaction.amount)),
      0,
      );

  const categoryTotals = new Map<
    number,
    { name: string; amount: number; color: string }
  >();
  periodTransactions
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
    .slice(0, 4)
    .map((category) => ({
      ...category,
      percentage:
        periodExpenses > 0
          ? Math.round((category.amount / periodExpenses) * 100)
          : 0,
    }));

  const totalBudget = budgets
    .filter((budget) => budget.month.startsWith(selectedMonthKey))
    .reduce((total, budget) => total + Number(budget.amount), 0);
  const budgetPercentage =
    totalBudget > 0
      ? Math.min(Math.round((periodExpenses / totalBudget) * 100), 100)
      : 0;
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

  function changeMonth(offset: number) {
    const nextMonth = shiftMonth(selectedMonthKey, offset);
    setSelectedMonthKey(nextMonth);
    setDateRange(getAvailableMonthRange(nextMonth));
  }

  const rangeLabel =
    startDate.getDate() === endDate.getDate()
      ? `Día ${startDate.getDate()}`
      : `${startDate.getDate()} al ${endDate.getDate()} de ${periodLabel}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white">
              <WalletCards className="size-5" aria-hidden="true" />
            </span>
            <span className="font-semibold tracking-tight">Finance Tracker</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              <span className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {initials}
              </span>
              <span className="hidden items-center gap-1 sm:flex">
                <UserRound className="size-4" aria-hidden="true" />
                Perfil
              </span>
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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Hola, {firstName}
            </h1>
            <p className="mt-2 text-sm capitalize text-slate-500">
              Tu resumen financiero
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setCategoryManagerOpen(true)}
              className="h-11 rounded-xl px-4"
            >
              <Tags data-icon="inline-start" />
              Categorías
            </Button>
            <Button
              size="lg"
              onClick={() => {
                setEditingTransaction(null);
                setTransactionModalOpen(true);
              }}
              className="h-11 rounded-xl bg-emerald-600 px-4 hover:bg-emerald-700"
            >
              <Plus data-icon="inline-start" />
              Registrar movimiento
            </Button>
          </div>
        </div>

        <section
          aria-label="Seleccionar período"
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              disabled={!canGoBack}
              className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Ver mes anterior"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold capitalize text-slate-900">
                {periodLabel}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {isCurrentMonth ? "Mes actual" : "Historial mensual"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              disabled={!canGoForward}
              className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Ver mes siguiente"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-2 border-t border-slate-100 px-2 pt-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full justify-start rounded-xl px-3 text-left font-normal sm:ml-auto sm:max-w-sm"
                >
                  <CalendarDays className="text-slate-500" aria-hidden="true" />
                  <span className="truncate capitalize">{rangeLabel}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                className="w-auto max-w-[calc(100vw-2rem)] p-2"
              >
                <Calendar
                  mode="range"
                  month={getMonthDate(selectedMonthKey)}
                  selected={dateRange}
                  onSelect={setDateRange}
                  locale={es}
                  hideNavigation
                  showOutsideDays={false}
                  disabled={[
                    { before: availableRange.from! },
                    { after: availableRange.to! },
                  ]}
                  className="mx-auto"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDateRange(availableRange)}
                  className="w-full text-slate-600"
                >
                  Seleccionar mes completo
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {isLoading && transactions.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-2xl border border-slate-200 bg-white py-16">
            <span className="size-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            <p className="mt-3 text-sm text-slate-500">Cargando tus finanzas...</p>
          </div>
        ) : (
          <>
            <section className="mt-5 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
              <p className="text-sm text-slate-400">
                Saldo al día {endDate.getDate()}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {currency.format(balance)}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <ArrowUpRight
                      className="size-4 text-emerald-400"
                      aria-hidden="true"
                    />
                    Ingresos del período
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {currency.format(periodIncome)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <ArrowDownRight
                      className="size-4 text-amber-400"
                      aria-hidden="true"
                    />
                    Gastos del período
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {currency.format(periodExpenses)}
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                  <h2 className="font-semibold">Movimientos del período</h2>
                </div>

                <div className="divide-y divide-slate-100">
                  {periodTransactions.slice(0, 6).map((transaction) => {
                    const positive = transaction.transaction_type === "income";
                    const TransactionIcon = positive
                      ? CircleDollarSign
                      : ReceiptText;

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3 px-5 py-4 sm:px-6"
                      >
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                            positive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <TransactionIcon
                            className="size-5"
                            aria-hidden={true}
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {transaction.description}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {transaction.category?.name ?? "Sin categoría"} ·{" "}
                            {shortDate.format(
                              new Date(
                                `${transaction.transaction_date}T12:00:00`,
                              ),
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <p
                            className={`whitespace-nowrap text-sm font-semibold ${
                              positive ? "text-emerald-700" : "text-slate-900"
                            }`}
                          >
                            {positive ? "+" : "-"}
                            {currency.format(Number(transaction.amount))}
                          </p>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTransaction(transaction);
                                setTransactionModalOpen(true);
                              }}
                              className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              aria-label={`Editar ${transaction.description}`}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingTransaction(transaction)
                              }
                              className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Eliminar ${transaction.description}`}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {periodTransactions.length === 0 && (
                    <div className="px-6 py-14 text-center">
                      <ReceiptText className="mx-auto size-8 text-slate-300" />
                      <p className="mt-3 text-sm font-medium">
                        No hay movimientos en este período
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Puedes revisar otro mes o registrar un movimiento.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <div className="space-y-5">
                {categorySpending.length > 0 && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="font-semibold">En qué gastaste</h2>
                    <div className="mt-5 space-y-4">
                      {categorySpending.map((category) => (
                        <div key={category.name}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700">
                              {category.name}
                            </span>
                            <span className="text-slate-500">
                              {currency.format(category.amount)}
                            </span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
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
                    </div>
                  </section>
                )}

                {totalBudget > 0 && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex justify-between text-sm">
                      <h2 className="font-semibold">Presupuesto</h2>
                      <span className="text-slate-500">{budgetPercentage}%</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${budgetPercentage}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {currency.format(periodExpenses)} de{" "}
                      {currency.format(totalBudget)}
                    </p>
                  </section>
                )}

                {highlightedGoal && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Target className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="text-sm font-semibold">
                          {highlightedGoal.name}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          {goalPercentage}% completado
                        </p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <TransactionModal
        open={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
      />
      <CategoryManagerModal
        key={categoryManagerOpen ? "open" : "closed"}
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
      />
      <DeleteTransactionDialog
        key={deletingTransaction?.id ?? "closed"}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
      />
    </div>
  );
}
