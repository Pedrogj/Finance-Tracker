import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { AuthShell } from "@/components/AuthShell";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/schemas/auth";

function getRegisterError(message: string) {
  if (message.includes("already registered")) {
    return "Ya existe una cuenta asociada a este correo.";
  }
  if (message.includes("Password should be")) {
    return "La contraseña no cumple los requisitos de seguridad.";
  }
  return "No pudimos crear tu cuenta. Inténtalo nuevamente.";
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmation: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setSuccessMessage("");
    const { error, requiresEmailConfirmation } = await signUp(
      values.name,
      values.email,
      values.password,
    );

    if (error) {
      setError("root.server", {
        message: getRegisterError(error.message),
      });
      return;
    }

    if (!requiresEmailConfirmation) {
      navigate("/");
      return;
    }

    setSuccessMessage(
      "Cuenta creada. Revisa tu correo y confirma tu dirección para iniciar sesión.",
    );
  }

  return (
    <AuthShell
      eyebrow="Comienza hoy"
      title="Crea tu cuenta"
      description="Configura tu espacio personal y empieza a construir mejores hábitos financieros."
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          id="name"
          label="Nombre completo"
          autoComplete="name"
          placeholder="Tu nombre"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormField
          id="register-email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.cl"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="register-password"
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register("password")}
          />
          <FormField
            id="confirmation"
            label="Confirmar"
            type="password"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            error={errors.confirmation?.message}
            {...register("confirmation")}
          />
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Al crear una cuenta aceptas los términos de uso y la política de
          privacidad de Finance Tracker.
        </p>

        {errors.root?.server?.message && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          >
            {errors.root.server.message}
          </p>
        )}

        {successMessage && (
          <p
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800"
          >
            {successMessage}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        ¿Ya tienes una cuenta?{" "}
        <Link
          to="/login"
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
