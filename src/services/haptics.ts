// Haptic Feedback Simulation Service for OMK Mobile OS
// Combines Navigator.vibrate with Web Audio API micro-pulse tactile synthesized feedback

export type HapticType = 
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'appLaunch'
  | 'appClose'
  | 'backNav'
  | 'dragStart'
  | 'dragDrop';

class HapticsService {
  private audioCtx: AudioContext | null = null;
  private isAudioInitialized = false;

  private initAudio() {
    if (typeof window === 'undefined') return;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.audioCtx = new AudioContextClass();
        } catch (e) {
          // AudioContext might fail if user hasn't interacted yet
        }
      }
    }
  }

  // Synthesize a subtle micro-pulse click sound (tactile feel on desktop/web)
  private playSyntheticHapticTone(freq = 120, duration = 0.02, volume = 0.04) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Ignore audio synthesis errors
    }
  }

  public trigger(type: HapticType = 'light') {
    if (typeof window === 'undefined') return;

    // 1. Hardware Vibration API (Mobile devices)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        switch (type) {
          case 'selection':
            navigator.vibrate(8);
            break;
          case 'light':
            navigator.vibrate(12);
            break;
          case 'medium':
            navigator.vibrate(20);
            break;
          case 'heavy':
            navigator.vibrate(35);
            break;
          case 'appLaunch':
            navigator.vibrate([15, 30, 20]);
            break;
          case 'appClose':
            navigator.vibrate([18, 25]);
            break;
          case 'backNav':
            navigator.vibrate(14);
            break;
          case 'dragStart':
            navigator.vibrate([25, 15, 20]);
            break;
          case 'dragDrop':
            navigator.vibrate([10, 10, 25]);
            break;
          case 'success':
            navigator.vibrate([12, 40, 18]);
            break;
          case 'warning':
            navigator.vibrate([20, 30, 20]);
            break;
          case 'error':
            navigator.vibrate([30, 40, 30, 40, 30]);
            break;
        }
      } catch (e) {
        // Fallback gracefully
      }
    }

    // 2. Synthetic Audio-Tactile Feedback (High-fidelity click sensation)
    switch (type) {
      case 'selection':
        this.playSyntheticHapticTone(180, 0.015, 0.02);
        break;
      case 'light':
        this.playSyntheticHapticTone(140, 0.02, 0.03);
        break;
      case 'medium':
        this.playSyntheticHapticTone(110, 0.03, 0.04);
        break;
      case 'heavy':
        this.playSyntheticHapticTone(85, 0.04, 0.06);
        break;
      case 'appLaunch':
        this.playSyntheticHapticTone(160, 0.035, 0.05);
        break;
      case 'appClose':
        this.playSyntheticHapticTone(100, 0.03, 0.04);
        break;
      case 'backNav':
        this.playSyntheticHapticTone(130, 0.025, 0.04);
        break;
      case 'dragStart':
        this.playSyntheticHapticTone(90, 0.04, 0.05);
        break;
      case 'dragDrop':
        this.playSyntheticHapticTone(150, 0.03, 0.05);
        break;
      case 'success':
        this.playSyntheticHapticTone(240, 0.03, 0.04);
        break;
      case 'warning':
        this.playSyntheticHapticTone(95, 0.04, 0.05);
        break;
      case 'error':
        this.playSyntheticHapticTone(70, 0.05, 0.07);
        break;
    }
  }
}

export const haptics = new HapticsService();
