// Define types that match the JSON structure in the data files

export interface JsonRawMaterial {
  material_id: string;
  name: string;
  type: string;
  description: string;
  supplier_id: string[];
  unit: string;
  // Add other fields as needed
}

export interface JsonSupplier {
  supplier_id: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  material_id: string[];
  transportMode: string[];
  productionCapacity: string;
  quality: {
    certifications: string[];
    lastAudit: string;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  // Add other fields as needed
}

// Simplified pricing structure for JSON storage
export interface JsonSupplierMaterialPricing {
  id: string;
  supplier_id: string;
  material_id: string;
  price: number;
  currency: string;
  lead_time: string;
  lead_time_unit: string;
  moq: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

// Helper functions to convert between JSON format and application types
import { RawMaterial, Supplier } from "@/types/types";

// Define a simplified pricing type for use in the application
export interface SimplifiedSupplierPricing {
  id: string;
  supplierId: string;
  materialId: string;
  price: number;
  currency: string;
  leadTime: string;
  leadTimeUnit: string;
  moq: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export function convertJsonToRawMaterial(
  jsonMaterial: JsonRawMaterial
): RawMaterial {
  return {
    id: jsonMaterial.material_id,
    name: jsonMaterial.name,
    type: jsonMaterial.type,
    description: jsonMaterial.description,
    suppliers: jsonMaterial.supplier_id,
    quantity: 0, // Default value
    unit: jsonMaterial.unit,
    quality: {
      score: 0,
      defectRate: 0,
      consistencyScore: 0,
    },
    environmentalData: {
      carbonFootprint: 0,
      waterUsage: 0,
      landUse: 0,
      biodiversityImpact: "",
    },
    economicData: {
      unitCost: 0,
      transportationCost: 0,
      storageCost: 0,
      totalCostPerUnit: 0,
    },
  };
}

export function convertRawMaterialToJson(
  material: RawMaterial
): JsonRawMaterial {
  return {
    material_id: material.id,
    name: material.name,
    type: material.type,
    description: material.description,
    supplier_id: material.suppliers,
    unit: material.unit,
  };
}

export function convertJsonToSupplier(jsonSupplier: JsonSupplier): Supplier {
  return {
    id: jsonSupplier.supplier_id,
    name: jsonSupplier.name,
    location: jsonSupplier.location,
    materials: jsonSupplier.material_id,
    transportMode: Array.isArray(jsonSupplier.transportMode)
      ? jsonSupplier.transportMode.join(", ")
      : String(jsonSupplier.transportMode),
    certifications: jsonSupplier.quality.certifications || [],
    productionCapacity: jsonSupplier.productionCapacity,
    contactInfo: jsonSupplier.contactInfo,
    quality: {
      score: 0,
      certifications: jsonSupplier.quality.certifications || [],
      lastAudit: jsonSupplier.quality.lastAudit,
    },
    economicData: {
      foundedYear: 0,
      annualRevenue: 0,
      employeeCount: 0,
    },
    environmentalData: {
      carbonFootprint: 0,
      wasteManagement: "",
      energyEfficiency: "",
    },
    distance: null,
    transportationDetails: "",
    performanceHistory: "",
    riskScore: 0,
  };
}

export function convertSupplierToJson(supplier: Supplier): JsonSupplier {
  return {
    supplier_id: supplier.id,
    name: supplier.name,
    location: supplier.location,
    material_id: supplier.materials,
    transportMode: supplier.transportMode
      ? supplier.transportMode.split(", ")
      : [],
    productionCapacity: supplier.productionCapacity || "",
    quality: {
      certifications: supplier.certifications || [],
      lastAudit: supplier.quality?.lastAudit || new Date().toISOString(),
    },
    contactInfo: supplier.contactInfo,
  };
}

// Helper functions for simplified supplier material pricing
export function convertJsonToSimplifiedPricing(
  jsonPricing: JsonSupplierMaterialPricing
): SimplifiedSupplierPricing {
  return {
    id: jsonPricing.id,
    supplierId: jsonPricing.supplier_id,
    materialId: jsonPricing.material_id,
    price: jsonPricing.price,
    currency: jsonPricing.currency,
    leadTime: jsonPricing.lead_time,
    leadTimeUnit: jsonPricing.lead_time_unit,
    moq: jsonPricing.moq,
    unit: jsonPricing.unit,
    createdAt: new Date(jsonPricing.created_at),
    updatedAt: new Date(jsonPricing.updated_at),
  };
}

export function convertSimplifiedPricingToJson(
  pricing: SimplifiedSupplierPricing
): JsonSupplierMaterialPricing {
  return {
    id: pricing.id,
    supplier_id: pricing.supplierId,
    material_id: pricing.materialId,
    price: pricing.price,
    currency: pricing.currency,
    lead_time: pricing.leadTime,
    lead_time_unit: pricing.leadTimeUnit,
    moq: pricing.moq,
    unit: pricing.unit,
    created_at: pricing.createdAt.toISOString(),
    updated_at: pricing.updatedAt.toISOString(),
  };
}

// Route JSON type definition
export interface JsonRoute {
  route_id: string;
  warehouse_id: string;
  supplier_id: string;
  transport: {
    mode: string;
    cost: number;
    environmental_impact: {
      co2_emissions: number;
      unit: string;
    };
    time_taken: {
      value: number;
      unit: string;
    };
    distance: number;
  };
}

import { Route } from "@/types/types";

export function convertJsonToRoute(jsonRoute: JsonRoute): Route {
  return {
    id: jsonRoute.route_id,
    warehouseId: jsonRoute.warehouse_id,
    supplierId: jsonRoute.supplier_id,
    transport: {
      mode: jsonRoute.transport.mode,
      cost: jsonRoute.transport.cost,
      environmentalImpact: {
        co2Emissions: jsonRoute.transport.environmental_impact.co2_emissions,
        unit: jsonRoute.transport.environmental_impact.unit,
      },
      timeTaken: {
        value: jsonRoute.transport.time_taken.value,
        unit: jsonRoute.transport.time_taken.unit,
      },
      distance: jsonRoute.transport.distance,
    },
  };
}

export function convertRouteToJson(route: Route): JsonRoute {
  return {
    route_id: route.id,
    warehouse_id: route.warehouseId,
    supplier_id: route.supplierId,
    transport: {
      mode: route.transport.mode,
      cost: route.transport.cost,
      environmental_impact: {
        co2_emissions: route.transport.environmentalImpact.co2Emissions,
        unit: route.transport.environmentalImpact.unit,
      },
      time_taken: {
        value: route.transport.timeTaken.value,
        unit: route.transport.timeTaken.unit,
      },
      distance: route.transport.distance,
    },
  };
}

// Warehouse JSON type definition
export interface JsonWarehouse {
  warehouse_id: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  capacity: number;
  utilization: number;
}

import { Warehouse } from "@/types/types";

export function convertJsonToWarehouse(
  jsonWarehouse: JsonWarehouse
): Warehouse {
  return {
    id: jsonWarehouse.warehouse_id,
    name: jsonWarehouse.name,
    location: jsonWarehouse.location,
    capacity: jsonWarehouse.capacity,
    utilization: jsonWarehouse.utilization,
    environmentalData: {
      energyEfficiency: 0,
      wasteManagement: "",
      carbonFootprint: 0,
    },
  };
}

export function convertWarehouseToJson(warehouse: Warehouse): JsonWarehouse {
  return {
    warehouse_id: warehouse.id,
    name: warehouse.name,
    location: warehouse.location,
    capacity: warehouse.capacity,
    utilization: warehouse.utilization,
  };
}
