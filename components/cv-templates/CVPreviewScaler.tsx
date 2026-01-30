/**
 * CVPreviewScaler - Responsive wrapper for CV templates
 * 
 * This component wraps a CV template and applies CSS transform scaling
 * to fit it within the available viewport while maintaining the exact
 * A4 dimensions (210mm x 297mm).
 * 
 * The template inside is always rendered at full A4 size, but visually
 * scaled down to fit the container. This ensures WYSIWYG between the
 * preview and the PDF output.
 */

'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface CVPreviewScalerProps {
    children: ReactNode;
    maxHeight?: string;
    className?: string;
}

// A4 dimensions in pixels (at 96 DPI)
const A4_WIDTH_PX = 794;  // 210mm ≈ 794px
const A4_HEIGHT_PX = 1123; // 297mm ≈ 1123px

export function CVPreviewScaler({
    children,
    maxHeight = 'calc(100vh - 200px)',
    className = ''
}: CVPreviewScalerProps) {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const calculateScale = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const containerHeight = containerRef.current.offsetHeight || window.innerHeight - 200;

            // Calculate scale based on width (primary constraint)
            const padding = 32; // 16px padding on each side
            const scaleByWidth = (containerWidth - padding) / A4_WIDTH_PX;

            // Calculate scale based on height
            const scaleByHeight = (containerHeight - padding) / A4_HEIGHT_PX;

            // Use the smaller scale to ensure the document fits both dimensions
            const newScale = Math.min(scaleByWidth, scaleByHeight, 1); // Never scale up

            setScale(Math.max(newScale, 0.3)); // Minimum 30% scale
        };

        calculateScale();

        // Recalculate on window resize
        window.addEventListener('resize', calculateScale);

        // Also use ResizeObserver for container changes
        const resizeObserver = new ResizeObserver(calculateScale);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', calculateScale);
            resizeObserver.disconnect();
        };
    }, []);

    // Calculate the scaled dimensions for the container
    const scaledHeight = A4_HEIGHT_PX * scale;

    return (
        <div
            ref={containerRef}
            className={`cv-preview-scaler ${className}`}
            style={{
                width: '100%',
                maxHeight,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '16px',
            }}
        >
            {/* Scaled container */}
            <div
                style={{
                    // The content inside is full A4 size, but scaled down
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease-out',
                    // Ensure the container reflects the scaled size for layout purposes
                    width: A4_WIDTH_PX,
                    height: A4_HEIGHT_PX,
                    // Add shadow for visual separation
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                }}
            >
                {children}
            </div>
        </div>
    );
}

export default CVPreviewScaler;
