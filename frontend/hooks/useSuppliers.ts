import { useLocalData } from "./useLocalData";
import { v4 as uuidv4 } from "uuid";
import type { Supplier } from "@/types/types";

/**
 * Hook for working with supplier data (uses local JSON data)
 */
export function useSuppliers() {
  const { suppliers, loading, error } = useLocalData();

  // Add a new supplier (in-memory only)
  const addSupplier = async (
    supplier: Omit<Supplier, "id">
  ): Promise<Supplier> => {
    try {
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

  // Get a supplier by ID
  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find((supplier) => supplier.id === id);
  };

  // Update an existing supplier (in-memory only)
  const updateSupplier = async (
    id: string,
    updates: Partial<Supplier>
  ): Promise<Supplier> => {
    try {
      const supplierIndex = suppliers.findIndex((s) => s.id === id);
      if (supplierIndex === -1) {
        throw new Error(`Supplier with id ${id} not found`);
      }

      const updatedSupplier = {
        ...suppliers[supplierIndex],
        ...updates,
      };
      
      return updatedSupplier;
    } catch (err) {
      console.error("Error updating supplier:", err);
      throw new Error("Failed to update supplier");
    }
  };

  // Delete a supplier (in-memory only)
  const deleteSupplier = async (id: string): Promise<boolean> => {
    try {
      const supplierExists = suppliers.some((s) => s.id === id);
      if (!supplierExists) {
        throw new Error(`Supplier with id ${id} not found`);
      }
      
      return true;
    } catch (err) {
      console.error("Error deleting supplier:", err);
      throw new Error("Failed to delete supplier");
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
        supplier.certifications.includes(certification)
    );
  };

  // Get suppliers by transport mode
  const getSuppliersByTransportMode = (transportMode: string): Supplier[] => {
    return suppliers.filter(
      (supplier) => supplier.transportMode === transportMode
    );
  };

  // Associate supplier with materials
  const associateSupplierWithMaterials = async (
    supplierId: string,
    materialIds: string[]
  ): Promise<void> => {
    try {
      await updateSupplier(supplierId, { materials: materialIds });
    } catch (err) {
      console.error("Error associating supplier with materials:", err);
      throw new Error("Failed to associate supplier with materials");
    }
  };

  // Disassociate supplier from material
  const disassociateSupplierFromMaterial = async (
    supplierId: string,
    materialId: string
  ): Promise<void> => {
    try {
      const supplier = getSupplierById(supplierId);
      if (!supplier) {
        throw new Error(`Supplier with id ${supplierId} not found`);
      }

      const updatedMaterials = supplier.materials
        ? supplier.materials.filter((id) => id !== materialId)
        : [];

      await updateSupplier(supplierId, { materials: updatedMaterials });
    } catch (err) {
      console.error("Error disassociating supplier from material:", err);
      throw new Error("Failed to disassociate supplier from material");
    }
  };

  // Export suppliers to JSON
  const exportSuppliersToJson = (): string => {
    try {
      return JSON.stringify(suppliers, null, 2);
    } catch (err) {
      console.error("Error exporting suppliers to JSON:", err);
      throw new Error("Failed to export suppliers to JSON");
    }
  };

  // Load suppliers (now a no-op since data is loaded by useLocalData)
  const loadSuppliers = async (): Promise<void> => {
    // Data is already loaded by useLocalData
    return Promise.resolve();
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
