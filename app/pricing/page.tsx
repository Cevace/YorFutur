import { Metadata } from 'next';
import PricingPageClient from './PricingPageClient';
import { getAllPlans } from '@/lib/pricing';

export const metadata: Metadata = {
    title: 'Prijzen | Cevace',
    description: 'Kies het plan dat bij jou past. Start vandaag nog met je carrière boost.',
};

export default async function PricingPage() {
    // Get plans from static definition (database will be used when migration is run)
    const plans = getAllPlans();

    return <PricingPageClient plans={plans} />;
}
