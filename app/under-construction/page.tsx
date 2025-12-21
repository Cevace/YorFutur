import Link from 'next/link';
import Image from 'next/image';
import { Lock } from 'lucide-react';

export default function UnderConstructionPage() {
    return (
        <div className="min-h-screen bg-cevace-parchment flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Image
                        src="/logo/Cevace-zwart-logo.svg"
                        alt="Cevace"
                        width={200}
                        height={60}
                        priority
                        className="mx-auto"
                    />
                </div>

                {/* Message */}
                <div className="space-y-4 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-50 rounded-full">
                            <Lock className="w-8 h-8 text-cevace-indigo" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Under Construction 🚧
                    </h1>

                    <p className="text-gray-600 leading-relaxed">
                        We werken hard aan het ultieme platform voor jouw carrière.
                        Cevace is momenteel alleen toegankelijk voor geselecteerde beta-gebruikers.
                    </p>

                    <div className="pt-4 border-t border-gray-100">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-cevace-orange hover:text-orange-700 transition-colors"
                        >
                            Inloggen voor leden
                        </Link>
                    </div>
                </div>

                <div className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Cevace. Alle rechten voorbehouden.
                </div>
            </div>
        </div>
    );
}
