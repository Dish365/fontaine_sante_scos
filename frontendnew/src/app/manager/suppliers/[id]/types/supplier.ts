export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  
  // Capacity Information
  min_supply_capacity: number;
  max_supply_capacity: number;
  current_capacity: number;
  
  // Transportation Information
  transportation_mode: 'road' | 'rail' | 'air' | 'sea' | 'mixed';
  transportation_details: string;
  
  // Environmental Information
  environmental_certification: 'iso14001' | 'iso50001' | 'green_business' | 'carbon_neutral' | 'none';
  carbon_footprint: number | null;
  renewable_energy_usage: number | null;
  waste_management_policy: string;
  environmental_impact_report: string;
  sustainability_goals: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  materials: SupplierMaterial[];
  total_orders: number;
}

export interface SupplierMaterial {
  id: number;
  supplier: number;
  material: Material;
  cost_per_unit: number;
  lead_time: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: number;
  name: string;
  description: string;
  unit: string;
}

export interface TransportationEmission {
  id: number;
  supplier: number;
  distance: number;
  volume: number;
  transport_mode: 'truck' | 'train' | 'ship' | 'plane';
  vehicle_type?: 'small_truck' | 'medium_truck' | 'large_truck' | 'electric_vehicle' | 'hybrid_vehicle';
  fuel_type?: 'diesel' | 'petrol' | 'electric' | 'hybrid' | 'biodiesel' | 'cng';
  load_factor: number;
  return_trip: boolean;
  total_emissions: number;
  emissions_per_km: number;
  emissions_per_volume: number;
  transport_efficiency_score: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierAssessment {
  id: number;
  supplier: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assessment_date: string;
  next_assessment_date: string | null;
  score: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: number;
} 