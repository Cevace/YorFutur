'use client';

import { useState } from 'react';
import {
    LayoutDashboard, Users, Layers, CreditCard, BarChart3,
    Menu, Search, Bell, ArrowUpRight, LayoutTemplate,
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

export default function AdminClient({
    user,
    totalUsers,
    recentUsers
}: {
    user: User;
    totalUsers: number;
    recentUsers: RecentUser[];
}) {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <div className="bg-zinc-50 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white h-screen flex overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className={`w-64 border-r border-zinc-200 bg-white ${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col justify-between h-full shrink-0 z-20`}>
                    <div>
                        {/* Logo */}
                        <div className="h-16 flex items-center px-6 border-b border-zinc-100">
                            <span className="text-lg font-semibold tracking-tight">
                                MISSION<span className="text-zinc-400">CTRL</span>
                            </span>
                        </div>

                        {/* Nav Links */}
                        <nav className="p-4 space-y-1">
                            <a href="#overview" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-zinc-100 text-zinc-900">
                                <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                                Overzicht
                            </a>
                            <a href="#crm" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors">
                                <Users className="w-4 h-4" />
                                CRM
                            </a>
                            <a href="/cms/admin" target="_blank" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors">
                                <Layers className="w-4 h-4" />
                                CMS
                            </a>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                            >
                                <CreditCard className="w-4 h-4" />
                                Wachtwoord
                            </button>
                            <a href="#analytics" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors">
                                <BarChart3 className="w-4 h-4" />
                                Analytics
                            </a>
                        </nav>
                    </div>

                    {/* User Profile */}
                    <div className="p-4 border-t border-zinc-100">
                        <button className="flex items-center gap-3 w-full px-2 py-2 hover:bg-zinc-50 rounded-md transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-400 flex items-center justify-center text-xs font-medium text-white">
                                AD
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">Admin</p>
                                <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                            </div>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Top Header */}
                    <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-md"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <nav className="hidden sm:flex items-center text-sm text-zinc-400 gap-2">
                                <span className="hover:text-zinc-600 cursor-pointer transition-colors">Dashboard</span>
                                <span className="text-zinc-300">/</span>
                                <span className="text-zinc-900 font-medium">Overzicht</span>
                            </nav>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Zoek gebruiker..."
                                    className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:bg-white transition-all w-64 placeholder:text-zinc-400"
                                />
                            </div>
                            <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                        </div>
                    </header>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="max-w-6xl mx-auto space-y-8">
                            {/* Section: Stats & Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" id="overview">
                                {/* Stat Card 1 */}
                                <div className="p-5 bg-white rounded-lg border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-zinc-50 rounded-md text-zinc-500 border border-zinc-100">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 font-medium">Totaal Gebruikers</p>
                                    <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight mt-1">{totalUsers.toLocaleString()}</h3>
                                </div>

                                {/* Stat Card 2 */}
                                <div className="p-5 bg-white rounded-lg border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-zinc-50 rounded-md text-zinc-500 border border-zinc-100">
                                            <Euro className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+8.4%</span>
                                    </div>
                                    <p className="text-sm text-zinc-500 font-medium">Maandelijkse Omzet</p>
                                    <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight mt-1">€-</h3>
                                </div>

                                {/* Quick Action: CRM */}
                                <a
                                    href="#crm"
                                    className="group relative p-5 bg-zinc-900 rounded-lg border border-zinc-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Users className="w-24 h-24 text-white transform rotate-12 translate-x-6 -translate-y-6" />
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="p-2 w-fit bg-zinc-800 rounded-md text-zinc-300 border border-zinc-700 mb-4">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-white tracking-tight">Open CRM</h3>
                                            <p className="text-xs text-zinc-400 mt-1">Beheer gebruikersprofielen</p>
                                        </div>
                                    </div>
                                </a>

                                {/* Quick Action: CMS */}
                                <a
                                    href="/cms/admin"
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
                                            <h3 className="text-lg font-medium text-zinc-900 tracking-tight">Open CMS</h3>
                                            <p className="text-xs text-zinc-500 mt-1">Bewerk site content</p>
                                        </div>
                                    </div>
                                </a>
                            </div>

                            {/* Section: CRM Table */}
                            <div className="space-y-4" id="crm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h2 className="text-lg font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                                        <Database className="w-4 h-4 text-zinc-400" />
                                        CRM Gebruikersgegevens
                                    </h2>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-2">
                                            <Filter className="w-3.5 h-3.5" />
                                            Filters
                                        </button>
                                        <button className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 transition-colors flex items-center gap-2">
                                            <Plus className="w-3.5 h-3.5" />
                                            Nieuwe Gebruiker
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
                                                {recentUsers.map((recentUser, index) => (
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
                                    <h3 className="text-sm font-medium text-zinc-900 mb-4">Recente Systeemactiviteit</h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                                            <div>
                                                <p className="text-sm text-zinc-800">Nieuwe gebruiker geregistreerd</p>
                                                <p className="text-xs text-zinc-400">2 minuten geleden • Signup Flow</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0"></div>
                                            <div>
                                                <p className="text-sm text-zinc-800">Dashboard toegankelijk</p>
                                                <p className="text-xs text-zinc-400">14 minuten geleden • System</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-zinc-300 shrink-0"></div>
                                            <div>
                                                <p className="text-sm text-zinc-800">Job Radar gelanceerd</p>
                                                <p className="text-xs text-zinc-400">1 uur geleden • Feature</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm text-white">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-medium text-white">Server Status</h3>
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

                        {/* Footer */}
                        <footer className="mt-12 border-t border-zinc-200 pt-6 pb-2 flex justify-between items-center text-xs text-zinc-400">
                            <p>© 2024 Cevace Mission Control</p>
                            <div className="flex gap-4">
                                <a href="#" className="hover:text-zinc-600">Privacy</a>
                                <a href="#" className="hover:text-zinc-600">Terms</a>
                                <a href="#" className="hover:text-zinc-600">Status</a>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>

            {/* Password Change Modal */}
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </>
    );
}
