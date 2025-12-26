export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: string;
  streamUrl?: string;
  isLoading?: boolean;
  isDownloaded?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songs: Song[];
  color: string;
  isGenerated?: boolean;
}

export type ViewState = 'home' | 'search' | 'library' | 'playlist' | 'lyrics' | 'settings' | 'ai-editor' | 'zen' | 'stats' | 'artist' | 'album';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  themeColor: string;
  audioQuality: 'low' | 'high';
  enableAnimations: boolean;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  type: 'song' | 'playlist';
  data: any;
}

export const THEME_COLORS = [
  { name: 'Spotify Green', value: '#1ed760', tailwind: 'text-[#1ed760]' },
  { name: 'Crimson Red', value: '#ef4444', tailwind: 'text-red-500' },
  { name: 'Cyber Blue', value: '#3b82f6', tailwind: 'text-blue-500' },
  { name: 'Electric Purple', value: '#a855f7', tailwind: 'text-purple-500' },
  { name: 'Sunset Orange', value: '#f97316', tailwind: 'text-orange-500' },
  { name: 'Gold', value: '#eab308', tailwind: 'text-yellow-500' },
  { name: 'Pink', value: '#ec4899', tailwind: 'text-pink-500' },
  { name: 'Teal', value: '#14b8a6', tailwind: 'text-teal-500' },
];
