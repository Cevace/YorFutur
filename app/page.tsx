import { redirect } from 'next/navigation';

// Root route simply redirects to /home to bypass Next.js bundling bug
export default function RootPage() {
    redirect('/home');
}
