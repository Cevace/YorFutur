import { getApplication } from '@/actions/interview-coach/applications';
import { createSession } from '@/actions/interview-coach/sessions';
import { redirect } from 'next/navigation';

export default async function StartSessionPage({ params }: { params: { applicationId: string } }) {
    const application = await getApplication(params.applicationId);

    if (!application) {
        redirect('/dashboard/coach');
    }

    // Check if there's already an active session
    const activeSession = application.sessions?.find(s => !s.completed_at);

    if (activeSession) {
        // Resume existing session
        redirect(`/dashboard/coach/session/${activeSession.id}`);
    }

    // Create new session
    const result = await createSession(params.applicationId);

    if (result.success && result.data) {
        redirect(`/dashboard/coach/session/${result.data.id}`);
    }

    // If failed, redirect back
    redirect('/dashboard/coach');
}
