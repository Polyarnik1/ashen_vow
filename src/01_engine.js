'use strict';
// ================= CORE / CANVAS =================
const W = 320, H = 180, TS = 16;
const $ = id => document.getElementById(id);
const cv = $('game'), ctx = cv.getContext('2d');
const low = document.createElement('canvas'); low.width = W; low.height = H;
const lc = low.getContext('2d');
const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || /[?&]touch=1/.test(location.search);
let PR = 1; // canvas pixels per logical pixel
let FRAME = 0, TIME = 0;

function layout() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const portrait = vh > vw * 1.05;
  document.body.classList.toggle('portrait', portrait);
  document.body.classList.toggle('landscape', !portrait);
  document.body.classList.toggle('touch', isTouch);
  let aw = vw, ah = vh, side = 0;
  if (isTouch && portrait) ah = Math.min(vh * 0.55, vw * H / W + 24);
  if (isTouch && !portrait) { side = clamp(vw * 0.15, 90, 170); aw = vw - side * 2; }
  let s = Math.min(aw / W, ah / H);
  if (!isTouch && s >= 3) s = Math.floor(s);
  const cw = Math.floor(W * s), ch = Math.floor(H * s);
  cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
  cv.style.left = ((vw - cw) / 2) + 'px';
  const top = (isTouch && portrait) ? 12 : (vh - ch) / 2;
  cv.style.top = top + 'px';
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  cv.width = Math.max(W, Math.round(cw * dpr)); cv.height = Math.max(H, Math.round(ch * dpr));
  PR = cv.width / W;
  const pad = $('pad');
  if (pad) {
    if (isTouch && portrait) { const pt = top + ch + 8; pad.style.top = pt + 'px'; pad.style.height = Math.min(vh - pt, 360) + 'px'; }
    else { pad.style.top = '0px'; pad.style.height = vh + 'px'; }
    document.documentElement.style.setProperty('--side', side + 'px');
  }
}
window.addEventListener('resize', layout);
window.addEventListener('orientationchange', () => setTimeout(layout, 200));

// ================= UTIL =================
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const irnd = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function seeded(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; }; }
function hash2(x, y) { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }

// ================= INPUT =================
const Input = {
  held: {}, pressed: {}, t: {}, ax: 0, ay: 0, joy: false, anyPress: false,
  down(b) { if (!this.held[b]) { this.pressed[b] = true; this.t[b] = 0; this.anyPress = true; } this.held[b] = true; },
  up(b) { this.held[b] = false; },
  p(b) { return !!this.pressed[b]; },
  h(b) { return !!this.held[b]; },
  nav(b) { // with auto-repeat
    if (this.pressed[b]) return true;
    const t = this.t[b] || 0;
    return this.held[b] && t > 0.32 && ((t - 0.32) % 0.09) < 1 / 60;
  },
  endFrame() { for (const k in this.pressed) this.pressed[k] = false; this.anyPress = false; for (const k in this.held) if (this.held[k]) this.t[k] = (this.t[k] || 0) + 1 / 60; },
  axis() {
    let x = 0, y = 0;
    if (this.joy) { x = this.ax; y = this.ay; }
    else {
      if (this.held.left) x -= 1; if (this.held.right) x += 1;
      if (this.held.up) y -= 1; if (this.held.down) y += 1;
      const l = Math.hypot(x, y); if (l > 0) { x /= l; y /= l; }
    }
    return { x, y };
  }
};
const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'ok', Enter: 'ok', Space: 'ok', KeyJ: 'ok', NumpadEnter: 'ok', KeyX: 'back', ShiftLeft: 'back', ShiftRight: 'back', Backspace: 'back', KeyK: 'back',
  KeyC: 'menu', Escape: 'menu', Tab: 'menu', KeyM: 'menu' };
window.addEventListener('keydown', e => {
  const b = KEYMAP[e.code]; audioUnlock();
  if (b) { e.preventDefault(); if (!e.repeat) Input.down(b); }
});
window.addEventListener('keyup', e => { const b = KEYMAP[e.code]; if (b) { e.preventDefault(); Input.up(b); } });
window.addEventListener('blur', () => { for (const k in Input.held) Input.held[k] = false; Input.joy = false; Input.ax = Input.ay = 0; });

function setupTouch() {
  const joy = $('joy'), knob = $('knob');
  let jid = null, cx = 0, cy = 0, R = 40;
  const setDirs = (x, y) => {
    const th = 0.38;
    const dirs = { left: x < -th, right: x > th, up: y < -th, down: y > th };
    for (const d in dirs) { if (dirs[d]) Input.down(d); else Input.up(d); }
  };
  const move = e => {
    let dx = e.clientX - cx, dy = e.clientY - cy; const l = Math.hypot(dx, dy);
    if (l > R) { dx *= R / l; dy *= R / l; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    let ax = dx / R, ay = dy / R; const m = Math.hypot(ax, ay);
    if (m < 0.18) { ax = 0; ay = 0; }
    Input.ax = ax; Input.ay = ay; Input.joy = true; setDirs(ax, ay);
  };
  joy.addEventListener('pointerdown', e => {
    e.preventDefault(); audioUnlock(); jid = e.pointerId; joy.setPointerCapture(jid);
    const r = joy.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; R = r.width * 0.36; move(e);
  });
  joy.addEventListener('pointermove', e => { if (e.pointerId === jid) { e.preventDefault(); move(e); } });
  const end = e => { if (e.pointerId !== jid) return; jid = null; knob.style.transform = ''; Input.ax = Input.ay = 0; Input.joy = false; setDirs(0, 0); };
  joy.addEventListener('pointerup', end); joy.addEventListener('pointercancel', end);
  for (const [id, b] of [['bA', 'ok'], ['bB', 'back'], ['bM', 'menu']]) {
    const el = $(id);
    el.addEventListener('pointerdown', e => { e.preventDefault(); audioUnlock(); el.setPointerCapture(e.pointerId); el.classList.add('on'); Input.down(b); });
    const u = e => { el.classList.remove('on'); Input.up(b); };
    el.addEventListener('pointerup', u); el.addEventListener('pointercancel', u);
  }
  cv.addEventListener('pointerdown', e => { e.preventDefault(); audioUnlock(); Input.down('ok'); setTimeout(() => Input.up('ok'), 60); });
  document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  document.addEventListener('gesturestart', e => e.preventDefault());
}

// ================= AUDIO =================
const A = { ctx: null, master: null, sfxG: null, ambG: null, bufs: {}, ready: false, unlocked: false,
  vol: { music: 0.7, sfx: 0.8 } };
try { const v = JSON.parse(localStorage.getItem('ashen_vol') || 'null'); if (v) A.vol = v; } catch (e) {}
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
function audioUnlock() {
  if (A.unlocked) { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); return; }
  A.unlocked = true;
  try {
    A.ctx = new (window.AudioContext || window.webkitAudioContext)();
    A.master = A.ctx.createGain(); A.master.connect(A.ctx.destination);
    A.sfxG = A.ctx.createGain(); A.sfxG.gain.value = A.vol.sfx; A.sfxG.connect(A.master);
    A.ambG = A.ctx.createGain(); A.ambG.gain.value = A.vol.sfx * 0.9; A.ambG.connect(A.master);
    buildSfx(); A.ready = true;
    if (A.ctx.state === 'suspended') A.ctx.resume();
  } catch (e) { console.warn('audio', e); }
  Music.unlock();
}
function sfx(name, o = {}) {
  if (!A.ready) return;
  const b = A.bufs[name]; if (!b) return;
  try {
    const s = A.ctx.createBufferSource(); s.buffer = b;
    s.playbackRate.value = (o.rate || 1) * (o.vary ? rnd(1 - o.vary, 1 + o.vary) : 1);
    const g = A.ctx.createGain(); g.gain.value = o.vol == null ? 1 : o.vol;
    s.connect(g);
    if (o.pan && A.ctx.createStereoPanner) { const p = A.ctx.createStereoPanner(); p.pan.value = o.pan; g.connect(p); p.connect(A.sfxG); }
    else g.connect(A.sfxG);
    s.start();
  } catch (e) {}
}
const _sfxThrottle = {};
function sfxT(name, gap = 0.05, o) { const t = TIME; if (_sfxThrottle[name] && t - _sfxThrottle[name] < gap) return; _sfxThrottle[name] = t; sfx(name, o); }

// --- tiny synth ---
function mkBuf(dur, layers, post) {
  const sr = A.ctx.sampleRate, n = Math.max(1, Math.floor(dur * sr));
  const b = A.ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
  for (const L of layers) layer(d, sr, L);
  if (post) post(d, sr);
  for (let i = 0; i < n; i++) d[i] = Math.tanh(d[i] * 1.2) * 0.85;
  return b;
}
function layer(d, sr, o) {
  const type = o.type || 'sq', f = o.f || 440, f2 = o.f2 == null ? f : o.f2, t0 = o.t0 || 0, dur = o.dur || 0.1;
  const a = o.a || 0.004, vol = o.vol == null ? 0.3 : o.vol, curve = o.curve == null ? 2 : o.curve, vib = o.vib || 0, vibf = o.vibf || 6;
  const lp = o.lp == null ? 1 : o.lp, duty = o.duty || 0.5, hp = o.hp || 0;
  const s0 = Math.floor(t0 * sr), n = Math.floor(dur * sr);
  let ph = 0, y = 0, hv = 0, prev = 0, sh = Math.random() * 2 - 1;
  for (let i = 0; i < n && s0 + i < d.length; i++) {
    const t = i / sr, k = i / n;
    const fr = f * Math.pow(f2 / f, o.lin ? k : k) * (1 + vib * Math.sin(6.283 * vibf * t));
    ph += fr / sr; let wrap = false; if (ph >= 1) { ph -= Math.floor(ph); wrap = true; }
    let v;
    switch (type) {
      case 'sq': v = ph < duty ? 1 : -1; break;
      case 'saw': v = 2 * ph - 1; break;
      case 'tri': v = 1 - 4 * Math.abs(ph - 0.5); break;
      case 'sin': v = Math.sin(6.283 * ph); break;
      case 'nz': if (wrap) sh = Math.random() * 2 - 1; v = sh; break;
      default: v = Math.random() * 2 - 1;
    }
    y += lp * (v - y);
    let out = y;
    if (hp) { hv = hp * (hv + y - prev); prev = y; out = hv; }
    const env = (t < a ? t / a : 1) * Math.pow(1 - k, curve);
    d[s0 + i] += out * env * vol;
  }
}
function bell(freqs, dur, vol = 0.25, t0 = 0) { return freqs.map((f, i) => ({ type: 'sin', f, dur: dur * (1 - i * 0.12), vol: vol / (1 + i * 0.6), curve: 3, t0 })); }
function buildSfx() {
  const B = (n, dur, layers, post) => { A.bufs[n] = mkBuf(dur, layers, post); };
  B('blip', 0.05, [{ type: 'sq', f: 480, dur: 0.04, vol: 0.13, curve: 1, duty: 0.25, lp: 0.5 }]);
  B('move', 0.06, [{ type: 'tri', f: 900, f2: 1000, dur: 0.05, vol: 0.25, curve: 1 }]);
  B('select', 0.14, [{ type: 'sq', f: 660, dur: 0.05, vol: 0.14, duty: 0.25, lp: 0.6 }, { type: 'sq', f: 990, t0: 0.05, dur: 0.08, vol: 0.14, duty: 0.25, lp: 0.6 }]);
  B('cancel', 0.12, [{ type: 'sq', f: 500, f2: 240, dur: 0.1, vol: 0.14, duty: 0.25, lp: 0.5 }]);
  B('deny', 0.15, [{ type: 'sq', f: 140, dur: 0.12, vol: 0.2, duty: 0.5, lp: 0.3 }]);
  B('step', 0.05, [{ type: 'noise', dur: 0.045, vol: 0.18, lp: 0.15, curve: 3 }]);
  B('step2', 0.05, [{ type: 'noise', dur: 0.045, vol: 0.16, lp: 0.1, curve: 3 }]);
  B('slash', 0.28, [{ type: 'noise', dur: 0.24, vol: 0.5, lp: 0.6, hp: 0.9, curve: 2 }, { type: 'saw', f: 1400, f2: 200, dur: 0.18, vol: 0.12, lp: 0.3 }]);
  B('swing', 0.25, [{ type: 'noise', dur: 0.22, vol: 0.35, lp: 0.25, curve: 1.5 }]);
  B('hit', 0.3, [{ type: 'noise', dur: 0.12, vol: 0.6, lp: 0.5 }, { type: 'sin', f: 160, f2: 40, dur: 0.25, vol: 0.7 }, { type: 'sq', f: 220, f2: 60, dur: 0.1, vol: 0.15, lp: 0.3 }]);
  B('crit', 0.7, [{ type: 'noise', dur: 0.15, vol: 0.7, lp: 0.6 }, { type: 'sin', f: 200, f2: 40, dur: 0.3, vol: 0.8 }, ...bell([1560, 2340, 3120], 0.6, 0.2, 0.03)]);
  B('hurt', 0.35, [{ type: 'sq', f: 320, f2: 70, dur: 0.3, vol: 0.25, lp: 0.4 }, { type: 'noise', dur: 0.15, vol: 0.4, lp: 0.4 }]);
  B('parry', 0.9, [{ type: 'noise', dur: 0.03, vol: 0.8, lp: 0.9 }, ...bell([1250, 1873, 2690, 3450, 4410], 0.85, 0.35)]);
  B('graze', 0.06, [{ type: 'tri', f: 2200, f2: 2600, dur: 0.05, vol: 0.12, curve: 1 }]);
  B('alert', 0.4, [{ type: 'sq', f: 880, dur: 0.08, vol: 0.18, duty: 0.25 }, { type: 'sq', f: 1320, t0: 0.09, dur: 0.18, vol: 0.18, duty: 0.25 }]);
  B('shatter', 1.0, [{ type: 'noise', dur: 0.6, vol: 0.5, lp: 0.9, hp: 0.95, curve: 3 }, ...bell([2100, 3300, 4700], 0.9, 0.12), { type: 'sin', f: 90, f2: 30, dur: 0.6, vol: 0.5 }]);
  B('whoosh', 0.6, [{ type: 'noise', dur: 0.55, vol: 0.45, lp: 0.08, curve: 1, a: 0.25 }]);
  B('die', 0.9, [{ type: 'nz', f: 3000, f2: 200, dur: 0.8, vol: 0.4, curve: 2 }, { type: 'sq', f: 400, f2: 50, dur: 0.6, vol: 0.12, lp: 0.3 }]);
  B('spare', 1.2, [...[523, 659, 784, 1046].flatMap((f, i) => bell([f, f * 2.01], 0.8, 0.22, i * 0.09))]);
  B('heal', 1.0, [...[784, 988, 1175, 1568, 1976].map((f, i) => ({ type: 'sin', f, t0: i * 0.07, dur: 0.5, vol: 0.18, curve: 2 })), { type: 'tri', f: 392, dur: 0.9, vol: 0.1, a: 0.1 }]);
  B('holy', 1.6, [{ type: 'saw', f: 220, dur: 1.5, vol: 0.06, lp: 0.05, a: 0.3, vib: 0.01 }, { type: 'saw', f: 277, dur: 1.5, vol: 0.06, lp: 0.05, a: 0.3, vib: 0.01 }, { type: 'saw', f: 330, dur: 1.5, vol: 0.06, lp: 0.05, a: 0.3 }, ...bell([1320, 1980, 2640], 1.4, 0.15, 0.2), { type: 'noise', dur: 1.4, vol: 0.12, lp: 0.9, hp: 0.97, a: 0.4 }]);
  B('levelup', 1.0, [...[392, 523, 659, 784, 1046].map((f, i) => ({ type: 'sq', f, t0: i * 0.08, dur: i === 4 ? 0.6 : 0.09, vol: 0.13, duty: 0.25, lp: 0.6, curve: i === 4 ? 2 : 0.5 }))]);
  B('chest', 0.9, [{ type: 'saw', f: 110, f2: 160, dur: 0.25, vol: 0.12, lp: 0.08, vib: 0.08, vibf: 30 }, ...bell([1046, 1318, 1568], 0.6, 0.2, 0.28)]);
  B('item', 0.6, [{ type: 'sq', f: 1046, dur: 0.08, vol: 0.12, duty: 0.25 }, { type: 'sq', f: 1568, t0: 0.08, dur: 0.35, vol: 0.12, duty: 0.25 }]);
  B('door', 0.6, [{ type: 'noise', dur: 0.2, vol: 0.5, lp: 0.05 }, { type: 'sin', f: 80, f2: 50, dur: 0.3, vol: 0.5 }, { type: 'saw', f: 300, f2: 180, t0: 0.05, dur: 0.4, vol: 0.06, lp: 0.1, vib: 0.1, vibf: 25 }]);
  B('save', 2.0, [...bell([880, 1760, 2637, 3520], 1.9, 0.25), { type: 'sin', f: 440, dur: 1.8, vol: 0.15, a: 0.05 }]);
  B('shoot', 0.12, [{ type: 'sq', f: 900, f2: 300, dur: 0.08, vol: 0.06, duty: 0.25, lp: 0.4 }]);
  B('warn', 0.2, [{ type: 'sq', f: 1200, dur: 0.06, vol: 0.12, duty: 0.25 }, { type: 'sq', f: 1200, t0: 0.1, dur: 0.06, vol: 0.12, duty: 0.25 }]);
  B('boom', 1.2, [{ type: 'noise', dur: 1.1, vol: 0.8, lp: 0.06, curve: 2.5 }, { type: 'sin', f: 70, f2: 25, dur: 0.9, vol: 0.8 }]);
  B('roar', 1.6, [{ type: 'saw', f: 90, f2: 55, dur: 1.5, vol: 0.4, lp: 0.15, vib: 0.08, vibf: 11 }, { type: 'noise', dur: 1.4, vol: 0.35, lp: 0.12, a: 0.1 }, { type: 'saw', f: 134, f2: 80, dur: 1.4, vol: 0.2, lp: 0.1, vib: 0.1, vibf: 7 }]);
  B('bigbell', 3.0, [...bell([196, 392, 466, 587, 784, 1046], 2.9, 0.35)]);
  B('thunder', 2.2, [{ type: 'noise', dur: 0.15, vol: 0.9, lp: 0.7 }, { type: 'noise', dur: 2.1, vol: 0.8, lp: 0.03, curve: 1.5 }]);
  B('splash', 0.6, [{ type: 'noise', dur: 0.5, vol: 0.45, lp: 0.35, hp: 0.6, curve: 2 }, { type: 'sin', f: 600, f2: 200, dur: 0.15, vol: 0.2 }]);
  B('lever', 0.4, [{ type: 'noise', dur: 0.05, vol: 0.6, lp: 0.5 }, { type: 'sq', f: 180, f2: 120, t0: 0.05, dur: 0.12, vol: 0.18, lp: 0.2 }, { type: 'noise', t0: 0.2, dur: 0.08, vol: 0.5, lp: 0.3 }]);
  B('fire', 0.8, [{ type: 'noise', dur: 0.75, vol: 0.45, lp: 0.2, a: 0.05 }, { type: 'nz', f: 60, dur: 0.6, vol: 0.2 }]);
  B('gameover', 2.5, [{ type: 'saw', f: 220, f2: 55, dur: 2.4, vol: 0.2, lp: 0.08 }, { type: 'saw', f: 233, f2: 58, dur: 2.4, vol: 0.15, lp: 0.08 }, ...bell([440, 523], 2, 0.15)]);
  B('push', 0.25, [{ type: 'noise', dur: 0.22, vol: 0.4, lp: 0.04, curve: 0.5 }]);
  B('click', 0.05, [{ type: 'sq', f: 2000, dur: 0.02, vol: 0.12 }]);
  B('magic', 0.8, [...[1200, 1500, 1800, 2400].map((f, i) => ({ type: 'tri', f, f2: f * 1.5, t0: i * 0.05, dur: 0.4, vol: 0.12 })), { type: 'noise', dur: 0.7, vol: 0.12, lp: 0.9, hp: 0.95, a: 0.1 }]);
  B('dash', 0.3, [{ type: 'noise', dur: 0.25, vol: 0.4, lp: 0.35, curve: 1, a: 0.06 }]);
  B('heart', 0.3, [{ type: 'sin', f: 60, f2: 40, dur: 0.12, vol: 0.5 }, { type: 'sin', f: 55, f2: 35, t0: 0.15, dur: 0.12, vol: 0.4 }]);
  B('caw', 0.4, [{ type: 'saw', f: 900, f2: 500, dur: 0.3, vol: 0.18, lp: 0.4, vib: 0.2, vibf: 35 }]);
  B('ghost', 1.4, [{ type: 'sin', f: 400, f2: 300, dur: 1.3, vol: 0.2, vib: 0.06, vibf: 5, a: 0.3 }, { type: 'sin', f: 604, f2: 450, dur: 1.3, vol: 0.12, vib: 0.06, vibf: 5.5, a: 0.3 }]);
  B('chime', 1.4, bell([1318, 1975, 2637], 1.3, 0.25));
  B('rumble', 2.0, [{ type: 'noise', dur: 1.9, vol: 0.6, lp: 0.02, a: 0.3, curve: 1 }]);
  B('light', 1.0, [{ type: 'sin', f: 523, f2: 1046, dur: 0.6, vol: 0.2 }, ...bell([1568, 2093], 0.9, 0.15, 0.3)]);
  B('equip', 0.4, [{ type: 'noise', dur: 0.06, vol: 0.4, lp: 0.6 }, ...bell([1800, 2700], 0.35, 0.18, 0.02)]);
  B('wing', 0.2, [{ type: 'noise', dur: 0.18, vol: 0.3, lp: 0.1, curve: 1 }]);
}

// ambience: looped generated noise beds
const Amb = { cur: null, id: 'none' };
function ambBuf(id) {
  const sr = A.ctx.sampleRate, dur = 4, n = sr * dur, b = A.ctx.createBuffer(2, n, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch); let y = 0, y2 = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n, v = Math.random() * 2 - 1;
      if (id === 'wind') { y += 0.02 * (v - y); y2 += 0.004 * (v - y2); d[i] = (y * 1.8 + y2 * 3) * (0.6 + 0.4 * Math.sin(t * 6.283 * 2 + ch)); }
      else if (id === 'rain') { y += 0.5 * (v - y); d[i] = (y - y2) * 0.35; y2 = y; }
      else if (id === 'fire') { y += 0.05 * (v - y); d[i] = y * 0.8 + (Math.random() < 0.0009 ? (Math.random() - 0.5) * 2.4 : 0); }
      else if (id === 'drip') { y += 0.01 * (v - y); d[i] = y * 0.6; }
      else if (id === 'water') { y += 0.03 * (v - y); y2 += 0.002 * (v - y2); d[i] = (y + y2 * 4) * (0.7 + 0.3 * Math.sin(t * 6.283 * 3 + ch * 2)); }
      else d[i] = 0;
    }
    if (id === 'drip') for (let k = 0; k < 5; k++) { const s0 = Math.floor(Math.random() * (n - sr)), f = 900 + Math.random() * 900; for (let i = 0; i < sr * 0.3; i++) d[s0 + i] += Math.sin(6.283 * f * (1 + i / sr) * i / sr) * Math.exp(-i / sr * 18) * 0.35; }
    // crossfade loop seam
    const fade = Math.floor(sr * 0.05); for (let i = 0; i < fade; i++) { const k = i / fade; d[i] = d[i] * k + d[n - fade + i] * (1 - k); }
  }
  return b;
}
function setAmb(id) {
  if (!A.ready || Amb.id === id) { Amb.id = id; return; }
  Amb.id = id;
  const now = A.ctx.currentTime;
  if (Amb.cur) { const c = Amb.cur; c.g.gain.setTargetAtTime(0, now, 0.4); setTimeout(() => { try { c.s.stop(); } catch (e) {} }, 2500); Amb.cur = null; }
  if (id === 'none') return;
  try {
    const s = A.ctx.createBufferSource(); s.buffer = ambBuf(id); s.loop = true;
    const g = A.ctx.createGain(); g.gain.value = 0; s.connect(g); g.connect(A.ambG); s.start();
    g.gain.setTargetAtTime({ wind: 0.35, rain: 0.5, fire: 0.25, drip: 0.5, water: 0.35 }[id] || 0.3, now, 0.8);
    Amb.cur = { s, g };
  } catch (e) {}
}

// ================= MUSIC (two decks, html audio for reliability) =================
const Music = {
  decks: [], cur: null, id: null, pos: {}, target: 0, unlocked: false,
  init() { for (let i = 0; i < 2; i++) { const el = new Audio(); el.loop = true; el.preload = 'auto'; el.volume = 0; this.decks.push({ el, v: 0, tv: 0, id: null }); } },
  unlock() { if (this.unlocked) return; this.unlocked = true; for (const d of this.decks) { if (!d.id) { d.el.src = SILENT; const p = d.el.play(); if (p) p.catch(() => {}); } } if (this.pending) { const p = this.pending; this.pending = null; this.play(p.id, p.o); } },
  play(id, o = {}) {
    if (!this.unlocked) { this.pending = { id, o }; this.id = id; return; }
    if (this.cur && this.cur.id === id && this.cur.tv > 0) { this.cur.tv = o.vol == null ? 1 : o.vol; return; }
    const old = this.cur;
    if (old) { old.tv = 0; old.fade = o.fade == null ? 1 : o.fade; if (old.id && !old.battle) this.pos[old.id] = old.el.currentTime; }
    let d = this.decks.find(x => x !== old);
    if (d.id && d.id !== id && !d.battle && d.v > 0.001) this.pos[d.id] = d.el.currentTime;
    const same = d.id === id;
    d.id = id; d.battle = !!o.battle; d.tv = o.vol == null ? 1 : o.vol; d.fade = o.fade == null ? 1 : o.fade;
    if (!same) {
      d.el.src = 'music/' + id + '.mp3'; d.v = o.fade === 0 ? d.tv : 0;
      const start = (o.restart || o.battle) ? 0 : (this.pos[id] || 0);
      if (start > 0) { const f = () => { try { d.el.currentTime = start; } catch (e) {} d.el.removeEventListener('loadedmetadata', f); }; d.el.addEventListener('loadedmetadata', f); }
    } else if (o.restart) { try { d.el.currentTime = 0; } catch (e) {} }
    d.el.volume = clamp(d.v * A.vol.music, 0, 1);
    const p = d.el.play(); if (p) p.catch(() => {});
    this.cur = d; this.id = id;
  },
  stop(fade = 1) { if (this.cur) { if (!this.cur.battle) this.pos[this.cur.id] = this.cur.el.currentTime; this.cur.tv = 0; this.cur.fade = fade; } this.cur = null; this.id = null; },
  update(dt) {
    for (const d of this.decks) {
      if (d.v !== d.tv) {
        const sp = d.fade ? dt / d.fade : 1;
        d.v = d.v < d.tv ? Math.min(d.tv, d.v + sp) : Math.max(d.tv, d.v - sp);
        if (d.v <= 0 && d.tv <= 0 && d.id) { d.el.pause(); }
      }
      const vv = clamp(d.v * A.vol.music, 0, 1);
      if (Math.abs(d.el.volume - vv) > 0.001) try { d.el.volume = vv; } catch (e) {}
    }
  }
};
Music.init();

// ================= FONT / TEXT =================
const FONT = 'Pix';
function setFont(sz = 8, w = 400) { ctx.font = `${w} ${sz}px ${FONT}, monospace`; }
function uiT() { ctx.setTransform(PR, 0, 0, PR, 0, 0); }
function text(s, x, y, col = '#e8e4f0', sz = 8, align = 'left', o = {}) {
  setFont(sz, o.w || 400); ctx.textAlign = align; ctx.textBaseline = 'top';
  if (o.shadow !== false) { ctx.fillStyle = o.sc || 'rgba(0,0,0,0.85)'; ctx.fillText(s, x + 0.6, y + 0.6); }
  if (o.outline) { ctx.fillStyle = o.outline; for (const [dx, dy] of [[-0.7, 0], [0.7, 0], [0, -0.7], [0, 0.7]]) ctx.fillText(s, x + dx, y + dy); }
  ctx.fillStyle = col; ctx.fillText(s, x, y);
}
function tw(s, sz = 8) { setFont(sz); return ctx.measureText(s).width; }
function wrap(s, maxW, sz = 8) {
  const out = [];
  for (const para of s.split('\n')) {
    const words = para.split(' '); let line = '';
    for (const w of words) {
      const tst = line ? line + ' ' + w : w;
      if (tw(tst.replace(/\[[a-z\/]\]/g, ''), sz) > maxW && line) { out.push(line); line = w; } else line = tst;
    }
    out.push(line);
  }
  return out;
}
const TCOL = { y: '#ffd75e', r: '#ff5a5a', b: '#7fd0ff', g: '#8cf08c', p: '#d9a0ff', w: '#e8e4f0', s: '#9a95a8' };
// parse color markup into array of {ch,col}
function parseRich(s, base = '#e8e4f0') {
  const out = []; let col = base;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '[' && s[i + 2] === ']') { const c = s[i + 1]; col = c === '/' ? base : (TCOL[c] || base); i += 2; continue; }
    out.push({ ch: s[i], col });
  }
  return out;
}
function drawRich(chars, x, y, n, sz = 8, shake = 0) {
  setFont(sz); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  let cx = x;
  for (let i = 0; i < Math.min(n, chars.length); i++) {
    const c = chars[i]; const w = ctx.measureText(c.ch).width;
    const ox = shake ? rnd(-shake, shake) : 0, oy = shake ? rnd(-shake, shake) : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillText(c.ch, cx + 0.6 + ox, y + 0.6 + oy);
    ctx.fillStyle = c.col; ctx.fillText(c.ch, cx + ox, y + oy);
    cx += w;
  }
}
// UI frame box (logical coords on main canvas)
function box(x, y, w, h, o = {}) {
  ctx.fillStyle = o.bg || 'rgba(8,6,14,0.94)'; ctx.fillRect(x, y, w, h);
  const c = o.border || '#d8d2e6';
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillStyle = o.inner || 'rgba(120,110,150,0.55)';
  ctx.fillRect(x + 2, y + 2, w - 4, 0.5); ctx.fillRect(x + 2, y + h - 2.5, w - 4, 0.5); ctx.fillRect(x + 2, y + 2, 0.5, h - 4); ctx.fillRect(x + w - 2.5, y + 2, 0.5, h - 4);
  // corner studs
  ctx.fillStyle = o.stud || '#8a7fb0';
  for (const [cx, cy] of [[x + 1, y + 1], [x + w - 3, y + 1], [x + 1, y + h - 3], [x + w - 3, y + h - 3]]) ctx.fillRect(cx, cy, 2, 2);
}
function heartCursor(x, y, col = '#ffd75e') {
  // small sword cursor
  ctx.fillStyle = col;
  ctx.fillRect(x, y + 2, 5, 1); ctx.fillRect(x + 5, y + 1, 1, 3); ctx.fillRect(x + 6, y + 2, 2, 1);
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y + 2, 3, 0.6);
}
