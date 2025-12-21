/**
 * Cevace Pricing System - Type Definitions
 * 
 * These types define the structure for plans, subscriptions, and entitlements.
 */

// ========================================
// PLAN TYPES
// ========================================

export type PlanName = 'free' | 'essential' | 'professional' | 'executive';
export type SubscriptionStatus = 'trial' | 'active' | 'frozen' | 'cancelled';
export type BillingCycle = 'monthly' | 'quarterly';

// Feature access levels
export type TemplateAccess = 'limited' | 'standard' | 'premium';
export type LetterAccess = 'limited' | 'unlimited';
export type CvTunerLevel = 'score_only' | 'basic' | 'advanced';
export type JobRadarAccess = 'limited' | 'full' | 'priority';
export type InterviewCoachLevel = 'none' | 'basic' | 'advanced';

// ========================================
// PLAN FEATURES INTERFACE
// ========================================

export interface PlanFeatures {
    cvTemplates: TemplateAccess;
    pdfDownloads: boolean;
    motivationLetters: LetterAccess;
    cvTuner: CvTunerLevel;
    linkedinOptimizer: boolean;
    jobRadar: JobRadarAccess;
    interviewCoach: InterviewCoachLevel;
    assessmentTrainer: boolean;
    liveCvLink: boolean;
}

// ========================================
// PLAN INTERFACE
// ========================================

export interface Plan {
    id: string;
    name: PlanName;
    displayName: string;
    headline: string;
    subHeadline: string;
    monthlyPrice: number;
    quarterlyPrice: number;
    monthlyEquivalent: number; // quarterlyPrice / 3
    savingsPercentage: number; // Savings vs monthly
    features: PlanFeatures;
    bullets: string[];
    ctaText: string;
    sortOrder: number;
    isHighlighted: boolean;
}

// ========================================
// SUBSCRIPTION INTERFACE
// ========================================

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    billingCycle: BillingCycle | null;
    trialStartedAt: Date;
    trialEndsAt: Date;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    mollieCustomerId: string | null;
    mollieSubscriptionId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ========================================
// USER SUBSCRIPTION (with plan details)
// ========================================

export interface UserSubscription {
    subscription: Subscription;
    plan: Plan;
    isTrial: boolean;
    isTrialExpired: boolean;
    daysLeftInTrial: number;
    canExportPdf: boolean;
    effectiveFeatures: PlanFeatures;
}

// ========================================
// MOLLIE PRODUCT INTERFACE
// ========================================

export interface MollieProduct {
    id: string;
    sku: string;
    planId: string;
    billingCycle: BillingCycle;
    price: number;
    description: string;
}

// ========================================
// PRICING DISPLAY TYPES
// ========================================

export interface PricingCardData {
    plan: Plan;
    displayPrice: string; // Formatted price string
    displayPeriod: string; // "/ maand" or "/ kwartaal"
    originalPrice?: string; // For showing crossed-out monthly price
    savings?: string; // "Bespaar 20%"
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface SubscriptionResponse {
    success: boolean;
    data?: UserSubscription;
    error?: string;
}

export interface UpgradeResponse {
    success: boolean;
    checkoutUrl?: string;
    error?: string;
}

// ========================================
// ENTITLEMENT CHECK TYPES
// ========================================

export type FeatureName = keyof PlanFeatures;

export interface EntitlementCheck {
    hasAccess: boolean;
    reason?: 'trial_restriction' | 'plan_limitation' | 'frozen_account';
    upgradeRequired?: PlanName;
    message?: string;
}
