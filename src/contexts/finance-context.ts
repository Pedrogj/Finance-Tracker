import { createContext } from "react";

import type {
  Account,
  Budget,
  Category,
  FinanceTransaction,
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
  createTransaction: (transaction: NewTransaction) => Promise<string | null>;
  refresh: () => Promise<void>;
};

export const FinanceContext = createContext<FinanceContextValue | undefined>(
  undefined,
);
