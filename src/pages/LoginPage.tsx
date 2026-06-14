import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { AuthShell } from "@/components/AuthShell";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  loginSchema,
  type LoginFormValues,
} from "@/schemas/auth";

function getLoginError(message: string) {
  if (message.includes("Invalid login credentials")) {
    return "El correo o la contraseña son incorrectos.";
  }
  if (message.includes("Email not confirmed")) {
    return "Confirma tu correo electrónico antes de iniciar sesión.";
  }
  return "No pudimos iniciar sesión. Inténtalo nuevamente.";
}

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    const error = await signIn(values.email, values.password);

    if (error) {
      setError("root.server", {
        message: getLoginError(error.message),
      });
      return;
    }

    navigate("/");
  }

  return (
    <AuthShell
      eyebrow="Bienvenido de vuelta"
      title="Inicia sesión"
      description="Accede a tu panorama financiero y continúa organizando tu presupuesto."
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.cl"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <div className="relative">
            <FormField
              id="password"
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
          <div className="mt-2 text-right">
            <button
              type="button"
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
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
          className="h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        ¿Aún no tienes una cuenta?{" "}
        <Link
          to="/register"
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Regístrate gratis
        </Link>
      </p>
    </AuthShell>
  );
}
