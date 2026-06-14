import { useContext } from "react";

import { FinanceContext } from "@/contexts/finance-context";

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance debe utilizarse dentro de FinanceProvider.");
  }

  return context;
}
