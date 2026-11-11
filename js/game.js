/* =========================================================
   Galería de recuerdos — motor del juego
   ========================================================= */
(() => {
  "use strict";

  // ---------- Constantes ----------
  const W = 240, H = 135;          // lo que se ve en pantalla (cámara)
  const WH = 180;                  // alto de cada sala
  const RAIL_Y = 74, FLOOR_TOP = 89, LEDGE_Y = 172;
  const MIN_Y = 98, MAX_Y = 168;
  const FRAME_CY = 42;
  const FIRST_X = 200, SPACING = 132;
  const SPEED = 66;
  const INTERACT_DX = 28, INTERACT_MAXY = 116;
  const FOLLOW_DIST = 17;
  const BACK_X = 34;               // puerta de la izquierda

  const PAL = {
    gold: "#c9a24a", goldHi: "#f0d27a", goldDk: "#7a5a24", ink: "#1a1014",
    floor: "#6e4630", floorLine: "#573620", floorHi: "#7c5139",
  };
  const THEMES = {
    rosa:   { wall: "#5e2a3a", stripe: "#652f40", dot: "#743a4c", carpet: "#7e1a2e", carpetDk: "#5a1020", carpetHi: "#962840" },
    azul:   { wall: "#263456", stripe: "#2a3a5e", dot: "#36477a", carpet: "#1e3a6a", carpetDk: "#122648", carpetHi: "#2c5088" },
    verde:  { wall: "#24443a", stripe: "#284a3f", dot: "#32594b", carpet: "#1f5a3a", carpetDk: "#123a24", carpetHi: "#2c7450" },
    morado: { wall: "#43305a", stripe: "#4a3462", dot: "#5a4278", carpet: "#5a2a6e", carpetDk: "#3a1848", carpetHi: "#74388a" },
  };

  const isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  if (isTouch) document.body.classList.add("touch");

  // ---------- Canvas ----------
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false;

  // ---------- Utilidades ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const mk = (w, h) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    return [c, x];
  };
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

  function arch(c, cx, top, bottom, r, colorFn) {
    for (let y = top; y < bottom; y++) {
      const dy = top + r - y;
      const hw = dy > 0 ? Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy))) : r;
      R(c, cx - hw, y, hw * 2, 1, typeof colorFn === "function" ? colorFn(y) : colorFn);
    }
  }
  const inArch = (x, y, cx, top, r) => {
    const dy = top + r - y;
    const hw = dy > 0 ? Math.sqrt(Math.max(0, r * r - dy * dy)) : r;
    return Math.abs(x - cx) < hw;
  };

  // ---------- Fuente de píxeles 3x5 ----------
  const GLYPHS = {
    A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110",
    E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
    I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
    M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100",
    Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
    U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
    Y: "101101010010010", Z: "111001010100111",
    0: "111101101101111", 1: "010110010010111", 2: "110001010100111", 3: "110001010001110",
    4: "101101111001001", 5: "111100110001110", 6: "011100111101111", 7: "111001010010010",
    8: "111101111101111", 9: "111101111001110",
    "♥": "000101111010000", "!": "010010010000010", ".": "000000000000010", " ": "000000000000000",
    "?": "110001010000010", ",": "000000000010100", "-": "000000111000000", "'": "010010000000000",
    ">": "100010001010100", "<": "001010100010001",
  };
  const normText = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
  const textWidth = (s) => normText(s).length * 4 - 1;
  function pixelText(c, s, x, y, col, center = false) {
    s = normText(s);
    if (center) x = Math.round(x - textWidth(s) / 2);
    c.fillStyle = col;
    for (let i = 0; i < s.length; i++) {
      const g = GLYPHS[s[i]] || GLYPHS["?"];
      for (let p = 0; p < 15; p++) if (g[p] === "1") c.fillRect(x + i * 4 + (p % 3), y + ((p / 3) | 0), 1, 1);
    }
  }
  const HEART7 = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
  const HEART5 = [".X.X.", "XXXXX", ".XXX.", "..X.."];
  function drawPattern(c, pat, x, y, col) {
    c.fillStyle = col;
    pat.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === "X") c.fillRect(x + i, y + j, 1, 1); });
  }

  // ---------- Objetos decorativos ----------
  function makePlant(seed) {
    const [c, x] = mk(20, 26);
    const r = rng(seed);
    for (let y = 16; y < 26; y++) {
      const hw = 6 - Math.floor((y - 16) / 4);
      R(x, 10 - hw, y, hw * 2, 1, y < 18 ? "#d07a4a" : "#a8522e");
    }
    R(x, 3, 15, 14, 2, "#e08a58");
    R(x, 3, 17, 14, 1, "#7a3a20");
    const greens = ["#245a32", "#2f6e3c", "#3f8a4a", "#58a85e"];
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r());
      const px = Math.round(10 + Math.cos(a) * d * 8);
      const py = Math.round(8 + Math.sin(a) * d * 8);
      R(x, px, py, 2, 2, greens[clamp(Math.floor((1 - py / 16) * 3 + r()), 0, 3)]);
    }
    return c;
  }
  function makeBench(theme) {
    const [c, x] = mk(44, 18);
    R(x, 3, 9, 3, 9, "#2a140c"); R(x, 38, 9, 3, 9, "#2a140c");
    R(x, 0, 6, 44, 5, "#5a3422");
    R(x, 0, 6, 44, 1, "#7a4a2e");
    R(x, 0, 10, 44, 1, "#2a140c");
    R(x, 2, 2, 40, 4, theme.carpet);
    R(x, 2, 2, 40, 1, theme.carpetHi);
    for (let i = 6; i < 40; i += 8) R(x, i, 3, 1, 1, theme.carpetDk);
    return c;
  }

  // ---------- Salas y recuerdos ----------
  let memCounter = 0;
  const allMemories = [];

  function buildRoom(def, ri, total) {
    const theme = THEMES[def.theme] || THEMES.rosa;
    const isFirst = ri === 0, isLast = ri === total - 1;
    const memories = (def.memories || []).map((m, i) => {
      const mem = { ...m, room: ri, num: ++memCounter, x: FIRST_X + i * SPACING, w: 48, h: 36, thumb: null, src: null, visited: false };
      allMemories.push(mem);
      return mem;
    });
    const lastX = memories.length ? memories[memories.length - 1].x : FIRST_X - SPACING;
    const doorX = lastX + 150;
    const width = Math.max(W, doorX + 110);
    const room = {
      def, ri, theme, isFirst, isLast, memories, doorX, width,
      objects: [], solids: [], decor: [], lights: [],
      canvas: null, cctx: null, dirty: true, introDone: false,
    };
    const addObject = (sprite, cx, baseY, sw, sh) => {
      room.objects.push({ sprite, x: Math.round(cx - sprite.width / 2), y: baseY - sprite.height, baseY });
      if (sw) room.solids.push({ x1: cx - sw / 2, x2: cx + sw / 2, y1: baseY - sh, y2: baseY });
    };
    const bench = makeBench(theme);
    for (let i = 0; i < memories.length - 1; i++) {
      const mid = memories[i].x + SPACING / 2;
      if (i % 2 === 0) room.decor.push({ type: "window", x: mid, moon: (i + ri) % 4 === 0 });
      else {
        room.decor.push({ type: "column", x: mid });
        addObject(makePlant(ri * 100 + i * 31 + 7), mid, 99, 12, 6);
      }
    }
    memories.forEach((m, i) => { if (i % 2 === 1) addObject(bench, m.x, 160, 40, 8); });
    if (memories.length) room.decor.push({ type: "column", x: lastX + 75 });
    addObject(makePlant(ri * 100 + 99), doorX - 40, 99, 12, 6);
    addObject(makePlant(ri * 100 + 55), doorX + 40, 99, 12, 6);
    addObject(makePlant(ri * 100 + 77), 150, 99, 12, 6);
    room.lights.push({ x: doorX - 34, y: 38 }, { x: doorX + 34, y: 38 });
    return room;
  }

  const roomDefs = CONFIG.rooms && CONFIG.rooms.length ? CONFIG.rooms : [{ name: "", theme: "rosa", memories: CONFIG.memories || [] }];
  const rooms = roomDefs.map((d, i) => buildRoom(d, i, roomDefs.length));

  function setOrientation(m, iw, ih) {
    const r = iw / ih;
    if (r > 1.15) { m.w = 48; m.h = 36; }
    else if (r < 0.87) { m.w = 32; m.h = 44; }
    else { m.w = 40; m.h = 40; }
  }
  function frameRect(m) {
    const fw = m.w + 10, fh = m.h + 10;
    return { x: Math.round(m.x - fw / 2), y: Math.round(FRAME_CY - fh / 2), w: fw, h: fh };
  }
  function makeThumb(img, w, h) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const s = Math.max(w / iw, h / ih);
    let sw = w / s, sh = h / s, sx = (iw - sw) / 2, sy = (ih - sh) / 2;
    let src = img;
    while (sw / 2 > w * 2) {
      const [t, tc] = mk(Math.ceil(sw / 2), Math.ceil(sh / 2));
      tc.imageSmoothingEnabled = true;
      tc.imageSmoothingQuality = "high";
      tc.drawImage(src, sx, sy, sw, sh, 0, 0, t.width, t.height);
      src = t; sw = t.width; sh = t.height; sx = 0; sy = 0;
    }
    const [out, oc] = mk(w, h);
    oc.imageSmoothingEnabled = true;
    oc.imageSmoothingQuality = "high";
    oc.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);
    return out;
  }
  function makePlaceholder(m) {
    const [c, x] = mk(800, 600);
    const hue = (m.num * 47 + 330) % 360;
    const g = x.createLinearGradient(0, 0, 800, 600);
    g.addColorStop(0, `hsl(${hue},45%,32%)`);
    g.addColorStop(1, `hsl(${(hue + 40) % 360},55%,18%)`);
    x.fillStyle = g;
    x.fillRect(0, 0, 800, 600);
    x.fillStyle = "rgba(255,255,255,0.9)";
    HEART7.forEach((row, j) => { for (let i = 0; i < 7; i++) if (row[i] === "X") x.fillRect(337 + i * 18, 170 + j * 18, 18, 18); });
    x.textAlign = "center";
    x.font = "bold 64px 'Pixelify Sans', monospace";
    x.fillText("Foto " + m.num, 400, 390);
    x.font = "28px 'Pixelify Sans', monospace";
    x.fillStyle = "rgba(255,255,255,0.7)";
    x.fillText("No encontré: " + m.photo, 400, 450);
    return c;
  }
  function loadImages() {
    allMemories.forEach((m) => {
      const img = new Image();
      img.onload = () => {
        setOrientation(m, img.naturalWidth, img.naturalHeight);
        m.thumb = makeThumb(img, m.w, m.h);
        m.src = m.photo;
        rooms[m.room].dirty = true;
      };
      img.onerror = () => {
        const ph = makePlaceholder(m);
        setOrientation(m, 4, 3);
        m.thumb = makeThumb(ph, m.w, m.h);
        m.src = ph.toDataURL("image/png");
        rooms[m.room].dirty = true;
      };
      img.src = m.photo;
    });
  }

  // ---------- Dibujo de cada sala ----------
  function drawWindow(c, cx, moon, seed) {
    const r = rng(seed);
    arch(c, cx, 18, 70, 13, "#2a140c");
    arch(c, cx, 20, 68, 11, "#4a2a1a");
    arch(c, cx, 21, 67, 10, (y) => {
      const t = (y - 21) / 46, a = [18, 22, 48], b = [58, 50, 98];
      return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
    });
    for (let i = 0; i < 14; i++) {
      const sx = Math.round(cx - 9 + r() * 18), sy = Math.round(22 + r() * 40);
      if (inArch(sx, sy, cx, 21, 10)) R(c, sx, sy, 1, 1, r() > 0.7 ? "#fff6c8" : "#c8c8ff");
    }
    if (moon) { arch(c, cx + 4, 28, 35, 3, "#f6ecd0"); R(c, cx + 5, 29, 2, 2, "#e0d4b4"); }
    R(c, cx, 21, 1, 46, "#2a140c");
    R(c, cx - 10, 44, 20, 1, "#2a140c");
    R(c, cx - 15, 68, 30, 3, "#7a4a2e");
    R(c, cx - 15, 68, 30, 1, "#9a6a44");
    R(c, cx - 15, 71, 30, 1, "#2a140c");
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? cx - 18 : cx + 12;
      for (let y = 16; y < 76; y++) {
        const tie = y > 50 && y < 54;
        const w = tie ? 3 : y < 50 ? 6 - Math.floor((y - 16) / 12) : 4 + Math.floor((y - 54) / 8);
        const xx = side < 0 ? x0 : x0 + 6 - w;
        R(c, xx, y, w, 1, "#b84a64");
        R(c, side < 0 ? xx + w - 1 : xx, y, 1, 1, "#8a2e46");
        if (!tie && w > 3) R(c, xx + Math.floor(w / 2), y, 1, 1, "#d06a82");
      }
      R(c, side < 0 ? cx - 16 : cx + 14, 51, 3, 3, PAL.gold);
    }
    R(c, cx - 19, 13, 38, 4, "#b84a64");
    for (let x = cx - 19; x < cx + 19; x += 4) R(c, x + 1, 17, 2, 1, "#b84a64");
    R(c, cx - 19, 13, 38, 1, "#d06a82");
    R(c, cx - 20, 12, 40, 1, PAL.gold);
  }

  function drawColumn(c, cx) {
    const m = "#e4d8c8", mh = "#fff6ea", ms = "#bfb09e", md = "#9a8b7a";
    R(c, cx - 8, 10, 16, 3, ms); R(c, cx - 8, 10, 16, 1, mh);
    R(c, cx - 7, 13, 14, 2, m);
    R(c, cx - 6, 15, 12, 65, m);
    for (const fx of [-3, 0, 3]) R(c, cx + fx, 16, 1, 63, ms);
    R(c, cx - 5, 15, 1, 65, mh);
    R(c, cx + 5, 15, 1, 65, md);
    R(c, cx - 7, 80, 14, 2, m);
    R(c, cx - 8, 82, 16, 7, ms); R(c, cx - 8, 82, 16, 1, mh); R(c, cx - 8, 88, 16, 1, md);
  }

  function drawFrame(c, m) {
    const f = frameRect(m);
    R(c, f.x + 2, f.y + 2, f.w, f.h, "rgba(0,0,0,0.35)");
    R(c, f.x, f.y, f.w, f.h, "#2a1808");
    R(c, f.x + 1, f.y + 1, f.w - 2, f.h - 2, PAL.gold);
    R(c, f.x + 1, f.y + 1, f.w - 2, 1, PAL.goldHi);
    R(c, f.x + 1, f.y + 1, 1, f.h - 2, PAL.goldHi);
    R(c, f.x + 1, f.y + f.h - 2, f.w - 2, 1, PAL.goldDk);
    R(c, f.x + f.w - 2, f.y + 1, 1, f.h - 2, PAL.goldDk);
    for (const [ox, oy] of [[2, 2], [f.w - 4, 2], [2, f.h - 4], [f.w - 4, f.h - 4]]) R(c, f.x + ox, f.y + oy, 2, 2, PAL.goldHi);
    R(c, f.x + Math.floor(f.w / 2) - 1, f.y + 1, 2, 2, PAL.goldHi);
    R(c, f.x + 4, f.y + 4, f.w - 8, f.h - 8, "#2a1808");
    if (m.thumb) c.drawImage(m.thumb, f.x + 5, f.y + 5);
    else R(c, f.x + 5, f.y + 5, m.w, m.h, "#2a2030");
    c.fillStyle = "rgba(255,255,255,0.13)";
    for (let i = 0; i < 6; i++) c.fillRect(f.x + 6 + i, f.y + 11 - i, 1, 1);
    for (let i = 0; i < 3; i++) c.fillRect(f.x + 9 + i, f.y + 11 - i, 1, 1);
    const label = String(m.num);
    const pw = Math.max(13, textWidth(label) + 6), py = f.y + f.h + 3;
    R(c, m.x - Math.floor(pw / 2), py, pw, 7, PAL.goldDk);
    R(c, m.x - Math.floor(pw / 2) + 1, py + 1, pw - 2, 5, PAL.gold);
    pixelText(c, label, m.x, py + 1, "#2a1808", true);
    R(c, m.x - 1, 10, 2, 2, "#1a1a1a");
    R(c, m.x - 5, 12, 10, 2, "#2c2c2c");
    R(c, m.x - 5, 12, 10, 1, "#555");
    R(c, m.x - 4, 14, 8, 1, "#fff3c4");
  }

  function drawSign(c, cx, lines) {
    const tw = Math.max(...lines.map((l) => textWidth(l.text)));
    const h = 8 + lines.length * 8 + (lines.length > 2 ? 2 : 0);
    const w = tw + 16, x = Math.round(cx - w / 2), y = 22;
    R(c, x + 2, y + 2, w, h, "rgba(0,0,0,0.35)");
    R(c, x, y, w, h, "#2a140c");
    R(c, x + 1, y + 1, w - 2, h - 2, "#7a4a2e");
    R(c, x + 1, y + 1, w - 2, 1, "#9a6a44");
    R(c, x + 3, y + 3, w - 6, h - 6, "#f3e6cc");
    R(c, x + 3, y + 3, w - 6, 1, "#fff8ea");
    let ly = y + 6;
    lines.forEach((l, i) => {
      if (i === 2) ly += 2;
      pixelText(c, l.text, cx, ly, l.color || "#6e1f2f", true);
      ly += 8;
    });
    R(c, x + 6, y - 6, 1, 6, PAL.goldDk);
    R(c, x + w - 7, y - 6, 1, 6, PAL.goldDk);
  }

  function drawClosedDoor(c, cx) {
    arch(c, cx, 28, 89, 16, "#2a140c");
    arch(c, cx, 30, 89, 14, "#b8a68c");
    arch(c, cx, 33, 89, 11, "#4a2416");
    R(c, cx, 36, 1, 53, "#2a140c");
    for (const s of [-1, 1]) {
      R(c, cx + s * 6 - 3, 46, 6, 14, "#5a2e1c");
      R(c, cx + s * 6 - 3, 66, 6, 16, "#5a2e1c");
    }
    R(c, cx - 3, 63, 2, 3, PAL.gold);
    R(c, cx + 2, 63, 2, 3, PAL.gold);
  }

  // Pasillo abierto hacia otra sala
  function drawPassage(c, cx, label, theme, otherTheme) {
    arch(c, cx, 26, 89, 20, "#2a140c");
    arch(c, cx, 28, 89, 18, "#cdbfa6");
    arch(c, cx, 31, 89, 15, otherTheme.wall);
    arch(c, cx, 31, 89, 15, (y) => `rgba(8,4,6,${clamp(0.85 - (y - 31) / 120, 0.35, 0.85)})`);
    // piso de la otra sala visto a través del arco
    R(c, cx - 15, 80, 30, 9, "#4a2e1e");
    R(c, cx - 8, 80, 16, 9, otherTheme.carpet);
    R(c, cx - 15, 80, 30, 1, "rgba(0,0,0,0.5)");
    // alfombra que entra en esta sala
    R(c, cx - 8, 89, 16, 33, theme.carpet);
    R(c, cx - 8, 89, 1, 33, PAL.gold); R(c, cx + 7, 89, 1, 33, PAL.gold);
    // letrero
    const tw = textWidth(label) + 6;
    R(c, cx - Math.ceil(tw / 2) - 1, 15, tw + 2, 9, "#2a140c");
    R(c, cx - Math.ceil(tw / 2), 16, tw, 7, PAL.gold);
    pixelText(c, label, cx, 17, "#2a1808", true);
    for (const lx of [cx - 30, cx + 30]) {
      R(c, lx - 1, 44, 2, 8, PAL.goldDk);
      R(c, lx - 3, 36, 6, 8, "#2a140c");
      R(c, lx - 2, 37, 4, 6, "#ffd680");
      R(c, lx - 4, 35, 8, 1, PAL.gold);
    }
  }

  function drawEndDoor(c, cx, theme) {
    arch(c, cx, 22, 89, 28, "#2a140c");
    arch(c, cx, 24, 89, 26, "#cdbfa6");
    arch(c, cx, 25, 89, 25, (y) => (y % 6 === 0 ? "#b8a68c" : "#cdbfa6"));
    arch(c, cx, 29, 89, 21, "#2a140c");
    arch(c, cx, 30, 89, 20, "#5a2f1e");
    R(c, cx, 30, 1, 59, "#2a140c");
    for (const s of [-1, 1]) {
      const px = s < 0 ? cx - 16 : cx + 4;
      R(c, px, 42, 12, 16, "#6e3a24"); R(c, px, 42, 12, 1, "#8a4e30");
      R(c, px, 64, 12, 20, "#6e3a24"); R(c, px, 64, 12, 1, "#8a4e30");
    }
    R(c, cx - 4, 59, 2, 5, PAL.gold); R(c, cx + 3, 59, 2, 5, PAL.gold);
    drawPattern(c, HEART7, cx - 3, 12, PAL.gold);
    drawPattern(c, HEART5, cx - 2, 13, "#e05a7a");
    for (const lx of [cx - 34, cx + 34]) {
      R(c, lx - 1, 44, 2, 8, PAL.goldDk);
      R(c, lx - 3, 36, 6, 8, "#2a140c");
      R(c, lx - 2, 37, 4, 6, "#ffd680");
      R(c, lx - 4, 35, 8, 1, PAL.gold);
    }
    R(c, cx - 14, 89, 28, 33, theme.carpet);
    R(c, cx - 14, 89, 1, 33, PAL.gold); R(c, cx + 13, 89, 1, 33, PAL.gold);
  }

  function renderRoom(room) {
    if (!room.canvas) [room.canvas, room.cctx] = mk(room.width, WH);
    const c = room.cctx, Wd = room.width, T = room.theme;
    const r = rng(4242 + room.ri);
    c.clearRect(0, 0, Wd, WH);
    // techo
    R(c, 0, 0, Wd, 7, "#120a10");
    for (let x = 0; x < Wd; x += 4) R(c, x, 5, 2, 2, "#2a1820");
    R(c, 0, 7, Wd, 1, "#2a1820");
    R(c, 0, 8, Wd, 1, PAL.gold);
    R(c, 0, 9, Wd, 1, PAL.goldDk);
    // pared
    R(c, 0, 10, Wd, RAIL_Y - 10, T.wall);
    for (let x = 0; x < Wd; x += 8) R(c, x, 10, 2, RAIL_Y - 10, T.stripe);
    for (let y = 18, row = 0; y < RAIL_Y - 2; y += 11, row++) {
      for (let x = (row % 2) * 8 + 4; x < Wd; x += 16) { R(c, x, y - 1, 1, 3, T.dot); R(c, x - 1, y, 3, 1, T.dot); }
    }
    R(c, 0, 10, Wd, 2, "rgba(0,0,0,0.3)");
    // moldura y zócalo
    R(c, 0, RAIL_Y, Wd, 1, "#2a140c");
    R(c, 0, RAIL_Y + 1, Wd, 1, "#8a5a36");
    R(c, 0, RAIL_Y + 2, Wd, 1, "#5a3422");
    R(c, 0, RAIL_Y + 3, Wd, 84 - RAIL_Y - 3, "#3e1f16");
    R(c, 0, RAIL_Y + 3, Wd, 1, "#4e2a1c");
    for (let x = 10; x < Wd; x += 22) R(c, x, RAIL_Y + 4, 1, 6, "#2a140c");
    R(c, 0, 84, Wd, 1, "#6b4127");
    R(c, 0, 85, Wd, 4, "#2a140c");
    // piso
    R(c, 0, FLOOR_TOP, Wd, LEDGE_Y - FLOOR_TOP, PAL.floor);
    for (let y = FLOOR_TOP, row = 0; y < LEDGE_Y; y += 6, row++) {
      R(c, 0, y, Wd, 1, PAL.floorLine);
      for (let x = (row * 17) % 41; x < Wd; x += 41 + ((row * 7) % 13)) R(c, x, y, 1, 6, PAL.floorLine);
    }
    for (let i = 0; i < Wd * 1.2; i++) R(c, (r() * Wd) | 0, FLOOR_TOP + ((r() * (LEDGE_Y - FLOOR_TOP)) | 0), 2, 1, PAL.floorHi);
    for (let i = 0; i < 4; i++) R(c, 0, FLOOR_TOP + i, Wd, 1, `rgba(10,4,6,${0.4 - i * 0.1})`);
    // alfombra
    const CT = 122, CB = 150;
    R(c, 0, CT, Wd, CB - CT, T.carpet);
    R(c, 0, CT, Wd, 1, PAL.gold); R(c, 0, CB - 1, Wd, 1, PAL.gold);
    R(c, 0, CT + 1, Wd, 1, T.carpetDk); R(c, 0, CB - 2, Wd, 1, T.carpetDk);
    R(c, 0, CT + 3, Wd, 1, "#a0703a"); R(c, 0, CB - 4, Wd, 1, "#a0703a");
    for (let x = 6; x < Wd; x += 14) {
      const my = (CT + CB) >> 1;
      for (let k = 0; k < 4; k++) R(c, x - k, my - 3 + k, 1 + k * 2, 1, T.carpetHi);
      for (let k = 0; k < 3; k++) R(c, x - 2 + k, my + 1 + k, 5 - k * 2, 1, T.carpetHi);
    }
    R(c, 0, LEDGE_Y, Wd, 1, "#3a2018");
    R(c, 0, LEDGE_Y + 1, Wd, WH - LEDGE_Y - 1, "#140a0c");

    // entrada / regreso
    if (room.isFirst) {
      drawClosedDoor(c, BACK_X);
      drawSign(c, 110, [
        { text: "Galeria de" }, { text: "Recuerdos" },
        { text: "♥ " + CONFIG.herName + " ♥", color: "#c2405e" },
      ]);
    } else {
      drawPassage(c, BACK_X, "< SALA " + room.ri, T, rooms[room.ri - 1].theme);
      drawSign(c, 116, [
        { text: "Sala " + (room.ri + 1), color: "#8a6a2a" },
        { text: room.def.name || "" },
      ]);
    }
    room.decor.forEach((d, i) => (d.type === "window" ? drawWindow(c, d.x, d.moon, room.ri * 1000 + i * 97 + 3) : drawColumn(c, d.x)));
    room.memories.forEach((m) => drawFrame(c, m));
    if (room.isLast) drawEndDoor(c, room.doorX, T);
    else drawPassage(c, room.doorX, "SALA " + (room.ri + 2) + " >", T, rooms[room.ri + 1].theme);
    room.dirty = false;
  }

  // ---------- Viñeta ----------
  const [vignette, vc] = mk(W, H);
  {
    const g = vc.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.5)");
    vc.fillStyle = g;
    vc.fillRect(0, 0, W, H);
  }

  // ---------- Personajes ----------
  const SPR = Sprites.makeAll(CONFIG.him || CONFIG.character, CONFIG.her);
  const player = { x: 74, y: 112, facing: "down", moving: false, animT: 0, stepT: 0 };
  const guide = { x: 56, y: 110, facing: "right", moving: false, animT: 0, idleT: 0 };
  let trail = [];
  let roomIdx = 0;
  let room = rooms[0];
  let camX = 0, camY = 0, lastCamX = 0;

  function seedTrail(fromX, fromY) {
    trail = [];
    const d = Math.max(1, Math.hypot(player.x - fromX, player.y - fromY));
    for (let i = 0; i <= d; i++) trail.push({ x: fromX + ((player.x - fromX) * i) / d, y: fromY + ((player.y - fromY) * i) / d });
    guide.x = fromX;
    guide.y = fromY;
  }
  seedTrail(guide.x, guide.y);

  function pushTrail() {
    const l = trail[trail.length - 1];
    if (!l || Math.hypot(l.x - player.x, l.y - player.y) >= 1) {
      trail.push({ x: player.x, y: player.y });
      if (trail.length > 200) trail.shift();
    }
  }
  function faceFrom(dx, dy) {
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
  }
  function updateGuide(dt) {
    let need = FOLLOW_DIST, px = player.x, py = player.y, tx = null, ty = null;
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      const d = Math.hypot(px - p.x, py - p.y);
      if (d >= need && d > 0) { const f = need / d; tx = px + (p.x - px) * f; ty = py + (p.y - py) * f; break; }
      need -= d; px = p.x; py = p.y;
    }
    if (tx === null) { tx = guide.x; ty = guide.y; }
    const dx = tx - guide.x, dy = ty - guide.y;
    guide.moving = Math.hypot(dx, dy) > 0.05;
    if (guide.moving) {
      guide.x = tx; guide.y = ty;
      guide.animT += dt;
      guide.idleT = 0;
      guide.facing = faceFrom(dx, dy);
    } else {
      guide.animT = 0;
      guide.idleT += dt;
      if (guide.idleT > 0.5) guide.facing = faceFrom(player.x - guide.x, player.y - guide.y);
    }
  }

  // ---------- Partículas ----------
  const petals = Array.from({ length: 8 }, () => ({
    x: Math.random() * W, y: Math.random() * H, vy: 4 + Math.random() * 5,
    vx: -3 + Math.random() * 2, ph: Math.random() * 6.28,
    col: ["#f2a7b8", "#e05a7a", "#ffd0dc"][Math.floor(Math.random() * 3)],
    heart: Math.random() < 0.3,
  }));

  // ---------- Estado ----------
  let state = "title"; // title | starting | dialog | play | memory | transition
  let allVisitedSaid = false;
  const keys = { up: false, down: false, left: false, right: false };
  const fadeEl = document.getElementById("fade");

  // ---------- Diálogo ----------
  const dlg = {
    el: document.getElementById("dialog"),
    name: document.getElementById("dialog-name"),
    text: document.getElementById("dialog-text"),
    next: document.getElementById("dialog-next"),
    portrait: document.getElementById("portrait"),
    queue: [], done: null, full: "", shown: 0, typing: false, timer: null,
  };
  const pctx = dlg.portrait.getContext("2d");
  pctx.imageSmoothingEnabled = false;
  function drawPortrait(which) {
    pctx.clearRect(0, 0, 84, 78);
    pctx.drawImage(SPR.him.portrait[which], 0, 0);
  }
  function dialogPlay(lines, done) {
    dlg.queue = lines.map((l) => (typeof l === "string" ? { text: l } : l));
    dlg.done = done || null;
    state = "dialog";
    dlg.el.classList.remove("hidden");
    dialogNext();
  }
  function dialogNext() {
    const line = dlg.queue.shift();
    if (!line) {
      dlg.el.classList.add("hidden");
      state = "play";
      const d = dlg.done;
      dlg.done = null;
      if (d) d();
      return;
    }
    dlg.name.textContent = line.name || CONFIG.guideName;
    dlg.full = line.text;
    dlg.shown = 0;
    dlg.typing = true;
    dlg.text.textContent = "";
    dlg.next.classList.add("waiting");
    typeTick();
  }
  function typeTick() {
    clearTimeout(dlg.timer);
    if (dlg.shown >= dlg.full.length) return dialogFinishTyping();
    const ch = dlg.full[dlg.shown++];
    dlg.text.textContent = dlg.full.slice(0, dlg.shown);
    if (ch.trim()) {
      if (dlg.shown % 2 === 1) Sfx.blip();
      drawPortrait(dlg.shown % 4 < 2 ? "open" : "closed");
    }
    const pause = ".!?…".includes(ch) ? 260 : ch === "," ? 140 : 34;
    dlg.timer = setTimeout(typeTick, pause);
  }
  function dialogFinishTyping() {
    clearTimeout(dlg.timer);
    dlg.typing = false;
    dlg.text.textContent = dlg.full;
    dlg.next.classList.remove("waiting");
    drawPortrait("closed");
  }
  function dialogAdvance() {
    if (dlg.typing) dialogFinishTyping();
    else { Sfx.select(); dialogNext(); }
  }
  dlg.el.addEventListener("click", dialogAdvance);
  setInterval(() => {
    if (state === "dialog" && !dlg.typing && Math.random() < 0.3) {
      drawPortrait("blink");
      setTimeout(() => !dlg.typing && drawPortrait("closed"), 140);
    }
  }, 1000);

  // ---------- Visor de recuerdos ----------
  const mem = {
    el: document.getElementById("memory"),
    img: document.getElementById("memory-img"),
    title: document.getElementById("memory-title"),
    date: document.getElementById("memory-date"),
    text: document.getElementById("memory-text"),
    hint: document.getElementById("memory-hint"),
    current: null, full: "", shown: 0, typing: false, timer: null,
  };
  mem.hint.textContent = isTouch ? "Toca ♥ para volver" : "Presiona E para volver";

  function openMemory(m) {
    state = "memory";
    mem.current = m;
    mem.img.src = m.src || "";
    mem.title.textContent = m.title || "";
    mem.date.textContent = m.date || "";
    mem.date.style.display = m.date ? "" : "none";
    mem.full = m.text || "";
    mem.text.style.display = mem.full ? "" : "none";
    mem.title.style.display = m.title ? "" : "none";
    mem.el.classList.toggle("photo-only", !mem.full);
    mem.shown = 0;
    mem.typing = true;
    mem.text.textContent = "";
    mem.hint.style.visibility = "hidden";
    mem.el.classList.remove("hidden");
    Sfx.chime();
    clearTimeout(mem.timer);
    mem.timer = setTimeout(memTick, 500);
  }
  function memTick() {
    if (mem.shown >= mem.full.length) return memFinish();
    const ch = mem.full[mem.shown++];
    mem.text.textContent = mem.full.slice(0, mem.shown);
    if (ch.trim() && mem.shown % 3 === 0) Sfx.blip();
    const pause = ".!?…".includes(ch) ? 220 : ch === "," ? 110 : 26;
    mem.timer = setTimeout(memTick, pause);
  }
  function memFinish() {
    clearTimeout(mem.timer);
    mem.typing = false;
    mem.text.textContent = mem.full;
    mem.hint.style.visibility = "visible";
  }
  function closeMemory() {
    clearTimeout(mem.timer);
    mem.el.classList.add("hidden");
    const m = mem.current;
    const firstTime = m && !m.visited;
    if (m) m.visited = true;
    state = "play";
    updateCounter();
    Sfx.close();
    if (firstTime && !allVisitedSaid && allMemories.every((x) => x.visited)) {
      allVisitedSaid = true;
      setTimeout(() => { Sfx.sparkle(); dialogPlay(CONFIG.allVisited); }, 350);
    }
  }
  function memAdvance() {
    if (mem.typing) memFinish();
    else closeMemory();
  }
  document.getElementById("memory-close").addEventListener("click", (e) => { e.stopPropagation(); closeMemory(); });
  mem.el.addEventListener("click", memAdvance);

  // ---------- HUD ----------
  const countEl = document.getElementById("count");
  document.getElementById("total").textContent = allMemories.length;
  function updateCounter() { countEl.textContent = allMemories.filter((m) => m.visited).length; }

  const btnMute = document.getElementById("btn-mute");
  btnMute.addEventListener("click", () => {
    Sfx.setMuted(!Sfx.isMuted());
    btnMute.classList.toggle("off", Sfx.isMuted());
  });
  const btnFull = document.getElementById("btn-full");
  if (!document.documentElement.requestFullscreen) btnFull.style.display = "none";
  btnFull.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().then(() => {
      if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {});
    }).catch(() => {});
  });

  // ---------- Cambio de sala ----------
  const roomTitle = document.getElementById("room-title");
  function showRoomTitle(r) {
    document.getElementById("room-title-num").textContent = "Sala " + (r.ri + 1);
    document.getElementById("room-title-name").textContent = r.def.name || "";
    roomTitle.classList.remove("show");
    void roomTitle.offsetWidth;
    roomTitle.classList.add("show");
  }

  function snapCamera() {
    camX = lastCamX = clamp(player.x - W / 2, 0, room.width - W);
    camY = clamp(player.y - 100, 0, WH - H);
  }

  function goRoom(idx, arriveAtEnd) {
    if (idx < 0 || idx >= rooms.length) return;
    state = "transition";
    for (const k in keys) keys[k] = false;
    Sfx.door();
    fadeEl.classList.remove("out");
    setTimeout(() => {
      roomIdx = idx;
      room = rooms[idx];
      if (room.dirty) renderRoom(room);
      const doorX = arriveAtEnd ? room.doorX : BACK_X;
      player.x = doorX + (arriveAtEnd ? -2 : 2);
      player.y = MIN_Y + 10;
      player.facing = "down";
      seedTrail(doorX, MIN_Y);
      snapCamera();
      fadeEl.classList.add("out");
      showRoomTitle(room);
      setTimeout(() => {
        const intro = room.def.intro || [];
        if (!room.introDone && intro.length) { room.introDone = true; dialogPlay(intro); }
        else state = "play";
      }, 1100);
    }, 480);
  }

  // ---------- Interacción ----------
  function nearestTarget() {
    if (player.y > INTERACT_MAXY) return null;
    let best = null, bd = 1e9;
    for (const m of room.memories) {
      const d = Math.abs(player.x - m.x);
      if (d < INTERACT_DX && d < bd) { bd = d; best = { type: "memory", m }; }
    }
    const dEnd = Math.abs(player.x - room.doorX);
    if (dEnd < 24 && dEnd < bd) { bd = dEnd; best = { type: room.isLast ? "end" : "next" }; }
    if (!room.isFirst) {
      const dBack = Math.abs(player.x - BACK_X);
      if (dBack < 20 && dBack < bd) best = { type: "prev" };
    }
    return best;
  }

  function useTarget(t) {
    if (!t) return;
    if (t.type === "memory") { player.facing = "up"; openMemory(t.m); }
    else if (t.type === "end") { player.facing = "up"; dialogPlay(CONFIG.ending); }
    else if (t.type === "next") goRoom(roomIdx + 1, false);
    else if (t.type === "prev") goRoom(roomIdx - 1, true);
  }

  function onAction() {
    if (state === "dialog") return dialogAdvance();
    if (state === "memory") return memAdvance();
    if (state === "title") return startGame();
    if (state !== "play") return;
    useTarget(nearestTarget());
  }

  // ---------- Entrada ----------
  const KEYMAP = {
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
  };
  window.addEventListener("keydown", (e) => {
    if (KEYMAP[e.key]) { keys[KEYMAP[e.key]] = true; e.preventDefault(); }
    if (e.key === "e" || e.key === "E" || e.key === " " || e.key === "Enter" || e.key === "z" || e.key === "Z") {
      e.preventDefault();
      if (!e.repeat) onAction();
    }
    if (e.key === "Escape" && state === "memory") closeMemory();
  });
  window.addEventListener("keyup", (e) => { if (KEYMAP[e.key]) keys[KEYMAP[e.key]] = false; });
  window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; });

  document.querySelectorAll(".dpad button").forEach((b) => {
    const k = b.dataset.key;
    const down = (e) => { e.preventDefault(); keys[k] = true; b.classList.add("pressed"); };
    const up = () => { keys[k] = false; b.classList.remove("pressed"); };
    b.addEventListener("pointerdown", down);
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
    b.addEventListener("pointerleave", up);
  });
  const tAction = document.getElementById("t-action");
  tAction.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    tAction.classList.add("pressed");
    onAction();
  });
  tAction.addEventListener("pointerup", () => tAction.classList.remove("pressed"));
  tAction.addEventListener("pointerleave", () => tAction.classList.remove("pressed"));
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // ---------- Portada ----------
  const titleScreen = document.getElementById("title-screen");
  document.getElementById("title-main").textContent = CONFIG.titleMain;
  document.getElementById("title-small").textContent = CONFIG.titleSmall;
  document.getElementById("title-name").textContent = CONFIG.herName;
  document.getElementById("title-hint").innerHTML = isTouch
    ? "Usa las flechas para caminar y ♥ para mirar los cuadros<br>(mejor con el celular de lado)"
    : "Flechas o WASD para caminar · E o Enter para mirar los cuadros";
  const heartsBg = document.getElementById("hearts-bg");
  for (let i = 0; i < 22; i++) {
    const s = document.createElement("span");
    s.textContent = "♥";
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 10 + Math.random() * 22 + "px";
    s.style.animationDuration = 9 + Math.random() * 10 + "s";
    s.style.animationDelay = -Math.random() * 18 + "s";
    heartsBg.appendChild(s);
  }
  document.getElementById("btn-start").addEventListener("click", startGame);

  function startGame() {
    if (state !== "title") return;
    state = "starting";
    Sfx.ensure();
    Sfx.chime();
    Sfx.startMusic(CONFIG.music);
    titleScreen.classList.add("leaving");
    setTimeout(() => titleScreen.classList.add("hidden"), 1000);
    fadeEl.classList.add("out");
    document.getElementById("hud").classList.remove("hidden");
    const hint = isTouch
      ? "(Usa las flechas para caminar y toca ♥ cuando estés frente a un cuadro o una puerta.)"
      : "(Camina con las flechas y presiona E cuando estés frente a un cuadro o una puerta.)";
    setTimeout(() => {
      room.introDone = true;
      dialogPlay([...CONFIG.intro, ...(room.def.intro || []), { text: hint }], () => showRoomTitle(room));
    }, 1300);
  }

  // ---------- Actualización ----------
  function blocked(x, y) {
    for (const s of room.solids) if (x + 4 > s.x1 && x - 4 < s.x2 && y > s.y1 && y - 3 < s.y2) return true;
    return false;
  }

  function update(dt, t) {
    let vx = 0, vy = 0;
    if (state === "play") {
      vx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      vy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
    }
    player.moving = vx !== 0 || vy !== 0;
    if (player.moving) {
      const len = Math.hypot(vx, vy);
      const nx = clamp(player.x + (vx / len) * SPEED * dt, 10, room.width - 10);
      const ny = clamp(player.y + (vy / len) * SPEED * dt, MIN_Y, MAX_Y);
      if (!blocked(nx, player.y)) player.x = nx;
      if (!blocked(player.x, ny)) player.y = ny;
      if (vx) player.facing = vx > 0 ? "right" : "left";
      else player.facing = vy > 0 ? "down" : "up";
      player.animT += dt;
      player.stepT -= dt;
      if (player.stepT <= 0) { Sfx.step(); player.stepT = 0.3; }
      pushTrail();
      // entrar a otra sala caminando hacia el arco
      if (keys.up && player.y <= MIN_Y + 0.5) {
        const tg = nearestTarget();
        if (tg && (tg.type === "next" || tg.type === "prev")) useTarget(tg);
      }
    } else {
      player.animT = 0;
      player.stepT = 0.05;
    }
    updateGuide(dt);

    const tx = clamp(player.x - W / 2, 0, room.width - W);
    const ty = clamp(player.y - 100, 0, WH - H);
    camX += (tx - camX) * Math.min(1, dt * 5);
    camY += (ty - camY) * Math.min(1, dt * 4);
    const dCam = camX - lastCamX;
    lastCamX = camX;

    for (const p of petals) {
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(t * 1.3 + p.ph) * 5) * dt - dCam * 0.4;
      if (p.y > H + 4) { p.y = -4; p.x = Math.random() * W; }
      if (p.x < -6) p.x += W + 12;
      if (p.x > W + 6) p.x -= W + 12;
    }
  }

  // ---------- Render ----------
  function drawCone(x, half, intensity) {
    const g = ctx.createLinearGradient(0, 14, 0, 104);
    g.addColorStop(0, `rgba(255,232,180,${0.2 * intensity})`);
    g.addColorStop(1, "rgba(255,232,180,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 4, 14);
    ctx.lineTo(x + 4, 14);
    ctx.lineTo(x + half + 12, 104);
    ctx.lineTo(x - half - 12, 104);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255,232,180,${0.08 * intensity})`;
    ctx.beginPath();
    ctx.ellipse(x, 96, half + 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  function glow(x, y, r, col, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${col},${a})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function drawKeycap(x, y) {
    R(ctx, x, y, 11, 10, PAL.ink);
    R(ctx, x + 1, y + 1, 9, 7, "#fff6e6");
    R(ctx, x + 1, y + 8, 9, 1, "#b8a890");
    if (isTouch) pixelText(ctx, "♥", x + 4, y + 2, "#e05a7a");
    else pixelText(ctx, "E", x + 4, y + 2, PAL.ink);
  }
  function drawCharacter(set, ch, t, phase) {
    const px = Math.round(ch.x), py = Math.round(ch.y);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(px - 5, py - 1, 10, 2);
    ctx.fillRect(px - 4, py + 1, 8, 1);
    const dirSet = ch.facing === "up" ? set.up : ch.facing === "down" ? set.down : set.side;
    let name = "idle", bob = 0;
    if (ch.moving) {
      const f = Math.floor(ch.animT * 8) % 4;
      name = ["walk1", "idle", "walk2", "idle"][f];
      bob = f % 2 === 1 ? -1 : 0;
    } else if (((t + phase) % 3.2) < 0.13) name = "blink";
    ctx.drawImage(dirSet[name][ch.facing === "left" ? "L" : "R"], px - 7, py - 22 + bob);
  }

  function render(t) {
    if (room.dirty) renderRoom(room);
    const cx = Math.round(camX), cy = Math.round(camY);
    const inView = (x, pad = 60) => x > cx - pad && x < cx + W + pad;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.setTransform(1, 0, 0, 1, -cx, -cy);
    ctx.drawImage(room.canvas, cx, cy, W, H, cx, cy, W, H);

    const near = state === "play" || state === "dialog" ? nearestTarget() : null;

    for (const m of room.memories) {
      if (!inView(m.x)) continue;
      const isNear = near && near.m === m;
      const flick = 0.92 + Math.sin(t * 7 + m.num) * 0.03 + Math.sin(t * 13.1 + m.num * 2) * 0.02;
      drawCone(m.x, m.w / 2, (isNear ? 1.35 : 0.85) * flick);
      ctx.fillStyle = "rgba(255,240,200,0.55)";
      for (let k = 0; k < 5; k++) {
        const px = m.x + Math.sin(t * 0.4 + k * 1.9 + m.num) * (m.w / 2 + 4);
        const py = 18 + ((t * 5 + k * 17 + m.num * 9) % 80);
        if (Math.sin(t * 2 + k) > -0.3) ctx.fillRect(Math.round(px), Math.round(py), 1, 1);
      }
    }
    for (const l of room.lights) if (inView(l.x, 40)) glow(l.x, l.y, 22 + Math.sin(t * 9 + l.x) * 1.5, "255,200,120", 0.35);
    if (room.isLast && inView(room.doorX)) {
      const a = allVisitedSaid ? 0.28 + Math.sin(t * 2.5) * 0.08 : 0.1;
      glow(room.doorX, 70, 46, "255,170,200", a);
    }

    for (const m of room.memories) {
      if (!inView(m.x)) continue;
      const f = frameRect(m);
      if (near && near.m === m) {
        const a = 0.55 + Math.sin(t * 6) * 0.35;
        ctx.fillStyle = `rgba(255,236,160,${a})`;
        ctx.fillRect(f.x - 2, f.y - 2, f.w + 4, 1);
        ctx.fillRect(f.x - 2, f.y + f.h + 1, f.w + 4, 1);
        ctx.fillRect(f.x - 2, f.y - 2, 1, f.h + 4);
        ctx.fillRect(f.x + f.w + 1, f.y - 2, 1, f.h + 4);
      }
      if (m.visited) {
        drawPattern(ctx, HEART5, f.x + f.w - 4, f.y - 2, PAL.ink);
        drawPattern(ctx, HEART5, f.x + f.w - 4, f.y - 3, "#e05a7a");
      } else {
        const corners = [[f.x, f.y], [f.x + f.w - 1, f.y], [f.x + f.w - 1, f.y + f.h - 1], [f.x, f.y + f.h - 1]];
        const k = Math.floor(t * 1.2 + m.num) % 4;
        const s = Math.sin(t * 4.8 + m.num);
        if (s > 0.2) {
          const [px, py] = corners[k];
          ctx.fillStyle = "#fffbe0";
          ctx.fillRect(px, py - 1, 1, 3);
          ctx.fillRect(px - 1, py, 3, 1);
          if (s > 0.7) { ctx.fillRect(px, py - 2, 1, 1); ctx.fillRect(px, py + 2, 1, 1); ctx.fillRect(px - 2, py, 1, 1); ctx.fillRect(px + 2, py, 1, 1); }
        }
      }
    }

    const drawList = room.objects.filter((o) => inView(o.x));
    drawList.push({ kind: "her", baseY: player.y + 0.01 }, { kind: "him", baseY: guide.y });
    drawList.sort((a, b) => a.baseY - b.baseY);
    for (const o of drawList) {
      if (o.kind === "her") drawCharacter(SPR.her, player, t, 0);
      else if (o.kind === "him") drawCharacter(SPR.him, guide, t, 1.4);
      else {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(o.x + 2, o.baseY - 2, o.sprite.width - 4, 2);
        ctx.drawImage(o.sprite, o.x, o.y);
      }
    }

    if (state === "play" && near) {
      const bounce = Math.round(Math.sin(t * 5) * 1.5);
      drawKeycap(Math.round(player.x) - 5, Math.round(player.y) - 36 + bounce);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const p of petals) {
      ctx.globalAlpha = 0.55;
      if (p.heart) drawPattern(ctx, HEART5, Math.round(p.x), Math.round(p.y), p.col);
      else { ctx.fillStyle = p.col; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 1); ctx.fillRect(Math.round(p.x) + 1, Math.round(p.y) + 1, 1, 1); }
      ctx.globalAlpha = 1;
    }
    ctx.drawImage(vignette, 0, 0);
  }

  // ---------- Tamaño de pantalla ----------
  const stage = document.getElementById("stage");
  function resize() {
    const portrait = window.innerHeight > window.innerWidth;
    document.body.classList.toggle("portrait", portrait);
    document.body.classList.toggle("landscape", !portrait);
    const reserve = isTouch && portrait ? 200 : 0;
    const scale = Math.max(1, Math.min(window.innerWidth / W, (window.innerHeight - reserve) / H));
    stage.style.width = Math.floor(W * scale) + "px";
    stage.style.height = Math.floor(H * scale) + "px";
    document.documentElement.style.setProperty("--s", ((scale * W) / 320).toFixed(3));
  }
  window.addEventListener("resize", resize);
  resize();

  // ---------- Bucle ----------
  loadImages();
  updateCounter();
  snapCamera();
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    update(dt, t);
    render(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
