'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Globe } from 'lucide-react';
import { addLanguage, updateLanguage, deleteLanguage, type Language } from '@/actions/profile';

const COMMON_LANGUAGES = [
    'Nederlands',
    'English',
    'Deutsch',
    'Français',
    'Español',
    'Italiano',
    'Português',
    'Polski',
    'Русский',
    'العربية',
    '中文',
    '日本語',
    'Other'
];

const PROFICIENCY_LEVELS = [
    { value: 'Moedertaal', label: 'Moedertaal' },
    { value: 'Vloeiend', label: 'Vloeiend' },
    { value: 'Goed', label: 'Goed' },
    { value: 'Basis', label: 'Basis' }
];

type LanguagesSectionProps = {
    languages: Language[];
};

export default function LanguagesSection({ languages: initialLanguages }: LanguagesSectionProps) {
    const [languages, setLanguages] = useState<Language[]>(initialLanguages);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = () => {
        setEditingLanguage(null);
        setIsModalOpen(true);
    };

    const handleEdit = (language: Language) => {
        setEditingLanguage(language);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Weet je zeker dat je deze taal wilt verwijderen?')) return;

        const result = await deleteLanguage(id);
        if (result.success) {
            setLanguages(languages.filter(l => l.id !== id));
        } else {
            alert('Er ging iets mis bij het verwijderen');
        }
    };

    const handleSubmit = async (language: Language) => {
        setIsSubmitting(true);

        if (editingLanguage?.id) {
            // Update existing
            const result = await updateLanguage(editingLanguage.id, language);
            if (result.success) {
                setLanguages(languages.map(l => l.id === editingLanguage.id ? { ...language, id: editingLanguage.id } : l));
                setIsModalOpen(false);
            } else {
                alert('Er ging iets mis bij het bijwerken');
            }
        } else {
            // Add new
            const result = await addLanguage(language);
            if (result.success) {
                // Refresh the page to get the new language with ID
                window.location.reload();
            } else {
                alert('Er ging iets mis bij het toevoegen');
            }
        }

        setIsSubmitting(false);
    };

    return (
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[28px] font-bold text-gray-900">Talen</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-cevace-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                    <Plus size={20} />
                    <span>Toevoegen</span>
                </button>
            </div>

            {languages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Nog geen talen toegevoegd</p>
                    <p className="text-sm mt-2">Klik op "Toevoegen" om je taalvaardigheden toe te voegen</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {languages.map((language) => (
                        <div
                            key={language.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-cevace-blue/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                    <Globe size={20} className="text-cevace-blue" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{language.language}</p>
                                    <p className="text-sm text-gray-600">{language.proficiency}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(language)}
                                    className="p-2 text-gray-600 hover:text-cevace-blue hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Bewerken"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(language.id!)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Verwijderen"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <LanguageModal
                    language={editingLanguage}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}

type LanguageModalProps = {
    language: Language | null;
    onClose: () => void;
    onSubmit: (language: Language) => void;
    isSubmitting: boolean;
};

function LanguageModal({ language, onClose, onSubmit, isSubmitting }: LanguageModalProps) {
    const [selectedLanguage, setSelectedLanguage] = useState(language?.language || '');
    const [selectedProficiency, setSelectedProficiency] = useState(language?.proficiency || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedLanguage || !selectedProficiency) {
            alert('Vul alle velden in');
            return;
        }

        onSubmit({
            language: selectedLanguage,
            proficiency: selectedProficiency
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                        {language ? 'Taal Bewerken' : 'Taal Toevoegen'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Taal *
                        </label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                            required
                        >
                            <option value="">Selecteer een taal</option>
                            {COMMON_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Niveau *
                        </label>
                        <select
                            value={selectedProficiency}
                            onChange={(e) => setSelectedProficiency(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                            required
                        >
                            <option value="">Selecteer een niveau</option>
                            {PROFICIENCY_LEVELS.map((level) => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-cevace-blue text-white rounded-lg font-bold hover:bg-blue-900 transition-colors disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Bezig...' : language ? 'Bijwerken' : 'Toevoegen'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
