import { Inter } from "next/font/google";
import "../globals.css";
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/Header'), {
  ssr: false,
  loading: () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white py-4 shadow-sm">
      <div className="container mx-auto px-4 h-10"></div>
    </header>
  )
});

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
  loading: () => <div className="h-96"></div>
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Blog | Cevace',
  description: 'Carrière tips en sollicitatie advies',
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
