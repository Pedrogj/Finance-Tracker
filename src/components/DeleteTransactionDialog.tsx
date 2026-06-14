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
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-transaction-title"
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between">
          <span className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-600">
            <Trash2 className="size-5" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar confirmación"
          >
            <X className="size-5" />
          </button>
        </div>

        <h2
          id="delete-transaction-title"
          className="mt-5 text-xl font-semibold text-slate-950"
        >
          Eliminar movimiento
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Se eliminará{" "}
          <strong className="font-medium text-slate-700">
            {transaction.description}
          </strong>
          . Esta acción no se puede deshacer.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
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
