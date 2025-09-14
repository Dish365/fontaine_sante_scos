from fastapi import APIRouter, Depends, HTTPException, Query, Response, Header
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
from ..middleware.auth import verify_token, optional_verify_token
from ..services.django_client import DjangoClient

logger = logging.getLogger(__name__)
django_client = DjangoClient()

class CostBreakdown(BaseModel):
    cost: float
    percentage: float

class CostBreakdownResponse(BaseModel):
    material: CostBreakdown
    transportation: CostBreakdown
    labor: CostBreakdown
    overhead: CostBreakdown

class EconomicResponse(BaseModel):
    economic_score: float
    total_cost: float
    cost_per_unit: float
    roi: float
    total_revenue: float
    cost_breakdown: Dict[str, Dict[str, float]]
    recommendations: List[str]
    score: float  # Add explicit score field for frontend compatibility

class EconomicEngine:
    """Economic analysis engine for supplier cost assessment"""
    
    def __init__(self):
        self.logger = logger

    def validate_input(self, data: Dict[str, Any]) -> None:
        """Validate input data"""
        # Check for minimum required data
        if not data:
            raise Exception("Input data cannot be empty")
        
        # Validate numeric fields if present
        numeric_fields = ['material_cost', 'material_costs', 'transportation_cost', 'transportation_costs', 
                         'labor_cost', 'labor_costs', 'overhead_cost', 'overhead_costs', 'tax_rate', 
                         'volume', 'capacity', 'revenue', 'selling_price']
        
        for field in numeric_fields:
            if field in data:
                try:
                    float(data[field])
                except (ValueError, TypeError):
                    raise Exception(f"{field} must be a valid number")
                
                if data[field] < 0:
                    raise Exception(f"{field} cannot be negative")

    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate economic metrics for supplier analysis
        
        Args:
            data: Dictionary containing economic parameters
            
        Returns:
            Dictionary with calculated economic results
        """
        try:
            # Validate input
            self.validate_input(data)
            
            # Extract economic parameters with proper keys
            material_cost = float(data.get('material_costs', data.get('material_cost', 0)))
            transportation_cost = float(data.get('transportation_costs', data.get('transportation_cost', 0)))
            labor_cost = float(data.get('labor_costs', data.get('labor_cost', 0)))
            overhead_cost = float(data.get('overhead_costs', data.get('overhead_cost', 0)))
            tax_rate = float(data.get('tax_rate', 0))
            volume = float(data.get('volume', 1))
            capacity = float(data.get('capacity', 100))  # Default to 100%
            selling_price = float(data.get('selling_price', 0))
            revenue = float(data.get('revenue', selling_price * volume))
            
            # Calculate total cost
            total_cost = (
                material_cost +
                transportation_cost +
                labor_cost +
                overhead_cost
            )
            
            # Ensure we don't have zero total cost
            if total_cost == 0:
                total_cost = 1  # Set to 1 to avoid division by zero
            
            # Apply tax
            total_cost_with_tax = total_cost * (1 + tax_rate / 100)
            
            # Calculate cost per unit (avoid division by zero)
            cost_per_unit = total_cost_with_tax / max(volume, 1)
            
            # Calculate economic score (0-100)
            # Lower cost per unit and higher capacity utilization = better score
            cost_score = max(0, min(100, (1 - cost_per_unit / 1000) * 100))
            capacity_score = min(100, max(0, capacity))  # Ensure capacity score is between 0-100
            economic_score = (cost_score * 0.7 + capacity_score * 0.3)
            
            # Calculate ROI (avoid division by zero)
            roi = ((revenue - total_cost_with_tax) / max(total_cost_with_tax, 1) * 100)
            
            # Generate cost breakdown (avoid division by zero)
            cost_breakdown = {
                'material': {
                    'cost': material_cost,
                    'percentage': (material_cost / total_cost * 100)
                },
                'transportation': {
                    'cost': transportation_cost,
                    'percentage': (transportation_cost / total_cost * 100)
                },
                'labor': {
                    'cost': labor_cost,
                    'percentage': (labor_cost / total_cost * 100)
                },
                'overhead': {
                    'cost': overhead_cost,
                    'percentage': (overhead_cost / total_cost * 100)
                }
            }
            
            # Generate recommendations
            recommendations = []
            if cost_per_unit > 800:
                recommendations.append("Consider cost reduction strategies")
            if capacity < 70:
                recommendations.append("Improve capacity utilization")
            if total_cost > 0 and transportation_cost / total_cost > 0.3:
                recommendations.append("Optimize transportation routes")
            if roi < 15:
                recommendations.append("Review pricing strategy")
            
            if not recommendations:
                recommendations.append("Maintain current cost efficiency")
            
            # Calculate profit margin
            profit_margin = ((revenue - total_cost_with_tax) / revenue * 100) if revenue > 0 else 0
            
            return {
                'economic_score': economic_score,
                'total_costs': total_cost_with_tax,
                'cost_per_unit': cost_per_unit,
                'roi': roi,
                'total_revenue': revenue,
                'profit_margin': profit_margin,
                'cost_breakdown': cost_breakdown,
                'recommendations': recommendations
            }
            
        except Exception as e:
            self.logger.error(f"Error in economic calculation: {e}")
            raise Exception(f"Economic calculation failed: {str(e)}")

# Create router instance
router = APIRouter(
    prefix="/economic",
    tags=["economic"]
)

@router.get("/")
async def root():
    return {"message": "Economic Assessment Service"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/debug")
async def debug_connection(token: Optional[str] = Depends(optional_verify_token)):
    """Debug endpoint to test basic connectivity"""
    try:
        return {
            "status": "ok",
            "message": "FastAPI Economic service is running",
            "timestamp": "2025-01-17",
            "auth_status": "authenticated" if token else "public",
            "endpoints": [
                "/economic/",
                "/economic/health",
                "/economic/debug",
                "/economic/analysis-summary",
                "/economic/assess"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis-summary")
async def get_economic_summary(token: Optional[str] = Depends(optional_verify_token)):
    """Get economic analysis summary for dashboard"""
    try:
        return {
            "success": True,
            "summary": {
                "total_suppliers": 2,
                "total_materials": 4,  # Add total materials count
                "average_economic_score": 85.2,
                "cost_statistics": {
                    "total_material_cost": 15000,
                    "average_cost_per_unit": 12.5,
                    "min_cost": 8.0,
                    "max_cost": 20.0
                },
                "transportation_distribution": {
                    "road": 1,
                    "rail": 1
                },
                "analysis_timestamp": None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze-suppliers")
async def analyze_suppliers(
    order_volume: Optional[float] = Query(1000, description="Order volume for calculations"),
    warehouse_id: Optional[int] = Query(None, description="Warehouse ID for calculations"),
    authorization: Optional[str] = Header(None)
):
    """Analyze economic performance of all suppliers"""
    try:
        # Extract token from authorization header
        token = None
        if authorization and authorization.startswith('Bearer '):
            token = authorization.split(' ')[1]
        
        # Fetch real supplier data from Django
        suppliers_data = await django_client.get_suppliers(token)
        warehouses = await django_client.get_warehouses(token)
        
        if not suppliers_data:
            return {
                "success": False,
                "error": "No suppliers found or authentication failed",
                "analysis_parameters": {
                    "order_volume": order_volume,
                    "warehouse_id": warehouse_id,
                    "warehouse_name": "Default Warehouse"
                },
                "overall_statistics": {
                    "total_suppliers_analyzed": 0,
                    "average_score": 0,
                    "best_score": 0,
                    "worst_score": 0,
                    "average_total_cost": 0,
                    "lowest_cost": 0,
                    "highest_cost": 0,
                    "cost_range": 0
                },
                "supplier_analyses": [],
                "recommendations": {
                    "top_economic_performer": None,
                    "cost_optimization_opportunities": []
                }
            }
        
        # Get warehouse name if ID provided
        warehouse_name = None
        if warehouse_id:
            matching_warehouses = [w for w in warehouses if w['id'] == warehouse_id]
            if matching_warehouses:
                warehouse_name = matching_warehouses[0]['name']
        
        # Process each supplier
        supplier_analyses = []
        for supplier in suppliers_data:
            try:
                # Get supplier materials
                materials = await django_client.get_supplier_materials(supplier['id'], token)
                
                # Calculate costs based on real data - ensure proper type conversion
                material_costs = 0.0
                if materials:
                    for material in materials:
                        cost_per_unit = float(material.get('base_cost_per_unit', 0))
                        material_costs += cost_per_unit * float(order_volume)
                
                # Ensure all cost calculations use float values
                transportation_costs = float(supplier.get('transportation_cost', material_costs * 0.1))
                labor_costs = float(supplier.get('labor_cost', material_costs * 0.2))
                overhead_costs = float(supplier.get('overhead_cost', material_costs * 0.1))
                
                # Calculate tax based on supplier's region
                tax_rate = 0.15  # Default tax rate
                tax_amount = (material_costs + transportation_costs + labor_costs + overhead_costs) * tax_rate
                
                # Calculate total cost
                total_cost = material_costs + transportation_costs + labor_costs + overhead_costs + tax_amount
                
                # Calculate cost per unit
                cost_per_unit = total_cost / float(order_volume) if order_volume > 0 else 0.0
                
                # Calculate capacity utilization - ensure proper type conversion
                max_capacity = float(supplier.get('max_supply_capacity', 10000))
                current_capacity = float(supplier.get('current_capacity', max_capacity * 0.7))
                capacity_utilization = current_capacity / max_capacity if max_capacity > 0 else 0.0
                
                # Calculate economic score
                baseline_cost = 10.0
                efficiency_score = max(0.0, min(100.0, (baseline_cost - cost_per_unit) / baseline_cost * 100))
                utilization_bonus = capacity_utilization * 20.0
                economic_score = min(100.0, efficiency_score + utilization_bonus)
                
                # Calculate ROI
                revenue_estimate = total_cost * 1.2
                roi = ((revenue_estimate - total_cost) / total_cost * 100) if total_cost > 0 else 0.0
                
                # Create supplier analysis entry with proper coordinate handling
                coordinates = [None, None]
                if supplier.get('latitude') and supplier.get('longitude'):
                    try:
                        coordinates = [float(supplier['latitude']), float(supplier['longitude'])]
                    except (ValueError, TypeError):
                        coordinates = [None, None]
                
                # Create supplier analysis entry
                supplier_analysis = {
                    "supplier_id": supplier['id'],
                    "supplier_name": supplier['name'],
                    "supplier_info": {
                        "contact_person": supplier.get('contact_person', ''),
                        "email": supplier.get('email', ''),
                        "city": supplier.get('city', ''),
                        "transportation_mode": supplier.get('transportation_mode', 'road'),
                        "environmental_certification": supplier.get('environmental_certification', ''),
                        "current_capacity": current_capacity,
                        "coordinates": coordinates
                    },
                    "economic_analysis": {
                        "score": float(economic_score),
                        "total_cost": float(total_cost),
                        "cost_breakdown": {
                            "material": float(material_costs),
                            "transportation": float(transportation_costs),
                            "labor": float(labor_costs),
                            "overhead": float(overhead_costs),
                            "tax": float(tax_amount)
                        },
                        "cost_per_unit": float(cost_per_unit),
                        "roi": float(roi),
                        "recommendations": [
                            "Optimize transportation routes" if transportation_costs > material_costs * 0.3 else None,
                            "Consider increasing order volume for better rates" if order_volume < max_capacity * 0.5 else None,
                            "Review supplier capacity utilization" if capacity_utilization < 0.6 else None,
                            "Maintain current cost efficiency" if economic_score > 80 else "Consider cost reduction strategies"
                        ]
                    },
                    "input_parameters": {
                        "material_cost": float(material_costs),
                        "transportation_cost": float(transportation_costs),
                        "labor_cost": float(labor_costs),
                        "overhead_cost": float(overhead_costs),
                        "tax_rate": float(tax_rate),
                        "volume": float(order_volume),
                        "lead_time": max((m.get('lead_time', 7) for m in materials), default=7) if materials else 7
                    },
                    "material_details": [
                        {
                            "material_name": m.get('material_name', ''),
                            "base_cost_per_unit": float(m.get('base_cost_per_unit', 0)),
                            "current_price": float(m.get('current_price', m.get('base_cost_per_unit', 0))),
                            "price_with_tax": float(m.get('price_with_tax', float(m.get('base_cost_per_unit', 0)) * (1 + tax_rate))),
                            "lead_time": int(m.get('lead_time', 7)),
                            "currency_code": m.get('currency_code', 'CAD')
                        }
                        for m in materials
                    ]
                }
                
                # Clean up recommendations list
                supplier_analysis['economic_analysis']['recommendations'] = [
                    r for r in supplier_analysis['economic_analysis']['recommendations'] 
                    if r is not None
                ]
                
                supplier_analyses.append(supplier_analysis)
                
            except Exception as e:
                # Log error for this supplier but continue with others
                print(f"Error processing supplier {supplier.get('name', 'Unknown')}: {str(e)}")
                continue
        
        # Calculate overall statistics with proper error handling
        if supplier_analyses:
            try:
                scores = [s['economic_analysis']['score'] for s in supplier_analyses]
                costs = [s['economic_analysis']['total_cost'] for s in supplier_analyses]
                
                avg_score = sum(scores) / len(scores)
                best_score = max(scores)
                worst_score = min(scores)
                avg_cost = sum(costs) / len(costs)
                lowest_cost = min(costs)
                highest_cost = max(costs)
                cost_range = highest_cost - lowest_cost
            except Exception as e:
                print(f"Error calculating statistics: {str(e)}")
                avg_score = best_score = worst_score = avg_cost = lowest_cost = highest_cost = cost_range = 0.0
        else:
            avg_score = best_score = worst_score = avg_cost = lowest_cost = highest_cost = cost_range = 0.0
        
        # Clean up recommendations
        cost_optimization_opportunities = [
            "Consider bulk ordering for volume discounts" if any(s['economic_analysis']['cost_per_unit'] > avg_cost/order_volume for s in supplier_analyses) else None,
            "Evaluate transportation mode efficiency" if any(s['economic_analysis']['cost_breakdown']['transportation'] > s['economic_analysis']['cost_breakdown']['material'] * 0.3 for s in supplier_analyses) else None,
            "Review supplier geographic distribution" if warehouse_id and any(not s['supplier_info']['coordinates'][0] for s in supplier_analyses) else None,
            "Implement just-in-time delivery to reduce storage costs" if any(s['economic_analysis']['cost_breakdown']['overhead'] > s['economic_analysis']['cost_breakdown']['material'] * 0.15 for s in supplier_analyses) else None
        ]
        
        return {
            "success": True,
            "analysis_parameters": {
                "order_volume": float(order_volume),
                "warehouse_id": warehouse_id,
                "warehouse_name": warehouse_name or "Default Warehouse"
            },
            "overall_statistics": {
                "total_suppliers_analyzed": len(supplier_analyses),
                "average_score": float(avg_score),
                "best_score": float(best_score),
                "worst_score": float(worst_score),
                "average_total_cost": float(avg_cost),
                "lowest_cost": float(lowest_cost),
                "highest_cost": float(highest_cost),
                "cost_range": float(cost_range)
            },
            "supplier_analyses": supplier_analyses,
            "recommendations": {
                "top_economic_performer": max(supplier_analyses, key=lambda x: x['economic_analysis']['score']) if supplier_analyses else None,
                "cost_optimization_opportunities": [r for r in cost_optimization_opportunities if r is not None]
            }
        }
    except Exception as e:
        print(f"Error in analyze_suppliers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assess", response_model=EconomicResponse)
async def assess_economic(data: Dict[str, Any], token: str = Depends(verify_token)):
    """Protected endpoint that requires authentication"""
    engine = EconomicEngine()
    try:
        result = await engine.calculate(data)
        result["score"] = result["economic_score"]  # Add score field for frontend compatibility
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 