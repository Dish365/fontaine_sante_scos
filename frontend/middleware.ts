import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory cache for API responses
const API_CACHE: Record<string, { data: any; timestamp: number }> = {};
// Set a longer cache lifetime - 60 seconds
const CACHE_LIFETIME_MS = 60000;
// Track request counts for rate limiting
const REQUEST_COUNTS: Record<string, { count: number; firstRequest: number }> =
  {};
// More aggressive rate limit: maximum 2 requests per endpoint per 10 seconds
const RATE_LIMIT = 2;
const RATE_LIMIT_WINDOW_MS = 10000;

// List of API paths to intercept
const API_PATHS = ["/api/suppliers", "/api/materials", "/api/routes"];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Only intercept specific API requests
  if (API_PATHS.includes(path)) {
    // Create a key for this request
    const cacheKey = `${request.method}-${path}`;

    // Check if we need to rate limit this endpoint
    const now = Date.now();
    if (!REQUEST_COUNTS[cacheKey]) {
      REQUEST_COUNTS[cacheKey] = { count: 1, firstRequest: now };
    } else {
      // Reset counter if outside the window
      if (now - REQUEST_COUNTS[cacheKey].firstRequest > RATE_LIMIT_WINDOW_MS) {
        REQUEST_COUNTS[cacheKey] = { count: 1, firstRequest: now };
      } else {
        REQUEST_COUNTS[cacheKey].count++;
      }

      // Apply rate limiting - for GET requests only (to not block mutations)
      if (
        request.method === "GET" &&
        REQUEST_COUNTS[cacheKey].count > RATE_LIMIT
      ) {
        // For rate-limited requests, try to use cache
        if (API_CACHE[cacheKey]) {
          console.log(
            `Rate limited - Serving cached response for: ${cacheKey}`
          );

          // Get fake data for this endpoint
          const responseData = getStaticData(path);

          // Create headers
          const headers = new Headers();
          headers.set("content-type", "application/json");
          headers.set("x-rate-limit-exceeded", "true");
          headers.set("x-rate-limit-remaining", "0");
          headers.set("cache-control", "public, max-age=30");

          // Return cached data
          return new NextResponse(JSON.stringify(responseData), {
            status: 200,
            headers,
          });
        }
      }
    }

    // For GET requests, check cache before passing through
    if (request.method === "GET") {
      if (
        API_CACHE[cacheKey] &&
        now - API_CACHE[cacheKey].timestamp < CACHE_LIFETIME_MS
      ) {
        console.log(`Cache hit: ${cacheKey}`);

        // Create headers
        const headers = new Headers();
        headers.set("content-type", "application/json");
        headers.set("x-cache", "HIT");
        headers.set("cache-control", "public, max-age=30");

        // Return cached data
        return new NextResponse(JSON.stringify(API_CACHE[cacheKey].data), {
          status: 200,
          headers,
        });
      }

      // For first requests, preemptively cache static data
      if (!API_CACHE[cacheKey]) {
        const responseData = getStaticData(path);
        API_CACHE[cacheKey] = {
          data: responseData,
          timestamp: now,
        };

        console.log(`Preemptively cached: ${cacheKey}`);

        // Create headers
        const headers = new Headers();
        headers.set("content-type", "application/json");
        headers.set("x-cache", "MISS");
        headers.set("cache-control", "public, max-age=30");

        // Return preemptively cached data
        return new NextResponse(JSON.stringify(responseData), {
          status: 200,
          headers,
        });
      }
    }
  }

  return NextResponse.next();
}

// Function to get static data for each endpoint
function getStaticData(path: string) {
  switch (path) {
    case "/api/suppliers":
      return {
        suppliers: [
          {
            id: "supplier-1",
            name: "Eco Farm",
            location: {
              address: "123 Farm Rd, Quebec",
              coordinates: { lat: 45.5, lng: -73.5 },
            },
            materials: ["material-1", "material-2"],
            certifications: ["Organic", "Fair Trade"],
          },
          {
            id: "supplier-2",
            name: "Green Foods",
            location: {
              address: "456 Green St, Montreal",
              coordinates: { lat: 45.6, lng: -73.6 },
            },
            materials: ["material-3"],
            certifications: ["Organic"],
          },
        ],
      };
    case "/api/materials":
      return {
        materials: [
          {
            id: "material-1",
            name: "Organic Lettuce",
            unit: "kg",
            suppliers: ["supplier-1"],
          },
          {
            id: "material-2",
            name: "Organic Tomatoes",
            unit: "kg",
            suppliers: ["supplier-1"],
          },
          {
            id: "material-3",
            name: "Organic Peppers",
            unit: "kg",
            suppliers: ["supplier-2"],
          },
        ],
      };
    case "/api/routes":
      return {
        routes: [
          {
            id: "route-1",
            supplierId: "supplier-1",
            warehouseId: "warehouse-1",
            distance: 100,
            transportMode: "truck",
          },
          {
            id: "route-2",
            supplierId: "supplier-2",
            warehouseId: "warehouse-1",
            distance: 75,
            transportMode: "truck",
          },
        ],
      };
    default:
      return {};
  }
}

export const config = {
  matcher: "/api/:path*",
};
