import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Cevace",
    description: "Job coaching platform by Cevace",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="nl">
            <body className={`${inter.className} antialiased`}>
                <AnalyticsTracker />
                {children}
                {/* 100% privacy-first analytics */}
                <script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
            </body>
        </html>
    );
}
