import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { trackViewAction } from '@/actions/live-cv';
import { Mail, Phone, MapPin, Linkedin, Globe, Calendar, Building, GraduationCap, Languages } from 'lucide-react';

interface PageProps {
    params: {
        slug: string;
    };
}

export default async function PublicCVPage({ params }: PageProps) {
    // Get user agent from headers (server-side)
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || undefined;
    const referer = headersList.get('referer') || undefined;

    // Track view and get profile data
    const result = await trackViewAction(params.slug, userAgent, referer);

    if (!result.success || !result.data) {
        console.error('CV not found:', result.error);
        notFound();
    }

    const { profile, experiences, educations, languages } = result.data;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                    <h1
                        className="font-bold text-gray-900 mb-2"
                        style={{ fontSize: '42px' }}
                    >
                        {profile.full_name}
                    </h1>

                    <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                        {profile.email && (
                            <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-cevace-blue">
                                <Mail className="w-4 h-4" />
                                <span>{profile.email}</span>
                            </a>
                        )}
                        {profile.phone && (
                            <a href={`tel:${profile.phone}`} className="flex items-center gap-2 hover:text-cevace-blue">
                                <Phone className="w-4 h-4" />
                                <span>{profile.phone}</span>
                            </a>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {profile.linkedin_url && (
                            <a
                                href={profile.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Linkedin className="w-4 h-4" />
                                <span>LinkedIn</span>
                            </a>
                        )}
                    </div>

                    {profile.summary && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {profile.summary}
                            </p>
                        </div>
                    )}
                </div>

                {/* Work Experience */}
                {experiences && experiences.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Building className="w-6 h-6 text-cevace-blue" />
                            Werkervaring
                        </h2>
                        <div className="space-y-6">
                            {experiences.map((exp: any) => (
                                <div key={exp.id} className="border-l-2 border-cevace-blue pl-4">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {exp.job_title}
                                    </h3>
                                    <div className="text-cevace-blue font-medium mb-2">
                                        {exp.company}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {new Date(exp.start_date).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                                            {' - '}
                                            {exp.end_date
                                                ? new Date(exp.end_date).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
                                                : 'Heden'
                                            }
                                        </span>
                                    </div>
                                    {exp.description && (
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {educations && educations.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-cevace-blue" />
                            Opleiding
                        </h2>
                        <div className="space-y-6">
                            {educations.map((edu: any) => (
                                <div key={edu.id} className="border-l-2 border-cevace-blue pl-4">
                                    <h3
                                        className="font-semibold text-gray-900 mb-1"
                                        style={{ fontSize: '20px' }}
                                    >
                                        {edu.school}
                                    </h3>
                                    <div
                                        className="text-gray-700 mb-2"
                                        style={{ fontSize: '16px' }}
                                    >
                                        {edu.degree || edu.field_of_study || 'Opleiding'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {new Date(edu.start_date).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                                            {' - '}
                                            {edu.end_date
                                                ? new Date(edu.end_date).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
                                                : 'Heden'
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {languages && languages.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Languages className="w-6 h-6 text-cevace-blue" />
                            Talen
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {languages.map((lang: any) => (
                                <div key={lang.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-900">{lang.language}</span>
                                    <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                                        {lang.proficiency}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Gemaakt met Cevace - Jouw partner in carrière succes</p>
                </div>
            </div>
        </div >
    );
}
