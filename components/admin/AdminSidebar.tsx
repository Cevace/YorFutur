'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Database, Users, LayoutDashboard, Shield, LogOut, BarChart3 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminSidebar() {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    }

    return (
        <aside className="w-64 border-r border-zinc-800 hidden md:flex flex-col h-screen sticky top-0" style={{ backgroundColor: '#22223B' }}>
            {/* Blue Header */}
            <div className="bg-cevace-blue text-white p-6 border-b border-white/10">
                <Link href="/admin" className="block">
                    <Image
                        src="/logo/Cevace-wit-logo.svg"
                        alt="Cevace"
                        width={120}
                        height={40}
                        priority
                    />
                </Link>
                <p className="text-white/70 text-xs mt-1">Admin</p>
            </div>

            {/* Nav Links - Flex grow to push logout to bottom */}
            <div className="flex-grow">
                <nav className="p-4 space-y-1">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Overzicht
                    </Link>
                    <Link
                        href="/admin/analytics"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                    </Link>
                    <Link
                        href="/cms/admin"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Database className="w-4 h-4" />
                        CMS
                    </Link>
                    <Link
                        href="/admin/crm"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Users className="w-4 h-4" />
                        CRM
                    </Link>
                    <Link
                        href="/admin/access"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Shield className="w-4 h-4" />
                        Toegangscontrole
                    </Link>
                </nav>
            </div>

            {/* Logout Button - At bottom */}
            <div className="p-4 border-t border-zinc-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-900/20 transition-colors w-full"
                >
                    <LogOut className="w-4 h-4" />
                    Uitloggen
                </button>
            </div>
        </aside>
    );
}
