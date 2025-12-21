'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (newPassword !== confirmPassword) {
            setError('Nieuwe wachtwoorden komen niet overeen');
            return;
        }

        if (newPassword.length < 8) {
            setError('Wachtwoord moet minimaal 8 tekens zijn');
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();

            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                onClose();
                router.refresh();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Er ging iets mis bij het wijzigen van het wachtwoord');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Lock className="text-cevace-orange" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Wachtwoord Wijzigen</h2>
                        <p className="text-sm text-zinc-600">Verander je tijdelijke wachtwoord</p>
                    </div>
                </div>

                {success ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-4">
                        <CheckCircle className="text-green-600" size={20} />
                        <p className="text-green-800 text-sm">Wachtwoord succesvol gewijzigd!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Huidig Wachtwoord (optioneel)
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                                placeholder="eenmalig syndroom"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Nieuw Wachtwoord
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                                placeholder="Minimaal 8 tekens"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Bevestig Nieuw Wachtwoord
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-cevace-orange focus:border-transparent"
                                placeholder="Herhaal wachtwoord"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
                                disabled={loading}
                            >
                                Annuleren
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-cevace-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Wijzigen...' : 'Wachtwoord Wijzigen'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
