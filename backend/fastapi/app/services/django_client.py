import httpx
import os
from typing import Dict, List, Optional

DJANGO_BASE_URL = os.getenv('DJANGO_BASE_URL', 'http://localhost:8000')

class DjangoClient:
    """Client for interacting with Django backend"""
    
    def __init__(self):
        self.base_url = DJANGO_BASE_URL
    
    async def get_suppliers(self, token: Optional[str] = None) -> List[Dict]:
        """Get all active suppliers with their materials"""
        async with httpx.AsyncClient() as client:
            headers = {
                'Content-Type': 'application/json',
            }
            if token:
                headers['Authorization'] = f'Bearer {token}'
            
            try:
                response = await client.get(
                    f"{self.base_url}/api/suppliers/suppliers/",
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data['results'] if 'results' in data else data
                elif response.status_code == 401:
                    print(f"Authentication failed: {response.text}")
                    return []
                else:
                    print(f"Failed to fetch suppliers: {response.status_code} - {response.text}")
                    return []
            except Exception as e:
                print(f"Error fetching suppliers: {str(e)}")
                return []
    
    async def get_supplier_materials(self, supplier_id: int, token: Optional[str] = None) -> List[Dict]:
        """Get materials for a specific supplier"""
        async with httpx.AsyncClient() as client:
            headers = {
                'Content-Type': 'application/json',
            }
            if token:
                headers['Authorization'] = f'Bearer {token}'
            
            try:
                response = await client.get(
                    f"{self.base_url}/api/suppliers/suppliers/{supplier_id}/materials/",
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data['results'] if 'results' in data else data
                elif response.status_code == 401:
                    print(f"Authentication failed: {response.text}")
                    return []
                else:
                    print(f"Failed to fetch supplier materials: {response.status_code} - {response.text}")
                    return []
            except Exception as e:
                print(f"Error fetching supplier materials: {str(e)}")
                return []
    
    async def get_warehouses(self, token: Optional[str] = None) -> List[Dict]:
        """Get all active warehouses"""
        async with httpx.AsyncClient() as client:
            headers = {
                'Content-Type': 'application/json',
            }
            if token:
                headers['Authorization'] = f'Bearer {token}'
            
            try:
                response = await client.get(
                    f"{self.base_url}/api/suppliers/warehouses/",
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data['results'] if 'results' in data else data
                elif response.status_code == 401:
                    print(f"Authentication failed: {response.text}")
                    return []
                else:
                    print(f"Failed to fetch warehouses: {response.status_code} - {response.text}")
                    return []
            except Exception as e:
                print(f"Error fetching warehouses: {str(e)}")
                return [] 