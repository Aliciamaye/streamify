import { Song } from '../../types';
import { StreamSource } from './StreamSource';

interface PipedInstance {
    url: string;
    healthy: boolean;
    lastCheck: number;
}

export class PipedSource implements StreamSource {
    private static instance: PipedSource;

    private instances: PipedInstance[] = [
        { url: 'https://pipedapi.kavin.rocks', healthy: true, lastCheck: 0 },
        { url: 'https://pipedapi.tokhmi.xyz', healthy: true, lastCheck: 0 },
        { url: 'https://piped-api.lunar.icu', healthy: true, lastCheck: 0 },
    ];

    private currentInstanceIndex = 0;
    private readonly TIMEOUT = 5000;
    private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute

    private constructor() { }

    static getInstance(): PipedSource {
        if (!PipedSource.instance) {
            PipedSource.instance = new PipedSource();
        }
        return PipedSource.instance;
    }

    private async fetchWithTimeout(url: string, timeout: number = this.TIMEOUT): Promise<Response> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    private getNextInstance(): string {
        // Try healthy instances first
        const healthyInstances = this.instances.filter(i => i.healthy);

        if (healthyInstances.length > 0) {
            const instance = healthyInstances[this.currentInstanceIndex % healthyInstances.length];
            this.currentInstanceIndex++;
            return instance.url;
        }

        // Fallback to any instance
        const instance = this.instances[this.currentInstanceIndex % this.instances.length];
        this.currentInstanceIndex++;
        return instance.url;
    }

    async search(query: string, limit: number = 20): Promise<Song[]> {
        const attempts = this.instances.length;

        for (let i = 0; i < attempts; i++) {
            const instanceUrl = this.getNextInstance();

            try {
                console.log(`[PipedSource] Searching "${query}" on ${instanceUrl}`);

                const response = await this.fetchWithTimeout(
                    `${instanceUrl}/search?q=${encodeURIComponent(query)}&filter=music_songs`
                );

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                const songs = this.parsePipedResults(data.items || [], limit);

                console.log(`[PipedSource] ✓ Found ${songs.length} songs`);
                return songs;

            } catch (error) {
                console.warn(`[PipedSource] ${instanceUrl} failed:`, error);
                // Mark as unhealthy
                const instance = this.instances.find(i => i.url === instanceUrl);
                if (instance) instance.healthy = false;

                if (i === attempts - 1) {
                    throw new Error('All Piped instances failed');
                }
            }
        }

        return [];
    }

    async getStreamUrl(videoId: string): Promise<string> {
        const attempts = this.instances.length;

        for (let i = 0; i < attempts; i++) {
            const instanceUrl = this.getNextInstance();

            try {
                console.log(`[PipedSource] Getting stream for ${videoId} from ${instanceUrl}`);

                const response = await this.fetchWithTimeout(
                    `${instanceUrl}/streams/${videoId}`
                );

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();

                // Get best audio stream
                const audioStream = data.audioStreams?.find((s: any) =>
                    s.mimeType?.includes('audio/mp4') || s.mimeType?.includes('audio/webm')
                );

                if (audioStream?.url) {
                    console.log(`[PipedSource] ✓ Got stream URL`);
                    return audioStream.url;
                }

                throw new Error('No audio stream found');

            } catch (error) {
                console.warn(`[PipedSource] ${instanceUrl} failed:`, error);

                if (i === attempts - 1) {
                    throw new Error('All Piped instances failed for stream');
                }
            }
        }

        throw new Error('Failed to get stream URL');
    }

    async getSongInfo(videoId: string): Promise<Song | null> {
        try {
            const instanceUrl = this.getNextInstance();
            const response = await this.fetchWithTimeout(
                `${instanceUrl}/streams/${videoId}`
            );

            if (!response.ok) return null;

            const data = await response.json();
            return this.parsePipedSong(data);

        } catch (error) {
            console.error('[PipedSource] Failed to get song info:', error);
            return null;
        }
    }

    private parsePipedResults(items: any[], limit: number): Song[] {
        return items.slice(0, limit).map(item => ({
            id: item.url?.replace('/watch?v=', '') || item.id || '',
            title: item.title || 'Unknown Title',
            artist: item.uploaderName || item.uploader || 'Unknown Artist',
            album: '',
            duration: this.formatDuration(item.duration || 0),
            coverUrl: item.thumbnail || item.thumbnailUrl || 'https://via.placeholder.com/400',
            streamUrl: '', // Will be fetched when playing
            source: 'piped'
        })).filter(song => song.id);
    }

    private parsePipedSong(data: any): Song {
        return {
            id: data.id || '',
            title: data.title || 'Unknown Title',
            artist: data.uploader || 'Unknown Artist',
            album: '',
            duration: this.formatDuration(data.duration || 0),
            coverUrl: data.thumbnailUrl || 'https://via.placeholder.com/400',
            streamUrl: '',
            source: 'piped'
        };
    }

    private formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
