"use client";

import React, { useState, useEffect } from "react";
import { Step1RawMaterial } from "./Step1_RawMaterial";
import { Step2SupplierAssociation } from "./Step2_SupplierAssociation";
import { Step3Review } from "./Step3_Review";
import { toast } from "@/components/ui/use-toast";
import type { RawMaterial } from "@/types/types";
import { Supplier } from "@/types/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ClipboardList } from "lucide-react";

interface DataCollectionStepsProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  addRawMaterial: (material: Omit<RawMaterial, "id">) => Promise<RawMaterial>;
  updateRawMaterial: (
    id: string,
    material: Partial<RawMaterial>
  ) => Promise<RawMaterial>;
  loadingRawMaterials: boolean;
  loadingSuppliers: boolean;
  addSupplier: (supplier: Omit<Supplier, "id">) => Promise<Supplier>;
  onSwitchToVisualization: () => void;
}

export function DataCollectionSteps({
  currentStep,
  setCurrentStep,
  rawMaterials,
  suppliers,
  addRawMaterial,
  updateRawMaterial,
  loadingRawMaterials,
  loadingSuppliers,
  addSupplier,
  onSwitchToVisualization,
}: DataCollectionStepsProps) {
  const [materialName, setMaterialName] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materialUnit, setMaterialUnit] = useState("kg");
  const [currentMaterial, setCurrentMaterial] = useState<RawMaterial | null>(
    null
  );
  const [isAddingNewMaterial, setIsAddingNewMaterial] = useState(true);
  const [selectedExistingMaterialId, setSelectedExistingMaterialId] =
    useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // NEW SUPPLIER STATE VARIABLES
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierAddress, setNewSupplierAddress] = useState("");
  const [newSupplierTransportModes, setNewSupplierTransportModes] = useState<
    string[]
  >([]);
  const [newSupplierTransportation, setNewSupplierTransportation] =
    useState("");
  const [newSupplierCapacity, setNewSupplierCapacity] = useState("");
  const [newSupplierCapacityUnit, setNewSupplierCapacityUnit] =
    useState("units/month");
  const [newSupplierCertifications, setNewSupplierCertifications] =
    useState("");
  const [newSupplierCertificationsList, setNewSupplierCertificationsList] =
    useState<string[]>([]);
  const [newSupplierPerformance, setNewSupplierPerformance] = useState("");

  // Add state for selected suppliers
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);

  const [supplierTab, setSupplierTab] = useState("new");

  const [supplierCoordinates, setSupplierCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleSupplierTabChange = (tab: string) => {
    setSupplierTab(tab);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isAddingNewMaterial) {
      if (!materialName.trim()) newErrors.name = "Material name is required";
      if (!materialType.trim()) newErrors.type = "Material type is required";
      if (!materialQuantity.trim()) newErrors.quantity = "Quantity is required";
      if (!materialUnit.trim()) newErrors.unit = "Unit is required";
    } else {
      if (!selectedExistingMaterialId) {
        newErrors.existingMaterial = "Please select a raw material";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitRawMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (isAddingNewMaterial) {
        const newMaterial = {
          name: materialName.trim(),
          type: materialType.trim(),
          description: materialDescription.trim(),
          quantity: Number(materialQuantity),
          unit: materialUnit.trim(),
          suppliers: [],
          quality: { score: 0, defectRate: 0, consistencyScore: 0 },
          environmentalData: {
            carbonFootprint: 0,
            waterUsage: 0,
            landUse: 0,
            biodiversityImpact: "",
          },
          economicData: {
            unitCost: 0,
            transportationCost: 0,
            storageCost: 0,
            totalCostPerUnit: 0,
          },
        };
        const addedMaterial = await addRawMaterial(newMaterial);
        setCurrentMaterial(addedMaterial);
      } else {
        // Handle selecting an existing material
        const selectedMaterial = rawMaterials.find(
          (material) => material.id === selectedExistingMaterialId
        );
        if (!selectedMaterial) {
          throw new Error("Selected material not found");
        }
        setCurrentMaterial(selectedMaterial);

        // If the material already has suppliers, pre-select them
        if (
          selectedMaterial.suppliers &&
          selectedMaterial.suppliers.length > 0
        ) {
          setSelectedSupplierIds(selectedMaterial.suppliers);
        }
      }
      setSubmitSuccess(true);
      toast({
        title: "Success",
        description: isAddingNewMaterial
          ? `${materialName} has been added successfully.`
          : "Material has been selected successfully.",
      });

      // Move to the next step immediately for existing materials
      setTimeout(() => {
        setSubmitSuccess(false);
        setCurrentStep(2);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: isAddingNewMaterial
          ? "Failed to add material"
          : "Failed to select material",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) {
      toast({
        title: "Error",
        description: "Supplier name is required",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Create new supplier data
      const supplierData = {
        name: newSupplierName.trim(),
        location: {
          address: newSupplierAddress.trim(),
          coordinates: supplierCoordinates || { lat: 0, lng: 0 },
        },
        materials: currentMaterial ? [currentMaterial.id] : [],
        certifications: newSupplierCertificationsList,
        transportMode: newSupplierTransportModes.join(", "),
        distance: null,
        transportationDetails: newSupplierTransportation,
        productionCapacity: `${newSupplierCapacity} ${newSupplierCapacityUnit}`,
        performanceHistory: newSupplierPerformance,
        environmentalImpact: null,
        riskScore: 0.3,
        quality: {
          score: 85,
          certifications: newSupplierCertificationsList,
          lastAudit: new Date().toISOString(),
        },
        contactInfo: {
          name: "",
          email: "",
          phone: "",
        },
        economicData: {
          foundedYear: new Date().getFullYear(),
          annualRevenue: 0,
          employeeCount: 0,
        },
        environmentalData: {
          carbonFootprint: 0,
          wasteManagement: "",
          energyEfficiency: "",
        },
      };

      // Call the addSupplier function from props
      const addedSupplier = await addSupplier(supplierData);

      // Add the new supplier ID to the selected suppliers
      setSelectedSupplierIds((prev) => [...prev, addedSupplier.id]);

      // Clear form
      setNewSupplierName("");
      setNewSupplierAddress("");
      setNewSupplierTransportModes([]);
      setNewSupplierCapacity("");
      setNewSupplierCertificationsList([]);
      setSupplierCoordinates(null);

      toast({
        title: "Success",
        description: "Supplier added successfully",
      });

      setSupplierTab("existing"); // Switch to existing tab

      // Move to next step
      await handleAssociateSuppliers();
    } catch (error) {
      console.error("Error in handleAddSupplier:", error);
      toast({
        title: "Error",
        description: "Failed to add supplier. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssociateSuppliers = async () => {
    if (selectedSupplierIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one supplier",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!currentMaterial?.id) {
        throw new Error("No material selected");
      }

      // Update the material with associated suppliers using the hook function
      const updatedMaterial = await updateRawMaterial(currentMaterial.id, {
        suppliers: selectedSupplierIds,
      });

      setCurrentMaterial(updatedMaterial);

      toast({
        title: "Success",
        description: "Suppliers associated successfully",
      });

      // Move to review step
      setCurrentStep(3);
    } catch (error) {
      console.error("Error associating suppliers:", error);
      toast({
        title: "Error",
        description: "Failed to associate suppliers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupplierSelect = (ids: string[]) => {
    console.log("Setting supplier IDs:", ids);
    // Ensure we're working with the correct ID format
    const cleanedIds = ids.map((id) => id.trim());
    setSelectedSupplierIds(cleanedIds);
  };

  // Reset supplier selection when changing material
  useEffect(() => {
    if (currentStep === 2 && currentMaterial) {
      console.log("Current material changed:", currentMaterial);

      // If the material already has suppliers, pre-select them
      if (currentMaterial.suppliers && currentMaterial.suppliers.length > 0) {
        console.log("Pre-selecting suppliers:", currentMaterial.suppliers);
        setSelectedSupplierIds(currentMaterial.suppliers);
      } else {
        console.log("No suppliers to pre-select, resetting selection");
        setSelectedSupplierIds([]);
      }
    }
  }, [currentMaterial, currentStep]);

  // Handle coordinates update from Step2SupplierAssociation
  const handleCoordinatesUpdate = (
    coords: { lat: number; lng: number } | null
  ) => {
    setSupplierCoordinates(coords);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1RawMaterial
            materialName={materialName}
            materialType={materialType}
            materialDescription={materialDescription}
            isAddingNewMaterial={isAddingNewMaterial}
            selectedExistingMaterialId={selectedExistingMaterialId}
            submitSuccess={submitSuccess}
            isSubmitting={isSubmitting}
            errors={errors}
            rawMaterials={rawMaterials}
            loadingRawMaterials={loadingRawMaterials}
            onMaterialNameChange={setMaterialName}
            onMaterialTypeChange={setMaterialType}
            onMaterialDescriptionChange={setMaterialDescription}
            onAddingNewMaterialChange={setIsAddingNewMaterial}
            onExistingMaterialSelect={setSelectedExistingMaterialId}
            onReset={() => setCurrentStep(1)}
            onSubmit={handleSubmitRawMaterial}
          />
        );
      case 2:
        return (
          <Step2SupplierAssociation
            currentMaterial={currentMaterial}
            isAddingNewSupplier={supplierTab === "new"}
            newSupplierName={newSupplierName}
            newSupplierAddress={newSupplierAddress}
            newSupplierTransportModes={newSupplierTransportModes}
            newSupplierTransportation={newSupplierTransportation}
            newSupplierCapacity={newSupplierCapacity}
            newSupplierCapacityUnit={newSupplierCapacityUnit}
            newSupplierCertifications={newSupplierCertifications}
            newSupplierCertificationsList={newSupplierCertificationsList}
            newSupplierPerformance={newSupplierPerformance}
            selectedExistingSupplierIds={selectedSupplierIds}
            isSubmitting={isSubmitting}
            isGeocodingAddress={false}
            suppliers={suppliers}
            loadingSuppliers={loadingSuppliers}
            onBack={() => setCurrentStep(1)}
            onGeocodeAddress={() => {}}
            onSelectedSuppliersChange={handleSupplierSelect}
            onNewSupplierPerformanceChange={setNewSupplierPerformance}
            onNewSupplierCertificationsListChange={
              setNewSupplierCertificationsList
            }
            onNewSupplierCertificationsChange={setNewSupplierCertifications}
            onNewSupplierCapacityUnitChange={setNewSupplierCapacityUnit}
            onNewSupplierCapacityChange={setNewSupplierCapacity}
            onNewSupplierTransportationChange={setNewSupplierTransportation}
            onNewSupplierTransportModesChange={setNewSupplierTransportModes}
            onNewSupplierAddressChange={setNewSupplierAddress}
            onNewSupplierNameChange={setNewSupplierName}
            onAssociateSuppliers={handleAssociateSuppliers}
            onAddSupplier={handleAddSupplier}
            onTabChange={handleSupplierTabChange}
            onCoordinatesUpdate={handleCoordinatesUpdate}
            defaultTab={
              selectedSupplierIds.length > 0 ? "existing" : supplierTab
            }
          />
        );
      case 3:
        return (
          <Step3Review
            rawMaterials={rawMaterials}
            suppliers={suppliers}
            currentMaterial={currentMaterial}
            selectedSupplierIds={selectedSupplierIds}
            onSwitchToSummary={onSwitchToVisualization}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Data Collection & Mapping
          </h1>
          <p className="text-muted-foreground">
            Complete each step to build your supply chain database
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">{renderStep()}</div>

        <div className="md:col-span-1">
          <div className="sticky top-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>
                  Complete all steps to build your supply chain database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                        currentStep >= 1
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      1
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          currentStep === 1 ? "text-primary" : ""
                        }`}
                      >
                        Raw Materials
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Add or select raw materials
                      </p>
                    </div>
                    {currentStep > 1 && (
                      <div className="text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                        currentStep >= 2
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      2
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          currentStep === 2 ? "text-primary" : ""
                        }`}
                      >
                        Supplier Association
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Link suppliers to materials
                      </p>
                    </div>
                    {currentStep > 2 && (
                      <div className="text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                        currentStep >= 3
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      3
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          currentStep === 3 ? "text-primary" : ""
                        }`}
                      >
                        Review
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confirm all information
                      </p>
                    </div>
                    {currentStep > 3 && (
                      <div className="text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={onSwitchToVisualization}
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    View Data Entry Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
