import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Контакты (тест) | ПЭК:3PL",
  description: "Тестовая страница контактов ПЭК:3PL",
};

export default function ContactsTestPage() {
  redirect("/admin/contacts-test");
}
