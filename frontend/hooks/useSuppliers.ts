import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import suppliersData from "@/data/suppliers.json";
import type { Supplier } from "@/types/types";
import {
  JsonSupplier,
  convertJsonToSupplier,
  convertSupplierToJson,
} from "@/types/json-types";
import { useLoadingState } from "./useLoadingState";
import { toast } from "@/components/ui/use-toast";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { loading, startLoading, stopLoading } = useLoadingState(true);

  // Load suppliers from JSON data
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Load suppliers from JSON data
  const loadSuppliers = async () => {
    startLoading();
    try {
      // Convert JSON format to app format
      const jsonSuppliers = suppliersData as unknown as JsonSupplier[];
      const convertedSuppliers = jsonSuppliers.map(convertJsonToSupplier);
      setSuppliers(convertedSuppliers);
      stopLoading();
    } catch (err) {
      console.error("Error loading suppliers:", err);
      setError("Failed to load suppliers");
      stopLoading();
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive",
      });
    }
  };

  // CREATE: Add a new supplier
  const addSupplier = async (
    supplier: Omit<Supplier, "id">
  ): Promise<Supplier> => {
    startLoading();
    try {
      // Create a new supplier with ID and default values for required fields
      const newSupplier: Supplier = {
        ...supplier,
        id: `supplier-${uuidv4()}`,
        materials: supplier.materials || [],
        location: supplier.location || {
          address: "",
          coordinates: { lat: 0, lng: 0 },
        },
        transportMode: supplier.transportMode || "road",
        productionCapacity: supplier.productionCapacity || "0 units/month",
        certifications: supplier.certifications || [],
        distance: supplier.distance || null,
        transportationDetails: supplier.transportationDetails || "",
        performanceHistory: supplier.performanceHistory || "",
        riskScore:
          typeof supplier.riskScore === "number" ? supplier.riskScore : 0,
        contactInfo: supplier.contactInfo || {
          name: "",
          email: "",
          phone: "",
        },
        economicData: supplier.economicData || {
          foundedYear: 0,
          annualRevenue: 0,
          employeeCount: 0,
        },
        environmentalData: supplier.environmentalData || {
          carbonFootprint: 0,
          wasteManagement: "",
          energyEfficiency: "",
        },
        quality: supplier.quality || {
          score: 0,
          certifications: [],
          lastAudit: new Date().toISOString(),
        },
      };

      // Update state
      setSuppliers((prev) => [...prev, newSupplier]);

      // In a real implementation, we would save to a backend API
      // For now, we're just updating the local state

      toast({
        title: "Success",
        description: `Supplier ${newSupplier.name} added successfully`,
      });

      stopLoading();
      return newSupplier;
    } catch (err) {
      console.error("Error adding supplier:", err);
      stopLoading();
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
      throw new Error("Failed to add supplier");
    }
  };

  // READ: Get a supplier by ID
  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find((supplier) => supplier.id === id);
  };

  // UPDATE: Update an existing supplier
  const updateSupplier = async (
    id: string,
    updates: Partial<Supplier>
  ): Promise<Supplier> => {
    startLoading();
    try {
      // Find supplier to update
      const supplierIndex = suppliers.findIndex((s) => s.id === id);
      if (supplierIndex === -1) {
        throw new Error(`Supplier with id ${id} not found`);
      }

      // Create updated supplier
      const updatedSupplier = {
        ...suppliers[supplierIndex],
        ...updates,
      };

      // Update state
      const updatedSuppliers = [...suppliers];
      updatedSuppliers[supplierIndex] = updatedSupplier;
      setSuppliers(updatedSuppliers);

      toast({
        title: "Success",
        description: `Supplier ${updatedSupplier.name} updated successfully`,
      });

      stopLoading();
      return updatedSupplier;
    } catch (err) {
      console.error("Error updating supplier:", err);
      stopLoading();
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
      throw new Error("Failed to update supplier");
    }
  };

  // DELETE: Remove a supplier
  const deleteSupplier = async (id: string): Promise<boolean> => {
    startLoading();
    try {
      // Check if supplier exists
      const supplierIndex = suppliers.findIndex((s) => s.id === id);
      if (supplierIndex === -1) {
        throw new Error(`Supplier with id ${id} not found`);
      }

      const supplierName = suppliers[supplierIndex].name;

      // Remove supplier from state
      const updatedSuppliers = suppliers.filter((s) => s.id !== id);
      setSuppliers(updatedSuppliers);

      toast({
        title: "Success",
        description: `Supplier ${supplierName} deleted successfully`,
      });

      stopLoading();
      return true;
    } catch (err) {
      console.error("Error deleting supplier:", err);
      stopLoading();
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get suppliers by material
  const getSuppliersByMaterial = (materialId: string): Supplier[] => {
    return suppliers.filter(
      (supplier) =>
        supplier.materials && supplier.materials.includes(materialId)
    );
  };

  // Get suppliers by certification
  const getSuppliersByCertification = (certification: string): Supplier[] => {
    return suppliers.filter(
      (supplier) =>
        supplier.certifications &&
        supplier.certifications.some((cert) =>
          cert.toLowerCase().includes(certification.toLowerCase())
        )
    );
  };

  // Get suppliers by transport mode
  const getSuppliersByTransportMode = (mode: string): Supplier[] => {
    return suppliers.filter(
      (supplier) =>
        supplier.transportMode &&
        supplier.transportMode.toLowerCase().includes(mode.toLowerCase())
    );
  };

  // Associate a supplier with materials
  const associateSupplierWithMaterials = async (
    supplierId: string,
    materialIds: string[]
  ): Promise<Supplier> => {
    startLoading();
    try {
      // Find supplier to update
      const supplierIndex = suppliers.findIndex((s) => s.id === supplierId);
      if (supplierIndex === -1) {
        throw new Error(`Supplier with id ${supplierId} not found`);
      }

      // Get current supplier
      const supplier = suppliers[supplierIndex];

      // Create a set of unique material IDs (existing + new)
      const uniqueMaterialIds = new Set([
        ...(supplier.materials || []),
        ...materialIds,
      ]);

      // Update supplier with new materials
      const updatedSupplier = {
        ...supplier,
        materials: Array.from(uniqueMaterialIds),
      };

      // Update state
      const updatedSuppliers = [...suppliers];
      updatedSuppliers[supplierIndex] = updatedSupplier;
      setSuppliers(updatedSuppliers);

      toast({
        title: "Success",
        description: `Materials associated with ${updatedSupplier.name} successfully`,
      });

      stopLoading();
      return updatedSupplier;
    } catch (err) {
      console.error("Error associating materials with supplier:", err);
      stopLoading();
      toast({
        title: "Error",
        description: "Failed to associate materials with supplier",
        variant: "destructive",
      });
      throw new Error("Failed to associate materials with supplier");
    }
  };

  // Disassociate a supplier from a material
  const disassociateSupplierFromMaterial = async (
    supplierId: string,
    materialId: string
  ): Promise<Supplier> => {
    startLoading();
    try {
      // Find supplier to update
      const supplierIndex = suppliers.findIndex((s) => s.id === supplierId);
      if (supplierIndex === -1) {
        throw new Error(`Supplier with id ${supplierId} not found`);
      }

      // Get current supplier
      const supplier = suppliers[supplierIndex];

      // Remove material from supplier's materials
      const updatedMaterials = (supplier.materials || []).filter(
        (id) => id !== materialId
      );

      // Update supplier
      const updatedSupplier = {
        ...supplier,
        materials: updatedMaterials,
      };

      // Update state
      const updatedSuppliers = [...suppliers];
      updatedSuppliers[supplierIndex] = updatedSupplier;
      setSuppliers(updatedSuppliers);

      toast({
        title: "Success",
        description: `Material disassociated from ${updatedSupplier.name} successfully`,
      });

      stopLoading();
      return updatedSupplier;
    } catch (err) {
      console.error("Error disassociating material from supplier:", err);
      stopLoading();
      toast({
        title: "Error",
        description: "Failed to disassociate material from supplier",
        variant: "destructive",
      });
      throw new Error("Failed to disassociate material from supplier");
    }
  };

  // Export suppliers to JSON format
  const exportSuppliersToJson = (): JsonSupplier[] => {
    return suppliers.map(convertSupplierToJson);
  };

  return {
    suppliers,
    loading,
    error,
    loadSuppliers,
    addSupplier,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    getSuppliersByMaterial,
    getSuppliersByCertification,
    getSuppliersByTransportMode,
    associateSupplierWithMaterials,
    disassociateSupplierFromMaterial,
    exportSuppliersToJson,
  };
}
