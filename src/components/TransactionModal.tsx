import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useFinance } from "@/hooks/useFinance";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/schemas/finance";
import type {
  Account,
  Category,
  FinanceTransaction,
  NewTransaction,
} from "@/types/finance";

type TransactionModalProps = {
  open: boolean;
  onClose: () => void;
  transaction?: FinanceTransaction | null;
};

type TransactionFormProps = {
  accounts: Account[];
  categories: Category[];
  createTransaction: (transaction: NewTransaction) => Promise<string | null>;
  updateTransaction: (
    transactionId: number,
    transaction: NewTransaction,
  ) => Promise<string | null>;
  onClose: () => void;
  transaction?: FinanceTransaction | null;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 aria-invalid:border-red-400 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-emerald-950 dark:aria-invalid:focus:ring-red-950";

const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function formatClpInput(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";
  return clpFormatter.format(value);
}

function parseClpInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{message}</p>;
}

function TransactionForm({
  accounts,
  categories,
  createTransaction,
  updateTransaction,
  onClose,
  transaction,
}: TransactionFormProps) {
  const expenseCategories = categories.filter(
    (category) => category.category_type === "expense",
  );
  const initialAmount = transaction ? Number(transaction.amount) : 0;
  const [amountInput, setAmountInput] = useState(formatClpInput(initialAmount));
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.transaction_type ?? "expense",
      accountId: String(transaction?.account_id ?? accounts[0]?.id ?? ""),
      categoryId: String(
        transaction?.category_id ?? expenseCategories[0]?.id ?? "",
      ),
      amount: initialAmount,
      description: transaction?.description ?? "",
      date: transaction?.transaction_date ?? getLocalDateInputValue(),
      notes: transaction?.notes ?? "",
    },
  });

  const type = useWatch({ control, name: "type" });
  const filteredCategories = categories.filter(
    (category) => category.category_type === type,
  );

  async function onSubmit(values: TransactionFormValues) {
    const payload: NewTransaction = {
      accountId: Number(values.accountId),
      categoryId: Number(values.categoryId),
      type: values.type,
      amount: values.amount,
      description: values.description,
      notes: values.notes,
      date: values.date,
    };
    const submitError = transaction
      ? await updateTransaction(transaction.id, payload)
      : await createTransaction(payload);

    if (submitError) {
      setError("root.server", { message: submitError });
      return;
    }

    onClose();
  }

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-title"
      className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 text-slate-950 shadow-2xl transition-colors sm:p-6 dark:bg-slate-900 dark:text-slate-50"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2
            id="transaction-title"
            className="text-xl font-semibold text-slate-950 dark:text-slate-50"
          >
            {transaction ? "Editar movimiento" : "Registrar movimiento"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          aria-label="Cerrar formulario"
        >
          <X className="size-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <input type="hidden" {...register("type")} />
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(["expense", "income"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                const firstCategory = categories.find(
                  (category) => category.category_type === option,
                );
                setValue("type", option, { shouldValidate: true });
                setValue("categoryId", String(firstCategory?.id ?? ""), {
                  shouldValidate: true,
                });
              }}
                className={`h-9 rounded-lg text-sm font-medium transition ${
                  type === option
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {option === "expense" ? "Gasto" : "Ingreso"}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Descripción
          <input
            className={`${fieldClass} mt-2`}
            placeholder="Ej. Compra de supermercado"
            maxLength={160}
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Monto
            <input
              className={`${fieldClass} mt-2`}
              type="text"
              inputMode="numeric"
              placeholder="$0"
              value={amountInput}
              onChange={(event) => {
                const amount = parseClpInput(event.target.value);
                setAmountInput(formatClpInput(amount));
                setValue("amount", amount, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              aria-invalid={Boolean(errors.amount)}
            />
            <FieldError message={errors.amount?.message} />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Fecha
            <input
              className={`${fieldClass} mt-2`}
              type="date"
              aria-invalid={Boolean(errors.date)}
              {...register("date")}
            />
            <FieldError message={errors.date?.message} />
          </label>
        </div>

        {accounts.length === 1 ? (
          <input type="hidden" {...register("accountId")} />
        ) : (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Cuenta
            <select
              className={`${fieldClass} mt-2`}
              aria-invalid={Boolean(errors.accountId)}
              {...register("accountId")}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.accountId?.message} />
          </label>
        )}

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Categoría
          <select
            className={`${fieldClass} mt-2`}
            aria-invalid={Boolean(errors.categoryId)}
            {...register("categoryId")}
          >
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.categoryId?.message} />
        </label>

        <input type="hidden" {...register("notes")} />

        {errors.root?.server?.message && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            {errors.root.server.message}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || accounts.length === 0}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500"
          >
            {isSubmitting
              ? "Guardando..."
              : transaction
                ? "Guardar cambios"
                : "Guardar movimiento"}
          </Button>
        </div>
      </form>
    </section>
  );
}

export function TransactionModal({
  open,
  onClose,
  transaction,
}: TransactionModalProps) {
  const { accounts, categories, createTransaction, updateTransaction } =
    useFinance();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm dark:bg-slate-950/75"
      role="presentation"
    >
      <TransactionForm
        key={transaction?.id ?? "new"}
        accounts={accounts}
        categories={categories}
        createTransaction={createTransaction}
        updateTransaction={updateTransaction}
        onClose={onClose}
        transaction={transaction}
      />
    </div>
  );
}
