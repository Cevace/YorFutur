/**
 * Cevace Pricing System - Plan Definitions
 * 
 * This file contains the plan constants and helper functions.
 * These match the database seed data exactly.
 */

import { Plan, PlanName, PlanFeatures, BillingCycle } from './types';

// ========================================
// PLAN FEATURE DEFINITIONS
// ========================================

export const FREE_FEATURES: PlanFeatures = {
    cvTemplates: 'limited',
    pdfDownloads: false,
    motivationLetters: 'limited',
    cvTuner: 'score_only',
    linkedinOptimizer: false,
    jobRadar: 'limited',
    interviewCoach: 'none',
    assessmentTrainer: false,
    liveCvLink: false,
};

export const ESSENTIAL_FEATURES: PlanFeatures = {
    cvTemplates: 'standard',
    pdfDownloads: true,
    motivationLetters: 'unlimited',
    cvTuner: 'basic',
    linkedinOptimizer: false,
    jobRadar: 'full',
    interviewCoach: 'none',
    assessmentTrainer: false,
    liveCvLink: false,
};

export const PROFESSIONAL_FEATURES: PlanFeatures = {
    cvTemplates: 'standard',
    pdfDownloads: true,
    motivationLetters: 'unlimited',
    cvTuner: 'advanced',
    linkedinOptimizer: true,
    jobRadar: 'priority',
    interviewCoach: 'basic',
    assessmentTrainer: false,
    liveCvLink: true,
};

export const EXECUTIVE_FEATURES: PlanFeatures = {
    cvTemplates: 'premium',
    pdfDownloads: true,
    motivationLetters: 'unlimited',
    cvTuner: 'advanced',
    linkedinOptimizer: true,
    jobRadar: 'priority',
    interviewCoach: 'advanced',
    assessmentTrainer: true,
    liveCvLink: true,
};

// ========================================
// PLANS CONSTANT
// ========================================

export const PLANS: Record<PlanName, Plan> = {
    free: {
        id: '', // Will be populated from database
        name: 'free',
        displayName: 'Free',
        headline: 'Probeer',
        subHeadline: 'Ontdek de mogelijkheden.',
        monthlyPrice: 0,
        quarterlyPrice: 0,
        monthlyEquivalent: 0,
        savingsPercentage: 0,
        features: FREE_FEATURES,
        bullets: [
            '1 CV Template (met watermerk)',
            'Preview only (geen download)',
            'Score-only CV analyse',
        ],
        ctaText: 'Blijf op Free',
        sortOrder: 0,
        isHighlighted: false,
    },
    essential: {
        id: '',
        name: 'essential',
        displayName: 'Essential',
        headline: 'Start gratis met Essential',
        subHeadline: 'Alles voor een perfect CV en Brief.',
        monthlyPrice: 12,
        quarterlyPrice: 27,
        monthlyEquivalent: 9,
        savingsPercentage: 25,
        features: ESSENTIAL_FEATURES,
        bullets: [
            'Onbeperkt CV\'s & brieven maken',
            'Download als PDF (Geen watermerk)',
            'Slimme Sollicitatie Tracker',
            'Live CV link',
        ],
        ctaText: 'Kies Essential',
        sortOrder: 1,
        isHighlighted: false,
    },
    professional: {
        id: '',
        name: 'professional',
        displayName: 'Professional',
        headline: 'Versnel met Professional',
        subHeadline: 'Word 3x vaker uitgenodigd.',
        monthlyPrice: 27,
        quarterlyPrice: 66,
        monthlyEquivalent: 22,
        savingsPercentage: 19,
        features: PROFESSIONAL_FEATURES,
        bullets: [
            'Alles uit Essential',
            'CV Tuner (Herschrijf je CV)',
            'LinkedIn Optimizer',
            'Salarischeck',
            'Job radar',
        ],
        ctaText: 'Start Professional',
        sortOrder: 2,
        isHighlighted: true, // "Meest Gekozen"
    },
    executive: {
        id: '',
        name: 'executive',
        displayName: 'Executive',
        headline: 'Win met Executive',
        subHeadline: 'Versla de concurrentie in assessments.',
        monthlyPrice: 47,
        quarterlyPrice: 117,
        monthlyEquivalent: 39.00,
        savingsPercentage: 17,
        features: EXECUTIVE_FEATURES,
        bullets: [
            'Alles uit Professional',
            'Assessment Training (SHL, etc)',
            'Live CV link + StatCounter',
            '1-op-1 Interview Coach Simulatie',
        ],
        ctaText: 'Word Executive',
        sortOrder: 3,
        isHighlighted: false,
    },
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get a plan by name
 */
export function getPlan(name: PlanName): Plan {
    return PLANS[name];
}

/**
 * Get all plans as an array (sorted by sortOrder)
 */
export function getAllPlans(): Plan[] {
    return Object.values(PLANS).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get paid plans only (excludes free)
 */
export function getPaidPlans(): Plan[] {
    return getAllPlans().filter(plan => plan.name !== 'free');
}

/**
 * Format price for display
 */
export function formatPrice(price: number, cycle: BillingCycle = 'monthly'): string {
    if (price === 0) return 'Gratis';

    const formatted = new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: price % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(price);

    return formatted;
}

/**
 * Get display price with period
 */
export function getDisplayPrice(plan: Plan, cycle: BillingCycle): { price: string; period: string; originalPrice?: string } {
    if (plan.monthlyPrice === 0) {
        return { price: 'Gratis', period: '' };
    }

    if (cycle === 'quarterly') {
        // Show monthly equivalent with original monthly price crossed out
        return {
            price: formatPrice(plan.monthlyEquivalent),
            period: '/mnd',
            originalPrice: formatPrice(plan.monthlyPrice),
        };
    }

    return {
        price: formatPrice(plan.monthlyPrice),
        period: '/mnd',
    };
}

/**
 * Get quarterly billing info
 */
export function getQuarterlyBillingInfo(plan: Plan): string {
    if (plan.quarterlyPrice === 0) return '';
    return `Gefactureerd als ${formatPrice(plan.quarterlyPrice)} per kwartaal`;
}

/**
 * Calculate savings percentage
 */
export function calculateSavings(monthlyPrice: number, quarterlyPrice: number): number {
    if (monthlyPrice === 0) return 0;
    const monthlyTotal = monthlyPrice * 3;
    const savings = ((monthlyTotal - quarterlyPrice) / monthlyTotal) * 100;
    return Math.round(savings);
}

/**
 * Get the minimum required plan for a feature
 */
export function getMinimumPlanForFeature(featureName: keyof PlanFeatures, requiredLevel?: string): PlanName | null {
    const planOrder: PlanName[] = ['free', 'essential', 'professional', 'executive'];

    for (const planName of planOrder) {
        const plan = PLANS[planName];
        const featureValue = plan.features[featureName];

        if (typeof featureValue === 'boolean' && featureValue) {
            return planName;
        }

        if (requiredLevel && featureValue === requiredLevel) {
            return planName;
        }
    }

    return null;
}

// ========================================
// TRIAL CONSTANTS
// ========================================

export const TRIAL_DURATION_DAYS = 7;
export const TRIAL_PLAN: PlanName = 'executive'; // Users get Executive features during trial

/**
 * Get trial features (Executive but with PDF export blocked)
 */
export function getTrialFeatures(): PlanFeatures {
    return {
        ...EXECUTIVE_FEATURES,
        pdfDownloads: false, // HARD PAYWALL
    };
}
