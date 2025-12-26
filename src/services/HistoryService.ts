import { supabase } from '../lib/supabase';
import { Song } from '../types';

export class HistoryService {
    private static instance: HistoryService;
    private userId: string | null = null;

    private constructor() { }

    static getInstance(): HistoryService {
        if (!HistoryService.instance) {
            HistoryService.instance = new HistoryService();
        }
        return HistoryService.instance;
    }

    setUserId(userId: string) {
        this.userId = userId;
    }

    async addToHistory(song: Song) {
        if (!this.userId) return;

        try {
            await supabase.from('listening_history').insert({
                user_id: this.userId,
                song_id: song.id,
                song_data: song,
            });
        } catch (error) {
            console.error('Failed to add to history:', error);
        }
    }

    async getRecentlyPlayed(limit = 50): Promise<Song[]> {
        if (!this.userId) return [];

        try {
            const { data, error } = await supabase
                .from('listening_history')
                .select('song_data')
                .eq('user_id', this.userId)
                .order('played_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data?.map(item => item.song_data) || [];
        } catch (error) {
            console.error('Failed to get history:', error);
            return [];
        }
    }

    async clearHistory() {
        if (!this.userId) return;

        try {
            await supabase
                .from('listening_history')
                .delete()
                .eq('user_id', this.userId);
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    }
}
