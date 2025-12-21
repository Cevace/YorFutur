'use server';

/**
 * Cevace Pricing System - Server Actions
 * 
 * These are the Next.js server actions for subscription management.
 */

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import {
    getUserSubscription,
    startTrial,
    upgradeSubscription,
    freezeSubscription,
    cancelSubscription,
    checkTrialExpiry,
    getMollieProduct,
} from '@/lib/pricing';
import { PlanName, BillingCycle, SubscriptionResponse, UpgradeResponse } from '@/lib/pricing/types';

// ========================================
// GET CURRENT SUBSCRIPTION
// ========================================

export async function getCurrentSubscription(): Promise<SubscriptionResponse> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Niet ingelogd' };
        }

        // Check for expired trial
        await checkTrialExpiry(user.id);

        // Get subscription
        const subscription = await getUserSubscription(user.id);

        if (!subscription) {
            // New user without subscription - start trial
            const trialResult = await startTrial(user.id);
            if (!trialResult.success) {
                return { success: false, error: trialResult.error };
            }

            // Get the newly created subscription
            const newSubscription = await getUserSubscription(user.id);
            return { success: true, data: newSubscription || undefined };
        }

        return { success: true, data: subscription };
    } catch (error) {
        console.error('Error getting subscription:', error);
        return { success: false, error: 'Er ging iets mis' };
    }
}

// ========================================
// START TRIAL
// ========================================

export async function startUserTrial(): Promise<SubscriptionResponse> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Niet ingelogd' };
        }

        const result = await startTrial(user.id);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        revalidatePath('/dashboard');

        const subscription = await getUserSubscription(user.id);
        return { success: true, data: subscription || undefined };
    } catch (error) {
        console.error('Error starting trial:', error);
        return { success: false, error: 'Er ging iets mis bij het starten van de trial' };
    }
}

// ========================================
// INITIATE UPGRADE (Create Mollie checkout)
// ========================================

export async function initiateUpgrade(
    planName: PlanName,
    billingCycle: BillingCycle
): Promise<UpgradeResponse> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Niet ingelogd' };
        }

        // Get the Mollie product
        const product = await getMollieProduct(planName, billingCycle);

        if (!product) {
            return { success: false, error: 'Product niet gevonden' };
        }

        // TODO: Create Mollie checkout session
        // For now, return a mock checkout URL
        // This will be replaced with actual Mollie integration

        const mockCheckoutUrl = `/checkout?plan=${planName}&cycle=${billingCycle}&sku=${product.sku}&price=${product.price}`;

        return { success: true, checkoutUrl: mockCheckoutUrl };
    } catch (error) {
        console.error('Error initiating upgrade:', error);
        return { success: false, error: 'Er ging iets mis bij het upgraden' };
    }
}

// ========================================
// COMPLETE UPGRADE (Called after Mollie webhook)
// ========================================

export async function completeUpgrade(
    userId: string,
    planName: PlanName,
    billingCycle: BillingCycle,
    mollieSubscriptionId: string
): Promise<SubscriptionResponse> {
    try {
        const result = await upgradeSubscription(userId, planName, billingCycle, mollieSubscriptionId);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        revalidatePath('/dashboard');

        const subscription = await getUserSubscription(userId);
        return { success: true, data: subscription || undefined };
    } catch (error) {
        console.error('Error completing upgrade:', error);
        return { success: false, error: 'Er ging iets mis bij het activeren' };
    }
}

// ========================================
// CANCEL SUBSCRIPTION
// ========================================

export async function cancelUserSubscription(): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Niet ingelogd' };
        }

        // TODO: Cancel Mollie subscription first

        const result = await cancelSubscription(user.id);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return { success: false, error: 'Er ging iets mis bij het opzeggen' };
    }
}

// ========================================
// CHECK FEATURE ACCESS
// ========================================

export async function checkCanExportPdf(): Promise<{ allowed: boolean; message?: string }> {
    try {
        const result = await getCurrentSubscription();

        if (!result.success || !result.data) {
            return { allowed: false, message: 'Geen actief abonnement' };
        }

        if (!result.data.canExportPdf) {
            return {
                allowed: false,
                message: result.data.isTrial
                    ? 'Upgrade naar Essential om je CV te downloaden.'
                    : 'Deze functie is niet beschikbaar in je huidige plan.'
            };
        }

        return { allowed: true };
    } catch (error) {
        console.error('Error checking PDF export:', error);
        return { allowed: false, message: 'Er ging iets mis' };
    }
}
