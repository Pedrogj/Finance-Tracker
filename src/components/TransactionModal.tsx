import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useFinance } from "@/hooks/useFinance";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/schemas/finance";
import type { Account, Category, NewTransaction } from "@/types/finance";

type TransactionModalProps = {
  open: boolean;
  onClose: () => void;
};

type TransactionFormProps = {
  accounts: Account[];
  categories: Category[];
  createTransaction: (transaction: NewTransaction) => Promise<string | null>;
  onClose: () => void;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 aria-invalid:border-red-400 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-100";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-600">{message}</p>;
}

function TransactionForm({
  accounts,
  categories,
  createTransaction,
  onClose,
}: TransactionFormProps) {
  const expenseCategories = categories.filter(
    (category) => category.category_type === "expense",
  );
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
      type: "expense",
      accountId: String(accounts[0]?.id ?? ""),
      categoryId: String(expenseCategories[0]?.id ?? ""),
      amount: 0,
      description: "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const type = useWatch({ control, name: "type" });
  const filteredCategories = categories.filter(
    (category) => category.category_type === type,
  );

  async function onSubmit(values: TransactionFormValues) {
    const submitError = await createTransaction({
      accountId: Number(values.accountId),
      categoryId: Number(values.categoryId),
      type: values.type,
      amount: values.amount,
      description: values.description,
      notes: values.notes,
      date: values.date,
    });

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
      className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Registro financiero
          </p>
          <h2
            id="transaction-title"
            className="mt-1 text-xl font-semibold text-slate-950"
          >
            Nuevo movimiento
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar formulario"
        >
          <X className="size-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <input type="hidden" {...register("type")} />
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
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
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {option === "expense" ? "Gasto" : "Ingreso"}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-slate-700">
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
          <label className="block text-sm font-medium text-slate-700">
            Monto
            <input
              className={`${fieldClass} mt-2`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              placeholder="$ 0"
              aria-invalid={Boolean(errors.amount)}
              {...register("amount", { valueAsNumber: true })}
            />
            <FieldError message={errors.amount?.message} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
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
          <label className="block text-sm font-medium text-slate-700">
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
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Notas <span className="font-normal text-slate-400">(opcional)</span>
          <textarea
            className="mt-2 min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 aria-invalid:border-red-400 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-100"
            maxLength={1000}
            aria-invalid={Boolean(errors.notes)}
            {...register("notes")}
          />
          <FieldError message={errors.notes?.message} />
        </label>

        {errors.root?.server?.message && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          >
            {errors.root.server.message}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || accounts.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? "Guardando..." : "Guardar movimiento"}
          </Button>
        </div>
      </form>
    </section>
  );
}

export function TransactionModal({ open, onClose }: TransactionModalProps) {
  const { accounts, categories, createTransaction } = useFinance();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <TransactionForm
        accounts={accounts}
        categories={categories}
        createTransaction={createTransaction}
        onClose={onClose}
      />
    </div>
  );
}
