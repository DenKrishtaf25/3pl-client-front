import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ResponsiveImage from "@/components/ui/images/ResponsiveImage";
import ResponsiveImage2 from "@/components/ui/images/ResponsiveImage2";
import type { Metadata } from "next";
// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
// import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";

export const metadata: Metadata = {
  title: "ПЭК:3PL",
  description: "ПЭК:3PL Личный кабинет клиента",
};

export default function Ecommerce() {
  return (
    <>
      <PageBreadcrumb pageTitle="Новости" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Автострада">
          <ResponsiveImage />
        </ComponentCard>
        <ComponentCard title="Стиль и текстиль">
          <ResponsiveImage2 />
        </ComponentCard>
      </div>
      {/*<div className="col-span-12 space-y-6 xl:col-span-7">*/}
      {/*  <EcommerceMetrics />*/}

      {/*  <MonthlySalesChart />*/}
      {/*</div>*/}

      {/*<div className="col-span-12 xl:col-span-5">*/}
      {/*  <MonthlyTarget />*/}
      {/*</div>*/}

      {/*<div className="col-span-12">*/}
      {/*  <StatisticsChart />*/}
      {/*</div>*/}

      {/*<div className="col-span-12 xl:col-span-5">*/}
      {/*  <DemographicCard />*/}
      {/*</div>*/}

      {/*<div className="col-span-12 xl:col-span-7">*/}
      {/*  <RecentOrders />*/}
      {/*</div>*/}
    </>
  );
}
