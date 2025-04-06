import { useLocalData } from "./useLocalData";
import { v4 as uuidv4 } from "uuid";
import type { RawMaterial } from "@/types/types";

/**
 * Hook for working with raw material data (uses local JSON data)
 */
export function useRawMaterials() {
  const { materials: rawMaterials, loading, error } = useLocalData();

  // Add a new raw material (in-memory only)
  const addRawMaterial = async (
    material: Omit<RawMaterial, "id">
  ): Promise<RawMaterial> => {
    try {
      const newMaterial: RawMaterial = {
        ...material,
        id: `material-${uuidv4()}`,
      };
      return newMaterial;
    } catch (err) {
      console.error("Error adding raw material:", err);
      throw new Error("Failed to add raw material");
    }
  };

  // Get a raw material by ID
  const getRawMaterialById = (id: string): RawMaterial | undefined => {
    return rawMaterials.find((material) => material.id === id);
  };

  // Update an existing raw material (in-memory only)
  const updateRawMaterial = async (
    id: string,
    updates: Partial<RawMaterial>
  ): Promise<RawMaterial> => {
    try {
      const materialIndex = rawMaterials.findIndex((m) => m.id === id);
      if (materialIndex === -1) {
        throw new Error(`Raw material with id ${id} not found`);
      }

      const updatedMaterial = {
        ...rawMaterials[materialIndex],
        ...updates,
      };

      return updatedMaterial;
    } catch (err) {
      console.error("Error updating raw material:", err);
      throw new Error("Failed to update raw material");
    }
  };

  // Delete a raw material (in-memory only)
  const deleteRawMaterial = async (id: string): Promise<boolean> => {
    try {
      const materialExists = rawMaterials.some((m) => m.id === id);
      if (!materialExists) {
        throw new Error(`Raw material with id ${id} not found`);
      }

      return true;
    } catch (err) {
      console.error("Error deleting raw material:", err);
      throw new Error("Failed to delete raw material");
    }
  };

  // Filter materials by category
  const getMaterialsByCategory = (category: string): RawMaterial[] => {
    return rawMaterials.filter((material) => material.category === category);
  };

  // Export materials to JSON
  const exportMaterialsToJson = (): string => {
    try {
      return JSON.stringify(rawMaterials, null, 2);
    } catch (err) {
      console.error("Error exporting materials to JSON:", err);
      throw new Error("Failed to export materials to JSON");
    }
  };

  // Load materials (now a no-op since data is loaded by useLocalData)
  const loadMaterials = async (): Promise<void> => {
    // Data is already loaded by useLocalData
    return Promise.resolve();
  };

  return {
    rawMaterials,
    loading,
    error,
    loadMaterials,
    addRawMaterial,
    getRawMaterialById,
    updateRawMaterial,
    deleteRawMaterial,
    getMaterialsByCategory,
    exportMaterialsToJson,
  };
}
