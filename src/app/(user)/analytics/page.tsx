import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import AnalyticsPageClient from "./AnalyticsPageClient";

export const metadata: Metadata = {
  title: "Отчеты и аналитика",
  description:
    "Страница отчетов и аналитики с графиками",
};

export default function AnalyticsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Отчеты и аналитика" />
      <AnalyticsPageClient />
    </div>
  );
}
