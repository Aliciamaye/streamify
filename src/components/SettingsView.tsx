import React, { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Palette, Music, Volume2, Clock, Radio, Zap, Download } from 'lucide-react';
import { useTheme, ACCENT_COLORS } from '../context/ThemeContext';
import { useMusicEngine } from '../hooks/useMusicEngine';
import { EQ_PRESETS } from '../services/MusicEngine';

interface SettingsViewProps {
  onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onClose }) => {
  const { mode, activeTheme, accentColor, setMode, setAccentColor, toggleTheme } = useTheme();
  const {
    eqPreset,
    applyEQPreset,
    gaplessEnabled,
    setGaplessEnabled,
    crossfadeDuration,
    setCrossfadeDuration,
    radioMode,
    setRadioMode,
  } = useMusicEngine();

  const [selectedTab, setSelectedTab] = useState<'appearance' | 'playback' | 'audio'>('appearance');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings size={32} className="text-accent" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[var(--border-primary)]">
          <button
            onClick={() => setSelectedTab('appearance')}
            className={`px-6 py-3 font-semibold transition-all ${selectedTab === 'appearance'
                ? 'text-accent border-b-2 border-accent'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
          >
            <Palette size={18} className="inline mr-2" />
            Appearance
          </button>
          <button
            onClick={() => setSelectedTab('playback')}
            className={`px-6 py-3 font-semibold transition-all ${selectedTab === 'playback'
                ? 'text-accent border-b-2 border-accent'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
          >
            <Music size={18} className="inline mr-2" />
            Playback
          </button>
          <button
            onClick={() => setSelectedTab('audio')}
            className={`px-6 py-3 font-semibold transition-all ${selectedTab === 'audio'
                ? 'text-accent border-b-2 border-accent'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
          >
            <Volume2 size={18} className="inline mr-2" />
            Audio
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Appearance Tab */}
          {selectedTab === 'appearance' && (
            <>
              {/* Theme Mode */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Monitor size={20} />
                  Theme Mode
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setMode('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${mode === 'dark'
                        ? 'border-accent bg-[var(--bg-hover)]'
                        : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'
                      }`}
                  >
                    <Moon size={24} className="mx-auto mb-2" />
                    <div className="font-semibold">Dark</div>
                  </button>
                  <button
                    onClick={() => setMode('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${mode === 'light'
                        ? 'border-accent bg-[var(--bg-hover)]'
                        : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'
                      }`}
                  >
                    <Sun size={24} className="mx-auto mb-2" />
                    <div className="font-semibold">Light</div>
                  </button>
                  <button
                    onClick={() => setMode('auto')}
                    className={`p-4 rounded-lg border-2 transition-all ${mode === 'auto'
                        ? 'border-accent bg-[var(--bg-hover)]'
                        : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'
                      }`}
                  >
                    <Monitor size={24} className="mx-auto mb-2" />
                    <div className="font-semibold">Auto</div>
                  </button>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-3">
                  Current: <span className="font-semibold capitalize">{activeTheme}</span>
                </p>
              </div>

              {/* Accent Color */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Palette size={20} />
                  Accent Color
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAccentColor(color.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${accentColor === color.value
                          ? 'border-accent scale-105'
                          : 'border-[var(--border-primary)] hover:scale-105'
                        }`}
                      style={{ borderColor: accentColor === color.value ? color.value : undefined }}
                    >
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="text-xs font-semibold text-center">{color.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Playback Tab */}
          {selectedTab === 'playback' && (
            <>
              {/* Gapless Playback */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Zap size={20} />
                      Gapless Playback
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      Eliminate silence between tracks for seamless listening
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gaplessEnabled}
                      onChange={(e) => setGaplessEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-[var(--bg-hover)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              </div>

              {/* Crossfade */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Music size={20} />
                  Crossfade Duration
                </h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={crossfadeDuration}
                    onChange={(e) => setCrossfadeDuration(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                    <span>Off</span>
                    <span className="font-semibold text-accent">{crossfadeDuration}s</span>
                    <span>10s</span>
                  </div>
                </div>
              </div>

              {/* Radio Mode */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Radio size={20} />
                      Radio Mode
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      AI-powered endless music recommendations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={radioMode}
                      onChange={(e) => setRadioMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-[var(--bg-hover)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Audio Tab */}
          {selectedTab === 'audio' && (
            <>
              {/* EQ Presets */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Volume2 size={20} />
                  Equalizer Presets
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(EQ_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => applyEQPreset(key)}
                      className={`p-4 rounded-lg border-2 transition-all ${eqPreset === key
                          ? 'border-accent bg-[var(--bg-hover)]'
                          : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'
                        }`}
                    >
                      <div className="font-semibold">{preset.name}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        B:{preset.bass} M:{preset.mid} T:{preset.treble}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Quality Info */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Download size={20} />
                  Audio Quality
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Streaming quality is automatically optimized based on your connection.
                  Using best available audio format from YouTube Music.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-6 border-t border-[var(--border-primary)] text-center text-sm text-[var(--text-secondary)]">
          <p>Streamify v3.0 Enhanced</p>
          <p className="mt-1">Powered by YouTube Music, Gemini AI, and yt-dlp</p>
        </div>
      </div>
    </div>
  );
};
