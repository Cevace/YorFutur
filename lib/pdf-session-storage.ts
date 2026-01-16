import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * PDF Session Storage (Local Project File System Based)
 * 
 * Stores generated PDFs temporarily in a local directory `.pdf_sessions` within the project root.
 */

interface PDFSessionMetadata {
    filename: string;
    createdAt: number;
    expiresAt: number;
}

class PDFSessionStorage {
    private readonly SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes
    // USE LOCAL PROJECT DIRECTORY
    private readonly STORAGE_DIR = path.join(process.cwd(), '.pdf_sessions');
    private readonly PREFIX = 'session_';

    constructor() {
        // Ensure storage directory exists
        if (!fs.existsSync(this.STORAGE_DIR)) {
            try {
                fs.mkdirSync(this.STORAGE_DIR, { recursive: true });
            } catch (e) {
                console.error('[PDFStorage] Failed to create storage dir:', e);
            }
        }

        // Initialize cleanup
        if (typeof setInterval !== 'undefined') {
            setInterval(() => this.cleanup(), 60 * 1000); // Cleanup every minute
        }
    }

    private getFilePath(sessionId: string): string {
        return path.join(this.STORAGE_DIR, `${this.PREFIX}${sessionId}.pdf`);
    }

    private getMetaPath(sessionId: string): string {
        return path.join(this.STORAGE_DIR, `${this.PREFIX}${sessionId}.json`);
    }

    /**
     * Store PDF buffer to disk
     */
    store(pdfBuffer: Buffer, filename: string): { sessionId: string; expiresAt: Date } {
        const sessionId = randomUUID();
        const expiresAt = new Date(Date.now() + this.SESSION_TTL_MS);

        try {
            if (!fs.existsSync(this.STORAGE_DIR)) {
                fs.mkdirSync(this.STORAGE_DIR, { recursive: true });
            }

            // 1. Write PDF content
            const pdfPath = this.getFilePath(sessionId);
            fs.writeFileSync(pdfPath, pdfBuffer);

            // 2. Write Metadata
            const metaPath = this.getMetaPath(sessionId);
            const metadata: PDFSessionMetadata = {
                filename,
                createdAt: Date.now(),
                expiresAt: expiresAt.getTime()
            };
            fs.writeFileSync(metaPath, JSON.stringify(metadata));

            console.log(`[PDFStorage] ✅ Saved session ${sessionId} to ${pdfPath}`);
            return { sessionId, expiresAt };

        } catch (error) {
            console.error('[PDFStorage] ❌ Critical Write Error:', error);
            throw new Error('Failed to persist generated PDF');
        }
    }

    /**
     * Retrieve PDF with Retry Logic
     */
    retrieve(sessionId: string): { pdfBuffer: Buffer; filename: string } | null {
        try {
            const pdfPath = this.getFilePath(sessionId);
            const metaPath = this.getMetaPath(sessionId);

            // RETRY LOGIC: Try up to 5 times (500ms total)
            let attempts = 0;
            let found = false;
            while (attempts < 5) {
                if (fs.existsSync(pdfPath) && fs.existsSync(metaPath)) {
                    found = true;
                    break;
                }
                const start = Date.now();
                while (Date.now() - start < 100);
                attempts++;
            }

            if (!found) {
                console.warn(`[PDFStorage] ❌ Session files missing for ${sessionId}`);
                return null;
            }

            // Read Metadata
            const metaRaw = fs.readFileSync(metaPath, 'utf-8');
            const metadata: PDFSessionMetadata = JSON.parse(metaRaw);

            // Check Expiry
            if (Date.now() > metadata.expiresAt) {
                console.warn(`[PDFStorage] ⚠️ Session expired for ${sessionId}`);
                this.deleteSessionFiles(sessionId);
                return null;
            }

            // Read PDF
            const pdfBuffer = fs.readFileSync(pdfPath);

            // IMPORTANT: Do NOT delete immediately. 
            // Browsers (Chrome) often request the resource twice (headers check + download),
            // or rapid retries occur. We rely on the 5-minute TTL cleanup.
            // this.deleteSessionFiles(sessionId); 

            return { pdfBuffer, filename: metadata.filename };

        } catch (error) {
            console.error(`[PDFStorage] Retrieval Error for ${sessionId}:`, error);
            return null;
        }
    }

    private deleteSessionFiles(sessionId: string) {
        try {
            const pdfPath = this.getFilePath(sessionId);
            const metaPath = this.getMetaPath(sessionId);
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
        } catch (e) { }
    }

    private cleanup() {
        try {
            if (!fs.existsSync(this.STORAGE_DIR)) return;
            const now = Date.now();
            const files = fs.readdirSync(this.STORAGE_DIR);

            files.forEach(file => {
                if (file.startsWith(this.PREFIX) && file.endsWith('.json')) {
                    const filePath = path.join(this.STORAGE_DIR, file);
                    try {
                        const content = fs.readFileSync(filePath, 'utf-8');
                        const meta = JSON.parse(content);
                        if (now > meta.expiresAt) {
                            const sessionId = file.replace(this.PREFIX, '').replace('.json', '');
                            this.deleteSessionFiles(sessionId);
                        }
                    } catch (e) { }
                }
            });
        } catch (error) {
            console.error('[PDFStorage] Cleanup error:', error);
        }
    }

    /**
     * DEBUG METHOD
     */
    debug() {
        return {
            cwd: process.cwd(),
            storageDir: this.STORAGE_DIR,
            exists: fs.existsSync(this.STORAGE_DIR),
            files: fs.existsSync(this.STORAGE_DIR) ? fs.readdirSync(this.STORAGE_DIR) : [],
            tmpDir: os.tmpdir()
        };
    }
}

const pdfSessionStorage = new PDFSessionStorage();
export default pdfSessionStorage;
