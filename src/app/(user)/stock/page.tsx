import StockPageClient from "./StockPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ПЭК:3PL",
  description:
    "ПЭК:3PL",
  // other metadata
};

export default function BasicTables() {
  return <StockPageClient />;
}
