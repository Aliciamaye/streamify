import { StreamSource } from './StreamSource';
import { Song } from '../../types';

export class LocalSource implements StreamSource {
    private static instance: LocalSource;
    private localFiles: Map<string, File> = new Map();

    private constructor() { }

    static getInstance(): LocalSource {
        if (!LocalSource.instance) {
            LocalSource.instance = new LocalSource();
        }
        return LocalSource.instance;
    }

    // Helper to add files from Drag & Drop
    addFile(file: File): Song {
        const id = `local-${Date.now()}-${file.name}`;
        this.localFiles.set(id, file);

        return {
            id,
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: 'Local File',
            album: 'My Computer',
            duration: '?', // Parsing metadata requires a library like 'music-metadata-browser', skipping for now
            coverUrl: 'https://lucide.dev/icons/music', // Placeholder
            streamUrl: '' // Will be generated on demand
        };
    }

    async search(query: string): Promise<Song[]> {
        // Search within added local files
        const lower = query.toLowerCase();
        const results: Song[] = [];

        this.localFiles.forEach((file, id) => {
            if (file.name.toLowerCase().includes(lower)) {
                results.push({
                    id,
                    title: file.name,
                    artist: 'Local File',
                    album: 'My Computer',
                    duration: '?',
                    coverUrl: 'https://lucide.dev/icons/music',
                    streamUrl: ''
                });
            }
        });

        return results;
    }

    async getStreamUrl(songId: string): Promise<string | null> {
        const file = this.localFiles.get(songId);
        if (!file) return null;
        return URL.createObjectURL(file);
    }

    async getRecommendations(): Promise<Song[]> {
        return [];
    }

    async getCharts(): Promise<Song[]> {
        return [];
    }
}
