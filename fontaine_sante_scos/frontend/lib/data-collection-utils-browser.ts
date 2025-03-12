// Utility functions for data collection operations
// Browser-compatible version that uses API endpoints

// Type definitions for suppliers and raw materials
export interface SupplierLocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface SupplierContactInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export interface SupplierEconomicData {
  reliabilityScore?: number;
  averageLeadTime?: number;
  paymentTerms?: string;
}

export interface SupplierEnvironmentalData {
  carbonFootprint?: number;
  waterUsage?: number;
  wasteGenerated?: number;
  renewableEnergyUse?: number;
}

export interface Supplier {
  id: string;
  name: string;
  location: SupplierLocation;
  materials: string[];
  transportMode?: string;
  distance?: number;
  transportationDetails?: string;
  productionCapacity?: string;
  certifications: string[];
  performanceHistory?: string;
  environmentalImpact?: string;
  riskScore?: string;
  quality?: number;
  contactInfo?: SupplierContactInfo;
  economicData?: SupplierEconomicData;
  environmentalData?: SupplierEnvironmentalData;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialQuality {
  score: number;
  defectRate: number;
  consistencyScore: number;
}

export interface MaterialEnvironmentalData {
  carbonFootprint: number;
  waterUsage: number;
  landUse: number;
  biodiversityImpact: string;
}

export interface MaterialEconomicData {
  unitCost: number;
  transportationCost: number;
  storageCost: number;
  totalCostPerUnit: number;
}

export interface RawMaterial {
  id: string;
  name: string;
  type: string;
  description: string;
  suppliers: string[];
  quantity: number;
  unit: string;
  quality: MaterialQuality;
  environmentalData: MaterialEnvironmentalData;
  economicData: MaterialEconomicData;
}

export interface WarehouseLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface WarehouseCapacity {
  maxCapacity: number;
  currentUtilization: number;
  unit: string;
}

export interface Warehouse {
  id: string;
  name: string;
  type: string;
  location: WarehouseLocation;
  capacity: WarehouseCapacity;
  suppliers: string[];
  materials: string[];
  transitTimes: {
    inbound: number;
    outbound: number;
  };
  operationalCost: number;
}

// API functions for suppliers
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    console.log("Fetching suppliers from API");
    const response = await fetch("/api/data-collection/suppliers");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.length} suppliers from API`);
    return data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

/**
 * Get a supplier by ID
 * @param id The supplier ID
 * @returns The supplier or null if not found
 */
export async function getSupplierById(id: string): Promise<Supplier | null> {
  try {
    const response = await fetch(`/api/data-collection/suppliers/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch supplier: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting supplier by ID:", error);
    throw error;
  }
}

export async function addSupplier(
  supplierData: Omit<Supplier, "id">
): Promise<Supplier> {
  try {
    const response = await fetch("/api/data-collection/suppliers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplierData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.supplier;
  } catch (error) {
    console.error("Error adding supplier:", error);
    throw error;
  }
}

export async function updateSupplier(
  id: string,
  supplierData: Partial<Supplier>
): Promise<Supplier> {
  try {
    const response = await fetch(`/api/data-collection/suppliers?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplierData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.supplier;
  } catch (error) {
    console.error("Error updating supplier:", error);
    throw error;
  }
}

export async function deleteSupplier(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/data-collection/suppliers?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw error;
  }
}

// API functions for raw materials
export async function getRawMaterials(): Promise<RawMaterial[]> {
  try {
    const response = await fetch("/api/data-collection/materials");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("API response for materials:", data);
    return data.materials || [];
  } catch (error) {
    console.error("Error fetching raw materials:", error);
    throw error;
  }
}

export async function getMaterialsBySupplier(
  supplierId: string
): Promise<RawMaterial[]> {
  try {
    const response = await fetch(
      `/api/data-collection/materials?supplierId=${supplierId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.materials;
  } catch (error) {
    console.error("Error fetching materials by supplier:", error);
    throw error;
  }
}

export async function addRawMaterial(
  materialData: Omit<RawMaterial, "id">
): Promise<RawMaterial> {
  try {
    const response = await fetch("/api/data-collection/materials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(materialData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.material;
  } catch (error) {
    console.error("Error adding raw material:", error);
    throw error;
  }
}

export async function updateRawMaterial(
  id: string,
  materialData: Partial<RawMaterial>
): Promise<RawMaterial> {
  try {
    const response = await fetch(`/api/data-collection/materials?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(materialData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.material;
  } catch (error) {
    console.error("Error updating raw material:", error);
    throw error;
  }
}

export async function deleteRawMaterial(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/data-collection/materials?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting raw material:", error);
    throw error;
  }
}

// API function to associate suppliers with a material
export async function associateSuppliersWithMaterial(
  materialId: string,
  supplierIds: string[]
): Promise<void> {
  try {
    const response = await fetch("/api/data-collection/materials/associate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ materialId, supplierIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error associating suppliers with material:", error);
    throw error;
  }
}

// API functions for warehouses
export async function getWarehouses(): Promise<Warehouse[]> {
  try {
    const response = await fetch("/api/data-collection/warehouses");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.warehouses;
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw error;
  }
}

export async function addWarehouse(
  warehouseData: Omit<Warehouse, "id">
): Promise<Warehouse> {
  try {
    const response = await fetch("/api/data-collection/warehouses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(warehouseData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.warehouse;
  } catch (error) {
    console.error("Error adding warehouse:", error);
    throw error;
  }
}

export async function updateWarehouse(
  id: string,
  warehouseData: Partial<Warehouse>
): Promise<Warehouse> {
  try {
    const response = await fetch(`/api/data-collection/warehouses?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(warehouseData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.warehouse;
  } catch (error) {
    console.error("Error updating warehouse:", error);
    throw error;
  }
}

export async function deleteWarehouse(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/data-collection/warehouses?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    throw error;
  }
}
