import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name:
      typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : (user.email?.split("@")[0] ?? "Usuario"),
    email: user.email ?? "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      setUser(session ? toAuthUser(session.user) : null);
      setIsPasswordRecovery(event === "PASSWORD_RECOVERY");
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setUser(data.session ? toAuthUser(data.session.user) : null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isPasswordRecovery,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        setIsPasswordRecovery(false);
        return error;
      },
      async signUp(name, email, password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
            emailRedirectTo: window.location.origin,
          },
        });

        return {
          error,
          requiresEmailConfirmation: !error && !data.session,
        };
      },
      async requestPasswordReset(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        return error;
      },
      async updatePassword(password) {
        const { error } = await supabase.auth.updateUser({ password });
        return error;
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        setIsPasswordRecovery(false);
        return error;
      },
    }),
    [isLoading, isPasswordRecovery, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
