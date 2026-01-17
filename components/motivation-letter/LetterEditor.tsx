'use client';

import { useState, useEffect } from 'react';
import { Save, Download, FileText, Lightbulb, CheckCircle, Loader2 } from 'lucide-react';
import { saveEditedLetterAction } from '@/actions/motivation-letter';
import type { MotivationLetterVariant } from '@/lib/motivation-letter/types';
import { useDebouncedCallback } from 'use-debounce';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { TEXTAREA_DEBOUNCE_MS } from '@/lib/motivation-letter/constants';

interface LetterEditorProps {
    variant: MotivationLetterVariant;
    letterId?: string;
    focusPoints?: string[];
    goldenHook?: string;
    userId?: string; // NEW: for Live CV QR code
}

export default function LetterEditor({ variant, letterId, focusPoints = [], goldenHook, userId }: LetterEditorProps) {
    const [editedContent, setEditedContent] = useState(variant.content_body);
    const [displayContent, setDisplayContent] = useState(variant.content_body); // Local state for immediate UI updates
    const [isSaving, setIsSaving] = useState(false);
    const [candidateName, setCandidateName] = useState('');
    const [candidateEmail, setCandidateEmail] = useState('');
    const [candidatePhone, setCandidatePhone] = useState('');
    const [candidateCity, setCandidateCity] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');

    // Debounced content update - updates the actual state after delay
    const debouncedSetContent = useDebouncedCallback(
        (value: string) => setEditedContent(value),
        TEXTAREA_DEBOUNCE_MS
    );

    // Handler for textarea changes - updates display immediately, debounces actual state
    const handleContentChange = (value: string) => {
        setDisplayContent(value); // Immediate UI update
        debouncedSetContent(value); // Debounced state update
    };

    // Auto-fill candidate info from profile
    useEffect(() => {
        const fetchProfileData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, city, phone')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setCandidateName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
                    setCandidateEmail(user.email || '');
                    setCandidatePhone(profile.phone || '');
                    setCandidateCity(profile.city || '');
                }
            }
        };
        fetchProfileData();
    }, []);

    const handleSave = async () => {
        if (!letterId) {
            toast.error('Geen brief ID gevonden');
            return;
        }

        setIsSaving(true);

        // Call with all 3 required arguments
        const result = await saveEditedLetterAction(letterId, variant.variant_id, editedContent);

        setIsSaving(false);

        if (result.success) {
            toast.success('Brief succesvol opgeslagen!');
        } else {
            toast.error(result.error || 'Opslaan mislukt');
        }
    };

    const handleDownloadPDF = async () => {
        try {
            // Validate required fields
            if (!candidateName.trim() || !candidateEmail.trim()) {
                toast.error('Vul minimaal je naam en email in voordat je de PDF downloadt');
                return;
            }

            // Import PDF generator and QR generator
            const { generateMotivationLetterPDF, generatePDFFilename } = await import('@/lib/motivation-letter/pdf-generator');
            const { generateLiveCvQRCode, getUserLiveCvUrl } = await import('@/lib/motivation-letter/qr-generator');

            // Generate QR code for Live CV (if user has one)
            let qrCodeDataUrl: string | undefined;
            let liveCvUrl: string | undefined;

            if (userId) {
                try {
                    liveCvUrl = getUserLiveCvUrl(userId);
                    qrCodeDataUrl = await generateLiveCvQRCode(liveCvUrl);
                } catch (error) {
                    console.warn('QR code generation failed:', error);
                }
            }

            // Generate PDF
            const pdfBlob = await generateMotivationLetterPDF({
                candidateName: candidateName.trim(),
                candidateEmail: candidateEmail.trim(),
                candidatePhone: candidatePhone.trim() || undefined,
                candidateCity: candidateCity.trim() || undefined,
                companyName: companyName.trim() || undefined,
                contactPerson: contactPerson.trim() || undefined,
                companyAddress: companyAddress.trim() || undefined,
                letterContent: editedContent,
                selectedDate: new Date(),
                liveCvUrl,
                qrCodeDataUrl,
            });

            // Trigger download
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = generatePDFFilename(companyName.trim() || undefined);
            link.click();
            URL.revokeObjectURL(url);

            toast.success('PDF succesvol gedownload!');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('PDF generatie mislukt. Probeer het opnieuw.');
        }
    };

    const handleDownloadWord = () => {
        // Word export removed - users should use PDF only
        alert('Word export is niet beschikbaar. Download de PDF versie.');
    };

    // Quality checklist items (static for now)
    const qualityChecks = [
        { label: 'Sterke opening (Geen clichés)', checked: true },
        { label: 'STAR-methode toegepast', checked: true },
        { label: 'Zelfverzekerde afsluiting', checked: true },
    ];

    return (
        <div className="space-y-6">

            {/* Main Editor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Context Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-6 sticky top-4">
                        {/* Golden Hook */}
                        {goldenHook && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">
                                    Jouw "Golden hook"
                                </h3>
                                <p className="text-sm text-gray-700 bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    {goldenHook}
                                </p>
                            </div>
                        )}

                        {/* Focus Points */}
                        {focusPoints.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-sm">Key focus punten</h3>
                                <ul className="space-y-1 text-xs text-gray-700">
                                    {focusPoints.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-cevace-blue mt-0.5">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Quality Checklist */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2 text-sm">Kwaliteitscontrole</h3>
                            <ul className="space-y-2">
                                {qualityChecks.map((check, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                                        <CheckCircle
                                            size={14}
                                            className={`mt-0.5 flex-shrink-0 ${check.checked ? 'text-green-600' : 'text-gray-300'}`}
                                        />
                                        <span>{check.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Editor */}
                <div className="lg:col-span-3 space-y-6">
                    {/* NAW Fields */}
                    <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Jouw gegevens</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Naam *
                                </label>
                                <input
                                    type="text"
                                    value={candidateName}
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    placeholder="Voor- en achternaam"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={candidateEmail}
                                    onChange={(e) => setCandidateEmail(e.target.value)}
                                    placeholder="jouw@email.nl"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Telefoon
                                </label>
                                <input
                                    type="tel"
                                    value={candidatePhone}
                                    onChange={(e) => setCandidatePhone(e.target.value)}
                                    placeholder="+31 6 12345678"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Woonplaats *
                                </label>
                                <input
                                    type="text"
                                    value={candidateCity}
                                    onChange={(e) => setCandidateCity(e.target.value)}
                                    placeholder="Amsterdam"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Company Details */}
                    <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Bedrijfsgegevens</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Bedrijfsnaam
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Bedrijfsnaam B.V."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Contactpersoon *
                                </label>
                                <input
                                    type="text"
                                    value={contactPerson}
                                    onChange={(e) => setContactPerson(e.target.value)}
                                    placeholder="Dhr./Mevr. Achternaam"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Bedrijfsadres
                                </label>
                                <input
                                    type="text"
                                    value={companyAddress}
                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                    placeholder="Laan 456, 5678 CD Utrecht"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Letter Editor */}
                    <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-gray-900">Brief inhoud</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FileText size={16} />
                                <span>{displayContent.split(/\s+/).filter(w => w.length > 0).length} woorden</span>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-4 space-y-1">
                            <p>Je kunt de brief nu bewerken. Controleer of je tevreden bent. De tekst kan worden aangepast.</p>
                            <p className="text-gray-500">Jouw woonplaats, de datum en afzender worden nog automatisch toegevoegd.</p>
                            <p className="text-gray-500 italic">Tip: Gebruik Enter om alinea's af te breken</p>
                        </div>

                        <textarea
                            value={displayContent}
                            onChange={(e) => handleContentChange(e.target.value)}
                            className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cevace-blue resize-none font-serif"
                            placeholder="Je motivatiebrief..."
                            style={{ lineHeight: '1.8' }}
                        />
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            <div className="sticky bottom-4 bg-white rounded-xl p-4 border border-gray-100 shadow-lg">
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !editedContent.trim()}
                        className="flex-1 bg-cevace-orange text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Opslaan...</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Opslaan</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        className="flex-1 bg-cevace-blue text-white px-6 py-3 rounded-full font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                        <Download size={20} />
                        <span>Download PDF</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
