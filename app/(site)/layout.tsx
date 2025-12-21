import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import NavbarWrapper from '@/components/NavbarWrapper';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/Footer'), {
    ssr: false,
    loading: () => <div className="h-96"></div>
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Cevace",
    description: "Job coaching platform",
};

export default function SiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <NavbarWrapper theme="light" />
            <main className="flex-grow min-h-screen flex flex-col">{children}</main>
            <Footer />
        </>
    );
}

