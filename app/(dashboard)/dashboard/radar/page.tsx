'use client';

import { useState } from 'react';
import { Target, Bell, BellOff } from 'lucide-react';
import RadarSearchForm from '@/components/dashboard/RadarSearchForm';
import JobCard from '@/components/dashboard/JobCard';
import ManagerModal from '@/components/dashboard/ManagerModal';
import PitchModal from '@/components/dashboard/PitchModal';
import { searchJobsAction, JobResult } from '@/actions/job-search';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function RadarPage() {
    const [jobs, setJobs] = useState<JobResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Push notification hook
    const hookState = usePushNotifications();
    const { isSupported, subscription, subscribeToPush, unsubscribeFromPush, loading } = hookState;
    console.log('Push Hook State:', hookState);

    // Modal states
    const [managerModal, setManagerModal] = useState<{ isOpen: boolean; jobTitle: string; companyName: string }>({
        isOpen: false,
        jobTitle: '',
        companyName: ''
    });
    const [pitchModal, setPitchModal] = useState<{ isOpen: boolean; jobTitle: string; companyName: string }>({
        isOpen: false,
        jobTitle: '',
        companyName: ''
    });

    const handleSearch = async (query: string, location: string, sector: string, freshness: '24h' | '3days' | '7days') => {
        setIsSearching(true);
        setError(null);
        setJobs([]);

        const result = await searchJobsAction(query, location, sector, freshness);

        setIsSearching(false);

        if (result.success && result.data) {
            setJobs(result.data);
        } else {
            setError(result.error || 'Er ging iets mis');
        }
    };

    const handleFindManager = (jobTitle: string, companyName: string) => {
        setManagerModal({ isOpen: true, jobTitle, companyName });
    };

    const handleGeneratePitch = (jobTitle: string, companyName: string) => {
        setPitchModal({ isOpen: true, jobTitle, companyName });
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="font-bold text-cevace-blue mb-4" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>
                        Job Radar
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Vind de <strong>Hidden Job Market</strong> - Zoek direct bij werkgevers
                    </p>
                </div>

                {isSupported && (
                    <button
                        onClick={subscription ? unsubscribeFromPush : subscribeToPush}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${subscription
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                            : 'bg-cevace-orange text-white hover:bg-orange-600 shadow-sm'
                            }`}
                        title={subscription ? "Klik om alerts uit te zetten" : "Klik om alerts aan te zetten"}
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : subscription ? (
                            <>
                                <Bell size={18} />
                                <span>Alerts actief</span>
                            </>
                        ) : (
                            <>
                                <BellOff size={18} />
                                <span>Zet dagelijkse alerts aan</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Search Form */}
            <div className="mb-8">
                <RadarSearchForm onSearch={handleSearch} isLoading={isSearching} />
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-8">
                    {error}
                </div>
            )}

            {/* Results */}
            {jobs.length > 0 && (
                <div>
                    <h2 className="font-bold text-gray-900 mb-6" style={{ fontSize: '28px' }}>
                        {jobs.length} Vacatures gevonden
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onFindManager={handleFindManager}
                                onGeneratePitch={handleGeneratePitch}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {jobs.length === 0 && !isSearching && !error && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Target size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Klaar om de Hidden Job Market te ontdekken?</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Zoek naar vacatures direct op bedrijfswebsites - van lokale MKB tot nationale helden zoals Technische Unie.
                    </p>
                    <div className="mt-6 space-y-2 text-sm text-gray-600 max-w-lg mx-auto">
                        <p>💡 <strong>Pro Tip:</strong> Selecteer een sector voor gerichte resultaten</p>
                        <p>🎯 <strong>Strategie:</strong> Alle resultaten zijn direct van werkgevers</p>
                        <p>🏢 <strong>Bereik:</strong> Van lokale specialist tot nationale gigant</p>
                    </div>
                </div>
            )}

            {/* Loading State with Skeleton */}
            {isSearching && (
                <div>
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                                <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            <ManagerModal
                isOpen={managerModal.isOpen}
                onClose={() => setManagerModal({ ...managerModal, isOpen: false })}
                jobTitle={managerModal.jobTitle}
                companyName={managerModal.companyName}
            />
            <PitchModal
                isOpen={pitchModal.isOpen}
                onClose={() => setPitchModal({ ...pitchModal, isOpen: false })}
                jobTitle={pitchModal.jobTitle}
                companyName={pitchModal.companyName}
            />
        </div>
    );
}
