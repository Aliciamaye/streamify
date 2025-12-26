import { StreamSource } from './StreamSource';
import { Song } from '../../types';
import { EMBEDDED_MUSIC } from '../../constants/embeddedMusic';

export class EmbeddedSource implements StreamSource {
    private static instance: EmbeddedSource;

    private constructor() { }

    static getInstance(): EmbeddedSource {
        if (!EmbeddedSource.instance) {
            EmbeddedSource.instance = new EmbeddedSource();
        }
        return EmbeddedSource.instance;
    }

    async search(query: string, limit = 20): Promise<Song[]> {
        console.log(`[EmbeddedSource] Searching embedded library: ${query}`);

        const results = EMBEDDED_MUSIC.filter(song =>
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase())
        );

        return results.slice(0, limit);
    }

    async getStreamUrl(songId: string): Promise<string | null> {
        const song = EMBEDDED_MUSIC.find(s => s.id === songId);
        return song ? song.streamUrl : null;
    }

    async getRecommendations(songId?: string): Promise<Song[]> {
        return this.getCharts();
    }

    async getCharts(): Promise<Song[]> {
        console.log('[EmbeddedSource] Returning embedded music collection');
        return EMBEDDED_MUSIC;
    }
}
