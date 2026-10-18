// Realistic Retro Web Audio API Sound Synthesizer
// Zero external file dependencies - 100% reliable offline & instant

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlayingMusic = false;
    this.currentTrack = 0;
    this.musicTimer = null;
    this.tapeNoiseNode = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
  }

  // Vintage mechanical cassette button click (chunky clack)
  playTapeClick() {
    if (this.isMuted) return;
    try {
      this.init();
      const t = this.ctx.currentTime;
      
      // Initial mechanical impact
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.06);
      
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.07);

      // Spring snap noise
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1400, t);
      noiseFilter.Q.setValueAtTime(2, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, t + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(t + 0.01);
    } catch (e) {
      console.warn('Audio click error:', e);
    }
  }

  // Camera shutter snap & optical mirror return
  playShutterSound() {
    if (this.isMuted) return;
    try {
      this.init();
      const t = this.ctx.currentTime;

      // 1. Blade snap
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(900, t);
      osc1.frequency.exponentialRampToValueAtTime(120, t + 0.04);
      gain1.gain.setValueAtTime(0.3, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc1.connect(gain1);
      gain1.connect(this.sfxGain);
      osc1.start(t);
      osc1.stop(t + 0.045);

      // 2. Mechanical winding noise
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, t + 0.03);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(t + 0.03);

      // 3. Shutter close click
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(320, t + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(60, t + 0.13);
      gain2.gain.setValueAtTime(0.4, t + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(t + 0.08);
      osc2.stop(t + 0.14);
    } catch (e) {
      console.warn('Audio shutter error:', e);
    }
  }

  // CRT Monitor on/off sound (high pitch degauss tone + warm pop)
  playCrtToggle(turnOn = true) {
    if (this.isMuted) return;
    try {
      this.init();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (turnOn) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.exponentialRampToValueAtTime(15734, t + 0.15); // Authentic NTSC/PAL line frequency whine
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(8000, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.13);
      }
    } catch (e) {
      console.warn('CRT sound error:', e);
    }
  }

  // Gentle typewriter / keyboard click
  playKeyClick() {
    if (this.isMuted) return;
    try {
      this.init();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700 + Math.random() * 150, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.025);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.03);
    } catch (e) {}
  }

  // Gentle celestial bell chime for interactive stars & cosmos
  playStarChime(baseFreq = 880) {
    if (this.isMuted) return;
    try {
      this.init();
      const t = this.ctx.currentTime;
      const harmonics = [baseFreq, baseFreq * 1.5, baseFreq * 2];
      harmonics.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const volume = 0.06 / (idx + 1);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2 + idx * 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 1.6);
      });
    } catch (e) {
      console.warn('Star chime error:', e);
    }
  }

  // Dreamy Lo-Fi Ambient Romantic chords generator
  // Beautiful, peaceful, warm vintage Rhodes/Tape synthesizer chords
  startAmbientMusic(trackIndex = 0) {
    try {
      this.init();
      this.isPlayingMusic = true;
      this.currentTrack = trackIndex;

      // Track chord progressions (frequencies in Hz)
      const tracks = [
        // Track 0: "Golden Hour in Phnom Penh" (Warm Ebmaj7 - Cm7 - Fm7 - Bb7)
        [
          [155.56, 233.08, 293.66, 349.23, 440.00], // Ebmaj9
          [130.81, 196.00, 261.63, 311.13, 392.00], // Cm7
          [174.61, 261.63, 311.13, 392.00, 440.00], // Fm9
          [116.54, 174.61, 233.08, 293.66, 349.23]  // Bb7sus
        ],
        // Track 1: "Midnight Polaroid Tape" (Fmaj7 - Am7 - Dm7 - Cmaj7)
        [
          [174.61, 261.63, 329.63, 392.00],         // Fmaj7
          [110.00, 164.81, 220.00, 261.63, 329.63], // Am7
          [146.83, 220.00, 261.63, 349.23],         // Dm7
          [130.81, 196.00, 246.94, 329.63, 392.00]  // Cmaj7
        ],
        // Track 2: "September 8th Breeze" (Dbmaj7 - Bbm7 - Ebm7 - Ab)
        [
          [138.59, 207.65, 261.63, 329.63],
          [116.54, 174.61, 233.08, 277.18],
          [155.56, 233.08, 277.18, 349.23],
          [103.83, 155.56, 207.65, 261.63]
        ]
      ];

      const progression = tracks[trackIndex % tracks.length];
      let chordIndex = 0;

      const playNextChord = () => {
        if (!this.isPlayingMusic || !this.ctx) return;

        const chord = progression[chordIndex % progression.length];
        const chordDuration = 4.2; // seconds per chord
        const t = this.ctx.currentTime;

        // Play each note with warm vintage envelope
        chord.forEach((freq, noteIdx) => {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          // Warm electric piano / analog vibe
          osc.type = noteIdx === 0 ? 'triangle' : 'sine';
          // Slight tape wow & flutter detune
          const detuneAmount = (Math.random() - 0.5) * 6;
          osc.frequency.setValueAtTime(freq, t);
          osc.detune.setValueAtTime(detuneAmount, t);

          // Lowpass filter for warm cream analog feel
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(650 + (noteIdx * 150), t);
          filter.frequency.exponentialRampToValueAtTime(380, t + chordDuration);

          // Gentle smooth envelope
          const attack = 0.5 + (noteIdx * 0.1);
          noteGain.gain.setValueAtTime(0.0001, t);
          noteGain.gain.linearRampToValueAtTime(0.09 / (noteIdx === 0 ? 1 : 1.4), t + attack);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, t + chordDuration);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.musicGain);

          osc.start(t);
          osc.stop(t + chordDuration + 0.1);
        });

        chordIndex++;
        this.musicTimer = setTimeout(playNextChord, 3800);
      };

      playNextChord();
    } catch (e) {
      console.warn('Music synth error:', e);
    }
  }

  stopAmbientMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  setVolume(val) { // val between 0.0 and 1.0
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }
}

export const sound = new SoundEngine();
