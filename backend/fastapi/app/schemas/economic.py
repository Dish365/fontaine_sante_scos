from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SupplierCostInput(BaseModel):
    supplier_id: int = Field(..., description="Unique identifier for the supplier")
    material_cost: float = Field(..., gt=0, description="Cost of raw materials")
    transportation_cost: float = Field(..., gt=0, description="Transportation and logistics costs")
    tax_rate: float = Field(..., ge=0, le=1, description="Tax rate as a decimal")
    capacity: float = Field(..., gt=0, description="Supplier capacity")
    labor_cost: float = Field(..., gt=0, description="Cost of labor")
    overhead_cost: float = Field(..., gt=0, description="Overhead costs")
    volume: float = Field(..., gt=0, description="Order volume")
    lead_time: int = Field(..., gt=0, description="Lead time in days")
    
class EconomicScoreOutput(BaseModel):
    supplier_id: int = Field(..., description="Unique identifier for the supplier")
    score: float = Field(..., description="Economic performance score")
    cost_breakdown: Dict[str, float] = Field(..., description="Breakdown of costs by category")
    recommendations: List[str] = Field(..., description="Cost optimization recommendations")
    total_cost: float = Field(..., description="Total cost of the supply chain")
    cost_per_unit: float = Field(..., description="Cost per unit")
    roi: float = Field(..., description="Return on investment")
    
class OptimizationResult(BaseModel):
    optimal_allocation: Dict[int, float] = Field(..., description="Optimal allocation of orders to suppliers")
    total_cost: float = Field(..., description="Total optimized cost")
    savings_potential: float = Field(..., description="Potential cost savings")
    optimal_suppliers: List[Dict[str, Any]] = Field(..., description="List of optimal suppliers")
    optimization_details: Dict[str, Any] = Field(..., description="Detailed optimization results") 