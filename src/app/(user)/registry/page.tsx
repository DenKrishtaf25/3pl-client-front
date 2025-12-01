import RegistryPageClient from "./RegistryPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ПЭК:3PL",
  description:
    "ПЭК:3PL",
  // other metadata
};

export default function RegistryPage() {
  return <RegistryPageClient />;
}

