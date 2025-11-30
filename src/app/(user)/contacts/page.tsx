import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ContactsTree from "@/components/contacts/ContactsTree";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Контакты | ПЭК:3PL",
  description: "Контакты ПЭК:3PL",
};

export default function ContactsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Контакты" />
      <div className="space-y-6">
        <ComponentCard title="Контакты">
          <ContactsTree />
        </ComponentCard>
      </div>
    </div>
  );
}

