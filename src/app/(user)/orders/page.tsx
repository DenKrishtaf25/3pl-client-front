import OrdersPageClient from "./OrdersPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ПЭК:3PL - Заказы",
  description: "ПЭК:3PL - Управление заказами",
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
