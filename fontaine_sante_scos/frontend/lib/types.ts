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
  minOrderQuantity?: number;
  leadTime?: number;
  transportCost?: number;
  volumeDiscounts?: VolumeDiscount[];
  priceHistory?: PriceHistoryEntry[];
  lastNegotiation?: Date;
  nextReview?: Date;
  isPreferred: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
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
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  economicData?: {
    annualRevenue?: number;
    employeeCount?: number;
    foundedYear?: number;
  };
  environmentalData?: {
    carbonFootprint?: number;
    wasteManagement?: string;
    energyEfficiency?: string;
  };
  materialPricing?: SupplierMaterialPricing[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RawMaterial {
  id: string;
  name: string;
  type: string;
  description: string;
  quantity: number;
  unit: string;
  quality: {
    score: number;
    defectRate: number;
    consistencyScore: number;
  };
  environmentalData: {
    carbonFootprint: number;
    waterUsage: number;
    landUse: number;
    biodiversityImpact: string;
  };
  economicData: {
    unitCost: number;
    transportationCost: number;
    storageCost: number;
    totalCostPerUnit: number;
  };
  supplierPricing?: SupplierMaterialPricing[];
  createdAt: Date;
  updatedAt: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
}
