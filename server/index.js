const express = require('express');
const cors = require('cors');
const { Innertube } = require('youtubei.js');
const { exec } = require('child_process');

const app = express();
const PORT = 3001;

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

let youtube;

(async () => {
    try {
        youtube = await Innertube.create({
            cache: false,
            generate_session_locally: true
        });
        console.log('✅ YouTube Music API ready!');
    } catch (error) {
        console.error('❌ Init failed:', error.message);
    }
})();

const cache = new Map();
const CACHE_TTL = { search: 5 * 60 * 1000, stream: 30 * 60 * 1000 };

function getCache(key) {
    const cached = cache.get(key);
    if (!cached || Date.now() > cached.expires) {
        cache.delete(key);
        return null;
    }
    return cached.data;
}

function setCache(key, data, ttl) {
    cache.set(key, { data, expires: Date.now() + ttl });
}

// IMPROVED: Better title/artist extraction
function formatSearchResponse(items) {
    if (!items || !Array.isArray(items)) return [];

    const formatted = [];

    for (const item of items) {
        try {
            // Get video ID
            const id = item.id || item.video_id || item.endpoint?.payload?.videoId;
            if (!id) continue;

            // IMPROVED: Better title extraction
            let title = 'Unknown';
            if (item.title) {
                if (typeof item.title === 'string') {
                    title = item.title;
                } else if (item.title.text) {
                    title = item.title.text;
                } else if (item.title.runs && item.title.runs.length > 0) {
                    title = item.title.runs.map(r => r.text).join('');
                }
            }

            // Try flex columns if title is still Unknown
            if (title === 'Unknown' && item.flex_columns && item.flex_columns[0]) {
                const titleRuns = item.flex_columns[0].music_responsive_list_item_flex_column_renderer?.text?.runs;
                if (titleRuns && titleRuns.length > 0) {
                    title = titleRuns.map(r => r.text).join('');
                }
            }

            // IMPROVED: Better artist extraction
            let artist = 'Unknown Artist';
            if (item.author?.name) {
                artist = item.author.name;
            } else if (item.artists && item.artists.length > 0) {
                artist = item.artists.map(a => a.name).join(', ');
            } else if (item.flex_columns && item.flex_columns[1]) {
                const artistRuns = item.flex_columns[1].music_responsive_list_item_flex_column_renderer?.text?.runs;
                if (artistRuns && artistRuns.length > 0) {
                    // First run is usually the artist
                    artist = artistRuns[0].text;
                }
            }

            // Duration
            const duration = item.duration?.seconds || 0;

            // Thumbnail - simplified and safer extraction
            let thumbnail = '';

            // Try to find the best thumbnail from the available array
            if (item.thumbnail?.thumbnails?.length) {
                // Get the largest one (usually last)
                thumbnail = item.thumbnail.thumbnails[item.thumbnail.thumbnails.length - 1].url;
            } else if (item.thumbnails?.length) {
                thumbnail = item.thumbnails[item.thumbnails.length - 1].url;
            }

            // Fallback to a guaranteed working placeholder if nothing found
            if (!thumbnail) {
                // Use a generic music placeholder instead of a broken YouTube URL
                thumbnail = 'https://via.placeholder.com/500x500/121212/1ed760?text=No+Cover';
            } else {
                // If it's a googleusercontent URL (common for YTM), it might be resized
                // We can try to request a larger size safely if it's small
                if (thumbnail.includes('googleusercontent.com') && (thumbnail.includes('=w60') || thumbnail.includes('=w120'))) {
                    // Replace size params with w544-h544 (standard high res)
                    thumbnail = thumbnail.replace(/=w\d+-h\d+/, '=w544-h544');
                }
            }
            console.log(`[Format] Thumbnail URL for ${title}: ${thumbnail}`);

            formatted.push({
                id,
                title,
                artist,
                duration,
                thumbnail,
                album: item.album?.name || 'YouTube Music'
            });

            console.log(`[Format] ✓ ${title} - ${artist}`);
        } catch (e) {
            console.error('[Format] Error:', e.message);
        }
    }

    return formatted;
}

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '3.5-improved',
        youtubeReady: !!youtube
    });
});

app.get('/api/search', async (req, res) => {
    const { q, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    const cacheKey = `search:${q}:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ songs: cached, cached: true });

    try {
        console.log(`\n[Search] "${q}"`);

        if (!youtube) {
            throw new Error('YouTube not ready');
        }

        const searchResults = await youtube.music.search(q, { type: 'song' });

        let items = [];
        if (searchResults.contents && Array.isArray(searchResults.contents)) {
            for (const shelf of searchResults.contents) {
                if (shelf.contents && Array.isArray(shelf.contents)) {
                    items.push(...shelf.contents);
                }
            }
        } else if (Array.isArray(searchResults)) {
            items = searchResults;
        }

        console.log(`[Search] Found ${items.length} items`);

        const songs = formatSearchResponse(items).slice(0, parseInt(limit));

        console.log(`[Search] ✓ Formatted ${songs.length} songs\n`);

        setCache(cacheKey, songs, CACHE_TTL.search);
        res.json({ songs, cached: false });
    } catch (error) {
        console.error('[Search] Error:', error.message);
        res.json({ songs: [], error: error.message });
    }
});

// Charts/Trending Endpoint
app.get('/api/charts', async (req, res) => {
    const { limit = 20 } = req.query;
    const cacheKey = `charts:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ songs: cached, cached: true });

    try {
        console.log('[Charts] Fetching trending songs');

        if (!youtube) {
            throw new Error('YouTube not ready');
        }

        // Get trending music
        const trending = await youtube.music.getHome();
        let items = [];

        // Extract songs from trending sections
        if (trending.contents) {
            for (const section of trending.contents) {
                if (section.contents && Array.isArray(section.contents)) {
                    items.push(...section.contents);
                    if (items.length >= limit) break;
                }
            }
        }

        const songs = formatSearchResponse(items).slice(0, parseInt(limit));
        console.log(`[Charts] Returning ${songs.length} trending songs`);

        setCache(cacheKey, songs, CACHE_TTL.search);
        res.json({ songs, cached: false });
    } catch (error) {
        console.error('[Charts] Error:', error.message);
        // Return empty array on error
        res.json({ songs: [], error: error.message });
    }
});

// Stream Proxy Endpoint - ROBUST yt-dlp PIPE
app.get('/api/stream/:videoId', (req, res) => {
    const { videoId } = req.params;
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
    }

    console.log(`[Stream] Proxying via yt-dlp: ${videoId}`);

    // Explicitly set CORS and Content headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'audio/mp4'); // We will force m4a
    // Don't set Content-Length as we're streaming chunked

    // Spawn yt-dlp to stream data to stdout
    const ytDlp = require('child_process').spawn('yt-dlp', [
        `https://www.youtube.com/watch?v=${videoId}`,
        '-f', 'bestaudio[ext=m4a]/bestaudio', // Prefer m4a for better compatibility
        '-o', '-',         // Output to stdout
        '--no-warnings',
        '--no-check-certificates'
    ]);

    // Handle errors during spawn or execution
    ytDlp.on('error', (err) => {
        console.error(`[Stream] Failed to start yt-dlp process: ${err.message}`);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to start streaming process. Is yt-dlp installed and in PATH?' });
        } else {
            // If headers were already sent, we can't send a JSON error, just end the stream with an error.
            res.end();
        }
    });

    // Pipe yt-dlp stdout directly to response
    ytDlp.stdout.pipe(res);

    // Handle errors
    ytDlp.stderr.on('data', (data) => {
        // Log stderr but don't break response unless it's fatal
        const msg = data.toString();
        // Ignore progress indicators
        if (!msg.includes('[download]') && !msg.includes('ETA')) {
            console.error(`[Stream] yt-dlp stderr: ${msg.trim()}`);
            // If we haven't sent headers yet, we could theoretically send an error JSON
            // potentially, but piping might have started.
        }
    });

    ytDlp.on('close', (code) => {
        if (code !== 0) {
            console.log(`[Stream] yt-dlp exited with code ${code}`);
            if (!res.headersSent) {
                res.status(500).end();
            }
        } else {
            console.log(`[Stream] Finished: ${videoId}`);
            res.end();
        }
    });

    // Handle client disconnect - kill yt-dlp process
    req.on('close', () => {
        if (!ytDlp.killed) {
            console.log(`[Stream] Client disconnected, killing yt-dlp`);
            ytDlp.kill();
        }
    });
});

// Stream URL Endpoint - Returns the proxy URL
// Frontend calls this to get the URL to put in <audio src="...">
app.get('/api/stream-url/:videoId', (req, res) => {
    const { videoId } = req.params;
    // Return the URL that points to our own proxy
    const streamUrl = `http://localhost:${PORT}/api/stream/${videoId}`;
    res.json({
        streamUrl,
        cached: false
    });
});

app.listen(PORT, () => {
    console.log(`\n🎵 Streamify Server v4.0 (Streaming Proxy)`);
    console.log(`📡 http://localhost:${PORT}`);
    console.log(`✨ YouTube Search & Audio Proxy Active!\n`);
});
