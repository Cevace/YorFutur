/**
 * Rate Limiting for Interview Coach API Routes
 * Prevents cost explosions from API abuse
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

export class RateLimitError extends Error {
    constructor(public retryAfter: number) {
        super('Too many requests');
        this.name = 'RateLimitError';
    }
}

/**
 * Rate limiter using in-memory store
 * For production, use Redis or similar
 */
export function rateLimit(identifier: string, config: RateLimitConfig): void {
    const now = Date.now();
    const record = store[identifier];

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        Object.keys(store).forEach(key => {
            if (store[key].resetTime < now) {
                delete store[key];
            }
        });
    }

    if (!record || record.resetTime < now) {
        // New window
        store[identifier] = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        return;
    }

    if (record.count >= config.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        throw new RateLimitError(retryAfter);
    }

    record.count++;
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    // ElevenLabs TTS - expensive, strict limit
    SPEAK: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10, // 10 requests per minute
    },

    // Voxtral transcription - moderate
    TRANSCRIBE: {
        windowMs: 60 * 1000,
        maxRequests: 20,
    },

    // Mistral chat - moderate
    CHAT: {
        windowMs: 60 * 1000,
        maxRequests: 30,
    },
} as const;
