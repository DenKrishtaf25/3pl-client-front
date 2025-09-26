import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne1 from "@/components/tables/BasicTableOne1";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "ПЭК:3PL",
  description:
    "ПЭК:3PL",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Товарный запас" />
      <div className="space-y-6">
        <ComponentCard title="Данные остатков">
          <BasicTableOne1 />
        </ComponentCard>
      </div>
    </div>
  );
}
