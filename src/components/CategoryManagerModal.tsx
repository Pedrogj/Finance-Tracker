import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Tags, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useFinance } from "@/hooks/useFinance";
import {
  categorySchema,
  type CategoryFormValues,
} from "@/schemas/finance";
import type { Category, TransactionType } from "@/types/finance";

type CategoryManagerModalProps = {
  open: boolean;
  onClose: () => void;
};

const colors = [
  "#10b981",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#ef4444",
  "#64748b",
];

const fieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 aria-invalid:border-red-400 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-100";

function CategoryList({
  title,
  type,
  categories,
  deletingId,
  onDelete,
}: {
  title: string;
  type: TransactionType;
  categories: Category[];
  deletingId: number | null;
  onDelete: (category: Category) => void;
}) {
  const filteredCategories = categories.filter(
    (category) => category.category_type === type,
  );

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="flex min-h-12 items-center gap-3 px-3"
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
              {category.name}
            </span>
            <button
              type="button"
              onClick={() => onDelete(category)}
              disabled={deletingId === category.id}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label={`Eliminar categoría ${category.name}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="px-3 py-4 text-sm text-slate-400">
            No hay categorías.
          </p>
        )}
      </div>
    </div>
  );
}

export function CategoryManagerModal({
  open,
  onClose,
}: CategoryManagerModalProps) {
  const { categories, createCategory, deleteCategory } = useFinance();
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const {
    control,
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: "expense",
      color: colors[0],
    },
  });
  const type = useWatch({ control, name: "type" });
  const color = useWatch({ control, name: "color" });

  if (!open) return null;

  async function onSubmit(values: CategoryFormValues) {
    const submitError = await createCategory(values);

    if (submitError) {
      setError("root.server", { message: submitError });
      return;
    }

    reset({ name: "", type: values.type, color: values.color });
  }

  async function handleDelete() {
    if (!categoryToDelete) return;

    setDeletingId(categoryToDelete.id);
    setDeleteError("");
    const error = await deleteCategory(categoryToDelete.id);

    if (error) {
      setDeleteError(error);
      setDeletingId(null);
      return;
    }

    setCategoryToDelete(null);
    setDeletingId(null);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-manager-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Tags className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="category-manager-title"
                className="text-xl font-semibold text-slate-950"
              >
                Categorías
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Organiza tus ingresos y gastos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar categorías"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 rounded-2xl bg-slate-50 p-4"
        >
          <input type="hidden" {...register("type")} />
          <input type="hidden" {...register("color")} />
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-200/70 p-1">
            {(["expense", "income"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setValue("type", option, { shouldValidate: true })
                }
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

          <div className="mt-4 flex gap-2">
            <div className="min-w-0 flex-1">
              <input
                className={fieldClass}
                placeholder="Nombre de la categoría"
                maxLength={60}
                aria-label="Nombre de la categoría"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name?.message && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-11 bg-emerald-600 px-4 hover:bg-emerald-700"
            >
              <Plus aria-hidden="true" />
              <span className="hidden sm:inline">
                {isSubmitting ? "Creando..." : "Crear"}
              </span>
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2" aria-label="Color">
            {colors.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setValue("color", option, { shouldValidate: true })
                }
                className={`size-7 rounded-full border-2 transition ${
                  color === option
                    ? "border-slate-900 ring-2 ring-slate-200"
                    : "border-white"
                }`}
                style={{ backgroundColor: option }}
                aria-label={`Usar color ${option}`}
                aria-pressed={color === option}
              />
            ))}
          </div>

          {errors.root?.server?.message && (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {errors.root.server.message}
            </p>
          )}
        </form>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <CategoryList
            title="Gastos"
            type="expense"
            categories={categories}
            deletingId={deletingId}
            onDelete={(category) => {
              setDeleteError("");
              setCategoryToDelete(category);
            }}
          />
          <CategoryList
            title="Ingresos"
            type="income"
            categories={categories}
            deletingId={deletingId}
            onDelete={(category) => {
              setDeleteError("");
              setCategoryToDelete(category);
            }}
          />
        </div>

        {categoryToDelete && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-900">
              ¿Eliminar “{categoryToDelete.name}”?
            </p>
            <p className="mt-1 text-xs leading-5 text-red-700">
              No podrás eliminarla si tiene movimientos asociados.
            </p>
            {deleteError && (
              <p role="alert" className="mt-2 text-xs font-medium text-red-700">
                {deleteError}
              </p>
            )}
            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={deletingId !== null}
                onClick={() => setCategoryToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={deletingId !== null}
                onClick={() => void handleDelete()}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deletingId ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
