"use client";

import React, { useState, useEffect } from "react";
import {
  Filter,
  PlusCircle,
  Download,
  Database,
  CheckCircle2,
  Save,
  ArrowRight,
  X,
  Plus,
  Trash2,
  Check,
  MapPin,
  Truck,
  Factory,
  Award,
  TrendingUp,
  BarChart,
  RefreshCw,
  BarChart4,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDataCollection } from "@/hooks/useDataCollection";
import type { RawMaterial } from "@/lib/data-collection-utils";
import type { SupplierMaterialPricing } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { SupplyChainMap } from "./SupplyChainMap";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PricingTable } from "@/components/supplier-pricing/PricingTable";
import { PricingForm } from "@/components/supplier-pricing/PricingForm";
import { cn } from "@/lib/utils";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { Step1RawMaterial } from "@/components/data-collection/Step1RawMaterial";
import { Step2SupplierAssociation } from "@/components/data-collection/Step2SupplierAssociation";
import { Step3EconomicMetrics } from "@/components/data-collection/Step3EconomicMetrics";
import { Step4MaterialPricing } from "@/components/data-collection/Step4MaterialPricing";
import { Step5Review } from "@/components/data-collection/Step5Review";

interface Supplier {
  id: string;
  name: string;
  address?: string;
  location?: {
    address?: string;
  };
}

export function DataCollectionNew() {
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Raw material form state
  const [materialName, setMaterialName] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState("");
  const [materialUnit, setMaterialUnit] = useState("kg");
  const [currentMaterial, setCurrentMaterial] = useState<RawMaterial | null>(
    null
  );

  // New state for raw material selection
  const [isAddingNewMaterial, setIsAddingNewMaterial] = useState(true);
  const [selectedExistingMaterialId, setSelectedExistingMaterialId] =
    useState("");

  // Supplier form state
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierAddress, setNewSupplierAddress] = useState("");
  const [newSupplierCoordinates, setNewSupplierCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>({ lat: 0, lng: 0 }); // Initialize with default coordinates
  const [newSupplierTransportation, setNewSupplierTransportation] =
    useState("");
  const [newSupplierTransportModes, setNewSupplierTransportModes] = useState<
    string[]
  >([]);
  const [newSupplierCapacity, setNewSupplierCapacity] = useState("");
  const [newSupplierCapacityUnit, setNewSupplierCapacityUnit] =
    useState("units/month");
  const [newSupplierCertifications, setNewSupplierCertifications] =
    useState("");
  const [newSupplierCertificationsList, setNewSupplierCertificationsList] =
    useState<string[]>([]);
  const [newSupplierPerformance, setNewSupplierPerformance] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  // New state for supplier selection
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState(false);
  const [selectedExistingSupplierIds, setSelectedExistingSupplierIds] =
    useState<string[]>([]);

  // Form state for economic metrics
  const [taxRate, setTaxRate] = useState("");
  const [tariffRate, setTariffRate] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState("");
  const [discountThresholdType, setDiscountThresholdType] = useState<
    "quantity" | "value"
  >("quantity");
  const [discountThreshold, setDiscountThreshold] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [transportationCost, setTransportationCost] = useState("");
  const [storageCost, setStorageCost] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("net-30");
  const [currency, setCurrency] = useState("USD");

  // Add new state for pricing management
  const [isAddingPricing, setIsAddingPricing] = useState(false);
  const [editingPricing, setEditingPricing] =
    useState<SupplierMaterialPricing | null>(null);

  // Get data from the hook
  const {
    rawMaterials,
    suppliers,
    warehouses,
    supplierPricing = [], // Ensure supplierPricing is initialized as an empty array
    fetchRawMaterials,
    fetchSuppliers,
    fetchWarehouses,
    addRawMaterial,
    updateRawMaterial,
    addSupplier,
    updateWarehouse,
    associateSuppliersWithMaterial,
    addSupplierPricing,
    updateSupplierPricing,
    deleteSupplierPricing,
    fetchSupplierPricing,
    loadingRawMaterials = false,
    loadingSuppliers = false,
    loadingWarehouses = false,
  } = useDataCollection();

  // Add local state for suppliers
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    // Fetch all data on component mount
    fetchRawMaterials();
    fetchSuppliers();
    fetchWarehouses();

    // Log the fetched suppliers for debugging
    console.log("Fetching suppliers on mount");
  }, [fetchSuppliers, fetchRawMaterials, fetchWarehouses]);

  // Add an effect to log suppliers when they change
  useEffect(() => {
    console.log("Suppliers updated:", suppliers);
  }, [suppliers]);

  // Track current step changes
  useEffect(() => {
    console.log("Current step changed to:", currentStep);
  }, [currentStep]);

  // Modify the useEffect for supplier fetching
  useEffect(() => {
    if (currentStep === 2) {
      console.log("Entering step 2 (Supplier Association), fetching suppliers");

      const fetchSuppliersForStep = async () => {
        try {
          // Fetch suppliers from the API
          const response = await fetch("/api/data-collection/suppliers");
          if (!response.ok) throw new Error("Failed to fetch suppliers");

          const data = await response.json();
          console.log("Fetched suppliers:", data);

          // Update both local and hook state
          if (data && Array.isArray(data) && data.length > 0) {
            setLocalSuppliers(data);
            await fetchSuppliers();
          }
        } catch (error) {
          console.error("Error fetching suppliers:", error);
          toast({
            title: "Error",
            description: "Failed to load suppliers",
            variant: "destructive",
          });
        }
      };

      fetchSuppliersForStep();
    }
  }, [currentStep, fetchSuppliers]);

  // Use localSuppliers or suppliers from hook, whichever has data
  const effectiveSuppliers = suppliers?.length > 0 ? suppliers : localSuppliers;

  // Add an effect to log when suppliers change
  useEffect(() => {
    if (suppliers && suppliers.length > 0) {
      console.log(
        `Suppliers state updated: ${suppliers.length} suppliers available`
      );
      console.log("First supplier example:", suppliers[0]);
    }
  }, [suppliers]);

  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isAddingNewMaterial) {
      if (!materialName.trim()) {
        newErrors.name = "Material name is required";
      }
      if (!materialType.trim()) {
        newErrors.type = "Material type is required";
      }
      if (
        !materialQuantity ||
        isNaN(Number(materialQuantity)) ||
        Number(materialQuantity) <= 0
      ) {
        newErrors.quantity = "Please enter a valid quantity";
      }
      if (!materialUnit.trim()) {
        newErrors.unit = "Unit is required";
      }
    } else {
      if (!selectedExistingMaterialId) {
        newErrors.existingMaterial = "Please select a raw material";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission for raw material
  const handleSubmitRawMaterial = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isAddingNewMaterial) {
        // Create new raw material object
        const newMaterial: Omit<RawMaterial, "id"> = {
          name: materialName.trim(),
          type: materialType.trim(),
          description: materialDescription.trim(),
          suppliers: [], // Will be filled in supplier details step
          quantity: Number(materialQuantity),
          unit: materialUnit.trim(),
          quality: {
            score: 0,
            defectRate: 0,
            consistencyScore: 0,
          },
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

        // Add the raw material
        const addedMaterial = await addRawMaterial(newMaterial);
        setCurrentMaterial(addedMaterial);

        // Reset form
        setMaterialName("");
        setMaterialType("");
        setMaterialDescription("");
        setMaterialQuantity("");
        setMaterialUnit("kg");

        // Show success message
        setSubmitSuccess(true);
        toast({
          title: "Success",
          description: `${materialName} has been added successfully.`,
        });

        // Move to next step after short delay
        setTimeout(() => {
          setSubmitSuccess(false);
          setCurrentStep(2);
        }, 1000);
      } else {
        // Using existing material
        const selectedMaterial = rawMaterials.find(
          (material) => material.id === selectedExistingMaterialId
        );

        if (!selectedMaterial) {
          throw new Error("Selected material not found");
        }

        // Set as current material
        setCurrentMaterial(selectedMaterial);

        // Reset selection
        setSelectedExistingMaterialId("");

        // Show success message
        setSubmitSuccess(true);
        toast({
          title: "Success",
          description: `${selectedMaterial.name} has been selected successfully.`,
        });

        // Move to next step after short delay
        setTimeout(() => {
          setSubmitSuccess(false);
          setCurrentStep(2);
        }, 1000);
      }
    } catch (error) {
      console.error("Error handling raw material:", error);
      toast({
        title: "Error",
        description: isAddingNewMaterial
          ? "Failed to add raw material. Please try again."
          : "Failed to select raw material. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle supplier selection
  const toggleSupplierSelection = (supplierId: string) => {
    if (selectedExistingSupplierIds.includes(supplierId)) {
      setSelectedExistingSupplierIds(
        selectedExistingSupplierIds.filter((id) => id !== supplierId)
      );
    } else {
      setSelectedExistingSupplierIds([
        ...selectedExistingSupplierIds,
        supplierId,
      ]);
    }
  };

  // Ensure the current material is updated in state with the latest data
  const refreshCurrentMaterial = async () => {
    if (!currentMaterial) return;

    try {
      const response = await fetch(
        `/api/data-collection/materials?id=${currentMaterial.id}`
      );
      if (response.ok) {
        const materials = await response.json();
        if (materials && materials.length > 0) {
          console.log("Refreshed current material:", materials[0]);
          setCurrentMaterial(materials[0]);
          return materials[0];
        }
      }
    } catch (error) {
      console.error("Error refreshing current material:", error);
    }
    return currentMaterial;
  };

  // Handle supplier association completion
  const handleSupplierAssociationComplete = async () => {
    if (!currentMaterial) {
      toast({
        title: "Error",
        description: "No raw material selected.",
        variant: "destructive",
      });
      return;
    }

    // If we're adding a new supplier, use handleAddSupplier instead
    if (isAddingNewSupplier) {
      console.log(
        "Calling handleAddSupplier from handleSupplierAssociationComplete"
      );
      await handleAddSupplier();
      return;
    }

    if (selectedExistingSupplierIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one supplier.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Log the data being sent for update
      console.log("Attempting to update material with data:", {
        materialId: currentMaterial.id,
        currentSuppliers: currentMaterial.suppliers || [],
        newSuppliers: selectedExistingSupplierIds,
        materialDetails: currentMaterial,
      });

      // Use the direct API endpoint for association - this is more reliable
      let associationSuccess = false;
      try {
        console.log("Attempting direct API association");
        const response = await fetch(
          "/api/data-collection/materials/associate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              materialId: currentMaterial.id,
              supplierIds: selectedExistingSupplierIds,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Association API error:", {
            status: response.status,
            statusText: response.statusText,
            errorText,
          });
          throw new Error(`Association failed: ${response.statusText}`);
        }

        const associationResult = await response.json();
        console.log(
          "Suppliers associated successfully via API:",
          associationResult
        );
        associationSuccess = true;
      } catch (associationError) {
        console.error("Error in supplier association API:", associationError);
        // Continue to try the direct update method
      }

      // If API association failed, try direct material update
      if (!associationSuccess) {
        try {
          console.log("Attempting direct material update");
          // Create a clean update payload without the id
          const updatePayload = {
            ...currentMaterial,
            suppliers: selectedExistingSupplierIds,
          };
          // Remove id from payload to avoid conflicts
          delete (updatePayload as { id?: string })[`id`];

          // Explicitly log what we're sending
          console.log("Sending update payload:", {
            materialId: currentMaterial.id,
            updatePayload,
          });

          const updatedMaterial = await updateRawMaterial(
            currentMaterial.id,
            updatePayload
          );
          console.log("Updated material response:", updatedMaterial);

          if (!updatedMaterial) {
            throw new Error("Failed to update material");
          }
        } catch (updateError) {
          console.error("Error in updateRawMaterial:", updateError);
          throw new Error(
            `Failed to update material: ${
              updateError instanceof Error
                ? updateError.message
                : "Unknown error"
            }`
          );
        }
      }

      // Update warehouse connections if needed
      if (warehouses && warehouses.length > 0) {
        const warehouse = warehouses[0];
        try {
          // Make sure warehouse has materials and suppliers arrays
          const warehouseMaterials = warehouse.materials || [];
          const warehouseSuppliers = warehouse.suppliers || [];

          // Update warehouse materials
          const updatedMaterials = new Set([
            ...warehouseMaterials,
            currentMaterial.id,
          ]);

          // Update warehouse suppliers
          const updatedSuppliers = new Set([
            ...warehouseSuppliers,
            ...selectedExistingSupplierIds,
          ]);

          // Only update if there are changes
          if (
            updatedMaterials.size !== warehouseMaterials.length ||
            updatedSuppliers.size !== warehouseSuppliers.length
          ) {
            await updateWarehouse(warehouse.id, {
              materials: Array.from(updatedMaterials),
              suppliers: Array.from(updatedSuppliers),
            });
          }

          // Refresh warehouses data
          await fetchWarehouses();
        } catch (warehouseError) {
          console.error(
            "Error updating warehouse connections:",
            warehouseError
          );
          // Continue despite warehouse update errors
        }
      }

      // Refresh the materials list to get the updated material with suppliers
      await fetchRawMaterials();

      // Ensure the current material is updated in state with the latest data
      await refreshCurrentMaterial();

      // Show success message
      toast({
        title: "Success",
        description: "Suppliers associated with material successfully.",
      });

      console.log("Moving to step 3 (economic metrics)");
      // Move to the economic metrics step (step 3)
      setCurrentStep(3);
    } catch (error) {
      console.error("Error in handleSupplierAssociationComplete:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to associate suppliers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate economic metrics
  const validateEconomicMetrics = () => {
    const newErrors: Record<string, string> = {};

    if (taxRate && isNaN(Number(taxRate))) {
      newErrors.taxRate = "Tax rate must be a number";
    }

    if (tariffRate && isNaN(Number(tariffRate))) {
      newErrors.tariffRate = "Tariff rate must be a number";
    }

    if (unitCost && isNaN(Number(unitCost))) {
      newErrors.unitCost = "Unit cost must be a number";
    }

    if (transportationCost && isNaN(Number(transportationCost))) {
      newErrors.transportationCost = "Transportation cost must be a number";
    }

    if (storageCost && isNaN(Number(storageCost))) {
      newErrors.storageCost = "Storage cost must be a number";
    }

    if (leadTime && isNaN(Number(leadTime))) {
      newErrors.leadTime = "Lead time must be a number";
    }

    if (discountValue && isNaN(Number(discountValue))) {
      newErrors.discountValue = "Discount value must be a number";
    }

    if (
      discountType === "percentage" &&
      discountValue &&
      (Number(discountValue) < 0 || Number(discountValue) > 100)
    ) {
      newErrors.discountValue = "Percentage discount must be between 0 and 100";
    }

    if (discountThreshold && isNaN(Number(discountThreshold))) {
      newErrors.discountThreshold = "Threshold must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Complete the current data collection process
  const completeDataCollection = async () => {
    if (!currentMaterial) {
      toast({
        title: "Error",
        description: "No raw material selected to update economic metrics.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEconomicMetrics()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total cost per unit
      const unitCostNum = unitCost ? Number(unitCost) : 0;
      const transportationCostNum = transportationCost
        ? Number(transportationCost)
        : 0;
      const storageCostNum = storageCost ? Number(storageCost) : 0;
      const totalCostPerUnit =
        unitCostNum + transportationCostNum + storageCostNum;

      // Create economic data object
      const economicData = {
        unitCost: unitCostNum,
        transportationCost: transportationCostNum,
        storageCost: storageCostNum,
        totalCostPerUnit: totalCostPerUnit,
        taxRate: taxRate ? Number(taxRate) : 0,
        tariffRate: tariffRate ? Number(tariffRate) : 0,
        leadTime: leadTime ? Number(leadTime) : 0,
        paymentTerms: paymentTerms,
        currency: currency,
        discount: {
          type: discountType,
          value: discountValue ? Number(discountValue) : 0,
          thresholdType: discountThresholdType,
          threshold: discountThreshold ? Number(discountThreshold) : 0,
        },
      };

      console.log("Saving economic data:", economicData);

      // First, ensure the material has the correct supplier associations
      // Get the latest material data to ensure we have the most up-to-date supplier list
      let materialToUpdate = { ...currentMaterial };

      try {
        const latestMaterialResponse = await fetch(
          `/api/data-collection/materials?id=${currentMaterial.id}`
        );
        if (latestMaterialResponse.ok) {
          const latestMaterials = await latestMaterialResponse.json();
          if (latestMaterials && latestMaterials.length > 0) {
            materialToUpdate = latestMaterials[0];
            console.log("Retrieved latest material data:", materialToUpdate);
          }
        }
      } catch (fetchError) {
        console.error("Error fetching latest material data:", fetchError);
        // Continue with current material data if fetch fails
      }

      // Ensure suppliers are properly associated
      if (
        selectedExistingSupplierIds.length > 0 &&
        (!materialToUpdate.suppliers || materialToUpdate.suppliers.length === 0)
      ) {
        console.log(
          "Material is missing supplier associations, attempting to fix..."
        );

        try {
          // Try to associate suppliers using the dedicated endpoint
          const associateResponse = await fetch(
            "/api/data-collection/materials/associate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                materialId: materialToUpdate.id,
                supplierIds: selectedExistingSupplierIds,
              }),
            }
          );

          if (associateResponse.ok) {
            const result = await associateResponse.json();
            console.log("Successfully associated suppliers:", result);
            if (result.material) {
              materialToUpdate = result.material;
            }
          } else {
            console.warn(
              "Association API failed, suppliers may not be properly linked"
            );
          }
        } catch (associationError) {
          console.error("Error associating suppliers:", associationError);
        }
      }

      // Update the raw material with economic metrics only
      // Avoid sending the entire material object to prevent validation errors
      try {
        console.log("Updating material with economic data only");
        const economicUpdateResponse = await fetch(
          `/api/data-collection/materials?id=${materialToUpdate.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              economicData,
            }),
          }
        );

        if (!economicUpdateResponse.ok) {
          const errorText = await economicUpdateResponse.text();
          console.error("Error updating economic data:", {
            status: economicUpdateResponse.status,
            statusText: economicUpdateResponse.statusText,
            errorText,
          });
          throw new Error(
            `Failed to update economic data: ${economicUpdateResponse.statusText}`
          );
        }

        const updatedMaterial = await economicUpdateResponse.json();
        console.log("Material updated with economic data:", updatedMaterial);

        // Set the current material to the updated version
        setCurrentMaterial(updatedMaterial);
      } catch (updateError) {
        console.error("Error updating economic data:", updateError);
        throw updateError;
      }

      // Refresh the materials list to get the updated material
      await fetchRawMaterials();

      // Final refresh of the current material to ensure it has all the latest data
      await refreshCurrentMaterial();

      // Show success message
      toast({
        title: "Success",
        description: "Economic metrics saved successfully.",
      });

      // Move to the completion step
      setCurrentStep(4);
    } catch (error) {
      console.error("Error saving economic metrics:", error);
      toast({
        title: "Error",
        description: "Failed to save economic metrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    // Reset raw material form
    setMaterialName("");
    setMaterialType("");
    setMaterialDescription("");
    setMaterialQuantity("");
    setMaterialUnit("kg");
    setCurrentMaterial(null);

    // Reset raw material selection
    setIsAddingNewMaterial(true);
    setSelectedExistingMaterialId("");

    // Reset supplier form
    setNewSupplierName("");
    setNewSupplierAddress("");
    setNewSupplierCoordinates({ lat: 0, lng: 0 });
    setNewSupplierTransportation("");
    setNewSupplierTransportModes([]);
    setNewSupplierCapacity("");
    setNewSupplierCapacityUnit("units/month");
    setNewSupplierCertifications("");
    setNewSupplierCertificationsList([]);
    setNewSupplierPerformance("");
    setSelectedSuppliers([]);

    // Reset supplier selection
    setIsAddingNewSupplier(true);
    setSelectedExistingSupplierIds([]);

    // Reset errors
    setErrors({});

    // Reset steps
    setCurrentStep(1);
    setSubmitSuccess(false);
  };

  // Add a new supplier
  const handleAddSupplier = async () => {
    try {
      console.log("handleAddSupplier called with:", {
        newSupplierName,
        newSupplierAddress,
        newSupplierCoordinates,
        currentMaterial: currentMaterial?.id,
      });

      // Validate supplier data
      if (!newSupplierName) {
        toast({
          title: "Error",
          description: "Supplier name is required.",
          variant: "destructive",
        });
        return;
      }

      if (!newSupplierAddress) {
        toast({
          title: "Error",
          description: "Supplier address is required.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      // Default coordinates if none provided
      const coordinates = newSupplierCoordinates || { lat: 0, lng: 0 };

      // Create a properly formatted supplier object that matches the Prisma schema
      const supplierData = {
        name: newSupplierName,
        address: newSupplierAddress,
        coordinates: coordinates,
        materials: currentMaterial ? [currentMaterial.id] : [],
        certifications: [],
        transportMode: "",
        distance: 0,
        transportationDetails: "",
        productionCapacity: "",
        performanceHistory: "",
        environmentalImpact: "",
        riskScore: "",
        quality: 0,
        contactInfo: {
          name: "",
          email: "",
          phone: "",
        },
        economicData: {
          annualRevenue: 0,
          employeeCount: 0,
          foundedYear: 0,
        },
        environmentalData: {
          carbonFootprint: 0,
          wasteManagement: "",
          energyEfficiency: "",
        },
      };

      console.log("Adding new supplier:", supplierData);

      // Use the API endpoint directly instead of the utility function
      const response = await fetch("/api/data-collection/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to add supplier: ${errorData.error || response.statusText}`
        );
      }

      const { supplier: newSupplier } = await response.json();
      console.log("New supplier added:", newSupplier);

      // Refresh suppliers list
      await fetchSuppliers();

      // If we have a current material, update it to include the new supplier
      if (currentMaterial && newSupplier) {
        // Add the new supplier to the selected suppliers
        const updatedSupplierIds = [
          ...selectedExistingSupplierIds,
          newSupplier.id,
        ];
        setSelectedExistingSupplierIds(updatedSupplierIds);

        try {
          console.log("Associating new supplier with material via API");
          // First try the dedicated association endpoint
          const associateResponse = await fetch(
            "/api/data-collection/materials/associate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                materialId: currentMaterial.id,
                supplierIds: [newSupplier.id],
              }),
            }
          );

          if (!associateResponse.ok) {
            console.warn(
              "Association API failed, falling back to direct update"
            );
            // Fall back to direct update
            await updateRawMaterial(currentMaterial.id, {
              suppliers: updatedSupplierIds,
            });
          } else {
            console.log(
              "Association API succeeded:",
              await associateResponse.json()
            );
          }

          // Refresh materials list to get the updated material with suppliers
          await fetchRawMaterials();

          // Ensure the current material is updated in state
          await refreshCurrentMaterial();
        } catch (materialError) {
          console.error(
            "Error updating material with new supplier:",
            materialError
          );
          // Continue even if this fails - we've already added the supplier
        }
      }

      // Show success message
      toast({
        title: "Success",
        description: "Supplier added successfully. Moving to economic metrics.",
      });

      // Reset form
      setNewSupplierName("");
      setNewSupplierAddress("");
      setNewSupplierCoordinates({ lat: 0, lng: 0 }); // Reset with default coordinates

      // Move to the economic metrics step (step 3)
      setCurrentStep(3);
    } catch (error: unknown) {
      // Use unknown instead of any for better type safety
      console.error("Error adding supplier:", error);
      toast({
        title: "Error",
        description: `Failed to add supplier: ${
          error instanceof Error ? error.message : "Please try again."
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this function to ensure all connections are properly established
  const ensureSupplyChainConnections = async () => {
    if (!warehouses?.length || !suppliers?.length || !rawMaterials?.length) {
      console.log("Missing data for supply chain connections:", {
        warehousesLength: warehouses?.length,
        suppliersLength: suppliers?.length,
        rawMaterialsLength: rawMaterials?.length,
      });
      return;
    }

    const warehouse = warehouses[0];
    const updatedSuppliers = [...warehouse.suppliers];
    const updatedMaterials = [...warehouse.materials];
    let needsUpdate = false;

    // Ensure all suppliers are connected to the warehouse
    for (const supplier of suppliers) {
      if (!updatedSuppliers.includes(supplier.id)) {
        updatedSuppliers.push(supplier.id);
        needsUpdate = true;
      }
    }

    // Ensure all materials are connected to the warehouse
    for (const material of rawMaterials) {
      if (!updatedMaterials.includes(material.id)) {
        updatedMaterials.push(material.id);
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      try {
        await updateWarehouse(warehouse.id, {
          suppliers: updatedSuppliers,
          materials: updatedMaterials,
        });

        // Refresh warehouses data
        await fetchWarehouses();
      } catch (error) {
        console.error("Error updating warehouse connections:", error);
      }
    }
  };

  // Call this function when the component loads and when the visualization tab is selected
  useEffect(() => {
    if (currentStep === 5) {
      ensureSupplyChainConnections();
    }
  }, [currentStep, suppliers, rawMaterials, warehouses]);

  // Add pricing management handlers
  const handleAddPricing = async (
    data: Omit<SupplierMaterialPricing, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!currentMaterial?.id) {
      toast({
        title: "Error",
        description: "No material selected for pricing.",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have the latest material data before adding pricing
    const updatedMaterial = await refreshCurrentMaterial();
    console.log("Current material for pricing:", updatedMaterial);

    try {
      // Ensure materialId is set from currentMaterial
      const pricingData = {
        ...data,
        materialId: currentMaterial.id,
        materialName: updatedMaterial.name,
      };

      // Validate required fields
      if (!pricingData.supplierId) {
        console.error("Missing required fields:", { pricingData });
        throw new Error("Supplier ID is required");
      }

      console.log("Adding new pricing with data:", pricingData);
      const newPricing = await addSupplierPricing(pricingData);
      console.log("Added new pricing:", newPricing);

      // Refresh pricing data
      await fetchSupplierPricing(undefined, currentMaterial.id);

      // Show success message
      toast({
        title: "Success",
        description: "Pricing added successfully.",
      });

      // Close the form
      setIsAddingPricing(false);
    } catch (error) {
      console.error("Error adding pricing:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add pricing. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEditPricing = async (data: Partial<SupplierMaterialPricing>) => {
    if (!editingPricing) return;
    try {
      console.log("Updating supplier pricing:", data);

      // Update the pricing in the database and JSON storage
      const updatedPricing = await updateSupplierPricing(
        editingPricing.id,
        data
      );
      console.log("Pricing updated successfully:", updatedPricing);

      // Update the UI state
      setEditingPricing(null);

      // Show success message
      toast({
        title: "Success",
        description: "Pricing updated successfully",
      });

      // Refresh the pricing data
      if (data.supplierId && data.materialId) {
        await fetchSupplierPricing(data.supplierId, data.materialId);
      } else if (editingPricing.supplierId && editingPricing.materialId) {
        await fetchSupplierPricing(
          editingPricing.supplierId,
          editingPricing.materialId
        );
      }
    } catch (error) {
      console.error("Error updating pricing:", error);
      toast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "destructive",
      });
    }
  };

  const handleDeletePricing = async (id: string) => {
    try {
      console.log("Deleting supplier pricing:", id);

      // Get the pricing details before deletion to know which material to update
      const pricingToDelete = (supplierPricing || []).find((p) => p.id === id);

      // Delete the pricing from the database and JSON storage
      await deleteSupplierPricing(id);
      console.log("Pricing deleted successfully");

      // Show success message
      toast({
        title: "Success",
        description: "Pricing deleted successfully",
      });

      // Refresh the pricing data
      if (pricingToDelete && pricingToDelete.materialId) {
        await fetchSupplierPricing(
          pricingToDelete.supplierId,
          pricingToDelete.materialId
        );

        // Also update the material to remove this pricing reference
        if (
          currentMaterial &&
          currentMaterial.id === pricingToDelete.materialId
        ) {
          // Get the current material's supplier pricing IDs
          const currentPricingIds = (supplierPricing || [])
            .filter((p) => p.materialId === currentMaterial.id)
            .map((p) => p.id);

          // Remove the deleted pricing ID
          const updatedPricingIds = currentPricingIds.filter(
            (pid) => pid !== id
          );

          // Update the material without the deleted pricing reference
          await updateRawMaterial(currentMaterial.id, {
            // Store the pricing IDs in a field that exists in the RawMaterial type
            suppliers: currentMaterial.suppliers || [],
          });

          // Refresh the materials list
          await fetchRawMaterials();
        }
      }
    } catch (error) {
      console.error("Error deleting pricing:", error);
      toast({
        title: "Error",
        description: "Failed to delete pricing",
        variant: "destructive",
      });
    }
  };

  // Add a direct function to handle adding a supplier from the form
  const handleAddSupplierDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleAddSupplierDirectly called");
    await handleAddSupplier();
  };

  // Helper function to safely get supplier address
  const getSupplierAddress = (supplier: Supplier): string => {
    if (supplier.address) {
      return supplier.address;
    } else if (supplier.location && supplier.location.address) {
      return supplier.location.address;
    }
    return "No address";
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1RawMaterial
            materialName={materialName}
            materialType={materialType}
            materialDescription={materialDescription}
            materialQuantity={materialQuantity}
            materialUnit={materialUnit}
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
            onMaterialQuantityChange={setMaterialQuantity}
            onMaterialUnitChange={setMaterialUnit}
            onAddingNewMaterialChange={(value) => setIsAddingNewMaterial(value)}
            onExistingMaterialSelect={setSelectedExistingMaterialId}
            onReset={resetForm}
            onSubmit={handleSubmitRawMaterial}
          />
        );

      case 2:
        return (
          <Step2SupplierAssociation
            currentMaterial={currentMaterial}
            isAddingNewSupplier={isAddingNewSupplier}
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
            onBack={() => setCurrentStep(1)}
            onAddSupplier={handleAddSupplier}
            onAssociateSuppliers={handleSupplierAssociationComplete}
            onNewSupplierNameChange={setNewSupplierName}
            onNewSupplierAddressChange={setNewSupplierAddress}
            onNewSupplierTransportModesChange={setNewSupplierTransportModes}
            onNewSupplierTransportationChange={setNewSupplierTransportation}
            onNewSupplierCapacityChange={setNewSupplierCapacity}
            onNewSupplierCapacityUnitChange={setNewSupplierCapacityUnit}
            onNewSupplierCertificationsChange={setNewSupplierCertifications}
            onNewSupplierCertificationsListChange={
              setNewSupplierCertificationsList
            }
            onNewSupplierPerformanceChange={setNewSupplierPerformance}
            onSelectedSuppliersChange={setSelectedExistingSupplierIds}
            onGeocodeAddress={() => {
              setIsGeocodingAddress(true);
              setTimeout(() => {
                setNewSupplierCoordinates({
                  lat: 40.7128,
                  lng: -74.006,
                });
                setIsGeocodingAddress(false);
                toast({
                  title: "Address Geocoded",
                  description: "Coordinates have been set.",
                });
              }, 1000);
            }}
          />
        );

      case 3:
        return (
          <Step3EconomicMetrics
            currentMaterial={currentMaterial}
            isSubmitting={isSubmitting}
            errors={errors}
            economicData={{
              taxRate,
              tariffRate,
              unitCost,
              transportationCost,
              storageCost,
              leadTime,
              discountType,
              discountValue,
              discountThresholdType,
              discountThreshold,
              paymentTerms,
              currency,
            }}
            onDataChange={(field, value) => {
              switch (field) {
                case "taxRate":
                  setTaxRate(value);
                  break;
                case "tariffRate":
                  setTariffRate(value);
                  break;
                case "unitCost":
                  setUnitCost(value);
                  break;
                case "transportationCost":
                  setTransportationCost(value);
                  break;
                case "storageCost":
                  setStorageCost(value);
                  break;
                case "leadTime":
                  setLeadTime(value);
                  break;
                case "discountValue":
                  setDiscountValue(value);
                  break;
                case "discountThreshold":
                  setDiscountThreshold(value);
                  break;
                default:
                  break;
              }
            }}
            onBack={() => setCurrentStep(2)}
            onComplete={completeDataCollection}
          />
        );

      case 4:
        return (
          <Step4MaterialPricing
            currentMaterial={currentMaterial}
            isAddingPricing={isAddingPricing}
            editingPricing={editingPricing}
            supplierPricing={supplierPricing}
            selectedExistingSupplierIds={selectedExistingSupplierIds}
            onAddPricing={() => setIsAddingPricing(true)}
            onEditPricing={handleEditPricing}
            onDeletePricing={handleDeletePricing}
            onPricingSubmit={handleAddPricing}
            onPricingCancel={() => {
              setIsAddingPricing(false);
              setEditingPricing(null);
            }}
            onBack={() => setCurrentStep(3)}
            onNext={() => setCurrentStep(5)}
          />
        );

      case 5:
        return (
          <Step5Review
            currentMaterial={currentMaterial}
            selectedExistingSupplierIds={selectedExistingSupplierIds}
            onReset={resetForm}
            onComplete={completeDataCollection}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Data Collection & Mapping
        </h1>
        <p className="text-muted-foreground">
          Phase 1: Create a comprehensive inventory of raw materials and map
          your entire supply chain.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
        <Button className="gap-2" onClick={resetForm}>
          <PlusCircle className="h-4 w-4" /> Add Material
        </Button>
      </div>

      <Tabs defaultValue="data-entry" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="data-entry" className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Data Entry
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center">
            <BarChart4 className="h-4 w-4 mr-2" />
            Visualization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data-entry" className="mt-6">
          {renderStepContent()}
        </TabsContent>

        <TabsContent value="visualization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supply Chain Map</CardTitle>
              <CardDescription>
                Visualize your supply chain network including suppliers,
                warehouses, and materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rawMaterials.length === 0 || suppliers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Complete data entry to generate your supply chain map</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Suppliers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {suppliers.length}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Active suppliers in your network
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Raw Materials
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {rawMaterials.length}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Materials being tracked
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Warehouses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {warehouses.length}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Distribution centers in your network
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-4">
                      Warehouse Information
                    </h3>
                    {warehouses.length > 0 ? (
                      <div className="space-y-4">
                        {warehouses.map((warehouse) => (
                          <div
                            key={warehouse.id}
                            className="border rounded-md p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">
                                  {warehouse.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {warehouse.location.address}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  warehouse.type === "distribution"
                                    ? "default"
                                    : warehouse.type === "storage"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {warehouse.type.charAt(0).toUpperCase() +
                                  warehouse.type.slice(1)}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              <div>
                                <p className="text-sm font-medium">Capacity</p>
                                <p className="text-sm">
                                  {warehouse.capacity.currentUtilization} /{" "}
                                  {warehouse.capacity.maxCapacity}{" "}
                                  {warehouse.capacity.unit}
                                </p>
                                <div className="w-full bg-muted rounded-full h-2 mt-1">
                                  <div
                                    className="bg-primary rounded-full h-2"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (warehouse.capacity.currentUtilization /
                                          warehouse.capacity.maxCapacity) *
                                          100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-medium">
                                  Transit Times
                                </p>
                                <p className="text-sm">
                                  Inbound: {warehouse.transitTimes.inbound} days
                                </p>
                                <p className="text-sm">
                                  Outbound: {warehouse.transitTimes.outbound}{" "}
                                  days
                                </p>
                              </div>

                              <div>
                                <p className="text-sm font-medium">
                                  Operational Cost
                                </p>
                                <p className="text-sm">
                                  $
                                  {warehouse.operationalCost?.toLocaleString() ||
                                    "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <p className="text-sm font-medium">
                                Connected Suppliers
                              </p>
                              {warehouse.suppliers.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {warehouse.suppliers.map((supplierId) => {
                                    const supplier = suppliers.find(
                                      (s) => s.id === supplierId
                                    );
                                    return supplier ? (
                                      <Badge key={supplierId} variant="outline">
                                        {supplier.name}
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No suppliers connected yet
                                </p>
                              )}
                            </div>

                            <div className="mt-4">
                              <p className="text-sm font-medium">
                                Stored Materials
                              </p>
                              {warehouse.materials.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {warehouse.materials.map((materialId) => {
                                    const material = rawMaterials.find(
                                      (m) => m.id === materialId
                                    );
                                    return material ? (
                                      <Badge key={materialId} variant="outline">
                                        {material.name}
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No materials stored yet
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No warehouses configured yet</p>
                        <p className="text-sm mt-2">
                          Warehouse data is available in the backend but not
                          displayed in the UI
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-4">
                      Supply Chain Visualization
                    </h3>
                    {rawMaterials.length === 0 || suppliers.length === 0 ? (
                      <div className="bg-muted rounded-md p-8 text-center">
                        <p className="text-muted-foreground">
                          Add suppliers and materials to generate the supply
                          chain map
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          The visualization will show connections between
                          suppliers, warehouses, and materials
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <SupplyChainMap
                          suppliers={suppliers}
                          materials={rawMaterials}
                          warehouses={warehouses}
                        />
                        <div className="p-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={ensureSupplyChainConnections}
                            className="w-full"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Connections
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
