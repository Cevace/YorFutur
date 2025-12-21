'use client';

import { XCircle, AlertTriangle } from 'lucide-react';

type ProfileOverwriteWarningProps = {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ProfileOverwriteWarning({
    isOpen,
    onConfirm,
    onCancel
}: ProfileOverwriteWarningProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
                {/* Icon */}
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="text-cevace-orange" size={32} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                    Let op!
                </h3>

                {/* Message */}
                <p className="text-gray-700 text-center mb-8 leading-relaxed">
                    Je huidige CV profiel informatie wordt overgeschreven.
                    De oude informatie kan niet worden hersteld.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Annuleer
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-3 bg-cevace-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
                    >
                        Akkoord
                    </button>
                </div>
            </div>
        </div>
    );
}
