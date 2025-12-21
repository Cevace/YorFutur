/**
 * Cevace Pricing System - Subscription Service
 * 
 * This service handles subscription management, trial logic, and database operations.
 */

import { createClient } from '@/utils/supabase/server';
import {
    Subscription,
    UserSubscription,
    Plan,
    PlanName,
    SubscriptionStatus,
    BillingCycle,
} from './types';
import { PLANS, TRIAL_DURATION_DAYS, TRIAL_PLAN, getTrialFeatures } from './plans';

// ========================================
// SUBSCRIPTION SERVICE
// ========================================

/**
 * Get the current user's subscription with full plan details
 */
export async function getUserSubscription(userId?: string): Promise<UserSubscription | null> {
    const supabase = createClient();

    // Get user if not provided
    if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        userId = user.id;
    }

    // Get subscription with plan details
    const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select(`
            *,
            plan:plans(*)
        `)
        .eq('user_id', userId)
        .single();

    if (error || !subscription) {
        // No subscription found - user might be new
        return null;
    }

    // Parse the subscription
    return parseSubscription(subscription);
}

/**
 * Start a new trial for a user
 * This should be called when a user creates their account
 */
export async function startTrial(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    // Check if user already has a subscription
    const existing = await getUserSubscription(userId);
    if (existing) {
        return { success: false, error: 'User already has a subscription' };
    }

    // Get the Executive plan (trial plan)
    const { data: executivePlan, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('name', TRIAL_PLAN)
        .single();

    if (planError || !executivePlan) {
        return { success: false, error: 'Could not find trial plan' };
    }

    // Calculate trial end date
    const trialStartedAt = new Date();
    const trialEndsAt = new Date(trialStartedAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS);

    // Create subscription
    const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            plan_id: executivePlan.id,
            status: 'trial',
            trial_started_at: trialStartedAt.toISOString(),
            trial_ends_at: trialEndsAt.toISOString(),
        });

    if (insertError) {
        console.error('Error starting trial:', insertError);
        return { success: false, error: insertError.message };
    }

    return { success: true };
}

/**
 * Upgrade user to a paid plan
 * This will be called after successful Mollie payment
 */
export async function upgradeSubscription(
    userId: string,
    planName: PlanName,
    billingCycle: BillingCycle,
    mollieSubscriptionId?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    // Get the plan
    const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('name', planName)
        .single();

    if (planError || !plan) {
        return { success: false, error: 'Plan not found' };
    }

    // Calculate billing period
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'quarterly' ? 3 : 1));

    // Update subscription
    const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
            plan_id: plan.id,
            status: 'active',
            billing_cycle: billingCycle,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            mollie_subscription_id: mollieSubscriptionId,
            updated_at: now.toISOString(),
        })
        .eq('user_id', userId);

    if (updateError) {
        console.error('Error upgrading subscription:', updateError);
        return { success: false, error: updateError.message };
    }

    return { success: true };
}

/**
 * Downgrade user to Free plan (used when trial expires)
 */
export async function freezeSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    // Get the Free plan
    const { data: freePlan, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('name', 'free')
        .single();

    if (planError || !freePlan) {
        return { success: false, error: 'Free plan not found' };
    }

    // Update subscription to frozen
    const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
            plan_id: freePlan.id,
            status: 'frozen',
            billing_cycle: null,
            current_period_start: null,
            current_period_end: null,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    if (updateError) {
        console.error('Error freezing subscription:', updateError);
        return { success: false, error: updateError.message };
    }

    return { success: true };
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    if (error) {
        console.error('Error cancelling subscription:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Check and handle expired trials
 * This should be run as a cron job or on each login
 */
export async function checkTrialExpiry(userId: string): Promise<void> {
    const subscription = await getUserSubscription(userId);

    if (!subscription) return;

    if (subscription.isTrial && subscription.isTrialExpired) {
        // Trial has expired, freeze the account
        await freezeSubscription(userId);
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Parse a database subscription into a UserSubscription object
 */
function parseSubscription(dbSubscription: Record<string, unknown>): UserSubscription {
    const now = new Date();
    const trialEndsAt = dbSubscription.trial_ends_at ? new Date(dbSubscription.trial_ends_at as string) : null;
    const isTrial = dbSubscription.status === 'trial';
    const isTrialExpired = isTrial && trialEndsAt ? trialEndsAt < now : false;

    // Calculate days left in trial
    let daysLeftInTrial = 0;
    if (isTrial && trialEndsAt && !isTrialExpired) {
        const msLeft = trialEndsAt.getTime() - now.getTime();
        daysLeftInTrial = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    }

    // Get plan from database or fallback to static definition
    const dbPlan = dbSubscription.plan as Record<string, unknown>;
    const planName = (dbPlan?.name as PlanName) || 'free';
    const plan: Plan = {
        id: dbPlan?.id as string || '',
        name: planName,
        displayName: dbPlan?.display_name as string || PLANS[planName].displayName,
        headline: dbPlan?.headline as string || PLANS[planName].headline,
        subHeadline: dbPlan?.sub_headline as string || PLANS[planName].subHeadline,
        monthlyPrice: Number(dbPlan?.monthly_price) || PLANS[planName].monthlyPrice,
        quarterlyPrice: Number(dbPlan?.quarterly_price) || PLANS[planName].quarterlyPrice,
        monthlyEquivalent: PLANS[planName].monthlyEquivalent,
        savingsPercentage: PLANS[planName].savingsPercentage,
        features: typeof dbPlan?.features === 'object'
            ? dbPlan.features as typeof PLANS[typeof planName]['features']
            : PLANS[planName].features,
        bullets: Array.isArray(dbPlan?.bullets) ? dbPlan.bullets as string[] : PLANS[planName].bullets,
        ctaText: dbPlan?.cta_text as string || PLANS[planName].ctaText,
        sortOrder: Number(dbPlan?.sort_order) || PLANS[planName].sortOrder,
        isHighlighted: Boolean(dbPlan?.is_highlighted),
    };

    // Determine if user can export PDF
    // CRITICAL: Trial users CANNOT export
    const canExportPdf = !isTrial &&
        dbSubscription.status !== 'frozen' &&
        planName !== 'free';

    // Get effective features (trial gets Executive features but PDF blocked)
    const effectiveFeatures = isTrial ? getTrialFeatures() : plan.features;

    const subscription: Subscription = {
        id: dbSubscription.id as string,
        userId: dbSubscription.user_id as string,
        planId: dbSubscription.plan_id as string,
        status: dbSubscription.status as SubscriptionStatus,
        billingCycle: dbSubscription.billing_cycle as BillingCycle | null,
        trialStartedAt: new Date(dbSubscription.trial_started_at as string),
        trialEndsAt: trialEndsAt || new Date(),
        currentPeriodStart: dbSubscription.current_period_start
            ? new Date(dbSubscription.current_period_start as string)
            : null,
        currentPeriodEnd: dbSubscription.current_period_end
            ? new Date(dbSubscription.current_period_end as string)
            : null,
        mollieCustomerId: dbSubscription.mollie_customer_id as string | null,
        mollieSubscriptionId: dbSubscription.mollie_subscription_id as string | null,
        createdAt: new Date(dbSubscription.created_at as string),
        updatedAt: new Date(dbSubscription.updated_at as string),
    };

    return {
        subscription,
        plan,
        isTrial,
        isTrialExpired,
        daysLeftInTrial,
        canExportPdf,
        effectiveFeatures,
    };
}

/**
 * Get all plans from database
 */
export async function getPlansFromDatabase(): Promise<Plan[]> {
    const supabase = createClient();

    const { data: plans, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error || !plans) {
        // Fallback to static plans
        return Object.values(PLANS);
    }

    return plans.map(dbPlan => ({
        id: dbPlan.id,
        name: dbPlan.name as PlanName,
        displayName: dbPlan.display_name,
        headline: dbPlan.headline,
        subHeadline: dbPlan.sub_headline,
        monthlyPrice: Number(dbPlan.monthly_price),
        quarterlyPrice: Number(dbPlan.quarterly_price),
        monthlyEquivalent: Number(dbPlan.quarterly_price) / 3,
        savingsPercentage: PLANS[dbPlan.name as PlanName]?.savingsPercentage || 0,
        features: dbPlan.features,
        bullets: dbPlan.bullets || [],
        ctaText: dbPlan.cta_text,
        sortOrder: dbPlan.sort_order,
        isHighlighted: dbPlan.is_highlighted,
    }));
}

/**
 * Get Mollie product for a plan and billing cycle
 */
export async function getMollieProduct(planName: PlanName, billingCycle: BillingCycle): Promise<{ sku: string; price: number } | null> {
    const supabase = createClient();

    const { data: product, error } = await supabase
        .from('mollie_products')
        .select('sku, price')
        .eq('billing_cycle', billingCycle)
        .eq('plan_id', (
            await supabase
                .from('plans')
                .select('id')
                .eq('name', planName)
                .single()
        ).data?.id)
        .single();

    if (error || !product) {
        return null;
    }

    return {
        sku: product.sku,
        price: Number(product.price),
    };
}
