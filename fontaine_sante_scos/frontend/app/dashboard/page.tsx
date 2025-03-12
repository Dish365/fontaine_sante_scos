import React from "react";
import { DashboardOverview } from "@/components/dashboard-overview";

export const metadata = {
  title: "Dashboard | Fontaine Santé Framework",
  description:
    "Comprehensive view of your supply chain performance metrics and insights.",
};

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardOverview />
    </div>
  );
}
