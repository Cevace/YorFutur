'use client';

import { Info, ChevronDown, ChevronUp, Bell, MousePointer2, BarChart3, Lightbulb } from 'lucide-react';
import { useState } from 'react';

export default function TrackerInfoPanel() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mb-6 rounded-xl overflow-hidden max-w-4xl" style={{ backgroundColor: '#F5F5F7' }}>
            {/* Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 flex items-center justify-between hover:bg-gray-200/50 transition-colors h-[60px]"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Info className="text-white" size={16} />
                    </div>
                    <div className="text-left">
                        <h3
                            className="font-bold"
                            style={{
                                fontSize: '18px',
                                color: isExpanded ? '#111827' : '#86868B'
                            }}
                        >
                            Hoe werkt de Sollicitatie Tracker?
                        </h3>
                        <p className="text-xs text-gray-600">Klik voor uitleg</p>
                    </div>
                </div>
                <div className="text-gray-400 flex-shrink-0">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>

            {/* Expandable content */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Intro */}
                    <p className="text-gray-700 leading-relaxed text-sm">
                        De Sollicitatie Tracker helpt je overzicht te houden tijdens je sollicitatieproces.
                        Sleep je sollicitaties door het proces van <strong>Gesolliciteerd</strong> tot <strong>Aanbod</strong> of <strong>Afgewezen</strong>.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Feature 1 - Overzicht */}
                        <div style={{ backgroundColor: '#FFFFFF' }} className="p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 size={14} className="text-gray-700" />
                                </div>
                                <h4 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>Overzicht</h4>
                            </div>
                            <p className="text-xs text-gray-600">
                                Zie in één oogopslag waar je sollicitaties staan en welke actie je moet ondernemen.
                            </p>
                        </div>

                        {/* Feature 2 - Drag & Drop */}
                        <div style={{ backgroundColor: '#FFFFFF' }} className="p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <MousePointer2 size={14} className="text-gray-700" />
                                </div>
                                <h4 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>Drag & Drop</h4>
                            </div>
                            <p className="text-xs text-gray-600">
                                Sleep sollicitaties tussen kolommen om de status bij te werken. Automatisch opgeslagen!
                            </p>
                        </div>

                        {/* Feature 3 - Auto Reminders */}
                        <div style={{ backgroundColor: '#FFFFFF' }} className="p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Bell size={14} className="text-gray-700" />
                                </div>
                                <h4 className="font-bold text-gray-900" style={{ fontSize: '18px' }}>Auto Reminders</h4>
                            </div>
                            <p className="text-xs text-gray-600">
                                Na 7 dagen zonder reactie krijg je een <span className="text-red-600 font-medium">"Follow-up nodig!"</span> badge.
                            </p>
                        </div>
                    </div>

                    {/* Quick tips */}
                    <div style={{ backgroundColor: '#FFFFFF' }} className="p-3 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2" style={{ fontSize: '18px' }}>
                            <Lightbulb size={16} className="text-gray-700" />
                            Tips voor gebruik
                        </h4>
                        <ul className="space-y-1.5 text-xs text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-gray-900 font-bold mt-0.5">•</span>
                                <span>Klik op <strong>"Bewerk"</strong> in een kaart om notities of recruiter details toe te voegen</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gray-900 font-bold mt-0.5">•</span>
                                <span>Bewaar vacature URL's zodat je ze later makkelijk terug kunt vinden</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gray-900 font-bold mt-0.5">•</span>
                                <span><strong>Follow-up badges verschijnen automatisch - vergeet geen sollicitatie meer!</strong></span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
