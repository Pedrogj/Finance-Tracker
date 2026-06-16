import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  ThemeContext,
  type Theme,
  type ThemeContextValue,
} from "@/contexts/theme-context";

const STORAGE_KEY = "moneyflow-theme";

function getInitialTheme(): Theme {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme() {
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark",
        );
      },
    }),
    [theme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
