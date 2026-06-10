/*
 * Tiny procedural music engine (Web Audio API) — no audio files.
 * Plays a gentle generative loop whose mood is driven by a per-stage `song`
 * config: tempo, chord progression, scale, timbre. Lightly randomised so it
 * never feels like an exact loop. Must be started from a user gesture.
 */
const Music = (() => {
  let ctx = null, master = null, filter = null;
  let started = false, muted = false;
  let song = null;
  let timer = null;
  let nextTime = 0, step = 0;
  const LOOKAHEAD = 0.1, INTERVAL = 25; // s / ms
  const STEPS_PER_BAR = 8;

  const TRIADS = { maj: [0, 4, 7], min: [0, 3, 7] };
  const semis = (root, s) => root * Math.pow(2, s / 12);
  const rnd = (a, b) => a + Math.random() * (b - a);

  function ensureContext() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.16;
    filter.connect(master);
    master.connect(ctx.destination);
  }

  // a plucked/melodic note
  function voice(freq, t, dur, type, vol, vibrato) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (vibrato) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5.5; lg.gain.value = freq * 0.012;
      lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(filter);
    o.start(t); o.stop(t + dur + 0.02);
  }

  // soft sustained pad chord
  function pad(freqs, t, dur, type, vol) {
    freqs.forEach((f) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.25);
      g.gain.setValueAtTime(vol, t + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(filter);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }

  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.18);
  }

  function hat(t) {
    const bufSize = ctx.sampleRate * 0.04;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7000;
    const g = ctx.createGain(); g.gain.value = 0.04;
    src.connect(hp); hp.connect(g); g.connect(master);
    src.start(t); src.stop(t + 0.05);
  }

  function scheduleStep(s, t) {
    if (!song) return;
    const beat = 60 / song.tempo;
    const eighth = beat / 2;
    const bar = Math.floor(s / STEPS_PER_BAR);
    const inBar = s % STEPS_PER_BAR;
    const chord = song.prog[bar % song.prog.length];
    const cRoot = song.root * Math.pow(2, chord[0] / 12);
    const triad = TRIADS[chord[1]] || TRIADS.maj;

    if (inBar === 0) {
      pad(triad.map((iv) => semis(cRoot, iv)), t, beat * 2.1, song.pad, 0.05);
      voice(cRoot / 2, t, beat * 1.4, "triangle", 0.10); // bass
    }
    // melody: arpeggiate chord/scale tones on most eighths
    if (Math.random() < 0.82) {
      const useChord = Math.random() < 0.6;
      let iv;
      if (useChord) iv = triad[inBar % triad.length] + 12 * (Math.random() < 0.3 ? 1 : 0);
      else { const sc = song.scale; iv = sc[(Math.random() * sc.length) | 0] + 12; }
      voice(semis(cRoot, iv), t, eighth * rnd(0.8, 1.3), song.lead, 0.075, song.vibrato);
    }
    if (song.perc) {
      if (inBar % 4 === 0) kick(t);
      if (inBar % 2 === 1) hat(t);
    }
  }

  function loop() {
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      scheduleStep(step, nextTime);
      const beat = 60 / song.tempo;
      nextTime += beat / 2;
      step++;
    }
  }

  return {
    setSong(s) {
      const fresh = !song;
      song = s;
      if (ctx && filter) filter.frequency.setTargetAtTime(s.cutoff || 2200, ctx.currentTime, 0.3);
      // restart bar counting cleanly when stage changes mid-play
      if (started && !fresh) { step = 0; }
    },
    start() {
      if (started) return;
      ensureContext();
      if (ctx.state === "suspended") ctx.resume();
      started = true;
      nextTime = ctx.currentTime + 0.12;
      step = 0;
      timer = setInterval(loop, INTERVAL);
    },
    setMuted(m) {
      muted = m;
      if (master) master.gain.setTargetAtTime(m ? 0 : 0.16, ctx.currentTime, 0.05);
      if (!m && ctx && ctx.state === "suspended") ctx.resume();
    },
    isMuted() { return muted; },
    isStarted() { return started; },
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Music;
