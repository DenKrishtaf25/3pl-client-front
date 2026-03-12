import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Warehouse from "@/components/tables/Warehouse";
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
      <PageBreadcrumb pageTitle="Склады" />
      <div className="space-y-6">
        <ComponentCard
          title="10 складов 3PL"
          action={
            <a
              href="https://pecom.ru/map/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Все склады
            </a>
          }
        >
          <Warehouse />
        </ComponentCard>
      </div>
    </div>
  );
}
