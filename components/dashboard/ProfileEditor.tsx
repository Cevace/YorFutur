'use client';

import { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, Plus, Edit2, Trash2, Save, X, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { type Experience, type Education, type Language, upsertExperience, upsertEducation, deleteExperience, deleteEducation } from '@/actions/profile';
import SkillsTagInput from './SkillsTagInput';
import LanguagesSection from './LanguagesSection';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type ProfileEditorProps = {
    initialExperiences: Experience[];
    initialEducations: Education[];
    initialLanguages: Language[];
};

export default function ProfileEditor({ initialExperiences, initialEducations, initialLanguages }: ProfileEditorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const [educations, setEducations] = useState<Education[]>(initialEducations);
    const [editingExpId, setEditingExpId] = useState<string | null>(null);
    const [editingEduId, setEditingEduId] = useState<string | null>(null);
    const [showUploadWarning, setShowUploadWarning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Check for success toast from URL params
    useEffect(() => {
        if (searchParams.get('toast') === 'success') {
            setShowToast(true);
            // Remove toast param from URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            // Auto-hide toast after 5 seconds
            setTimeout(() => setShowToast(false), 5000);
        }
    }, [searchParams]);

    // Experience editing state
    const [expForm, setExpForm] = useState<Experience>({
        company: '',
        job_title: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        skills: []
    });

    // Education editing state
    const [eduForm, setEduForm] = useState<Education>({
        school: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: ''
    });

    const startEditingExp = (exp: Experience) => {
        setExpForm(exp);
        setEditingExpId(exp.id || null);
    };

    const startNewExp = () => {
        setExpForm({
            company: '',
            job_title: '',
            location: '',
            start_date: '',
            end_date: '',
            is_current: false,
            description: '',
            skills: []
        });
        setEditingExpId('new');
    };

    const saveExperience = async () => {
        setIsSaving(true);
        const result = await upsertExperience(expForm);
        setIsSaving(false);

        if (result.success) {
            // Update local state immediately
            if (editingExpId === 'new') {
                // For new entries, refresh to get the ID from database
                router.refresh();
            } else {
                // For updates, update the local state directly
                setExperiences(experiences.map(exp =>
                    exp.id === editingExpId ? expForm : exp
                ));
            }
            setEditingExpId(null);
        } else {
            alert(`Fout: ${result.error}`);
        }
    };

    const removeExperience = async (id: string) => {
        if (!confirm('Weet je zeker dat je deze ervaring wilt verwijderen?')) return;

        const result = await deleteExperience(id);
        if (result.success) {
            router.refresh();
        } else {
            alert(`Fout: ${result.error}`);
        }
    };

    const startEditingEdu = (edu: Education) => {
        setEduForm(edu);
        setEditingEduId(edu.id || null);
    };

    const startNewEdu = () => {
        setEduForm({
            school: '',
            degree: '',
            field_of_study: '',
            start_date: '',
            end_date: ''
        });
        setEditingEduId('new');
    };

    const saveEducation = async () => {
        setIsSaving(true);
        const result = await upsertEducation(eduForm);
        setIsSaving(false);

        if (result.success) {
            // Update local state immediately
            if (editingEduId === 'new') {
                // For new entries, refresh to get the ID from database
                router.refresh();
            } else {
                // For updates, update the local state directly
                setEducations(educations.map(edu =>
                    edu.id === editingEduId ? eduForm : edu
                ));
            }
            setEditingEduId(null);
        } else {
            alert(`Fout: ${result.error}`);
        }
    };

    const removeEducation = async (id: string) => {
        if (!confirm('Weet je zeker dat je deze opleiding wilt verwijderen?')) return;

        const result = await deleteEducation(id);
        if (result.success) {
            router.refresh();
        } else {
            alert(`Fout: ${result.error}`);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-8">
            {/* Success Toast */}
            {showToast && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
                    <CheckCircle size={24} />
                    <div>
                        <p className="font-bold">Profiel bijgewerkt!</p>
                        <p className="text-sm text-green-100">Controleer de gegevens en pas aan waar nodig.</p>
                    </div>
                    <button
                        onClick={() => setShowToast(false)}
                        className="ml-4 hover:bg-green-600 rounded-full p-1 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-bold text-cevace-blue mb-2" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>
                        Mijn Profiel
                    </h1>
                    <p className="text-gray-500">Beheer je werkervaring, opleidingen en skills</p>
                </div>
                <button
                    onClick={() => setShowUploadWarning(true)}
                    className="flex items-center gap-2 bg-cevace-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                >
                    <Upload size={20} />
                    Nieuw CV Uploaden
                </button>
            </div>

            {/* Experiences Section */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cevace-blue/10 rounded-xl flex items-center justify-center">
                            <Briefcase className="text-cevace-blue" size={20} />
                        </div>
                        <h2 className="font-bold text-gray-900" style={{ fontSize: '28px' }}>Werkervaring</h2>
                    </div>
                    <button
                        onClick={startNewExp}
                        className="flex items-center gap-2 bg-cevace-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors"
                    >
                        <Plus size={18} />
                        Toevoegen
                    </button>
                </div>

                <div className="space-y-4">
                    {experiences.length === 0 && editingExpId !== 'new' && (
                        <p className="text-gray-400 text-center py-8">Nog geen werkervaring toegevoegd</p>
                    )}

                    {experiences.map((exp) => (
                        <div key={exp.id}>
                            {editingExpId === exp.id ? (
                                <ExperienceForm
                                    form={expForm}
                                    setForm={setExpForm}
                                    onSave={saveExperience}
                                    onCancel={() => setEditingExpId(null)}
                                    isSaving={isSaving}
                                />
                            ) : (
                                <ExperienceCard
                                    experience={exp}
                                    onEdit={() => startEditingExp(exp)}
                                    onDelete={() => removeExperience(exp.id!)}
                                    formatDate={formatDate}
                                />
                            )}
                        </div>
                    ))}

                    {editingExpId === 'new' && (
                        <ExperienceForm
                            form={expForm}
                            setForm={setExpForm}
                            onSave={saveExperience}
                            onCancel={() => setEditingExpId(null)}
                            isSaving={isSaving}
                        />
                    )}
                </div>
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                            <GraduationCap className="text-cevace-orange" size={20} />
                        </div>
                        <h2 className="font-bold text-gray-900" style={{ fontSize: '28px' }}>Opleidingen</h2>
                    </div>
                    <button
                        onClick={startNewEdu}
                        className="flex items-center gap-2 bg-cevace-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                        <Plus size={18} />
                        Toevoegen
                    </button>
                </div>

                <div className="space-y-4">
                    {educations.length === 0 && editingEduId !== 'new' && (
                        <p className="text-gray-400 text-center py-8">Nog geen opleidingen toegevoegd</p>
                    )}

                    {educations.map((edu) => (
                        <div key={edu.id}>
                            {editingEduId === edu.id ? (
                                <EducationForm
                                    form={eduForm}
                                    setForm={setEduForm}
                                    onSave={saveEducation}
                                    onCancel={() => setEditingEduId(null)}
                                    isSaving={isSaving}
                                />
                            ) : (
                                <EducationCard
                                    education={edu}
                                    onEdit={() => startEditingEdu(edu)}
                                    onDelete={() => removeEducation(edu.id!)}
                                    formatDate={formatDate}
                                />
                            )}
                        </div>
                    ))}

                    {editingEduId === 'new' && (
                        <EducationForm
                            form={eduForm}
                            setForm={setEduForm}
                            onSave={saveEducation}
                            onCancel={() => setEditingEduId(null)}
                            isSaving={isSaving}
                        />
                    )}
                </div>
            </div>

            {/* Languages Section */}
            <LanguagesSection languages={initialLanguages} />

            {/* Upload Warning Modal */}
            {showUploadWarning && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-cevace-orange" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Let op!</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Een nieuwe CV upload overschrijft <strong>alle handmatige wijzigingen</strong> die je hebt gemaakt aan je werkervaring en opleidingen. Wil je doorgaan?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowUploadWarning(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Annuleren
                            </button>
                            <Link
                                href="/dashboard/scan"
                                className="flex-1 px-4 py-2 bg-cevace-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors text-center"
                            >
                                Doorgaan
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Experience Card Component
function ExperienceCard({ experience, onEdit, onDelete, formatDate }: {
    experience: Experience;
    onEdit: () => void;
    onDelete: () => void;
    formatDate: (date?: string) => string;
}) {
    return (
        <div className="border border-gray-200 rounded-lg p-6 hover:border-cevace-blue/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{experience.job_title}</h3>
                    <p className="text-cevace-blue font-medium">{experience.company}</p>
                    {experience.location && <p className="text-sm text-gray-500">{experience.location}</p>}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-400 hover:text-cevace-blue transition-colors"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-3">
                {formatDate(experience.start_date)} - {experience.is_current ? 'Heden' : formatDate(experience.end_date)}
            </p>

            {experience.description && (
                <p className="text-gray-700 text-sm mb-3">{experience.description}</p>
            )}

            {experience.skills && experience.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {experience.skills.map((skill, idx) => (
                        <span
                            key={idx}
                            className="bg-cevace-blue/10 text-cevace-blue px-3 py-1 rounded-full text-xs font-medium"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// Experience Form Component
function ExperienceForm({ form, setForm, onSave, onCancel, isSaving }: {
    form: Experience;
    setForm: (form: Experience) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
}) {
    return (
        <div className="border-2 border-cevace-blue rounded-lg p-6 bg-blue-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Functietitel *</label>
                    <input
                        type="text"
                        value={form.job_title}
                        onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijf *</label>
                    <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Locatie</label>
                    <input
                        type="text"
                        value={form.location || ''}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                    />
                </div>
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                        <input
                            type="date"
                            value={form.start_date || ''}
                            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Einddatum</label>
                        <input
                            type="date"
                            value={form.end_date || ''}
                            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            disabled={form.is_current}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue disabled:bg-gray-100"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                        type="checkbox"
                        checked={form.is_current}
                        onChange={(e) => setForm({ ...form, is_current: e.target.checked, end_date: e.target.checked ? '' : form.end_date })}
                        className="rounded border-gray-300 text-cevace-blue focus:ring-cevace-blue"
                    />
                    Ik werk hier momenteel
                </label>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
                <textarea
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <SkillsTagInput
                    skills={form.skills}
                    onChange={(skills) => setForm({ ...form, skills })}
                />
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onSave}
                    disabled={isSaving || !form.job_title || !form.company}
                    className="flex-1 px-4 py-2 bg-cevace-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSaving ? 'Opslaan...' : (
                        <>
                            <Save size={16} />
                            Opslaan
                        </>
                    )}
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    disabled={isSaving}
                >
                    Annuleren
                </button>
            </div>
        </div>
    );
}

// Education Card Component
function EducationCard({ education, onEdit, onDelete, formatDate }: {
    education: Education;
    onEdit: () => void;
    onDelete: () => void;
    formatDate: (date?: string) => string;
}) {
    return (
        <div className="border border-gray-200 rounded-lg p-6 hover:border-cevace-orange/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{education.degree || 'Opleiding'}</h3>
                    <p className="text-cevace-orange font-medium">{education.school}</p>
                    {education.field_of_study && <p className="text-sm text-gray-500">{education.field_of_study}</p>}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-400 hover:text-cevace-orange transition-colors"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-500">
                {formatDate(education.start_date)} - {formatDate(education.end_date)}
            </p>
        </div>
    );
}

// Education Form Component
function EducationForm({ form, setForm, onSave, onCancel, isSaving }: {
    form: Education;
    setForm: (form: Education) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
}) {
    return (
        <div className="border-2 border-cevace-orange rounded-lg p-6 bg-orange-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Onderwijsinstelling *</label>
                    <input
                        type="text"
                        value={form.school}
                        onChange={(e) => setForm({ ...form, school: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diploma/Graad/Certificaat</label>
                    <input
                        type="text"
                        value={form.degree || ''}
                        onChange={(e) => setForm({ ...form, degree: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Studierichting</label>
                    <input
                        type="text"
                        value={form.field_of_study || ''}
                        onChange={(e) => setForm({ ...form, field_of_study: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                        <input
                            type="date"
                            value={form.start_date || ''}
                            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Einddatum</label>
                        <input
                            type="date"
                            value={form.end_date || ''}
                            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cevace-orange"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onSave}
                    disabled={isSaving || !form.school}
                    className="flex-1 px-4 py-2 bg-cevace-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSaving ? 'Opslaan...' : (
                        <>
                            <Save size={16} />
                            Opslaan
                        </>
                    )}
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    disabled={isSaving}
                >
                    Annuleren
                </button>
            </div>
        </div>
    );
}
