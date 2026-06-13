import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/contexts/AuthProvider";
import { FinanceTrackerApp } from "./FinanceTrackerApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <FinanceTrackerApp />
    </AuthProvider>
  </StrictMode>,
);
