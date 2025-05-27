import httpx
from django.conf import settings
from typing import Dict, Any, Optional

class BaseService:
    def __init__(self):
        self.fastapi_base_url = settings.FASTAPI_BASE_URL
        self.client = httpx.AsyncClient(base_url=self.fastapi_base_url)
    
    async def make_request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Make a request to FastAPI with error handling
        """
        try:
            response = await self.client.request(
                method=method,
                url=endpoint,
                json=data
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise Exception(f"Error communicating with FastAPI: {str(e)}")
    
    async def close(self):
        """
        Close the HTTP client
        """
        await self.client.aclose() 