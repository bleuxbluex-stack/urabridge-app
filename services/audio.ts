import { Platform } from 'react-native';

const CORRECT_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3';
const INCORRECT_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3';

export async function playAudioUrl(url?: string | null): Promise<void> {
  if (!url) return;

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const audio = new window.Audio(url);
      await audio.play();
      return;
    }

    // Expo SDK 53+ standard expo-audio
    try {
      const expoAudio = require('expo-audio');
      if (expoAudio && typeof expoAudio.createAudioPlayer === 'function') {
        const player = expoAudio.createAudioPlayer(url);
        if (player && typeof player.play === 'function') {
          player.play();
          return;
        }
      }
    } catch (e) {
      console.warn('expo-audio playback error:', e);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Play a cheerful chime sound when an exercise answer is correct
 */
export async function playCorrectSound(): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Note 1 (E5 - 659Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.15);

        // Note 2 (A5 - 880Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.12);
        gain2.gain.setValueAtTime(0.25, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.35);

        return;
      }
    }

    await playAudioUrl(CORRECT_SOUND_URL);
  } catch (err) {
    console.warn('Failed to play correct sound:', err);
  }
}

/**
 * Play a low warning buzz sound when an exercise answer is incorrect
 */
export async function playIncorrectSound(): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Low Tone 1 (G3 - 196Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(196, now);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.18);

        // Low Tone 2 (E3 - 164Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(164.81, now + 0.15);
        gain2.gain.setValueAtTime(0.2, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.35);

        return;
      }
    }

    await playAudioUrl(INCORRECT_SOUND_URL);
  } catch (err) {
    console.warn('Failed to play incorrect sound:', err);
  }
}
