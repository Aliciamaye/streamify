import React, { useEffect, useRef } from 'react';
import { Song } from '../types';
import { musicEngine } from '../services/MusicEngine';

interface LyricsViewProps {
  song: Song;
  lyrics: string; // Plain text or JSON
}

export const LyricsView: React.FC<LyricsViewProps> = ({ song, lyrics }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock Lyrics if none provided
  const displayLyrics = lyrics || `
[00:10.00] (Instrumental Intro)
[00:15.00] 🎵 Music is playing...
[00:20.00] This is a mock lyrics display
[00:25.00] Because we don't have a real lyrics API yet
[00:30.00] But it demonstrates the UI perfectly!
[00:35.00] 
[00:40.00] Imagine your favorite song words here
[00:45.00] Scrolling smoothly...
[00:50.00] In time with the beat.
[00:55.00] 
[01:00.00] (Guitar Solo)
`;

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-900/40 to-black overflow-y-auto p-8 pb-40 text-center animate-fade-in" ref={containerRef}>
      <div className="max-w-2xl mx-auto">
        <img src={song.coverUrl} className="w-40 h-40 rounded-lg shadow-2xl mx-auto mb-8" />
        <h2 className="text-2xl font-bold text-white mb-2">{song.title}</h2>
        <p className="text-white/60 mb-12">{song.artist}</p>

        <div className="space-y-6 text-xl md:text-2xl font-bold text-white/50 leading-relaxed font-sans">
          {displayLyrics.split('\n').map((line, i) => {
            const isCurrent = i === 3; // Mock active line
            return (
              <div key={i} className={`transition-all duration-500 transform ${isCurrent ? 'text-white scale-110' : 'hover:text-white/80'}`}>
                {line.replace(/\[.*?\]/, '').trim()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
