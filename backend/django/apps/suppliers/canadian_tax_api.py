import requests
from decimal import Decimal
from datetime import datetime
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class CanadianTaxAPIClient:
    """
    Client for integrating with the Canadian Sales Tax API (salestaxapi.ca)
    
    This API provides current and historical GST/HST/PST rates for all Canadian provinces
    and territories, with support for future rate changes.
    
    Supports both v1 (legacy, no auth) and v3 (current, requires auth) API versions.
    """
    
    BASE_URL_V1 = "http://api.canadasalestaxapi.ca"  # v1 API (deprecated July 1, 2025)
    BASE_URL_V3 = "https://api.salestaxapi.ca/v3"    # v3 API (current, requires auth)
    
    def __init__(self, api_key: Optional[str] = None, test_mode: bool = False, prefer_v3: bool = True):
        self.api_key = api_key
        self.test_mode = test_mode
        self.prefer_v3 = prefer_v3 and api_key is not None  # Can only use v3 if we have an API key
        self.session = requests.Session()
        
        # Set up authentication header if API key is provided
        if self.api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {self.api_key}'
            })
    
    def get_province_rates(self, province_code: str) -> Dict:
        """
        Get current tax rates for a specific province
        
        Args:
            province_code: Two-letter province code (e.g., 'ON', 'BC')
        
        Returns:
            Dictionary containing tax rate information
        """
        try:
            province_code = province_code.lower()
            
            if self.prefer_v3:
                # Use v3 API
                url = f"{self.BASE_URL_V3}/province/{province_code}"
                response = self.session.get(url)
                response.raise_for_status()
                data = response.json()
                return data.get('data', {})
            else:
                # Use v1 API as fallback
                return self._get_province_rates_v1(province_code)
            
        except requests.RequestException as e:
            logger.error(f"Error fetching tax rates for {province_code}: {e}")
            # Try v1 API as fallback if v3 fails
            if self.prefer_v3:
                return self._get_province_rates_v1(province_code)
            return {}
    
    def _get_province_rates_v1(self, province_code: str) -> Dict:
        """Get province rates using v1 API (fallback method)"""
        try:
            # v1 API requires separate calls for GST, HST, and PST
            gst_rate = 0.05  # Standard GST rate
            hst_rate = 0
            pst_rate = 0
            
            # Try to get HST rate
            try:
                hst_url = f"{self.BASE_URL_V1}/v1/federal/hst/{province_code}"
                hst_response = self.session.get(hst_url)
                if hst_response.status_code == 200:
                    hst_data = hst_response.json()
                    hst_rate = hst_data.get('rate', 0)
            except:
                pass
            
            # Try to get PST rate if no HST
            if hst_rate == 0:
                try:
                    pst_url = f"{self.BASE_URL_V1}/v1/provincial/pst/{province_code}"
                    pst_response = self.session.get(pst_url)
                    if pst_response.status_code == 200:
                        pst_data = pst_response.json()
                        pst_rate = pst_data.get('rate', 0)
                except:
                    pass
            
            # Format response to match v3 format
            tax_type = 'hst' if hst_rate > 0 else ('gst,pst' if pst_rate > 0 else 'gst')
            applicable_rate = hst_rate if hst_rate > 0 else (gst_rate + pst_rate)
            
            return {
                'province': province_code,
                'type': tax_type,
                'gst': gst_rate,
                'pst': pst_rate,
                'hst': hst_rate,
                'applicable': applicable_rate,
                'source': 'Canadian Sales Tax API v1',
                'updated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error fetching tax rates from v1 API for {province_code}: {e}")
            return {}
    
    def get_all_provinces_rates(self) -> Dict:
        """
        Get current tax rates for all provinces
        
        Returns:
            Dictionary with province codes as keys and tax data as values
        """
        try:
            if self.prefer_v3:
                url = f"{self.BASE_URL_V3}/province/all"
                response = self.session.get(url)
                response.raise_for_status()
                data = response.json()
                return data.get('data', {})
            else:
                # Use v1 API - need to get all provinces individually
                return self._get_all_provinces_rates_v1()
            
        except requests.RequestException as e:
            logger.error(f"Error fetching all province tax rates: {e}")
            # Try v1 API as fallback if v3 fails
            if self.prefer_v3:
                return self._get_all_provinces_rates_v1()
            return {}
    
    def _get_all_provinces_rates_v1(self) -> Dict:
        """Get all provinces rates using v1 API"""
        provinces = ['ab', 'bc', 'mb', 'nb', 'nl', 'ns', 'nt', 'nu', 'on', 'pe', 'qc', 'sk', 'yt']
        result = {}
        
        for province in provinces:
            province_data = self._get_province_rates_v1(province)
            if province_data:
                result[province] = province_data
        
        return result
    
    def get_future_rates(self, province_code: str) -> Dict:
        """
        Get future tax rates for a specific province (v3 API only)
        
        Args:
            province_code: Two-letter province code (e.g., 'ON', 'BC')
        
        Returns:
            Dictionary containing future tax rate information
        """
        if not self.prefer_v3:
            logger.warning("Future rates only available in v3 API")
            return {}
            
        try:
            province_code = province_code.lower()
            url = f"{self.BASE_URL_V3}/province/{province_code}/future"
            
            response = self.session.get(url)
            response.raise_for_status()
            
            data = response.json()
            return data.get('data', {})
            
        except requests.RequestException as e:
            logger.error(f"Error fetching future tax rates for {province_code}: {e}")
            return {}
    
    def get_historical_rates(self, province_code: str) -> list:
        """
        Get historical tax rates for a specific province (v3 API only)
        
        Args:
            province_code: Two-letter province code (e.g., 'ON', 'BC')
        
        Returns:
            List of historical tax rate records
        """
        if not self.prefer_v3:
            logger.warning("Historical rates only available in v3 API")
            return []
            
        try:
            province_code = province_code.lower()
            url = f"{self.BASE_URL_V3}/province/{province_code}/historical"
            
            response = self.session.get(url)
            response.raise_for_status()
            
            data = response.json()
            return data.get('data', [])
            
        except requests.RequestException as e:
            logger.error(f"Error fetching historical tax rates for {province_code}: {e}")
            return []
    
    def calculate_tax_breakdown(self, amount: Decimal, province_code: str, 
                              include_duties: bool = False, duty_rate: Decimal = Decimal('0.00')) -> Dict:
        """
        Calculate detailed tax breakdown for a given amount and province
        
        Args:
            amount: The base amount to calculate taxes on
            province_code: Two-letter province code
            include_duties: Whether to include import duties
            duty_rate: Duty rate as decimal (e.g., 0.05 for 5%)
        
        Returns:
            Dictionary containing detailed tax breakdown
        """
        tax_data = self.get_province_rates(province_code)
        
        if not tax_data:
            # Fallback to manual calculation if API fails
            return self._manual_calculation_fallback(amount, province_code, include_duties, duty_rate)
        
        breakdown = {
            'subtotal': amount,
            'gst_amount': Decimal('0.00'),
            'pst_amount': Decimal('0.00'),
            'hst_amount': Decimal('0.00'),
            'duty_amount': Decimal('0.00'),
            'total_tax': Decimal('0.00'),
            'total_with_tax': amount,
            'tax_type': tax_data.get('type', 'unknown'),
            'api_source': 'Canadian Sales Tax API',
            'last_updated': tax_data.get('updated_at'),
            'effective_date': tax_data.get('start'),
            'province': province_code.upper()
        }
        
        # Handle cross-border duties first
        if include_duties and duty_rate > 0:
            breakdown['duty_amount'] = amount * duty_rate
            amount_after_duty = amount + breakdown['duty_amount']
        else:
            amount_after_duty = amount
        
        # Calculate taxes based on API response
        tax_type = tax_data.get('type', '')
        
        if tax_type == 'hst':
            # HST province (New Brunswick, Newfoundland, Nova Scotia, Ontario, PEI)
            hst_rate = Decimal(str(tax_data.get('hst', 0)))
            breakdown['hst_amount'] = amount_after_duty * hst_rate
            breakdown['total_tax'] = breakdown['hst_amount'] + breakdown['duty_amount']
            breakdown['tax_type'] = 'HST'
            
        elif 'gst' in tax_type:
            # GST + PST province (BC, Manitoba, Saskatchewan, Quebec)
            # or GST only (Alberta, Northwest Territories, Nunavut, Yukon)
            gst_rate = Decimal(str(tax_data.get('gst', 0)))
            pst_rate = Decimal(str(tax_data.get('pst', 0)))
            
            breakdown['gst_amount'] = amount_after_duty * gst_rate
            breakdown['pst_amount'] = amount_after_duty * pst_rate
            breakdown['total_tax'] = breakdown['gst_amount'] + breakdown['pst_amount'] + breakdown['duty_amount']
            
            if pst_rate > 0:
                breakdown['tax_type'] = 'GST_PST' if 'qc' not in province_code.lower() else 'GST_QST'
            else:
                breakdown['tax_type'] = 'GST'
        
        breakdown['total_with_tax'] = amount + breakdown['total_tax']
        return breakdown
    
    def _manual_calculation_fallback(self, amount: Decimal, province_code: str, 
                                   include_duties: bool, duty_rate: Decimal) -> Dict:
        """
        Fallback to manual calculation using hardcoded rates if API fails
        """
        # Current Canadian tax rates (as of 2025)
        CANADIAN_RATES = {
            'AB': {'gst': 0.05, 'pst': 0.00, 'hst': 0.00, 'type': 'GST'},
            'BC': {'gst': 0.05, 'pst': 0.07, 'hst': 0.00, 'type': 'GST_PST'},
            'MB': {'gst': 0.05, 'pst': 0.07, 'hst': 0.00, 'type': 'GST_PST'},
            'NB': {'gst': 0.05, 'pst': 0.10, 'hst': 0.15, 'type': 'HST'},
            'NL': {'gst': 0.05, 'pst': 0.10, 'hst': 0.15, 'type': 'HST'},
            'NT': {'gst': 0.05, 'pst': 0.00, 'hst': 0.00, 'type': 'GST'},
            'NS': {'gst': 0.05, 'pst': 0.09, 'hst': 0.14, 'type': 'HST'},  # Updated April 2025
            'NU': {'gst': 0.05, 'pst': 0.00, 'hst': 0.00, 'type': 'GST'},
            'ON': {'gst': 0.05, 'pst': 0.08, 'hst': 0.13, 'type': 'HST'},
            'PE': {'gst': 0.05, 'pst': 0.10, 'hst': 0.15, 'type': 'HST'},
            'QC': {'gst': 0.05, 'pst': 0.09975, 'hst': 0.00, 'type': 'GST_QST'},
            'SK': {'gst': 0.05, 'pst': 0.06, 'hst': 0.00, 'type': 'GST_PST'},
            'YT': {'gst': 0.05, 'pst': 0.00, 'hst': 0.00, 'type': 'GST'},
        }
        
        province_code = province_code.upper()
        rates = CANADIAN_RATES.get(province_code, CANADIAN_RATES['ON'])  # Default to Ontario
        
        breakdown = {
            'subtotal': amount,
            'gst_amount': Decimal('0.00'),
            'pst_amount': Decimal('0.00'),
            'hst_amount': Decimal('0.00'),
            'duty_amount': Decimal('0.00'),
            'total_tax': Decimal('0.00'),
            'total_with_tax': amount,
            'tax_type': rates['type'],
            'api_source': 'Manual Calculation (API Fallback)',
            'last_updated': datetime.now().isoformat(),
            'province': province_code
        }
        
        # Handle duties
        if include_duties and duty_rate > 0:
            breakdown['duty_amount'] = amount * duty_rate
            amount_after_duty = amount + breakdown['duty_amount']
        else:
            amount_after_duty = amount
        
        # Calculate taxes
        if rates['type'] == 'HST':
            hst_rate = Decimal(str(rates['hst']))
            breakdown['hst_amount'] = amount_after_duty * hst_rate
            breakdown['total_tax'] = breakdown['hst_amount'] + breakdown['duty_amount']
        else:
            gst_rate = Decimal(str(rates['gst']))
            pst_rate = Decimal(str(rates['pst']))
            breakdown['gst_amount'] = amount_after_duty * gst_rate
            breakdown['pst_amount'] = amount_after_duty * pst_rate
            breakdown['total_tax'] = breakdown['gst_amount'] + breakdown['pst_amount'] + breakdown['duty_amount']
        
        breakdown['total_with_tax'] = amount + breakdown['total_tax']
        return breakdown
    
    def validate_api_connection(self) -> bool:
        """
        Validate that the API connection is working
        
        Returns:
            True if API is accessible, False otherwise
        """
        try:
            # Test with Ontario (a reliable province)
            if self.prefer_v3:
                response = self.session.get(f"{self.BASE_URL_V3}/province/on")
            else:
                response = self.session.get(f"{self.BASE_URL_V1}/v1/federal/gst")
            return response.status_code == 200
        except:
            return False
    
    def get_rate_limit_info(self) -> Dict:
        """
        Get rate limit information from the last API response
        
        Returns:
            Dictionary containing rate limit information
        """
        # Make a test request to get rate limit headers
        try:
            if self.prefer_v3:
                response = self.session.get(f"{self.BASE_URL_V3}/province/on")
            else:
                response = self.session.get(f"{self.BASE_URL_V1}/v1/federal/gst")
            return {
                'limit': response.headers.get('x-ratelimit-limit'),
                'remaining': response.headers.get('x-ratelimit-remaining'),
                'reset': response.headers.get('x-ratelimit-reset'),
                'retry_after': response.headers.get('retry-after'),
                'api_version': 'v3' if self.prefer_v3 else 'v1'
            }
        except:
            return {} 