// Service to manage songs in D:\Downloads\love\mp3

// Default fallback list representing the 7 files currently in D:\Downloads\love\mp3
export const initialDiskTracks = [
  {
    id: 'mp3-0',
    fileName: 'Stay with me - Thol Sophiti [Lyrics Video]  បងចងមលថចមឆយ កកកយកនដពញមយជវតន....mp3',
    title: 'Stay With Me (បងចង់មើលថែ)',
    artist: 'Thol Sophiti • Official',
    url: '/mp3/' + encodeURIComponent('Stay with me - Thol Sophiti [Lyrics Video]  បងចងមលថចមឆយ កកកយកនដពញមយជវតន....mp3'),
    duration: '04:15'
  },
  {
    id: 'mp3-1',
    fileName: 'ssstik.io_1788854887838.mp3',
    title: 'Our Riverside Melody',
    artist: 'Sak & Reaksa Love Tape 1',
    url: '/mp3/ssstik.io_1788854887838.mp3',
    duration: '00:52'
  },
  {
    id: 'mp3-2',
    fileName: 'ssstik.io_1788854928595.mp3',
    title: 'Phnom Penh Sunset Chords',
    artist: 'Sak & Reaksa Love Tape 2',
    url: '/mp3/ssstik.io_1788854928595.mp3',
    duration: '00:39'
  },
  {
    id: 'mp3-3',
    fileName: 'ssstik.io_1788854954084.mp3',
    title: 'Sweet Whisper in the Rain',
    artist: 'Sak & Reaksa Love Tape 3',
    url: '/mp3/ssstik.io_1788854954084.mp3',
    duration: '01:14'
  },
  {
    id: 'mp3-4',
    fileName: 'ssstik.io_1788854992795.mp3',
    title: 'Holding Your Hand',
    artist: 'Sak & Reaksa Love Tape 4',
    url: '/mp3/ssstik.io_1788854992795.mp3',
    duration: '01:34'
  },
  {
    id: 'mp3-5',
    fileName: 'ssstik.io_1788855015036.mp3',
    title: 'Midnight Stars Acoustic',
    artist: 'Sak & Reaksa Love Tape 5',
    url: '/mp3/ssstik.io_1788855015036.mp3',
    duration: '01:08'
  },
  {
    id: 'mp3-6',
    fileName: 'ssstik.io_1788855045848.mp3',
    title: 'Forever Chanreaksa',
    artist: 'Sak & Reaksa Love Tape 6',
    url: '/mp3/ssstik.io_1788855045848.mp3',
    duration: '00:19'
  }
];

// Fetch dynamically from /api/mp3-list (synced directly with D:\Downloads\love\mp3)
export const fetchDiskMp3Tracks = async () => {
  try {
    const res = await fetch('/api/mp3-list');
    if (res.ok) {
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        return data.tracks;
      }
    }
  } catch (e) {
    console.warn('Notice: Using local disk track catalog:', e);
  }
  return initialDiskTracks;
};

// Upload MP3 directly to D:\Downloads\love\mp3 via server endpoint
export const uploadMp3ToDisk = async (file) => {
  const cleanName = encodeURIComponent(file.name);
  try {
    const res = await fetch('/api/upload-mp3', {
      method: 'POST',
      headers: {
        'x-file-name': cleanName,
        'Content-Type': 'application/octet-stream'
      },
      body: file
    });

    if (res.ok) {
      const data = await res.json();
      if (data.track) {
        return data.track;
      }
    }
  } catch (err) {
    console.warn('Upload to disk server endpoint notice:', err);
  }

  // Fallback: create object URL so it plays immediately in browser
  return {
    id: `mp3-blob-${Date.now()}`,
    fileName: file.name,
    title: file.name.replace(/\.mp3$/i, ''),
    artist: 'Uploaded Song',
    url: URL.createObjectURL(file)
  };
};
