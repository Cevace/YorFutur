import { createClient } from '@/utils/supabase/server';
import ExperienceForm from '@/components/dashboard/ExperienceForm';
import { Briefcase, Calendar } from 'lucide-react';

export default async function ExperiencePage() {
    const supabase = createClient();

    // Fetch experience data
    const { data: experiences, error } = await supabase
        .from('work_experience')
        .select('*')
        .order('start_date', { ascending: false });

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="font-bold text-cevace-blue mb-4" style={{ fontSize: '45px', letterSpacing: '-0.02em' }}>Werkervaring</h1>
                <ExperienceForm />
            </div>

            <div className="space-y-4">
                {experiences && experiences.length > 0 ? (
                    experiences.map((exp: any) => (
                        <div key={exp.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-cevace-orange/30 transition-colors group relative">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 pr-8">
                                    <h3 className="text-xl font-bold text-gray-900">{exp.job_title}</h3>
                                    <div className="flex items-center gap-2 text-cevace-orange font-medium mt-1">
                                        <Briefcase size={16} />
                                        <span>{exp.company}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                        <Calendar size={14} />
                                        <span>
                                            {new Date(exp.start_date).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}
                                            {' - '}
                                            {exp.end_date
                                                ? new Date(exp.end_date).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })
                                                : 'Heden'}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6">
                                    <ExperienceForm initialData={exp} />
                                </div>
                            </div>
                            {exp.description && (
                                <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {exp.description}
                                </p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Briefcase size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Nog geen werkervaring</h3>
                        <p className="text-gray-500">Voeg je eerste werkervaring toe om te beginnen.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
