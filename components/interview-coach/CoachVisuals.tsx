'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface CoachVisualsProps {
    isSpeaking: boolean;
}

/**
 * Static Coach Visual Component
 * Shows single professional image without animations
 */
export function CoachVisuals({ isSpeaking }: CoachVisualsProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl" />;
    }

    return (
        <div className="relative w-full">
            {/* Single Static Image - No Animation */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <Image
                    src="/coach/coach-neutral.jpg"
                    alt="Professional recruiter"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Optional: Speaking indicator */}
            {isSpeaking && (
                <div className="absolute bottom-4 right-4 bg-cevace-orange text-white px-4 py-2 rounded-full shadow-lg">
                    <span className="text-sm font-medium">🔊 Aan het spreken...</span>
                </div>
            )}
        </div>
    );
}
