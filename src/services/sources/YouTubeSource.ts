import { StreamSource } from './StreamSource';
import { Song } from '../../types';
import { DEMO_SONGS } from '../../constants';

// Local backend API
const BACKEND_API = 'http://localhost:3001/api';

export class YouTubeSource implements StreamSource {
    private static instance: YouTubeSource;
    private streamCache: Map<string, string> = new Map();

    private constructor() { }

    static getInstance(): YouTubeSource {
        if (!YouTubeSource.instance) {
            YouTubeSource.instance = new YouTubeSource();
        }
        return YouTubeSource.instance;
    }

    async search(query: string, limit = 20): Promise<Song[]> {
        try {
            console.log(`[YouTubeSource] Searching via backend: ${query}`);

            const response = await fetch(`${BACKEND_API}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
            if (!response.ok) {
                console.error(`Backend search failed: ${response.status}`);
                return this.getFallbackSongs(query);
            }

            const data = await response.json();

            if (!data.songs || data.songs.length === 0) {
                console.warn('[YouTubeSource] No results from backend, using fallback');
                return this.getFallbackSongs(query);
            }

            return data.songs.map((s: any) => ({
                id: s.id,
                title: s.title,
                artist: s.artist,
                album: s.album || 'YouTube Music',
                duration: this.formatDuration(s.duration),
                coverUrl: s.thumbnail || 'https://via.placeholder.com/300x300/1ed760/000000?text=Music',
                streamUrl: ''
            }));

        } catch (error) {
            console.error('[YouTubeSource] Search failed:', error);
            return this.getFallbackSongs(query);
        }
    }

    async getStreamUrl(songId: string): Promise<string | null> {
        // Check cache first
        if (this.streamCache.has(songId)) {
            return this.streamCache.get(songId) || null;
        }

        // Embedded/Demo check
        if (songId.startsWith('embedded-') || /^\d+$/.test(songId) || songId.startsWith('m')) {
            const demoSong = DEMO_SONGS.find(s => s.id === songId);
            return demoSong ? demoSong.streamUrl : null;
        }

        try {
            console.log(`[YouTubeSource] Getting stream URL: ${songId}`);

            // Fetch the proxy URL from our backend
            const response = await fetch(`${BACKEND_API}/stream-url/${songId}`);
            if (!response.ok) {
                console.error(`Backend stream failed: ${response.status}`);
                return null;
            }

            const data = await response.json();
            const url = data.streamUrl;

            if (url) {
                this.streamCache.set(songId, url);
                return url;
            }

            return null;
        } catch (error) {
            console.error('[YouTubeSource] Stream URL failed:', error);
            return null;
        }
    }

    async getRecommendations(songId?: string): Promise<Song[]> {
        try {
            const endpoint = songId
                ? `${BACKEND_API}/recommendations/${songId}?limit=10`
                : `${BACKEND_API}/recommendations?limit=10`;

            const response = await fetch(endpoint);
            if (!response.ok) {
                return DEMO_SONGS.slice(0, 10);
            }

            const data = await response.json();

            if (!data.songs || data.songs.length === 0) {
                return DEMO_SONGS.slice(0, 10);
            }

            return data.songs.map((s: any) => ({
                id: s.id,
                title: s.title,
                artist: s.artist,
                album: s.album || 'YouTube Music',
                duration: this.formatDuration(s.duration),
                coverUrl: s.thumbnail || 'https://via.placeholder.com/300x300/1ed760/000000?text=Music',
                streamUrl: ''
            }));
        } catch (error) {
            console.error('[YouTubeSource] Recommendations failed:', error);
            return DEMO_SONGS.slice(0, 10);
        }
    }

    async getCharts(): Promise<Song[]> {
        try {
            console.log('[YouTubeSource] Fetching charts from backend');

            const response = await fetch(`${BACKEND_API}/charts?limit=20`);
            if (!response.ok) {
                console.warn('Charts endpoint failed, using demo songs');
                return DEMO_SONGS;
            }

            const data = await response.json();

            if (!data.songs || data.songs.length === 0) {
                return DEMO_SONGS;
            }

            return data.songs.map((s: any) => ({
                id: s.id,
                title: s.title,
                artist: s.artist,
                album: s.album || 'YouTube Music',
                duration: this.formatDuration(s.duration),
                coverUrl: s.thumbnail || 'https://via.placeholder.com/300x300/1ed760/000000?text=Music',
                streamUrl: ''
            }));
        } catch (error) {
            console.error('[YouTubeSource] Charts failed:', error);
            return DEMO_SONGS;
        }
    }

    private getFallbackSongs(query: string): Song[] {
        const lowerQuery = query.toLowerCase();
        return DEMO_SONGS.filter(s =>
            s.title.toLowerCase().includes(lowerQuery) ||
            s.artist.toLowerCase().includes(lowerQuery)
        );
    }

    private formatDuration(seconds: number): string {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
