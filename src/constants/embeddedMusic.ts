import { Song } from '../types';

// Embedded royalty-free music library with CORS-friendly URLs
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
    },
    {
        id: 'embedded-4',
        title: 'Jazz Vibes',
        artist: 'Streamify',
        album: 'Embedded Collection',
        duration: '3:56',
        coverUrl: 'https://picsum.photos/seed/music4/400/400',
        streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3'
    },
    {
        id: 'embedded-5',
        title: 'Electronic Pulse',
        artist: 'Streamify',
        album: 'Embedded Collection',
        duration: '3:18',
        coverUrl: 'https://picsum.photos/seed/music5/400/400',
        streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3'
    },
    {
        id: 'embedded-6',
        title: 'Acoustic Sunset',
        artist: 'Streamify',
        album: 'Embedded Collection',
        duration: '2:58',
        coverUrl: 'https://picsum.photos/seed/music6/400/400',
        streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'
    },
    {
        id: 'embedded-7',
        title: 'Hip Hop Flow',
        artist: 'Streamify',
        album: 'Embedded Collection',
        duration: '3:42',
        coverUrl: 'https://picsum.photos/seed/music7/400/400',
        streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/pyman_assets/ateapill.ogg'
    },
    {
        id: 'embedded-8',
        title: 'Classical Morning',
        artist: 'Streamify',
        album: 'Embedded Collection',
        duration: '4:05',
        coverUrl: 'https://picsum.photos/seed/music8/400/400',
        streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3'
    },
    {
        id: 'embedded-9',
        title: 'Synthwave Night',
        artist: 'Streamify',
        album: 'Embedded Collection',
        duration: '3:33',
        coverUrl: 'https://picsum.photos/seed/music9/400/400',
        streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3'
    },
    {
        id: 'embedded-10',
        title: 'Indie Folk',
        artist: 'Streamify',
        album: 'Embedded Collection',
        duration: '3:21',
        coverUrl: 'https://picsum.photos/seed/music10/400/400',
        streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'
    }
];

export const DEMO_PLAYLISTS = [
    {
        id: 'p1',
        name: 'Cyberpunk Vibes',
        description: 'Neon lights and rainy nights.',
        coverUrl: 'https://picsum.photos/seed/p1/500/500',
        songs: [EMBEDDED_MUSIC[0], EMBEDDED_MUSIC[1]],
        color: 'from-purple-800'
    },
    {
        id: 'p2',
        name: 'Indie Roadtrip',
        description: 'Songs to drive to.',
        coverUrl: 'https://picsum.photos/seed/p2/500/500',
        songs: [EMBEDDED_MUSIC[2], EMBEDDED_MUSIC[3]],
        color: 'from-orange-700'
    },
    {
        id: 'p3',
        name: 'Club Classics',
        description: 'Weekend warmups.',
        coverUrl: 'https://picsum.photos/seed/p3/500/500',
        songs: [EMBEDDED_MUSIC[4]],
        color: 'from-pink-700'
    }
];
