import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-cevace-blue mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Pagina niet gevonden
                </h2>
                <p className="text-gray-600 mb-6">
                    De pagina die je zoekt bestaat niet of is verplaatst.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-cevace-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                    Terug naar home
                </Link>
            </div>
        </div>
    );
}
