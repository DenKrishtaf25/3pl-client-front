import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne3 from "@/components/tables/BasicTableOne3";
import BasicTableOne4 from "@/components/tables/BasicTableOne4";
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
      <PageBreadcrumb pageTitle="Финансовые притенции" />
      <div className="space-y-6">
        <ComponentCard title="Статусы финансовых претензий">
          <BasicTableOne3 />
        </ComponentCard>
        <ComponentCard title="Все притензии">
          <BasicTableOne4 />
        </ComponentCard>
      </div>
    </div>
  );
}
