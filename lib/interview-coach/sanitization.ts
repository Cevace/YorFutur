/**
 * Prompt Sanitization
 * Prevents prompt injection attacks
 */

/**
 * Sanitize user input to prevent prompt injection
 * Removes special characters and instruction-like patterns
 */
export function sanitizeForPrompt(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        // Remove instruction keywords
        .replace(/\b(ignore|disregard|forget|system|instructions?|prompt|you are|act as|pretend|role)\b/gi, '')
        // Remove special prompt characters
        .replace(/[{}[\]<>]/g, '')
        // Limit consecutive newlines
        .replace(/\n{3,}/g, '\n\n')
        // Trim and limit length
        .trim()
        .slice(0, 200); // Max 200 chars for company/title
}

/**
 * Sanitize longer text (vacancy descriptions)
 */
export function sanitizeLongText(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        // Remove instruction keywords but be less aggressive
        .replace(/\b(IGNORE ALL|DISREGARD PREVIOUS|SYSTEM:|<\|.*?\|>)\b/gi, '')
        // Remove special characters
        .replace(/[<>]/g, '')
        // Limit length
        .trim()
        .slice(0, 5000); // Max 5000 chars for vacancy text
}

/**
 * Validate and sanitize user message for chat
 */
export function sanitizeUserMessage(message: string): string {
    if (!message || typeof message !== 'string') return '';

    // Allow normal conversation but remove obvious injection attempts
    return message
        .replace(/\b(SYSTEM:|<\|system\|>|<\|assistant\|>)\b/gi, '')
        .trim()
        .slice(0, 2000);
}
