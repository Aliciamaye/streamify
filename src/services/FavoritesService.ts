import { supabase } from '../lib/supabase';
import { Song } from '../types';

export class FavoritesService {
    private static instance: FavoritesService;
    private userId: string | null = null;
    private likedSongs: Set<string> = new Set();

    private constructor() { }

    static getInstance(): FavoritesService {
        if (!FavoritesService.instance) {
            FavoritesService.instance = new FavoritesService();
        }
        return FavoritesService.instance;
    }

    setUserId(userId: string) {
        this.userId = userId;
        this.loadLikedSongs();
    }

    private async loadLikedSongs() {
        if (!this.userId) return;

        try {
            const { data } = await supabase
                .from('liked_songs')
                .select('song_id')
                .eq('user_id', this.userId);

            this.likedSongs = new Set(data?.map(item => item.song_id) || []);
        } catch (error) {
            console.error('Failed to load liked songs:', error);
        }
    }

    async toggleLike(song: Song): Promise<boolean> {
        if (!this.userId) return false;

        const isLiked = this.likedSongs.has(song.id);

        try {
            if (isLiked) {
                await supabase
                    .from('liked_songs')
                    .delete()
                    .eq('user_id', this.userId)
                    .eq('song_id', song.id);

                this.likedSongs.delete(song.id);
                return false;
            } else {
                await supabase.from('liked_songs').insert({
                    user_id: this.userId,
                    song_id: song.id,
                    song_data: song,
                });

                this.likedSongs.add(song.id);
                return true;
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
            return isLiked;
        }
    }

    isLiked(songId: string): boolean {
        return this.likedSongs.has(songId);
    }

    async getLikedSongs(): Promise<Song[]> {
        if (!this.userId) return [];

        try {
            const { data, error } = await supabase
                .from('liked_songs')
                .select('song_data')
                .eq('user_id', this.userId)
                .order('liked_at', { ascending: false });

            if (error) throw error;
            return data?.map(item => item.song_data) || [];
        } catch (error) {
            console.error('Failed to get liked songs:', error);
            return [];
        }
    }
}
