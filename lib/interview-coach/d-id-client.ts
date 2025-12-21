/**
 * D-ID Streams API Client (CORRECTED)
 * Using /talks/streams endpoint (NOT /streams)
 * Reference: https://docs.d-id.com/reference/streams
 */

const DID_API_BASE = 'https://api.d-id.com';

interface DIDStreamResponse {
    id: string;
    session_id: string;
    offer: {
        type: 'offer';
        sdp: string;
    };
    ice_servers: RTCIceServer[];
}

/**
 * Create auth headers for D-ID Streams API
 * Uses Basic Authentication with base64 encoding
 * Format: Authorization: Basic base64(username:password)
 * Where password is the API key, username can be empty
 */
function getAuthHeaders(apiKey: string): Record<string, string> {
    // Check if API key already includes username:password format
    const credentials = apiKey.includes(':')
        ? apiKey  // Already in correct format
        : `:${apiKey}`;  // Add empty username prefix

    // Base64 encode the credentials
    const encoded = Buffer.from(credentials).toString('base64');

    console.log('[D-ID Auth] Using Basic Auth with base64 encoding');

    return {
        'Authorization': `Basic ${encoded}`,
        'Content-Type': 'application/json',
    };
}

/**
 * PHASE 1: Create D-ID Stream (The Handshake)
 * POST /talks/streams
 * 
 * @param apiKey D-ID API key
 * @param sourceImageUrl Optional custom image URL (must be publicly accessible)
 * @param driverUrl Optional D-ID presenter (e.g., 'bank://lively/adult-woman')
 */
export async function createDIDStream(
    apiKey: string,
    sourceImageUrl: string | null,
    driverUrl?: string
): Promise<DIDStreamResponse> {
    console.log('🎥 Creating D-ID stream (Phase 1)...', {
        hasSourceUrl: !!sourceImageUrl,
        hasDriverUrl: !!driverUrl
    });

    // Build request body based on what's provided
    const requestBody: any = {
        // Enable warmup video to show idle presenter before first audio
        stream_warmup: true,
    };

    if (driverUrl) {
        requestBody.driver_url = driverUrl;
    } else if (sourceImageUrl) {
        requestBody.source_url = sourceImageUrl;
    } else {
        throw new Error('Must provide either source_url or driver_url');
    }

    console.log('📤 Creating stream with body:', JSON.stringify(requestBody));

    const response = await fetch(`${DID_API_BASE}/talks/streams`, {
        method: 'POST',
        headers: getAuthHeaders(apiKey),
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ D-ID stream creation failed:', {
            status: response.status,
            error: errorText,
        });
        throw new Error(`Failed to create stream: ${errorText}`);
    }

    // Log response headers to check for Set-Cookie
    const setCookieHeader = response.headers.get('set-cookie');
    console.log('📝 D-ID Response Headers:', {
        'set-cookie': setCookieHeader?.substring(0, 100) || 'none',
    });

    const data = await response.json();
    console.log('✅ D-ID stream created (FULL RESPONSE):', {
        id: data.id,
        session_id: data.session_id,
        hasOffer: !!data.offer,
        hasIceServers: Array.isArray(data.ice_servers),
        allKeys: Object.keys(data),
    });

    return data;
}

/**
 * PHASE 1: Submit SDP Answer (Complete Handshake)
 * POST /talks/streams/{streamId}/sdp
 */
export async function submitSDPAnswer(
    apiKey: string,
    streamId: string,
    sessionId: string,
    answer: RTCSessionDescriptionInit
): Promise<void> {
    console.log('📡 [SDP] Submitting SDP answer...', {
        streamId,
        sessionId: sessionId.substring(0, 20) + '...',
        answerType: answer.type
    });

    try {
        const headers = {
            ...getAuthHeaders(apiKey),
            'Cookie': sessionId,  // D-ID requires session as cookie for server stickiness
        };

        const response = await fetch(`${DID_API_BASE}/talks/streams/${streamId}/sdp`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                answer: {
                    type: answer.type,
                    sdp: answer.sdp,
                },
                session_id: sessionId,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ [SDP] D-ID rejected answer:', {
                status: response.status,
                statusText: response.statusText,
                error
            });
            throw new Error(`Failed to submit SDP answer: ${error}`);
        }

        console.log('✅ [SDP] Answer submitted successfully');
    } catch (error: any) {
        console.error('❌ [SDP] Submission failed:', {
            message: error.message,
            name: error.name
        });
        throw error;
    }
}

/**
 * PHASE 1: Submit ICE Candidate (CRITICAL!)
 * POST /talks/streams/{streamId}/ice
 */
export async function submitICECandidate(
    apiKey: string,
    streamId: string,
    sessionId: string,
    candidate: RTCIceCandidate
): Promise<void> {
    console.log('🧊 Submitting ICE candidate:', candidate.candidate);

    const headers = {
        ...getAuthHeaders(apiKey),
        'Cookie': sessionId,  // D-ID requires session as cookie for server stickiness
    };

    const response = await fetch(`${DID_API_BASE}/talks/streams/${streamId}/ice`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
            session_id: sessionId,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('❌ ICE candidate failed:', error);
        // Don't throw - ICE is best-effort
    } else {
        console.log('✅ ICE candidate submitted');
    }
}

/**
 * PHASE 2: Send Audio to Stream (Make It Talk)
 * POST /talks/streams/{streamId}
 * 
 * Note: audioUrl must be publicly accessible (e.g., Supabase Storage)
 */
export async function sendAudioToStream(
    apiKey: string,
    streamId: string,
    sessionId: string,
    audioUrl: string
): Promise<void> {
    console.log('🎤 [D-ID TALK] Sending audio to stream...', {
        streamId,
        sessionId: sessionId?.substring(0, 50) + '...',
        audioUrl: audioUrl.substring(0, 80) + '...',
    });

    const requestBody = {
        script: {
            type: 'audio',
            audio_url: audioUrl,
        },
        driver_url: 'bank://lively/',
        config: {
            stitch: true,
        },
        session_id: sessionId,  // Also include in body for compatibility
    };

    // D-ID requires session_id as Cookie header for server stickiness
    const headers = {
        ...getAuthHeaders(apiKey),
        'Cookie': sessionId,  // Send the full cookie string
    };

    console.log('📤 [D-ID TALK] Sending with Cookie header');

    const response = await fetch(`${DID_API_BASE}/talks/streams/${streamId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('❌ [D-ID TALK] Failed:', { status: response.status, error });
        throw new Error(`Failed to send audio: ${error}`);
    }

    // Log the response body - D-ID may return useful status info
    const responseData = await response.json().catch(() => ({}));
    console.log('✅ [D-ID TALK] Audio sent successfully. Response:', {
        status: response.status,
        data: responseData,
    });
}

/**
 * Close D-ID Stream
 * DELETE /talks/streams/{streamId}
 */
export async function closeDIDStream(
    apiKey: string,
    streamId: string,
    sessionId: string
): Promise<void> {
    console.log('🛑 Closing D-ID stream...');

    const headers = {
        ...getAuthHeaders(apiKey),
        'Cookie': sessionId,  // D-ID requires session as cookie for server stickiness
    };

    const response = await fetch(`${DID_API_BASE}/talks/streams/${streamId}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
            session_id: sessionId,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Failed to close stream:', error);
        // Best-effort cleanup
    } else {
        console.log('✅ Stream closed');
    }
}
