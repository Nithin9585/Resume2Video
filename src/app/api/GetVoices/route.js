import { NextResponse } from 'next/server';
const CACHE_DURATION = 5 * 60 * 1000;
const cache = new Map();
async function fetchVoicesFromAPI() {
    const apiKey = process.env.HEYGEN_API_KEY;
    const baseUrl = process.env.HEYGEN_BASE_URL || 'https://api.heygen.com';
    if (!apiKey) {
        throw new Error('HEYGEN_API_KEY environment variable is not configured');
    }
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch(`${baseUrl}/v2/voices`, {
            method: 'GET',
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Resume2Video/1.0'
            },
            signal: controller.signal,
            cache: 'force-cache'
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`HeyGen API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const fetchTime = Date.now() - startTime;
        return { data, fetchTime };
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}
export async function GET() {
    try {
        const cacheKey = 'voices';
        const now = Date.now();
        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            const age = now - cached.timestamp;
            if (age < CACHE_DURATION) {
                return NextResponse.json(cached.data, {
                    headers: {
                        'Cache-Control': 'public, max-age=300',
                        'X-Cache': 'HIT',
                        'X-Cache-Age': Math.round(age / 1000).toString()
                    }
                });
            } else {
                cache.delete(cacheKey);
            }
        }
        const { data, fetchTime } = await fetchVoicesFromAPI();
        cache.set(cacheKey, {
            data,
            timestamp: now
        });
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=300',
                'X-Cache': 'MISS',
                'X-Fetch-Time': fetchTime.toString(),
                'X-Timestamp': new Date().toISOString()
            }
        });
    } catch (error) {
        const cacheKey = 'voices';
        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            const age = now - cached.timestamp;
            return NextResponse.json(cached.data, {
                headers: {
                    'X-Cache': 'STALE',
                    'X-Error': 'API error, serving cached data',
                    'X-Cache-Age': Math.round(age / 1000).toString()
                }
            });
        }
        return NextResponse.json(
            {
                error: 'Failed to fetch voices',
                details: error.message,
                timestamp: new Date().toISOString(),
                suggestion: 'Please check your API configuration and try again'
            },
            { status: 500 }
        );
    }
}
