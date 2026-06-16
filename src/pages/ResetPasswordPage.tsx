import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

import { AuthShell } from "@/components/AuthShell";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schemas/auth";

function getPasswordUpdateError(message: string) {
  if (
    message.includes("Auth session missing") ||
    message.includes("JWT") ||
    message.includes("expired")
  ) {
    return "El enlace expiró o no es válido. Solicita uno nuevo para continuar.";
  }
  return "No pudimos actualizar tu contraseña. Inténtalo nuevamente.";
}

export function ResetPasswordPage() {
  const { user, isLoading, isPasswordRecovery, signOut, updatePassword } =
    useAuth();
  const [completed, setCompleted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const recoveryUrlState = useMemo(() => {
    const params = new URLSearchParams(window.location.hash.replace("#", ""));
    const searchParams = new URLSearchParams(window.location.search);

    return {
      errorDescription: params.get("error_description"),
      hasRecoveryLink:
        params.get("type") === "recovery" ||
        params.has("access_token") ||
        searchParams.has("code"),
    };
  }, []);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmation: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    const error = await updatePassword(values.password);

    if (error) {
      setError("root.server", {
        message: getPasswordUpdateError(error.message),
      });
      return;
    }

    await signOut();
    setCompleted(true);
  }

  if (isLoading) {
    return (
      <AuthShell
        eyebrow="Validando enlace"
        title="Un momento..."
        description="Estamos preparando el formulario para que puedas cambiar tu contraseña."
      >
        <div className="grid place-items-center py-6">
          <span className="block size-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        </div>
      </AuthShell>
    );
  }

  if (completed) {
    return (
      <AuthShell
        eyebrow="Contraseña actualizada"
        title="Todo listo"
        description="Tu contraseña fue cambiada correctamente. Ya puedes iniciar sesión con tu nueva clave."
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Cambio confirmado
            </div>
            Por seguridad cerramos la sesión temporal de recuperación.
          </div>

          <Button
            asChild
            size="lg"
            className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500"
          >
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (
    recoveryUrlState.errorDescription ||
    !user ||
    (!isPasswordRecovery && !recoveryUrlState.hasRecoveryLink)
  ) {
    return (
      <AuthShell
        eyebrow="Enlace no disponible"
        title="No pudimos validar el enlace"
        description="El enlace puede haber expirado, ya fue usado o no corresponde a una recuperación activa."
      >
        <div className="space-y-5">
          <p
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800"
          >
            Solicita un nuevo correo de recuperación para cambiar tu contraseña.
          </p>

          <Button
            asChild
            size="lg"
            className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500"
          >
            <Link to="/forgot-password">Solicitar nuevo enlace</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Nueva contraseña"
      title="Crea una nueva contraseña"
      description="Elige una clave segura para volver a entrar a MoneyFlow."
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="relative">
          <FormField
            id="password"
            label="Nueva contraseña"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            className="pr-11"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-slate-400 transition hover:text-slate-700"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        <div className="relative">
          <FormField
            id="confirmation"
            label="Confirmar contraseña"
            type={showConfirmation ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repite tu nueva contraseña"
            error={errors.confirmation?.message}
            className="pr-11"
            {...register("confirmation")}
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-slate-400 transition hover:text-slate-700"
            onClick={() => setShowConfirmation((visible) => !visible)}
            aria-label={
              showConfirmation ? "Ocultar confirmación" : "Mostrar confirmación"
            }
          >
            {showConfirmation ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

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
          {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
        </Button>
      </form>

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
