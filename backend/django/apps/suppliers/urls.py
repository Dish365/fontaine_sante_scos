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
    
    # Utility API views
    TaxCalculationView,
    GeocodeView
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

app_name = 'suppliers'

urlpatterns = [
    # Router endpoints
    path('', include(router.urls)),
    
    # Utility endpoints
    path('calculate-tax/', TaxCalculationView.as_view(), name='calculate-tax'),
    path('geocode/', GeocodeView.as_view(), name='geocode'),
] 