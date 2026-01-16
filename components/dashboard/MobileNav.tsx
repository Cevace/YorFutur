'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, User, LogOut, Menu, X, Users, Kanban, Target, UserCircle, Sparkles, Upload, Link2, Mic, Brain, Eye } from 'lucide-react';
import { signOut } from '@/actions/auth';

export default function MobileNav({ userRole, followUpCount }: { userRole: string; followUpCount: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => pathname === path;

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <>
            {/* Top Navbar */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-50 shadow-sm">
                <Link href="/dashboard" className="text-xl font-bold text-cevace-blue tracking-tight">
                    <Image
                        src="/logo/Cevace-zwart-logo.svg"
                        alt="Cevace"
                        width={120}
                        height={40}
                        priority
                    />
                </Link>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Spacer for fixed navbar */}
            <div className="h-16 md:hidden" />

            {/* Drawer Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer Content */}
            <div className={`
                fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900">Menu</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <MobileNavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overzicht" active={isActive('/dashboard')} onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/dashboard/profile" icon={<UserCircle size={20} />} label="Mijn Profiel" active={isActive('/dashboard/profile')} onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/dashboard/cvs" icon={<FileText size={20} />} label="Mijn CV's" active={isActive('/dashboard/cvs')} onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/dashboard/import" icon={<Upload size={20} />} label="CV Import" active={isActive('/dashboard/import')} onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/dashboard/tuner" icon={<Sparkles size={20} />} label="CV Tuner" active={isActive('/dashboard/tuner')} onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/dashboard/motivation-letter" icon={<FileText size={20} />} label="Motivatiebrief" active={isActive('/dashboard/motivation-letter')} onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/dashboard/cv-settings" icon={<Link2 size={20} />} label="Live CV Links" active={isActive('/dashboard/cv-settings')} onClick={() => setIsOpen(false)} />
                    <MobileNavLink
                        href="/dashboard/tracker"
                        icon={<Kanban size={20} />}
                        label="Sollicitatie Tracker"
                        active={isActive('/dashboard/tracker')}
                        onClick={() => setIsOpen(false)}
                        badge={followUpCount > 0 ? followUpCount : undefined}
                    />
                    <MobileNavLink
                        href="/dashboard/radar"
                        icon={<Target size={20} />}
                        label="Job Radar"
                        active={isActive('/dashboard/radar')}
                        onClick={() => setIsOpen(false)}
                    />
                    <MobileNavLink
                        href="/dashboard/coach"
                        icon={<Mic size={20} />}
                        label="Interview Coach"
                        active={isActive('/dashboard/coach')}
                        onClick={() => setIsOpen(false)}
                    />
                    <MobileNavLink
                        href="/dashboard/assessment"
                        icon={<Brain size={20} />}
                        label="Assessment Trainer"
                        active={isActive('/dashboard/assessment')}
                        onClick={() => setIsOpen(false)}
                    />
                    <MobileNavLink
                        href="/dashboard/career-spy"
                        icon={<Eye size={20} />}
                        label="Career Spy"
                        active={isActive('/dashboard/career-spy')}
                        onClick={() => setIsOpen(false)}
                    />

                    {userRole === 'admin' && (
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin</div>
                            <MobileNavLink href="/dashboard/admin/customers" icon={<Users size={20} />} label="Klanten" active={isActive('/dashboard/admin/customers')} onClick={() => setIsOpen(false)} />
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50">
                    <MobileNavLink
                        href="/dashboard/account"
                        icon={<User size={20} />}
                        label="Account"
                        active={isActive('/dashboard/account')}
                        onClick={() => setIsOpen(false)}
                    />
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        <span>Uitloggen</span>
                    </button>
                </div>
            </div>
        </>
    );
}

function MobileNavLink({ href, icon, label, active, onClick, badge }: { href: string; icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${active
                ? 'bg-cevace-orange/10 text-cevace-orange font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
