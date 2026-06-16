import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { useAuth } from "@/hooks/useAuth";
import { DashboardPage } from "@/pages/DashboardPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";

export const FinanceTrackerApp = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50">
        <div className="text-center">
          <span className="mx-auto block size-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Cargando tu sesión...</p>
        </div>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/" replace /> : <ForgotPasswordPage />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/"
          element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
