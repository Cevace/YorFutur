/**
 * Cevace Pricing System - Entitlements Service
 * 
 * This service handles all feature access checks.
 * CRITICAL: During trial, users have Executive visibility but CANNOT export PDFs.
 */

import {
    PlanFeatures,
    PlanName,
    UserSubscription,
    EntitlementCheck,
    FeatureName,
    TemplateAccess,
    CvTunerLevel,
    JobRadarAccess,
    InterviewCoachLevel,
} from './types';
import { PLANS, getTrialFeatures, EXECUTIVE_FEATURES } from './plans';

// ========================================
// ENTITLEMENT SERVICE
// ========================================

export class EntitlementService {
    private subscription: UserSubscription;

    constructor(subscription: UserSubscription) {
        this.subscription = subscription;
    }

    // ========================================
    // CORE CHECKS
    // ========================================

    /**
     * HARD PAYWALL: Check if user can export PDFs
     * During trial: ALWAYS FALSE
     * Free plan: FALSE
     * Paid plans: TRUE
     */
    canExportPdf(): EntitlementCheck {
        // Frozen accounts cannot export
        if (this.subscription.subscription.status === 'frozen') {
            return {
                hasAccess: false,
                reason: 'frozen_account',
                upgradeRequired: 'essential',
                message: 'Je account is bevroren. Upgrade om door te gaan.',
            };
        }

        // TRIAL HARD PAYWALL
        if (this.subscription.isTrial) {
            return {
                hasAccess: false,
                reason: 'trial_restriction',
                upgradeRequired: 'essential',
                message: 'Upgrade naar Essential om je CV te downloaden.',
            };
        }

        // Free plan cannot export
        if (this.subscription.plan.name === 'free') {
            return {
                hasAccess: false,
                reason: 'plan_limitation',
                upgradeRequired: 'essential',
                message: 'Upgrade naar Essential om je CV te downloaden.',
            };
        }

        return { hasAccess: true };
    }

    /**
     * Check access to CV templates
     */
    canAccessTemplates(requiredAccess: TemplateAccess = 'standard'): EntitlementCheck {
        const features = this.getEffectiveFeatures();
        const accessLevel = this.getAccessLevel(features.cvTemplates, requiredAccess);

        if (!accessLevel.hasAccess) {
            return {
                ...accessLevel,
                message: requiredAccess === 'premium'
                    ? 'Premium templates zijn alleen beschikbaar voor Executive.'
                    : 'Upgrade om alle templates te gebruiken.',
            };
        }

        return { hasAccess: true };
    }

    /**
     * Check access to CV Tuner feature
     */
    canUseCvTuner(requiredLevel: CvTunerLevel = 'basic'): EntitlementCheck {
        const features = this.getEffectiveFeatures();
        const levels: CvTunerLevel[] = ['score_only', 'basic', 'advanced'];
        const currentIndex = levels.indexOf(features.cvTuner);
        const requiredIndex = levels.indexOf(requiredLevel);

        if (currentIndex < requiredIndex) {
            const upgradeTo = requiredLevel === 'advanced' ? 'professional' : 'essential';
            return {
                hasAccess: false,
                reason: 'plan_limitation',
                upgradeRequired: upgradeTo,
                message: requiredLevel === 'advanced'
                    ? 'AI Rewrite is beschikbaar vanaf Professional.'
                    : 'Upgrade naar Essential voor CV tips.',
            };
        }

        return { hasAccess: true };
    }

    /**
     * Check access to LinkedIn Optimizer
     */
    canUseLinkedInOptimizer(): EntitlementCheck {
        const features = this.getEffectiveFeatures();

        if (!features.linkedinOptimizer) {
            return {
                hasAccess: false,
                reason: 'plan_limitation',
                upgradeRequired: 'professional',
                message: 'LinkedIn Optimizer is beschikbaar vanaf Professional.',
            };
        }

        return { hasAccess: true };
    }

    /**
     * Check access to Job Radar
     */
    canUseJobRadar(requiredLevel: JobRadarAccess = 'full'): EntitlementCheck {
        const features = this.getEffectiveFeatures();
        const levels: JobRadarAccess[] = ['limited', 'full', 'priority'];
        const currentIndex = levels.indexOf(features.jobRadar);
        const requiredIndex = levels.indexOf(requiredLevel);

        if (currentIndex < requiredIndex) {
            return {
                hasAccess: false,
                reason: 'plan_limitation',
                upgradeRequired: requiredLevel === 'priority' ? 'professional' : 'essential',
                message: 'Upgrade voor volledige Job Radar toegang.',
            };
        }

        return { hasAccess: true };
    }

    /**
     * Check access to Interview Coach
     */
    canUseInterviewCoach(requiredLevel: InterviewCoachLevel = 'basic'): EntitlementCheck {
        const features = this.getEffectiveFeatures();
        const levels: InterviewCoachLevel[] = ['none', 'basic', 'advanced'];
        const currentIndex = levels.indexOf(features.interviewCoach);
        const requiredIndex = levels.indexOf(requiredLevel);

        if (currentIndex < requiredIndex) {
            return {
                hasAccess: false,
                reason: 'plan_limitation',
                upgradeRequired: requiredLevel === 'advanced' ? 'executive' : 'professional',
                message: requiredLevel === 'advanced'
                    ? 'Advanced Interview Coach is beschikbaar voor Executive.'
                    : 'Interview Coach is beschikbaar vanaf Professional.',
            };
        }

        return { hasAccess: true };
    }

    /**
     * Check access to Assessment Trainer
     */
    canUseAssessmentTrainer(): EntitlementCheck {
        const features = this.getEffectiveFeatures();

        if (!features.assessmentTrainer) {
            return {
                hasAccess: false,
                reason: 'plan_limitation',
                upgradeRequired: 'executive',
                message: 'Assessment Training is alleen beschikbaar voor Executive.',
            };
        }

        return { hasAccess: true };
    }

    /**
     * Check access to Live CV Link
     */
    canUseLiveCvLink(): EntitlementCheck {
        const features = this.getEffectiveFeatures();

        if (!features.liveCvLink) {
            return {
                hasAccess: false,
                reason: 'plan_limitation',
                upgradeRequired: 'professional',
                message: 'Live CV Link is beschikbaar vanaf Professional.',
            };
        }

        return { hasAccess: true };
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    /**
     * Get effective features based on subscription status
     * During trial: Executive features but PDF export blocked
     * Frozen: Free features
     * Active: Plan features
     */
    getEffectiveFeatures(): PlanFeatures {
        const status = this.subscription.subscription.status;

        // Frozen accounts get Free features
        if (status === 'frozen' || status === 'cancelled') {
            return PLANS.free.features;
        }

        // Trial users get Executive features (but PDF blocked separately)
        if (this.subscription.isTrial) {
            return getTrialFeatures();
        }

        // Active subscribers get their plan features
        return this.subscription.plan.features;
    }

    /**
     * Generic access level check
     */
    private getAccessLevel(current: string, required: string): EntitlementCheck {
        const accessOrder: Record<string, number> = {
            'limited': 0,
            'standard': 1,
            'premium': 2,
            'none': 0,
            'basic': 1,
            'advanced': 2,
            'score_only': 0,
            'full': 1,
            'priority': 2,
        };

        const currentLevel = accessOrder[current] ?? 0;
        const requiredLevel = accessOrder[required] ?? 0;

        if (currentLevel >= requiredLevel) {
            return { hasAccess: true };
        }

        return {
            hasAccess: false,
            reason: 'plan_limitation',
        };
    }

    /**
     * Get all feature access as a summary
     */
    getFeatureSummary(): Record<FeatureName, boolean> {
        return {
            cvTemplates: this.canAccessTemplates().hasAccess,
            pdfDownloads: this.canExportPdf().hasAccess,
            motivationLetters: true, // Always some access
            cvTuner: this.canUseCvTuner().hasAccess,
            linkedinOptimizer: this.canUseLinkedInOptimizer().hasAccess,
            jobRadar: this.canUseJobRadar().hasAccess,
            interviewCoach: this.canUseInterviewCoach().hasAccess,
            assessmentTrainer: this.canUseAssessmentTrainer().hasAccess,
            liveCvLink: this.canUseLiveCvLink().hasAccess,
        };
    }
}

// ========================================
// STATIC HELPER FUNCTIONS
// ========================================

/**
 * Create an EntitlementService from a UserSubscription
 */
export function createEntitlementService(subscription: UserSubscription): EntitlementService {
    return new EntitlementService(subscription);
}

/**
 * Quick check if a specific feature is available
 */
export function checkFeatureAccess(
    subscription: UserSubscription,
    feature: FeatureName
): EntitlementCheck {
    const service = new EntitlementService(subscription);

    switch (feature) {
        case 'pdfDownloads':
            return service.canExportPdf();
        case 'cvTemplates':
            return service.canAccessTemplates();
        case 'cvTuner':
            return service.canUseCvTuner();
        case 'linkedinOptimizer':
            return service.canUseLinkedInOptimizer();
        case 'jobRadar':
            return service.canUseJobRadar();
        case 'interviewCoach':
            return service.canUseInterviewCoach();
        case 'assessmentTrainer':
            return service.canUseAssessmentTrainer();
        case 'liveCvLink':
            return service.canUseLiveCvLink();
        default:
            return { hasAccess: true };
    }
}
