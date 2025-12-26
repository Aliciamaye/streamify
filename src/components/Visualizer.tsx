import React, { useEffect, useRef, useState } from 'react';
import { musicEngine } from '../services/MusicEngine';
import { Maximize2, Minimize2 } from 'lucide-react';

interface VisualizerProps {
  isPlaying: boolean;
  accentColor?: string;
}

type VisualizerMode = 'bars' | 'waveform' | 'circle' | 'particles';

export const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, accentColor = '#1ed760' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bufferLength = mode === 'waveform' ? 128 : 64;
    const dataArray = new Uint8Array(bufferLength);

    // Initialize particles for particle mode
    if (mode === 'particles' && particlesRef.current.length === 0) {
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1
        });
      }
    }

    const render = () => {
      // Get audio data
      if (isPlaying) {
        if (mode === 'waveform') {
          musicEngine.getWaveformData(dataArray);
        } else {
          musicEngine.getAudioData(dataArray);
        }
      } else {
        dataArray.fill(128); // Neutral for waveform, 0 for frequency
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      switch (mode) {
        case 'bars':
          renderBars(ctx, canvas, dataArray, bufferLength, accentColor);
          break;
        case 'waveform':
          renderWaveform(ctx, canvas, dataArray, bufferLength, accentColor);
          break;
        case 'circle':
          renderCircle(ctx, canvas, dataArray, bufferLength, accentColor);
          break;
        case 'particles':
          renderParticles(ctx, canvas, dataArray, bufferLength, accentColor, particlesRef.current);
          break;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, mode, accentColor]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const cycleMode = () => {
    const modes: VisualizerMode[] = ['bars', 'waveform', 'circle', 'particles'];
    const currentIndex = modes.indexOf(mode);
    setMode(modes[(currentIndex + 1) % modes.length]);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black flex items-center justify-center' : ''}`}>
      <canvas
        ref={canvasRef}
        width={isFullscreen ? 1920 : 240}
        height={isFullscreen ? 1080 : 40}
        className={`${isFullscreen ? 'w-full h-full' : 'hidden md:block'} opacity-80 cursor-pointer`}
        onClick={cycleMode}
      />
      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-1 right-1 p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Maximize2 size={12} />
        </button>
      )}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded"
        >
          <Minimize2 size={24} />
        </button>
      )}
    </div>
  );
};

// Rendering functions
function renderBars(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dataArray: Uint8Array,
  bufferLength: number,
  accentColor: string
) {
  const barWidth = (canvas.width / bufferLength) * 2.5;
  let x = 0;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, accentColor);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * canvas.height;
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

function renderWaveform(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dataArray: Uint8Array,
  bufferLength: number,
  accentColor: string
) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = accentColor;
  ctx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

function renderCircle(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dataArray: Uint8Array,
  bufferLength: number,
  accentColor: string
) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) / 3;

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < bufferLength; i++) {
    const angle = (i / bufferLength) * Math.PI * 2;
    const amplitude = (dataArray[i] / 255) * radius * 0.5;
    const x = centerX + Math.cos(angle) * (radius + amplitude);
    const y = centerY + Math.sin(angle) * (radius + amplitude);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.stroke();
}

function renderParticles(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dataArray: Uint8Array,
  bufferLength: number,
  accentColor: string,
  particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }>
) {
  // Calculate average amplitude
  const avg = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
  const intensity = avg / 255;

  ctx.fillStyle = accentColor;

  particles.forEach((particle, index) => {
    // Update position
    particle.x += particle.vx * (1 + intensity * 2);
    particle.y += particle.vy * (1 + intensity * 2);

    // Bounce off edges
    if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

    // Keep in bounds
    particle.x = Math.max(0, Math.min(canvas.width, particle.x));
    particle.y = Math.max(0, Math.min(canvas.height, particle.y));

    // Draw particle
    const size = particle.size * (1 + intensity);
    ctx.globalAlpha = 0.6 + intensity * 0.4;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
}
