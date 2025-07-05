from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import Group
from .models import User
from .serializers import UserSerializer, AdminUserRegistrationSerializer, GroupSerializer

class AdminUserViewSet(ModelViewSet):
    """
    Admin-only ViewSet for managing users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserRegistrationSerializer
        return UserSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new user (typically managers)"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # If creating a manager, ensure they have staff access
        if request.data.get('position') == 'Manager':
            user.is_staff = True
            user.save()
            
            # Optionally add to managers group
            managers_group, _ = Group.objects.get_or_create(name='Managers')
            user.groups.add(managers_group)
        
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'is_active': user.is_active})
    
    @action(detail=False, methods=['get'])
    def managers(self, request):
        """Get all managers"""
        managers = self.queryset.filter(groups__name='Managers')
        serializer = self.get_serializer(managers, many=True)
        return Response(serializer.data)

class AdminGroupViewSet(ModelViewSet):
    """
    Admin-only ViewSet for managing groups
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated, IsAdminUser] 