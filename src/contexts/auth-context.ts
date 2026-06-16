import type { AuthError } from "@supabase/supabase-js";
import { createContext } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type SignUpResult = {
  error: AuthError | null;
  requiresEmailConfirmation: boolean;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<SignUpResult>;
  requestPasswordReset: (email: string) => Promise<AuthError | null>;
  updatePassword: (password: string) => Promise<AuthError | null>;
  signOut: () => Promise<AuthError | null>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
