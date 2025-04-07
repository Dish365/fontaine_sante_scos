"use client";

import React, { useState } from "react";
import {
  Filter,
  PlusCircle,
  Download,
  Database,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataCollection } from "@/hooks/useDataCollection";
import { DataCollectionSteps } from "./DataCollectionSteps";
import { DataEntrySummary } from "./DataEntrySummary";
import { Card } from "@/components/ui/card";
import { Step1RawMaterial } from "./Step1_RawMaterial";
import { Step2SupplierAssociation } from "./Step2_SupplierAssociation";
import { Step3Review } from "./Step3_Review";
import { RawMaterial, Supplier } from "@/types/types";
import { testData } from "@/lib/test-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function DataCollectionContainer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [useTestData, setUseTestData] = useState(false);

  // State for Step 1
  const [materialName, setMaterialName] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [isAddingNewMaterial, setIsAddingNewMaterial] = useState(true);
  const [selectedExistingMaterialId, setSelectedExistingMaterialId] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for Step 2
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierAddress, setNewSupplierAddress] = useState("");
  const [newSupplierTransportModes, setNewSupplierTransportModes] = useState<string[]>([]);
  const [newSupplierTransportation, setNewSupplierTransportation] = useState("");
  const [newSupplierCapacity, setNewSupplierCapacity] = useState("");
  const [newSupplierCapacityUnit, setNewSupplierCapacityUnit] = useState("");
  const [newSupplierCertifications, setNewSupplierCertifications] = useState("");
  const [newSupplierCertificationsList, setNewSupplierCertificationsList] = useState<string[]>([]);
  const [newSupplierPerformance, setNewSupplierPerformance] = useState("");
  const [selectedExistingSupplierIds, setSelectedExistingSupplierIds] = useState<string[]>([]);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  // Data state
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<RawMaterial | null>(null);
  const [loadingRawMaterials, setLoadingRawMaterials] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  const {
    addRawMaterial,
    updateRawMaterial,
    addSupplier,
  } = useDataCollection();

  const resetForm = () => {
    setCurrentStep(1);
    setUseTestData(false);
    setMaterialName("");
    setMaterialType("");
    setMaterialDescription("");
    setIsAddingNewMaterial(true);
    setSelectedExistingMaterialId("");
    setNewSupplierName("");
    setNewSupplierAddress("");
    setNewSupplierTransportModes([]);
    setNewSupplierTransportation("");
    setNewSupplierCapacity("");
    setNewSupplierCapacityUnit("");
    setNewSupplierCertifications("");
    setNewSupplierCertificationsList([]);
    setNewSupplierPerformance("");
    setSelectedExistingSupplierIds([]);
    setIsGeocodingAddress(false);
    setRawMaterials([]);
    setSuppliers([]);
    setCurrentMaterial(null);
    setLoadingRawMaterials(false);
    setLoadingSuppliers(false);
    setSubmitSuccess(false);
    setErrors({});
  };

  const switchToSummary = () => {
    setCurrentStep(3);
  };

  // Load test data when useTestData is toggled
  React.useEffect(() => {
    if (useTestData) {
      setRawMaterials(testData.rawMaterials);
      setSuppliers(testData.suppliers);
      setLoadingRawMaterials(false);
      setLoadingSuppliers(false);
      
      // Pre-select the first material and its suppliers for testing
      if (testData.rawMaterials.length > 0) {
        const firstMaterial = testData.rawMaterials[0];
        setCurrentMaterial(firstMaterial);
        setSelectedExistingMaterialId(firstMaterial.id);
        setSelectedExistingSupplierIds(firstMaterial.suppliers);
      }
    } else {
      // Reset to empty state when test data is disabled
      setRawMaterials([]);
      setSuppliers([]);
      setCurrentMaterial(null);
      setSelectedExistingMaterialId("");
      setSelectedExistingSupplierIds([]);
      setMaterialName("");
      setMaterialType("");
      setMaterialDescription("");
      setIsAddingNewMaterial(true);
      setNewSupplierName("");
      setNewSupplierAddress("");
      setNewSupplierTransportModes([]);
      setNewSupplierTransportation("");
      setNewSupplierCapacity("");
      setNewSupplierCapacityUnit("");
      setNewSupplierCertifications("");
      setNewSupplierCertificationsList([]);
      setNewSupplierPerformance("");
    }
  }, [useTestData]);

  // Handle Step 1 form submission
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (isAddingNewMaterial) {
        // Validate new material form
        const newErrors: Record<string, string> = {};
        if (!materialName) newErrors.name = "Name is required";
        if (!materialType) newErrors.type = "Type is required";
        if (!materialDescription) newErrors.description = "Description is required";

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsSubmitting(false);
          return;
        }

        // Create new material
        const newMaterial: RawMaterial = {
          id: Date.now().toString(),
          name: materialName,
          type: materialType,
          description: materialDescription,
          quantity: 0,
          unit: "kg",
          suppliers: [],
          quality: {
            score: 0,
            defectRate: 0,
            consistencyScore: 0,
          },
          environmentalData: {
            carbonFootprint: 0,
            waterUsage: 0,
            landUse: 0,
            biodiversityImpact: "Low",
          },
          economicData: {
            unitCost: 0,
            transportationCost: 0,
            storageCost: 0,
            totalCostPerUnit: 0,
            taxRate: 0.1,
            tariffRate: 0.05,
            leadTime: 0,
            paymentTerms: "Net 30",
            currency: "USD",
          },
        };

        setCurrentMaterial(newMaterial);
        setRawMaterials((prev) => [...prev, newMaterial]);
      } else {
        // Use existing material
        const selectedMaterial = rawMaterials.find((m) => m.id === selectedExistingMaterialId);
        if (selectedMaterial) {
          setCurrentMaterial(selectedMaterial);
          // If using test data, pre-select associated suppliers
          if (useTestData) {
            setSelectedExistingSupplierIds(selectedMaterial.suppliers);
          }
        }
      }

      setSubmitSuccess(true);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error submitting material:", error);
      setErrors({ submit: "Failed to submit material" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 2 form submission
  const handleStep2Submit = async () => {
    setIsSubmitting(true);
    try {
      if (newSupplierName) {
        // Create new supplier
        const newSupplier: Supplier = {
          id: Date.now().toString(),
          name: newSupplierName,
          location: {
            address: newSupplierAddress,
            coordinates: { lat: 0, lng: 0 }, // Will be updated by geocoding
          },
          quality: {
            score: 0,
            certifications: newSupplierCertificationsList,
            lastAudit: new Date().toISOString().split("T")[0],
          },
          environmentalData: {
            carbonFootprint: 0,
            energyEfficiency: "Medium",
            wasteManagement: "Good",
            waterUsage: 0,
            emissions: 0,
          },
          economicData: {
            foundedYear: new Date().getFullYear(),
            annualRevenue: 0,
            employeeCount: 0,
            materialCosts: 0,
            transportationCosts: 0,
            storageCosts: 0,
            totalCost: 0,
            costPerUnit: 0,
          },
          materials: [currentMaterial?.id || ""],
          certifications: newSupplierCertificationsList,
          transportMode: newSupplierTransportModes.join(","),
          distance: 0,
          productionCapacity: `${newSupplierCapacity} ${newSupplierCapacityUnit}`,
          leadTime: 0,
          transportationDetails: newSupplierTransportation,
          contactInfo: {
            name: "",
            email: "",
            phone: "",
          },
          operatingHours: "",
          performanceHistory: newSupplierPerformance,
          riskScore: 0,
        };

        setSuppliers((prev) => [...prev, newSupplier]);
        setSelectedExistingSupplierIds((prev) => [...prev, newSupplier.id]);
      }

      // If using test data, ensure we have the correct supplier associations
      if (useTestData && currentMaterial) {
        const testSuppliers = testData.suppliers.filter(s => 
          currentMaterial.suppliers.includes(s.id)
        );
        setSelectedExistingSupplierIds(testSuppliers.map(s => s.id));
      }

      setCurrentStep(3);
    } catch (error) {
      console.error("Error submitting supplier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Handle geocoding
  const handleGeocodeAddress = async () => {
    setIsGeocodingAddress(true);
    try {
      // Simulate geocoding delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In a real app, this would call the Google Maps API
      setIsGeocodingAddress(false);
    } catch (error) {
      console.error("Error geocoding address:", error);
      setIsGeocodingAddress(false);
    }
  };

  return (
    <Card className="w-full">
      <div className="space-y-6 p-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Data Collection & Mapping
          </h1>
          <p className="text-muted-foreground">
            Phase 1: Create a comprehensive inventory of raw materials and map
            your entire supply chain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useTestData"
                checked={useTestData}
                onCheckedChange={(checked) => setUseTestData(checked as boolean)}
              />
              <Label htmlFor="useTestData">Use Test Data</Label>
            </div>
            <Button className="gap-2" onClick={resetForm}>
              <PlusCircle className="h-4 w-4" /> Add Material
            </Button>
          </div>
        </div>

        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Data Entry
            </TabsTrigger>
            <TabsTrigger value="2" className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Supplier Association
            </TabsTrigger>
            <TabsTrigger value="3" className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Data Entry Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="mt-6">
            <div className="space-y-6">
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
                onReset={() => {
                  setMaterialName("");
                  setMaterialType("");
                  setMaterialDescription("");
                  setIsAddingNewMaterial(true);
                  setSelectedExistingMaterialId("");
                  setErrors({});
                }}
                onSubmit={handleStep1Submit}
              />
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)} disabled={!currentMaterial}>
                  Continue
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="2" className="mt-6">
            <div className="space-y-6">
              <Step2SupplierAssociation
                currentMaterial={currentMaterial}
                isAddingNewSupplier={true}
                newSupplierName={newSupplierName}
                newSupplierAddress={newSupplierAddress}
                newSupplierTransportModes={newSupplierTransportModes}
                newSupplierTransportation={newSupplierTransportation}
                newSupplierCapacity={newSupplierCapacity}
                newSupplierCapacityUnit={newSupplierCapacityUnit}
                newSupplierCertifications={newSupplierCertifications}
                newSupplierCertificationsList={newSupplierCertificationsList}
                newSupplierPerformance={newSupplierPerformance}
                selectedExistingSupplierIds={selectedExistingSupplierIds}
                isSubmitting={isSubmitting}
                isGeocodingAddress={isGeocodingAddress}
                suppliers={suppliers}
                loadingSuppliers={loadingSuppliers}
                onBack={handleBack}
                onAddSupplier={handleStep2Submit}
                onAssociateSuppliers={handleStep2Submit}
                onNewSupplierNameChange={setNewSupplierName}
                onNewSupplierAddressChange={setNewSupplierAddress}
                onNewSupplierTransportModesChange={setNewSupplierTransportModes}
                onNewSupplierTransportationChange={setNewSupplierTransportation}
                onNewSupplierCapacityChange={setNewSupplierCapacity}
                onNewSupplierCapacityUnitChange={setNewSupplierCapacityUnit}
                onNewSupplierCertificationsChange={setNewSupplierCertifications}
                onNewSupplierCertificationsListChange={setNewSupplierCertificationsList}
                onNewSupplierPerformanceChange={setNewSupplierPerformance}
                onSelectedSuppliersChange={setSelectedExistingSupplierIds}
                onGeocodeAddress={handleGeocodeAddress}
                onTabChange={() => {}}
                onCoordinatesUpdate={() => {}}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} disabled={selectedExistingSupplierIds.length === 0}>
                  Continue
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="3" className="mt-6">
            <div className="space-y-6">
              <Step3Review
                rawMaterials={rawMaterials}
                suppliers={suppliers}
                currentMaterial={currentMaterial}
                selectedSupplierIds={selectedExistingSupplierIds}
                onSwitchToSummary={() => {
                  // Handle switching to summary view
                  console.log("Switching to summary view");
                }}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={resetForm}>
                  Complete
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
