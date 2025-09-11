from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # Core viewsets
    SupplierViewSet,
    MaterialViewSet,
    MaterialCategoryViewSet,
    SupplierMaterialViewSet,
    SupplierAssessmentViewSet,
    OrderViewSet,
    TransportationEmissionViewSet,
    EmissionFactorViewSet,
    
    # Enhanced Material Management viewsets
    CurrencyViewSet,
    TaxRegionViewSet,
    WarehouseViewSet,
    VolumePricingTierViewSet,
    SeasonalPricingViewSet,
    
    # New inventory and capacity management viewsets
    WarehouseInventoryViewSet,
    WarehouseCapacityAlertViewSet,
    
    # Utility API views
    TaxCalculationView,
    GeocodeView,
    EconomicAnalysisViewSet,
)

router = DefaultRouter()

# Core endpoints
router.register(r'suppliers', SupplierViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'material-categories', MaterialCategoryViewSet)
router.register(r'supplier-materials', SupplierMaterialViewSet)
router.register(r'assessments', SupplierAssessmentViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'transportation-emissions', TransportationEmissionViewSet)
router.register(r'emission-factors', EmissionFactorViewSet)

# Enhanced Material Management endpoints
router.register(r'currencies', CurrencyViewSet)
router.register(r'tax-regions', TaxRegionViewSet)
router.register(r'warehouses', WarehouseViewSet)
router.register(r'volume-pricing-tiers', VolumePricingTierViewSet)
router.register(r'seasonal-pricing', SeasonalPricingViewSet)

# Inventory and capacity management endpoints
router.register(r'warehouse-inventory', WarehouseInventoryViewSet)
router.register(r'capacity-alerts', WarehouseCapacityAlertViewSet)

# Additional endpoints
router.register(r'analysis/economic', EconomicAnalysisViewSet, basename='economic-analysis')

app_name = 'suppliers'

urlpatterns = [
    # Router endpoints
    path('', include(router.urls)),
    
    # Utility endpoints
    path('calculate-tax/', TaxCalculationView.as_view(), name='calculate-tax'),
    path('geocode/', GeocodeView.as_view(), name='geocode'),
    
    # Additional warehouse-specific endpoints (handled by actions in WarehouseViewSet)
    # These are provided for documentation purposes - they map to ViewSet actions:
    # GET /warehouses/{id}/performance_metrics/
    # POST /warehouses/{id}/update_monitoring/
    # POST /warehouses/{id}/check_geofence/
    # GET /warehouses/{id}/optimal_suppliers/
    # POST /warehouses/{id}/add_preferred_supplier/
    # DELETE /warehouses/{id}/remove_preferred_supplier/
    # GET /warehouses/monitoring_overview/
] 