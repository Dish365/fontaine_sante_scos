from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
import httpx
import asyncio

logger = logging.getLogger(__name__)

class TradeoffMetrics(BaseModel):
    score: float
    weight: float
    weighted_score: float

class TradeoffMatrix(BaseModel):
    economic: TradeoffMetrics
    quality: TradeoffMetrics
    environmental: TradeoffMetrics

class SupplierRecommendation(BaseModel):
    id: int
    name: str
    contact_person: str
    email: str
    city: str
    transportation_mode: str
    environmental_certification: str
    current_capacity: float
    economic_score: float
    quality_score: float
    environmental_score: float
    overall_match_score: float
    match_reason: str

class TradeoffResponse(BaseModel):
    overall_score: float
    balanced_score: float
    risk_level: str
    risk_assessment: str
    tradeoff_matrix: Dict[str, Dict[str, float]]
    recommendations: List[str]
    supplier_recommendations: List[SupplierRecommendation]

class TradeoffEngine:
    """Trade-off analysis engine for multi-criteria supplier assessment"""
    
    def __init__(self):
        self.logger = logger
        self.django_base_url = "http://localhost:8000"  # Django backend URL

    def validate_input(self, data: Dict[str, Any]) -> None:
        """Validate input data"""
        required_fields = ['economic_score', 'quality_score', 'environmental_score']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            raise Exception(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Validate score ranges
        for field in required_fields:
            score = data.get(field, 0)
            if not 0 <= score <= 100:
                raise Exception(f"{field.replace('_', ' ').title()} must be between 0 and 100")
        
        # Validate weights if provided
        if 'weights' in data:
            weights = data['weights']
            required_weights = ['economic', 'quality', 'environmental']
            for weight in required_weights:
                if weight not in weights:
                    raise Exception(f"Missing weight for {weight}")
                if not 0 <= weights[weight] <= 1:
                    raise Exception(f"Weight for {weight} must be between 0 and 1")
            total_weight = sum(weights.values())
            if abs(total_weight - 1) > 0.001:  # Allow small floating point differences
                raise Exception(f"Weights must sum to 1, got {total_weight}")

    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate trade-off metrics for supplier analysis
        
        Args:
            data: Dictionary containing trade-off parameters
            
        Returns:
            Dictionary with calculated trade-off results
        """
        try:
            # Validate input
            self.validate_input(data)
            
            # Extract scores
            economic_score = data.get('economic_score', 0)
            quality_score = data.get('quality_score', 0)
            environmental_score = data.get('environmental_score', 0)
            
            # Extract weights (default to equal weights)
            weights = data.get('weights', {
                'economic': 0.4,
                'quality': 0.3,
                'environmental': 0.3
            })
            
            # Calculate weighted scores
            weighted_economic = economic_score * weights['economic']
            weighted_quality = quality_score * weights['quality']
            weighted_environmental = environmental_score * weights['environmental']
            
            # Calculate overall score
            overall_score = weighted_economic + weighted_quality + weighted_environmental
            
            # Calculate balanced score (penalize large variations)
            scores = [economic_score, quality_score, environmental_score]
            mean_score = sum(scores) / len(scores)
            variations = [(s - mean_score) ** 2 for s in scores]
            penalty = sum(variations) / len(variations)
            balanced_score = overall_score * (1 - penalty / 10000)  # Small penalty for variations
            
            # Generate trade-off matrix
            tradeoff_matrix = {
                'economic': {
                    'score': economic_score,
                    'weight': weights['economic'],
                    'weighted_score': weighted_economic
                },
                'quality': {
                    'score': quality_score,
                    'weight': weights['quality'],
                    'weighted_score': weighted_quality
                },
                'environmental': {
                    'score': environmental_score,
                    'weight': weights['environmental'],
                    'weighted_score': weighted_environmental
                }
            }
            
            # Determine risk level
            if overall_score >= 80:
                risk_level = "Low"
                risk_assessment = "Low risk with strong performance across all criteria"
            elif overall_score >= 60:
                risk_level = "Medium" 
                risk_assessment = "Medium risk with acceptable performance, some improvement needed"
            else:
                risk_level = "High"
                risk_assessment = "High risk with significant performance gaps requiring immediate attention"
            
            # Generate optimization recommendations
            recommendations = []
            
            # Check for significant imbalances
            avg_score = (economic_score + quality_score + environmental_score) / 3
            threshold = 15  # Significant deviation threshold
            
            if abs(economic_score - avg_score) > threshold:
                if economic_score < avg_score:
                    recommendations.append("Focus on improving economic performance")
                else:
                    recommendations.append("Maintain strong economic performance")
                    
            if abs(quality_score - avg_score) > threshold:
                if quality_score < avg_score:
                    recommendations.append("Prioritize quality improvements")
                else:
                    recommendations.append("Maintain high quality standards")
                    
            if abs(environmental_score - avg_score) > threshold:
                if environmental_score < avg_score:
                    recommendations.append("Enhance environmental sustainability")
                else:
                    recommendations.append("Continue strong environmental practices")
            
            # Add general recommendations
            if overall_score < 70:
                recommendations.append("Develop comprehensive improvement strategy")
            elif overall_score < 85:
                recommendations.append("Focus on balanced performance optimization")
            else:
                recommendations.append("Maintain balanced excellence across all criteria")
            
            # Get supplier recommendations
            supplier_recommendations = await self.get_supplier_recommendations(
                economic_score, quality_score, environmental_score, weights
            )
            
            return {
                'overall_score': overall_score,
                'balanced_score': balanced_score,
                'risk_level': risk_level,
                'risk_assessment': risk_assessment,
                'tradeoff_matrix': tradeoff_matrix,
                'recommendations': recommendations,
                'supplier_recommendations': supplier_recommendations
            }
            
        except Exception as e:
            self.logger.error(f"Error in trade-off calculation: {e}")
            raise Exception(f"Trade-off calculation failed: {str(e)}")

    async def get_supplier_recommendations(
        self, 
        target_economic: float, 
        target_quality: float, 
        target_environmental: float,
        weights: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """Get supplier recommendations based on trade-off analysis"""
        try:
            # Simulate supplier scoring based on available data
            # In a real implementation, this would fetch from Django backend
            suppliers = await self.fetch_suppliers_from_django()
            
            if not suppliers:
                return []
            
            recommendations = []
            for supplier in suppliers:
                self.logger.info(f"Processing supplier: {supplier.get('name', 'Unknown')}")
                
                # Calculate dynamic scores based on supplier characteristics AND user preferences
                economic_score = self.calculate_economic_score(supplier, target_economic, weights['economic'])
                quality_score = self.calculate_quality_score(supplier, target_quality, weights['quality'])
                environmental_score = self.calculate_environmental_score(supplier, target_environmental, weights['environmental'])
                
                self.logger.debug(f"Supplier {supplier.get('name')}: Economic={economic_score:.1f}, Quality={quality_score:.1f}, Environmental={environmental_score:.1f}")
                
                # Calculate match score based on how close supplier scores are to target
                match_score = self.calculate_match_score(
                    economic_score, quality_score, environmental_score,
                    target_economic, target_quality, target_environmental,
                    weights
                )
                
                # Generate match reason
                match_reason = self.generate_match_reason(
                    economic_score, quality_score, environmental_score,
                    target_economic, target_quality, target_environmental,
                    weights
                )
                
                recommendations.append({
                    'id': supplier['id'],
                    'name': supplier['name'],
                    'contact_person': supplier['contact_person'],
                    'email': supplier['email'],
                    'city': supplier['city'],
                    'transportation_mode': supplier['transportation_mode'],
                    'environmental_certification': supplier['environmental_certification'],
                    'current_capacity': supplier['current_capacity'],
                    'economic_score': economic_score,
                    'quality_score': quality_score,
                    'environmental_score': environmental_score,
                    'overall_match_score': match_score,
                    'match_reason': match_reason
                })
            
            # Sort by match score (highest first) and return top 5
            recommendations.sort(key=lambda x: x['overall_match_score'], reverse=True)
            return recommendations[:5]
            
        except Exception as e:
            self.logger.error(f"Error getting supplier recommendations: {e}")
            return []

    async def fetch_suppliers_from_django(self) -> List[Dict[str, Any]]:
        """Fetch suppliers from Django backend"""
        self.logger.info(f"Attempting to fetch suppliers from: {self.django_base_url}/api/suppliers/suppliers/")
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Add headers to identify this as internal service request
                headers = {
                    'User-Agent': 'httpx/fastapi-internal-service',
                    'X-Internal-Service': 'fastapi',
                    'Content-Type': 'application/json'
                }
                
                self.logger.info("Making request to Django API...")
                response = await client.get(
                    f"{self.django_base_url}/api/suppliers/suppliers/",
                    headers=headers
                )
                
                self.logger.info(f"Django API response status: {response.status_code}")
                
                if response.status_code == 200:
                    suppliers_data = response.json()
                    self.logger.info(f"Raw suppliers data type: {type(suppliers_data)}")
                    
                    # Handle paginated response if results are in 'results' key
                    if isinstance(suppliers_data, dict) and 'results' in suppliers_data:
                        suppliers_list = suppliers_data['results']
                        self.logger.info(f"Paginated response - extracted {len(suppliers_list)} suppliers")
                    else:
                        suppliers_list = suppliers_data
                        self.logger.info(f"Direct response - {len(suppliers_list)} suppliers")
                    
                    self.logger.info(f"✅ Successfully fetched {len(suppliers_list)} REAL suppliers from Django")
                    if suppliers_list:
                        first_supplier = suppliers_list[0]
                        self.logger.info(f"First supplier: {first_supplier.get('name', 'Unknown')} from {first_supplier.get('city', 'Unknown')}")
                    
                    return suppliers_list
                else:
                    self.logger.error(f"❌ Failed to fetch suppliers: {response.status_code}")
                    self.logger.error(f"Response text: {response.text[:200]}...")
                    return self._get_fallback_suppliers()
                    
        except httpx.TimeoutException:
            self.logger.error("❌ Timeout connecting to Django backend")
            return self._get_fallback_suppliers()
        except Exception as e:
            self.logger.error(f"❌ Error fetching suppliers from Django: {e}")
            self.logger.exception("Full exception traceback:")
            return self._get_fallback_suppliers()

    def _get_fallback_suppliers(self) -> List[Dict[str, Any]]:
        """Return fallback supplier data when Django is unavailable"""
        self.logger.info("Using fallback supplier data")
        return [
            {
                'id': 1,
                'name': 'GreenTech Supplies (Fallback)',
                'contact_person': 'John Smith',
                'email': 'john@greentech.com',
                'city': 'Montreal',
                'transportation_mode': 'road',
                'environmental_certification': 'iso14001',
                'current_capacity': 5000.0
            },
            {
                'id': 2,
                'name': 'EcoFarm Solutions (Fallback)',
                'contact_person': 'Maria Garcia',
                'email': 'maria@ecofarm.com',
                'city': 'Toronto',
                'transportation_mode': 'rail',
                'environmental_certification': 'carbon_neutral',
                'current_capacity': 8000.0
            },
            {
                'id': 3,
                'name': 'Quality Foods Ltd (Fallback)',
                'contact_person': 'David Chen',
                'email': 'david@qualityfoods.com',
                'city': 'Vancouver',
                'transportation_mode': 'mixed',
                'environmental_certification': 'green_business',
                'current_capacity': 12000.0
            }
        ]

    def calculate_economic_score(self, supplier: Dict[str, Any], target_score: float = 70.0, importance_weight: float = 0.4) -> float:
        """Calculate economic score based on supplier characteristics and user preferences"""
        # Base score influenced by user's target preference
        base_score = 40.0 + (target_score * 0.4)  # Scale based on user expectations
        
        # Adjust based on capacity (higher capacity = better economics)
        capacity = supplier.get('current_capacity', 0)
        if isinstance(capacity, str):
            try:
                capacity = float(capacity)
            except (ValueError, TypeError):
                capacity = 0
        
        # Capacity scoring varies based on user's economic priorities
        capacity_factor = importance_weight * 30  # Higher weight = more capacity emphasis
        if capacity > 20000:
            base_score += capacity_factor
        elif capacity > 10000:
            base_score += capacity_factor * 0.8
        elif capacity > 5000:
            base_score += capacity_factor * 0.6
        elif capacity > 1000:
            base_score += capacity_factor * 0.4
        
        # Transportation mode impact (varies with user economic focus)
        transport = supplier.get('transportation_mode', 'road')
        transport_bonus = importance_weight * 15  # More economic focus = more transport impact
        if transport == 'rail':
            base_score += transport_bonus  # Most cost-efficient
        elif transport == 'mixed':
            base_score += transport_bonus * 0.6
        elif transport == 'air':
            base_score -= transport_bonus * 0.8  # Most expensive
        elif transport == 'road':
            base_score += transport_bonus * 0.3  # Moderate cost
        
        # Consider renewable energy usage (lower operational costs)
        renewable_energy = supplier.get('renewable_energy_usage')
        if renewable_energy:
            try:
                renewable_pct = float(renewable_energy)
                energy_bonus = (renewable_pct / 100) * importance_weight * 10
                base_score += energy_bonus
            except (ValueError, TypeError):
                pass
        
        # Material diversification bonus (scales with economic importance)
        material_count = supplier.get('material_count', 0)
        diversification_bonus = importance_weight * 12
        if material_count > 10:
            base_score += diversification_bonus
        elif material_count > 5:
            base_score += diversification_bonus * 0.6
        elif material_count > 2:
            base_score += diversification_bonus * 0.3
        
        # User preference alignment bonus
        if target_score > 80:  # User wants high economic performance
            base_score += 5
        elif target_score < 60:  # User is less focused on economics
            base_score = base_score * 0.9  # Slight penalty
        
        return min(100, max(20, base_score))

    def calculate_quality_score(self, supplier: Dict[str, Any], target_score: float = 75.0, importance_weight: float = 0.3) -> float:
        """Calculate quality score based on supplier characteristics and user quality preferences"""
        # Base score influenced by user's quality expectations
        base_score = 35.0 + (target_score * 0.5)  # Scale based on user's quality requirements
        
        # Environmental certification often correlates with quality standards
        cert = supplier.get('environmental_certification', 'none')
        cert_bonus = importance_weight * 20  # Higher quality focus = more certification impact
        if cert == 'iso14001':
            base_score += cert_bonus * 0.9
        elif cert == 'carbon_neutral':
            base_score += cert_bonus * 0.7
        elif cert == 'green_business':
            base_score += cert_bonus * 0.6
        elif cert == 'iso50001':
            base_score += cert_bonus * 0.8
        elif cert == 'none':
            base_score -= importance_weight * 5  # Penalty scales with quality importance
        
        # Capacity consistency varies with quality focus
        capacity = supplier.get('current_capacity', 0)
        if isinstance(capacity, str):
            try:
                capacity = float(capacity)
            except (ValueError, TypeError):
                capacity = 0
        
        # Quality-focused users prefer mid-range capacities (better control)
        capacity_bonus = importance_weight * 8
        if 5000 <= capacity <= 20000:
            base_score += capacity_bonus  # Sweet spot for quality control
        elif 1000 <= capacity <= 50000:
            base_score += capacity_bonus * 0.6
        elif capacity > 50000:
            base_score -= importance_weight * 3  # Too large might compromise quality
        
        # Assessment scores (weighted by quality importance)
        assessments = supplier.get('assessments', [])
        if assessments:
            try:
                latest_assessment = max(assessments, key=lambda x: x.get('assessment_date', ''))
                assessment_score = latest_assessment.get('score')
                if assessment_score:
                    # Higher quality focus = more weight on actual assessments
                    assessment_weight = 0.2 + (importance_weight * 0.3)
                    base_score = base_score * (1 - assessment_weight) + float(assessment_score) * assessment_weight
            except (ValueError, TypeError, AttributeError):
                pass
        
        # Lead time impact (quality-focused users value reliability)
        avg_lead_time = supplier.get('average_lead_time', 0)
        if avg_lead_time:
            try:
                lead_time = float(avg_lead_time)
                time_bonus = importance_weight * 12
                if lead_time <= 5:  # Very reliable
                    base_score += time_bonus
                elif lead_time <= 10:  # Good reliability
                    base_score += time_bonus * 0.7
                elif lead_time <= 15:  # Moderate
                    base_score += time_bonus * 0.3
                elif lead_time > 20:  # Poor reliability
                    base_score -= time_bonus * 0.5
            except (ValueError, TypeError):
                pass
        
        # User quality expectation alignment
        if target_score > 85:  # High quality expectations
            base_score += 8
        elif target_score < 65:  # Lower quality focus
            base_score = base_score * 0.9
        
        return min(100, max(25, base_score))

    def calculate_environmental_score(self, supplier: Dict[str, Any], target_score: float = 70.0, importance_weight: float = 0.3) -> float:
        """Calculate environmental score based on supplier characteristics and user environmental priorities"""
        # Base score influenced by user's environmental expectations
        base_score = 30.0 + (target_score * 0.6)  # Scale based on user's environmental focus
        
        # Environmental certification impact (scales with user's environmental priority)
        cert = supplier.get('environmental_certification', 'none')
        cert_bonus = importance_weight * 30  # Higher env focus = more certification impact
        if cert == 'carbon_neutral':
            base_score += cert_bonus
        elif cert == 'iso14001':
            base_score += cert_bonus * 0.8
        elif cert == 'iso50001':
            base_score += cert_bonus * 0.75
        elif cert == 'green_business':
            base_score += cert_bonus * 0.6
        elif cert == 'none':
            base_score -= importance_weight * 10  # Penalty scales with environmental importance
        
        # Transportation mode environmental impact (varies with user env priority)
        transport = supplier.get('transportation_mode', 'road')
        transport_factor = importance_weight * 15  # Higher env focus = more transport impact
        if transport == 'rail':
            base_score += transport_factor  # Lowest emissions
        elif transport == 'road':
            base_score += transport_factor * 0.4  # Moderate emissions
        elif transport == 'mixed':
            base_score += transport_factor * 0.6  # Variable emissions
        elif transport == 'sea':
            base_score += transport_factor * 0.8  # Lower emissions
        elif transport == 'air':
            base_score -= transport_factor * 0.8  # Highest emissions
        
        # Renewable energy usage (weighted by environmental importance)
        renewable_energy = supplier.get('renewable_energy_usage')
        if renewable_energy:
            try:
                renewable_pct = float(renewable_energy)
                energy_bonus = (renewable_pct / 100) * importance_weight * 20
                base_score += energy_bonus
            except (ValueError, TypeError):
                pass
        
        # Carbon footprint impact (more important for environmentally-focused users)
        carbon_footprint = supplier.get('carbon_footprint')
        if carbon_footprint:
            try:
                footprint = float(carbon_footprint)
                carbon_factor = importance_weight * 15
                if footprint < 100:  # Very low carbon footprint
                    base_score += carbon_factor
                elif footprint < 300:  # Low carbon footprint
                    base_score += carbon_factor * 0.7
                elif footprint < 500:  # Moderate carbon footprint
                    base_score += carbon_factor * 0.4
                elif footprint < 1000:  # High carbon footprint
                    base_score -= carbon_factor * 0.5
                else:  # Very high carbon footprint
                    base_score -= carbon_factor
            except (ValueError, TypeError):
                pass
        
        # Sustainability goals (bonus scales with environmental priority)
        sustainability_goals = supplier.get('sustainability_goals')
        if sustainability_goals and sustainability_goals.strip():
            base_score += importance_weight * 8  # Bonus for documented goals
        
        # User environmental expectation alignment
        if target_score > 85:  # High environmental expectations
            base_score += 10
        elif target_score < 60:  # Lower environmental focus
            base_score = base_score * 0.85
        
        return min(100, max(20, base_score))

    def calculate_match_score(
        self,
        supplier_economic: float,
        supplier_quality: float, 
        supplier_environmental: float,
        target_economic: float,
        target_quality: float,
        target_environmental: float,
        weights: Dict[str, float]
    ) -> float:
        """Calculate how well supplier matches target profile"""
        
        # Calculate weighted distance from target
        economic_diff = abs(supplier_economic - target_economic)
        quality_diff = abs(supplier_quality - target_quality)
        environmental_diff = abs(supplier_environmental - target_environmental)
        
        # Weighted average of differences (lower is better)
        weighted_diff = (
            economic_diff * weights['economic'] +
            quality_diff * weights['quality'] +
            environmental_diff * weights['environmental']
        )
        
        # Convert to match score (0-100, higher is better)
        match_score = max(0, 100 - weighted_diff)
        
        return match_score

    def generate_match_reason(
        self,
        supplier_economic: float,
        supplier_quality: float,
        supplier_environmental: float,
        target_economic: float,
        target_quality: float,
        target_environmental: float,
        weights: Dict[str, float] = None
    ) -> str:
        """Generate dynamic explanation for why supplier matches the criteria"""
        
        if weights is None:
            weights = {'economic': 0.4, 'quality': 0.3, 'environmental': 0.3}
        
        # Calculate differences and identify strengths
        diffs = {
            'economic': abs(supplier_economic - target_economic),
            'quality': abs(supplier_quality - target_quality),
            'environmental': abs(supplier_environmental - target_environmental)
        }
        
        # Find dimensions where supplier excels
        excellent_matches = []  # < 8 points difference
        good_matches = []       # < 15 points difference
        
        for dim, diff in diffs.items():
            if diff < 8:
                excellent_matches.append(dim)
            elif diff < 15:
                good_matches.append(dim)
        
        # Identify the most important dimension based on weights
        max_weight_dim = max(weights.keys(), key=lambda k: weights[k])
        max_weight_value = weights[max_weight_dim]
        
        # Generate contextual explanations
        if len(excellent_matches) >= 2:
            match_list = " and ".join([f"{dim} performance" for dim in excellent_matches])
            return f"Excellent match with outstanding {match_list}"
        
        elif len(excellent_matches) == 1:
            excellent_dim = excellent_matches[0]
            if excellent_dim == max_weight_dim:
                return f"Perfect alignment in {excellent_dim} performance (your top priority)"
            else:
                return f"Exceptional {excellent_dim} performance with good overall balance"
        
        elif len(good_matches) >= 2:
            if max_weight_dim in good_matches:
                other_matches = [d for d in good_matches if d != max_weight_dim]
                if other_matches:
                    return f"Strong {max_weight_dim} alignment (priority) with good {other_matches[0]} performance"
                else:
                    return f"Well-balanced performance across {max_weight_dim} and quality metrics"
            else:
                match_list = " and ".join(good_matches)
                return f"Good balance in {match_list} performance"
        
        elif len(good_matches) == 1:
            good_dim = good_matches[0]
            if good_dim == max_weight_dim:
                return f"Solid {good_dim} performance matching your priority focus"
            else:
                return f"Strong {good_dim} capabilities with development potential in other areas"
        
        else:
            # No close matches - find best performing dimension
            best_dim = min(diffs.keys(), key=lambda k: diffs[k])
            best_diff = diffs[best_dim]
            
            if best_diff < 25:
                if best_dim == max_weight_dim:
                    return f"Reasonable {best_dim} performance in your priority area with improvement opportunities"
                else:
                    return f"Shows strength in {best_dim} with potential for growth in other dimensions"
            else:
                # Significant gaps - focus on relative strengths
                if max_weight_value > 0.5:  # User has strong preference
                    max_weight_diff = diffs[max_weight_dim]
                    if max_weight_diff < 30:
                        return f"Acceptable {max_weight_dim} performance despite gaps in other areas"
                    else:
                        return f"Potential supplier with development needed in {max_weight_dim} (your priority)"
                else:
                    return f"Balanced supplier profile with growth opportunities across all dimensions"

# Create router instance
router = APIRouter(
    prefix="/tradeoff",
    tags=["tradeoff"]
)

@router.get("/")
async def root():
    return {"message": "Trade-off Assessment Service"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.post("/assess", response_model=TradeoffResponse)
async def assess_tradeoff(data: Dict[str, Any]):
    engine = TradeoffEngine()
    try:
        result = await engine.calculate(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 