export interface LyricLine {
    time: number; // in seconds
    text: string;
}

export interface ParsedLyrics {
    lines: LyricLine[];
    metadata: {
        title?: string;
        artist?: string;
        album?: string;
    };
}

export class LyricsParser {
    /**
     * Parse LRC format lyrics
     * Format: [mm:ss.xx] Lyric text
     * Metadata: [ti:title] [ar:artist] [al:album]
     */
    static parseLRC(lrcContent: string): ParsedLyrics {
        const lines: LyricLine[] = [];
        const metadata: ParsedLyrics['metadata'] = {};

        const lrcLines = lrcContent.split('\n');

        for (const line of lrcLines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Check for metadata tags
            const metaMatch = trimmed.match(/\[(\w+):(.+)\]/);
            if (metaMatch) {
                const [, tag, value] = metaMatch;
                switch (tag.toLowerCase()) {
                    case 'ti':
                        metadata.title = value.trim();
                        break;
                    case 'ar':
                        metadata.artist = value.trim();
                        break;
                    case 'al':
                        metadata.album = value.trim();
                        break;
                }
                continue;
            }

            // Parse timestamp and lyric
            const lyricMatch = trimmed.match(/\[(\d+):(\d+)\.?(\d+)?\](.+)/);
            if (lyricMatch) {
                const [, minutes, seconds, centiseconds, text] = lyricMatch;
                const time =
                    parseInt(minutes) * 60 +
                    parseInt(seconds) +
                    (centiseconds ? parseInt(centiseconds) / 100 : 0);

                lines.push({
                    time,
                    text: text.trim()
                });
            }
        }

        // Sort by time
        lines.sort((a, b) => a.time - b.time);

        return { lines, metadata };
    }

    /**
     * Find the current lyric line index based on current time
     */
    static getCurrentLineIndex(lyrics: LyricLine[], currentTime: number): number {
        if (lyrics.length === 0) return -1;

        for (let i = lyrics.length - 1; i >= 0; i--) {
            if (currentTime >= lyrics[i].time) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Convert plain text to simple lyric lines (no timestamps)
     */
    static parseSimpleText(text: string): ParsedLyrics {
        const lines = text.split('\n')
            .filter(line => line.trim())
            .map((line, index) => ({
                time: index * 3, // Rough estimate: 3 seconds per line
                text: line.trim()
            }));

        return { lines, metadata: {} };
    }
}
