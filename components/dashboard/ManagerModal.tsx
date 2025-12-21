'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { findManagerAction } from '@/actions/job-search';

interface ManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
    companyName: string;
}

export default function ManagerModal({ isOpen, onClose, jobTitle, companyName }: ManagerModalProps) {
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        setIsSearching(true);
        const result = await findManagerAction(jobTitle, companyName);
        setIsSearching(false);

        if (result.success && result.linkedInUrl) {
            window.open(result.linkedInUrl, '_blank');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Vind Hiring Manager</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                        Zoek de hiring manager voor:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900">{jobTitle}</p>
                        <p className="text-sm text-gray-600">bij {companyName}</p>
                    </div>
                </div>

                {/* Action */}
                <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full bg-cevace-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSearching && <Loader2 size={20} className="animate-spin" />}
                    {isSearching ? 'Zoeken...' : 'Zoek op LinkedIn'}
                </button>
            </div>
        </div>
    );
}
