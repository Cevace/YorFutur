import { createClient } from '@/utils/supabase/server';
import { FileText, Trash2, Upload, Calendar, Download, Sparkles } from 'lucide-react';
import { deleteCV } from '@/actions/scan';
import { deleteTailoredResume } from '@/actions/resume';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

// Type definitions for safety
type UploadedCV = {
    id: string;
    filename: string | null;
    url: string | null;
    created_at: string;
    expires_at?: string | null;
    type: 'uploaded';
};

type TailoredCV = {
    id: string;
    vacancy_title: string | null;
    pdf_url: string | null;
    created_at: string;
    expires_at: string | null;
    type: 'tailored';
};

type CombinedCV = UploadedCV | TailoredCV;

// Helper: Safe date formatter with fallback
function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Datum onbekend';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Ongeldige datum';

        return date.toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return 'Datum onbekend';
    }
}

// Helper: Safe title extraction with fallback
function getTitle(cv: CombinedCV): string {
    if (cv.type === 'tailored') {
        return cv.vacancy_title?.trim() || 'Naamloos CV';
    }
    return cv.filename?.trim() || 'cv.pdf';
}

export default async function CVsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch uploaded CVs
    const { data: uploadedCVs } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

    // Fetch tailored CVs
    const { data: tailoredCVs } = await supabase
        .from('tailored_resumes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

    // Combine and sort by created_at with null safety
    const allCVs: CombinedCV[] = [
        ...(uploadedCVs || []).map(cv => ({ ...cv, type: 'uploaded' as const })),
        ...(tailoredCVs || []).map(cv => ({ ...cv, type: 'tailored' as const }))
    ].sort((a, b) => {
        try {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
        } catch {
            return 0; // Keep order if dates invalid
        }
    });

    async function handleDeleteUploaded(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await deleteCV(id);
        revalidatePath('/dashboard/cvs');
    }

    async function handleDeleteTailored(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await deleteTailoredResume(id);
        revalidatePath('/dashboard/cvs');
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-bold text-cevace-blue mb-4" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>Mijn CV's</h1>
                <p className="text-gray-500 mb-6">Beheer je geüploade CV's en gegenereerde CV's. Gegenereerde CV's worden 60 dagen bewaard.</p>
                <Link
                    href="/dashboard/import"
                    className="inline-flex items-center gap-2 bg-cevace-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                >
                    <Upload size={20} />
                    Nieuw CV uploaden
                </Link>
            </div>

            {allCVs.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 text-cevace-blue rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nog geen CV's</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Upload je eerste CV om te beginnen met scannen en solliciteren.
                    </p>
                    <Link
                        href="/dashboard/import"
                        className="inline-flex items-center gap-2 bg-cevace-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors"
                    >
                        <Upload size={20} />
                        CV uploaden
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allCVs.map((cv) => (
                        <div key={`${cv.type}-${cv.id}`} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 ${cv.type === 'tailored' ? 'bg-blue-50' : 'bg-orange-50 text-cevace-orange'} rounded-xl flex items-center justify-center`}>
                                        {cv.type === 'tailored' ? <Sparkles size={24} style={{ color: '#000000' }} /> : <FileText size={24} />}
                                    </div>
                                    {cv.type === 'tailored' && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 text-white text-xs font-medium rounded-full" style={{ backgroundColor: '#4A4E69' }}>
                                            Gegenereerd
                                        </span>
                                    )}
                                    {cv.type === 'uploaded' && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                                            Geüpload
                                        </span>
                                    )}
                                </div>
                                <form action={cv.type === 'tailored' ? handleDeleteTailored : handleDeleteUploaded}>
                                    <input type="hidden" name="id" value={cv.id} />
                                    <button
                                        type="submit"
                                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                        title="Verwijderen"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </form>
                            </div>



                            <h3 className="font-bold text-gray-900 mb-1 truncate" style={{ fontSize: '18px' }} title={getTitle(cv)}>
                                {getTitle(cv)}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                <Calendar size={14} />
                                {formatDate(cv.created_at)}
                                {cv.expires_at && (
                                    <span className="ml-2 text-xs text-orange-600">
                                        (Verloopt: {formatDate(cv.expires_at).replace(/\d{4}$/, '')})
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href={`/api/download-cv?id=${cv.id}&type=${cv.type}`}
                                    className="flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-full font-medium hover:opacity-80 transition-all text-sm"
                                    style={{ backgroundColor: 'rgba(234, 88, 12, 0.5)' }}
                                >
                                    <Download size={16} />
                                    Downloaden
                                </a>
                                {cv.type === 'uploaded' && (
                                    <Link
                                        href={`/dashboard/import?cv=${cv.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-cevace-blue/5 text-cevace-blue py-2.5 rounded-lg font-medium hover:bg-cevace-blue/10 transition-colors text-sm"
                                    >
                                        Scannen
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
