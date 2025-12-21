'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PriorityAction } from './types';
import {
    AlertCircle,
    Sparkles,
    X,
    ChevronRight,
    Calendar,
    Send,
    Briefcase
} from 'lucide-react';

interface ActionCenterProps {
    actions: PriorityAction[];
}

/**
 * ActionCenter - Block B (The Brain)
 * Displays prioritized action cards derived from getPriorityActions()
 * Simplified design: no borders on cards, pill buttons, orange default color
 */
export default function ActionCenter({ actions }: ActionCenterProps) {
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    const visibleActions = actions.filter(action => !dismissedIds.includes(action.id));

    const handleDismiss = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDismissedIds(prev => [...prev, id]);
    };

    // Simplified style configurations - only critical gets red
    const getActionStyle = (type: PriorityAction['type']) => {
        const baseStyle = {
            bg: 'bg-slate-50',
            iconBg: 'bg-slate-100',
            iconColor: 'text-slate-600',
            titleColor: 'text-slate-900',
            descColor: 'text-slate-600',
            btnBg: 'bg-cevace-orange hover:bg-orange-600', // Standard orange
            Icon: Briefcase
        };

        switch (type) {
            case 'critical':
                return {
                    ...baseStyle,
                    bg: 'bg-red-50',
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    titleColor: 'text-red-900',
                    descColor: 'text-red-700',
                    btnBg: 'bg-red-600 hover:bg-red-700', // Only critical is red
                    Icon: Calendar
                };
            case 'warning':
                return {
                    ...baseStyle,
                    Icon: Send
                };
            case 'opportunity':
                return {
                    ...baseStyle,
                    Icon: Sparkles
                };
            default:
                return baseStyle;
        }
    };

    const getPriorityLabel = (type: PriorityAction['type']) => {
        switch (type) {
            case 'critical': return 'Urgent';
            case 'warning': return 'Actie nodig';
            case 'opportunity': return 'Kans';
            default: return 'Info';
        }
    };

    if (visibleActions.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-slate-400" />
                    Actiecentrum
                </h2>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Sparkles size={28} className="text-green-600" />
                    </div>
                    <p className="text-slate-600 font-medium">Alles is bijgewerkt!</p>
                    <p className="text-slate-400 text-sm mt-1">
                        Geen openstaande acties op dit moment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <AlertCircle size={20} className="text-slate-400" />
                    Actiecentrum
                </h2>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {visibleActions.length} actie{visibleActions.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="space-y-3">
                {visibleActions.map(action => {
                    const style = getActionStyle(action.type);
                    const { Icon } = style;

                    return (
                        <Link
                            key={action.id}
                            href={action.actionHref}
                            className={`block ${style.bg} rounded-xl p-4 transition-all duration-200 hover:shadow-sm group relative`}
                        >
                            {/* Dismiss button */}
                            {action.dismissible && (
                                <button
                                    onClick={(e) => handleDismiss(action.id, e)}
                                    className="absolute top-3 right-3 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/50 transition-opacity"
                                    aria-label="Dismiss"
                                >
                                    <X size={16} className="text-slate-400" />
                                </button>
                            )}

                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={`${style.iconBg} p-2 rounded-full flex-shrink-0`}>
                                    <Icon size={20} className={style.iconColor} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-semibold uppercase tracking-wide ${style.iconColor}`}>
                                            {getPriorityLabel(action.type)}
                                        </span>
                                    </div>
                                    <div
                                        className={`font-semibold ${style.titleColor} mb-1 pr-6`}
                                        style={{ fontSize: '20px', lineHeight: '1.3' }}
                                    >
                                        {action.title}
                                    </div>
                                    <p className={`text-xs ${style.descColor} line-clamp-2`}>
                                        {action.description}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <ChevronRight
                                    size={20}
                                    className={`${style.iconColor} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center`}
                                />
                            </div>

                            {/* Action button - pill shaped */}
                            <div className="mt-3 ml-11">
                                <span className={`inline-flex items-center gap-1 text-xs font-medium text-white ${style.btnBg} px-4 py-1.5 rounded-full transition-colors`}>
                                    {action.actionLabel}
                                    <ChevronRight size={14} />
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
