#!/usr/bin/env node

/**
 * REVERSE migration: folder structure back to single .yaml files
 * Converts: post/index.yaml + post/content.md → post.yaml
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const BLOG_DIR = path.join(__dirname, '../content/blog');

function reverseMigrateBlogPosts() {
    console.log('🔄 Reversing blog post migration to single-file format...\n');

    const items = fs.readdirSync(BLOG_DIR);
    const folders = items.filter(item => {
        const fullPath = path.join(BLOG_DIR, item);
        return fs.statSync(fullPath).isDirectory();
    });

    console.log(`Found ${folders.length} folders to convert\n`);

    for (const folder of folders) {
        const folderPath = path.join(BLOG_DIR, folder);
        const yamlPath = path.join(folderPath, 'index.yaml');
        const contentPath = path.join(folderPath, 'content.md');

        if (!fs.existsSync(yamlPath) || !fs.existsSync(contentPath)) {
            console.log(`Skipping ${folder} - missing files`);
            continue;
        }

        console.log(`Converting: ${folder}`);

        try {
            // Read metadata
            const metadata = yaml.load(fs.readFileSync(yamlPath, 'utf8'));

            // Read content
            const content = fs.readFileSync(contentPath, 'utf8');

            // Combine into single file
            const combined = {
                ...metadata,
                content: {
                    discriminant: 'document',
                    value: content
                }
            };

            // Write to single .yaml file
            const singleFilePath = path.join(BLOG_DIR, `${folder}.yaml`);
            fs.writeFileSync(singleFilePath, yaml.dump(combined), 'utf8');
            console.log(`  ✅ Created ${folder}.yaml`);

            // Remove folder
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log(`  🗑️  Removed ${folder}/ folder\n`);

        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
        }
    }

    console.log('✨ Reverse migration complete!');
}

reverseMigrateBlogPosts();
