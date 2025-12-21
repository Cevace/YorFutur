import { Mistral } from '@mistralai/mistralai';

// Singleton pattern for client reuse
let mistralClient: Mistral | null = null;

/**
 * Get or create Mistral AI client instance
 * Configured for EU region to ensure GDPR compliance
 */
export function getMistralClient(): Mistral {
    if (!mistralClient) {
        const apiKey = process.env.MISTRAL_API_KEY;

        if (!apiKey) {
            throw new Error('MISTRAL_API_KEY environment variable is not configured');
        }

        mistralClient = new Mistral({
            apiKey: apiKey,
        });
    }

    return mistralClient;
}

// Model configuration
export const MISTRAL_MODEL = 'mistral-large-latest';

// EU region enforcement for GDPR
export const MISTRAL_ENDPOINT = 'https://api.mistral.ai'; // EU by default
