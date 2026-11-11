/* Sprites de los personajes dibujados con texto.
   Cada letra es un color:
   K contorno · H cabello · h mechones · S piel · E ojos · R rubor · G lentes
   W camisa · w sombra camisa · P pantalón · B zapatos · . transparente */

const Sprites = (() => {
  // ---------- piernas (compartidas) ----------
  const LEGS_DOWN_IDLE = [
    "...KPPKKPPK...",
    "...KPPKKPPK...",
    "...KPPKKPPK...",
    "...KBBKKBBK...",
    "...KKKKKKKK...",
  ];
  const LEGS_DOWN_W1 = [
    "...KPPKKPPK...",
    "...KPPKKPPK...",
    "...KBBKKPPK...",
    "...KKKKKBBK...",
    ".......KKKK...",
  ];
  const LEGS_DOWN_W2 = [
    "...KPPKKPPK...",
    "...KPPKKPPK...",
    "...KPPKKBBK...",
    "...KBBKKKKK...",
    "...KKKK.......",
  ];
  const LEGS_SIDE_IDLE = [
    "....KPPPPPK...",
    "....KPPKPPK...",
    "....KPPKPPK...",
    "....KBBKBBBK..",
    "....KKKKKKKK..",
  ];
  const LEGS_SIDE_WALK = [
    "....KPPPPPK...",
    "...KPPK.KPPK..",
    "..KPPK...KPPK.",
    "..KBBK...KBBBK",
    "..KKKK...KKKKK",
  ];

  // ---------- ÉL (el guía) ----------
  const HIM = {
    headDown: [
      "....KKKKKK....",
      "...KHHHHHHK...",
      "..KHHHHHHHHK..",
      "..KHHHHHHHHK..",
      "..KHSHHHHSHK..",
      "..KSSSSSSSSK..",
      "..KSESSSSESK..",
      "..KSESSSSESK..",
      "..KSRSSSSRSK..",
      "...KSSSSSSK...",
      "....KKSSKK....",
    ],
    bodyDown: [
      "...KWWWWWWK...",
      "..KWWWWWWWWK..",
      ".KWKWWwwWWKWK.",
      ".KWKWWwwWWKWK.",
      ".KSKWWWWWWKSK.",
      "..KKPPPPPPKK..",
    ],
    headUp: [
      "....KKKKKK....",
      "...KHHHHHHK...",
      "..KHHHHHHHHK..",
      "..KHHHHHHHHK..",
      "..KHHHHHHHHK..",
      "..KHHHHHHHHK..",
      "..KHHHHHHHHK..",
      "..KHHHHHHHHK..",
      "..KHHHHHHHHK..",
      "...KHHHHHHK...",
      "....KKSSKK....",
    ],
    bodyUp: [
      "...KWWWWWWK...",
      "..KWWWWWWWWK..",
      ".KWKWWWWWWKWK.",
      ".KWKWWWWWWKWK.",
      ".KSKWWWWWWKSK.",
      "..KKPPPPPPKK..",
    ],
    headSide: [
      "..............",
      "....KKKKKK....",
      "...KHHHHHHK...",
      "..KHHHHHHHHK..",
      "..KHHHHHHHHHK.",
      "..KHHHHSHHSSK.",
      "..KHHHSSSSESK.",
      "..KHHSSSSSESK.",
      "..KHHSSSSSSSK.",
      "...KHSSSSRSK..",
      "....KKSSSKK...",
    ],
    bodySide: [
      "....KWWWWWK...",
      "...KWWWWWWWK..",
      "...KWWwWWWWK..",
      "...KWWwWWWWK..",
      "...KWWSWWWWK..",
      "...KKPPPPPKK..",
    ],
    blinkDown: 6,
    blinkSide: 6,
  };

  // ---------- ELLA (la jugadora) ----------
  // Misma cara, ojos y cuerpo que él; solo cambia el cabello (afro).
  const HER = {
    headDown: [
      "...KKKKKKKK...",
      "..KHHhHHhHHK..",
      ".KHhHHHHHHhHK.",
      "KHHHHhHHhHHHHK",
      "KHhHHHHHHHHhHK",
      "KHHSSSSSSSSHHK",
      "KHhSESSSSEShHK",
      "KHHSESSSSESHHK",
      "KHhSRSSSSRShHK",
      ".KHKSSSSSSKHK.",
      "..KKKKSSKKKK..",
    ],
    bodyDown: HIM.bodyDown,
    headUp: [
      "...KKKKKKKK...",
      "..KHHhHHhHHK..",
      ".KHhHHHHHHhHK.",
      "KHHHHhHHhHHHHK",
      "KHhHHHHHHHHhHK",
      "KHHHhHHhHHHHHK",
      "KHhHHHHHHHhHHK",
      "KHHHHhHHhHHHHK",
      "KHhHHHHHHHHhHK",
      ".KHHhHHHHhHHK.",
      "..KKKKSSKKKK..",
    ],
    bodyUp: HIM.bodyUp,
    headSide: [
      "...KKKKKKK....",
      "..KHHhHHHHK...",
      ".KHhHHHHhHHK..",
      "KHHHHhHHHHHHK.",
      "KHhHHHHHHhHHHK",
      "KHHHhHHSSSSSK.",
      "KHhHHHSSSSESK.",
      "KHHHhHSSSSESK.",
      "KHhHHHSSSSSSK.",
      ".KHHHKSSSSRSK.",
      "..KKKKKSSSKK..",
    ],
    bodySide: HIM.bodySide,
    blinkDown: 6,
    blinkSide: 6,
  };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
    const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  function lighten(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.round(v + (255 - v) * amt);
    const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  function palette(c) {
    return {
      K: "#1a1014",
      H: c.hair,
      h: c.hairShine || lighten(c.hair, 0.15),
      S: c.skin,
      E: "#1a1014",
      R: c.blush || "#f09a9a",
      G: c.glasses ? (c.glassesColor || "#e2c27a") : c.skin,
      W: c.shirt,
      w: shade(c.shirt, -0.18),
      P: c.pants,
      B: c.shoes,
    };
  }

  function build(rows, pal, scale = 1) {
    const h = rows.length, w = rows[0].length;
    const cv = document.createElement("canvas");
    cv.width = w * scale;
    cv.height = h * scale;
    const cx = cv.getContext("2d");
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const ch = rows[y][x];
        if (ch === "." || !pal[ch]) continue;
        cx.fillStyle = pal[ch];
        cx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    return cv;
  }

  function flip(cv) {
    const f = document.createElement("canvas");
    f.width = cv.width;
    f.height = cv.height;
    const fx = f.getContext("2d");
    fx.translate(cv.width, 0);
    fx.scale(-1, 1);
    fx.drawImage(cv, 0, 0);
    return f;
  }

  const blinkRow = (rows, idx) => rows.map((r, i) => (i === idx ? r.replace(/E/g, "S") : r));

  function makeSet(def, colors) {
    const pal = palette(colors);
    // ojos cerrados: si hay lentes, el ojo se pinta del color de los lentes
    const closeEye = (rows, idx) =>
      rows.map((r, i) => (i === idx ? r.replace(/GEG/g, "GGG").replace(/E/g, "S") : r));
    const both = (rows) => {
      const r = build(rows, pal);
      return { R: r, L: flip(r) };
    };
    const D = [...def.headDown, ...def.bodyDown];
    const U = [...def.headUp, ...def.bodyUp];
    const Sd = [...def.headSide, ...def.bodySide];
    return {
      down: {
        idle: both([...D, ...LEGS_DOWN_IDLE]),
        blink: both([...closeEye(def.headDown, def.blinkDown), ...def.bodyDown, ...LEGS_DOWN_IDLE]),
        walk1: both([...D, ...LEGS_DOWN_W1]),
        walk2: both([...D, ...LEGS_DOWN_W2]),
      },
      up: {
        idle: both([...U, ...LEGS_DOWN_IDLE]),
        blink: both([...U, ...LEGS_DOWN_IDLE]),
        walk1: both([...U, ...LEGS_DOWN_W1]),
        walk2: both([...U, ...LEGS_DOWN_W2]),
      },
      side: {
        idle: both([...Sd, ...LEGS_SIDE_IDLE]),
        blink: both([...closeEye(def.headSide, def.blinkSide), ...def.bodySide, ...LEGS_SIDE_IDLE]),
        walk1: both([...Sd, ...LEGS_SIDE_WALK]),
        walk2: both([...Sd, ...LEGS_SIDE_WALK]),
      },
      _pal: pal,
    };
  }

  function makeAll(himColors, herColors) {
    const him = makeSet(HIM, himColors);
    const her = makeSet(HER, herColors);
    // Retrato de él para el cuadro de diálogo (boca animada)
    const base = [...HIM.headDown.slice(0, 10), "...KKKKKKKK...", ...HIM.bodyDown.slice(0, 2)];
    const closed = base.map((r, i) => (i === 9 ? "...KSSKKSSK..." : r));
    const open = closed.map((r, i) => (i === 8 ? "..KSRSKKSRSK.." : r));
    const P = 6;
    him.portrait = {
      closed: build(closed, him._pal, P),
      open: build(open, him._pal, P),
      blink: build(blinkRow(closed, 6), him._pal, P),
    };
    return { him, her };
  }

  return { makeAll };
})();
