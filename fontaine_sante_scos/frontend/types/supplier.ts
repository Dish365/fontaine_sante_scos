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
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  economicData: {
    foundedYear: number;
    annualRevenue: number;
    employeeCount: number;
  };
  environmentalData: {
    carbonFootprint: number;
    wasteManagement: string;
    energyEfficiency: string;
  };
  quality?: number;
  transportMode?: string;
  distance?: number;
  transportationDetails?: string;
  productionCapacity?: string;
  performanceHistory?: string;
  environmentalImpact?: string;
  riskScore?: string;
}
