'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Printer, Type, Palette, Layout,
    AlertTriangle, CheckCircle2, Loader2, RefreshCcw, Link as LinkIcon
} from 'lucide-react';
import type { CVData } from '@/actions/cv-builder';
import type { TemplateId } from '@/types/cv-templates';
import { getUserCVSettings } from '@/actions/cv-builder';
import TemplateLibraryModal from '@/components/cv-builder/TemplateLibraryModal';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';

// --- MOCK API LOGICA ---
const SIMULATE_API_DELAY = 1500;

const mockAtsScanService = async (data: any) => {
    return new Promise<{ score: number; issues: any[] }>((resolve) => {
        setTimeout(() => {
            const issues = [];
            let score = 65;

            if (data.personal.summary.length < 50) {
                issues.push({ type: 'error', text: "Je profieltekst is te kort voor ATS systemen.", field: 'summary' });
                score -= 10;
            }
            if (data.skills.length < 5) {
                issues.push({ type: 'warning', text: "Voeg minimaal 5 relevante vaardigheden toe.", field: 'skills' });
                score -= 5;
            }
            const hasAction = data.experience.some((e: any) => e.description.toLowerCase().includes('verantwoordelijk') || e.description.toLowerCase().includes('succesvol'));
            if (!hasAction) {
                issues.push({ type: 'warning', text: "Gebruik krachtige actiewoorden in je werkervaring (bijv. 'Gerealiseerd', 'Geleid').", field: 'experience' });
                score -= 10;
            }

            resolve({ score, issues });
        }, SIMULATE_API_DELAY);
    });
};

// --- COMPONENTS ---
const ScoreCircle = ({ score, scanning }: { score: number; scanning: boolean }) => {
    const radius = 30;
    const stroke = 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            {scanning ? (
                <Loader2 className="animate-spin text-blue-600" size={40} />
            ) : (
                <>
                    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                        <circle stroke="#e5e7eb" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} fill="transparent" />
                        <circle
                            stroke={score > 75 ? "#22c55e" : score > 50 ? "#eab308" : "#ef4444"}
                            strokeWidth={stroke}
                            strokeDasharray={circumference + ' ' + circumference}
                            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                            strokeLinecap="round"
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            fill="transparent"
                        />
                    </svg>
                    <span className="absolute text-sm font-bold text-gray-700">{score}</span>
                </>
            )}
        </div>
    );
};

// --- MAIN CLIENT COMPONENT ---
export default function UltimateCVBuilderClient({ initialData }: { initialData: CVData }) {
    const [data, setData] = useState(initialData);
    const [activeTab, setActiveTab] = useState('editor');
    const [isScanning, setIsScanning] = useState(false);
    const [auditResult, setAuditResult] = useState<{ score: number; issues: any[] }>({ score: 0, issues: [] });
    const [hasScanned, setHasScanned] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [accentColor, setAccentColor] = useState('#2563eb');
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(initialData.personal.profilePhotoUrl || null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const cvPreviewRef = useRef<HTMLDivElement>(null);
    const [cvScale, setCvScale] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const [downloadStatus, setDownloadStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
    const [downloadUrl, setDownloadUrl] = useState('');
    const [downloadError, setDownloadError] = useState('');
    const [downloadFilename, setDownloadFilename] = useState('');

    // Fetch user's CV settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            const result = await getUserCVSettings();
            if (result.data) {
                setSelectedTemplate(result.data.template_id as TemplateId);
                setAccentColor(result.data.accent_color);
            }
            setIsLoadingSettings(false);
        };
        loadSettings();
    }, []);

    // Detect page count based on content height - DEBOUNCED to prevent infinite loops
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const detectPages = () => {
            const cvElement = cvPreviewRef.current;
            if (!cvElement) return;

            const cvHeight = cvElement.scrollHeight;
            const a4HeightPx = cvElement.offsetHeight; // 297mm in pixels
            const calculatedPages = Math.ceil(cvHeight / a4HeightPx);

            setTotalPages(calculatedPages);
        };

        // Debounce detectPages to prevent rapid re-renders
        timeoutId = setTimeout(detectPages, 150);

        // Re-detect on window resize
        window.addEventListener('resize', detectPages);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', detectPages);
        };
    }, [data, selectedTemplate, accentColor]);

    // Calculate scale to fit CV in viewport - IMPROVED for no-scroll experience
    useEffect(() => {
        const calculateScale = () => {
            const container = document.querySelector('.cv-preview-container');
            if (!container) {
                console.warn('CV preview container not found, retrying...');
                return;
            }

            const containerHeight = container.clientHeight;
            const containerWidth = container.clientWidth;

            // A4 dimensions in mm converted to pixels at 96 DPI (standard web resolution)
            // 210mm × 297mm = 793.7px × 1122.5px
            const mmToPx = 3.7795275591; // 96 DPI conversion factor
            const a4WidthPx = 210 * mmToPx;  // ~794px
            const a4HeightPx = 297 * mmToPx; // ~1123px

            // Leave padding for shadow and spacing
            const paddingPx = 32; // 16px on each side

            // Calculate scale to fit within container
            const scaleX = (containerWidth - paddingPx) / a4WidthPx;
            const scaleY = (containerHeight - paddingPx) / a4HeightPx;
            const scale = Math.min(scaleX, scaleY, 1); // Never scale up, only down

            console.log('CV Viewport Scale Calculation:', {
                containerHeight,
                containerWidth,
                a4HeightPx,
                a4WidthPx,
                scaleX,
                scaleY,
                finalScale: scale
            });

            setCvScale(scale);
        };

        // Initial calculation after short delay to ensure DOM is ready
        const timer = setTimeout(calculateScale, 150);

        // Recalculate immediately to catch early container availability
        calculateScale();

        // Recalculate on window resize
        window.addEventListener('resize', calculateScale);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateScale);
        };
    }, [selectedTemplate, currentPage, totalPages]);

    const runFullAudit = async () => {
        setIsScanning(true);
        setActiveTab('audit');
        try {
            const results = await mockAtsScanService(data);
            setAuditResult(results);
            setHasScanned(true);
        } catch (error) { console.error(error); } finally { setIsScanning(false); }
    };

    // Utility: Sanitize filename to prevent path traversal and invalid characters
    const sanitizeFilename = (name: string): string => {
        return name
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')  // Remove invalid filesystem chars
            .replace(/\s+/g, '_')                    // Replace spaces with underscores
            .replace(/_{2,}/g, '_')                  // Collapse multiple underscores
            .substring(0, 200)                       // Limit length
            .replace(/^\.+/, '')                     // Remove leading dots
            || 'CV';                                 // Fallback if empty
    };

    // PDF Download Handler - Canva Style (Overlay + Background)
    const handleDownloadPDF = async () => {
        setIsExporting(true);
        setDownloadStatus('generating'); // 'generating' | 'ready' | 'error'
        setDownloadUrl('');

        try {
            // 1. Generate PDF Session (Async)
            const response = await fetch('/api/cv-builder-pdf-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cvData: data,
                    template: selectedTemplate,
                    accentColor: accentColor,
                    options: {
                        includeWatermark: true,
                        watermarkText: 'Cevace',
                        customFooter: 'Gegenereerd met Cevace - cevace.nl',
                        pageNumbers: true,
                        sections: {
                            summary: true,
                            experience: true,
                            education: true,
                            skills: true,
                            languages: true
                        }
                    },
                }),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Je sessie is verlopen. Log opnieuw in.');
                } else {
                    throw new Error(`Server fout (${response.status})`);
                }
            }

            const sessionData = await response.json();
            const { sessionId, filename } = sessionData;

            if (!sessionId) {
                throw new Error('Geen session ID ontvangen');
            }

            console.log(`PDF session created: ${sessionId}, downloading ${filename}`);

            // Set download URL to direct session endpoint (preserves filename via Content-Disposition)
            const directUrl = `/api/cv-download?session=${sessionId}`;
            setDownloadUrl(directUrl);
            setDownloadFilename(filename);
            setDownloadStatus('ready');


            console.log('[INFO] Download ready. Attempting automatic download...');
            console.log('[INFO] Chrome blocks automatic downloads after async operations.');
            console.log('[DEBUG] Download URL set to:', directUrl);
            console.log('[DEBUG] Filename set to:', filename);

            // Attempt automatic download (works in normal browsers, may fail in dev tools)
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = directUrl;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                console.log('[INFO] Automatic download triggered');

                // Cleanup
                setTimeout(() => {
                    if (document.body.contains(link)) {
                        document.body.removeChild(link);
                    }
                }, 100);
            }, 300); // Small delay to ensure state is updated

            // Auto-close modal after giving time to see success
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    setIsExporting(false);
                    setDownloadStatus('idle');
                }
            }, 3000);


        } catch (error) {
            console.error('PDF generation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
            setDownloadError(errorMessage);
            setDownloadStatus('error');
        }
    };

    const renderModernLayout = () => (
        <div className="flex flex-col md:flex-row bg-white">
            <div className="w-full md:w-1/3 p-8 pb-20 text-white print:bg-blue-600 relative" style={{ backgroundColor: accentColor, WebkitPrintColorAdjust: 'exact' }}>
                <h1 className="font-bold leading-tight mb-2 whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{data.personal.fullName}</h1>
                <p className="text-white/80 font-medium uppercase tracking-wider text-sm mb-8">{data.personal.jobTitle}</p>

                {/* QR Code Section */}
                {data.personal.liveCvUrl && (
                    <div className="mb-6 flex justify-end">
                        <div className="bg-white p-2 rounded" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            <QRCodeSVG
                                value={data.personal.liveCvUrl}
                                size={40}
                                level="M"
                            />
                            <p className="text-xs text-center mt-1 text-gray-600">Scan voor online CV</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4 mb-8 opacity-90" style={{ fontSize: '14px', lineHeight: '1.45' }}>
                    <p>{data.personal.email}</p>
                    <p>{data.personal.phone}</p>
                    <p>{data.personal.address}</p>
                </div>
                <h3 className="font-bold border-b border-white/30 pb-2 mb-4 uppercase" style={{ fontSize: '18px' }}>Vaardigheden</h3>
                <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, i) => (
                        <span key={i} className="bg-white/20 px-2 py-1 rounded" style={{ fontSize: '14px' }}>{skill}</span>
                    ))}
                </div>

                {/* Languages Section */}
                {data.languages && data.languages.length > 0 && (
                    <>
                        <h3 className="font-bold border-b border-white/30 pb-2 mb-4 uppercase mt-8" style={{ fontSize: '18px' }}>
                            Talen
                        </h3>
                        <div className="space-y-2">
                            {data.languages.map((lang, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span style={{ fontSize: '14px' }}>{lang.language}</span>
                                    <span className="text-xs opacity-70">{lang.proficiency}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            <div className="w-full md:w-2/3 p-8">
                <div className="mb-8">
                    <h3 className="font-bold uppercase tracking-wider mb-2 text-gray-800" style={{ color: accentColor, fontSize: '20px' }}>Profiel</h3>
                    <p className="text-gray-700" style={{ fontSize: '14px', lineHeight: '1.45' }}>{data.personal.summary}</p>
                </div>
                <div className="mb-8">
                    <h3 className="font-bold uppercase tracking-wider mb-4 text-gray-800" style={{ color: accentColor, fontSize: '20px' }}>Werkervaring</h3>
                    {data.experience.map(exp => (
                        <div key={exp.id} className="mb-6">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>{exp.role}</h4>
                                <span className="text-gray-500 text-sm font-semibold">{exp.start} - {exp.end}</span>
                            </div>
                            <div className="text-gray-600 font-semibold mb-2" style={{ fontSize: '14px' }}>{exp.company}</div>
                            <div
                                className="text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold [&_em]:italic"
                                style={{ fontSize: '14px', lineHeight: '1.45' }}
                                dangerouslySetInnerHTML={{ __html: exp.description }}
                            />
                        </div>
                    ))}
                </div>

                {/* Education Section */}
                {data.education && data.education.length > 0 && (
                    <div className="mb-8">
                        <h3 className="font-bold uppercase tracking-wider mb-4 text-gray-800" style={{ color: accentColor, fontSize: '20px' }}>
                            Opleidingen
                        </h3>
                        {data.education.map(edu => (
                            <div key={edu.id} className="mb-6">
                                <h4 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>{edu.degree}</h4>
                                <div className="text-gray-500 font-semibold mb-2" style={{ fontSize: '14px' }}>
                                    {edu.school} | {edu.start} - {edu.end}
                                </div>
                                {edu.description && (
                                    <p className="text-gray-700" style={{ fontSize: '14px', lineHeight: '1.45' }}>
                                        {edu.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* QR Code Footer */}
                {data.personal.liveCvUrl && (
                    <div className="mt-auto pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <QRCodeSVG value={data.personal.liveCvUrl} size={60} />
                            <p className="text-sm text-gray-600">Scan voor online CV</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Classic Sidebar Layout (Purple) - Template from uploaded_image_0
    const renderClassicSidebarLayout = () => (
        <div className="flex h-[297mm] bg-white">
            {/* Left Sidebar - 30% */}
            <div className="w-[30%] p-8 pb-20 text-white print:bg-purple-800 h-full" style={{ backgroundColor: accentColor, WebkitPrintColorAdjust: 'exact' }}>
                {/* Photo */}
                {photoUrl && (
                    <div className="mb-6 flex justify-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white">
                            <Image src={photoUrl} alt={data.personal.fullName} width={128} height={128} className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}

                <h3 className="font-bold text-white uppercase tracking-wider mb-4" style={{ fontSize: '20px' }}>Personalia</h3>
                <div className="space-y-3 mb-8 text-sm">
                    <div>
                        <p className="font-semibold">Naam</p>
                        <p className="opacity-90">{data.personal.fullName}</p>
                    </div>
                    <div>
                        <p className="font-semibold">E-mailadres</p>
                        <p className="opacity-90">{data.personal.email}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Telefoonnummer</p>
                        <p className="opacity-90">{data.personal.phone}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Adres</p>
                        <p className="opacity-90">{data.personal.address}</p>
                    </div>
                    {data.personal.liveCvUrl && (
                        <div>
                            <p className="font-semibold">LinkedIn</p>
                            <p className="opacity-90 text-xs break-all">linkedin.com/in/{data.personal.fullName.toLowerCase().replace(' ', '')}</p>
                        </div>
                    )}
                </div>

                <h3 className="font-bold text-white uppercase tracking-wider mb-4" style={{ fontSize: '20px' }}>Vaardigheden</h3>
                <div className="space-y-2 text-sm mb-8">
                    {data.skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="flex-1">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, idx) => (
                                        <div key={idx} className={`w-3 h-3 rounded-full ${idx < 4 ? 'bg-white' : 'bg-white/30'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* QR Code in Sidebar */}
                {data.personal.liveCvUrl && (
                    <div className="mt-auto">
                        <h3 className="font-bold text-white uppercase tracking-wider mb-3" style={{ fontSize: '14px' }}>Live CV</h3>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-white p-[10px] rounded-md">
                                <QRCodeSVG value={data.personal.liveCvUrl} size={80} />
                            </div>
                            <p className="text-xs text-white/90 text-center">Scan voor online CV</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Content - 70% */}
            <div className="w-[70%] p-8">
                <h1 className="font-bold text-4xl mb-2" style={{ color: accentColor }}>{data.personal.fullName}</h1>

                <section className="mb-6">
                    <h3 className="font-bold uppercase tracking-wider mb-3" style={{ color: accentColor, fontSize: '20px' }}>Profiel</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{data.personal.summary}</p>
                </section>

                {data.education && data.education.length > 0 && (
                    <section className="mb-6">
                        <h3 className="font-bold uppercase tracking-wider mb-3" style={{ color: accentColor, fontSize: '20px' }}>Opleidingen</h3>
                        {data.education.map(edu => (
                            <div key={edu.id} className="mb-4">
                                <p className="font-bold text-gray-900">{edu.degree}</p>
                                <p className="text-sm text-gray-600">{edu.school}, {edu.city}</p>
                                <p className="text-sm text-gray-500">{edu.start} - {edu.end}</p>
                            </div>
                        ))}
                    </section>
                )}

                <section className="mb-6">
                    <h3 className="font-bold uppercase tracking-wider mb-3" style={{ color: accentColor, fontSize: '20px' }}>Werkervaring</h3>
                    {data.experience.map(exp => (
                        <div key={exp.id} className="mb-4">
                            <p className="font-bold text-gray-900 text-sm mb-1">{exp.role}</p>
                            <div className="flex justify-between items-baseline mb-1">
                                <p className="text-sm text-gray-600">{exp.company}, {exp.city}</p>
                                <span className="text-gray-500 text-xs font-semibold">{exp.start} - {exp.end}</span>
                            </div>
                            <div
                                className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold [&_em]:italic"
                                dangerouslySetInnerHTML={{ __html: exp.description }}
                            />
                        </div>
                    ))}
                </section>


            </div>
        </div>
    );

    // Modern Header Layout (Blue) - Template from uploaded_image_1
    const renderModernHeaderLayout = () => (
        <div className="bg-white">
            {/* Header */}
            <div className="p-8 text-white print:bg-blue-900 flex items-center gap-6" style={{ backgroundColor: accentColor, WebkitPrintColorAdjust: 'exact' }}>
                {/* Profile Photo */}
                {photoUrl && (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white flex-shrink-0">
                        <Image src={photoUrl} alt={data.personal.fullName} width={96} height={96} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="flex-1">
                    <h1 className="font-bold text-4xl mb-2">{data.personal.fullName}</h1>
                    <div className="flex flex-wrap gap-4 text-sm opacity-90">
                        <span>{data.personal.email}</span>
                        <span>{data.personal.phone}</span>
                        {data.personal.liveCvUrl && <span>linkedin.com/in/{data.personal.fullName.toLowerCase().replace(' ', '')}</span>}
                        <span>{data.personal.address}</span>
                    </div>
                </div>
            </div>

            {/* Two Column Body */}
            <div className="flex">
                {/* Left Column - 60% */}
                <div className="w-[60%] p-8 pb-20">
                    <section className="mb-6">
                        <h3 className="font-bold uppercase tracking-wider mb-3 pb-2 border-b-2" style={{ color: accentColor, borderColor: accentColor, fontSize: '18px' }}>Profiel</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{data.personal.summary}</p>
                    </section>

                    {data.education && data.education.length > 0 && (
                        <section className="mb-6">
                            <h3 className="font-bold uppercase tracking-wider mb-3 pb-2 border-b-2" style={{ color: accentColor, borderColor: accentColor, fontSize: '18px' }}>Opleidingen</h3>
                            {data.education.map(edu => (
                                <div key={edu.id} className="mb-4">
                                    <p className="font-bold text-gray-900">{edu.degree}</p>
                                    <p className="text-sm text-gray-600">{edu.school}</p>
                                    <p className="text-sm text-gray-500">{edu.start} - {edu.end}</p>
                                </div>
                            ))}
                        </section>
                    )}

                    <section className="mb-6">
                        <h3 className="font-bold uppercase tracking-wider mb-3 pb-2 border-b-2" style={{ color: accentColor, borderColor: accentColor, fontSize: '18px' }}>Werkervaring</h3>
                        {data.experience.map(exp => (
                            <div key={exp.id} className="mb-4">
                                <div className="flex justify-between items-baseline mb-1">
                                    <p className="font-bold text-gray-900">{exp.role}</p>
                                    <span className="text-sm text-gray-500 font-semibold">{exp.start} - {exp.end}</span>
                                </div>
                                <p className="text-sm text-gray-600">{exp.company}</p>
                                <div
                                    className="text-sm text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold [&_em]:italic"
                                    dangerouslySetInnerHTML={{ __html: exp.description }}
                                />
                            </div>
                        ))}
                    </section>
                </div>

                {/* Right Sidebar - 40% */}
                <div className="w-[40%] bg-gray-50 p-8">
                    <section className="mb-6">
                        <h3 className="font-bold uppercase tracking-wider mb-3" style={{ color: accentColor, fontSize: '18px' }}>Personalia</h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="font-semibold text-gray-700">LinkedIn</p>
                                <p className="text-gray-600 text-xs break-all">linkedin.com/in/{data.personal.fullName.toLowerCase().replace(' ', '')}</p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-6">
                        <h3 className="font-bold uppercase tracking-wider mb-3" style={{ color: accentColor, fontSize: '18px' }}>Vaardigheden</h3>
                        <div className="space-y-2">
                            {data.skills.map((skill, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{skill}</span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: '85%', backgroundColor: accentColor }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {data.languages && data.languages.length > 0 && (
                        <section>
                            <h3 className="font-bold uppercase tracking-wider mb-3" style={{ color: accentColor, fontSize: '18px' }}>Talen</h3>
                            <div className="space-y-2 text-sm">
                                {data.languages.map((lang, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span className="text-gray-700">{lang.language}</span>
                                        <span className="text-gray-500">{lang.proficiency}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* QR Code Footer */}
                    {data.personal.liveCvUrl && (
                        <section className="mt-auto pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <QRCodeSVG value={data.personal.liveCvUrl} size={60} />
                                <p className="text-sm text-gray-600">Scan voor online CV</p>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );

    // Photo Focus Layout (Green) - Template from uploaded_image_2
    const renderPhotoFocusLayout = () => (
        <div className="flex h-[297mm] bg-white">
            {/* Left Sidebar - 35% (wider as requested) */}
            <div className="w-[35%] p-6 pb-20 text-white print:bg-green-700 h-full" style={{ backgroundColor: accentColor, WebkitPrintColorAdjust: 'exact' }}>
                {/* Large Photo Circle */}
                {photoUrl ? (
                    <div className="mb-6 flex justify-center">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white">
                            <Image src={photoUrl} alt={data.personal.fullName} width={160} height={160} className="w-full h-full object-cover" />
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 flex justify-center">
                        <div className="w-40 h-40 rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
                            <span className="text-5xl font-bold">{data.personal.fullName[0]}</span>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="font-bold text-xl text-center leading-tight">Curriculum vitae</h2>
                </div>

                <div className="space-y-4 mb-6">
                    <h3 className="font-bold text-sm border-b border-white/50 pb-1">Personalia</h3>
                    <div className="space-y-2 text-sm">
                        <div>
                            <p className="font-semibold text-xs">Naam</p>
                            <p className="opacity-90">{data.personal.fullName}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-xs">E-mailadres</p>
                            <p className="opacity-90 break-all text-xs">{data.personal.email}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-xs">Telefoonnummer</p>
                            <p className="opacity-90">{data.personal.phone}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-xs">Stad</p>
                            <p className="opacity-90 leading-tight">{data.personal.address}</p>
                        </div>
                    </div>
                </div>

                {/* Opleidingen section (renamed from Cursussen) */}
                {data.education && data.education.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-bold text-sm border-b border-white/50 pb-1 mb-2">Opleidingen</h3>
                        <ul className="space-y-1 text-xs list-disc list-inside">
                            {data.education.map((edu, i) => (
                                <li key={i}>{edu.degree} - {edu.school}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Vaardigheden with rating dots */}
                {data.skills.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-bold text-sm border-b border-white/50 pb-1 mb-2">Vaardigheden</h3>
                        <div className="space-y-2">
                            {data.skills.slice(0, 5).map((skill, i) => (
                                <div key={i} className="text-xs">
                                    <div className="mb-0.5">{skill}</div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, idx) => (
                                            <div key={idx} className={`w-2 h-2 rounded-full ${idx < 4 ? 'bg-white' : 'bg-white/30'}`} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Content - 65% */}
            <div className="w-[65%] p-8">
                <h1 className="font-bold text-3xl mb-4" style={{ color: accentColor }}>{data.personal.fullName}</h1>

                <section className="mb-5">
                    <h3 className="font-bold uppercase tracking-wider mb-2" style={{ color: accentColor, fontSize: '16px' }}>Profiel</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{data.personal.summary}</p>
                </section>

                {data.education && data.education.length > 0 && (
                    <section className="mb-5">
                        <h3 className="font-bold uppercase tracking-wider mb-2" style={{ color: accentColor, fontSize: '16px' }}>Opleidingen</h3>
                        {data.education.map(edu => (
                            <div key={edu.id} className="mb-3">
                                <p className="text-xs text-gray-500 font-semibold">{edu.start} - {edu.end}</p>
                                <p className="font-bold text-gray-900 text-sm">{edu.degree}</p>
                                <p className="text-xs text-gray-600">{edu.school}, {edu.city}</p>
                            </div>
                        ))}
                    </section>
                )}

                <section className="mb-5">
                    <h3 className="font-bold uppercase tracking-wider mb-2" style={{ color: accentColor, fontSize: '16px' }}>Werkervaring</h3>
                    {data.experience.map(exp => (
                        <div key={exp.id} className="mb-4">
                            <div className="flex justify-between items-baseline mb-1">
                                <p className="font-bold text-gray-900 text-sm">{exp.role}</p>
                                <span className="text-gray-500 text-xs font-semibold">{exp.start} - {exp.end}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{exp.company}, {exp.city}</p>
                            <div
                                className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold [&_em]:italic"
                                dangerouslySetInnerHTML={{ __html: exp.description }}
                            />
                        </div>
                    ))}
                </section>

                {/* QR Code Footer */}
                {data.personal.liveCvUrl && (
                    <section className="mt-auto pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <QRCodeSVG value={data.personal.liveCvUrl} size={60} />
                            <p className="text-sm text-gray-600">Scan voor online CV</p>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );

    // Template Switcher
    const renderSelectedTemplate = () => {
        switch (selectedTemplate) {
            case 'classic-sidebar':
                return renderClassicSidebarLayout();
            case 'modern-header':
                return renderModernHeaderLayout();
            case 'photo-focus':
                return renderPhotoFocusLayout();
            case 'modern':
            default:
                return renderModernLayout();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Download Overlay (Canva style) */}
            {isExporting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 animate-in fade-in zoom-in duration-200">
                        {downloadStatus === 'generating' && (
                            <>
                                <div className="mx-auto w-16 h-16 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin mb-6"></div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Even geduld...</h3>
                                <p className="text-gray-500">We maken je CV in orde.</p>
                            </>
                        )}
                        {downloadStatus === 'ready' && (
                            <>
                                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Je CV is klaar!</h3>
                                <p className="text-gray-500 mb-4">Download start automatisch...</p>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                                    <p className="text-xs text-gray-600 mb-2">Start download niet? Klik hieronder:</p>
                                    <a
                                        href={downloadUrl}
                                        download={downloadFilename}
                                        className="inline-flex items-center justify-center w-full px-3 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download {downloadFilename || 'CV'}
                                    </a>
                                </div>
                            </>
                        )}
                        {downloadStatus === 'error' && (
                            <>
                                <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Er ging iets mis</h3>
                                <p className="text-red-500 text-sm mb-6">{downloadError}</p>
                                <button
                                    onClick={() => { setIsExporting(false); setDownloadStatus('idle'); }}
                                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Sluiten
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
            <div className="bg-[#22223B] border-b border-white/10 h-16 px-6 flex items-center justify-between sticky top-0 z-50 print:hidden">
                <Link href="/dashboard" className="flex items-center">
                    <Image src="/logo/Cevace-wit-logo.svg" alt="Cevace" width={120} height={30} className="h-8 w-auto" />
                </Link>
                <div className="flex items-center gap-3">
                    <button onClick={runFullAudit} className="hidden md:flex items-center gap-2 text-sm font-medium text-white/70 hover:text-[#F97316] transition-colors"><RefreshCcw size={16} /> Scan</button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isExporting}
                        className="bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Genereren...
                            </>
                        ) : (
                            <>
                                <Printer size={16} /> Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-full lg:w-[450px] bg-[#F2E9E4] border-r border-[#C9ADA7]/20 flex flex-col h-full overflow-hidden print:hidden">
                    {/* Navigation Buttons */}
                    <div className="bg-[#4A4E69] p-4">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setActiveTab('editor')}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeTab === 'editor' ? 'bg-white text-[#4A4E69]' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            >
                                <Type size={14} /> Editor
                            </button>
                            <button
                                onClick={() => setActiveTab('design')}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeTab === 'design' ? 'bg-white text-[#4A4E69]' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            >
                                <Palette size={14} /> Design
                            </button>
                            <button
                                onClick={() => setActiveTab('audit')}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeTab === 'audit' ? 'bg-white text-[#4A4E69]' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            >
                                <CheckCircle2 size={14} /> Smart Audit
                                {hasScanned && <span className={`w-2 h-2 rounded-full ${auditResult.score > 70 ? 'bg-green-500' : 'bg-red-500'}`} />}
                            </button>
                            <button
                                onClick={() => setShowTemplateModal(true)}
                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium bg-white/20 text-white hover:bg-white/30 transition-all"
                            >
                                <Layout size={14} /> Sjabloon
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border-b border-[#C9ADA7]/20 bg-white/50 flex justify-between items-center">
                        <div><h2 className="font-semibold text-[#22223B]">CV Score</h2><p className="text-xs text-[#4A4E69]">ATS Standaarden</p></div>
                        <div className="flex items-center gap-4"><ScoreCircle score={hasScanned ? auditResult.score : 0} scanning={isScanning} /></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'editor' && (
                            <div className="space-y-8 pb-20">
                                <section className="space-y-4">
                                    <h3 style={{ fontSize: '20px', color: '#4A4E69' }} className="font-semibold uppercase tracking-wider mb-6">Persoonsgegevens</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input value={data.personal.fullName} onChange={e => setData({ ...data, personal: { ...data.personal, fullName: e.target.value } })} placeholder="Naam" className="p-2 border rounded text-sm w-full" />
                                        <input value={data.personal.jobTitle} onChange={e => setData({ ...data, personal: { ...data.personal, jobTitle: e.target.value } })} placeholder="Functie" className="p-2 border rounded text-sm w-full" />
                                    </div>

                                    {/* Live CV URL Display */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A4E69' }}>
                                            Live CV URL (Automatisch gegenereerd)
                                        </label>
                                        <div className="text-sm text-gray-700 font-mono py-2">
                                            {data.personal.liveCvUrl || 'Wordt gegenereerd...'}
                                        </div>
                                        <p className="text-xs text-gray-500">✓ Unieke URL - QR code verschijnt automatisch op CV</p>
                                    </div>

                                    <div>
                                        <textarea className="w-full p-3 border rounded-lg text-sm min-h-[120px]" value={data.personal.summary} onChange={e => setData({ ...data, personal: { ...data.personal, summary: e.target.value } })} placeholder="Profiel..." />
                                    </div>
                                </section>
                                <section className="space-y-4">
                                    <h3 style={{ fontSize: '20px', color: '#4A4E69' }} className="font-semibold uppercase tracking-wider mb-6">Werkervaring</h3>
                                    {data.experience.map((exp, idx) => (
                                        <div key={exp.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                                            <input value={exp.role} onChange={e => { const newExp = [...data.experience]; newExp[idx].role = e.target.value; setData({ ...data, experience: newExp }); }} className="font-bold text-sm border-none p-0 w-full mb-1" placeholder="Functie" />
                                            <div className="mt-2">
                                                <textarea className="w-full p-2 bg-gray-50 border border-gray-100 rounded text-sm min-h-[100px]" value={exp.description} onChange={e => { const newExp = [...data.experience]; newExp[idx].description = e.target.value; setData({ ...data, experience: newExp }); }} />
                                            </div>
                                        </div>
                                    ))}
                                </section>
                                <section className="space-y-4">
                                    <h3 style={{ fontSize: '20px', color: '#4A4E69' }} className="font-semibold uppercase tracking-wider mb-6">Skills</h3>
                                    <textarea className="w-full p-3 border rounded text-sm" value={data.skills.join(", ")} onChange={e => setData({ ...data, skills: e.target.value.split(", ") })} placeholder="Bijv: Project Management, Data Analysis, Python" />
                                </section>
                                <section className="space-y-4">
                                    <h3 style={{ fontSize: '20px', color: '#4A4E69' }} className="font-semibold uppercase tracking-wider mb-6">Talen</h3>
                                    <p className="text-xs text-gray-500 mb-2">ℹ️ Voeg talen toe via je Profiel pagina</p>
                                    {data.languages && data.languages.length > 0 ? (
                                        <div className="space-y-2">
                                            {data.languages.map((lang, i) => (
                                                <div key={i} className="p-2 bg-gray-50 rounded flex justify-between">
                                                    <span className="text-sm font-medium">{lang.language}</span>
                                                    <span className="text-xs text-gray-500">{lang.proficiency}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Nog geen talen toegevoegd</p>
                                    )}
                                </section>
                            </div>
                        )}
                        {activeTab === 'audit' && (
                            <div className="space-y-6">
                                {!hasScanned && !isScanning && <div className="text-center py-10"><button onClick={runFullAudit} className="bg-[#F97316] hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-all hover:-translate-y-0.5">Start Analyse</button></div>}
                                {isScanning && <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>}
                                {hasScanned && !isScanning && (
                                    <div className="space-y-4">
                                        <div className={`p-4 rounded-lg border ${auditResult.score > 70 ? 'bg-green-50' : 'bg-orange-50'}`}><h3 className="font-bold">Score: {auditResult.score}/100</h3></div>
                                        <div>{auditResult.issues.map((issue: any, idx: number) => (<div key={idx} className="flex gap-3 p-3 bg-white border rounded-lg mb-2"><AlertTriangle size={16} className="text-yellow-500" /><p className="text-sm">{issue.text}</p></div>))}</div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'design' && (
                            <div className="space-y-6">
                                <div><h3 className="font-bold text-gray-700 mb-2">Kleur</h3><div className="flex gap-2">{['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c'].map(c => (<button key={c} onClick={() => setAccentColor(c)} className={`w-8 h-8 rounded-full border-2 ${accentColor === c ? 'border-gray-400' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}</div></div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 bg-gray-200 overflow-hidden p-8 flex justify-center print:bg-white print:p-0 print:overflow-visible">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            /* Page settings */
                            @page {
                                size: A4 portrait;
                                margin: 0;
                            }

                            /* Hide everything except CV */
                            body > *:not(.print-container) {
                                display: none !important;
                            }

                            /* Force colors to print */
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }

                            /* CV Container */
                            .print-container {
                                display: block !important;
                                position: absolute !important;
                                top: 0 !important;
                                left: 0 !important;
                                width: 100% !important;
                                height: 100% !important;
                                background: white !important;
                                overflow: visible !important;
                            }


                            /* CV Preview - A4 pagination */
                            #cv-preview {
                                width: 210mm !important;
                                max-height: none !important; /* Allow multiple pages */
                                margin: 0 auto !important;
                                box-shadow: none !important;
                                background: white !important;
                            }

                            /* Page breaks for sections */
                            section, .mb-8, .mb-6, .mb-5 {
                                page-break-inside: avoid !important;
                            }

                            /* Avoid breaking experience/education items */
                            section > div {
                                page-break-inside: avoid !important;
                            }

                            /* Force new page after 297mm */
                            @page {
                                size: A4 portrait;
                                margin: 0;
                            }

                            /* Force background colors */
                            [style*="background"],
                            [style*="backgroundColor"] {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }

                            /* QR Code */
                            canvas,
                            svg {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                    ` }} />

                    {/* Carousel Preview Container */}
                    <div className="print-container flex flex-col h-full">
                        {/* Page Warning */}
                        {totalPages > 2 && (
                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                                <AlertTriangle size={18} className="text-orange-600" />
                                <p className="text-sm text-orange-700">
                                    <strong>Let op:</strong> Je CV heeft {totalPages} pagina's. Maximum 2 pagina's wordt aanbevolen.
                                </p>
                            </div>
                        )}

                        {/* CV Carousel - No scrolling, viewport-fitted */}
                        <div className="flex-1 relative overflow-hidden rounded-lg cv-preview-container" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            <div
                                className="flex transition-transform duration-500 ease-in-out h-full"
                                style={{ transform: `translateX(-${(currentPage - 1) * 100}%)` }}
                            >
                                {/* Page 1 */}
                                <div className="min-w-full flex items-center justify-center p-4">
                                    <div
                                        ref={cvPreviewRef}
                                        id="cv-preview"
                                        className="w-[210mm] h-[297mm] print:shadow-none bg-white overflow-hidden"
                                        style={{
                                            transform: `scale(${cvScale})`,
                                            transformOrigin: 'center center',
                                            transition: 'transform 0.2s ease-out'
                                        }}
                                    >
                                        {renderSelectedTemplate()}
                                    </div>
                                </div>

                                {/* Page 2+ render actual overflow content with sidebars */}
                                {totalPages >= 2 && Array.from({ length: totalPages - 1 }).map((_, pageIndex) => {
                                    const pageNum = pageIndex + 2;
                                    const offsetMm = (pageIndex + 1) * 297;

                                    // Render based on selected template - showing only continuing content on pages 2+
                                    if (selectedTemplate === 'modern') {
                                        return (
                                            <div key={pageNum} className="min-w-full flex items-center justify-center p-4">
                                                <div className="w-[210mm] h-[297mm] bg-white overflow-hidden relative"
                                                    style={{
                                                        transform: `scale(${cvScale})`,
                                                        transformOrigin: 'center center',
                                                        transition: 'transform 0.2s ease-out'
                                                    }}>
                                                    <div className="absolute inset-0" style={{ transform: `translateY(-${offsetMm}mm)` }}>
                                                        {/* Render exact same template as page 1 */}
                                                        <div className="flex bg-white">
                                                            {/* Left Sidebar - empty colored bar matching page 1 */}
                                                            <div className="w-1/3 text-white print:bg-purple-800" style={{ backgroundColor: accentColor, WebkitPrintColorAdjust: 'exact' }}>
                                                                {/* Empty - content is only on page 1 */}
                                                            </div>
                                                            {/* Right Content - continuing from page 1 */}
                                                            <div className="w-2/3 p-8">
                                                                {/* Profile */}
                                                                <div className="mb-8">
                                                                    <h3 className="font-bold uppercase tracking-wider mb-4 text-gray-800" style={{ color: accentColor, fontSize: '20px' }}>
                                                                        Profiel
                                                                    </h3>
                                                                    <p className="text-gray-700 leading-relaxed" style={{ fontSize: '14px', lineHeight: '1.45' }}>
                                                                        {data.personal.summary}
                                                                    </p>
                                                                </div>

                                                                {/* Work Experience */}
                                                                <div className="mb-8">
                                                                    <h3 className="font-bold uppercase tracking-wider mb-4 text-gray-800" style={{ color: accentColor, fontSize: '20px' }}>
                                                                        Werkervaring
                                                                    </h3>
                                                                    {data.experience.map(exp => (
                                                                        <div key={exp.id} className="mb-6">
                                                                            <h4 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>{exp.role}</h4>
                                                                            <div className="text-gray-500 font-semibold mb-2" style={{ fontSize: '14px' }}>
                                                                                {exp.company} | {exp.start} - {exp.end}
                                                                            </div>
                                                                            <div
                                                                                className="text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold [&_em]:italic"
                                                                                style={{ fontSize: '14px', lineHeight: '1.45' }}
                                                                                dangerouslySetInnerHTML={{ __html: exp.description }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Education */}
                                                                {data.education && data.education.length > 0 && (
                                                                    <div className="mb-8">
                                                                        <h3 className="font-bold uppercase tracking-wider mb-4 text-gray-800" style={{ color: accentColor, fontSize: '20px' }}>
                                                                            Opleidingen
                                                                        </h3>
                                                                        {data.education.map(edu => (
                                                                            <div key={edu.id} className="mb-6">
                                                                                <h4 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>{edu.degree}</h4>
                                                                                <div className="text-gray-500 font-semibold mb-2" style={{ fontSize: '14px' }}>
                                                                                    {edu.school} | {edu.start} - {edu.end}
                                                                                </div>
                                                                                {edu.description && (
                                                                                    <p className="text-gray-700" style={{ fontSize: '14px', lineHeight: '1.45' }}>
                                                                                        {edu.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else if (selectedTemplate === 'classic-sidebar') {
                                        return (
                                            <div key={pageNum} className="min-w-full flex items-center justify-center p-4">
                                                <div className="w-[210mm] h-[297mm] bg-white overflow-hidden relative"
                                                    style={{
                                                        transform: `scale(${cvScale})`,
                                                        transformOrigin: 'center center',
                                                        transition: 'transform 0.2s ease-out'
                                                    }}>
                                                    <div className="absolute inset-0" style={{ transform: `translateY(-${offsetMm}mm)` }}>
                                                        {/* Render exact same template structure as page 1 */}
                                                        <div className="flex h-[297mm] bg-white">
                                                            {/* Left Sidebar - empty colored bar */}
                                                            <div className="w-[30%] p-8 pb-20 text-white print:bg-purple-800 h-full" style={{ backgroundColor: accentColor, WebkitPrintColorAdjust: 'exact' }}>
                                                                {/* Empty on page 2+ */}
                                                            </div>

                                                            {/* Right Content - continuing */}
                                                            <div className="w-[70%] p-8">
                                                                <section className="mb-6">
                                                                    <h3 className="font-bold uppercase tracking-wider mb-3" style={{ color: accentColor, fontSize: '20px' }}>Profiel</h3>
                                                                    <p className="text-gray-700 text-sm leading-relaxed">{data.personal.summary}</p>
                                                                </section>

                                                                {data.education && data.education.length > 0 && (
                                                                    <section className="mb-6">
                                                                        <h3 className="font-bold uppercase tracking-wider mb-3" style={{ color: accentColor, fontSize: '20px' }}>Opleidingen</h3>
                                                                        {data.education.map(edu => (
                                                                            <div key={edu.id} className="mb-4">
                                                                                <p className="font-bold text-gray-900">{edu.degree}</p>
                                                                                <p className="text-sm text-gray-600">{edu.school}, {edu.city}</p>
                                                                                <p className="text-sm text-gray-500">{edu.start} - {edu.end}</p>
                                                                            </div>
                                                                        ))}
                                                                    </section>
                                                                )}

                                                                <section className="mb-6">
                                                                    <h3 className="font-bold uppercase tracking-wider mb-3" style={{ color: accentColor, fontSize: '20px' }}>Werkervaring</h3>
                                                                    {data.experience.map(exp => (
                                                                        <div key={exp.id} className="mb-4">
                                                                            <p className="font-bold text-gray-900 text-sm mb-1">{exp.role}</p>
                                                                            <div className="flex justify-between items-baseline mb-1">
                                                                                <p className="text-sm text-gray-600">{exp.company}, {exp.city}</p>
                                                                                <span className="text-gray-500 text-xs font-semibold">{exp.start} - {exp.end}</span>
                                                                            </div>
                                                                            <div
                                                                                className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold [&_em]:italic"
                                                                                dangerouslySetInnerHTML={{ __html: exp.description }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </section>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else if (selectedTemplate === 'photo-focus') {
                                        return (
                                            <div key={pageNum} className="min-w-full flex items-center justify-center p-4">
                                                <div className="w-[210mm] h-[297mm] bg-white overflow-hidden relative"
                                                    style={{
                                                        transform: `scale(${cvScale})`,
                                                        transformOrigin: 'center center',
                                                        transition: 'transform 0.2s ease-out'
                                                    }}>
                                                    <div className="absolute inset-0" style={{ transform: `translateY(-${offsetMm}mm)` }}>
                                                        {/* Render exact same template structure as page 1 */}
                                                        <div className="flex h-[297mm] bg-white">
                                                            {/* Left Sidebar - empty colored bar */}
                                                            <div className="w-[35%] p-6 pb-20 text-white print:bg-green-700 h-full" style={{ backgroundColor: accentColor, WebkitPrintColorAdjust: 'exact' }}>
                                                                {/* Empty on page 2+ */}
                                                            </div>

                                                            {/* Right Content - continuing */}
                                                            <div className="w-[65%] p-8">
                                                                <section className="mb-5">
                                                                    <h3 className="font-bold uppercase tracking-wider mb-2" style={{ color: accentColor, fontSize: '16px' }}>Profiel</h3>
                                                                    <p className="text-gray-700 text-sm leading-relaxed">{data.personal.summary}</p>
                                                                </section>

                                                                {data.education && data.education.length > 0 && (
                                                                    <section className="mb-5">
                                                                        <h3 className="font-bold uppercase tracking-wider mb-2" style={{ color: accentColor, fontSize: '16px' }}>Opleidingen</h3>
                                                                        {data.education.map(edu => (
                                                                            <div key={edu.id} className="mb-3">
                                                                                <p className="text-xs text-gray-500 font-semibold">{edu.start} - {edu.end}</p>
                                                                                <p className="font-bold text-gray-900 text-sm">{edu.degree}</p>
                                                                                <p className="text-xs text-gray-600">{edu.school}, {edu.city}</p>
                                                                            </div>
                                                                        ))}
                                                                    </section>
                                                                )}

                                                                <section className="mb-5">
                                                                    <h3 className="font-bold uppercase tracking-wider mb-2" style={{ color: accentColor, fontSize: '16px' }}>Werkervaring</h3>
                                                                    {data.experience.map(exp => (
                                                                        <div key={exp.id} className="mb-4">
                                                                            <div className="flex justify-between items-baseline mb-1">
                                                                                <p className="font-bold text-gray-900 text-sm">{exp.role}</p>
                                                                                <span className="text-gray-500 text-xs font-semibold">{exp.start} - {exp.end}</span>
                                                                            </div>
                                                                            <p className="text-xs text-gray-600 mb-1">{exp.company}, {exp.city}</p>
                                                                            <div
                                                                                className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold [&_em]:italic"
                                                                                dangerouslySetInnerHTML={{ __html: exp.description }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </section>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // Modern Header - no sidebar, continuing content
                                        return (
                                            <div key={pageNum} className="min-w-full flex items-center justify-center p-4">
                                                <div className="w-[210mm] h-[297mm] bg-white overflow-hidden relative"
                                                    style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 250px)', objectFit: 'contain' }}>
                                                    <div className="absolute inset-0" style={{ transform: `translateY(-${offsetMm}mm)` }}>
                                                        <div className="bg-white">
                                                            <div className="flex">
                                                                {/* Left Column - 60% */}
                                                                <div className="w-[60%] p-8 pb-20">
                                                                    <section className="mb-6">
                                                                        <h3 className="font-bold uppercase tracking-wider mb-3 pb-2 border-b-2" style={{ color: accentColor, borderColor: accentColor, fontSize: '18px' }}>Profiel</h3>
                                                                        <p className="text-gray-700 text-sm leading-relaxed">{data.personal.summary}</p>
                                                                    </section>

                                                                    {data.education && data.education.length > 0 && (
                                                                        <section className="mb-6">
                                                                            <h3 className="font-bold uppercase tracking-wider mb-3 pb-2 border-b-2" style={{ color: accentColor, borderColor: accentColor, fontSize: '18px' }}>Opleidingen</h3>
                                                                            {data.education.map(edu => (
                                                                                <div key={edu.id} className="mb-4">
                                                                                    <p className="font-bold text-gray-900">{edu.degree}</p>
                                                                                    <p className="text-sm text-gray-600">{edu.school}</p>
                                                                                    <p className="text-sm text-gray-500">{edu.start} - {edu.end}</p>
                                                                                </div>
                                                                            ))}
                                                                        </section>
                                                                    )}

                                                                    <section className="mb-6">
                                                                        <h3 className="font-bold uppercase tracking-wider mb-3 pb-2 border-b-2" style={{ color: accentColor, borderColor: accentColor, fontSize: '18px' }}>Werkervaring</h3>
                                                                        {data.experience.map(exp => (
                                                                            <div key={exp.id} className="mb-4">
                                                                                <div className="flex justify-between items-baseline mb-1">
                                                                                    <p className="font-bold text-gray-900">{exp.role}</p>
                                                                                    <span className="text-sm text-gray-500 font-semibold">{exp.start} - {exp.end}</span>
                                                                                </div>
                                                                                <p className="text-sm text-gray-600">{exp.company}</p>
                                                                                <div
                                                                                    className="text-sm text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold [&_em]:italic"
                                                                                    dangerouslySetInnerHTML={{ __html: exp.description }}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </section>
                                                                </div>

                                                                {/* Right Sidebar - empty on page 2+ */}
                                                                <div className="w-[40%] bg-gray-50 p-8">
                                                                    {/* Empty - skills/languages only on page 1 */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Page Navigation - Outside container, aligned to preview area */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-[450px] bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-40 print:hidden">
                <div className="flex items-center justify-center gap-4 py-3 px-6">
                    {/* Previous Button */}
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Vorige pagina"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                        </svg>
                    </button>

                    {/* Page Dots */}
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`transition-all ${currentPage === i + 1
                                    ? 'w-10 h-3 bg-[#F97316] rounded-full'
                                    : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400'
                                    }`}
                                title={`Pagina ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Volgende pagina"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                        </svg>
                    </button>
                </div>

                {/* Page Counter */}
                <div className="text-center text-xs text-gray-600 pb-2">
                    Pagina {currentPage} van {totalPages}
                </div>
            </div>

            {/* Template Library Modal */}
            <TemplateLibraryModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                currentTemplateId={selectedTemplate}
                currentAccentColor={accentColor}
                onTemplateSelect={(templateId, color) => {
                    setSelectedTemplate(templateId);
                    setAccentColor(color);
                }}
            />
        </div>
    );
}
