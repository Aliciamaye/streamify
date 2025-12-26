import { Song } from "../types";

export interface DownloadProgress {
    songId: string;
    progress: number; // 0-100
    status: 'pending' | 'downloading' | 'completed' | 'failed';
    error?: string;
}

export class DownloadManager {
    private static instance: DownloadManager;
    private downloads: Map<string, DownloadProgress> = new Map();
    private downloadQueue: Song[] = [];

    private constructor() {
        this.loadDownloadsFromDB();
    }

    static getInstance(): DownloadManager {
        if (!DownloadManager.instance) {
            DownloadManager.instance = new DownloadManager();
        }
        return DownloadManager.instance;
    }

    private async loadDownloadsFromDB() {
        // TODO: Load from IndexedDB when db.ts is updated
        console.log('[DownloadManager] Initialized');
    }

    async downloadSong(song: Song, streamUrl: string): Promise<void> {
        const songId = song.id;

        if (this.downloads.has(songId)) {
            console.warn(`[DownloadManager] Song already downloaded or in progress: ${songId}`);
            return;
        }

        this.downloads.set(songId, {
            songId,
            progress: 0,
            status: 'downloading'
        });

        try {
            console.log(`[DownloadManager] Downloading: ${song.title}`);

            // Fetch the stream URL
            const response = await fetch(streamUrl);
            if (!response.ok) throw new Error('Failed to fetch stream');

            const reader = response.body?.getReader();
            const contentLength = parseInt(response.headers.get('Content-Length') || '0');

            if (!reader) throw new Error('No response body');

            const chunks: Uint8Array[] = [];
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedLength += value.length;

                // Update progress
                const progress = contentLength > 0 ? (receivedLength / contentLength) * 100 : 0;
                this.downloads.set(songId, {
                    songId,
                    progress,
                    status: 'downloading'
                });
            }

            // Combine chunks into blob
            const blob = new Blob(chunks, { type: 'audio/mpeg' });
            const blobUrl = URL.createObjectURL(blob);

            // Store in IndexedDB (simplified for now)
            // TODO: Implement proper IndexedDB storage
            console.log(`[DownloadManager] Downloaded: ${song.title} (${receivedLength} bytes)`);

            this.downloads.set(songId, {
                songId,
                progress: 100,
                status: 'completed'
            });

        } catch (error) {
            console.error(`[DownloadManager] Download failed for ${songId}:`, error);
            this.downloads.set(songId, {
                songId,
                progress: 0,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    getDownloadProgress(songId: string): DownloadProgress | null {
        return this.downloads.get(songId) || null;
    }

    isDownloaded(songId: string): boolean {
        const progress = this.downloads.get(songId);
        return progress?.status === 'completed';
    }

    async deleteDownload(songId: string): Promise<void> {
        this.downloads.delete(songId);
        // TODO: Remove from IndexedDB
        console.log(`[DownloadManager] Deleted download: ${songId}`);
    }

    getAllDownloads(): DownloadProgress[] {
        return Array.from(this.downloads.values());
    }
}

export const downloadManager = DownloadManager.getInstance();
