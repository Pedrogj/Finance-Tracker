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

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setUser(data.session ? toAuthUser(data.session.user) : null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? toAuthUser(session.user) : null);
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
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
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
      async signOut() {
        const { error } = await supabase.auth.signOut();
        return error;
      },
    }),
    [isLoading, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
