from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'suppliers', views.SupplierViewSet)
router.register(r'materials', views.MaterialViewSet)
router.register(r'supplier-materials', views.SupplierMaterialViewSet)
router.register(r'assessments', views.SupplierAssessmentViewSet)
router.register(r'orders', views.OrderViewSet)

app_name = 'suppliers'

urlpatterns = [
    path('', include(router.urls)),
] 