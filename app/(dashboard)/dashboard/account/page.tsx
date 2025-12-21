import { createClient } from '@/utils/supabase/server';
import { User, Mail, Shield, CreditCard, AlertCircle } from 'lucide-react';
import ProfileForm from '@/components/dashboard/ProfileForm';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Determine plan display
    const plan = profile?.subscription_plan || 'free';
    const isPro = plan === 'pro';
    const isTrial = plan === 'trial';

    return (
        <div>
            <h1 className="font-bold text-cevace-blue mb-8" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>Mijn Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Card */}
                <ProfileForm user={user} profile={profile} />

                {/* Subscription Card */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isPro ? 'bg-green-100 text-green-600' : 'bg-orange-50 text-cevace-orange'}`}>
                            <Shield size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Abonnement</h2>
                            <p className="text-gray-500">Je huidige status</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-600">Huidig plan</span>
                            <span className={`text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${isPro ? 'bg-green-600' : 'bg-cevace-blue'}`}>
                                {plan}
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-cevace-blue capitalize">
                            {isPro ? 'Pro Plan' : (isTrial ? 'Trial Periode' : 'Gratis Account')}
                        </div>
                        {isTrial && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                                <AlertCircle size={14} />
                                <span>Proefperiode actief</span>
                            </div>
                        )}
                    </div>

                    {!isPro && (
                        <form action={async () => {
                            'use server';
                            const supabase = createClient();
                            // Mock upgrade
                            await supabase.from('profiles').update({ subscription_plan: 'pro' }).eq('id', user.id);
                            redirect('/dashboard/account');
                        }}>
                            <button className="w-full flex items-center justify-center gap-2 bg-cevace-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/20">
                                <CreditCard size={18} />
                                Upgrade naar Pro
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
