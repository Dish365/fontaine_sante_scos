import React from "react";
import { DashboardOverview } from "@/components/dashboard-overview";

export const metadata = {
  title: "Dashboard | Fontaine Santé Framework",
  description:
    "Comprehensive view of your supply chain performance metrics and insights.",
};

export default function DashboardPage() {
  return (
    <div className="p-6 h-full">
      <DashboardOverview />
    </div>
  );
}
