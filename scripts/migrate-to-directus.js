#!/usr/bin/env node

/**
 * Directus Migration Script
 * Migrates content from Keystatic YAML/MDX files to Directus CMS
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DIRECTUS_URL = 'https://cevace.com/cms';
const CONTENT_DIR = path.join(__dirname, '../content');

// Get access token
async function getAccessToken() {
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@cevace.com',
            password: 'CevaceCMS2024!'
        })
    });
    const data = await res.json();
    return data.data.access_token;
}

// Create a collection
async function createCollection(token, collection, schema, fields) {
    console.log(`Creating collection: ${collection}...`);

    const res = await fetch(`${DIRECTUS_URL}/collections`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            collection,
            schema,
            fields
        })
    });

    if (!res.ok) {
        const error = await res.text();
        console.log(`  Warning: ${error}`);
        return false;
    }
    console.log(`  ✓ Created ${collection}`);
    return true;
}

// Add fields to existing collection
async function addFields(token, collection, fields) {
    for (const field of fields) {
        const res = await fetch(`${DIRECTUS_URL}/fields/${collection}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(field)
        });

        if (!res.ok) {
            const error = await res.text();
            console.log(`  Warning adding field ${field.field}: ${error.substring(0, 100)}`);
        }
    }
}

// Insert item into collection
async function insertItem(token, collection, item) {
    const res = await fetch(`${DIRECTUS_URL}/items/${collection}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
    });

    if (!res.ok) {
        const error = await res.text();
        console.log(`  Error inserting into ${collection}: ${error.substring(0, 100)}`);
        return null;
    }
    return await res.json();
}

// Read YAML file
function readYaml(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return yaml.load(content);
    } catch (e) {
        console.log(`Error reading ${filePath}: ${e.message}`);
        return null;
    }
}

// Read MDX/MDOC file (frontmatter + content)
function readMdoc(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (match) {
            const frontmatter = yaml.load(match[1]);
            return { ...frontmatter, content: match[2] };
        }
        return { content };
    } catch (e) {
        console.log(`Error reading ${filePath}: ${e.message}`);
        return null;
    }
}

async function main() {
    console.log('🚀 Starting Directus migration...\n');

    const token = await getAccessToken();
    console.log('✓ Got access token\n');

    // ===== CREATE COLLECTIONS =====

    // Homepage Hero (singleton-like)
    await createCollection(token, 'homepage_hero', { singleton: true }, [
        { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } }
    ]);
    await addFields(token, 'homepage_hero', [
        { field: 'badge_text', type: 'string', meta: { interface: 'input' } },
        { field: 'headline_part1', type: 'string', meta: { interface: 'input' } },
        { field: 'headline_highlight', type: 'string', meta: { interface: 'input' } },
        { field: 'headline_part2', type: 'string', meta: { interface: 'input' } },
        { field: 'description', type: 'text', meta: { interface: 'input-multiline' } },
        { field: 'cta_primary_text', type: 'string', meta: { interface: 'input' } },
        { field: 'cta_primary_link', type: 'string', meta: { interface: 'input' } },
        { field: 'cta_secondary_text', type: 'string', meta: { interface: 'input' } },
        { field: 'hero_image', type: 'string', meta: { interface: 'input' } },
        { field: 'social_proof_text', type: 'string', meta: { interface: 'input' } }
    ]);

    // Blog Posts
    await createCollection(token, 'blog_posts', {}, [
        { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } }
    ]);
    await addFields(token, 'blog_posts', [
        { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
        { field: 'slug', type: 'string', meta: { interface: 'input', required: true } },
        {
            field: 'category', type: 'string', meta: {
                interface: 'select-dropdown', options: {
                    choices: [
                        { text: 'Sollicitatie Tips', value: 'Sollicitatie Tips' },
                        { text: 'CV Schrijven', value: 'CV Schrijven' },
                        { text: 'Motivatiebrief', value: 'Motivatiebrief' },
                        { text: 'LinkedIn', value: 'LinkedIn' },
                        { text: 'Carrière', value: 'Carrière' },
                        { text: 'Interview Tips', value: 'Interview Tips' }
                    ]
                }
            }
        },
        { field: 'excerpt', type: 'text', meta: { interface: 'input-multiline' } },
        { field: 'cover_image', type: 'string', meta: { interface: 'input' } },
        { field: 'author', type: 'string', meta: { interface: 'input' } },
        { field: 'published_date', type: 'date', meta: { interface: 'datetime' } },
        { field: 'published', type: 'boolean', meta: { interface: 'boolean' } },
        { field: 'content', type: 'text', meta: { interface: 'input-rich-text-html' } }
    ]);

    // Testimonials
    await createCollection(token, 'testimonials', {}, [
        { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } }
    ]);
    await addFields(token, 'testimonials', [
        { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
        { field: 'role', type: 'string', meta: { interface: 'input' } },
        { field: 'company', type: 'string', meta: { interface: 'input' } },
        { field: 'quote', type: 'text', meta: { interface: 'input-multiline' } },
        { field: 'photo', type: 'string', meta: { interface: 'input' } },
        { field: 'rating', type: 'integer', meta: { interface: 'input' } },
        { field: 'sort', type: 'integer', meta: { interface: 'input' } }
    ]);

    // Features
    await createCollection(token, 'features', {}, [
        { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } }
    ]);
    await addFields(token, 'features', [
        { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
        { field: 'description', type: 'text', meta: { interface: 'input-multiline' } },
        {
            field: 'icon', type: 'string', meta: {
                interface: 'select-dropdown', options: {
                    choices: [
                        { text: 'Brain', value: 'brain' },
                        { text: 'LinkedIn', value: 'linkedin' },
                        { text: 'Users', value: 'users' },
                        { text: 'Target', value: 'target' },
                        { text: 'Sparkles', value: 'sparkles' }
                    ]
                }
            }
        },
        { field: 'sort', type: 'integer', meta: { interface: 'input' } }
    ]);

    // FAQ Categories
    await createCollection(token, 'faq_categories', {}, [
        { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } }
    ]);
    await addFields(token, 'faq_categories', [
        { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
        { field: 'slug', type: 'string', meta: { interface: 'input', required: true } },
        { field: 'sort', type: 'integer', meta: { interface: 'input' } }
    ]);

    // FAQ Items
    await createCollection(token, 'faq_items', {}, [
        { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } }
    ]);
    await addFields(token, 'faq_items', [
        { field: 'question', type: 'string', meta: { interface: 'input', required: true } },
        { field: 'answer', type: 'text', meta: { interface: 'input-multiline' } },
        { field: 'category', type: 'string', meta: { interface: 'input' } },
        { field: 'sort', type: 'integer', meta: { interface: 'input' } }
    ]);

    // Homepage Layout
    await createCollection(token, 'homepage_layout', { singleton: true }, [
        { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } }
    ]);
    await addFields(token, 'homepage_layout', [
        { field: 'sections', type: 'json', meta: { interface: 'input-code', options: { language: 'json' } } }
    ]);

    // Section Settings
    await createCollection(token, 'section_settings', { singleton: true }, [
        { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } }
    ]);
    await addFields(token, 'section_settings', [
        { field: 'features_subtitle', type: 'string', meta: { interface: 'input' } },
        { field: 'testimonials_subtitle', type: 'string', meta: { interface: 'input' } },
        { field: 'blog_subtitle', type: 'string', meta: { interface: 'input' } },
        { field: 'faq_subtitle', type: 'string', meta: { interface: 'input' } },
        { field: 'quote_text', type: 'text', meta: { interface: 'input-multiline' } },
        { field: 'quote_author', type: 'string', meta: { interface: 'input' } },
        { field: 'quote_role', type: 'string', meta: { interface: 'input' } }
    ]);

    console.log('\n✓ Collections created\n');

    // ===== MIGRATE CONTENT =====
    console.log('📦 Migrating content...\n');

    // Migrate Homepage Hero
    const heroData = readYaml(path.join(CONTENT_DIR, 'homepage-hero.yaml'));
    if (heroData) {
        await insertItem(token, 'homepage_hero', {
            badge_text: heroData.badgeText,
            headline_part1: heroData.headlinePart1,
            headline_highlight: heroData.headlineHighlight,
            headline_part2: heroData.headlinePart2,
            description: heroData.description,
            cta_primary_text: heroData.ctaPrimaryText,
            cta_primary_link: heroData.ctaPrimaryLink,
            cta_secondary_text: heroData.ctaSecondaryText,
            hero_image: heroData.heroImage,
            social_proof_text: heroData.socialProofText
        });
        console.log('  ✓ Migrated homepage hero');
    }

    // Migrate Homepage Layout
    const layoutData = readYaml(path.join(CONTENT_DIR, 'homepage-layout.yaml'));
    if (layoutData) {
        await insertItem(token, 'homepage_layout', {
            sections: JSON.stringify(layoutData.sections || [])
        });
        console.log('  ✓ Migrated homepage layout');
    }

    // Migrate Section Settings
    const settingsData = readYaml(path.join(CONTENT_DIR, 'section-settings.yaml'));
    if (settingsData) {
        await insertItem(token, 'section_settings', {
            features_subtitle: settingsData.featuresSubtitle,
            testimonials_subtitle: settingsData.testimonialsSubtitle,
            blog_subtitle: settingsData.blogSubtitle,
            faq_subtitle: settingsData.faqSubtitle,
            quote_text: settingsData.quoteText,
            quote_author: settingsData.quoteAuthor,
            quote_role: settingsData.quoteRole
        });
        console.log('  ✓ Migrated section settings');
    }

    // Migrate Testimonials
    const testimonialsDir = path.join(CONTENT_DIR, 'testimonials');
    if (fs.existsSync(testimonialsDir)) {
        const files = fs.readdirSync(testimonialsDir).filter(f => f.endsWith('.yaml'));
        for (const file of files) {
            const data = readYaml(path.join(testimonialsDir, file));
            if (data) {
                await insertItem(token, 'testimonials', {
                    name: data.name?.value || file.replace('.yaml', ''),
                    role: data.role,
                    company: data.company,
                    quote: data.quote,
                    photo: data.photo,
                    rating: data.rating || 5,
                    sort: data.order || 0
                });
            }
        }
        console.log(`  ✓ Migrated ${files.length} testimonials`);
    }

    // Migrate Features
    const featuresDir = path.join(CONTENT_DIR, 'features');
    if (fs.existsSync(featuresDir)) {
        const files = fs.readdirSync(featuresDir).filter(f => f.endsWith('.yaml'));
        for (const file of files) {
            const data = readYaml(path.join(featuresDir, file));
            if (data) {
                await insertItem(token, 'features', {
                    title: data.title?.value || file.replace('.yaml', ''),
                    description: data.description,
                    icon: data.icon || 'brain',
                    sort: data.order || 0
                });
            }
        }
        console.log(`  ✓ Migrated ${files.length} features`);
    }

    // Migrate FAQ Categories
    const faqCategoriesDir = path.join(CONTENT_DIR, 'faq-categories');
    if (fs.existsSync(faqCategoriesDir)) {
        const files = fs.readdirSync(faqCategoriesDir).filter(f => f.endsWith('.yaml'));
        for (const file of files) {
            const data = readYaml(path.join(faqCategoriesDir, file));
            if (data) {
                await insertItem(token, 'faq_categories', {
                    name: data.name?.value || file.replace('.yaml', ''),
                    slug: file.replace('.yaml', ''),
                    sort: data.order || 0
                });
            }
        }
        console.log(`  ✓ Migrated ${files.length} FAQ categories`);
    }

    // Migrate FAQ Items
    const faqItemsDir = path.join(CONTENT_DIR, 'faq-items');
    if (fs.existsSync(faqItemsDir)) {
        const files = fs.readdirSync(faqItemsDir).filter(f => f.endsWith('.yaml'));
        for (const file of files) {
            const data = readYaml(path.join(faqItemsDir, file));
            if (data) {
                await insertItem(token, 'faq_items', {
                    question: data.question?.value || file.replace('.yaml', ''),
                    answer: data.answer,
                    category: data.category,
                    sort: data.order || 0
                });
            }
        }
        console.log(`  ✓ Migrated ${files.length} FAQ items`);
    }

    // Migrate Blog Posts
    const blogDir = path.join(CONTENT_DIR, 'blog');
    if (fs.existsSync(blogDir)) {
        const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdoc'));
        for (const file of files) {
            const data = readMdoc(path.join(blogDir, file));
            if (data) {
                await insertItem(token, 'blog_posts', {
                    title: data.title?.value || file.replace('.mdoc', '').replace(/-/g, ' '),
                    slug: file.replace('.mdoc', ''),
                    category: data.category,
                    excerpt: data.excerpt,
                    cover_image: data.coverImage,
                    author: data.author || 'Cevace',
                    published_date: data.publishedDate,
                    published: data.published || false,
                    content: data.content || ''
                });
            }
        }
        console.log(`  ✓ Migrated ${files.length} blog posts`);
    }

    console.log('\n🎉 Migration complete!');
}

main().catch(console.error);
