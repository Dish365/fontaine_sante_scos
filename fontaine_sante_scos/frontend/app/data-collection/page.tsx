"use client";

import { useState } from "react";
import { DataCollectionSteps } from "@/components/data-collection/DataCollectionSteps";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { useSuppliers } from "@/hooks/useSuppliers";
import type { Supplier } from "@/lib/types";
import suppliersData from "@/data/suppliers.json"; // add this import

export default function DataCollectionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const {
    rawMaterials,
    addRawMaterial,
    updateRawMaterial,
    loading: loadingRawMaterials,
  } = useRawMaterials();
  const { suppliers, loading: loadingSuppliers } = useSuppliers();

  const addSupplier = async (
    supplierData: Omit<Supplier, "id">
  ): Promise<Supplier> => {
    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierData),
      });

      if (!response.ok) {
        throw new Error("Failed to add supplier");
      }

      const newSupplier = await response.json();
      return newSupplier;
    } catch (error) {
      console.error("Error adding supplier:", error);
      throw error;
    }
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
      />
    </div>
  );
}
