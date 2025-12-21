'use client';

import { useState } from 'react';
import { Search, Filter, Trash2, X, AlertTriangle, Edit2, Plus } from 'lucide-react';
import { deleteUser, updateUser } from '@/actions/admin';
import { createBetaUser } from '@/actions/admin-invite';
import { useRouter } from 'next/navigation';
import EditUserModal from './EditUserModal';
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

const getUserInitials = (firstName?: string | null, lastName?: string | null, email?: string) => {
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
        return email.substring(0, 2).toUpperCase();
    }
    return '??';
};

const getAvatarColor = (index: number) => {
    const colors = [
        'bg-blue-100 text-blue-600',
        'bg-purple-100 text-purple-600',
        'bg-amber-100 text-amber-600',
        'bg-rose-100 text-rose-600',
        'bg-emerald-100 text-emerald-600',
        'bg-cyan-100 text-cyan-600',
    ];
    return colors[index % colors.length];
};

const getDaysSinceRegistration = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export default function CRMClient({ users, totalCount }: { users: ProfileData[]; totalCount: number }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<ProfileData | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState<Partial<ProfileData>>({});
    const [showEditModal, setShowEditModal] = useState(false);

    // Invite Modal State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteName, setInviteName] = useState('');
    const [inviteResult, setInviteResult] = useState<{ email: string, password: string } | null>(null);
    const [isInviting, setIsInviting] = useState(false);

    const router = useRouter();

    const handleInviteUser = async () => {
        setIsInviting(true);
        const res = await createBetaUser(inviteName);
        setIsInviting(false);
        if (res.success && res.credentials) {
            setInviteResult(res.credentials);
        } else {
            alert('Fout bij aanmaken: ' + res.error);
        }
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        return (
            user.email?.toLowerCase().includes(searchLower) ||
            user.first_name?.toLowerCase().includes(searchLower) ||
            user.last_name?.toLowerCase().includes(searchLower) ||
            user.city?.toLowerCase().includes(searchLower)
        );
    });

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        setIsDeleting(true);
        const result = await deleteUser(selectedUser.id);
        setIsDeleting(false);

        if (result.success) {
            setShowDeleteConfirm(false);
            setSelectedUser(null);
            router.refresh();
        } else {
            alert(`Fout bij verwijderen: ${result.error}`);
        }
    };

    return (
        <>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
                        CRM Gebruikersbeheer
                    </h1>
                    <p className="text-zinc-600">Beheer alle gebruikersprofielen en abonnementen</p>
                </div>

                {/* Search & Filters */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Zoek op naam, email, stad..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-3 py-2 text-sm font-bold text-white bg-cevace-orange rounded-md hover:bg-opacity-90 transition-colors flex items-center gap-2"
                        style={{ backgroundColor: '#F97315' }}
                    >
                        <Plus className="w-4 h-4" />
                        Nieuwe Gebruiker
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-zinc-200 rounded-lg p-4">
                        <p className="text-sm text-zinc-500">Totaal Gebruikers</p>
                        <p className="text-2xl font-bold text-zinc-900">{totalCount}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-lg p-4">
                        <p className="text-sm text-zinc-500">Actieve Gebruikers</p>
                        <p className="text-2xl font-bold text-emerald-600">{filteredUsers.length}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-lg p-4">
                        <p className="text-sm text-zinc-500">Vandaag Geregistreerd</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {users.filter(u => getDaysSinceRegistration(u.created_at) === 0).length}
                        </p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
                                <tr>
                                    <th className="px-6 py-3">Gebruiker</th>
                                    <th className="px-6 py-3">Locatie</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Lid sinds</th>
                                    <th className="px-6 py-3 text-right">Actie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredUsers.map((user, index) => (
                                    <tr
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className="hover:bg-zinc-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getAvatarColor(index)}`}>
                                                    {getUserInitials(user.first_name, user.last_name, user.email)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-900">
                                                        {user.first_name && user.last_name
                                                            ? `${user.first_name} ${user.last_name}`
                                                            : 'Geen naam'}
                                                    </p>
                                                    <p className="text-xs text-zinc-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">
                                            {user.city || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.user_role === 'admin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-zinc-100 text-zinc-700'
                                                }`}>
                                                {user.user_role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">
                                            {getDaysSinceRegistration(user.created_at)} dagen
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUser(user);
                                                }}
                                                className="text-zinc-400 hover:text-zinc-900 transition-colors font-medium text-xs border border-zinc-200 px-3 py-1.5 rounded hover:bg-white hover:border-zinc-300"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${getAvatarColor(0)}`}>
                                    {getUserInitials(selectedUser.first_name, selectedUser.last_name, selectedUser.email)}
                                </div>
                                <div>
                                    <h2 className="text-[28px] font-bold text-zinc-900">
                                        {selectedUser.first_name && selectedUser.last_name
                                            ? `${selectedUser.first_name} ${selectedUser.last_name}`
                                            : 'Geen naam'}
                                    </h2>
                                    <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/crm/edit/${selectedUser.id}`}
                                    className="px-4 py-2 text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 text-sm" style={{ backgroundColor: '#F97315' }}
                                >
                                    <Edit2 size={16} />
                                    Bewerken
                                </Link>
                                <button onClick={() => setSelectedUser(null)} className="text-zinc-400 hover:text-zinc-900">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* NAW Gegevens */}
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-3">Gebruikersgegevens</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Voornaam</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedUser.first_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Achternaam</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedUser.last_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Straat</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedUser.street || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Huisnummer</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedUser.house_number || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Postcode</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedUser.postal_code || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Woonplaats</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedUser.city || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-3">Contact</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Email</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Telefoon</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedUser.phone || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Accountgegevens */}
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-3">Account</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Role</p>
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${selectedUser.user_role === 'admin'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-zinc-100 text-zinc-700'
                                            }`}>
                                            {selectedUser.user_role || 'user'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Abonnement</p>
                                        <p className="text-sm font-medium text-zinc-900">Gratis</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Geregistreerd op</p>
                                        <p className="text-sm font-medium text-zinc-900">
                                            {new Date(selectedUser.created_at).toLocaleDateString('nl-NL', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Lid sinds</p>
                                        <p className="text-sm font-medium text-zinc-900">
                                            {getDaysSinceRegistration(selectedUser.created_at)} dagen
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="border-t border-zinc-200 pt-6">
                                <h3 className="text-lg font-semibold text-red-900 mb-3">Danger zone</h3>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-red-600 hover:text-red-800 underline font-medium text-sm transition-colors"
                                >
                                    Gebruiker verwijderen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedUser && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900">Gebruiker Verwijderen?</h3>
                        </div>
                        <p className="text-zinc-600 mb-6">
                            Weet je zeker dat je <strong>{selectedUser.first_name} {selectedUser.last_name}</strong> ({selectedUser.email}) wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>Verwijderen...</>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Verwijderen
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                />
            )}

            {/* Invite Beta User Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-lg font-bold text-zinc-900">Nieuwe Beta Gebruiker</h3>
                        </div>

                        {!inviteResult ? (
                            <>
                                <p className="text-zinc-600 mb-6">
                                    Maak een nieuwe gebruiker aan. Deze krijgt direct een <strong>PRO (Beta)</strong> abonnement.
                                </p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Naam</label>
                                        <input
                                            type="text"
                                            value={inviteName}
                                            onChange={(e) => setInviteName(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                            placeholder="Jan Jansen"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setShowInviteModal(false)}
                                            className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
                                            disabled={isInviting}
                                        >
                                            Annuleren
                                        </button>
                                        <button
                                            onClick={handleInviteUser}
                                            disabled={!inviteName || isInviting}
                                            className="flex-1 px-4 py-2 bg-cevace-orange text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50"
                                            style={{ backgroundColor: '#F97315' }}
                                        >
                                            {isInviting ? 'Genereren...' : 'Genereren'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                    <p className="text-green-800 font-medium mb-2">Gebruiker aangemaakt! 🎉</p>
                                    <p className="text-sm text-green-700 mb-4">Kopieer deze gegevens en stuur ze naar de gebruiker.</p>

                                    <div className="space-y-2">
                                        <div className="bg-white p-2 rounded border border-green-200 flex justify-between items-center">
                                            <code className="text-sm">{inviteResult.email}</code>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-green-200 flex justify-between items-center">
                                            <code className="text-sm">{inviteResult.password}</code>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setInviteResult(null);
                                        setInviteName('');
                                        setShowInviteModal(false);
                                        router.refresh();
                                    }}
                                    className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Sluiten
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
