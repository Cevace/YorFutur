// Motivation Letter Constants
export const LOADING_DELAY_MS = 500;
export const MAX_AI_TOKENS = 3000;
export const AI_TEMPERATURE = 0.7;
export const MIN_VACANCY_LENGTH = 50;
// Realistic timing for AI generation (total: 60s)
// Step 1: 10s - Analyzing vacancy & profile
// Step 2: 20s - Finding unique angle  
// Step 3: 30s - Formulating 3 strategic approaches
export const STEP_TIMINGS = [10000, 20000, 30000] as const;
export const STEP_TOTAL_TIME = STEP_TIMINGS.reduce((a, b) => a + b, 0);
export const COMPLETE_DELAY_MS = 500;

// Textarea debounce
export const TEXTAREA_DEBOUNCE_MS = 300;

// API Timeouts
export const AI_GENERATION_TIMEOUT_MS = 90000; // 90 seconds
export const SAVE_TIMEOUT_MS = 10000; // 10 seconds
export const API_ROUTE_TIMEOUT_MS = 90000; // 90 seconds - matches API route maxDuration
