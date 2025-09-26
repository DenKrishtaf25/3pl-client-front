import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Faq from "@/components/tables/Faq";
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
      <PageBreadcrumb pageTitle="Часто задаваемые вопросы" />
      <div className="space-y-6">
        <ComponentCard title="">
          <Faq />
        </ComponentCard>
      </div>
    </div>
  );
}
