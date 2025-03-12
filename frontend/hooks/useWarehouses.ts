import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import warehousesData from "@/data/warehouses.json";
import type { Warehouse } from "@/types/types";
import { getRawMaterials } from "@/lib/data-collection-utils";

// Extended Warehouse type that includes materials for internal use
interface WarehouseWithMaterials extends Warehouse {
  materialIds: string[];
}

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<WarehouseWithMaterials[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warehouseMaterialMap, setWarehouseMaterialMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Load warehouses from JSON data
    try {
      // Initialize with default empty material arrays
      const initialWarehouses = warehousesData.map(wh => ({
        ...wh,
        materialIds: []
      })) as WarehouseWithMaterials[];

      // Set initial warehouse data
      setWarehouses(initialWarehouses);
      
      // Load material associations
      loadMaterialAssociations();
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading warehouses:", err);
      setError("Failed to load warehouses");
      setLoading(false);
    }
  }, []);

  // Load material associations
  const loadMaterialAssociations = async () => {
    try {
      // In a real app, we'd fetch these associations from an API
      // For now, we'll create some sample associations based on capacity and features
      
      // Get materials
      const materials = await getRawMaterials();
      
      // Create a mapping of warehouse IDs to material IDs
      const newWarehouseMaterialMap: Record<string, string[]> = {};
      
      // Assign materials to warehouses based on real-world logic
      // For example: organic soybeans go to warehouses with temperature control
      warehouses.forEach(warehouse => {
        const materialIds: string[] = [];
        
        // If warehouse has temperature control, it can store sprouts
        if (warehouse.specialFeatures.some(f => 
            f.toLowerCase().includes('temperature') || 
            f.toLowerCase().includes('cold'))) {
          const sprouts = materials.filter(m => 
            m.name.toLowerCase().includes('sprout'));
          materialIds.push(...sprouts.map(m => m.id));
        }
        
        // If warehouse has organic certification, it can store organic soybeans
        if (warehouse.specialFeatures.some(f => 
            f.toLowerCase().includes('organic'))) {
          const organicMaterials = materials.filter(m => 
            m.name.toLowerCase().includes('organic'));
          materialIds.push(...organicMaterials.map(m => m.id));
        }
        
        // All warehouses can store processed products like soybean flour
        const processedMaterials = materials.filter(m => 
          m.type.toLowerCase().includes('processed'));
        materialIds.push(...processedMaterials.map(m => m.id));
        
        newWarehouseMaterialMap[warehouse.id] = [...new Set(materialIds)];
      });
      
      setWarehouseMaterialMap(newWarehouseMaterialMap);
      
      // Update warehouses with material associations
      setWarehouses(prev => prev.map(wh => ({
        ...wh,
        materialIds: newWarehouseMaterialMap[wh.id] || []
      })));
    } catch (error) {
      console.error("Error loading material associations:", error);
    }
  };

  const addWarehouse = async (warehouse: Omit<Warehouse, "id">): Promise<Warehouse> => {
    try {
      // Create a new warehouse with ID and default values for required fields
      const newWarehouse: WarehouseWithMaterials = {
        ...warehouse,
        id: `warehouse-${uuidv4()}`,
        name: warehouse.name || "New Warehouse",
        location: warehouse.location || {
          address: "",
          coordinates: { lat: 0, lng: 0 }
        },
        capacity: warehouse.capacity || 0,
        capacityUnit: warehouse.capacityUnit || "metric tons", // Better for bulk soybean storage
        utilizationRate: warehouse.utilizationRate || 0,
        handlingCapacity: warehouse.handlingCapacity || 0,
        operatingHours: warehouse.operatingHours || "9AM-5PM",
        specialFeatures: warehouse.specialFeatures || [],
        materialIds: []
      };
      
      // Update state
      setWarehouses(prev => [...prev, newWarehouse]);
      
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
      const warehouseIndex = warehouses.findIndex(w => w.id === id);
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
      const warehouseIndex = warehouses.findIndex(w => w.id === warehouseId);
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
      setWarehouseMaterialMap(prev => ({
        ...prev,
        [warehouseId]: materialIds
      }));
    } catch (error) {
      console.error("Error associating materials with warehouse:", error);
      throw error;
    }
  };
  
  // Get warehouses that store a specific material
  const getWarehousesByMaterial = (materialId: string): Warehouse[] => {
    const warehousesWithMaterial = warehouses.filter(warehouse => 
      warehouse.materialIds.includes(materialId)
    );
    
    // Return without the materialIds property for external API compatibility
    return warehousesWithMaterial.map(warehouse => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { materialIds, ...warehouseWithoutMaterials } = warehouse;
      return warehouseWithoutMaterials;
    });
  };

  // Calculate soybean-specific metrics
  const getSoybeanStorageMetrics = () => {
    const metrics = {
      totalCapacity: 0,
      utilizedCapacity: 0,
      temperatureControlledCapacity: 0,
      organicCertifiedCapacity: 0
    };
    
    warehouses.forEach(warehouse => {
      // Calculate total and utilized capacity
      metrics.totalCapacity += warehouse.capacity;
      metrics.utilizedCapacity += warehouse.capacity * (warehouse.utilizationRate / 100);
      
      // Calculate special storage capacities
      if (warehouse.specialFeatures.some(f => 
          f.toLowerCase().includes('temperature') || 
          f.toLowerCase().includes('cold'))) {
        metrics.temperatureControlledCapacity += warehouse.capacity;
      }
      
      if (warehouse.specialFeatures.some(f => 
          f.toLowerCase().includes('organic'))) {
        metrics.organicCertifiedCapacity += warehouse.capacity;
      }
    });
    
    return metrics;
  };

  return {
    warehouses: warehouses.map(warehouse => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { materialIds, ...warehouseWithoutMaterials } = warehouse;
      return warehouseWithoutMaterials;
    }),
    loading,
    error,
    addWarehouse,
    updateWarehouse,
    getWarehousesByMaterial,
    associateMaterialsWithWarehouse,
    getSoybeanStorageMetrics,
    // For debugging or internal use
    _warehouseMaterialMap: warehouseMaterialMap
  };
} 