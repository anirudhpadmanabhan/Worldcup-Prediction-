// Web Audio API Synthesizer for high-quality, lightweight interactive audio effects.
// Does not require downloading asset files; synthesizes stadium cheer, chimes, fanfares, and ticks in real-time.

class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private crowdNode: AudioWorkletNode | ScriptProcessorNode | OscillatorNode | null = null;
  private crowdGain: GainNode | null = null;

  constructor() {
    // Lazy initialize to bypass browser autoplay policies
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute && this.crowdGain) {
      this.crowdGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    } else if (!mute && this.crowdGain && this.ctx) {
      this.crowdGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    }
  }

  getIsMuted() {
    return this.isMuted;
  }

  // Play a simple soft tick for button hover
  playTick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Play a deep premium zoom transition sound when entering predictions
  playCinematicZoom() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(45, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 1.2);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(240, this.ctx.currentTime + 1.2);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(100, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 1.3);
    osc2.stop(this.ctx.currentTime + 1.3);
  }

  // Play selection/advancement chime
  playSelection() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.05, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  }

  // Play an epic trumpet-like soccer fan cheering loop / stadium crowd noise in the background
  startStadiumAmbience() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.crowdNode) return; // Already running

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate brownian/pink-like sound for crowd rumble
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Amplify
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseSource.start();

    // Store references to manipulate later
    this.crowdNode = noiseSource as any;
    this.crowdGain = gain;
  }

  // Play majestic trumpet fanfare when champion is chosen
  playChampionFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // C4, E4, G4, C5 chord and fanfare notes
    const sequence = [
      { f: [261.63, 329.63, 392.0], d: 0.2 },
      { f: [392.0, 493.88, 587.33], d: 0.2 },
      { f: [523.25, 659.25, 783.99], d: 0.4 },
      { f: [783.99, 987.77, 1174.66], d: 0.8 },
    ];

    sequence.forEach((item, index) => {
      if (!this.ctx) return;
      const onset = now + index * 0.25;

      item.f.forEach(freq => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, onset);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1500, onset);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.04, onset);
        gain.gain.exponentialRampToValueAtTime(0.001, onset + item.d);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(onset);
        osc.stop(onset + item.d + 0.1);
      });
    });
  }
}

export const audioSynth = new AudioSynthEngine();
