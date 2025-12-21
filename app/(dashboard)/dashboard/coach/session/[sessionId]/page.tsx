import { getSession } from '@/actions/interview-coach/sessions';
import { notFound } from 'next/navigation';
import { SimulatorClient } from '@/components/interview-coach/SimulatorClient';

export default async function SessionPage({ params }: { params: { sessionId: string } }) {
    const session = await getSession(params.sessionId);

    if (!session) {
        notFound();
    }

    return <SimulatorClient session={session} />;
}
