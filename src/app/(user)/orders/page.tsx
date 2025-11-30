import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrdersTable from "@/components/tables/OrdersTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "ПЭК:3PL - Заказы",
  description: "ПЭК:3PL - Управление заказами",
};

export default function OrdersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Заказы" />
      <div className="space-y-6">
        <ComponentCard title="Данные заказов">
          <OrdersTable />
        </ComponentCard>
      </div>
    </div>
  );
}
