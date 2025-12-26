import { Song } from '../../types';

export interface StreamSource {
    /**
     * Search for songs/tracks.
     */
    search(query: string, limit?: number): Promise<Song[]>;

    /**
     * Get the direct stream URL for a given song ID.
     * Returns null if not found or unavailable.
     */
    getStreamUrl(songId: string): Promise<string | null>;

    /**
     * Get recommendations or "Up Next" based on a song.
     */
    getRecommendations(songId?: string): Promise<Song[]>;

    /**
     * Get top charts or default home content.
     */
    getCharts(): Promise<Song[]>;
}
