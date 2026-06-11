// Web Audio API Mechanical Keyboard Switch Click Synthesizer
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playClickSound = (volume: number = 0.5) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser security policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // --- 1. Mechanical Contact Click (High-frequency transient) ---
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  
  clickOsc.type = 'triangle';
  clickOsc.frequency.setValueAtTime(1200, now);
  clickOsc.frequency.exponentialRampToValueAtTime(150, now + 0.015);

  clickGain.gain.setValueAtTime(volume * 0.5, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

  clickOsc.connect(clickGain);
  clickGain.connect(ctx.destination);

  // --- 2. Keycap Housing Resonance (Warm low-mid body) ---
  const bodyOsc = ctx.createOscillator();
  const bodyGain = ctx.createGain();

  bodyOsc.type = 'sine';
  bodyOsc.frequency.setValueAtTime(320, now);
  bodyOsc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

  bodyGain.gain.setValueAtTime(volume * 0.4, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  bodyOsc.connect(bodyGain);
  bodyGain.connect(ctx.destination);

  // --- 3. Subtle Plastic Friction (Noise pop) ---
  try {
    const bufferSize = ctx.sampleRate * 0.01; // 10ms of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter noise to keep only high click frequencies
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(4000, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + 0.01);
  } catch (e) {
    // Fallback if noise buffer creation fails in some browsers
  }

  // Start & stop oscillators
  clickOsc.start(now);
  clickOsc.stop(now + 0.02);

  bodyOsc.start(now);
  bodyOsc.stop(now + 0.07);
};
