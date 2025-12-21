'use client';

import { useState } from 'react';
import {
    Users, Search, Bell, ArrowUpRight, LayoutTemplate,
    Database, Filter, Plus, CheckCircle, Euro
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

type User = {
    email?: string | null;
};

type RecentUser = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
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

export default function AdminContent({
    user,
    totalUsers,
    recentUsers
}: {
    user: User;
    totalUsers: number;
    recentUsers: RecentUser[];
}) {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [showAddUser, setShowAddUser] = useState(false);

    return (
        <>
            <div className="space-y-8 p-8" style={{ backgroundColor: '#F2E9E4' }}>
                {/* Top Bar with Search */}
                <div className="flex items-center justify-between">
                    <nav className="flex items-center text-sm text-zinc-400 gap-2">
                        <span className="hover:text-zinc-600 cursor-pointer transition-colors">Dashboard</span>
                        <span className="text-zinc-300">/</span>
                        <span className="text-zinc-900 font-medium">Admin</span>
                    </nav>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Zoek gebruiker..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:bg-white transition-all w-64 placeholder:text-zinc-400"
                            />
                        </div>
                        <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </div>

                {/* Stats & Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {/* Stat Card 1 */}
                    <div className="p-5 bg-white rounded-lg border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-zinc-50 rounded-md text-zinc-500 border border-zinc-100">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                        </div>
                        <p className="text-sm text-zinc-500 font-medium">Totaal gebruikers</p>
                        <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight mt-1">{totalUsers.toLocaleString()}</h3>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="p-5 bg-white rounded-lg border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-zinc-50 rounded-md text-zinc-500 border border-zinc-100">
                                <Euro className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Live</span>
                        </div>
                        <p className="text-sm text-zinc-500 font-medium">Maandelijkse omzet</p>
                        <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight mt-1">€-</h3>
                    </div>

                    {/* Quick Action: Password */}
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="group relative p-5 bg-zinc-900 rounded-lg border border-zinc-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden text-left"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-24 h-24 text-white transform rotate-12 translate-x-6 -translate-y-6" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="p-2 w-fit bg-zinc-800 rounded-md text-zinc-300 border border-zinc-700 mb-4">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white tracking-tight">Wachtwoord</h3>
                                <p className="text-xs text-zinc-400 mt-1">Wijzig je wachtwoord</p>
                            </div>
                        </div>
                    </button>

                    {/* Quick Action: CMS */}
                    <a
                        href="/keystatic"
                        target="_blank"
                        className="group relative p-5 bg-white rounded-lg border border-zinc-200 shadow-sm hover:shadow-lg hover:border-zinc-300 hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <LayoutTemplate className="w-24 h-24 text-zinc-900 transform -rotate-12 translate-x-6 -translate-y-6" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="p-2 w-fit bg-zinc-100 rounded-md text-zinc-500 border border-zinc-200 mb-4">
                                <LayoutTemplate className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-zinc-900 tracking-tight">Open cms</h3>
                                <p className="text-xs text-zinc-500 mt-1">Bewerk site content</p>
                            </div>
                        </div>
                    </a>
                </div>

                {/* CRM Table */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                            <Database className="w-4 h-4 text-zinc-400" />
                            CRM gebruikersgegevens
                        </h2>
                        <div className="flex gap-2">
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                            >
                                <option value="all">Alle rollen</option>
                                <option value="user">Gebruiker</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button
                                onClick={() => setShowAddUser(true)}
                                className="px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90 transition-colors flex items-center gap-2"
                                style={{ backgroundColor: '#4A4E69' }}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Nieuwe gebruiker
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-500">
                                <thead className="bg-zinc-50 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-3">Gebruiker</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Aangemeld op</th>
                                        <th className="px-6 py-3 text-right">Actie</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {recentUsers
                                        .filter(recentUser => {
                                            // Search filter with null safety
                                            const fullName = `${recentUser.first_name || ''} ${recentUser.last_name || ''}`.trim();
                                            const email = recentUser.email || '';

                                            const matchesSearch = searchQuery === '' ||
                                                fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                email.toLowerCase().includes(searchQuery.toLowerCase());

                                            // Role filter
                                            const matchesRole = filterRole === 'all' || recentUser.user_role === filterRole;

                                            return matchesSearch && matchesRole;
                                        })
                                        .map((recentUser, index) => (
                                            <tr key={recentUser.id} className="group hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getAvatarColor(index)}`}>
                                                            {getUserInitials(recentUser.first_name, recentUser.last_name, recentUser.email)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-zinc-900">
                                                                {recentUser.first_name && recentUser.last_name
                                                                    ? `${recentUser.first_name} ${recentUser.last_name}`
                                                                    : 'Anonymous'}
                                                            </p>
                                                            <p className="text-xs text-zinc-400">{recentUser.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        Actief
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600">
                                                    {recentUser.user_role || 'user'}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600">
                                                    {new Date(recentUser.created_at).toLocaleDateString('nl-NL', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-zinc-400 hover:text-zinc-900 transition-colors font-medium text-xs border border-zinc-200 px-3 py-1.5 rounded hover:bg-white hover:border-zinc-300">
                                                        Beheer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
                            <span className="text-xs text-zinc-500">Toont {recentUsers.length} van {totalUsers} gebruikers</span>
                            <div className="flex gap-1">
                                <button className="px-2 py-1 border border-zinc-200 bg-white rounded text-xs text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-50">Vorige</button>
                                <button className="px-2 py-1 border border-zinc-200 bg-white rounded text-xs text-zinc-500 hover:border-zinc-300 hover:text-zinc-900">Volgende</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / System Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
                        <h3 className="font-medium text-zinc-900 mb-4" style={{ fontSize: '20px' }}>Recente systeemactiviteiten</h3>
                        <div className="space-y-4">
                            {recentUsers.slice(0, 3).map((user, index) => {
                                const createdAt = new Date(user.created_at);
                                const now = new Date();
                                const diffMs = now.getTime() - createdAt.getTime();
                                const diffMins = Math.floor(diffMs / 60000);
                                const diffHours = Math.floor(diffMs / 3600000);
                                const diffDays = Math.floor(diffMs / 86400000);

                                let timeAgo;
                                if (diffMins < 60) {
                                    timeAgo = `${diffMins} ${diffMins === 1 ? 'minuut' : 'minuten'} geleden`;
                                } else if (diffHours < 24) {
                                    timeAgo = `${diffHours} ${diffHours === 1 ? 'uur' : 'uur'} geleden`;
                                } else {
                                    timeAgo = `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`;
                                }

                                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-zinc-300'];

                                return (
                                    <div key={user.id} className="flex gap-3">
                                        <div className={`w-2 h-2 mt-2 rounded-full ${colors[index % 3]} shrink-0`}></div>
                                        <div>
                                            <p className="text-sm text-zinc-800">
                                                {user.first_name && user.last_name
                                                    ? `${user.first_name} ${user.last_name}`
                                                    : 'Nieuwe gebruiker'} geregistreerd
                                            </p>
                                            <p className="text-xs text-zinc-400">{timeAgo} • Signup Flow</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm text-white">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-medium text-white" style={{ fontSize: '20px' }}>Server status</h3>
                            <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1 text-zinc-400">
                                    <span>CPU Gebruik</span>
                                    <span>24%</span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1 text-zinc-400">
                                    <span>Geheugen</span>
                                    <span>48%</span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '48%' }}></div>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-4 text-xs text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    Database Online
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    API V2.0
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </>
    );
}
