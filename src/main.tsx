import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/contexts/AuthProvider";
import { FinanceProvider } from "@/contexts/FinanceProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { FinanceTrackerApp } from "./FinanceTrackerApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <FinanceTrackerApp />
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
