import { getCVData } from '@/actions/cv-builder';
import { getTunerSession } from '@/actions/cv-tuner-sessions';
import UltimateCVBuilderClient from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CV Builder | Cevace',
    description: 'Maak je professionele CV met de Cevace CV Builder',
    icons: {
        icon: '/favicon.ico',
    },
};
type PageProps = {
    searchParams: { session?: string };
};

export default async function UltimateCVBuilderPage({ searchParams }: PageProps) {
    let initialData = await getCVData();
    let tunerData = null;

    // Check if coming from CV Tuner with session
    if (searchParams.session) {
        const sessionResult = await getTunerSession(searchParams.session);

        if (sessionResult.success && sessionResult.data) {
            // Override with optimized data from Tuner
            let optimizedData = sessionResult.data.optimizedCvData as any;

            // ADAPTER: Handle legacy sessions with plural keys (experiences/educations)
            if (!optimizedData.experience && optimizedData.experiences) {
                optimizedData.experience = optimizedData.experiences;
            }
            if (!optimizedData.education && optimizedData.educations) {
                optimizedData.education = optimizedData.educations;
            }

            // Ensure required arrays exist to prevent crashes
            initialData = {
                ...optimizedData,
                experience: Array.isArray(optimizedData.experience) ? optimizedData.experience : [],
                education: Array.isArray(optimizedData.education) ? optimizedData.education : [],
                skills: Array.isArray(optimizedData.skills) ? optimizedData.skills : [],
                languages: Array.isArray(optimizedData.languages) ? optimizedData.languages : [],
                personal: optimizedData.personal || {}
            };

            tunerData = {
                vacancyTitle: sessionResult.data.vacancyTitle,
                initialScore: sessionResult.data.initialScore,
                optimizedScore: sessionResult.data.optimizedScore,
                keywordsAdded: sessionResult.data.keywordsAdded,
                recommendedTemplate: sessionResult.data.recommendedTemplate
            };

            console.log('[Builder] Loaded & Normalized Tuner session:', searchParams.session);
        } else {
            console.warn('[Builder] Failed to load session:', sessionResult.error);
        }
    }

    return <UltimateCVBuilderClient initialData={initialData} tunerData={tunerData} />;
}
