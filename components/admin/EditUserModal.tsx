'use client';

import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { updateUser } from '@/actions/admin';

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

export default function EditUserModal({
    user,
    isOpen,
    onClose
}: {
    user: ProfileData;
    isOpen: boolean;
    onClose: () => void;
}) {
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
    });

    const handleSave = async () => {
        setIsSaving(true);

        try {
            const result = await updateUser(user.id, formData);
            setIsSaving(false);

            if (result.success) {
                // Close modal and let parent handle refresh
                onClose();
                // Trigger page reload after a small delay to ensure state is updated
                setTimeout(() => window.location.reload(), 100);
            } else {
                alert(`Fout bij opslaan: ${result.error}`);
            }
        } catch (error) {
            console.error('Exception in handleSave:', error);
            setIsSaving(false);
            alert('Er is een fout opgetreden bij het opslaan');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Edit2 className="w-5 h-5 text-zinc-500" />
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900">Gebruiker bewerken</h2>
                            <p className="text-sm text-zinc-500">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                    {/* NAW Gegevens */}
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-3">Naw gegevens</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Voornaam</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Achternaam</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Straat</label>
                                <input
                                    type="text"
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Huisnummer</label>
                                <input
                                    type="text"
                                    value={formData.house_number}
                                    onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Postcode</label>
                                <input
                                    type="text"
                                    value={formData.postal_code}
                                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Woonplaats</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-3">Contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Telefoon</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-3">Account</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Role</label>
                                <select
                                    value={formData.user_role}
                                    onChange={(e) => setFormData({ ...formData, user_role: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/*  Actions */}
                <div className="sticky bottom-0 bg-zinc-50 border-t border-zinc-200 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-100 transition-colors"
                        disabled={isSaving}
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-zinc-900 text-white rounded-lg font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        disabled={isSaving}
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
    );
}
