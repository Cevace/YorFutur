import { redirect } from 'next/navigation';

// Redirect /home to / for backwards compatibility
// The homepage now lives at the root
export default function HomeRedirect() {
    redirect('/');
}
