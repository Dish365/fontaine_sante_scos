// Utility functions for data collection operations
// Using in-memory data instead of file system operations

import { prisma } from "./db";
import * as jsonStorage from "./json-storage";
import { SupplierMaterialPricing } from "./types";
import { Prisma } from "@prisma/client";

// Type definitions for suppliers and raw materials
export interface SupplierLocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface SupplierContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface SupplierEconomicData {
  reliabilityScore: number;
  averageLeadTime: number;
  paymentTerms: string;
}

export interface SupplierEnvironmentalData {
  carbonFootprint: number;
  waterUsage: number;
  wasteGenerated: number;
  renewableEnergyUse: number;
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
  createdAt: string;
  updatedAt: string;
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
  taxRate?: number;
  tariffRate?: number;
  leadTime?: number;
  paymentTerms?: string;
  currency?: string;
  discount?: {
    type: string;
    value: number;
    thresholdType: string;
    threshold: number;
  };
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
  customData?: {
    supplierPricingIds?: string[];
  };
}

export interface SupplierData {
  suppliers: Supplier[];
}

export interface RawMaterialData {
  rawMaterials: RawMaterial[];
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
  type: string; // distribution, storage, fulfillment, etc.
  location: WarehouseLocation;
  capacity: WarehouseCapacity;
  suppliers: string[]; // IDs of connected suppliers
  materials: string[]; // Materials stored in this warehouse
  transitTimes: {
    inbound: number; // Average inbound transit time in days
    outbound: number; // Average outbound transit time in days
  };
  operationalCost: number; // Operational cost of the warehouse
}

export interface WarehouseData {
  warehouses: Warehouse[];
}

// Mock data for suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: "sup-001",
    name: "EcoFarm Organics",
    location: {
      address: "123 Green Valley, Sustainable City, CA 94043",
      coordinates: { lat: 37.4219, lng: -122.0841 },
    },
    materials: ["Organic Soybeans", "Organic Wheat"],
    transportMode: "Truck",
    distance: 150,
    transportationDetails: "Regional truck delivery, 2x weekly schedule",
    productionCapacity: "5000 tons/year",
    certifications: ["Organic", "Fair Trade", "Non-GMO"],
    performanceHistory: "98% on-time delivery, 0.5% defect rate",
    environmentalImpact: "Low",
    riskScore: "Low",
    quality: 95,
    contactInfo: {
      name: "Jane Smith",
      email: "jane@ecofarm.com",
      phone: "555-123-4567",
    },
    economicData: {
      reliabilityScore: 92,
      averageLeadTime: 5,
      paymentTerms: "Net-30",
    },
    environmentalData: {
      carbonFootprint: 12.5,
      waterUsage: 800,
      wasteGenerated: 2.3,
      renewableEnergyUse: 75,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sup-002",
    name: "Global Ingredients Co.",
    location: {
      address: "456 Industry Blvd, Metro City, NY 10001",
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
    materials: ["Refined Sugar", "Corn Syrup", "Vanilla Extract"],
    transportMode: "Rail",
    distance: 800,
    transportationDetails: "Rail transport with last-mile delivery by truck",
    productionCapacity: "25000 tons/year",
    certifications: ["ISO 9001", "HACCP"],
    performanceHistory: "95% on-time delivery, 1.2% defect rate",
    environmentalImpact: "Medium",
    riskScore: "Medium",
    quality: 85,
    contactInfo: {
      name: "Robert Johnson",
      email: "robert@globalingredients.com",
      phone: "555-987-6543",
    },
    economicData: {
      reliabilityScore: 85,
      averageLeadTime: 10,
      paymentTerms: "Net-45",
    },
    environmentalData: {
      carbonFootprint: 28.3,
      waterUsage: 1500,
      wasteGenerated: 5.7,
      renewableEnergyUse: 30,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock data for raw materials
export const mockRawMaterials: RawMaterial[] = [
  {
    id: "mat-001",
    name: "Organic Soybeans",
    type: "Grain",
    description: "Non-GMO organic soybeans grown without pesticides",
    suppliers: ["sup-001"],
    quantity: 1000,
    unit: "kg",
    quality: {
      score: 95,
      defectRate: 0.5,
      consistencyScore: 92,
    },
    environmentalData: {
      carbonFootprint: 0.8,
      waterUsage: 500,
      landUse: 2.3,
      biodiversityImpact: "Low",
    },
    economicData: {
      unitCost: 2.5,
      transportationCost: 0.3,
      storageCost: 0.2,
      totalCostPerUnit: 3.0,
    },
  },
  {
    id: "mat-002",
    name: "Refined Sugar",
    type: "Sweetener",
    description: "Refined white sugar from sugar cane",
    suppliers: ["sup-002"],
    quantity: 500,
    unit: "kg",
    quality: {
      score: 90,
      defectRate: 0.2,
      consistencyScore: 95,
    },
    environmentalData: {
      carbonFootprint: 1.2,
      waterUsage: 1200,
      landUse: 1.8,
      biodiversityImpact: "Medium",
    },
    economicData: {
      unitCost: 1.2,
      transportationCost: 0.2,
      storageCost: 0.1,
      totalCostPerUnit: 1.5,
    },
  },
];

// Mock data for warehouses
export const mockWarehouses: Warehouse[] = [
  {
    id: "wh-001",
    name: "Central Distribution Center",
    type: "distribution",
    location: {
      lat: 39.0997,
      lng: -94.5786,
      address: "100 Main St, Kansas City, MO 64105",
    },
    capacity: {
      maxCapacity: 10000,
      currentUtilization: 7500,
      unit: "pallets",
    },
    suppliers: ["sup-001", "sup-002"],
    materials: ["mat-001", "mat-002"],
    transitTimes: {
      inbound: 3,
      outbound: 2,
    },
    operationalCost: 15000,
  },
  {
    id: "wh-002",
    name: "West Coast Fulfillment Center",
    type: "fulfillment",
    location: {
      lat: 34.0522,
      lng: -118.2437,
      address: "200 Broadway, Los Angeles, CA 90012",
    },
    capacity: {
      maxCapacity: 8000,
      currentUtilization: 6000,
      unit: "pallets",
    },
    suppliers: ["sup-002"],
    materials: ["mat-002"],
    transitTimes: {
      inbound: 4,
      outbound: 1,
    },
    operationalCost: 18000,
  },
];

// Initialize in-memory data storage with mock data
const suppliersData: Supplier[] = [...mockSuppliers];
const rawMaterialsData: RawMaterial[] = [...mockRawMaterials];
// We don't need warehousesData anymore since we're using the database

// Read supplier data
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    // Load suppliers from JSON file
    const fs = require("fs");
    const path = require("path");
    const suppliersPath = path.join(
      process.cwd(),
      "frontend/data/suppliers.json"
    );

    if (fs.existsSync(suppliersPath)) {
      console.log("Loading suppliers from JSON file");
      const suppliersData = fs.readFileSync(suppliersPath, "utf8");
      const suppliers = JSON.parse(suppliersData);
      console.log(`Loaded ${suppliers.length} suppliers from JSON file`);
      return suppliers;
    } else {
      console.log("Suppliers JSON file not found, returning empty array");
      return [];
    }
  } catch (error) {
    console.error("Error getting suppliers:", error);
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
    console.log(`Getting supplier with ID: ${id}`);
    const suppliers = await getSuppliers();
    const supplier = suppliers.find((s) => s.id === id);

    if (!supplier) {
      console.log(`Supplier with ID ${id} not found`);
      return null;
    }

    console.log(`Found supplier: ${supplier.name}`);
    return supplier;
  } catch (error) {
    console.error("Error getting supplier by ID:", error);
    throw error;
  }
}

// Read raw material data
export async function getRawMaterials(): Promise<RawMaterial[]> {
  try {
    // Try to get raw materials from the database
    const dbMaterials = await prisma.rawMaterial.findMany({
      include: {
        suppliers: true,
      },
    });
    console.log("Database materials:", dbMaterials);

    const materials = dbMaterials.map(convertDbMaterialToMaterial);
    console.log("Converted materials:", materials);

    // Save to JSON as backup
    await jsonStorage.saveMaterials(materials);

    return materials;
  } catch (error) {
    console.error("Error fetching raw materials from database:", error);
    console.log("Falling back to JSON storage");

    // Fallback to JSON storage if database fails
    return await jsonStorage.loadMaterials();
  }
}

// Add a new supplier
export async function addSupplier(supplierData: any): Promise<Supplier> {
  try {
    console.log("addSupplier called with:", supplierData);

    // Create a properly formatted supplier object for the database
    const dbSupplierData = {
      name: supplierData.name,
      address: supplierData.address,
      coordinates: supplierData.coordinates,
      materials: supplierData.materials || [],
      certifications: supplierData.certifications || [],
      contactInfo: supplierData.contactInfo || {
        name: "",
        email: "",
        phone: "",
      },
      economicData: supplierData.economicData || {
        annualRevenue: 0,
        employeeCount: 0,
        foundedYear: 0,
      },
      environmentalData: supplierData.environmentalData || {
        carbonFootprint: 0,
        wasteManagement: "",
        energyEfficiency: "",
      },
    };

    console.log("Formatted supplier data for database:", dbSupplierData);

    // Add to database
    const dbSupplier = await prisma.supplier.create({
      data: dbSupplierData,
    });

    console.log("Supplier created in database:", dbSupplier);

    // Convert to our type format
    const supplier: Supplier = {
      id: dbSupplier.id,
      name: dbSupplier.name,
      address: dbSupplier.address,
      coordinates: dbSupplier.coordinates as any,
      materials: dbSupplier.materials as string[],
      certifications: dbSupplier.certifications as string[],
      contactInfo: dbSupplier.contactInfo as any,
      economicData: dbSupplier.economicData as any,
      environmentalData: dbSupplier.environmentalData as any,
      createdAt: dbSupplier.createdAt,
      updatedAt: dbSupplier.updatedAt,
    };

    // Update JSON storage
    const suppliers = await jsonStorage.loadSuppliers();
    await jsonStorage.saveSuppliers([...suppliers, supplier]);

    return supplier;
  } catch (error) {
    console.error("Database error in addSupplier:", error);
    throw error;
  }
}

// Update a supplier
export async function updateSupplier(
  id: string,
  data: Partial<Supplier>
): Promise<Supplier> {
  try {
    // Update in database
    const dbSupplier = await prisma.supplier.update({
      where: { id },
      data: convertSupplierToDbSupplier(data),
      include: { rawMaterials: true },
    });

    // Convert to our type format
    const supplier = convertDbSupplierToSupplier(dbSupplier);

    // Update JSON storage
    const suppliers = await jsonStorage.loadSuppliers();
    await jsonStorage.saveSuppliers(
      suppliers.map((s) => (s.id === id ? supplier : s))
    );

    return supplier;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Add a new raw material
export async function addRawMaterial(
  materialData: Omit<RawMaterial, "id">
): Promise<RawMaterial> {
  try {
    // Generate a unique ID for the material
    const id = `mat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the complete material object with all required fields
    const material: RawMaterial = {
      id,
      name: materialData.name,
      type: materialData.type,
      description: materialData.description || "",
      suppliers: materialData.suppliers || [],
      quantity: materialData.quantity || 0,
      unit: materialData.unit || "",
      quality: {
        score: materialData.quality?.score || 0,
        defectRate: materialData.quality?.defectRate || 0,
        consistencyScore: materialData.quality?.consistencyScore || 0,
      },
      environmentalData: {
        carbonFootprint: materialData.environmentalData?.carbonFootprint || 0,
        waterUsage: materialData.environmentalData?.waterUsage || 0,
        landUse: materialData.environmentalData?.landUse || 0,
        biodiversityImpact:
          materialData.environmentalData?.biodiversityImpact || "",
      },
      economicData: {
        unitCost: materialData.economicData?.unitCost || 0,
        transportationCost: materialData.economicData?.transportationCost || 0,
        storageCost: materialData.economicData?.storageCost || 0,
        totalCostPerUnit: materialData.economicData?.totalCostPerUnit || 0,
        // Include additional fields if they exist
        ...(materialData.economicData?.taxRate !== undefined && {
          taxRate: materialData.economicData.taxRate,
        }),
        ...(materialData.economicData?.tariffRate !== undefined && {
          tariffRate: materialData.economicData.tariffRate,
        }),
        ...(materialData.economicData?.leadTime !== undefined && {
          leadTime: materialData.economicData.leadTime,
        }),
        ...(materialData.economicData?.paymentTerms !== undefined && {
          paymentTerms: materialData.economicData.paymentTerms,
        }),
        ...(materialData.economicData?.currency !== undefined && {
          currency: materialData.economicData.currency,
        }),
        ...(materialData.economicData?.discount !== undefined && {
          discount: materialData.economicData.discount,
        }),
      },
    };

    console.log("Attempting to create material:", material);

    try {
      // Try to save to database - store suppliers as part of the material data
      // since we don't have a direct relationship in the schema
      const dbMaterial = await prisma.rawMaterial.create({
        data: {
          id: material.id,
          name: material.name,
          type: material.type,
          description: material.description,
          quantity: material.quantity,
          unit: material.unit,
          quality: material.quality,
          environmentalData: material.environmentalData,
          economicData: material.economicData,
          // We don't need suppliersJson since suppliers are stored in the JSON data
        },
      });

      console.log("Material saved to database:", dbMaterial);
    } catch (dbError) {
      console.error("Failed to save to database:", dbError);
      // Continue with JSON storage even if database fails
    }

    // Save to JSON storage
    const materials = await jsonStorage.loadMaterials();
    materials.push(material);
    await jsonStorage.saveMaterials(materials);
    console.log("Material saved to JSON storage:", material);

    return material;
  } catch (error) {
    console.error("Error in addRawMaterial:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

// Convert a RawMaterial to a database RawMaterial
export function convertMaterialToDbMaterial(
  material: Partial<RawMaterial>
): Record<string, unknown> {
  const dbMaterial: Record<string, unknown> = {};

  if (material.name !== undefined) dbMaterial.name = material.name;
  if (material.type !== undefined) dbMaterial.type = material.type;
  if (material.description !== undefined)
    dbMaterial.description = material.description;
  if (material.quantity !== undefined) dbMaterial.quantity = material.quantity;
  if (material.unit !== undefined) dbMaterial.unit = material.unit;

  // Handle nested objects
  if (material.quality) {
    // Convert to JSON for Prisma
    dbMaterial.quality = material.quality as unknown as Prisma.JsonValue;
  }

  if (material.environmentalData) {
    // Convert to JSON for Prisma
    dbMaterial.environmentalData =
      material.environmentalData as unknown as Prisma.JsonValue;
  }

  if (material.economicData) {
    // Convert to JSON for Prisma
    const economicData = {
      ...((dbMaterial.economicData as Record<string, unknown>) || {}),
      ...material.economicData,
      unitCost: material.economicData.unitCost || 0,
      transportationCost: material.economicData.transportationCost || 0,
      storageCost: material.economicData.storageCost || 0,
      totalCostPerUnit: material.economicData.totalCostPerUnit || 0,
    };
    dbMaterial.economicData = economicData as unknown as Prisma.JsonValue;
  }

  // Handle suppliers array
  if (material.suppliers !== undefined) {
    // Use the correct field name for the database
    dbMaterial.materials = material.suppliers;
  }

  return dbMaterial;
}

// Update a raw material
export async function updateRawMaterial(
  id: string,
  materialData: Partial<RawMaterial>
): Promise<RawMaterial> {
  try {
    console.log("Updating raw material:", id, materialData);

    // Convert to database format
    const dbMaterialData = convertMaterialToDbMaterial(materialData);
    console.log("Converted to DB format:", dbMaterialData);

    // Update in database
    const dbMaterial = await prisma.rawMaterial.update({
      where: { id },
      data: dbMaterialData,
    });
    console.log("Updated in database:", dbMaterial);

    // Convert to our type format
    const material = convertDbMaterialToMaterial(dbMaterial);

    // Update JSON storage
    const materials = await jsonStorage.loadMaterials();
    const updatedMaterials = materials.map((m) =>
      m.id === id ? { ...m, ...materialData } : m
    );
    await jsonStorage.saveMaterials(updatedMaterials);
    console.log("Updated in JSON storage");

    return material;
  } catch (error) {
    console.error("Error in updateRawMaterial:", error);
    throw error;
  }
}

// Delete a supplier
export async function deleteSupplier(id: string): Promise<void> {
  try {
    // Delete from database
    await prisma.supplier.delete({ where: { id } });

    // Update JSON storage
    const suppliers = await jsonStorage.loadSuppliers();
    await jsonStorage.saveSuppliers(suppliers.filter((s) => s.id !== id));
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Delete a raw material
export async function deleteRawMaterial(id: string): Promise<void> {
  try {
    // Delete from database
    await prisma.rawMaterial.delete({ where: { id } });

    // Update JSON storage
    const materials = await jsonStorage.loadMaterials();
    await jsonStorage.saveMaterials(materials.filter((m) => m.id !== id));
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Get warehouses
export async function getWarehouses(): Promise<Warehouse[]> {
  try {
    // Try to get warehouses from the database
    const dbWarehouses = await prisma.warehouse.findMany();

    // Convert to our type format (you'll need to implement this function)
    const warehouses = dbWarehouses.map(convertDbWarehouseToWarehouse);

    // Save to JSON as backup
    await jsonStorage.saveWarehouses(warehouses);

    return warehouses;
  } catch (error) {
    console.error("Error fetching warehouses from database:", error);
    console.log("Falling back to JSON storage");

    // Fallback to JSON storage if database fails
    return await jsonStorage.loadWarehouses();
  }
}

// Add a warehouse
export async function addWarehouse(
  warehouseData: Omit<Warehouse, "id">
): Promise<Warehouse> {
  try {
    // Add to database
    const dbWarehouse = await prisma.warehouse.create({
      data: convertWarehouseToDbWarehouse(warehouseData),
    });

    // Convert to our type format
    const warehouse = convertDbWarehouseToWarehouse(dbWarehouse);

    // Update JSON storage
    const warehouses = await jsonStorage.loadWarehouses();
    await jsonStorage.saveWarehouses([...warehouses, warehouse]);

    return warehouse;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Update a warehouse
export async function updateWarehouse(
  id: string,
  warehouseData: Partial<Warehouse>
): Promise<Warehouse> {
  try {
    // Update in database
    const dbWarehouse = await prisma.warehouse.update({
      where: { id },
      data: convertWarehouseToDbWarehouse(warehouseData),
    });

    // Convert to our type format
    const warehouse = convertDbWarehouseToWarehouse(dbWarehouse);

    // Update JSON storage
    const warehouses = await jsonStorage.loadWarehouses();
    await jsonStorage.saveWarehouses(
      warehouses.map((w) => (w.id === id ? warehouse : w))
    );

    return warehouse;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Delete a warehouse
export async function deleteWarehouse(id: string): Promise<void> {
  try {
    // Delete from database
    await prisma.warehouse.delete({ where: { id } });

    // Update JSON storage
    const warehouses = await jsonStorage.loadWarehouses();
    await jsonStorage.saveWarehouses(warehouses.filter((w) => w.id !== id));
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Get materials by supplier
export async function getMaterialsBySupplier(
  supplierId: string
): Promise<RawMaterial[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const materials = rawMaterialsData.filter((material) =>
        material.suppliers.includes(supplierId)
      );
      resolve(materials);
    }, 300);
  });
}

// Get suppliers by material
export async function getSuppliersByMaterial(
  materialId: string
): Promise<Supplier[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const material = rawMaterialsData.find((m) => m.id === materialId);
      if (!material) {
        resolve([]);
        return;
      }

      const materialSuppliers = suppliersData.filter((supplier) =>
        material.suppliers.includes(supplier.id)
      );
      resolve(materialSuppliers);
    }, 300);
  });
}

// Get supplier material pricing
export async function getSupplierPricing(): Promise<SupplierMaterialPricing[]> {
  try {
    // Try to get pricing from the database
    const dbPricing = await prisma.supplierMaterialPricing.findMany();
    console.log("Database pricing:", dbPricing);

    const pricing = dbPricing.map(convertDbPricingToPricing);
    console.log("Converted pricing:", pricing);

    // Save to JSON as backup
    await jsonStorage.saveSupplierPricing(pricing);

    return pricing;
  } catch (error) {
    console.error("Error fetching supplier pricing from database:", error);
    console.log("Falling back to JSON storage");

    // Fallback to JSON storage if database fails
    return await jsonStorage.loadSupplierPricing();
  }
}

// Add supplier material pricing
export async function addSupplierPricing(
  pricingData: Omit<SupplierMaterialPricing, "id">
): Promise<SupplierMaterialPricing> {
  try {
    // Generate a unique ID
    const id = `smp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the complete pricing object
    const pricing: SupplierMaterialPricing = {
      id,
      ...pricingData,
      volumeDiscounts: pricingData.volumeDiscounts || [],
      priceHistory: pricingData.priceHistory || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Try to save to database first
      const dbPricing = await prisma.supplierMaterialPricing.create({
        data: convertPricingToDbPricing(pricing),
      });
      console.log("Pricing saved to database:", dbPricing);
    } catch (dbError) {
      console.error("Failed to save to database:", dbError);
      // Continue with JSON storage even if database fails
    }

    // Always save to JSON storage as backup
    const pricingList = await jsonStorage.loadSupplierPricing();
    pricingList.push(pricing);
    await jsonStorage.saveSupplierPricing(pricingList);
    console.log("Pricing saved to JSON storage:", pricing);

    return pricing;
  } catch (error) {
    console.error("Error in addSupplierPricing:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add supplier pricing"
    );
  }
}

// Update supplier material pricing
export async function updateSupplierPricing(
  id: string,
  data: Partial<SupplierMaterialPricing>
): Promise<SupplierMaterialPricing> {
  try {
    // Get current pricing
    const currentPricing = await getSupplierPricingById(id);
    if (!currentPricing) {
      throw new Error(`Supplier pricing with ID ${id} not found`);
    }

    // Update the pricing object
    const updatedPricing: SupplierMaterialPricing = {
      ...currentPricing,
      ...data,
      updatedAt: new Date(),
    };

    try {
      // Try to update in database
      await prisma.supplierMaterialPricing.update({
        where: { id },
        data: convertPricingToDbPricing(updatedPricing),
      });
    } catch (dbError) {
      console.error("Failed to update in database:", dbError);
    }

    // Update in JSON storage
    const pricingList = await jsonStorage.loadSupplierPricing();
    const updatedList = pricingList.map((p) =>
      p.id === id ? updatedPricing : p
    );
    await jsonStorage.saveSupplierPricing(updatedList);

    return updatedPricing;
  } catch (error) {
    console.error("Error in updateSupplierPricing:", error);
    throw error;
  }
}

// Delete supplier material pricing
export async function deleteSupplierPricing(id: string): Promise<void> {
  try {
    // Try to delete from database
    try {
      await prisma.supplierMaterialPricing.delete({ where: { id } });
    } catch (dbError) {
      console.error("Failed to delete from database:", dbError);
    }

    // Delete from JSON storage
    const pricingList = await jsonStorage.loadSupplierPricing();
    const updatedList = pricingList.filter((p) => p.id !== id);
    await jsonStorage.saveSupplierPricing(updatedList);
  } catch (error) {
    console.error("Error in deleteSupplierPricing:", error);
    throw error;
  }
}

// Helper function to get pricing by ID
async function getSupplierPricingById(
  id: string
): Promise<SupplierMaterialPricing | null> {
  const pricingList = await jsonStorage.loadSupplierPricing();
  return pricingList.find((p) => p.id === id) || null;
}

// Helper functions for data conversion
function convertDbPricingToPricing(dbPricing: any): SupplierMaterialPricing {
  return {
    id: dbPricing.id,
    supplierId: dbPricing.supplierId,
    materialId: dbPricing.materialId,
    unitPrice: dbPricing.unitPrice,
    currency: dbPricing.currency,
    minOrderQuantity: dbPricing.minOrderQuantity,
    leadTime: dbPricing.leadTime,
    transportCost: dbPricing.transportCost,
    volumeDiscounts: dbPricing.volumeDiscounts || [],
    priceHistory: dbPricing.priceHistory || [],
    lastNegotiation: dbPricing.lastNegotiation
      ? new Date(dbPricing.lastNegotiation)
      : undefined,
    nextReview: dbPricing.nextReview
      ? new Date(dbPricing.nextReview)
      : undefined,
    isPreferred: dbPricing.isPreferred,
    notes: dbPricing.notes,
    createdAt: new Date(dbPricing.createdAt),
    updatedAt: new Date(dbPricing.updatedAt),
  };
}

function convertPricingToDbPricing(
  pricing: Partial<SupplierMaterialPricing>
): any {
  const dbPricing: any = {};

  if (pricing.supplierId) dbPricing.supplierId = pricing.supplierId;
  if (pricing.materialId) dbPricing.materialId = pricing.materialId;
  if (pricing.unitPrice !== undefined) dbPricing.unitPrice = pricing.unitPrice;
  if (pricing.currency) dbPricing.currency = pricing.currency;
  if (pricing.minOrderQuantity !== undefined)
    dbPricing.minOrderQuantity = pricing.minOrderQuantity;
  if (pricing.leadTime !== undefined) dbPricing.leadTime = pricing.leadTime;
  if (pricing.transportCost !== undefined)
    dbPricing.transportCost = pricing.transportCost;
  if (pricing.volumeDiscounts)
    dbPricing.volumeDiscounts = pricing.volumeDiscounts;
  if (pricing.priceHistory) dbPricing.priceHistory = pricing.priceHistory;
  if (pricing.lastNegotiation)
    dbPricing.lastNegotiation = pricing.lastNegotiation;
  if (pricing.nextReview) dbPricing.nextReview = pricing.nextReview;
  if (pricing.isPreferred !== undefined)
    dbPricing.isPreferred = pricing.isPreferred;
  if (pricing.notes) dbPricing.notes = pricing.notes;
  if (pricing.createdAt) dbPricing.createdAt = pricing.createdAt;
  if (pricing.updatedAt) dbPricing.updatedAt = pricing.updatedAt;

  return dbPricing;
}

// Helper functions to convert between our types and database types
function convertDbSupplierToSupplier(dbSupplier: any): Supplier {
  console.log("Converting supplier:", dbSupplier);

  // Create a basic supplier object with required fields
  const supplier: Supplier = {
    id: dbSupplier.id,
    name: dbSupplier.name,
    location: {
      address: dbSupplier.address,
      coordinates: dbSupplier.coordinates || { lat: 0, lng: 0 },
    },
    materials: dbSupplier.materials || [],
    certifications: dbSupplier.certifications || [],
    transportMode: dbSupplier.transportMode,
    distance: dbSupplier.distance,
    transportationDetails: dbSupplier.transportationDetails,
    productionCapacity: dbSupplier.productionCapacity,
    performanceHistory: dbSupplier.performanceHistory,
    environmentalImpact: dbSupplier.environmentalImpact,
    riskScore: dbSupplier.riskScore,
    quality: dbSupplier.quality,
    contactInfo: dbSupplier.contactInfo,
    economicData: dbSupplier.economicData,
    environmentalData: dbSupplier.environmentalData,
    createdAt: dbSupplier.createdAt,
    updatedAt: dbSupplier.updatedAt,
  };

  console.log("Converted supplier:", supplier);
  return supplier;
}

function convertSupplierToDbSupplier(supplier: Partial<Supplier>): any {
  const dbSupplier: any = {};

  if (supplier.name) dbSupplier.name = supplier.name;
  if (supplier.location) {
    dbSupplier.address = supplier.location.address;
    dbSupplier.coordinates = supplier.location.coordinates;
  }
  if (supplier.materials) dbSupplier.materials = supplier.materials;
  if (supplier.transportMode) dbSupplier.transportMode = supplier.transportMode;
  if (supplier.distance) dbSupplier.distance = supplier.distance;
  if (supplier.transportationDetails)
    dbSupplier.transportationDetails = supplier.transportationDetails;
  if (supplier.productionCapacity)
    dbSupplier.productionCapacity = supplier.productionCapacity;
  if (supplier.certifications)
    dbSupplier.certifications = supplier.certifications;
  if (supplier.performanceHistory)
    dbSupplier.performanceHistory = supplier.performanceHistory;
  if (supplier.environmentalImpact)
    dbSupplier.environmentalImpact = supplier.environmentalImpact;
  if (supplier.riskScore) dbSupplier.riskScore = supplier.riskScore;
  if (supplier.quality) dbSupplier.quality = supplier.quality;
  if (supplier.contactInfo) dbSupplier.contactInfo = supplier.contactInfo;
  if (supplier.economicData) dbSupplier.economicData = supplier.economicData;
  if (supplier.environmentalData)
    dbSupplier.environmentalData = supplier.environmentalData;

  return dbSupplier;
}

function convertDbMaterialToMaterial(dbMaterial: any): RawMaterial {
  console.log("Converting material:", dbMaterial);

  // Create a basic material object with required fields
  const material: RawMaterial = {
    id: dbMaterial.id,
    name: dbMaterial.name,
    type: dbMaterial.type,
    description: dbMaterial.description,
    suppliers: dbMaterial.materials
      ? dbMaterial.materials.map((s: any) => s.id)
      : [],
    quantity: dbMaterial.quantity,
    unit: dbMaterial.unit,
    quality: dbMaterial.quality || {
      score: 0,
      defectRate: 0,
      consistencyScore: 0,
    },
    environmentalData: dbMaterial.environmentalData || {
      carbonFootprint: 0,
      waterUsage: 0,
      landUse: 0,
      biodiversityImpact: "",
    },
    economicData: dbMaterial.economicData || {
      unitCost: 0,
      transportationCost: 0,
      storageCost: 0,
      totalCostPerUnit: 0,
    },
  };

  console.log("Converted material:", material);
  return material;
}

// Helper functions for warehouse conversion
function convertDbWarehouseToWarehouse(dbWarehouse: any): Warehouse {
  return {
    id: dbWarehouse.id,
    name: dbWarehouse.name,
    type: dbWarehouse.type,
    location: dbWarehouse.location,
    capacity: dbWarehouse.capacity,
    suppliers: dbWarehouse.suppliers,
    materials: dbWarehouse.materials,
    transitTimes: dbWarehouse.transitTimes,
    operationalCost: dbWarehouse.operationalCost,
  };
}

function convertWarehouseToDbWarehouse(warehouse: Partial<Warehouse>): any {
  const dbWarehouse: any = {};

  if (warehouse.name) dbWarehouse.name = warehouse.name;
  if (warehouse.type) dbWarehouse.type = warehouse.type;
  if (warehouse.location) dbWarehouse.location = warehouse.location;
  if (warehouse.capacity) dbWarehouse.capacity = warehouse.capacity;
  if (warehouse.suppliers) dbWarehouse.suppliers = warehouse.suppliers;
  if (warehouse.materials) dbWarehouse.materials = warehouse.materials;
  if (warehouse.transitTimes) dbWarehouse.transitTimes = warehouse.transitTimes;
  if (warehouse.operationalCost !== undefined)
    dbWarehouse.operationalCost = warehouse.operationalCost;

  return dbWarehouse;
}
