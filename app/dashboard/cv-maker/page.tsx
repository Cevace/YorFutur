import { checkProfileCompleteness } from '@/actions/profile-completeness';
import { OnboardingFlow } from '@/components/cv-builder/OnboardingFlow';

export const metadata = {
    title: 'CV Maker - Cevace',
    description: 'Maak je perfecte CV met AI-optimalisatie en professionele templates'
};

export default async function CVMakerPage() {
    // Check profile completeness server-side
    const completeness = await checkProfileCompleteness();

    return (
        <div className="min-h-screen bg-gradient-to-br from-cv-beige via-white to-cv-beige/50">
            <OnboardingFlow initialCompleteness={completeness} />
        </div>
    );
}
