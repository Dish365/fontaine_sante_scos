from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class TransportMode(str, Enum):
    TRUCK = "truck"
    TRAIN = "train"
    SHIP = "ship"
    PLANE = "plane"

class VehicleType(str, Enum):
    SMALL_TRUCK = "small_truck"  # < 3.5 tons
    MEDIUM_TRUCK = "medium_truck"  # 3.5-16 tons
    LARGE_TRUCK = "large_truck"  # > 16 tons
    ELECTRIC_VEHICLE = "electric_vehicle"
    HYBRID_VEHICLE = "hybrid_vehicle"

class FuelType(str, Enum):
    DIESEL = "diesel"
    PETROL = "petrol"
    ELECTRIC = "electric"
    HYBRID = "hybrid"
    BIODIESEL = "biodiesel"
    CNG = "cng"  # Compressed Natural Gas

class TransportationInput(BaseModel):
    distance: float = Field(..., description="Distance in kilometers")
    volume: float = Field(..., description="Volume in cubic meters")
    transport_mode: TransportMode = Field(..., description="Mode of transportation")
    vehicle_type: Optional[VehicleType] = Field(None, description="Type of vehicle (required for road transport)")
    fuel_type: Optional[FuelType] = Field(None, description="Type of fuel used")
    load_factor: float = Field(..., ge=0, le=1, description="Load factor (0-1) representing how full the vehicle is")
    return_trip: bool = Field(False, description="Whether to include return trip emissions")
    supplier_id: str = Field(..., description="Unique identifier for the supplier")

class TransportationEmissionFactors(BaseModel):
    base_emission_factor: float = Field(..., description="Base emission factor in kg CO2e per km")
    volume_factor: float = Field(..., description="Volume impact factor")
    load_factor_impact: float = Field(..., description="Load factor impact on emissions")
    fuel_type_multiplier: float = Field(..., description="Multiplier based on fuel type")
    vehicle_type_multiplier: float = Field(..., description="Multiplier based on vehicle type")

class TransportationAssessment(BaseModel):
    total_emissions: float = Field(..., description="Total emissions in kg CO2e")
    emissions_per_km: float = Field(..., description="Emissions per kilometer")
    emissions_per_volume: float = Field(..., description="Emissions per cubic meter")
    transport_efficiency_score: float = Field(..., description="Transport efficiency score (0-100)")
    recommendations: List[str] = Field(..., description="List of transportation optimization recommendations")
    emission_breakdown: Dict[str, float] = Field(..., description="Breakdown of emissions by component")

class TransportationResponse(BaseModel):
    success: bool = Field(..., description="Whether the calculation was successful")
    data: Optional[TransportationAssessment] = Field(None, description="Transportation assessment results")
    error: Optional[str] = Field(None, description="Error message if calculation failed") 