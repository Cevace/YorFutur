import { getCVData } from '@/actions/cv-builder';
import UltimateCVBuilderClient from './client';

export default async function UltimateCVBuilderPage() {
    const initialData = await getCVData();

    return <UltimateCVBuilderClient initialData={initialData} />;
}
