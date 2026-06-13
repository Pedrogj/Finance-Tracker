import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { AuthShell } from "@/components/AuthShell";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type RegisterErrors = Partial<
  Record<"name" | "email" | "password" | "confirmation", string>
>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");
    const nextErrors: RegisterErrors = {};

    if (!name.trim()) nextErrors.name = "Ingresa tu nombre.";

    if (!email.trim()) {
      nextErrors.email = "Ingresa tu correo electrónico.";
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }

    if (!password) {
      nextErrors.password = "Crea una contraseña.";
    } else if (password.length < 6) {
      nextErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    if (!confirmation) {
      nextErrors.confirmation = "Confirma tu contraseña.";
    } else if (confirmation !== password) {
      nextErrors.confirmation = "Las contraseñas no coinciden.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const { error, requiresEmailConfirmation } = await signUp(
      name.trim(),
      email.trim(),
      password,
    );
    setIsSubmitting(false);

    if (error) {
      setFormError(getRegisterError(error.message));
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
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="name"
          label="Nombre completo"
          autoComplete="name"
          placeholder="Tu nombre"
          value={name}
          error={errors.name}
          onChange={(event) => setName(event.target.value)}
        />
        <FormField
          id="register-email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.cl"
          value={email}
          error={errors.email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="register-password"
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            error={errors.password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <FormField
            id="confirmation"
            label="Confirmar"
            type="password"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={confirmation}
            error={errors.confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Al crear una cuenta aceptas los términos de uso y la política de
          privacidad de Finance Tracker.
        </p>

        {formError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          >
            {formError}
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
