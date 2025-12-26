import { Song } from '../../types';
import { PipedSource } from './PipedSource';
import { InvidiousSource } from './InvidiousSource';
import { YouTubeSource } from './YouTubeSource';
import { SoundCloudSource } from './SoundCloudSource';
import { EmbeddedSource } from './EmbeddedSource';

type SourceType = 'piped' | 'invidious' | 'youtube' | 'soundcloud' | 'embedded';

export class SourceRouter {
    private static instance: SourceRouter;

    private pipedSource: PipedSource;
    private invidiousSource: InvidiousSource;
    private youtubeSource: YouTubeSource;
    private soundcloudSource: SoundCloudSource;
    private embeddedSource: EmbeddedSource;

    private preferredSource: SourceType = 'piped';
    private sourcePerformance: Map<SourceType, number> = new Map();

    private constructor() {
        this.pipedSource = PipedSource.getInstance();
        this.invidiousSource = InvidiousSource.getInstance();
        this.youtubeSource = YouTubeSource.getInstance();
        this.soundcloudSource = SoundCloudSource.getInstance();
        this.embeddedSource = EmbeddedSource.getInstance();

        // Init performance tracking
        this.sourcePerformance.set('piped', 100);
        this.sourcePerformance.set('invidious', 80);
        this.sourcePerformance.set('youtube', 60);
        this.sourcePerformance.set('soundcloud', 70);
        this.sourcePerformance.set('embedded', 90);
    }

    static getInstance(): SourceRouter {
        if (!SourceRouter.instance) {
            SourceRouter.instance = new SourceRouter();
        }
        return SourceRouter.instance;
    }

    async search(query: string, limit: number = 20): Promise<Song[]> {
        console.log(`[SourceRouter] Searching: "${query}"`);

        // Try Piped first (fastest)
        try {
            const start = Date.now();
            const results = await this.pipedSource.search(query, limit);
            this.updatePerformance('piped', Date.now() - start);

            if (results.length > 0) {
                console.log(`[SourceRouter] ✓ Piped returned ${results.length} results`);
                return results;
            }
        } catch (error) {
            console.warn('[SourceRouter] Piped failed:', error);
            this.penalizeSource('piped');
        }

        // Try Invidious
        try {
            const start = Date.now();
            const results = await this.invidiousSource.search(query, limit);
            this.updatePerformance('invidious', Date.now() - start);

            if (results.length > 0) {
                console.log(`[SourceRouter] ✓ Invidious returned ${results.length} results`);
                return results;
            }
        } catch (error) {
            console.warn('[SourceRouter] Invidious failed:', error);
            this.penalizeSource('invidious');
        }

        // Try YouTube (backend)
        try {
            const start = Date.now();
            const results = await this.youtubeSource.search(query, limit);
            this.updatePerformance('youtube', Date.now() - start);

            if (results.length > 0) {
                console.log(`[SourceRouter] ✓ YouTube returned ${results.length} results`);
                return results;
            }
        } catch (error) {
            console.warn('[SourceRouter] YouTube failed:', error);
            this.penalizeSource('youtube');
        }

        // Fallback to embedded
        console.log('[SourceRouter] All sources failed, using embedded music');
        return this.embeddedSource.search(query, limit);
    }

    async getStreamUrl(song: Song): Promise<string> {
        const source = song.source || this.preferredSource;

        console.log(`[SourceRouter] Getting stream for "${song.title}" from ${source}`);

        // Try the song's original source first
        try {
            const url = await this.getStreamFromSource(source, song.id);
            if (url) {
                console.log(`[SourceRouter] ✓ Got stream from ${source}`);
                return url;
            }
        } catch (error) {
            console.warn(`[SourceRouter] ${source} failed:`, error);
            this.penalizeSource(source);
        }

        // Fallback chain
        const fallbackOrder: SourceType[] = ['piped', 'invidious', 'youtube'];

        for (const fallbackSource of fallbackOrder) {
            if (fallbackSource === source) continue; // Skip already tried

            try {
                const url = await this.getStreamFromSource(fallbackSource, song.id);
                if (url) {
                    console.log(`[SourceRouter] ✓ Got stream from fallback ${fallbackSource}`);
                    return url;
                }
            } catch (error) {
                console.warn(`[SourceRouter] Fallback ${fallbackSource} failed:`, error);
            }
        }

        throw new Error('All sources failed to get stream URL');
    }

    private async getStreamFromSource(source: SourceType, id: string): Promise<string> {
        switch (source) {
            case 'piped':
                return await this.pipedSource.getStreamUrl(id);
            case 'invidious':
                return await this.invidiousSource.getStreamUrl(id);
            case 'youtube':
                return await this.youtubeSource.getStreamUrl(id);
            case 'soundcloud':
                return await this.soundcloudSource.getStreamUrl(id);
            case 'embedded':
                return await this.embeddedSource.getStreamUrl(id);
            default:
                throw new Error(`Unknown source: ${source}`);
        }
    }

    private updatePerformance(source: SourceType, responseTime: number) {
        // Lower response time = better performance
        const score = Math.max(10, 100 - (responseTime / 100));
        this.sourcePerformance.set(source, score);
    }

    private penalizeSource(source: SourceType) {
        const current = this.sourcePerformance.get(source) || 50;
        this.sourcePerformance.set(source, Math.max(10, current - 20));
    }

    getSourceStats(): Record<SourceType, number> {
        return {
            piped: this.sourcePerformance.get('piped') || 0,
            invidious: this.sourcePerformance.get('invidious') || 0,
            youtube: this.sourcePerformance.get('youtube') || 0,
            soundcloud: this.sourcePerformance.get('soundcloud') || 0,
            embedded: this.sourcePerformance.get('embedded') || 0,
        };
    }
}
