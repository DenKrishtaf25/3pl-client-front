import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ContactsTree from "@/components/contacts/ContactsTree";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты (тест) | ПЭК:3PL",
  description: "Тестовая страница контактов ПЭК:3PL",
};

export default function AdminContactsTestPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Контакты (тест)" />
      <div className="space-y-6">
        <ComponentCard title="Контакты">
          <ContactsTree />
        </ComponentCard>
      </div>
    </div>
  );
}
