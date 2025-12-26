import { Playlist, Song } from './types';

export const DEMO_SONGS: Song[] = [
  {
    id: 'embedded-1',
    title: 'Chill Vibes',
    artist: 'Demo Artist',
    album: 'Demo Album',
    duration: '3:45',
    coverUrl: 'https://picsum.photos/seed/song1/300/300',
    streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3'
  },
  {
    id: 'embedded-2',
    title: 'Summer Nights',
    artist: 'Demo Band',
    album: 'Demo Collection',
    duration: '4:12',
    coverUrl: 'https://picsum.photos/seed/song2/300/300',
    streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'
  },
  {
    id: 'embedded-3',
    title: 'Electric Dreams',
    artist: 'Synth Wave',
    album: 'Retro Future',
    duration: '3:28',
    coverUrl: 'https://picsum.photos/seed/song3/300/300',
    streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/pyman_assets/ateapill.ogg'
  },
  {
    id: 'embedded-4',
    title: 'Midnight Jazz',
    artist: 'Jazz Ensemble',
    album: 'Late Night Sessions',
    duration: '5:03',
    coverUrl: 'https://picsum.photos/seed/song4/300/300',
    streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3'
  },
  {
    id: 'embedded-5',
    title: 'Ocean Waves',
    artist: 'Nature Sounds',
    album: 'Relaxation',
    duration: '6:30',
    coverUrl: 'https://picsum.photos/seed/song5/300/300',
    streamUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3'
  }
];

export const DEMO_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Cyberpunk Vibes',
    description: 'Neon lights and rainy nights.',
    coverUrl: 'https://picsum.photos/seed/p1/500/500',
    songs: [DEMO_SONGS[0], DEMO_SONGS[1]],
    color: 'from-purple-800'
  },
  {
    id: 'p2',
    name: 'Indie Roadtrip',
    description: 'Songs to drive to.',
    coverUrl: 'https://picsum.photos/seed/p2/500/500',
    songs: [DEMO_SONGS[2], DEMO_SONGS[3]],
    color: 'from-orange-700'
  },
  {
    id: 'p3',
    name: 'Club Classics',
    description: 'Weekend warmups.',
    coverUrl: 'https://picsum.photos/seed/p3/500/500',
    songs: [DEMO_SONGS[4]],
    color: 'from-pink-700'
  }
];