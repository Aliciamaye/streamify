import { Song } from '../types';
import { DEMO_SONGS } from '../constants';

// Extended demo library
const MOCK_LIBRARY: Song[] = [
  ...DEMO_SONGS,
  { id: 'm1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', coverUrl: 'https://picsum.photos/seed/m1/300/300', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'm2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23', coverUrl: 'https://picsum.photos/seed/m2/300/300', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'm3', title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: '3:18', coverUrl: 'https://picsum.photos/seed/m3/300/300', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'm4', title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: '3:35', coverUrl: 'https://picsum.photos/seed/m4/300/300', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 'm5', title: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR', duration: '2:58', coverUrl: 'https://picsum.photos/seed/m5/300/300', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 'm6', title: 'Kiss Me More', artist: 'Doja Cat', album: 'Planet Her', duration: '3:28', coverUrl: 'https://picsum.photos/seed/m6/300/300', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: 'm7', title: 'Montero', artist: 'Lil Nas X', album: 'Montero', duration: '2:17', coverUrl: 'https://picsum.photos/seed/m7/300/300', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: 'm8', title: 'Stay', artist: 'Kid Laroi & Justin Bieber', album: 'F*ck Love 3', duration: '2:21', coverUrl: 'https://picsum.photos/seed/m8/300/300', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
];

export const searchTracks = async (term: string, limit: number = 20): Promise<Song[]> => {
  const lowerTerm = term.toLowerCase();
  return MOCK_LIBRARY.filter(s =>
    s.title.toLowerCase().includes(lowerTerm) ||
    s.artist.toLowerCase().includes(lowerTerm)
  );
};

export const getTopCharts = async (): Promise<Song[]> => {
  // Shuffle mock library to simulate changing charts
  return [...MOCK_LIBRARY].sort(() => 0.5 - Math.random());
};

export const getStreamUrl = async (songId: string): Promise<string | null> => {
  const song = MOCK_LIBRARY.find(s => s.id === songId) || DEMO_SONGS.find(s => s.id === songId);
  return song?.streamUrl || null;
};

export const downloadSong = async (song: Song): Promise<boolean> => {
  return true; // Simple success for now
};
