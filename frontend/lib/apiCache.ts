// In-memory cache for API responses
const API_CACHE: Record<string, { data: any; timestamp: number }> = {};
// Set a 30-second cache lifetime
const CACHE_LIFETIME_MS = 30000;

/**
 * Wrapper function for API handlers to implement caching
 * @param key The cache key (typically the API route path)
 * @param fetchFn The function that fetches the actual data
 * @returns The cached or fresh data
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Check if we have a valid cached response
  const now = Date.now();
  if (API_CACHE[key] && now - API_CACHE[key].timestamp < CACHE_LIFETIME_MS) {
    console.log(`Cache hit for ${key}`);
    return API_CACHE[key].data;
  }

  // No cache or expired, get fresh data
  console.log(`Cache miss for ${key}`);
  const data = await fetchFn();

  // Cache the response
  API_CACHE[key] = {
    data,
    timestamp: now,
  };

  return data;
}

/**
 * Clear the entire cache or a specific key
 * @param key Optional specific cache key to clear
 */
export function clearCache(key?: string) {
  if (key) {
    delete API_CACHE[key];
  } else {
    Object.keys(API_CACHE).forEach((k) => delete API_CACHE[k]);
  }
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  return {
    size: Object.keys(API_CACHE).length,
    keys: Object.keys(API_CACHE),
    usage: Object.entries(API_CACHE).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
    })),
  };
}
