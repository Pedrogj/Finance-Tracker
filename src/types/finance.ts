export type TransactionType = "income" | "expense";

export type Account = {
  id: number;
  name: string;
  account_type: "cash" | "checking" | "savings" | "credit" | "investment";
  currency: string;
  initial_balance: number;
};

export type Category = {
  id: number;
  name: string;
  category_type: TransactionType;
  color: string;
  icon: string;
};

export type FinanceTransaction = {
  id: number;
  account_id: number;
  category_id: number;
  transaction_type: TransactionType;
  amount: number;
  description: string;
  notes: string | null;
  transaction_date: string;
  created_at: string;
  category: Pick<Category, "name" | "color" | "icon"> | null;
  account: Pick<Account, "name"> | null;
};

export type Budget = {
  id: number;
  category_id: number;
  month: string;
  amount: number;
};

export type SavingsGoal = {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  status: "active" | "paused" | "completed";
};

export type NewTransaction = {
  accountId: number;
  categoryId: number;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  date: string;
};
