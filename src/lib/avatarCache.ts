// src/lib/avatarCache.ts
const CACHE_PREFIX = 'avatar_cache_';
const FALLBACK_STATE_VALUE = 'FETCH_FAILED'; // Indicates a known prior fetch failure
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // Cache successful URLs for 24 hours
const FAILED_CACHE_EXPIRY_MS = 1 * 60 * 60 * 1000; // Cache failure state for 1 hour

interface CachedItem {
    value: string; // The URL string or FALLBACK_STATE_VALUE
    timestamp: number;
}

export async function getAvatarUrl(originalUrl: string | null | undefined, fallbackUrl: string): Promise<string> {
    // If no original URL is provided, immediately return the fallback.
    if (!originalUrl || originalUrl === "null" || originalUrl === "undefined") {
        return fallbackUrl;
    }

    const cacheKey = `${CACHE_PREFIX}${encodeURIComponent(originalUrl)}`;

    try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            const item: CachedItem = JSON.parse(cachedData);
            // Determine expiry based on whether it was a success or a known failure
            const expiryDuration = item.value === FALLBACK_STATE_VALUE ? FAILED_CACHE_EXPIRY_MS : CACHE_EXPIRY_MS;
            const isExpired = Date.now() - item.timestamp > expiryDuration;

            if (!isExpired) {
                if (item.value === FALLBACK_STATE_VALUE) {
                    // console.debug(`Avatar cache: ${originalUrl} previously failed (cache valid). Using fallback.`);
                    return fallbackUrl;
                }
                // console.debug(`Avatar cache: Found valid cached URL for ${originalUrl}: ${item.value}`);
                return item.value; // This is a successfully cached URL
            } else {
                // console.debug(`Avatar cache: Cache expired for ${originalUrl}`);
                localStorage.removeItem(cacheKey); // Clean up expired item
            }
        }
    } catch (e) {
        console.warn("Error reading avatar from localStorage or parsing JSON:", e);
        // If there's an error reading/parsing, remove the potentially corrupt item.
        localStorage.removeItem(cacheKey);
    }

    // console.debug(`Avatar cache: No valid cache for ${originalUrl}. Attempting fetch.`);
    try {
        const img = new Image();
        // img.crossOrigin = "Anonymous"; // Optional: may help with CORS in some edge cases or if drawing to canvas

        return await new Promise<string>((resolve) => {
            img.onload = () => {
                // console.debug(`Avatar cache: Successfully fetched ${originalUrl}`);
                const newItem: CachedItem = { value: originalUrl, timestamp: Date.now() };
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(newItem));
                } catch (lsError) {
                    console.warn("Error saving successful avatar to localStorage:", lsError);
                }
                resolve(originalUrl);
            };
            img.onerror = () => {
                // console.warn(`Avatar cache: Failed to load image ${originalUrl}. Using fallback.`);
                const newItem: CachedItem = { value: FALLBACK_STATE_VALUE, timestamp: Date.now() };
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(newItem));
                } catch (lsError) {
                    console.warn("Error saving failed avatar state to localStorage:", lsError);
                }
                resolve(fallbackUrl);
            };
            img.src = originalUrl;
        });
    } catch (error) { // This outer catch is unlikely to be hit due to the Promise structure
        console.error(`Avatar cache: Uncaught error in Image load attempt for ${originalUrl}:`, error);
        return fallbackUrl;
    }
}