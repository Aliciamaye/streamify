import { supabase } from '../lib/supabase';
import { Song } from '../types';

export interface UserStats {
    totalPlaytime: number; // in seconds
    totalSongs: number;
    totalPlaylists: number;
    topArtists: Array<{ name: string; count: number }>;
    topSongs: Array<{ song: Song; count: number }>;
    recentActivity: Array<{ date: string; count: number }>;
}

export class StatsService {
    private static instance: StatsService;
    private userId: string | null = null;

    private constructor() { }

    static getInstance(): StatsService {
        if (!StatsService.instance) {
            StatsService.instance = new StatsService();
        }
        return StatsService.instance;
    }

    setUserId(userId: string) {
        this.userId = userId;
    }

    async getUserStats(): Promise<UserStats> {
        if (!this.userId) {
            return this.getEmptyStats();
        }

        try {
            // Get listening history
            const { data: history } = await supabase
                .from('listening_history')
                .select('song_data, played_at')
                .eq('user_id', this.userId)
                .order('played_at', { ascending: false })
                .limit(1000);

            // Get playlists count
            const { count: playlistCount } = await supabase
                .from('playlists')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.userId);

            if (!history) return this.getEmptyStats();

            // Calculate stats
            const songCounts = new Map<string, number>();
            const artistCounts = new Map<string, string>();
            const dailyCounts = new Map<string, number>();

            history.forEach(item => {
                const song = item.song_data;

                // Count songs
                songCounts.set(song.id, (songCounts.get(song.id) || 0) + 1);

                // Count artists
                if (song.artist) {
                    artistCounts.set(song.artist, song.id);
                }

                // Count by date
                const date = new Date(item.played_at).toISOString().split('T')[0];
                dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
            });

            // Top artists
            const artistPlayCounts = new Map<string, number>();
            history.forEach(item => {
                const artist = item.song_data.artist;
                if (artist) {
                    artistPlayCounts.set(artist, (artistPlayCounts.get(artist) || 0) + 1);
                }
            });

            const topArtists = Array.from(artistPlayCounts.entries())
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Top songs
            const topSongs = Array.from(songCounts.entries())
                .map(([songId, count]) => {
                    const song = history.find(h => h.song_data.id === songId)?.song_data;
                    return { song: song!, count };
                })
                .filter(item => item.song)
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Recent activity (last 7 days)
            const last7Days = Array.from(dailyCounts.entries())
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 7);

            // Estimate playtime (assume 3min average per song)
            const totalPlaytime = history.length * 180;

            return {
                totalPlaytime,
                totalSongs: history.length,
                totalPlaylists: playlistCount || 0,
                topArtists,
                topSongs,
                recentActivity: last7Days,
            };
        } catch (error) {
            console.error('Failed to get stats:', error);
            return this.getEmptyStats();
        }
    }

    private getEmptyStats(): UserStats {
        return {
            totalPlaytime: 0,
            totalSongs: 0,
            totalPlaylists: 0,
            topArtists: [],
            topSongs: [],
            recentActivity: [],
        };
    }

    formatPlaytime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}
