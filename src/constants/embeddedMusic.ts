import { Song } from '../types';

// Embedded royalty-free music library with working URLs (no CORS issues)
export const EMBEDDED_MUSIC: Song[] = [
    {
        id: 'embedded-1',
        title: 'Chill Lofi Beat',
        artist: 'Streamify',
        album: 'Embedded Collection',
        duration: '3:24',
        coverUrl: 'https://picsum.photos/seed/music1/400/400',
        streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3'
    },
    {
        id: 'embedded-2',
        title: 'Energetic Rock',
        artist: 'Streamify',
        album: 'Embedded Collection',
        duration: '2:45',
        coverUrl: 'https://picsum.photos/seed/music2/400/400',
        streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'
    },
    {
        id: 'embedded-3',
        title: 'Ambient Dreams',
        artist: 'Streamify',
        album: 'Embedded Collection',
        duration: '4:12',
        coverUrl: 'https://picsum.photos/seed/music3/400/400',
        streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/pyman_assets/ateapill.ogg'
    }
];

export const DEMO_PLAYLISTS = [
    {
        id: 'demo-1',
        name: 'Demo Playlist',
        description: 'Sample embedded music',
        coverUrl: 'https://picsum.photos/seed/playlist1/500/500',
        songs: EMBEDDED_MUSIC,
        color: 'from-purple-700'
    }
];
