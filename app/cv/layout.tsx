import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CV - Cevace",
  description: "Professioneel CV",
};

export default function CVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-gray-50 min-h-screen">{children}</div>;
}
