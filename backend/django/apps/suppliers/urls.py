from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'suppliers'

router = DefaultRouter()
router.register('', views.SupplierViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 