from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'assessments'

router = DefaultRouter()
router.register('', views.AssessmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 