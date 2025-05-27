import httpx
from django.conf import settings
from typing import Dict, Any, Optional
from apps.users.models import User
from apps.users.serializers import UserSerializer

class UserService:
    def __init__(self):
        self.fastapi_base_url = settings.FASTAPI_BASE_URL
        self.client = httpx.AsyncClient(base_url=self.fastapi_base_url)
    
    async def get_user_analytics(self, user_id: int) -> Dict[str, Any]:
        """
        Get user analytics from FastAPI
        """
        try:
            response = await self.client.get(
                f"/api/users/{user_id}/analytics"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise Exception(f"Error getting user analytics: {str(e)}")
    
    async def calculate_user_performance(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate user performance metrics using FastAPI
        """
        try:
            response = await self.client.post(
                "/api/users/calculate-performance",
                json=user_data
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise Exception(f"Error calculating user performance: {str(e)}")
    
    async def get_user_activity_history(self, user_id: int) -> Dict[str, Any]:
        """
        Get user activity history with analytics
        """
        # Get user from Django
        user = User.objects.get(id=user_id)
        user_data = UserSerializer(user).data
        
        # Get analytics from FastAPI
        analytics = await self.get_user_analytics(user_id)
        
        return {
            "user": user_data,
            "analytics": analytics
        }
    
    async def close(self):
        """
        Close the HTTP client
        """
        await self.client.aclose() 