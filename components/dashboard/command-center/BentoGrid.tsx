'use client';

import React from 'react';

interface BentoGridProps {
    children: React.ReactNode;
}

/**
 * BentoGrid - Responsive CSS Grid wrapper with Bento-style layout
 * 
 * Grid Structure:
 * - Mobile (< 768px): Single column stack
 * - Tablet (768px+): 2 columns
 * - Desktop (1024px+): 12-column grid with varied spans
 * 
 * Layout:
 * - Block A (Morning Briefing): Full width
 * - Block B (Action Center): 7 columns / Block C (Funnel): 5 columns
 * - Block D (Job Radar): 6 columns / Block E (Knowledge): 6 columns
 */
export default function BentoGrid({ children }: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
            {children}
        </div>
    );
}

// Grid cell wrapper components for consistent sizing
interface GridCellProps {
    children: React.ReactNode;
    className?: string;
}

export function GridCellFullWidth({ children, className = '' }: GridCellProps) {
    return (
        <div className={`col-span-1 md:col-span-2 lg:col-span-12 ${className}`}>
            {children}
        </div>
    );
}

export function GridCellLarge({ children, className = '' }: GridCellProps) {
    return (
        <div className={`col-span-1 md:col-span-1 lg:col-span-7 ${className}`}>
            {children}
        </div>
    );
}

export function GridCellMedium({ children, className = '' }: GridCellProps) {
    return (
        <div className={`col-span-1 md:col-span-1 lg:col-span-5 ${className}`}>
            {children}
        </div>
    );
}

export function GridCellHalf({ children, className = '' }: GridCellProps) {
    return (
        <div className={`col-span-1 md:col-span-1 lg:col-span-6 ${className}`}>
            {children}
        </div>
    );
}
