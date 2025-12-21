'use client';

import { useState } from 'react';
import { updateProfile } from '@/actions/profile';
import { User, Mail, MapPin, Phone, Save } from 'lucide-react';

interface ProfileFormProps {
    user: any;
    profile: any;
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        const result = await updateProfile(formData);
        setIsPending(false);

        if (result?.success) {
            setIsEditing(false);
        } else {
            alert('Er ging iets mis: ' + result?.error);
        }
    }

    if (!isEditing) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-cevace-blue text-white rounded-full flex items-center justify-center text-2xl font-bold">
                            {profile?.first_name?.[0] || user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'Profielgegevens'}
                            </h2>
                            <p className="text-gray-500">Beheer je persoonlijke informatie</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-cevace-orange hover:text-orange-700 font-medium text-sm"
                    >
                        Wijzigen
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Emailadres</label>
                        <div className="flex items-center gap-3 text-gray-900 font-medium">
                            <Mail size={18} className="text-cevace-orange" />
                            {user.email}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Telefoonnummer</label>
                        <div className="flex items-center gap-3 text-gray-900">
                            <Phone size={18} className="text-cevace-orange" />
                            {profile?.phone || '-'}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Adres</label>
                        <div className="flex items-start gap-3 text-gray-900">
                            <MapPin size={18} className="text-cevace-orange mt-1" />
                            <div>
                                {profile?.address ? (
                                    <>
                                        {profile.address}<br />
                                        {profile.postal_code} {profile.city}
                                    </>
                                ) : (
                                    '-'
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Gegevens Wijzigen</h2>
                <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    Annuleren
                </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Voornaam</label>
                        <input name="firstName" defaultValue={profile?.first_name} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Achternaam</label>
                        <input name="lastName" defaultValue={profile?.last_name} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer</label>
                    <input name="phone" defaultValue={profile?.phone} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Straat + Huisnummer</label>
                    <input name="address" defaultValue={profile?.address} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                        <input name="postalCode" defaultValue={profile?.postal_code} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stad</label>
                        <input name="city" defaultValue={profile?.city} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cevace-orange focus:border-transparent outline-none" />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-2 bg-cevace-orange text-white py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {isPending ? 'Opslaan...' : 'Opslaan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
