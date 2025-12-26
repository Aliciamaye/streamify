import { supabase } from '../lib/supabase';

export class PlaylistShareService {
    static async createShareLink(playlistId: string): Promise<string | null> {
        try {
            // Make playlist public
            const { error } = await supabase
                .from('playlists')
                .update({ is_public: true })
                .eq('id', playlistId);

            if (error) throw error;

            // Generate share URL
            const shareUrl = `${window.location.origin}/playlist/${playlistId}`;
            return shareUrl;
        } catch (error) {
            console.error('Failed to create share link:', error);
            return null;
        }
    }

    static async getSharedPlaylist(playlistId: string) {
        try {
            // Get playlist
            const { data: playlist, error: playlistError } = await supabase
                .from('playlists')
                .select('*')
                .eq('id', playlistId)
                .eq('is_public', true)
                .single();

            if (playlistError) throw playlistError;

            // Get songs
            const { data: songs, error: songsError } = await supabase
                .from('playlist_songs')
                .select('song_data, position')
                .eq('playlist_id', playlistId)
                .order('position');

            if (songsError) throw songsError;

            return {
                ...playlist,
                songs: songs?.map(s => s.song_data) || [],
            };
        } catch (error) {
            console.error('Failed to get shared playlist:', error);
            return null;
        }
    }

    static async copyToMyPlaylists(sharedPlaylist: any, userId: string) {
        try {
            // Create new playlist
            const { data: newPlaylist, error: playlistError } = await supabase
                .from('playlists')
                .insert({
                    user_id: userId,
                    name: `${sharedPlaylist.name} (Copy)`,
                    description: sharedPlaylist.description,
                    cover_url: sharedPlaylist.cover_url,
                    is_public: false,
                })
                .select()
                .single();

            if (playlistError) throw playlistError;

            // Add songs
            const songsToAdd = sharedPlaylist.songs.map((song: any, index: number) => ({
                playlist_id: newPlaylist.id,
                song_id: song.id,
                song_data: song,
                position: index,
            }));

            const { error: songsError } = await supabase
                .from('playlist_songs')
                .insert(songsToAdd);

            if (songsError) throw songsError;

            return newPlaylist;
        } catch (error) {
            console.error('Failed to copy playlist:', error);
            return null;
        }
    }

    static async exportPlaylist(playlistId: string, format: 'json' | 'm3u' = 'json'): Promise<string | null> {
        try {
            const { data: playlist } = await supabase
                .from('playlists')
                .select('*')
                .eq('id', playlistId)
                .single();

            const { data: songs } = await supabase
                .from('playlist_songs')
                .select('song_data')
                .eq('playlist_id', playlistId)
                .order('position');

            if (!playlist || !songs) return null;

            if (format === 'json') {
                return JSON.stringify({
                    name: playlist.name,
                    description: playlist.description,
                    songs: songs.map(s => s.song_data),
                }, null, 2);
            } else {
                // M3U format
                let m3u = '#EXTM3U\n';
                songs.forEach(item => {
                    const song = item.song_data;
                    m3u += `#EXTINF:${song.duration || 0},${song.artist} - ${song.title}\n`;
                    m3u += `${song.streamUrl || ''}\n`;
                });
                return m3u;
            }
        } catch (error) {
            console.error('Failed to export playlist:', error);
            return null;
        }
    }
}
