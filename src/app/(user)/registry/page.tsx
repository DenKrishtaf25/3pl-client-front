import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RegistryTable from "@/components/tables/RegistryTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "ПЭК:3PL",
  description:
    "ПЭК:3PL",
  // other metadata
};

export default function RegistryPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Транспорт" />
      <div className="space-y-6">
        <ComponentCard title="Реестр заказов">
          <RegistryTable />
        </ComponentCard>
      </div>
    </div>
  );
}

