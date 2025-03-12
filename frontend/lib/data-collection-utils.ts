// Browser-side utility functions for data operations
import { v4 as uuidv4 } from 'uuid';

// Import types
import type { RawMaterial, Supplier, Warehouse, SupplierMaterialPricing } from '../types/types';

// Re-export the types for convenience
export type { RawMaterial, Supplier, Warehouse, SupplierMaterialPricing };

// These functions are client-side equivalents to API calls
// In a real app, these would make fetch calls to the API
// But for now, we're using local JSON data

export const getRawMaterials = async (): Promise<RawMaterial[]> => {
  try {
    const materialsModule = await import('@/data/materials.json');
    return materialsModule.default as RawMaterial[];
  } catch (error) {
    console.error("Error loading materials:", error);
    return [];
  }
};

export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const suppliersModule = await import('@/data/suppliers.json');
    return suppliersModule.default as Supplier[];
  } catch (error) {
    console.error("Error loading suppliers:", error);
    return [];
  }
};

export const getWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const warehousesModule = await import('@/data/warehouses.json');
    // Our JSON now matches the Warehouse type structure, so we can use it directly
    return warehousesModule.default as Warehouse[];
  } catch (error) {
    console.error("Error loading warehouses:", error);
    return [];
  }
};

export const addRawMaterial = async (
  material: Omit<RawMaterial, "id">
): Promise<RawMaterial> => {
  // Generate a unique ID
  const newMaterial: RawMaterial = {
    ...material,
    id: `material-${uuidv4()}`,
    suppliers: material.suppliers || []
  };
  return newMaterial;
};

export const updateRawMaterial = async (
  id: string,
  updates: Partial<RawMaterial>
): Promise<RawMaterial> => {
  // In a real app, this would update the data on the server
  const materials = await getRawMaterials();
  const material = materials.find(m => m.id === id);
  if (!material) {
    throw new Error(`Material with id ${id} not found`);
  }
  return { ...material, ...updates };
};

export const addSupplier = async (
  supplier: Omit<Supplier, "id">
): Promise<Supplier> => {
  // Generate a unique ID
  const newSupplier: Supplier = {
    ...supplier,
    id: `supplier-${uuidv4()}`
  };
  return newSupplier;
};

export const updateSupplier = async (
  id: string,
  updates: Partial<Supplier>
): Promise<Supplier> => {
  // In a real app, this would update the data on the server
  const suppliers = await getSuppliers();
  const supplier = suppliers.find(s => s.id === id);
  if (!supplier) {
    throw new Error(`Supplier with id ${id} not found`);
  }
  return { ...supplier, ...updates };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteSupplier = async (_id: string): Promise<void> => {
  // In a real app, this would delete the data on the server
  // For now, we do nothing
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteRawMaterial = async (_id: string): Promise<void> => {
  // In a real app, this would delete the data on the server
  // For now, we do nothing
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteWarehouse = async (_id: string): Promise<void> => {
  // In a real app, this would delete the data on the server
  // For now, we do nothing
};

export const addWarehouse = async (
  warehouse: Omit<Warehouse, "id">
): Promise<Warehouse> => {
  // Generate a unique ID
  const newWarehouse: Warehouse = {
    ...warehouse,
    id: `warehouse-${uuidv4()}`
  };
  return newWarehouse;
};

export const updateWarehouse = async (
  id: string,
  updates: Partial<Warehouse>
): Promise<Warehouse> => {
  // In a real app, this would update the data on the server
  const warehouses = await getWarehouses();
  const warehouse = warehouses.find(w => w.id === id);
  if (!warehouse) {
    throw new Error(`Warehouse with id ${id} not found`);
  }
  return { ...warehouse, ...updates };
};

export const associateSuppliersWithMaterial = async (
  materialId: string,
  supplierIds: string[]
): Promise<void> => {
  // In a real app, this would update the associations on the server
  await updateRawMaterial(materialId, { suppliers: supplierIds });
};

export const getMaterialsBySupplier = async (
  supplierId: string
): Promise<RawMaterial[]> => {
  // Get all materials and filter for the ones associated with this supplier
  const materials = await getRawMaterials();
  return materials.filter(m => m.suppliers && m.suppliers.includes(supplierId));
};

// Helper function to get supplier pricing information
export const getSupplierMaterialPricing = async (
  supplierId?: string,
  materialId?: string
): Promise<SupplierMaterialPricing[]> => {
  try {
    const pricingModule = await import('@/data/supplier-material-pricing.json');
    // Access the array directly since we updated the data structure
    let pricing = pricingModule.default as SupplierMaterialPricing[];
    
    // Filter by supplierId if provided
    if (supplierId) {
      pricing = pricing.filter(p => p.supplierId === supplierId);
    }
    
    // Filter by materialId if provided
    if (materialId) {
      pricing = pricing.filter(p => p.materialId === materialId);
    }
    
    return pricing;
  } catch (error) {
    console.error("Error loading supplier pricing:", error);
    return [];
  }
};

export const addSupplierMaterialPricing = async (
  pricing: Omit<SupplierMaterialPricing, "id" | "createdAt" | "updatedAt">
): Promise<SupplierMaterialPricing> => {
  const now = new Date().toISOString();
  const newPricing: SupplierMaterialPricing = {
    ...pricing,
    id: `pricing-${uuidv4()}`,
    createdAt: now,
    updatedAt: now
  };
  return newPricing;
};
