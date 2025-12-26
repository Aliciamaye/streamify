import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Image as ImageIcon, Loader2, ArrowLeft, Download, RefreshCw, Save } from 'lucide-react';
import { editPlaylistCover } from '../services/geminiService';
import { Playlist } from '../types';

interface AIImageEditorProps {
  initialImage?: string;
  targetPlaylist?: Playlist | null;
  onBack: () => void;
  onSave: (newUrl: string) => void;
}

export const AIImageEditor: React.FC<AIImageEditorProps> = ({ initialImage, targetPlaylist, onBack, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(initialImage || null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If we have a playlist, use its cover as initial image if no other image provided
  useEffect(() => {
    if (!currentImage && targetPlaylist) {
      // Need to fetch and convert to base64 if it's a URL, or just use it if we can
      // For this demo, we'll try to use the URL directly, but Gemini needs Base64.
      // We will assume the user uploads an image for the best experience or uses the demo logic below.
      // In a real app, we'd fetch the image blob and convert.
    }
  }, [targetPlaylist, currentImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!currentImage) {
      setError("Please upload a starting image first.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a text prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extract Base64 data (remove "data:image/png;base64," prefix)
      const base64Data = currentImage.split(',')[1];
      const mimeType = currentImage.split(';')[0].split(':')[1];

      const result = await editPlaylistCover(base64Data, prompt, mimeType);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#121212] overflow-auto pb-32 flex flex-col items-center pt-8">
      <div className="w-full max-w-4xl px-8">
        <button 
          onClick={onBack}
          className="flex items-center text-[#b3b3b3] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to library
        </button>

        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-1 border border-white/10">
          <div className="bg-[#181818] rounded-xl p-8">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Studio</h2>
                <p className="text-[#b3b3b3]">Edit your playlist covers with natural language using Gemini 2.5 Flash.</p>
              </div>
            </div>

            {targetPlaylist && (
               <div className="mb-6 p-4 bg-[#282828] rounded-lg flex items-center gap-4">
                  <span className="text-sm text-[#b3b3b3]">Editing cover for:</span>
                  <span className="font-bold">{targetPlaylist.name}</span>
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Input Section */}
              <div className="space-y-6">
                
                {/* Image Uploader */}
                <div className="space-y-2">
                   <label className="text-sm font-semibold text-[#e0e0e0]">1. Source Image</label>
                   <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#444] hover:border-white transition-colors rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative bg-[#121212]"
                   >
                     {currentImage ? (
                       <img src={currentImage} alt="Source" className="w-full h-full object-contain" />
                     ) : (
                       <div className="flex flex-col items-center text-[#b3b3b3]">
                         <ImageIcon className="w-10 h-10 mb-2" />
                         <span className="font-medium">Click to upload image</span>
                       </div>
                     )}
                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       className="hidden" 
                       accept="image/*"
                       onChange={handleFileChange}
                     />
                   </div>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#e0e0e0]">2. Describe changes</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Make it look like a 1980s retro poster', 'Add neon lights in the background', 'Turn it into an oil painting'"
                    className="w-full bg-[#2a2a2a] border border-transparent focus:border-green-500 rounded-lg p-4 text-white placeholder-[#777] outline-none h-32 resize-none transition-all"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !currentImage || !prompt}
                  className={`w-full py-3 rounded-full font-bold text-black transition-all flex items-center justify-center gap-2
                    ${isLoading || !currentImage || !prompt 
                      ? 'bg-[#555] cursor-not-allowed' 
                      : 'bg-[#1ed760] hover:scale-105'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate with Gemini
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="text-red-400 text-sm text-center">{error}</div>
                )}
              </div>

              {/* Output Section */}
              <div className="space-y-2">
                 <label className="text-sm font-semibold text-[#e0e0e0]">3. Result</label>
                 <div className="border border-[#333] rounded-xl h-[500px] bg-[#000] flex items-center justify-center overflow-hidden relative">
                   {generatedImage ? (
                     <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                   ) : (
                     <div className="text-[#444] flex flex-col items-center">
                       <Wand2 className="w-12 h-12 mb-2 opacity-20" />
                       <span>AI Output will appear here</span>
                     </div>
                   )}
                 </div>
                 
                 {generatedImage && (
                   <div className="flex gap-4 mt-4">
                     <button 
                       onClick={() => onSave(generatedImage)}
                       className="flex-1 bg-white text-black py-2 rounded-full font-bold hover:bg-[#f0f0f0] transition-colors flex items-center justify-center gap-2"
                     >
                       <Save className="w-4 h-4" />
                       Save to Playlist
                     </button>
                     <button 
                       onClick={() => setGeneratedImage(null)}
                       className="bg-[#2a2a2a] text-white p-2 rounded-full hover:bg-[#333] transition-colors"
                       title="Discard"
                     >
                       <RefreshCw className="w-5 h-5" />
                     </button>
                   </div>
                 )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};