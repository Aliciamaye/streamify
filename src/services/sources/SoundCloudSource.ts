import { Song } from '../../types';
import { StreamSource } from './StreamSource';

export class SoundCloudSource implements StreamSource {
    private static instance: SoundCloudSource;
    private clientId = 'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX'; // Public widget ID

    private constructor() { }

    static getInstance(): SoundCloudSource {
        if (!SoundCloudSource.instance) {
            SoundCloudSource.instance = new SoundCloudSource();
        }
        return SoundCloudSource.instance;
    }

    async search(query: string, limit: number = 20): Promise<Song[]> {
        try {
            console.log(`[SoundCloudSource] Searching "${query}"`);

            const response = await fetch(
                `https://api-v2.soundcloud.com/search/tracks?` +
                `q=${encodeURIComponent(query)}&client_id=${this.clientId}&limit=${limit}`
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const songs = this.parseResults(data.collection || [], limit);

            console.log(`[SoundCloudSource] ✓ Found ${songs.length} songs`);
            return songs;

        } catch (error) {
            console.warn('[SoundCloudSource] Search failed:', error);
            throw error;
        }
    }

    async getStreamUrl(trackId: string): Promise<string> {
        try {
            console.log(`[SoundCloudSource] Getting stream for ${trackId}`);

            // Get track info first
            const trackResponse = await fetch(
                `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${this.clientId}`
            );

            if (!trackResponse.ok) throw new Error(`HTTP ${trackResponse.status}`);

            const trackData = await trackResponse.json();

            // Get stream URL
            const streamResponse = await fetch(
                `${trackData.media.transcodings[0].url}?client_id=${this.clientId}`
            );

            if (!streamResponse.ok) throw new Error(`HTTP ${streamResponse.status}`);

            const streamData = await streamResponse.json();

            console.log(`[SoundCloudSource] ✓ Got stream URL`);
            return streamData.url;

        } catch (error) {
            console.error('[SoundCloudSource] Failed to get stream:', error);
            throw error;
        }
    }

    async getSongInfo(trackId: string): Promise<Song | null> {
        try {
            const response = await fetch(
                `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${this.clientId}`
            );

            if (!response.ok) return null;

            const data = await response.json();
            return this.parseSong(data);

        } catch (error) {
            console.error('[SoundCloudSource] Failed to get song info:', error);
            return null;
        }
    }

    private parseResults(tracks: any[], limit: number): Song[] {
        return tracks.slice(0, limit)
            .filter(track => track.streamable)
            .map(track => this.parseSong(track))
            .filter(song => song.id);
    }

    private parseSong(track: any): Song {
        return {
            id: track.id?.toString() || '',
            title: track.title || 'Unknown Title',
            artist: track.user?.username || 'Unknown Artist',
            album: track.publisher_metadata?.album_title || '',
            duration: this.formatDuration(Math.floor((track.duration || 0) / 1000)),
            coverUrl: track.artwork_url?.replace('-large', '-t500x500') || track.user?.avatar_url || '',
            streamUrl: '',
            source: 'soundcloud'
        };
    }

    private formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
