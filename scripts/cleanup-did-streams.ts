/**
 * D-ID Stream Cleanup Utility
 * Deletes all active streams to free up rate limits
 */

const DID_API_KEY = process.env.DID_API_KEY;

if (!DID_API_KEY) {
    console.error('❌ DID_API_KEY not found in environment');
    process.exit(1);
}

interface Stream {
    id: string;
    created_at: string;
    status: string;
}

async function getAuthHeaders() {
    const encoded = Buffer.from(DID_API_KEY!).toString('base64');
    return {
        'Authorization': `Basic ${encoded}`,
        'Content-Type': 'application/json',
    };
}

/**
 * List all active streams
 */
async function listStreams(): Promise<Stream[]> {
    const response = await fetch('https://api.d-id.com/talks/streams', {
        method: 'GET',
        headers: await getAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to list streams: ${error}`);
    }

    const data = await response.json();
    return data.streams || [];
}

/**
 * Delete a specific stream
 */
async function deleteStream(streamId: string): Promise<void> {
    const response = await fetch(`https://api.d-id.com/talks/streams/${streamId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
    });

    if (!response.ok && response.status !== 404) {
        const error = await response.text();
        console.error(`❌ Failed to delete stream ${streamId}:`, error);
    } else {
        console.log(`✅ Deleted stream: ${streamId}`);
    }
}

/**
 * Main cleanup function
 */
async function cleanup() {
    console.log('🧹 Starting D-ID stream cleanup...\n');

    try {
        // List all streams
        console.log('📋 Fetching active streams...');
        const streams = await listStreams();

        console.log(`Found ${streams.length} stream(s)\n`);

        if (streams.length === 0) {
            console.log('✨ No streams to clean up!');
            return;
        }

        // Display streams
        streams.forEach((stream, index) => {
            console.log(`${index + 1}. Stream ID: ${stream.id}`);
            console.log(`   Created: ${new Date(stream.created_at).toLocaleString()}`);
            console.log(`   Status: ${stream.status}\n`);
        });

        // Delete all streams
        console.log('🗑️  Deleting streams...\n');
        for (const stream of streams) {
            await deleteStream(stream.id);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n✅ Cleanup complete!');
        console.log('💡 You can now create new streams');

    } catch (error: any) {
        console.error('\n❌ Cleanup failed:', error.message);
        process.exit(1);
    }
}

// Run cleanup
cleanup();
