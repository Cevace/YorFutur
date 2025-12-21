'use client';

import Link from 'next/link';
import Image from 'next/image'; // Added Image import
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, ScanLine, User, LogOut, Users, Kanban, Target, UserCircle, Sparkles, Upload, Link2, Mic, Brain } from 'lucide-react';
import { signOut } from '@/actions/auth';

export default function DashboardSidebar({ userRole, followUpCount }: { userRole: string; followUpCount: number }) {
    const pathname = usePathname();
    const router = useRouter();
    const isActive = (path: string) => pathname === path;

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 bg-cevace-blue text-white flex-col">
            <div className="p-4 border-b border-white/10">
                <Link href="/" className="block">
                    <Image
                        src="/logo/Cevace-wit-logo.svg"
                        alt="Cevace"
                        width={120}
                        height={40}
                        priority
                    />
                </Link>
            </div>

            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overzicht" active={isActive('/dashboard')} />
                <SidebarLink href="/dashboard/profile" icon={<UserCircle size={20} />} label="Mijn Profiel" active={isActive('/dashboard/profile')} />
                <SidebarLink href="/dashboard/cvs" icon={<FileText size={20} />} label="Mijn CV's" active={isActive('/dashboard/cvs')} />
                <SidebarLink href="/dashboard/import" icon={<Upload size={20} />} label="CV Import" active={isActive('/dashboard/import')} />
                <SidebarLink href="/dashboard/tuner" icon={<Sparkles size={20} />} label="CV Tuner" active={isActive('/dashboard/tuner')} />
                <SidebarLink href="/dashboard/motivation-letter" icon={<FileText size={20} />} label="Motivatiebrief" active={isActive('/dashboard/motivation-letter')} />
                <SidebarLink href="/dashboard/cv-settings" icon={<Link2 size={20} />} label="Live CV Links" active={isActive('/dashboard/cv-settings')} />
                <SidebarLink
                    href="/dashboard/tracker"
                    icon={<Kanban size={20} />}
                    label="Sollicitatie Tracker"
                    active={isActive('/dashboard/tracker')}
                    badge={followUpCount > 0 ? followUpCount : undefined}
                />
                <SidebarLink
                    href="/dashboard/radar"
                    icon={<Target size={20} />}
                    label="Job Radar"
                    active={isActive('/dashboard/radar')}
                />
                <SidebarLink
                    href="/dashboard/coach"
                    icon={<Mic size={20} />}
                    label="Interview Coach"
                    active={isActive('/dashboard/coach')}
                />
                <SidebarLink
                    href="/dashboard/assessment"
                    icon={<Brain size={20} />}
                    label="Assessment Trainer"
                    active={isActive('/dashboard/assessment')}
                />

                {userRole === 'admin' && (
                    <div className="pt-4 mt-4 border-t border-white/10">
                        <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin</div>
                        <SidebarLink href="/dashboard/admin/customers" icon={<Users size={20} />} label="Klanten" active={isActive('/dashboard/admin/customers')} />
                    </div>
                )}
            </nav>

            <div className="p-3 border-t border-white/10 space-y-1">
                <Link
                    href="/dashboard/account"
                    className={`flex items-center gap-3 px-4 py-2 rounded-full border border-white/30 transition-colors ${isActive('/dashboard/account')
                        ? 'bg-white/10 text-cevace-orange font-medium'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/50'
                        }`}
                >
                    <User size={20} />
                    <span>Account</span>
                </Link>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg w-full transition-colors"
                >
                    <LogOut size={20} />
                    <span>Uitloggen</span>
                </button>
                <div className="text-sm text-gray-400 px-4">© {new Date().getFullYear()} Cevace</div>
            </div>
        </aside>
    );
}

function SidebarLink({ href, icon, label, active, badge }: { href: string; icon: React.ReactNode; label: string; active: boolean; badge?: number }) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${active
                ? 'bg-white/10 text-cevace-orange font-medium'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span>{label}</span>
            </div>
            {badge && badge > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center flex items-center justify-center">
                    !
                </div>
            )}
        </Link>
    );
}
