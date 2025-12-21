import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import DashboardSidebar from '@/components/dashboard/Sidebar';
import MobileNav from '@/components/dashboard/MobileNav';
import { createClient } from '@/utils/supabase/server';
import { getFollowUpCount } from '@/actions/tracker';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Cevace Dashboard",
    description: "Manage your career",
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const userRole = profile?.role || 'user';

    // Fetch follow-up count for tracker badge
    const followUpCount = await getFollowUpCount();

    return (
        <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: '#f2e9e4' }}>
            <DashboardSidebar userRole={userRole} followUpCount={followUpCount} />
            <MobileNav userRole={userRole} followUpCount={followUpCount} />
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-4 md:pt-8">
                {children}
            </main>
        </div>
    );
}
