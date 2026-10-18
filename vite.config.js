import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Vite Plugin for Local MP3 Folder Management & Uploads
function mp3ManagerPlugin() {
  return {
    name: 'mp3-manager',
    configureServer(server) {
      const mp3Dir = path.resolve(process.cwd(), 'mp3');
      const publicMp3Dir = path.resolve(process.cwd(), 'public/mp3');

      // Ensure directories exist
      if (!fs.existsSync(mp3Dir)) fs.mkdirSync(mp3Dir, { recursive: true });
      if (!fs.existsSync(publicMp3Dir)) fs.mkdirSync(publicMp3Dir, { recursive: true });

      server.middlewares.use(async (req, res, next) => {
        // 1. GET /api/mp3-list
        if (req.url === '/api/mp3-list' && req.method === 'GET') {
          try {
            // Sort files: prioritize Thol Sophiti / Stay With Me, then alphabetical
            files.sort((a, b) => {
              const aIsThol = a.toLowerCase().includes('thol sophiti') || a.toLowerCase().includes('stay with me');
              const bIsThol = b.toLowerCase().includes('thol sophiti') || b.toLowerCase().includes('stay with me');
              if (aIsThol && !bIsThol) return -1;
              if (!aIsThol && bIsThol) return 1;
              return a.localeCompare(b);
            });
            
            // Format nice romantic titles for the couple
            const tracks = files.map((file, idx) => {
              let cleanTitle = file.replace(/\.mp3$/i, '');
              let artist = 'Sak & Reaksa Love Archive';

              if (cleanTitle.toLowerCase().includes('thol sophiti') || cleanTitle.toLowerCase().includes('stay with me')) {
                cleanTitle = 'Stay With Me (បងចង់មើលថែ)';
                artist = 'Thol Sophiti • Official Theme';
              } else if (cleanTitle.startsWith('ssstik.io_')) {
                const romanticNames = [
                  'Our Riverside Melody',
                  'Phnom Penh Sunset Chords',
                  'Sweet Whisper in the Rain',
                  'Holding Your Hand',
                  'Midnight Stars Acoustic',
                  'Forever Chanreaksa'
                ];
                cleanTitle = romanticNames[(idx - 1 + romanticNames.length) % romanticNames.length];
                artist = 'Sak & Reaksa Tape Collection';
              }

              return {
                id: `mp3-disk-${idx}`,
                fileName: file,
                title: cleanTitle,
                artist: artist,
                url: `/mp3/${encodeURIComponent(file)}`
              };
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, tracks, diskPath: mp3Dir }));
            return;
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }

        // 2. POST /api/upload-mp3
        if (req.url === '/api/upload-mp3' && req.method === 'POST') {
          try {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => {
              const buffer = Buffer.concat(chunks);
              // Read filename from custom header
              const rawFileName = req.headers['x-file-name'] || `song_${Date.now()}.mp3`;
              const fileName = decodeURIComponent(rawFileName).replace(/[^a-zA-Z0-9._-]/g, '_');
              
              const targetMp3Path = path.join(mp3Dir, fileName);
              const targetPublicMp3Path = path.join(publicMp3Dir, fileName);

              // Write to D:\Downloads\love\mp3 AND public/mp3
              fs.writeFileSync(targetMp3Path, buffer);
              fs.writeFileSync(targetPublicMp3Path, buffer);

              console.log(`[MP3 Manager] Saved new song to ${targetMp3Path}`);

              const newTrack = {
                id: `mp3-disk-${Date.now()}`,
                fileName: fileName,
                title: fileName.replace(/\.mp3$/i, '').replace(/_/g, ' '),
                artist: 'Sak & Reaksa Love Archive',
                url: `/mp3/${encodeURIComponent(fileName)}`
              };

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, track: newTrack }));
            });
            return;
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), mp3ManagerPlugin()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'firebase-firestore',
              test: /node_modules\/(@firebase\/firestore|firebase\/firestore)/
            },
            {
              name: 'react-vendor',
              test: /node_modules\/(react|react-dom)/
            }
          ]
        }
      }
    }
  }
});
