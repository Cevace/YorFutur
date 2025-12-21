'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Er ging iets mis
                </h2>
                <p className="text-gray-600 mb-6">
                    Er is een onverwachte fout opgetreden.
                </p>
                <button
                    onClick={() => reset()}
                    className="bg-cevace-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                    Probeer opnieuw
                </button>
            </div>
        </div>
    );
}
