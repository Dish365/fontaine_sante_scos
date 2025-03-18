import { useLocalData } from "./useLocalData";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Warehouse } from "@/types/types";

// Extended Warehouse type that includes materials for internal use
interface WarehouseWithMaterials extends Warehouse {
  materialIds: string[];
}

/**
 * Hook for working with warehouse data (uses local JSON data)
 */
export function useWarehouses() {
  const {
    warehouses: baseWarehouses,
    materials,
    loading: dataLoading,
    error: dataError,
  } = useLocalData();

  // Track internal state with material associations
  const [warehouses, setWarehouses] = useState<WarehouseWithMaterials[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warehouseMaterialMap, setWarehouseMaterialMap] = useState<
    Record<string, string[]>
  >({});

  // Initialize warehouses with material associations when data is loaded
  useEffect(() => {
    if (!dataLoading && baseWarehouses.length > 0) {
      // Initialize with empty material arrays
      const initialWarehouses = baseWarehouses.map((wh) => ({
        ...wh,
        materialIds: [],
      })) as WarehouseWithMaterials[];

      // Set initial warehouse data
      setWarehouses(initialWarehouses);

      // Load material associations
      loadMaterialAssociations(initialWarehouses);
    }
  }, [dataLoading, baseWarehouses]);

  // Load material associations
  const loadMaterialAssociations = (warehousesData = warehouses) => {
    try {
      // Create a mapping of warehouse IDs to material IDs
      const newWarehouseMaterialMap: Record<string, string[]> = {};

      // Assign materials to warehouses based on real-world logic
      warehousesData.forEach((warehouse) => {
        const materialIds: string[] = [];

        // If warehouse has temperature control, it can store temperature-sensitive materials
        if (
          warehouse.specialFeatures.some(
            (f) =>
              f.toLowerCase().includes("temperature") ||
              f.toLowerCase().includes("cold")
          )
        ) {
          const temperatureSensitiveMaterials = materials.filter((m) =>
            m.name.toLowerCase().includes("sprout")
          );
          materialIds.push(...temperatureSensitiveMaterials.map((m) => m.id));
        }

        // If warehouse has organic certification, it can store organic materials
        if (
          warehouse.specialFeatures.some((f) =>
            f.toLowerCase().includes("organic")
          )
        ) {
          const organicMaterials = materials.filter((m) =>
            m.name.toLowerCase().includes("organic")
          );
          materialIds.push(...organicMaterials.map((m) => m.id));
        }

        // All warehouses can store processed products
        const processedMaterials = materials.filter((m) =>
          m.type?.toLowerCase().includes("processed")
        );
        materialIds.push(...processedMaterials.map((m) => m.id));

        newWarehouseMaterialMap[warehouse.id] = [...new Set(materialIds)];
      });

      setWarehouseMaterialMap(newWarehouseMaterialMap);

      // Update warehouses with material associations
      setWarehouses((prev) =>
        prev.map((wh) => ({
          ...wh,
          materialIds: newWarehouseMaterialMap[wh.id] || [],
        }))
      );
    } catch (err) {
      console.error("Error loading material associations:", err);
    }
  };

  const addWarehouse = async (
    warehouse: Omit<Warehouse, "id">
  ): Promise<Warehouse> => {
    try {
      // Create a new warehouse with ID and default values for required fields
      const newWarehouse: WarehouseWithMaterials = {
        ...warehouse,
        id: `warehouse-${uuidv4()}`,
        name: warehouse.name || "New Warehouse",
        location: warehouse.location || {
          address: "",
          coordinates: { lat: 0, lng: 0 },
        },
        capacity: warehouse.capacity || 0,
        capacityUnit: warehouse.capacityUnit || "metric tons",
        utilizationRate: warehouse.utilizationRate || 0,
        handlingCapacity: warehouse.handlingCapacity || 0,
        operatingHours: warehouse.operatingHours || "9AM-5PM",
        specialFeatures: warehouse.specialFeatures || [],
        materialIds: [],
      };

      // Update state
      setWarehouses((prev) => [...prev, newWarehouse]);

      // Return without the materialIds property for external API compatibility
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { materialIds, ...returnWarehouse } = newWarehouse;
      return returnWarehouse;
    } catch (err) {
      console.error("Error adding warehouse:", err);
      throw new Error("Failed to add warehouse");
    }
  };

  const updateWarehouse = async (
    id: string,
    updates: Partial<Warehouse>
  ): Promise<Warehouse> => {
    try {
      // Find warehouse to update
      const warehouseIndex = warehouses.findIndex((w) => w.id === id);
      if (warehouseIndex === -1) {
        throw new Error(`Warehouse with id ${id} not found`);
      }

      // Create updated warehouse
      const updatedWarehouse = {
        ...warehouses[warehouseIndex],
        ...updates,
      };

      // Update state
      const updatedWarehouses = [...warehouses];
      updatedWarehouses[warehouseIndex] = updatedWarehouse;
      setWarehouses(updatedWarehouses);

      // Return without the materialIds property for external API compatibility
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { materialIds, ...returnWarehouse } = updatedWarehouse;
      return returnWarehouse;
    } catch (err) {
      console.error("Error updating warehouse:", err);
      throw new Error("Failed to update warehouse");
    }
  };

  // Associate materials with a warehouse
  const associateMaterialsWithWarehouse = async (
    warehouseId: string,
    materialIds: string[]
  ): Promise<void> => {
    try {
      // Find warehouse
      const warehouseIndex = warehouses.findIndex((w) => w.id === warehouseId);
      if (warehouseIndex === -1) {
        throw new Error(`Warehouse with id ${warehouseId} not found`);
      }

      // Update warehouse materials
      const updatedWarehouse = {
        ...warehouses[warehouseIndex],
        materialIds,
      };

      // Update state
      const updatedWarehouses = [...warehouses];
      updatedWarehouses[warehouseIndex] = updatedWarehouse;
      setWarehouses(updatedWarehouses);

      // Update mapping
      setWarehouseMaterialMap((prev) => ({
        ...prev,
        [warehouseId]: materialIds,
      }));
    } catch (error) {
      console.error("Error associating materials with warehouse:", error);
      throw error;
    }
  };

  // Get warehouses that store a specific material
  const getWarehousesByMaterial = (materialId: string): Warehouse[] => {
    const warehousesWithMaterial = warehouses.filter((warehouse) =>
      warehouse.materialIds.includes(materialId)
    );

    // Return without the materialIds property for external API compatibility
    return warehousesWithMaterial.map((warehouse) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { materialIds, ...warehouseWithoutMaterials } = warehouse;
      return warehouseWithoutMaterials;
    });
  };

  // Calculate storage metrics
  const getStorageMetrics = () => {
    const metrics = {
      totalCapacity: 0,
      utilizedCapacity: 0,
      temperatureControlledCapacity: 0,
      organicCertifiedCapacity: 0,
    };

    warehouses.forEach((warehouse) => {
      // Calculate total and utilized capacity
      metrics.totalCapacity += warehouse.capacity;
      metrics.utilizedCapacity +=
        warehouse.capacity * (warehouse.utilizationRate / 100);

      // Calculate special storage capacities
      if (
        warehouse.specialFeatures.some(
          (f) =>
            f.toLowerCase().includes("temperature") ||
            f.toLowerCase().includes("cold")
        )
      ) {
        metrics.temperatureControlledCapacity += warehouse.capacity;
      }

      if (
        warehouse.specialFeatures.some((f) =>
          f.toLowerCase().includes("organic")
        )
      ) {
        metrics.organicCertifiedCapacity += warehouse.capacity;
      }
    });

    return metrics;
  };

  return {
    warehouses: warehouses.map((warehouse) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { materialIds, ...warehouseWithoutMaterials } = warehouse;
      return warehouseWithoutMaterials;
    }),
    loading: loading || dataLoading,
    error: error || dataError,
    addWarehouse,
    updateWarehouse,
    getWarehousesByMaterial,
    associateMaterialsWithWarehouse,
    getStorageMetrics,
  };
}
