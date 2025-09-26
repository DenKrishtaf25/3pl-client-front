import LineChartOne1 from "@/components/charts/line/LineChartOne1";
import LineChartOne2 from "@/components/charts/line/LineChartOne2";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Line Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Line Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};
export default function LineChart() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Отчеты и аналитика" />
      <div className="space-y-6">
        <ComponentCard title="Колличество ТС">
          <LineChartOne1 />
        </ComponentCard>

        <ComponentCard title="Выполнено заказов">
          <LineChartOne2 />
        </ComponentCard>
      </div>
    </div>
  );
}
