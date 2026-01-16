'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import Image from 'next/image';
import { getAllTemplates, type TemplateId, type CVTemplate } from '@/types/cv-templates';
import { saveUserCVSettings } from '@/actions/cv-builder';

interface TemplateLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTemplateId: TemplateId;
    currentAccentColor: string;
    onTemplateSelect: (templateId: TemplateId, accentColor: string) => void;
}

export default function TemplateLibraryModal({
    isOpen,
    onClose,
    currentTemplateId,
    currentAccentColor,
    onTemplateSelect
}: TemplateLibraryModalProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(currentTemplateId);
    const [isSaving, setIsSaving] = useState(false);
    const templates = getAllTemplates();

    if (!isOpen) return null;

    const handleTemplateClick = (template: CVTemplate) => {
        setSelectedTemplate(template.id);
    };

    const handleConfirm = async () => {
        setIsSaving(true);

        const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
        const accentColor = selectedTemplateData?.accentColor || currentAccentColor;

        // Save to database
        const result = await saveUserCVSettings(selectedTemplate, accentColor);

        if (result.success) {
            onTemplateSelect(selectedTemplate, accentColor);
            onClose();
        } else {
            alert('Fout bij opslaan: ' + result.error);
        }

        setIsSaving(false);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Kies een sjabloon</h2>
                            <p className="text-sm text-gray-500 mt-1">Selecteer een CV-ontwerp dat bij je past</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Template Grid */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleTemplateClick(template)}
                                    className={`group relative rounded-xl overflow-hidden border-4 transition-all hover:scale-[1.02] ${selectedTemplate === template.id
                                            ? 'border-cevace-orange shadow-xl shadow-orange-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {/* Selected Badge */}
                                    {selectedTemplate === template.id && (
                                        <div className="absolute top-4 right-4 z-10 bg-cevace-orange text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                                            <Check size={16} />
                                            Geselecteerd
                                        </div>
                                    )}

                                    {/* Template Preview Image */}
                                    <div className="aspect-[210/297] relative bg-gray-100">
                                        <Image
                                            src={template.previewImage}
                                            alt={template.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Template Info */}
                                    <div className="bg-white p-4 border-t border-gray-200">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {template.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Annuleren
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSaving || selectedTemplate === currentTemplateId}
                            className="px-6 py-3 bg-cevace-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isSaving ? 'Opslaan...' : 'Toepassen'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
