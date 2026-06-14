import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  FinanceContext,
  type FinanceContextValue,
} from "@/contexts/finance-context";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type {
  Account,
  Budget,
  Category,
  FinanceTransaction,
  SavingsGoal,
} from "@/types/finance";

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const clearData = useCallback(() => {
    setAccounts([]);
    setCategories([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setError("");
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      clearData();
      return;
    }

    setIsLoading(true);
    setError("");

    const [accountsResult, categoriesResult, transactionsResult, budgetsResult, goalsResult] =
      await Promise.all([
        supabase
          .from("accounts")
          .select("id, name, account_type, currency, initial_balance")
          .eq("is_archived", false)
          .order("created_at"),
        supabase
          .from("categories")
          .select("id, name, category_type, color, icon")
          .order("category_type")
          .order("name"),
        supabase
          .from("transactions")
          .select(
            "id, account_id, category_id, transaction_type, amount, description, notes, transaction_date, created_at, category:categories(name, color, icon), account:accounts(name)",
          )
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("budgets")
          .select("id, category_id, month, amount")
          .order("month", { ascending: false }),
        supabase
          .from("savings_goals")
          .select(
            "id, name, target_amount, current_amount, target_date, status",
          )
          .order("created_at", { ascending: false }),
      ]);

    const firstError =
      accountsResult.error ??
      categoriesResult.error ??
      transactionsResult.error ??
      budgetsResult.error ??
      goalsResult.error;

    if (firstError) {
      setError("No pudimos cargar tu información financiera.");
      setIsLoading(false);
      return;
    }

    setAccounts((accountsResult.data ?? []) as Account[]);
    setCategories((categoriesResult.data ?? []) as Category[]);
    setTransactions(
      (transactionsResult.data ?? []) as unknown as FinanceTransaction[],
    );
    setBudgets((budgetsResult.data ?? []) as Budget[]);
    setGoals((goalsResult.data ?? []) as SavingsGoal[]);
    setIsLoading(false);
  }, [clearData, user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  const value = useMemo<FinanceContextValue>(
    () => ({
      accounts,
      categories,
      transactions,
      budgets,
      goals,
      isLoading,
      error,
      refresh,
      async createTransaction(transaction) {
        const { error: insertError } = await supabase
          .from("transactions")
          .insert({
            account_id: transaction.accountId,
            category_id: transaction.categoryId,
            transaction_type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            notes: transaction.notes || null,
            transaction_date: transaction.date,
          });

        if (insertError) {
          return "No pudimos guardar el movimiento. Revisa los datos e inténtalo nuevamente.";
        }

        await refresh();
        return null;
      },
    }),
    [
      accounts,
      budgets,
      categories,
      error,
      goals,
      isLoading,
      refresh,
      transactions,
    ],
  );

  return <FinanceContext value={value}>{children}</FinanceContext>;
}
