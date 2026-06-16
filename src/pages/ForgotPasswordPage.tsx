import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

import { AuthShell } from "@/components/AuthShell";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth";

function getResetRequestError(message: string) {
  if (message.includes("rate limit")) {
    return "Espera unos minutos antes de solicitar otro enlace.";
  }
  return "No pudimos enviar el correo de recuperación. Inténtalo nuevamente.";
}

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [wasSent, setWasSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    const error = await requestPasswordReset(values.email);

    if (error) {
      setError("root.server", {
        message: getResetRequestError(error.message),
      });
      return;
    }

    setWasSent(true);
  }

  return (
    <AuthShell
      eyebrow="Recupera tu acceso"
      title="Restablece tu contraseña"
      description="Ingresa tu correo y te enviaremos un enlace seguro para crear una nueva contraseña."
    >
      {wasSent ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <MailCheck className="size-4" aria-hidden="true" />
              Revisa tu correo
            </div>
            Si existe una cuenta asociada, recibirás un enlace para cambiar tu
            contraseña. También revisa la carpeta de spam.
          </div>

          <Button
            asChild
            size="lg"
            className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500"
          >
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            id="email"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.cl"
            error={errors.email?.message}
            {...register("email")}
          />

          {errors.root?.server?.message && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              {errors.root.server.message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500"
          >
            {isSubmitting ? "Enviando..." : "Enviar enlace"}
          </Button>
        </form>
      )}

      <p className="mt-7 text-center text-sm text-slate-500">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthShell>
  );
}
