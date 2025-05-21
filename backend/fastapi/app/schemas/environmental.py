from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EnvironmentalInput(BaseModel):
    supplier_id: str = Field(..., description="Unique identifier for the supplier")
    energy_consumption: float = Field(..., description="Energy consumption in kWh")
    water_usage: float = Field(..., description="Water usage in cubic meters")
    waste_generated: float = Field(..., description="Waste generated in kg")
    carbon_emissions: float = Field(..., description="Direct carbon emissions in kg CO2e")
    recycling_rate: float = Field(..., ge=0, le=100, description="Recycling rate as percentage")
    renewable_energy_usage: float = Field(..., ge=0, le=100, description="Renewable energy usage as percentage")
    environmental_certifications: List[str] = Field(default_factory=list, description="List of environmental certifications")
    
class EnvironmentalAssessment(BaseModel):
    environmental_score: float = Field(..., description="Overall environmental score (0-100)")
    carbon_footprint: float = Field(..., description="Total carbon footprint in metric tons CO2e")
    sustainability_level: str = Field(..., description="Sustainability level (Low/Medium/High)")
    impact_breakdown: Dict[str, Dict[str, float]] = Field(..., description="Detailed impact breakdown by category")
    certification_status: Dict[str, bool] = Field(..., description="Status of environmental certifications")
    recommendations: List[str] = Field(..., description="List of environmental improvement recommendations")
    compliance_status: Dict[str, bool] = Field(..., description="Compliance status for different environmental aspects")
    
class EnvironmentalOutput(BaseModel):
    environmental_score: float = Field(..., description="Overall environmental score (0-100)")
    carbon_footprint: float = Field(..., description="Total carbon footprint in metric tons CO2e")
    sustainability_level: str = Field(..., description="Sustainability level (Low/Medium/High)")
    recommendations: List[str] = Field(..., description="List of environmental improvement recommendations")

class EnvironmentalResponse(BaseModel):
    success: bool = Field(..., description="Whether the calculation was successful")
    data: Optional[EnvironmentalOutput] = Field(None, description="Environmental assessment results")
    error: Optional[str] = Field(None, description="Error message if calculation failed") 