const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DIRECTUS_URL = 'https://cevace.com/cms';
const CONTENT_DIR = path.join(__dirname, '../content');

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

async function createCollection(token, collection, schema, fields) {
    console.log(`Creating collection: ${collection}...`);
    const res = await fetch(`${DIRECTUS_URL}/collections`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ collection, schema, fields })
    });
    return res.ok;
}

async function addFields(token, collection, fields) {
    for (const field of fields) {
        await fetch(`${DIRECTUS_URL}/fields/${collection}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(field)
        });
    }
}

async function setPermissions(token, collection) {
    // Public policy ID
    const POLICY_ID = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
    await fetch(`${DIRECTUS_URL}/permissions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            collection,
            action: 'read',
            fields: ['*'],
            policy: POLICY_ID
        })
    });
}

async function insertItem(token, collection, item) {
    await fetch(`${DIRECTUS_URL}/items/${collection}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
    });
}

function readMdoc(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (match) {
            const frontmatter = yaml.load(match[1]);
            return { ...frontmatter, content: match[2] };
        }
        return { title: path.basename(filePath, '.mdoc'), content };
    } catch (e) {
        return null;
    }
}

function readYaml(filePath) {
    try {
        return yaml.load(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        return null;
    }
}

async function main() {
    const token = await getAccessToken();
    console.log('Got token');

    // Create 'pages' collection
    await createCollection(token, 'pages', {}, [
        { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } }
    ]);

    await addFields(token, 'pages', [
        { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
        { field: 'slug', type: 'string', meta: { interface: 'input', required: true, unique: true } },
        { field: 'content', type: 'text', meta: { interface: 'input-rich-text-html' } }
    ]);

    await setPermissions(token, 'pages');
    console.log('Created pages collection');

    // Migrate content
    const pagesDir = path.join(CONTENT_DIR, 'pages');
    if (fs.existsSync(pagesDir)) {
        const files = fs.readdirSync(pagesDir);
        for (const file of files) {
            if (file.endsWith('.mdoc') || file.endsWith('.md')) { // Check for MD content
                const data = readMdoc(path.join(pagesDir, file));
                if (data) {
                    await insertItem(token, 'pages', {
                        title: data.title,
                        slug: file.replace(/\.md(oc)?$/, ''),
                        content: data.content
                    });
                    console.log(`Migrated ${file}`);
                }
            } else if (file.endsWith('.yaml')) { // YAML content
                const data = readYaml(path.join(pagesDir, file));
                // Handle YAML pages structure if any (usually just title/content fields)
                if (data) {
                    // Need to convert BlockRenderer blocks to HTML or just store as JSON?
                    // For now, let's skip complex blocks migration and handle simple pages
                    // Most existing pages seem to rely on BlockRenderer which takes specific JSON structure.
                    // Directus rich text is HTML. This is a conversion challenge.

                    // For critical pages like Privacy Policy, simple text is enough.
                }
            }
        }
    }
}

main().catch(console.error);
