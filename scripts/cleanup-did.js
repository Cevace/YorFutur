#!/usr/bin/env node

/**
 * D-ID Stream Cleanup
 * Deletes all active streams
 */

const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
let DID_API_KEY = null;

for (const line of envLines) {
    if (line.startsWith('DID_API_KEY=')) {
        DID_API_KEY = line.split('=')[1].trim();
        break;
    }
}

if (!DID_API_KEY) {
    console.error('❌ DID_API_KEY not found in .env.local');
    process.exit(1);
}

async function cleanup() {
    console.log('🧹 D-ID Stream Cleanup\n');

    const encoded = Buffer.from(DID_API_KEY).toString('base64');
    const headers = {
        'Authorization': `Basic ${encoded}`,
        'Content-Type': 'application/json',
    };

    try {
        // List streams
        console.log('📋 Fetching streams...');
        const listRes = await fetch('https://api.d-id.com/talks/streams', {
            method: 'GET',
            headers,
        });

        if (!listRes.ok) {
            throw new Error(`List failed: ${await listRes.text()}`);
        }

        const data = await listRes.json();
        const streams = data.streams || [];

        console.log(`Found: ${streams.length} stream(s)\n`);

        if (streams.length === 0) {
            console.log('✨ Nothing to clean!');
            return;
        }

        // Show & delete
        for (const stream of streams) {
            console.log(`🗑️  Deleting: ${stream.id}`);

            const delRes = await fetch(`https://api.d-id.com/talks/streams/${stream.id}`, {
                method: 'DELETE',
                headers,
            });

            if (delRes.ok || delRes.status === 404) {
                console.log(`   ✅ Done`);
            } else {
                console.log(`   ❌ Failed:`, await delRes.text());
            }

            await new Promise(r => setTimeout(r, 400));
        }

        console.log('\n✅ Cleanup complete!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

cleanup();
