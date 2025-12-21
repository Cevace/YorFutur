import { getApplications } from '@/actions/interview-coach/applications';
import Link from 'next/link';
import { Plus, Briefcase, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default async function CoachDashboard() {
    const applications = await getApplications();

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-semibold text-cevace-blue mb-4" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>
                    Interview Coach
                </h1>
                <p className="text-gray-600 text-lg">
                    AI-powered interview training die aansluit bij de bedrijfscultuur
                </p>
            </div>

            {/* Action Button */}
            <div className="mb-8">
                <Link
                    href="/dashboard/coach/create"
                    className="inline-flex items-center gap-2 bg-cevace-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
                    style={{ color: '#FFFFFF' }}
                >
                    <Plus size={20} />
                    Nieuwe Sollicitatie
                </Link>
            </div>

            {/* Applications Grid */}
            {applications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                        <Briefcase className="text-gray-400" size={40} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Nog geen sollicitaties
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Voeg je eerste sollicitatie toe en start met je interview training
                    </p>
                    <Link
                        href="/dashboard/coach/create"
                        className="inline-flex items-center gap-2 bg-cevace-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
                        style={{ color: '#FFFFFF' }}
                    >
                        <Plus size={20} />
                        Voeg Sollicitatie Toe
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map((app) => (
                        <ApplicationCard key={app.id} application={app} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ApplicationCard({ application }: { application: any }) {
    const intelligenceStatus = application.intelligence_status as 'pending' | 'researching' | 'complete' | 'failed';
    const status = application.status as 'preparation' | 'applied' | 'hired' | 'rejected';

    const intelligenceIcon = {
        pending: <Clock size={16} className="text-gray-400" />,
        researching: <Clock size={16} className="text-orange-500 animate-spin" />,
        complete: <CheckCircle size={16} className="text-green-500" />,
        failed: <AlertCircle size={16} className="text-red-500" />,
    }[intelligenceStatus];

    const intelligenceText = {
        pending: 'Wachtend op analyse',
        researching: 'Bedrijf analyseren...',
        complete: 'AI Analyse Compleet',
        failed: 'Analyse mislukt',
    }[intelligenceStatus];

    const statusColor = {
        preparation: 'bg-blue-100 text-blue-700',
        applied: 'bg-orange-100 text-orange-700',
        hired: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    }[status];

    const statusText = {
        preparation: 'Voorbereiding',
        applied: 'Aangevraagd',
        hired: 'Aangenomen',
        rejected: 'Afgewezen',
    }[status];

    return (
        <Link
            href={application.intelligence_status === 'complete' ? `/dashboard/coach/${application.id}/session` : '#'}
            className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 ${application.intelligence_status !== 'complete' ? 'cursor-not-allowed opacity-75' : ''
                }`}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-cevace-blue transition-colors">
                            {application.company_name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Briefcase size={14} />
                            {application.job_title}
                        </p>
                    </div>

                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor}`}>
                        {statusText}
                    </span>
                </div>

                {/* AI Analysis Status */}
                <div className="flex items-center gap-2 text-sm">
                    {intelligenceIcon}
                    <span className="text-gray-600">{intelligenceText}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(application.created_at).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>

                    {application.intelligence_status === 'complete' ? (
                        <span className="text-cevace-orange font-medium">
                            Start Training →
                        </span>
                    ) : (
                        <span className="text-gray-400">
                            Analyse bezig...
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
