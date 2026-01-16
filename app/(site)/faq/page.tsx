import { getFAQSections } from '@/lib/directus';
import FAQAccordion from '@/components/FAQAccordion';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Veelgestelde Vragen | Cevace',
    description: 'Antwoorden op veelgestelde vragen over Cevace, onze diensten en hoe wij je kunnen helpen met je carrière.',
};

export default async function FAQPage() {
    const faqSections = await getFAQSections();

    return (
        <main className="min-h-screen bg-[#F2E9E4]">
            <FAQAccordion sections={faqSections} showLink={false} />
        </main>
    );
}
