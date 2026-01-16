/**
 * CV Template System Types
 * Defines TypeScript interfaces for the CV template selection system
 */

export type TemplateId = 'modern' | 'classic-sidebar' | 'modern-header' | 'photo-focus';

export interface CVTemplate {
    id: TemplateId;
    name: string;
    description: string;
    previewImage: string;
    supportsPhoto: boolean;
    accentColor: string; // Default accent color for this template
}

export interface CVSettings {
    templateId: TemplateId;
    accentColor: string;
}

/**
 * Registry of all available CV templates
 */
export const CV_TEMPLATES: Record<TemplateId, CVTemplate> = {
    'modern': {
        id: 'modern',
        name: 'Modern',
        description: 'Strak en professioneel met blauwe accenten',
        previewImage: '/cv-templates/cv-images/modern.jpg',
        supportsPhoto: true,
        accentColor: '#2563eb'
    },
    'classic-sidebar': {
        id: 'classic-sidebar',
        name: 'Classic Sidebar',
        description: 'Klassieke layout met paarse sidebar',
        previewImage: '/cv-templates/cv-images/classic-sidebar.jpg',
        supportsPhoto: true,
        accentColor: '#8B2677'
    },
    'modern-header': {
        id: 'modern-header',
        name: 'Modern Header',
        description: 'Opvallende header met blauwe accenten',
        previewImage: '/cv-templates/cv-images/modern-header.jpg',
        supportsPhoto: true,
        accentColor: '#3E5A7C'
    },
    'photo-focus': {
        id: 'photo-focus',
        name: 'Photo Focus',
        description: 'Creatieve layout met grote foto en groene accenten',
        previewImage: '/cv-templates/cv-images/photo-focus.jpg',
        supportsPhoto: true,
        accentColor: '#2D7D4E'
    }
};

/**
 * Get template by ID with fallback to 'modern'
 */
export function getTemplate(id: string): CVTemplate {
    return CV_TEMPLATES[id as TemplateId] || CV_TEMPLATES.modern;
}

/**
 * Get all templates as an array
 */
export function getAllTemplates(): CVTemplate[] {
    return Object.values(CV_TEMPLATES);
}
