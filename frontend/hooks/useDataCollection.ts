import { useLocalData } from "./useLocalData";
import type { Supplier, RawMaterial, Warehouse } from "@/types/types";
import { v4 as uuidv4 } from "uuid";

/**
 * A hook that provides access to the supply chain data
 * Uses direct JSON imports instead of API calls
 */
export function useDataCollection() {
  const { suppliers, rawMaterials, routes, warehouses, loading, error } =
    useLocalData();

  // Add and update material functions
  const addRawMaterial = async (
    material: Omit<RawMaterial, "id">
  ): Promise<RawMaterial> => {
    try {
      // No API call - just create a new material in memory
      const newMaterial: RawMaterial = {
        ...material,
        id: `material-${uuidv4()}`,
        suppliers: material.suppliers || [],
      };

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
      // No API call - just update the material in memory
      const materialIndex = rawMaterials.findIndex((m) => m.id === id);
      if (materialIndex === -1) {
        throw new Error(`Material with id ${id} not found`);
      }

      const updatedMaterial = {
        ...rawMaterials[materialIndex],
        ...updates,
      };

      return updatedMaterial;
    } catch (err) {
      console.error("Error updating material:", err);
      throw new Error("Failed to update material");
    }
  };

  // Add supplier function
  const addSupplier = async (
    supplier: Omit<Supplier, "id">
  ): Promise<Supplier> => {
    try {
      // No API call - just create a new supplier in memory
      const newSupplier: Supplier = {
        ...supplier,
        id: `supplier-${uuidv4()}`,
        materials: supplier.materials || [],
      };

      return newSupplier;
    } catch (err) {
      console.error("Error adding supplier:", err);
      throw new Error("Failed to add supplier");
    }
  };

  // Add warehouse function
  const addWarehouse = async (
    warehouse: Omit<Warehouse, "id">
  ): Promise<Warehouse> => {
    try {
      // No API call - just create a new warehouse in memory
      const newWarehouse: Warehouse = {
        ...warehouse,
        id: `warehouse-${uuidv4()}`,
      };

      return newWarehouse;
    } catch (err) {
      console.error("Error adding warehouse:", err);
      throw new Error("Failed to add warehouse");
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
    return rawMaterials.filter(
      (material) =>
        material.suppliers && material.suppliers.includes(supplierId)
    );
  };

  return {
    // Raw Materials
    rawMaterials,
    loadingRawMaterials: loading,
    addRawMaterial,
    updateRawMaterial,
    associateSuppliersWithMaterial,
    getMaterialsBySupplier,

    // Suppliers
    suppliers,
    loadingSuppliers: loading,
    addSupplier,

    // Warehouses
    warehouses,
    loadingWarehouses: loading,
    addWarehouse,

    // Routes
    routes,
    loadingRoutes: loading,

    // Combined
    loading,
    error,
  };
}
