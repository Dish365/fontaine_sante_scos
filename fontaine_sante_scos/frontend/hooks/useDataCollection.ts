import { useState, useEffect, useCallback } from "react";
import {
  getSuppliers,
  getRawMaterials,
  getWarehouses,
  addSupplier as addSupplierUtil,
  addRawMaterial as addRawMaterialUtil,
  addWarehouse,
  updateSupplier as updateSupplierUtil,
  updateRawMaterial as updateRawMaterialUtil,
  updateWarehouse,
  deleteSupplier as deleteSupplierUtil,
  deleteRawMaterial as deleteRawMaterialUtil,
  deleteWarehouse,
  associateSuppliersWithMaterial as associateSuppliersWithMaterialUtil,
  getMaterialsBySupplier,
  type Supplier,
  type RawMaterial,
  type Warehouse,
} from "@/lib/data-collection-utils-browser";
import type { SupplierMaterialPricing } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

// Type for the return value of the hook
interface UseDataCollectionReturn {
  // Suppliers
  suppliers: Supplier[];
  loadingSuppliers: boolean;
  errorSuppliers: string | null;
  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, "id">) => Promise<Supplier>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;

  // Raw Materials
  rawMaterials: RawMaterial[];
  loadingRawMaterials: boolean;
  errorRawMaterials: string | null;
  fetchRawMaterials: () => Promise<void>;
  fetchRawMaterialsBySupplier: (supplierId: string) => Promise<void>;
  addRawMaterial: (material: Omit<RawMaterial, "id">) => Promise<RawMaterial>;
  updateRawMaterial: (
    id: string,
    data: Partial<RawMaterial>
  ) => Promise<RawMaterial>;
  deleteRawMaterial: (id: string) => Promise<void>;

  // Warehouses
  warehouses: Warehouse[];
  loadingWarehouses: boolean;
  errorWarehouses: string | null;
  fetchWarehouses: () => Promise<Warehouse[]>;
  addWarehouse: (warehouse: Omit<Warehouse, "id">) => Promise<Warehouse>;
  updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<Warehouse>;
  deleteWarehouse: (id: string) => Promise<void>;

  // Supplier Material Pricing
  supplierPricing: SupplierMaterialPricing[];
  loadingPricing: boolean;
  errorPricing: string | null;
  fetchSupplierPricing: (
    supplierId?: string,
    materialId?: string
  ) => Promise<void>;
  addSupplierPricing: (
    pricing: Omit<SupplierMaterialPricing, "id" | "createdAt" | "updatedAt">
  ) => Promise<SupplierMaterialPricing>;
  updateSupplierPricing: (
    id: string,
    data: Partial<SupplierMaterialPricing>
  ) => Promise<SupplierMaterialPricing>;
  deleteSupplierPricing: (id: string) => Promise<void>;

  // New functionality
  associateSuppliersWithMaterial: (
    materialId: string,
    supplierIds: string[]
  ) => Promise<void>;
}

// The main hook for data collection
export function useDataCollection(): UseDataCollectionReturn {
  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(false);
  const [errorSuppliers, setErrorSuppliers] = useState<string | null>(null);

  // Raw Materials state
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loadingRawMaterials, setLoadingRawMaterials] =
    useState<boolean>(false);
  const [errorRawMaterials, setErrorRawMaterials] = useState<string | null>(
    null
  );

  // Warehouses state
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState<boolean>(false);
  const [errorWarehouses, setErrorWarehouses] = useState<string | null>(null);

  // Supplier Material Pricing state
  const [supplierPricing, setSupplierPricing] = useState<
    SupplierMaterialPricing[]
  >([]);
  const [loadingPricing, setLoadingPricing] = useState<boolean>(false);
  const [errorPricing, setErrorPricing] = useState<string | null>(null);

  const { toast } = useToast();

  // Fetch all suppliers from JSON file
  const fetchSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    setErrorSuppliers(null);

    try {
      const response = await fetch("/api/suppliers");
      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setErrorSuppliers("Failed to fetch suppliers. Please try again.");
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  // Add a new supplier
  const addSupplier = useCallback(
    async (supplierData: Omit<Supplier, "id">) => {
      try {
        setLoadingSuppliers(true);
        const newSupplier = await addSupplierUtil(supplierData);
        setSuppliers((prev) => [...prev, newSupplier]);
        toast({
          title: "Success",
          description: "Supplier added successfully",
        });
        return newSupplier;
      } catch (error) {
        console.error("Failed to add supplier:", error);
        toast({
          title: "Error",
          description: "Failed to add supplier",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoadingSuppliers(false);
      }
    },
    [toast]
  );

  // Update an existing supplier
  const updateSupplier = useCallback(
    async (id: string, supplierData: Partial<Supplier>) => {
      try {
        setLoadingSuppliers(true);
        const updatedSupplier = await updateSupplierUtil(id, supplierData);

        // Update in state
        setSuppliers((prev) =>
          prev.map((supplier) =>
            supplier.id === id ? updatedSupplier : supplier
          )
        );
        toast({
          title: "Success",
          description: "Supplier updated successfully",
        });
        return updatedSupplier;
      } catch (error) {
        console.error("Failed to update supplier:", error);
        toast({
          title: "Error",
          description: "Failed to update supplier",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoadingSuppliers(false);
      }
    },
    [toast]
  );

  // Delete a supplier
  const deleteSupplier = useCallback(
    async (id: string) => {
      try {
        setLoadingSuppliers(true);
        await deleteSupplierUtil(id);
        // Remove from state
        setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete supplier:", error);
        toast({
          title: "Error",
          description: "Failed to delete supplier",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoadingSuppliers(false);
      }
    },
    [toast]
  );

  // Fetch all raw materials from JSON file
  const fetchRawMaterials = useCallback(async () => {
    setLoadingRawMaterials(true);
    setErrorRawMaterials(null);

    try {
      const data = await getRawMaterials();
      setRawMaterials(data || []);
    } catch (error) {
      console.error("Failed to fetch raw materials:", error);
      setErrorRawMaterials("Failed to fetch raw materials. Please try again.");
    } finally {
      setLoadingRawMaterials(false);
    }
  }, []);

  // Fetch materials by supplier ID
  const fetchRawMaterialsBySupplier = useCallback(
    async (supplierId: string) => {
      setLoadingRawMaterials(true);
      setErrorRawMaterials(null);

      try {
        const materials = await getMaterialsBySupplier(supplierId);
        setRawMaterials(materials);
      } catch (error) {
        console.error("Failed to fetch raw materials:", error);
        setErrorRawMaterials(
          "Failed to fetch raw materials. Please try again."
        );
      } finally {
        setLoadingRawMaterials(false);
      }
    },
    []
  );

  // Add a new raw material (simulated)
  const addRawMaterial = useCallback(
    async (materialData: Omit<RawMaterial, "id">) => {
      try {
        setLoadingRawMaterials(true);
        const newMaterial = await addRawMaterialUtil(materialData);
        setRawMaterials((prev) => [...prev, newMaterial]);
        toast({
          title: "Success",
          description: "Raw material added successfully",
        });
        return newMaterial;
      } catch (error) {
        console.error("Failed to add raw material:", error);
        toast({
          title: "Error",
          description: "Failed to add raw material",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoadingRawMaterials(false);
      }
    },
    [toast]
  );

  // Update an existing raw material
  const updateRawMaterial = useCallback(
    async (id: string, materialData: Partial<RawMaterial>) => {
      try {
        setLoadingRawMaterials(true);
        const updatedMaterial = await updateRawMaterialUtil(id, materialData);

        // Update in state
        setRawMaterials((prev) =>
          prev.map((material) =>
            material.id === id ? updatedMaterial : material
          )
        );
        toast({
          title: "Success",
          description: "Raw material updated successfully",
        });
        return updatedMaterial;
      } catch (error) {
        console.error("Failed to update raw material:", error);
        toast({
          title: "Error",
          description: "Failed to update raw material",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoadingRawMaterials(false);
      }
    },
    [toast]
  );

  // Delete a raw material (simulated)
  const deleteRawMaterial = useCallback(
    async (id: string) => {
      try {
        setLoadingRawMaterials(true);
        await deleteRawMaterialUtil(id);
        // Remove from state
        setRawMaterials((prev) =>
          prev.filter((material) => material.id !== id)
        );
        toast({
          title: "Success",
          description: "Raw material deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete raw material:", error);
        toast({
          title: "Error",
          description: "Failed to delete raw material",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoadingRawMaterials(false);
      }
    },
    [toast]
  );

  // Fetch warehouses
  const fetchWarehouses = useCallback(async () => {
    try {
      setLoadingWarehouses(true);
      const data = await getWarehouses();
      setWarehouses(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
      setErrorWarehouses("Failed to load warehouses. Please try again.");
      return [];
    } finally {
      setLoadingWarehouses(false);
    }
  }, []);

  // Add a new warehouse
  const addNewWarehouse = useCallback(
    async (warehouseData: Omit<Warehouse, "id">) => {
      try {
        setLoadingWarehouses(true);
        const newWarehouse = await addWarehouse(warehouseData);
        setWarehouses((prev) => [...prev, newWarehouse]);
        toast({
          title: "Success",
          description: "Warehouse added successfully",
        });
        return newWarehouse;
      } catch (error) {
        console.error("Failed to add warehouse:", error);
        setErrorWarehouses("Failed to add warehouse. Please try again.");
        throw error;
      } finally {
        setLoadingWarehouses(false);
      }
    },
    [toast]
  );

  // Update an existing warehouse
  const updateExistingWarehouse = useCallback(
    async (id: string, warehouseData: Partial<Warehouse>) => {
      try {
        setLoadingWarehouses(true);
        const updatedWarehouse = await updateWarehouse(id, warehouseData);
        setWarehouses((prev) =>
          prev.map((warehouse) =>
            warehouse.id === id ? updatedWarehouse : warehouse
          )
        );
        toast({
          title: "Success",
          description: "Warehouse updated successfully",
        });
        return updatedWarehouse;
      } catch (error) {
        console.error("Failed to update warehouse:", error);
        setErrorWarehouses("Failed to update warehouse. Please try again.");
        throw error;
      } finally {
        setLoadingWarehouses(false);
      }
    },
    [toast]
  );

  // Delete a warehouse
  const removeWarehouse = useCallback(
    async (id: string) => {
      try {
        setLoadingWarehouses(true);
        await deleteWarehouse(id);
        setWarehouses((prev) =>
          prev.filter((warehouse) => warehouse.id !== id)
        );
        toast({
          title: "Success",
          description: "Warehouse deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete warehouse:", error);
        setErrorWarehouses("Failed to delete warehouse. Please try again.");
        throw error;
      } finally {
        setLoadingWarehouses(false);
      }
    },
    [toast]
  );

  // Associate suppliers with a material
  const associateSuppliersWithMaterial = useCallback(
    async (materialId: string, supplierIds: string[]) => {
      try {
        setLoadingRawMaterials(true);
        await associateSuppliersWithMaterialUtil(materialId, supplierIds);

        // Update the material in state
        setRawMaterials((prev) =>
          prev.map((material) =>
            material.id === materialId
              ? { ...material, suppliers: supplierIds }
              : material
          )
        );

        toast({
          title: "Success",
          description: "Suppliers associated with material successfully",
        });
      } catch (error) {
        console.error("Failed to associate suppliers with material:", error);
        toast({
          title: "Error",
          description: "Failed to associate suppliers with material",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoadingRawMaterials(false);
      }
    },
    [toast]
  );

  // Fetch supplier pricing
  const fetchSupplierPricing = useCallback(
    async (supplierId?: string, materialId?: string) => {
      setLoadingPricing(true);
      setErrorPricing(null);

      try {
        const params = new URLSearchParams();
        if (supplierId) params.append("supplierId", supplierId);
        if (materialId) params.append("materialId", materialId);

        const response = await fetch(
          `/api/supplier-pricing?${params.toString()}`
        );
        if (!response.ok) throw new Error("Failed to fetch supplier pricing");

        const data = await response.json();
        setSupplierPricing(data);
      } catch (error) {
        console.error("Failed to fetch supplier pricing:", error);
        setErrorPricing("Failed to fetch supplier pricing. Please try again.");
        toast({
          title: "Error",
          description: "Failed to fetch supplier pricing",
          variant: "destructive",
        });
      } finally {
        setLoadingPricing(false);
      }
    },
    [toast]
  );

  // Add supplier pricing
  const addSupplierPricing = useCallback(
    async (
      pricing: Omit<SupplierMaterialPricing, "id" | "createdAt" | "updatedAt">
    ) => {
      try {
        console.log("Attempting to add supplier pricing with data:", pricing);
        const response = await fetch("/api/supplier-pricing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pricing),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", {
            status: response.status,
            statusText: response.statusText,
            errorText,
          });
          throw new Error(
            `Failed to add supplier pricing: ${response.statusText}. ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Successfully added supplier pricing:", data);
        setSupplierPricing((prev) => [...prev, data]);
        toast({
          title: "Success",
          description: "Supplier pricing added successfully",
        });
        return data;
      } catch (error) {
        console.error("Failed to add supplier pricing:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to add supplier pricing",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  // Update supplier pricing
  const updateSupplierPricing = useCallback(
    async (id: string, data: Partial<SupplierMaterialPricing>) => {
      try {
        const response = await fetch(`/api/supplier-pricing?id=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error("Failed to update supplier pricing");

        const updatedData = await response.json();
        setSupplierPricing((prev) =>
          prev.map((item) => (item.id === id ? updatedData : item))
        );
        toast({
          title: "Success",
          description: "Supplier pricing updated successfully",
        });
        return updatedData;
      } catch (error) {
        console.error("Failed to update supplier pricing:", error);
        toast({
          title: "Error",
          description: "Failed to update supplier pricing",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  // Delete supplier pricing
  const deleteSupplierPricing = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/supplier-pricing?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete supplier pricing");

        setSupplierPricing((prev) => prev.filter((item) => item.id !== id));
        toast({
          title: "Success",
          description: "Supplier pricing deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete supplier pricing:", error);
        toast({
          title: "Error",
          description: "Failed to delete supplier pricing",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      await fetchSuppliers();
      await fetchRawMaterials();
      await fetchWarehouses();
    };
    initData();
  }, [fetchSuppliers, fetchRawMaterials, fetchWarehouses]);

  return {
    // Suppliers
    suppliers,
    loadingSuppliers,
    errorSuppliers,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,

    // Raw Materials
    rawMaterials,
    loadingRawMaterials,
    errorRawMaterials,
    fetchRawMaterials,
    fetchRawMaterialsBySupplier,
    addRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,

    // Warehouses
    warehouses,
    loadingWarehouses,
    errorWarehouses,
    fetchWarehouses,
    addWarehouse: addNewWarehouse,
    updateWarehouse: updateExistingWarehouse,
    deleteWarehouse: removeWarehouse,

    // Supplier Material Pricing
    supplierPricing,
    loadingPricing,
    errorPricing,
    fetchSupplierPricing,
    addSupplierPricing,
    updateSupplierPricing,
    deleteSupplierPricing,

    // New functionality
    associateSuppliersWithMaterial,
  };
}
