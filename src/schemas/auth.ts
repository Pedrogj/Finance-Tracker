import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo electrónico.")
    .email("Ingresa un correo electrónico válido."),
  password: z
    .string()
    .min(1, "Ingresa tu contraseña.")
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(120, "El nombre no puede superar los 120 caracteres."),
    email: z
      .string()
      .trim()
      .min(1, "Ingresa tu correo electrónico.")
      .email("Ingresa un correo electrónico válido."),
    password: z
      .string()
      .min(1, "Crea una contraseña.")
      .min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmation: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((values) => values.password === values.confirmation, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmation"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
