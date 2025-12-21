/**
 * Cevace Pricing System - Main Export
 */

// Types
export * from './types';

// Plan definitions
export {
    PLANS,
    FREE_FEATURES,
    ESSENTIAL_FEATURES,
    PROFESSIONAL_FEATURES,
    EXECUTIVE_FEATURES,
    getPlan,
    getAllPlans,
    getPaidPlans,
    formatPrice,
    getDisplayPrice,
    getQuarterlyBillingInfo,
    calculateSavings,
    getMinimumPlanForFeature,
    TRIAL_DURATION_DAYS,
    TRIAL_PLAN,
    getTrialFeatures,
} from './plans';

// Entitlements
export {
    EntitlementService,
    createEntitlementService,
    checkFeatureAccess,
} from './entitlements';

// Subscription management
export {
    getUserSubscription,
    startTrial,
    upgradeSubscription,
    freezeSubscription,
    cancelSubscription,
    checkTrialExpiry,
    getPlansFromDatabase,
    getMollieProduct,
} from './subscription';
