import { Song } from '../../types';
import { StreamSource } from './StreamSource';

interface InvidiousInstance {
    url: string;
    healthy: boolean;
}

export class InvidiousSource implements StreamSource {
    private static instance: InvidiousSource;

    private instances: InvidiousInstance[] = [
        { url: 'https://invidious.snopyta.org', healthy: true },
        { url: 'https://yewtu.be', healthy: true },
        { url: 'https://invidious.kavin.rocks', healthy: true },
    ];

    private currentIndex = 0;
    private readonly TIMEOUT = 5000;

    private constructor() { }

    static getInstance(): InvidiousSource {
        if (!InvidiousSource.instance) {
            InvidiousSource.instance = new InvidiousSource();
        }
        return InvidiousSource.instance;
    }

    private async fetchWithTimeout(url: string): Promise<Response> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.TIMEOUT);

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
        const instance = this.instances[this.currentIndex % this.instances.length];
        this.currentIndex++;
        return instance.url;
    }

    async search(query: string, limit: number = 20): Promise<Song[]> {
        for (let i = 0; i < this.instances.length; i++) {
            const instanceUrl = this.getNextInstance();

            try {
                console.log(`[InvidiousSource] Searching "${query}" on ${instanceUrl}`);

                const response = await this.fetchWithTimeout(
                    `${instanceUrl}/api/v1/search?q=${encodeURIComponent(query)}&type=video&page=1`
                );

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                const songs = this.parseResults(data, limit);

                console.log(`[InvidiousSource] ✓ Found ${songs.length} songs`);
                return songs;

            } catch (error) {
                console.warn(`[InvidiousSource] ${instanceUrl} failed:`, error);
                if (i === this.instances.length - 1) {
                    throw new Error('All Invidious instances failed');
                }
            }
        }

        return [];
    }

    async getStreamUrl(videoId: string): Promise<string> {
        for (let i = 0; i < this.instances.length; i++) {
            const instanceUrl = this.getNextInstance();

            try {
                console.log(`[InvidiousSource] Getting stream for ${videoId}`);

                const response = await this.fetchWithTimeout(
                    `${instanceUrl}/api/v1/videos/${videoId}`
                );

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();

                // Get best audio format
                const audioFormat = data.adaptiveFormats?.find((f: any) =>
                    f.type?.includes('audio/mp4') && f.audioQuality === 'AUDIO_QUALITY_MEDIUM'
                ) || data.adaptiveFormats?.find((f: any) => f.type?.includes('audio'));

                if (audioFormat?.url) {
                    console.log(`[InvidiousSource] ✓ Got stream URL`);
                    return audioFormat.url;
                }

                throw new Error('No audio format found');

            } catch (error) {
                console.warn(`[InvidiousSource] ${instanceUrl} failed:`, error);
                if (i === this.instances.length - 1) {
                    throw new Error('All Invidious instances failed for stream');
                }
            }
        }

        throw new Error('Failed to get stream URL');
    }

    async getSongInfo(videoId: string): Promise<Song | null> {
        try {
            const instanceUrl = this.getNextInstance();
            const response = await this.fetchWithTimeout(
                `${instanceUrl}/api/v1/videos/${videoId}`
            );

            if (!response.ok) return null;

            const data = await response.json();
            return this.parseSong(data);

        } catch (error) {
            console.error('[InvidiousSource] Failed to get song info:', error);
            return null;
        }
    }

    private parseResults(items: any[], limit: number): Song[] {
        return items.slice(0, limit)
            .filter(item => item.type === 'video')
            .map(item => ({
                id: item.videoId || '',
                title: item.title || 'Unknown Title',
                artist: item.author || 'Unknown Artist',
                album: '',
                duration: this.formatDuration(item.lengthSeconds || 0),
                coverUrl: item.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`,
                streamUrl: '',
                source: 'invidious'
            }))
            .filter(song => song.id);
    }

    private parseSong(data: any): Song {
        return {
            id: data.videoId || '',
            title: data.title || 'Unknown Title',
            artist: data.author || 'Unknown Artist',
            album: '',
            duration: this.formatDuration(data.lengthSeconds || 0),
            coverUrl: data.videoThumbnails?.[0]?.url || '',
            streamUrl: '',
            source: 'invidious'
        };
    }

    private formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
