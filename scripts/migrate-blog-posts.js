#!/usr/bin/env node

/**
 * Migrate blog posts from single .mdoc files to Keystatic folder structure
 * Converts: post.mdoc → post/index.yaml + post/content.mdoc
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const BLOG_DIR = path.join(__dirname, '../content/blog');

// Parse frontmatter from .mdoc file
function parseMdocFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Split on frontmatter delimiters
    const parts = content.split(/^---\s*$/m);

    if (parts.length < 3) {
        throw new Error(`Invalid frontmatter in ${filePath}`);
    }

    // Parts: ['', 'yaml content', 'markdown content', ...]
    const frontmatterYaml = parts[1].trim();
    const markdownContent = parts.slice(2).join('---').trim();

    const frontmatter = yaml.load(frontmatterYaml);

    return { frontmatter, markdownContent };
}

// Main migration
function migrateBlogPosts() {
    console.log('🔄 Starting blog post migration...\n');

    const files = fs.readdirSync(BLOG_DIR);
    const mdocFiles = files.filter(f => f.endsWith('.mdoc'));

    console.log(`Found ${mdocFiles.length} .mdoc files to migrate\n`);

    let migratedCount = 0;

    for (const file of mdocFiles) {
        const filePath = path.join(BLOG_DIR, file);
        const slug = file.replace('.mdoc', '');

        console.log(`Migrating: ${file}`);

        try {
            // Parse the file
            const { frontmatter, markdownContent } = parseMdocFile(filePath);

            // Create folder
            const folderPath = path.join(BLOG_DIR, slug);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            // Write index.yaml (metadata)
            const yamlPath = path.join(folderPath, 'index.yaml');
            const yamlContent = yaml.dump(frontmatter);
            fs.writeFileSync(yamlPath, yamlContent, 'utf8');
            console.log(`  ✅ Created ${slug}/index.yaml`);

            // Write content.mdoc (markdown)
            const contentPath = path.join(folderPath, 'content.mdoc');
            fs.writeFileSync(contentPath, markdownContent, 'utf8');
            console.log(`  ✅ Created ${slug}/content.mdoc`);

            // Rename original file to .bak (backup)
            const backupPath = filePath + '.bak';
            fs.renameSync(filePath, backupPath);
            console.log(`  📦 Backed up to ${file}.bak\n`);

            migratedCount++;

        } catch (error) {
            console.error(`  ❌ Error migrating ${file}:`, error.message);
        }
    }

    console.log(`\n✨ Migration complete! Migrated ${migratedCount}/${mdocFiles.length} posts`);
    console.log('\n📝 Next steps:');
    console.log('1. Check the migrated files in content/blog/');
    console.log('2. If everything looks good, delete the .bak files');
    console.log('3. Refresh Keystatic admin to see the posts');
}

// Run migration
try {
    migrateBlogPosts();
} catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
}
