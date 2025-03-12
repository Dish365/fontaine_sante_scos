import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import suppliersData from "@/data/suppliers.json";
import type { Supplier } from "@/types/types";
import { JsonSupplier, convertJsonToSupplier } from "@/types/json-types";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load suppliers from JSON data
    try {
      // Convert JSON format to app format
      const jsonSuppliers = suppliersData as unknown as JsonSupplier[];
      const convertedSuppliers = jsonSuppliers.map(convertJsonToSupplier);
      setSuppliers(convertedSuppliers);
      setLoading(false);
    } catch (err) {
      console.error("Error loading suppliers:", err);
      setError("Failed to load suppliers");
      setLoading(false);
    }
  }, []);

  const addSupplier = async (supplier: Omit<Supplier, "id">): Promise<Supplier> => {
    try {
      // Create a new supplier with ID and default values for required fields
      const newSupplier: Supplier = {
        ...supplier,
        id: `supplier-${uuidv4()}`,
        materials: supplier.materials || [],
        location: supplier.location || {
          address: "",
          coordinates: { lat: 0, lng: 0 }
        },
        transportMode: supplier.transportMode || "road",
        productionCapacity: supplier.productionCapacity || "0 units/month",
        certifications: supplier.certifications || [],
        distance: supplier.distance || null,
        transportationDetails: supplier.transportationDetails || "",
        performanceHistory: supplier.performanceHistory || "",
        riskScore: typeof supplier.riskScore === 'number' ? supplier.riskScore : 0,
        contactInfo: supplier.contactInfo || {
          name: "",
          email: "",
          phone: ""
        },
        economicData: supplier.economicData || {
          foundedYear: 0,
          annualRevenue: 0,
          employeeCount: 0
        },
        environmentalData: supplier.environmentalData || {
          carbonFootprint: 0,
          wasteManagement: "",
          energyEfficiency: ""
        },
        quality: supplier.quality || {
          score: 0,
          certifications: [],
          lastAudit: new Date().toISOString()
        }
      };
      
      // Update state
      setSuppliers(prev => [...prev, newSupplier]);

      // Would save to JSON here in a real implementation
      // const jsonSupplier = convertSupplierToJson(newSupplier);
      // await saveToJsonFile(jsonSupplier);
      
      return newSupplier;
    } catch (err) {
      console.error("Error adding supplier:", err);
      throw new Error("Failed to add supplier");
    }
  };

  const updateSupplier = async (
    id: string,
    updates: Partial<Supplier>
  ): Promise<Supplier> => {
    try {
      // Find supplier to update
      const supplierIndex = suppliers.findIndex(s => s.id === id);
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

      // Would save to JSON here in a real implementation
      // const jsonSupplier = convertSupplierToJson(updatedSupplier);
      // await updateJsonFile(jsonSupplier);

      return updatedSupplier;
    } catch (err) {
      console.error("Error updating supplier:", err);
      throw new Error("Failed to update supplier");
    }
  };
  
  // Get suppliers by material
  const getSuppliersByMaterial = (materialId: string): Supplier[] => {
    return suppliers.filter(supplier => 
      supplier.materials && supplier.materials.includes(materialId)
    );
  };

  return {
    suppliers,
    loading,
    error,
    addSupplier,
    updateSupplier,
    getSuppliersByMaterial
  };
} 