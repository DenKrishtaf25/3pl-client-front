"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne1 from "@/components/tables/BasicTableOne1";
import { Download } from "lucide-react";

export default function StockPageClient() {
  const [exportFn, setExportFn] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleExportReady = (fn: () => void) => {
    setExportFn(() => fn);
    setIsLoading(false);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Товарный запас" />
      <div className="space-y-6">
        <ComponentCard 
          title="Данные остатков"
          action={
            <button
              onClick={() => exportFn?.()}
              disabled={!exportFn || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              title="Экспорт в Excel"
            >
              <Download className="w-4 h-4" />
              Экспорт
            </button>
          }
        >
          <BasicTableOne1 onExportReady={handleExportReady} />
        </ComponentCard>
      </div>
    </div>
  );
}

