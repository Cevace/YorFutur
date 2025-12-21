'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { updateUser } from '@/actions/admin';
import Link from 'next/link';

type ProfileData = {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    street: string | null;
    house_number: string | null;
    postal_code: string | null;
    city: string | null;
    phone: string | null;
    user_role: string | null;
    created_at: string;
};

export default function EditUserForm({ user }: { user: ProfileData }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        street: user.street || '',
        house_number: user.house_number || '',
        postal_code: user.postal_code || '',
        city: user.city || '',
        phone: user.phone || '',
        user_role: user.user_role || 'user',
        email: user.email || '',
    });

    const handleSave = async () => {
        console.log('[EditUserForm] handleSave called');
        setIsSaving(true);

        console.log('[EditUserForm] Calling updateUser with:', user.id, formData);
        const result = await updateUser(user.id, formData);
        console.log('[EditUserForm] updateUser result:', result);

        setIsSaving(false);

        if (result.success) {
            console.log('[EditUserForm] Success! Navigating back...');
            // Redirect back to CRM
            window.location.href = '/admin/crm';
        } else {
            console.log('[EditUserForm] Failed:', result.error);
            alert(`Fout bij opslaan: ${result.error}`);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/crm"
                            className="text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900">Gebruiker bewerken</h1>
                            <p className="text-sm text-zinc-500 mt-1">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/admin/crm"
                            className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-100 transition-colors"
                        >
                            Annuleren
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2" style={{ backgroundColor: '#F97315' }}
                        >
                            {isSaving ? (
                                <>Opslaan...</>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Opslaan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 space-y-8">
                {/* NAW Gegevens */}
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4">Gebruikersgegevens</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Voornaam
                            </label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Achternaam
                            </label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Straat
                            </label>
                            <input
                                type="text"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Huisnummer
                            </label>
                            <input
                                type="text"
                                value={formData.house_number}
                                onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Postcode
                            </label>
                            <input
                                type="text"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Woonplaats
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="border-t border-zinc-200 pt-8">
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4">Contact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Telefoon
                            </label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Account */}
                <div className="border-t border-zinc-200 pt-8">
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4">Account</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Role
                            </label>
                            <select
                                value={formData.user_role}
                                onChange={(e) => setFormData({ ...formData, user_role: e.target.value })}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Lid sinds
                            </label>
                            <input
                                type="text"
                                value={new Date(user.created_at).toLocaleDateString('nl-NL', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                                disabled
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm bg-zinc-100 text-zinc-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
