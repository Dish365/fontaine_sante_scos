"use client";

import { DataCollectionContainer } from "@/components/data-collection/DataCollectionContainer";
import { useRouter } from "next/navigation";

export default function DataCollectionPage() {
  const router = useRouter();

  const handleSwitchToVisualization = () => {
    router.push("/dashboard/visualization");
  };

  return (
    <div className="container mx-auto py-6">
      <DataCollectionContainer />
    </div>
  );
}
