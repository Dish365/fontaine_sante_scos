from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet,
    MaterialViewSet,
    SupplierMaterialViewSet,
    SupplierAssessmentViewSet,
    OrderViewSet,
    TransportationEmissionViewSet,
    EmissionFactorViewSet
)

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'supplier-materials', SupplierMaterialViewSet)
router.register(r'assessments', SupplierAssessmentViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'transportation-emissions', TransportationEmissionViewSet)
router.register(r'emission-factors', EmissionFactorViewSet)

app_name = 'suppliers'

urlpatterns = [
    path('', include(router.urls)),
] 