from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User
from .serializers import UserSerializer

class UserRegistrationView(GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
