import nextDynamic from 'next/dynamic';

const BetaLoginForm = nextDynamic(() => import('@/components/auth/BetaLoginForm'), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-gray-50 flex items-center justify-center">Laden...</div>
});

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return (
        <BetaLoginForm />
    );
}
