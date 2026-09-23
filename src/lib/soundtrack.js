// The portrait badge's soundtrack.
//
// Drop a track at public/song.mp3 and that is what plays. Until then, a quiet
// ambient loop is generated live with Web Audio, so the button works without
// any file at all — and nothing copyrighted has to be shipped to make it do so.

const SONG_SRC = "/song.mp3";
const FILE_VOLUME = 0.55;
// How long the clip fades out before it starts over.
const LOOP_FADE_SECONDS = 3;

// A warm, unresolved loop in A minor: Am9 – Fmaj9 – Cmaj9 – G6, one bar each.
const PROGRESSION = [
  { bass: 110.0, pad: [261.63, 329.63, 392.0, 493.88] },
  { bass: 87.31, pad: [220.0, 261.63, 329.63, 392.0] },
  { bass: 130.81, pad: [164.81, 196.0, 246.94, 293.66] },
  { bass: 98.0, pad: [246.94, 293.66, 329.63, 440.0] },
];
const BAR_SECONDS = 4;
// Where in the bar the soft plucks fall, in seconds — uneven on purpose, so
// the loop reads as played rather than ticked off by a clock.
const PLUCKS = [0, 1, 1.5, 2, 3, 3.5];

/** Decaying noise as a reverb tail — no impulse file needed. */
function impulse(context, seconds, decay) {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return buffer;
}

/**
 * One listening session of the generated loop. It is built fresh on every
 * start and closed on stop: closing the context is the only reliable way to
 * cancel notes already scheduled a second or two ahead, which would otherwise
 * play over the top of the next session.
 *
 * Must be created inside the click handler — browsers only let audio start
 * from a user gesture, and Safari wants the context made in that same call.
 */
function createSynth() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContext();

  const master = context.createGain();
  master.gain.value = 0;
  const limiter = context.createDynamicsCompressor();
  master.connect(limiter).connect(context.destination);

  // Everything plays into one bus that feeds both a dry path and a reverb.
  const bus = context.createGain();
  const dry = context.createGain();
  dry.gain.value = 0.7;
  const wet = context.createGain();
  wet.gain.value = 0.45;
  const reverb = context.createConvolver();
  reverb.buffer = impulse(context, 2.8, 2.2);
  bus.connect(dry).connect(master);
  bus.connect(reverb).connect(wet).connect(master);

  const pad = (time, frequency, duration, level) => {
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(level, time + 1.4);
    envelope.gain.setValueAtTime(level, time + duration - 1.6);
    envelope.gain.linearRampToValueAtTime(0, time + duration);

    // A slow filter sweep across the bar is what keeps a held chord breathing.
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.4;
    filter.frequency.setValueAtTime(700, time);
    filter.frequency.linearRampToValueAtTime(1300, time + duration / 2);
    filter.frequency.linearRampToValueAtTime(700, time + duration);

    [0, 5, -5].forEach((cents, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 0 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = cents;
      oscillator.connect(filter);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.05);
    });

    filter.connect(envelope).connect(bus);
  };

  const bass = (time, frequency, duration, level) => {
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(level, time + 0.4);
    envelope.gain.setValueAtTime(level, time + duration - 1);
    envelope.gain.linearRampToValueAtTime(0, time + duration);
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(envelope).connect(bus);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.05);
  };

  const pluck = (time, frequency, level) => {
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(level, time + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 1.1);
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(envelope).connect(bus);
    oscillator.start(time);
    oscillator.stop(time + 1.2);
  };

  let nextBar = 0;
  let bar = 0;
  let timer = 0;

  const scheduleBar = (time) => {
    const chord = PROGRESSION[bar % PROGRESSION.length];
    // Each chord outlasts its bar so neighbours crossfade instead of cutting.
    chord.pad.forEach((frequency) => pad(time, frequency, BAR_SECONDS + 1.6, 0.045));
    bass(time, chord.bass, BAR_SECONDS + 0.8, 0.09);
    PLUCKS.forEach((offset, index) => {
      const note = chord.pad[(index * 2 + bar) % chord.pad.length] * 2;
      pluck(time + offset, note, 0.05);
    });
  };

  // Look-ahead scheduling: audio time is exact, timers are not, so notes are
  // queued a little ahead on the audio clock and the timer only tops it up.
  const topUp = () => {
    while (nextBar < context.currentTime + 1.5) {
      scheduleBar(nextBar);
      nextBar += BAR_SECONDS;
      bar += 1;
    }
  };

  return {
    start() {
      context.resume();
      nextBar = context.currentTime + 0.05;
      topUp();
      timer = window.setInterval(topUp, 250);
      master.gain.setValueAtTime(0, context.currentTime);
      master.gain.linearRampToValueAtTime(0.16, context.currentTime + 1.2);
    },
    stop() {
      window.clearInterval(timer);
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.7);
      window.setTimeout(() => context.close().catch(() => {}), 800);
    },
  };
}

/**
 * Plays public/song.mp3, fading in and out, and resumes where it left off.
 * The file is a clip cut from the middle of a song, so rather than a hard
 * `loop` jump it fades out over the last seconds and fades back in from the
 * top.
 */
function createFilePlayer() {
  const audio = new Audio(SONG_SRC);
  audio.preload = "auto";
  audio.volume = 0;
  let fade = 0;
  let playing = false;
  let endingFade = false;

  audio.addEventListener("timeupdate", () => {
    const left = audio.duration - audio.currentTime;
    if (playing && !endingFade && left < LOOP_FADE_SECONDS) {
      endingFade = true;
      rampTo(0, left * 1000);
    }
  });
  audio.addEventListener("ended", () => {
    endingFade = false;
    if (!playing) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    rampTo(FILE_VOLUME, 1500);
  });

  const rampTo = (target, ms, done) => {
    window.clearInterval(fade);
    const from = audio.volume;
    const began = performance.now();
    fade = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - began) / ms);
      audio.volume = from + (target - from) * progress;
      if (progress >= 1) {
        window.clearInterval(fade);
        done?.();
      }
    }, 30);
  };

  return {
    start() {
      // Called synchronously from the click, which is what lets play() through.
      playing = true;
      // Stopped during the closing fade: start over rather than resume into it.
      if (endingFade) {
        endingFade = false;
        audio.currentTime = 0;
      }
      audio.play().catch(() => {});
      rampTo(FILE_VOLUME, 900);
    },
    stop() {
      playing = false;
      rampTo(0, 500, () => audio.pause());
    },
  };
}

/**
 * The controller the badge talks to. `prepare` checks, once and ahead of any
 * click, whether a real track has been dropped in: the check is a network
 * request, and waiting on it inside the click would push play() outside the
 * gesture that is allowed to start sound.
 */
export function createSoundtrack() {
  let mode = "synth";
  let checked = null;
  let file = null;
  let synth = null;

  return {
    prepare() {
      if (!checked) {
        checked = fetch(SONG_SRC, { method: "HEAD" })
          .then((response) => {
            // A dev server answers unknown paths with the app's HTML, so a
            // 200 alone proves nothing — it has to actually be audio.
            const type = response.headers.get("content-type") || "";
            if (response.ok && type.startsWith("audio/")) mode = "file";
          })
          .catch(() => {});
      }
      return checked;
    },
    start() {
      if (mode === "file") {
        file = file || createFilePlayer();
        file.start();
      } else {
        synth = createSynth();
        synth.start();
      }
    },
    stop() {
      file?.stop();
      synth?.stop();
      synth = null;
    },
  };
}
