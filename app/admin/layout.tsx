import AdminSidebar from '@/components/admin/AdminSidebar';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Admin - Cevace',
    description: 'Admin Mission Control',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-zinc-50">
            <AdminSidebar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
