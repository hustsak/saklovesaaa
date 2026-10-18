import { useState, useEffect, useRef } from 'react';
import { initialDiskTracks, fetchDiskMp3Tracks, uploadMp3ToDisk } from '../utils/mp3Service';
import { sound } from '../utils/audioSynthesizer';

export function useMusicPlayer(isMuted = false) {
  const audioRef = useRef(null);
  const [tracks, setTracks] = useState(initialDiskTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(255);
  const [volume, setVolume] = useState(0.6);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Refresh tracks list from D:\Downloads\love\mp3 via /api/mp3-list
  const refreshTracks = async () => {
    const loaded = await fetchDiskMp3Tracks();
    if (loaded && loaded.length > 0) {
      setTracks(loaded);
    }
  };

  useEffect(() => {
    refreshTracks();
  }, []);

  // HTML5 audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    const onTimeUpdate = () => setCurrentTime(Math.floor(audio.currentTime));
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.floor(audio.duration));
      }
    };
    const onEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [volume, isMuted, currentTrackIndex, tracks]);

  // Switch or play a specific track by index
  const playTrackAtIndex = (index, shouldPlay = true) => {
    sound.playTapeClick();
    if (index < 0 || index >= tracks.length) return;

    const track = tracks[index];
    setCurrentTrackIndex(index);
    setCurrentTime(0);

    const audio = audioRef.current;
    if (audio) {
      audio.src = track.url;
      if (shouldPlay) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((e) => {
          console.warn('Audio auto-play notice:', e);
        });
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    }
  };

  const togglePlay = () => {
    sound.playTapeClick();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src || audio.src === window.location.href || !audio.src.includes('.mp3')) {
        audio.src = currentTrack.url;
      }
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio play notice:', e);
      });
    }
  };

  const handleNextTrack = () => {
    sound.playTapeClick();
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    playTrackAtIndex(nextIdx, isPlaying);
  };

  const handlePrevTrack = () => {
    sound.playTapeClick();
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrackAtIndex(prevIdx, isPlaying);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    sound.setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  // Upload an MP3 directly into D:\Downloads\love\mp3 and immediately start playing it
  const uploadSong = async (file) => {
    if (!file) return;
    sound.playTapeClick();
    setIsUploading(true);
    setUploadNotice(`Adding ${file.name} to Love Tape Archive...`);

    try {
      const newTrack = await uploadMp3ToDisk(file);
      const updated = [newTrack, ...tracks];
      setTracks(updated);
      setIsUploading(false);
      setUploadNotice(`"${newTrack.title}" added to Love Tape Archive!`);
      setTimeout(() => setUploadNotice(''), 4000);

      // Immediately switch to the newly uploaded song
      setTimeout(() => {
        playTrackAtIndex(0, true);
      }, 100);
    } catch (err) {
      console.error('Upload song error:', err);
      setIsUploading(false);
      setUploadNotice('Error saving to mp3 folder. Please try again.');
      setTimeout(() => setUploadNotice(''), 4000);
    }
  };

  return {
    audioRef,
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMinimized,
    setIsMinimized,
    isUploading,
    uploadNotice,
    playTrackAtIndex,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    handleVolumeChange,
    uploadSong,
    refreshTracks
  };
}
