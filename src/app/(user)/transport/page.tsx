import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne2 from "@/components/tables/BasicTableOne2";
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
      <PageBreadcrumb pageTitle="Транспорт" />
      <div className="space-y-6">
        <ComponentCard title="Данные реестра транспортных средств">
          <BasicTableOne2 />
        </ComponentCard>
      </div>
    </div>
  );
}
