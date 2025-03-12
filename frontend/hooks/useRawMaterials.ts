import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { RawMaterial } from "@/types/types";
import materialsData from "@/data/materials.json";
import { JsonRawMaterial, convertJsonToRawMaterial } from "@/types/json-types";

export function useRawMaterials() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load materials from JSON data
    try {
      // Convert JSON format to app format
      const jsonMaterials = materialsData as unknown as JsonRawMaterial[];
      const convertedMaterials = jsonMaterials.map(convertJsonToRawMaterial);
      setRawMaterials(convertedMaterials);
      setLoading(false);
    } catch (err) {
      console.error("Error loading materials:", err);
      setError("Failed to load materials");
      setLoading(false);
    }
  }, []);

  const addRawMaterial = async (material: Omit<RawMaterial, "id">): Promise<RawMaterial> => {
    try {
      // Create a new material with ID
      const newMaterial: RawMaterial = {
        ...material,
        id: `material-${uuidv4()}`,
        suppliers: material.suppliers || [],
        quantity: material.quantity || 0,
        unit: material.unit || "units",
        quality: material.quality || {
          score: 0,
          defectRate: 0,
          consistencyScore: 0
        },
        environmentalData: material.environmentalData || {
          carbonFootprint: 0,
          waterUsage: 0,
          landUse: 0,
          biodiversityImpact: ""
        },
        economicData: material.economicData || {
          unitCost: 0,
          transportationCost: 0,
          storageCost: 0,
          totalCostPerUnit: 0
        }
      };
      
      // Update state
      setRawMaterials(prev => [...prev, newMaterial]);

      // Would save to JSON here in a real implementation
      // const jsonMaterial = convertRawMaterialToJson(newMaterial);
      // await saveToJsonFile(jsonMaterial);
      
      return newMaterial;
    } catch (err) {
      console.error("Error adding material:", err);
      throw new Error("Failed to add material");
    }
  };

  const updateRawMaterial = async (
    id: string,
    updates: Partial<RawMaterial>
  ): Promise<RawMaterial> => {
    try {
      // Find material to update
      const materialIndex = rawMaterials.findIndex(m => m.id === id);
      if (materialIndex === -1) {
        throw new Error(`Material with id ${id} not found`);
      }

      // Create updated material
      const updatedMaterial = {
        ...rawMaterials[materialIndex],
        ...updates,
      };

      // Update state
      const updatedMaterials = [...rawMaterials];
      updatedMaterials[materialIndex] = updatedMaterial;
      setRawMaterials(updatedMaterials);

      // Would save to JSON here in a real implementation
      // const jsonMaterial = convertRawMaterialToJson(updatedMaterial);
      // await updateJsonFile(jsonMaterial);

      return updatedMaterial;
    } catch (err) {
      console.error("Error updating material:", err);
      throw new Error("Failed to update material");
    }
  };

  // Associate suppliers with a material
  const associateSuppliersWithMaterial = async (
    materialId: string,
    supplierIds: string[]
  ): Promise<void> => {
    try {
      await updateRawMaterial(materialId, { suppliers: supplierIds });
    } catch (err) {
      console.error("Error associating suppliers with material:", err);
      throw new Error("Failed to associate suppliers with material");
    }
  };

  // Get materials by supplier
  const getMaterialsBySupplier = (supplierId: string): RawMaterial[] => {
    return rawMaterials.filter(material => 
      material.suppliers && material.suppliers.includes(supplierId)
    );
  };

  return {
    rawMaterials,
    loading,
    error,
    addRawMaterial,
    updateRawMaterial,
    associateSuppliersWithMaterial,
    getMaterialsBySupplier
  };
} 