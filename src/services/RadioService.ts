import { GoogleGenAI } from "@google/genai";
import { Song } from "../types";
import { musicEngine } from "./MusicEngine";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class RadioService {
    private static instance: RadioService;
    private isGenerating: boolean = false;
    private recommendationQueue: Song[] = [];

    private constructor() { }

    static getInstance(): RadioService {
        if (!RadioService.instance) {
            RadioService.instance = new RadioService();
        }
        return RadioService.instance;
    }

    async generateRecommendations(baseSong: Song): Promise<Song[]> {
        if (this.isGenerating) return [];
        this.isGenerating = true;

        try {
            console.log(`[RadioService] Generating recommendations for: ${baseSong.title}`);

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Based on the song "${baseSong.title}" by "${baseSong.artist}", generate 5 search queries for similar songs. 
        Consider genre, mood, tempo, and artist style. Return ONLY the search queries as a JSON array of strings.
        Example: ["artist name - song", "similar artist - song", ...]`,
            });

            const text = response.text || "[]";
            // Try to extract JSON array from response
            const match = text.match(/\[.*\]/s);
            const searchTerms: string[] = match ? JSON.parse(match[0]) : [];

            console.log(`[RadioService] Generated search terms:`, searchTerms);

            // Search for each term and collect results
            const recommendations: Song[] = [];
            for (const term of searchTerms.slice(0, 5)) {
                try {
                    const results = await musicEngine.search(term);
                    if (results.length > 0) {
                        // Add the first result that's not already in queue
                        const newSong = results.find(s =>
                            s.id !== baseSong.id &&
                            !recommendations.some(r => r.id === s.id)
                        );
                        if (newSong) {
                            recommendations.push(newSong);
                        }
                    }
                } catch (e) {
                    console.error(`[RadioService] Search failed for: ${term}`, e);
                }
            }

            this.recommendationQueue = recommendations;
            return recommendations;

        } catch (error) {
            console.error('[RadioService] Failed to generate recommendations:', error);
            return [];
        } finally {
            this.isGenerating = false;
        }
    }

    getQueuedRecommendations(): Song[] {
        return [...this.recommendationQueue];
    }

    clearQueue() {
        this.recommendationQueue = [];
    }
}

export const radioService = RadioService.getInstance();
