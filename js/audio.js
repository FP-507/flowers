/* Sonidos y música generados con Web Audio (sin archivos externos). */

const Sfx = (() => {
  let ac = null, master = null, sfxGain = null, musicGain = null;
  let muted = false, musicStarted = false, musicEl = null, timer = null;

  function ensure() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ac = new AC();
      master = ac.createGain();
      master.connect(ac.destination);
      sfxGain = ac.createGain();
      sfxGain.gain.value = 0.7;
      sfxGain.connect(master);
      musicGain = ac.createGain();
      musicGain.gain.value = 0.55;
      musicGain.connect(master);
    }
    if (ac.state === "suspended") ac.resume();
    return true;
  }

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function note(t, freq, dur, { type = "sine", vol = 0.05, dest = sfxGain, attack = 0.005, slide = 0 } = {}) {
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  const now = () => (ac ? ac.currentTime : 0);

  // ---- efectos ----
  function blip() {
    if (!ac) return;
    note(now(), 520 + Math.random() * 60, 0.045, { type: "square", vol: 0.022 });
  }
  function step() {
    if (!ac) return;
    note(now(), 95 + Math.random() * 25, 0.05, { type: "triangle", vol: 0.045 });
  }
  function select() {
    if (!ac) return;
    note(now(), 660, 0.08, { type: "square", vol: 0.025, slide: 1.5 });
  }
  function chime() {
    if (!ac) return;
    [72, 76, 79, 84].forEach((m, i) => {
      note(now() + i * 0.07, mtof(m), 0.7, { vol: 0.07 });
      note(now() + i * 0.07, mtof(m + 12), 0.3, { vol: 0.015 });
    });
  }
  function close() {
    if (!ac) return;
    note(now(), mtof(79), 0.25, { vol: 0.05 });
    note(now() + 0.06, mtof(72), 0.35, { vol: 0.05 });
  }
  function door() {
    if (!ac) return;
    note(now(), 220, 0.35, { type: "triangle", vol: 0.05, slide: 0.5 });
    [67, 72, 76].forEach((m, i) => note(now() + 0.25 + i * 0.06, mtof(m), 0.4, { vol: 0.04 }));
  }
  function sparkle() {
    if (!ac) return;
    [84, 88, 91, 96].forEach((m, i) => note(now() + i * 0.05, mtof(m), 0.4, { vol: 0.035 }));
  }

  // ---- música: cajita musical original (I–V–vi–IV en Do mayor) ----
  const BPM = 80;
  const E8 = 60 / BPM / 2;
  const CHORDS = [
    [48, 52, 55, 60], // Do
    [43, 47, 50, 55], // Sol
    [45, 48, 52, 57], // La m
    [41, 45, 48, 53], // Fa
  ];
  const ARP = [0, 1, 2, 3, 2, 1, 2, 1];
  const MELODY = [
    [[76, 4], [74, 2], [72, 2]],
    [[74, 4], [71, 2], [67, 2]],
    [[72, 4], [76, 2], [81, 2]],
    [[79, 4], [77, 2], [76, 2]],
    [[76, 4], [79, 2], [84, 2]],
    [[83, 4], [81, 2], [79, 2]],
    [[81, 2], [79, 2], [76, 2], [72, 2]],
    [[74, 6], [null, 2]],
  ];
  let stepIdx = 0, nextTime = 0;

  function playStep(s, t) {
    const bar = Math.floor(s / 8) % 8;
    const pos = s % 8;
    const loop = Math.floor(s / 64);
    const chord = CHORDS[bar % 4];
    note(t, mtof(chord[ARP[pos]] + 12), E8 * 2.2, { vol: 0.03, dest: musicGain });
    if (pos === 0) note(t, mtof(chord[0] - 12), E8 * 7, { vol: 0.07, dest: musicGain, attack: 0.02 });
    if (pos === 4) note(t, mtof(chord[0]), E8 * 3, { vol: 0.025, dest: musicGain, attack: 0.02 });
    if (loop % 2 === 1) {
      let cum = 0;
      for (const [m, len] of MELODY[bar]) {
        if (cum === pos && m) {
          note(t, mtof(m), len * E8 * 1.1, { vol: 0.055, dest: musicGain });
          note(t, mtof(m + 12), len * E8 * 0.4, { vol: 0.012, dest: musicGain });
        }
        cum += len;
      }
    }
  }

  function scheduler() {
    while (nextTime < ac.currentTime + 0.2) {
      playStep(stepIdx, nextTime);
      nextTime += E8;
      stepIdx++;
    }
  }

  function startProcedural() {
    if (timer) return;
    nextTime = ac.currentTime + 0.1;
    timer = setInterval(scheduler, 50);
  }

  function startMusic(src) {
    if (!ensure() || musicStarted) return;
    musicStarted = true;
    if (src) {
      musicEl = new Audio(src);
      musicEl.loop = true;
      musicEl.volume = 0.5;
      musicEl.muted = muted;
      musicEl.addEventListener("error", () => { musicEl = null; startProcedural(); });
      musicEl.play().catch(() => { musicEl = null; startProcedural(); });
    } else {
      startProcedural();
    }
  }

  function setMuted(m) {
    muted = m;
    if (master) master.gain.value = m ? 0 : 1;
    if (musicEl) musicEl.muted = m;
  }

  document.addEventListener("visibilitychange", () => {
    if (!ac) return;
    if (document.hidden) { ac.suspend(); if (musicEl) musicEl.pause(); }
    else { ac.resume(); if (musicEl) musicEl.play().catch(() => {}); }
  });

  return { ensure, blip, step, select, chime, close, sparkle, door, startMusic, setMuted, isMuted: () => muted };
})();
