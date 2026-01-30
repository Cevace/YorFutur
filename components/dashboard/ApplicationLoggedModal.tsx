'use client';

import { CheckCircle, X } from 'lucide-react';

interface ApplicationLoggedModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyName: string;
    jobTitle: string;
}

export default function ApplicationLoggedModal({ isOpen, onClose, companyName, jobTitle }: ApplicationLoggedModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Sollicitatie opgeslagen<br />in de Sollicitatie Tracker!
                    </h2>

                    <p className="text-gray-600 mb-6">
                        We hebben je sollicitatie automatisch toegevoegd aan de <span className="font-semibold text-gray-900">Sollicitatie Tracker</span>.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-100">
                        <div className="mb-2">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Bedrijf</span>
                            <p className="font-bold text-gray-900 text-lg">{companyName}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-semibold">Functie</span>
                            <p className="text-gray-700">{jobTitle}</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-cevace-orange text-white py-3 px-6 rounded-full font-bold hover:bg-orange-600 transition-colors"
                    >
                        OK, begrepen
                    </button>

                    <p className="mt-4 text-xs text-center text-gray-400">
                        Je kunt details later aanpassen in het Dashboard
                    </p>
                </div>
            </div>
        </div>
    );
}
