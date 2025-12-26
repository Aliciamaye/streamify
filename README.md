# Streamify 🎵

> A modern, feature-rich music streaming application built with React, TypeScript, and Supabase.

![Streamify Banner](https://via.placeholder.com/1200x400/1ed760/000000?text=Streamify+-+Your+Music,+Everywhere)

## ✨ Features

### 🎧 Core Music Features
- **YouTube Music Integration** - Stream millions of songs
- **Advanced Audio Engine** - Web Audio API with EQ, crossfade, gapless playback
- **Smart Queue Management** - Drag-and-drop, save queues, shuffle modes
- **AI-Powered Radio** - Intelligent recommendations using Google Gemini
- **Offline Support** - PWA with service worker caching

### 🎨 User Experience
- **Beautiful UI** - Spotify-inspired design with dark/light themes
- **8 Accent Colors** - Customize your experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Audio Visualizer** - 4 visualization modes (bars, waveform, circle, particles)
- **Synced Lyrics** - LRC format support with auto-scroll

### 🔐 Authentication & Data
- **Supabase Auth** - Email verification, secure JWT tokens
- **Cloud Sync** - Playlists, likes, and history across devices
- **GitHub Backups** - Automatic daily backups to private repo
- **Privacy First** - Row-level security, encrypted data

### ⚡ Advanced Features
- **Equalizer Presets** - 8 professional audio profiles
- **Crossfade** - Smooth transitions between songs
- **Gapless Playback** - Seamless album listening
- **Sleep Timer** - Auto-pause with fade-out
- **Download Manager** - Offline playback support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- yt-dlp installed and in PATH
- Supabase account (free tier works!)

### Installation

```bash
# Clone the repository
git clone https://github.com/Aliciamaye/streamify.git
cd streamify

# Install dependencies
npm install
cd server && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database migrations
# Copy contents of supabase-schema.sql to Supabase SQL Editor and run

# Start development servers
npm run dev          # Frontend (port 3000)
npm run server       # Backend (port 3001)
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
streamify/
├── src/
│   ├── components/       # React components
│   ├── services/         # Business logic
│   │   ├── MusicEngine.ts
│   │   ├── RadioService.ts
│   │   └── sources/
│   ├── context/          # React contexts
│   ├── lib/              # Utilities
│   └── constants/        # App constants
├── server/               # Express backend
│   └── index.js         # YouTube proxy server
├── public/              # Static assets
└── supabase-schema.sql  # Database schema
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Express.js** - API server
- **youtubei.js** - YouTube Music API
- **yt-dlp** - Audio stream extraction
- **Supabase** - Database & Auth

### Infrastructure
- **Supabase** - PostgreSQL database with RLS
- **GitHub** - Version control & backups
- **Vercel/Netlify** - Deployment (recommended)

## 🎯 Key Features Explained

### Audio Streaming
The app uses a hybrid approach:
1. **Search**: `youtubei.js` for YouTube Music search
2. **Streaming**: `yt-dlp` proxy for high-quality audio
3. **Playback**: Web Audio API for advanced features

### Authentication Flow
1. User signs up with email
2. Supabase sends verification email
3. User clicks link to verify
4. JWT token stored securely
5. Auto-refresh on expiry

### Data Sync
- **Live**: Supabase real-time subscriptions
- **Backup**: Daily GitHub commits (encrypted)
- **Offline**: IndexedDB cache with service worker

## 📱 PWA Support

Install Streamify as a standalone app:
1. Visit the site in Chrome/Edge
2. Click "Install" in address bar
3. Enjoy native-like experience!

## 🔒 Security

- ✅ Row-level security (RLS) on all tables
- ✅ JWT-based authentication
- ✅ CORS protection
- ✅ Rate limiting (60 req/min)
- ✅ Environment variables for secrets
- ✅ No API keys in client code

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- **YouTube Music** - Music catalog
- **Supabase** - Backend infrastructure
- **yt-dlp** - Audio extraction
- **Google Gemini** - AI recommendations

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Aliciamaye/streamify/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Aliciamaye/streamify/discussions)

---

**Made with ❤️ by Alicia**

*Streamify is not affiliated with YouTube, Spotify, or any music streaming service.*
