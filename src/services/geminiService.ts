import { GoogleGenAI, Type } from "@google/genai";
import { searchTracks } from "./musicService";
import { Song, Playlist } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editPlaylistCover = async (base64Image: string, prompt: string, mimeType: string = 'image/png'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generatePlaylistFromMood = async (mood: string): Promise<Partial<Playlist>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a playlist name, a short description, and a list of 5 search terms for songs that fit the mood: "${mood}". 
    Return JSON structure: { "name": string, "description": string, "searchTerms": string[] }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          searchTerms: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  // Actually fetch songs for these terms
  const songs: Song[] = [];
  for (const term of data.searchTerms || []) {
    const results = await searchTracks(term, 1);
    if (results.length > 0) songs.push(results[0]);
  }

  return {
    id: `gen-${Date.now()}`,
    name: data.name,
    description: data.description,
    songs: songs,
    coverUrl: songs[0]?.coverUrl || 'https://picsum.photos/500/500', // Fallback cover
    color: 'from-purple-900'
  };
};

export const getLyrics = async (songTitle: string, artist: string): Promise<string> => {
  // Quick fake lyrics generator since real lyrics APIs are expensive/restricted
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 4 lines of lyrics that sound like they belong to the song "${songTitle}" by "${artist}". return just plain text.`,
  });
  return response.text || "Lyrics not available.";
};