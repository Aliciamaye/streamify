import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ActiveTheme = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    activeTheme: ActiveTheme;
    accentColor: string;
    setMode: (mode: ThemeMode) => void;
    setAccentColor: (color: string) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ACCENT_COLORS = [
    { name: 'Spotify Green', value: '#1ed760', class: 'accent-spotify' },
    { name: 'Crimson Red', value: '#ef4444', class: 'accent-red' },
    { name: 'Cyber Blue', value: '#3b82f6', class: 'accent-blue' },
    { name: 'Electric Purple', value: '#a855f7', class: 'accent-purple' },
    { name: 'Sunset Orange', value: '#f97316', class: 'accent-orange' },
    { name: 'Gold', value: '#eab308', class: 'accent-gold' },
    { name: 'Pink', value: '#ec4899', class: 'accent-pink' },
    { name: 'Teal', value: '#14b8a6', class: 'accent-teal' },
];

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mode, setModeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('streamify_theme_mode');
        return (saved as ThemeMode) || 'dark';
    });

    const [accentColor, setAccentColorState] = useState<string>(() => {
        return localStorage.getItem('streamify_accent_color') || '#1ed760';
    });

    const [activeTheme, setActiveTheme] = useState<ActiveTheme>('dark');

    // Detect system theme preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateActiveTheme = () => {
            if (mode === 'auto') {
                setActiveTheme(mediaQuery.matches ? 'dark' : 'light');
            } else {
                setActiveTheme(mode as ActiveTheme);
            }
        };

        updateActiveTheme();

        if (mode === 'auto') {
            mediaQuery.addEventListener('change', updateActiveTheme);
            return () => mediaQuery.removeEventListener('change', updateActiveTheme);
        }
    }, [mode]);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        // Remove all theme classes
        root.classList.remove('light', 'dark');

        // Add active theme class
        root.classList.add(activeTheme);

        // Set CSS variables
        root.style.setProperty('--accent-color', accentColor);
        root.style.setProperty('--dynamic-accent', accentColor);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', activeTheme === 'dark' ? '#000000' : '#ffffff');
        }
    }, [activeTheme, accentColor]);

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        localStorage.setItem('streamify_theme_mode', newMode);
    };

    const setAccentColor = (color: string) => {
        setAccentColorState(color);
        localStorage.setItem('streamify_accent_color', color);
    };

    const toggleTheme = () => {
        if (mode === 'auto') {
            setMode('dark');
        } else if (mode === 'dark') {
            setMode('light');
        } else {
            setMode('dark');
        }
    };

    return (
        <ThemeContext.Provider value={{
            mode,
            activeTheme,
            accentColor,
            setMode,
            setAccentColor,
            toggleTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
