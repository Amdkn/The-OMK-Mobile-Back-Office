// Real-time Web Audio Synthesizer for Focus & Ambient soundscapes inside the Dynamic Island Hub

export interface SoundTrack {
  id: string;
  title: string;
  subtitle: string;
  category: 'Focus' | 'Lo-Fi' | 'Nature' | 'Neural';
  color: string;
}

export const SOUND_TRACKS: SoundTrack[] = [
  { id: 'binaural-432', title: 'Onde Alpha 432 Hz', subtitle: 'Concentration profonde & Clarté', category: 'Focus', color: 'from-cyan-500 to-blue-600' },
  { id: 'rain-cafe', title: 'Pluie sur Verrière', subtitle: 'Ambiance feutrée & Sérénité', category: 'Nature', color: 'from-sky-500 to-indigo-600' },
  { id: 'cyber-drone', title: 'Cyber Pulse Lo-Fi', subtitle: 'Rythme binaural 60 BPM', category: 'Lo-Fi', color: 'from-amber-500 to-rose-600' },
  { id: 'pink-noise', title: 'Bruit Rose Pur', subtitle: 'Masquage acoustique & Flux', category: 'Neural', color: 'from-emerald-500 to-teal-600' }
];

class FocusAudioService {
  private ctx: AudioContext | null = null;
  private currentTrackId: string | null = null;
  private isPlaying = false;
  private volume = 0.5;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private listeners: Set<(isPlaying: boolean, trackId: string | null, volume: number) => void> = new Set();

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  public subscribe(cb: (isPlaying: boolean, trackId: string | null, volume: number) => void) {
    this.listeners.add(cb);
    cb(this.isPlaying, this.currentTrackId, this.volume);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.isPlaying, this.currentTrackId, this.volume));
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTrackId: this.currentTrackId || SOUND_TRACKS[0].id,
      volume: this.volume
    };
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.15, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public togglePlay(trackId?: string) {
    const target = trackId || this.currentTrackId || SOUND_TRACKS[0].id;
    if (this.isPlaying && this.currentTrackId === target) {
      this.stop();
    } else {
      this.play(target);
    }
  }

  public play(trackId: string) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stopNodes();
    this.currentTrackId = trackId;
    this.isPlaying = true;
    this.masterGain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);

    try {
      if (trackId === 'binaural-432') {
        this.startBinaural(432, 10);
      } else if (trackId === 'rain-cafe') {
        this.startRainSynth();
      } else if (trackId === 'cyber-drone') {
        this.startCyberDrone();
      } else {
        this.startPinkNoise();
      }
    } catch (e) {
      console.warn('Focus Audio error:', e);
    }

    this.notify();
  }

  public stop() {
    this.stopNodes();
    this.isPlaying = false;
    this.notify();
  }

  private stopNodes() {
    this.activeNodes.forEach(node => {
      if (typeof node === 'number') {
        clearInterval(node);
      } else if ('stop' in node && typeof (node as any).stop === 'function') {
        try {
          (node as any).stop();
        } catch (e) {
          // ignore
        }
      }
    });
    this.activeNodes = [];
  }

  // Synthesizes soothing binaural 432Hz sine beat
  private startBinaural(baseFreq: number, beatFreq: number) {
    if (!this.ctx || !this.masterGain) return;

    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(baseFreq + beatFreq, this.ctx.currentTime);

    oscL.connect(gain);
    oscR.connect(gain);
    gain.connect(this.masterGain);

    oscL.start();
    oscR.start();

    this.activeNodes.push(oscL, oscR, gain);
  }

  // Pink noise generator for soothing focus
  private startPinkNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.masterGain);
    noiseSource.start();

    this.activeNodes.push(noiseSource, filter);
  }

  // Rain texture synthesizer
  private startRainSynth() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1200, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.7, this.ctx.currentTime);

    noiseSource.connect(bandpass);
    bandpass.connect(this.masterGain);
    noiseSource.start();

    this.activeNodes.push(noiseSource, bandpass);
  }

  // Cyber drone with subtle low frequency modulation
  private startCyberDrone() {
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(164.81, this.ctx.currentTime); // E3

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();

    this.activeNodes.push(osc1, osc2, filter, gain);
  }
}

export const focusAudio = new FocusAudioService();
