'use client';

import { useState, useEffect } from 'react';
import { Shield, UserPlus, Search, Trash2, Edit } from 'lucide-react';
import { getStaffUsersAction, searchUserByEmailAction, updateUserRoleAction } from '../actions';
import type { UserRole } from '@/types/rbac';

interface StaffUser {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
    created_at: string;
}

export default function AccessControlPage() {
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('support');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<UserRole>('support');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadStaffUsers();
    }, []);

    async function loadStaffUsers() {
        setLoading(true);
        const result = await getStaffUsersAction();
        if (result.success && result.data) {
            setStaffUsers(result.data);
        }
        setLoading(false);
    }

    async function handlePromoteUser() {
        if (!searchEmail) {
            setMessage({ type: 'error', text: 'Voer een email adres in' });
            return;
        }

        setLoading(true);
        const userResult = await searchUserByEmailAction(searchEmail);

        if (!userResult.success || !userResult.data) {
            setMessage({ type: 'error', text: 'Gebruiker niet gevonden' });
            setLoading(false);
            return;
        }

        if (userResult.data.role !== 'user') {
            setMessage({ type: 'error', text: 'Deze gebruiker is al staff' });
            setLoading(false);
            return;
        }

        const updateResult = await updateUserRoleAction(userResult.data.id, selectedRole);

        if (updateResult.success) {
            setMessage({ type: 'success', text: 'Gebruiker gepromoveerd!' });
            setSearchEmail('');
            loadStaffUsers();
        } else {
            setMessage({ type: 'error', text: updateResult.error || 'Update mislukt' });
        }

        setLoading(false);
    }

    async function handleUpdateRole(userId: string, newRole: UserRole) {
        setLoading(true);
        const result = await updateUserRoleAction(userId, newRole);

        if (result.success) {
            setMessage({ type: 'success', text: 'Rol bijgewerkt!' });
            setEditingUserId(null);
            loadStaffUsers();
        } else {
            setMessage({ type: 'error', text: result.error || 'Update mislukt' });
        }

        setLoading(false);
    }

    async function handleRevokeAccess(userId: string) {
        if (!confirm('Weet je zeker dat je de toegang wilt intrekken?')) return;

        setLoading(true);
        const result = await updateUserRoleAction(userId, 'user');

        if (result.success) {
            setMessage({ type: 'success', text: 'Toegang ingetrokken' });
            loadStaffUsers();
        } else {
            setMessage({ type: 'error', text: result.error || 'Actie mislukt' });
        }

        setLoading(false);
    }

    const roleLabels: Record<UserRole, string> = {
        super_admin: 'Super Admin',
        support: 'Support',
        content_manager: 'Content Manager',
        user: 'Gebruiker'
    };

    const roleColors: Record<UserRole, string> = {
        super_admin: 'bg-red-100 text-red-800',
        support: 'bg-blue-100 text-blue-800',
        content_manager: 'bg-green-100 text-green-800',
        user: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-cevace-blue" />
                    <h1 className="text-3xl font-bold text-gray-900">Toegangscontrole</h1>
                </div>
                <p className="text-gray-600">Beheer staff rollen en toegangsrechten</p>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Section A: Staff Overview */}
            <div className="bg-white rounded-xl border border-gray-200 mb-8">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-[20px] font-semibold text-gray-900">Medewerkers</h2>
                    <p className="text-sm text-gray-600 mt-1">Overzicht van alle staff members</p>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Laden...</div>
                    ) : staffUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Geen staff members gevonden</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naam</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aangemaakt</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {staffUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.full_name || 'Geen naam'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingUserId === user.id ? (
                                                <select
                                                    value={editRole}
                                                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                                >
                                                    <option value="super_admin">Super Admin</option>
                                                    <option value="support">Support</option>
                                                    <option value="content_manager">Content Manager</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                                                    {roleLabels[user.role]}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString('nl-NL')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {editingUserId === user.id ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateRole(user.id, editRole)}
                                                        className="text-green-600 hover:text-green-800"
                                                        disabled={loading}
                                                    >
                                                        Opslaan
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUserId(null)}
                                                        className="text-gray-600 hover:text-gray-800"
                                                    >
                                                        Annuleer
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setEditingUserId(user.id);
                                                            setEditRole(user.role);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Bewerk rol"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRevokeAccess(user.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Intrekken"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Section B: Promote User */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-[20px] font-semibold text-gray-900 flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Nieuwe medewerker
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Promoveer een gebruiker tot staff</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Adres
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="email"
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    placeholder="gebruiker@email.com"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rol
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cevace-blue focus:border-transparent"
                            >
                                <option value="support">Support</option>
                                <option value="content_manager">Content Manager</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>

                        <div className="md:col-span-1 flex items-end">
                            <button
                                onClick={handlePromoteUser}
                                disabled={loading || !searchEmail}
                                className="w-full bg-cevace-blue hover:bg-blue-900 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Promoveer tot Staff
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
