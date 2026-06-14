import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  accountId: z.string().min(1, "Selecciona una cuenta."),
  categoryId: z.string().min(1, "Selecciona una categoría."),
  amount: z
    .number({ error: "Ingresa un monto válido." })
    .positive("El monto debe ser mayor que cero."),
  description: z
    .string()
    .trim()
    .min(1, "Ingresa una descripción.")
    .max(160, "La descripción no puede superar los 160 caracteres."),
  date: z.string().min(1, "Selecciona una fecha."),
  notes: z
    .string()
    .trim()
    .max(1000, "Las notas no pueden superar los 1000 caracteres."),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresa un nombre.")
    .max(60, "El nombre no puede superar los 60 caracteres."),
  type: z.enum(["expense", "income"]),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Selecciona un color válido."),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
