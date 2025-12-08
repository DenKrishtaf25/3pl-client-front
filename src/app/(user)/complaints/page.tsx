import ComplaintsPageClient from "./ComplaintsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ПЭК:3PL - Рекламации",
  description: "ПЭК:3PL - Управление рекламациями",
};

export default function ComplaintsPage() {
  return <ComplaintsPageClient />;
}
