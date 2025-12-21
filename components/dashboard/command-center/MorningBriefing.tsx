'use client';

import React from 'react';

interface MorningBriefingProps {
    firstName: string;
    priorityCount: number;
    criticalCount: number;
}

/**
 * MorningBriefing - Block A
 * Full-width welcome header with time-aware greeting and dynamic sub-header
 * Clean design - no shadows or decorative elements
 */
export default function MorningBriefing({
    firstName,
    priorityCount,
    criticalCount
}: MorningBriefingProps) {
    // Get time-aware greeting - first letter uppercase, rest lowercase
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return 'Goedemorgen';
        } else if (hour >= 12 && hour < 18) {
            return 'Goedemiddag';
        } else {
            return 'Goedenavond';
        }
    };

    const greeting = getGreeting();

    // Capitalize the first name properly
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    // Dynamic sub-header based on priority actions
    const getSubheader = () => {
        if (criticalCount > 0) {
            return {
                text: `Je hebt ${criticalCount} belangrijke actie${criticalCount > 1 ? 's' : ''} die aandacht nodig ${criticalCount > 1 ? 'hebben' : 'heeft'}.`,
                urgent: true
            };
        } else if (priorityCount > 0) {
            return {
                text: `Je hebt ${priorityCount} update${priorityCount > 1 ? 's' : ''} die je aandacht nodig ${priorityCount > 1 ? 'hebben' : 'heeft'}.`,
                urgent: false
            };
        } else {
            return {
                text: 'Je bent helemaal bij! Tijd om nieuwe kansen te ontdekken.',
                urgent: false
            };
        }
    };

    const subheader = getSubheader();

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-3 md:p-4 text-white">
            {/* Content - no decorative elements */}
            <h1
                className="font-bold text-white mb-1"
                style={{ fontSize: '28px', letterSpacing: '-0.02em' }}
            >
                {greeting}, {formattedName}
            </h1>

            <p className={`text-base md:text-lg ${subheader.urgent ? 'text-orange-300' : 'text-slate-300'}`}>
                {subheader.text}
            </p>
        </div>
    );
}
