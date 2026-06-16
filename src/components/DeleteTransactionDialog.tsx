import { useState } from "react";
import { Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFinance } from "@/hooks/useFinance";
import type { FinanceTransaction } from "@/types/finance";

type DeleteTransactionDialogProps = {
  transaction: FinanceTransaction | null;
  onClose: () => void;
};

export function DeleteTransactionDialog({
  transaction,
  onClose,
}: DeleteTransactionDialogProps) {
  const { deleteTransaction } = useFinance();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!transaction) return null;

  async function handleDelete() {
    if (!transaction) return;

    setIsDeleting(true);
    setError("");
    const deleteError = await deleteTransaction(transaction.id);

    if (deleteError) {
      setError(deleteError);
      setIsDeleting(false);
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm dark:bg-slate-950/75">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-transaction-title"
        className="w-full max-w-sm rounded-2xl bg-white p-5 text-slate-950 shadow-2xl transition-colors sm:p-6 dark:bg-slate-900 dark:text-slate-50"
      >
        <div className="flex items-start justify-between">
          <span className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            aria-label="Cerrar confirmación"
          >
            <X className="size-5" />
          </button>
        </div>

        <h2
          id="delete-transaction-title"
          className="mt-5 text-xl font-semibold text-slate-950 dark:text-slate-50"
        >
          Eliminar movimiento
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Se eliminará{" "}
          <strong className="font-medium text-slate-700 dark:text-slate-200">
            {transaction.description}
          </strong>
          . Esta acción no se puede deshacer.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </section>
    </div>
  );
}
