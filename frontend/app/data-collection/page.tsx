"use client";

import { useState } from "react";
import { DataCollectionSteps } from "@/components/data-collection/DataCollectionSteps";
import { useDataCollection } from "@/hooks/useDataCollection";
import { useRouter } from "next/navigation";

export default function DataCollectionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const {
    rawMaterials,
    addRawMaterial,
    updateRawMaterial,
    loadingRawMaterials,
    suppliers,
    addSupplier,
    loadingSuppliers,
  } = useDataCollection();

  const handleSwitchToVisualization = () => {
    router.push("/dashboard/visualization");
  };

  return (
    <div className="container mx-auto py-6">
      <DataCollectionSteps
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        rawMaterials={rawMaterials}
        suppliers={suppliers}
        addRawMaterial={addRawMaterial}
        updateRawMaterial={updateRawMaterial}
        loadingRawMaterials={loadingRawMaterials}
        loadingSuppliers={loadingSuppliers}
        addSupplier={addSupplier}
        onSwitchToVisualization={handleSwitchToVisualization}
      />
    </div>
  );
}
