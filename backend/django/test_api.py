#!/usr/bin/env python3
"""
Simple test script to verify Django API endpoints
"""
import requests
import json

def test_api_endpoints():
    base_url = "http://localhost:8000"
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'FastAPI-Internal-Service/1.0 (httpx)',
        'X-Internal-Service': 'fastapi',
    }
    
    endpoints = [
        '/api/suppliers/warehouses/',
        '/api/suppliers/suppliers/',
        '/api/suppliers/materials/',
    ]
    
    print("Testing Django API endpoints...")
    print("=" * 50)
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        try:
            print(f"\nTesting: {url}")
            response = requests.get(url, headers=headers, timeout=10)
            
            print(f"Status Code: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                if 'results' in data:
                    print(f"Results count: {len(data['results'])}")
                    if data['results']:
                        print(f"First item keys: {list(data['results'][0].keys())}")
                elif isinstance(data, list):
                    print(f"List count: {len(data)}")
                    if data:
                        print(f"First item keys: {list(data[0].keys())}")
                else:
                    print(f"Response type: {type(data)}")
                    print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            else:
                print(f"Error response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
        except Exception as e:
            print(f"Error: {e}")
        
        print("-" * 30)

if __name__ == "__main__":
    test_api_endpoints() 