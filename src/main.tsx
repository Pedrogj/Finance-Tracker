import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FinanceTrackerApp } from "./FinanceTrackerApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FinanceTrackerApp />
  </StrictMode>,
);
