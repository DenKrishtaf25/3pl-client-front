import FinancePageClient from "./FinancePageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ПЭК:3PL - Финансы",
  description: "ПЭК:3PL - Управление финансами",
};

export default function FinancePage() {
  return <FinancePageClient />;
}
