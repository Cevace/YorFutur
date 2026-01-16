'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
    BarChart3, Users, Clock, Monitor, Smartphone, Tablet, Calendar,
    Globe, Chrome, Compass, ArrowDownRight, ArrowUpRight, Activity, Link2
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

interface AnalyticsDashboardProps {
    todayViews: number;
    uniqueVisitorsToday: number;
    dailyViews: { date: string; views: number }[];
    topPages: { page: string; views: number }[];
    avgDuration: number;
    deviceBreakdown: { device: string; count: number }[];
    currentRange: string;
    rangeLabel: string;
    totalRangeViews: number;
    uniqueVisitorsInRange: number;
    // New props
    topReferrers: { source: string; count: number }[];
    browserBreakdown: { browser: string; count: number }[];
    osBreakdown: { os: string; count: number }[];
    utmCampaigns: { source: string; medium: string; campaign: string; count: number }[];
    bounceRate: number;
    hourlyDistribution: { hour: number; count: number }[];
    liveVisitors: number;
    topEntryPages: { page: string; count: number }[];
    topExitPages: { page: string; count: number }[];
}

const DEVICE_COLORS: Record<string, string> = {
    desktop: '#22223B',
    mobile: '#d97706',
    tablet: '#4A4E69',
    unknown: '#C9ADA7'
};

const BROWSER_COLORS: Record<string, string> = {
    Chrome: '#4285F4',
    Safari: '#000000',
    Firefox: '#FF7139',
    Edge: '#0078D7',
    Opera: '#FF1B2D',
    IE: '#0076D6',
    Other: '#9CA3AF'
};

const OS_COLORS: Record<string, string> = {
    Windows: '#0078D6',
    Mac: '#555555',
    Linux: '#FCC624',
    Android: '#3DDC84',
    iOS: '#000000',
    Other: '#9CA3AF'
};

const DEVICE_ICONS: Record<string, React.ElementType> = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet
};

const DATE_RANGES = [
    { value: '7d', label: '7 dagen' },
    { value: '30d', label: '30 dagen' },
    { value: '90d', label: '90 dagen' },
    { value: 'all', label: 'Alles' },
];

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

function formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
}

export default function AnalyticsDashboard({
    todayViews,
    uniqueVisitorsToday,
    dailyViews,
    topPages,
    avgDuration,
    deviceBreakdown,
    currentRange,
    rangeLabel,
    totalRangeViews,
    uniqueVisitorsInRange,
    topReferrers,
    browserBreakdown,
    osBreakdown,
    utmCampaigns,
    bounceRate,
    hourlyDistribution,
    liveVisitors,
    topEntryPages,
    topExitPages
}: AnalyticsDashboardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const totalDeviceViews = deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
    const totalBrowserViews = browserBreakdown.reduce((sum, b) => sum + b.count, 0);
    const totalOsViews = osBreakdown.reduce((sum, o) => sum + o.count, 0);

    const handleRangeChange = (range: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('range', range);
        router.push(`/admin/analytics?${params.toString()}`);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header with Live Visitors & Date Range */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-8 h-8 text-cevace-blue" />
                        <h1 style={{ fontSize: '28px' }} className="font-bold text-gray-900">Analytics Dashboard</h1>
                        {/* Live visitors indicator */}
                        <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-green-100 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-green-700">{liveVisitors} live</span>
                        </div>
                    </div>
                    <p className="text-gray-600">Bezoekersstatistieken - {rangeLabel}</p>
                </div>

                {/* Date Range Selector */}
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                    <Calendar className="w-4 h-4 ml-2 text-gray-500" />
                    {DATE_RANGES.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => handleRangeChange(range.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentRange === range.value
                                    ? 'bg-cevace-blue text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <StatCard label="Vandaag" value={todayViews} icon={BarChart3} color="orange" />
                <StatCard label="Bezoekers Vandaag" value={uniqueVisitorsToday} icon={Users} color="blue" />
                <StatCard label={`Pageviews`} value={totalRangeViews} icon={BarChart3} color="purple" />
                <StatCard label={`Bezoekers`} value={uniqueVisitorsInRange} icon={Users} color="green" />
                <StatCard label="Gem. Duur" value={formatDuration(avgDuration)} icon={Clock} color="orange" />
                <StatCard label="Bounce Rate" value={`${bounceRate}%`} icon={ArrowDownRight} color={bounceRate > 50 ? 'red' : 'green'} />
            </div>

            {/* Row 2: Line Chart + Hourly Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h2 style={{ fontSize: '18px' }} className="font-semibold text-gray-900 mb-4">Pageviews per Dag</h2>
                    <div className="h-64">
                        {dailyViews.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyViews}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6B7280" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="views" stroke="#d97706" strokeWidth={2} dot={{ fill: '#d97706', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState text="Nog geen data beschikbaar" />
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h2 style={{ fontSize: '18px' }} className="font-semibold text-gray-900 mb-4">Drukte per Uur</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="hour" tickFormatter={formatHour} tick={{ fontSize: 10 }} stroke="#6B7280" />
                                <YAxis tick={{ fontSize: 10 }} stroke="#6B7280" />
                                <Tooltip labelFormatter={formatHour} contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                                <Bar dataKey="count" fill="#22223B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 3: Device, Browser, OS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <PieCard title="Devices" data={deviceBreakdown} nameKey="device" dataKey="count" colors={DEVICE_COLORS} total={totalDeviceViews} />
                <PieCard title="Browsers" data={browserBreakdown} nameKey="browser" dataKey="count" colors={BROWSER_COLORS} total={totalBrowserViews} />
                <PieCard title="Besturingssysteem" data={osBreakdown} nameKey="os" dataKey="count" colors={OS_COLORS} total={totalOsViews} />
            </div>

            {/* Row 4: Referrers + UTM Campaigns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-gray-500" />
                        <h2 style={{ fontSize: '16px' }} className="font-semibold text-gray-900">Top Referrers</h2>
                    </div>
                    <div className="p-4">
                        {topReferrers.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">Nog geen referrer data</p>
                        ) : (
                            <div className="space-y-3">
                                {topReferrers.map((ref, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700 truncate">{ref.source}</span>
                                        <span className="text-sm font-medium text-gray-900">{ref.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-gray-500" />
                        <h2 style={{ fontSize: '16px' }} className="font-semibold text-gray-900">UTM Campagnes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        {utmCampaigns.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-6">Nog geen campagne data</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Source</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Medium</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Campaign</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Views</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {utmCampaigns.map((utm, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2 text-gray-700">{utm.source}</td>
                                            <td className="px-4 py-2 text-gray-600">{utm.medium}</td>
                                            <td className="px-4 py-2 text-gray-600">{utm.campaign}</td>
                                            <td className="px-4 py-2 text-right font-medium">{utm.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 5: Entry/Exit Pages + Top Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                        <h2 style={{ fontSize: '16px' }} className="font-semibold text-gray-900">Entry Pages</h2>
                    </div>
                    <div className="p-4">
                        {topEntryPages.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">Nog geen data</p>
                        ) : (
                            <div className="space-y-2">
                                {topEntryPages.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700 truncate">{p.page}</span>
                                        <span className="font-medium">{p.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                        <ArrowDownRight className="w-5 h-5 text-red-500" />
                        <h2 style={{ fontSize: '16px' }} className="font-semibold text-gray-900">Exit Pages</h2>
                    </div>
                    <div className="p-4">
                        {topExitPages.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">Nog geen data</p>
                        ) : (
                            <div className="space-y-2">
                                {topExitPages.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700 truncate">{p.page}</span>
                                        <span className="font-medium">{p.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Pages compact */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cevace-orange" />
                        <h2 style={{ fontSize: '16px' }} className="font-semibold text-gray-900">Top Pagina's</h2>
                    </div>
                    <div className="p-4">
                        {topPages.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">Nog geen data</p>
                        ) : (
                            <div className="space-y-2">
                                {topPages.slice(0, 5).map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700 truncate">{p.page}</span>
                                        <span className="font-medium">{p.views}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper components
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
    const colorClasses: Record<string, string> = {
        orange: 'text-orange-600',
        blue: 'text-blue-600',
        purple: 'text-purple-600',
        green: 'text-green-600',
        red: 'text-red-500'
    };

    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs font-medium truncate">{label}</span>
                <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
            </div>
            <div style={{ fontSize: '24px' }} className="font-bold text-gray-900">{value}</div>
        </div>
    );
}

function PieCard({ title, data, nameKey, dataKey, colors, total }: {
    title: string;
    data: Record<string, unknown>[];
    nameKey: string;
    dataKey: string;
    colors: Record<string, string>;
    total: number;
}) {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 style={{ fontSize: '16px' }} className="font-semibold text-gray-900 mb-4">{title}</h2>
            <div className="h-40">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[(entry as Record<string, string>)[nameKey]] || '#C9ADA7'} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyState text="Geen data" />
                )}
            </div>
            <div className="mt-3 space-y-1">
                {data.slice(0, 4).map((d, i) => {
                    const name = (d as Record<string, string>)[nameKey];
                    const count = (d as Record<string, number>)[dataKey];
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[name] || '#C9ADA7' }}></span>
                                <span className="capitalize">{name}</span>
                            </div>
                            <span className="font-medium">{pct}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            {text}
        </div>
    );
}
