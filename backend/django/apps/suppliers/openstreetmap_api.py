import requests
import json
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
import logging
import time

logger = logging.getLogger(__name__)

class OpenStreetMapClient:
    """
    Client for integrating with OpenStreetMap's Nominatim API for geocoding services.
    
    This client provides:
    - Address autocomplete/search
    - Forward geocoding (address to coordinates)
    - Reverse geocoding (coordinates to address)
    - Address validation
    - Real-time plotting support
    
    Uses OpenStreetMap's free Nominatim API with proper rate limiting and attribution.
    """
    
    BASE_URL = "https://nominatim.openstreetmap.org"
    
    def __init__(self, user_agent: str = "FontaineSante-SCOS", rate_limit_delay: float = 1.0):
        """
        Initialize OpenStreetMap client
        
        Args:
            user_agent: User agent string for API requests (required by Nominatim)
            rate_limit_delay: Delay between requests in seconds (minimum 1 second for Nominatim)
        """
        self.user_agent = user_agent
        self.rate_limit_delay = max(rate_limit_delay, 1.0)  # Minimum 1 second for Nominatim
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.user_agent
        })
        self.last_request_time = 0
    
    def _rate_limit(self):
        """Ensure we don't exceed rate limits"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.rate_limit_delay:
            time.sleep(self.rate_limit_delay - time_since_last)
        self.last_request_time = time.time()
    
    def search_addresses(self, query: str, country_code: str = 'CA', limit: int = 5) -> List[Dict]:
        """
        Search for addresses using text query
        
        Args:
            query: Address search query
            country_code: ISO country code (CA for Canada, US for United States)
            limit: Maximum number of results to return
        
        Returns:
            List of address matches with coordinates and details
        """
        try:
            self._rate_limit()
            
            params = {
                'q': query,
                'format': 'json',
                'countrycodes': country_code.lower(),
                'limit': limit,
                'addressdetails': 1,
                'extratags': 1,
                'namedetails': 1
            }
            
            response = self.session.get(f"{self.BASE_URL}/search", params=params)
            response.raise_for_status()
            
            results = response.json()
            
            formatted_results = []
            for result in results:
                formatted_result = self._format_address_result(result)
                formatted_results.append(formatted_result)
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching addresses: {e}")
            return []
    
    def geocode_address(self, address: str, country_code: str = 'CA') -> Optional[Dict]:
        """
        Convert address string to coordinates (forward geocoding)
        
        Args:
            address: Full address string
            country_code: ISO country code
        
        Returns:
            Dictionary with coordinates and formatted address, or None if not found
        """
        results = self.search_addresses(address, country_code, limit=1)
        return results[0] if results else None
    
    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict]:
        """
        Convert coordinates to address (reverse geocoding)
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
        
        Returns:
            Dictionary with address details, or None if not found
        """
        try:
            self._rate_limit()
            
            params = {
                'lat': latitude,
                'lon': longitude,
                'format': 'json',
                'addressdetails': 1,
                'extratags': 1,
                'namedetails': 1
            }
            
            response = self.session.get(f"{self.BASE_URL}/reverse", params=params)
            response.raise_for_status()
            
            result = response.json()
            
            if 'error' in result:
                return None
            
            return self._format_address_result(result)
            
        except Exception as e:
            logger.error(f"Error reverse geocoding: {e}")
            return None
    
    def validate_coordinates(self, latitude: float, longitude: float) -> bool:
        """
        Validate if coordinates are reasonable
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
        
        Returns:
            True if coordinates are valid
        """
        # Basic coordinate validation
        if not (-90 <= latitude <= 90):
            return False
        if not (-180 <= longitude <= 180):
            return False
        
        # Check if coordinates are not null island (0,0)
        if latitude == 0 and longitude == 0:
            return False
        
        return True
    
    def get_distance_between_points(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using Haversine formula
        
        Args:
            lat1, lon1: First point coordinates
            lat2, lon2: Second point coordinates
        
        Returns:
            Distance in kilometers
        """
        import math
        
        # Convert coordinates to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of Earth in kilometers
        r = 6371
        
        return c * r
    
    def _format_address_result(self, result: Dict) -> Dict:
        """
        Format raw Nominatim result into standardized format
        
        Args:
            result: Raw result from Nominatim API
        
        Returns:
            Standardized address format
        """
        address = result.get('address', {})
        
        # Extract components
        street_number = address.get('house_number', '')
        street_name = address.get('road', '')
        city = address.get('city') or address.get('town') or address.get('village') or address.get('municipality', '')
        state_province = address.get('state') or address.get('province', '')
        postal_code = address.get('postcode', '')
        country = address.get('country', '')
        country_code = address.get('country_code', '').upper()
        
        # Build formatted address components
        street_address = f"{street_number} {street_name}".strip()
        
        formatted_address = []
        if street_address:
            formatted_address.append(street_address)
        if city:
            formatted_address.append(city)
        if state_province:
            formatted_address.append(state_province)
        if postal_code:
            formatted_address.append(postal_code)
        if country:
            formatted_address.append(country)
        
        full_address = ', '.join(formatted_address)
        
        return {
            'display_name': result.get('display_name', ''),
            'formatted_address': full_address,
            'latitude': float(result.get('lat', 0)),
            'longitude': float(result.get('lon', 0)),
            'components': {
                'street_number': street_number,
                'street_name': street_name,
                'street_address': street_address,
                'city': city,
                'state_province': state_province,
                'postal_code': postal_code,
                'country': country,
                'country_code': country_code
            },
            'place_id': result.get('place_id'),
            'osm_type': result.get('osm_type'),
            'osm_id': result.get('osm_id'),
            'category': result.get('category'),
            'type': result.get('type'),
            'importance': result.get('importance', 0),
            'bounding_box': result.get('boundingbox', []),
            'raw_result': result  # Keep original for debugging
        }
    
    def get_location_suggestions(self, partial_address: str, country_code: str = 'CA') -> List[Dict]:
        """
        Get address suggestions for autocomplete functionality
        
        Args:
            partial_address: Partial address string
            country_code: ISO country code
        
        Returns:
            List of address suggestions
        """
        if len(partial_address) < 3:  # Don't search for very short queries
            return []
        
        return self.search_addresses(partial_address, country_code, limit=10)
    
    def get_canadian_provinces(self) -> List[Dict]:
        """
        Get list of Canadian provinces with their coordinates
        
        Returns:
            List of provinces with center coordinates
        """
        provinces = [
            {'name': 'Alberta', 'code': 'AB', 'lat': 53.9333, 'lon': -116.5765},
            {'name': 'British Columbia', 'code': 'BC', 'lat': 53.7267, 'lon': -127.6476},
            {'name': 'Manitoba', 'code': 'MB', 'lat': 53.7609, 'lon': -98.8139},
            {'name': 'New Brunswick', 'code': 'NB', 'lat': 46.5653, 'lon': -66.4619},
            {'name': 'Newfoundland and Labrador', 'code': 'NL', 'lat': 53.1355, 'lon': -57.6604},
            {'name': 'Northwest Territories', 'code': 'NT', 'lat': 61.2181, 'lon': -113.5034},
            {'name': 'Nova Scotia', 'code': 'NS', 'lat': 44.6820, 'lon': -63.7443},
            {'name': 'Nunavut', 'code': 'NU', 'lat': 70.2998, 'lon': -83.1076},
            {'name': 'Ontario', 'code': 'ON', 'lat': 51.2538, 'lon': -85.3232},
            {'name': 'Prince Edward Island', 'code': 'PE', 'lat': 46.5107, 'lon': -63.4168},
            {'name': 'Quebec', 'code': 'QC', 'lat': 53.9214, 'lon': -72.7665},
            {'name': 'Saskatchewan', 'code': 'SK', 'lat': 52.9399, 'lon': -106.4509},
            {'name': 'Yukon', 'code': 'YT', 'lat': 64.2823, 'lon': -135.0000}
        ]
        return provinces
    
    def find_nearest_suppliers(self, base_lat: float, base_lon: float, 
                             supplier_locations: List[Tuple[float, float, str]], 
                             max_distance_km: float = 100) -> List[Dict]:
        """
        Find suppliers within a certain distance of a base location
        
        Args:
            base_lat, base_lon: Base location coordinates
            supplier_locations: List of (lat, lon, supplier_name) tuples
            max_distance_km: Maximum distance in kilometers
        
        Returns:
            List of nearby suppliers with distances
        """
        nearby_suppliers = []
        
        for lat, lon, name in supplier_locations:
            distance = self.get_distance_between_points(base_lat, base_lon, lat, lon)
            
            if distance <= max_distance_km:
                nearby_suppliers.append({
                    'name': name,
                    'latitude': lat,
                    'longitude': lon,
                    'distance_km': round(distance, 2)
                })
        
        # Sort by distance
        nearby_suppliers.sort(key=lambda x: x['distance_km'])
        
        return nearby_suppliers
    
    def get_map_url(self, latitude: float, longitude: float, zoom: int = 15) -> str:
        """
        Generate OpenStreetMap URL for viewing location
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            zoom: Map zoom level (1-19)
        
        Returns:
            URL to view location on OpenStreetMap
        """
        return f"https://www.openstreetmap.org/?mlat={latitude}&mlon={longitude}&zoom={zoom}"
    
    def get_static_map_url(self, latitude: float, longitude: float, 
                          width: int = 400, height: int = 300, zoom: int = 15) -> str:
        """
        Generate static map image URL
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            width: Image width in pixels
            height: Image height in pixels
            zoom: Map zoom level
        
        Returns:
            URL to static map image (using external service)
        """
        # Using a third-party static map service that works with OSM
        return f"https://maps.geoapify.com/v1/staticmap?style=osm-carto&width={width}&height={height}&center=lonlat:{longitude},{latitude}&zoom={zoom}&marker=lonlat:{longitude},{latitude};color:%23ff0000;size:medium" 