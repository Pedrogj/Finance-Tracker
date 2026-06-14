import { useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFinance } from "@/hooks/useFinance";
import type { TransactionType } from "@/types/finance";

type TransactionModalProps = {
  open: boolean;
  onClose: () => void;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export function TransactionModal({ open, onClose }: TransactionModalProps) {
  const { accounts, categories, createTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>("expense");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.category_type === type),
    [categories, type],
  );

  const selectedAccountId = accountId || String(accounts[0]?.id ?? "");
  const selectedCategoryId =
    categoryId || String(filteredCategories[0]?.id ?? "");

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedAmount = Number(amount);
    if (
      !selectedAccountId ||
      !selectedCategoryId ||
      !description.trim() ||
      !date ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setError("Completa todos los campos obligatorios con valores válidos.");
      return;
    }

    setIsSubmitting(true);
    const submitError = await createTransaction({
      accountId: Number(selectedAccountId),
      categoryId: Number(selectedCategoryId),
      type,
      amount: parsedAmount,
      description: description.trim(),
      notes: notes.trim(),
      date,
    });
    setIsSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    setAmount("");
    setDescription("");
    setNotes("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="presentation"
    >
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {(["expense", "income"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setType(option);
                  setCategoryId("");
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
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ej. Compra de supermercado"
              maxLength={160}
            />
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
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="$ 0"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Fecha
              <input
                className={`${fieldClass} mt-2`}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Cuenta
              <select
                className={`${fieldClass} mt-2`}
                value={selectedAccountId}
                onChange={(event) => setAccountId(event.target.value)}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Categoría
              <select
                className={`${fieldClass} mt-2`}
                value={selectedCategoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Notas <span className="font-normal text-slate-400">(opcional)</span>
            <textarea
              className="mt-2 min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={1000}
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              {error}
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
    </div>
  );
}
