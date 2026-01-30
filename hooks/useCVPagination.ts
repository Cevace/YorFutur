'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CVData } from '@/actions/cv-builder';

// Constants for A4 page dimensions
const PAGE_HEIGHT_MM = 297;
const PAGE_WIDTH_MM = 210;
const MARGIN_TOP_MM = 20;
const MARGIN_BOTTOM_MM = 20;
const USABLE_HEIGHT_MM = PAGE_HEIGHT_MM - MARGIN_TOP_MM - MARGIN_BOTTOM_MM; // 257mm

// Convert mm to px (at 96 DPI, 1mm ≈ 3.7795px)
const MM_TO_PX = 3.7795;
const USABLE_HEIGHT_PX = USABLE_HEIGHT_MM * MM_TO_PX; // ~971px

export interface ContentBlock {
    id: string;
    type: 'profile' | 'experience' | 'education' | 'section-header';
    data: any;
    measuredHeight: number;
}

export interface PageLayout {
    pageNumber: number;
    blocks: ContentBlock[];
    totalHeight: number;
}

interface UseCVPaginationOptions {
    sidebarWidth?: string; // e.g., '33.33%'
}

/**
 * Hook that measures content block heights and distributes them across A4 pages
 * with proper 20mm top/bottom margins.
 */
export function useCVPagination(
    data: CVData,
    measurementContainerRef: React.RefObject<HTMLDivElement>,
    options: UseCVPaginationOptions = {}
): {
    pages: PageLayout[];
    totalPages: number;
    isReady: boolean;
} {
    const [pages, setPages] = useState<PageLayout[]>([]);
    const [isReady, setIsReady] = useState(false);

    // Create content blocks from CV data
    const createBlocks = useCallback((): Omit<ContentBlock, 'measuredHeight'>[] => {
        const blocks: Omit<ContentBlock, 'measuredHeight'>[] = [];

        // Profile section (always first on page 1)
        if (data.personal.summary) {
            blocks.push({
                id: 'profile',
                type: 'profile',
                data: { summary: data.personal.summary }
            });
        }

        // Experience section header
        if (data.experience && data.experience.length > 0) {
            blocks.push({
                id: 'experience-header',
                type: 'section-header',
                data: { title: 'Werkervaring' }
            });

            // Each experience as a separate block
            data.experience.forEach((exp, index) => {
                blocks.push({
                    id: `experience-${exp.id || index}`,
                    type: 'experience',
                    data: exp
                });
            });
        }

        // Education section header
        if (data.education && data.education.length > 0) {
            blocks.push({
                id: 'education-header',
                type: 'section-header',
                data: { title: 'Opleidingen' }
            });

            // Each education as a separate block
            data.education.forEach((edu, index) => {
                blocks.push({
                    id: `education-${edu.id || index}`,
                    type: 'education',
                    data: edu
                });
            });
        }

        return blocks;
    }, [data]);

    // Measure all blocks and paginate
    useEffect(() => {
        const measureAndPaginate = () => {
            const container = measurementContainerRef.current;
            if (!container) return;

            const blocks = createBlocks();
            const measuredBlocks: ContentBlock[] = [];

            // Measure each block
            blocks.forEach(block => {
                const element = container.querySelector(`[data-block-id="${block.id}"]`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    measuredBlocks.push({
                        ...block,
                        measuredHeight: rect.height
                    });
                } else {
                    // Fallback height if element not found
                    measuredBlocks.push({
                        ...block,
                        measuredHeight: block.type === 'section-header' ? 50 : 150
                    });
                }
            });

            // Paginate blocks
            const paginatedPages: PageLayout[] = [];
            let currentPage: PageLayout = { pageNumber: 1, blocks: [], totalHeight: 0 };

            measuredBlocks.forEach(block => {
                // Check if block fits on current page
                if (currentPage.totalHeight + block.measuredHeight <= USABLE_HEIGHT_PX) {
                    currentPage.blocks.push(block);
                    currentPage.totalHeight += block.measuredHeight;
                } else {
                    // Start a new page
                    if (currentPage.blocks.length > 0) {
                        paginatedPages.push(currentPage);
                    }
                    currentPage = {
                        pageNumber: paginatedPages.length + 1,
                        blocks: [block],
                        totalHeight: block.measuredHeight
                    };
                }
            });

            // Don't forget the last page
            if (currentPage.blocks.length > 0) {
                paginatedPages.push(currentPage);
            }

            // Ensure at least one page
            if (paginatedPages.length === 0) {
                paginatedPages.push({ pageNumber: 1, blocks: [], totalHeight: 0 });
            }

            setPages(paginatedPages);
            setIsReady(true);
        };

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(measureAndPaginate, 100);
        return () => clearTimeout(timeoutId);
    }, [data, createBlocks, measurementContainerRef]);

    return {
        pages,
        totalPages: pages.length,
        isReady
    };
}

export { MARGIN_TOP_MM, MARGIN_BOTTOM_MM, USABLE_HEIGHT_MM, PAGE_HEIGHT_MM, PAGE_WIDTH_MM };
