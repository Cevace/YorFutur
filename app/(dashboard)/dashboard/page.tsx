import Link from 'next/link';
import { Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import CandidateCommandCenter from '@/components/dashboard/command-center/CandidateCommandCenter';
import { mockUserData } from '@/components/dashboard/command-center/mockData';
import { JobApplication } from '@/actions/tracker';

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user role and profile info
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user?.id)
        .single();

    const isAdmin = profile?.role === 'admin';

    // Get first name from profile or fallback
    const firstName = profile?.full_name?.split(' ')[0] || 'daar';

    // Fetch real job applications for agenda sync
    const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

    // Fetch user's last Job Radar search
    const { data: lastSearch } = await supabase
        .from('job_radar_searches')
        .select('query, location, sector')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    // Fetch user's saved Job Radar results (from cron or manual search)
    const { data: radarResults } = await supabase
        .from('job_radar_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

    // Transform radar results to JobMatch format for the widget
    const jobRadarMatches = (radarResults || []).map((result: any, index: number) => ({
        id: result.id,
        job_title: result.job_title,
        company_name: result.company,
        location: result.location || 'Nederland',
        match_score: 95 - (index * 5), // Simulated score, decreasing by position
        posted_at: result.created_at,
        url: result.url // External URL for direct linking
    }));

    // Create user data with real first name, userRole, and real applications
    const userData = {
        ...mockUserData,
        firstName,
        userRole: 'Senior Frontend Developer',
        // Override with real applications for agenda sync
        realApplications: (applications as JobApplication[]) || [],
        // Add real Job Radar data
        jobMatches: jobRadarMatches.length > 0 ? jobRadarMatches : mockUserData.jobMatches,
        lastSearchQuery: lastSearch?.query || null
    };

    return (
        <div>
            {/* CandidateCommandCenter - Main Dashboard */}
            <CandidateCommandCenter userData={userData} />

            {/* Admin quick access - shown below command center */}
            {isAdmin && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Admin Tools</h2>
                    <Link
                        href="/dashboard/admin/customers"
                        className="inline-flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-cevace-orange hover:shadow-md transition-all group"
                    >
                        <div className="text-cevace-blue group-hover:text-cevace-orange transition-colors">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-cevace-blue transition-colors">
                                Klantenbeheer
                            </h3>
                            <p className="text-sm text-gray-500">Beheer gebruikers & toegang</p>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}

