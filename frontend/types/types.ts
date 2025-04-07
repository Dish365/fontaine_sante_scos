export interface VolumeDiscount {
  quantity: number;
  discountPercentage: number;
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
}

export interface SupplierMaterialPricing {
  id: string;
  supplierId: string;
  materialId: string;
  unitPrice: number;
  currency: string;
  minOrderQuantity: number;
  maxOrderQuantity: number | null;
  quantityUnit: string;
  leadTimeInDays: number;
  discountThreshold: number | null;
  discountRate: number | null;
  taxRate: number;
  customsRate: number | null;
  effectiveStartDate: Date | string;
  effectiveEndDate: Date | string | null;
  paymentTerms: string;
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Supplier {
  id: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  materials: string[];
  certifications: string[];
  transportMode: string;
  distance: number | null;
  transportationDetails: string;
  productionCapacity: string;
  leadTime: number;
  operatingHours: string;
  performanceHistory: string;
  riskScore: number;
  quality: {
    score: number;
    certifications: string[];
    lastAudit: string;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  economicData: {
    foundedYear: number;
    annualRevenue: number;
    employeeCount: number;
    materialCosts: number;
    transportationCosts: number;
    storageCosts: number;
    totalCost: number;
    costPerUnit: number;
  };
  environmentalData: {
    carbonFootprint: number;
    wasteManagement: string;
    energyEfficiency: string;
    waterUsage: number;
    emissions: number;
  };
}

export interface RawMaterial {
  id: string;
  name: string;
  type: string;
  description: string;
  quantity: number;
  unit: string;
  suppliers: string[];
  quality: MaterialQuality;
  environmentalData: MaterialEnvironmentalData;
  economicData: MaterialEconomicData;
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
}

export interface WarehouseLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface WarehouseCapacity {
  maxCapacity: number;
  currentUtilization: number;
  unit: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  capacity: number;
  capacityUnit: string;
  utilizationRate: number;
  handlingCapacity: number;
  operatingHours: string;
  specialFeatures: string[];
}

export interface GeocodingResponse {
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }[];
  status: string;
}

export interface Route {
  id: string;
  warehouseId: string;
  supplierId: string;
  transport: {
    mode: string;
    cost: number;
    environmentalImpact: {
      co2Emissions: number;
      unit: string;
    };
    timeTaken: {
      value: number;
      unit: string;
    };
    distance: number;
  };
}
