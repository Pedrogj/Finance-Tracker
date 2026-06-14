import { createContext } from "react";

import type {
  Account,
  Budget,
  Category,
  FinanceTransaction,
  NewCategory,
  NewTransaction,
  SavingsGoal,
} from "@/types/finance";

export type FinanceContextValue = {
  accounts: Account[];
  categories: Category[];
  transactions: FinanceTransaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  isLoading: boolean;
  error: string;
  createCategory: (category: NewCategory) => Promise<string | null>;
  deleteCategory: (categoryId: number) => Promise<string | null>;
  createTransaction: (transaction: NewTransaction) => Promise<string | null>;
  updateTransaction: (
    transactionId: number,
    transaction: NewTransaction,
  ) => Promise<string | null>;
  deleteTransaction: (transactionId: number) => Promise<string | null>;
  refresh: () => Promise<void>;
};

export const FinanceContext = createContext<FinanceContextValue | undefined>(
  undefined,
);
