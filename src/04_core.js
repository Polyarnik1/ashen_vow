// ================= GAME STATE =================
const NEWG = () => ({
  hp: 40, lv: 1, exp: 0, gold: 0, tp: 0,
  items: ['bread', 'bread'], weapon: 'osword', armor: 'olds', charm: null,
  prayers: ['heal'], flags: {}, defeated: {}, killed: 0, spared: 0, voices: 0,
  map: 'chapel', x: 0, y: 0, dir: 0, time: 0, chapter: 'Пролог'
});
let G = NEWG();
const LVEXP = [0, 15, 40, 80, 140, 220, 330, 470, 650, 880, 1150, 1500, 1900, 2400, 99999];
const ITEMS = {
  bread: { n: 'Чёрствый хлеб', d: 'Восст. 22 ОЗ. Твёрдый, как щит.', heal: 22, price: 8 },
  herb: { n: 'Горькая трава', d: 'Восст. 40 ОЗ. Горечь бодрит.', heal: 40, price: 18 },
  elixir: { n: 'Лунный эликсир', d: 'Восст. 75 ОЗ. Светится в темноте.', heal: 75, price: 40 },
  holy: { n: 'Святая вода', d: 'Полностью восст. ОЗ.', heal: 999, price: 90 },
  candle: { n: 'Огарок свечи', d: '+45% Духа.', tp: 45, price: 25 },
  feather: { n: 'Пепельное перо', d: 'Воскрешает при падении (авто).', price: 120, auto: true },
  doll: { n: 'Тряпичная кукла', d: 'Кукла Лины. Пахнет дымом.', key: true },
  cryptkey: { n: 'Ключ склепа', d: 'Тяжёлый ржавый ключ.', key: true },
  sigil: { n: 'Знак Ордена', d: 'Серебряная луна на цепочке.', key: true },
  stariron: { n: 'Звёздное железо', d: 'Холодный металл с неба.', key: true },
};
const EQUIP = {
  osword: { n: 'Меч Ордена', slot: 'weapon', atk: 2, d: 'Старый, но верный.' },
  ssword: { n: 'Стальной меч', slot: 'weapon', atk: 5, d: 'Работа кузнеца Брама.', price: 60 },
  gsword: { n: 'Клинок Гарета', slot: 'weapon', atk: 8, d: 'Тяжёлый, с золотой гардой.' },
  moon: { n: 'Лунный клинок', slot: 'weapon', atk: 11, d: 'Выкован из звёздного железа.' },
  olds: { n: 'Латы Ордена', slot: 'armor', def: 1, d: 'Помяты сотней лет.' },
  chain: { n: 'Кольчуга', slot: 'armor', def: 3, d: 'Звенит при ходьбе.', price: 50 },
  thorn: { n: 'Латы Терновника', slot: 'armor', def: 5, d: 'С шипами на наплечниках.', price: 120 },
  pale: { n: 'Доспех Бледной Луны', slot: 'armor', def: 8, d: 'Лёгкий, как лунный свет.' },
  lcharm: { n: 'Оберег Лины', slot: 'charm', def: 2, hp: 10, d: 'Плетёный из соломы. +10 ОЗ.' },
  ashring: { n: 'Кольцо пепла', slot: 'charm', atk: 3, d: 'Тёплое на ощупь.' },
  moonst: { n: 'Лунный камень', slot: 'charm', def: 1, graze: 1.6, d: 'Касания дают больше Духа.' },
};
const PRAYERS = {
  heal: { n: 'Исцеление', cost: 32, d: 'Восст. 55% ОЗ.' },
  ward: { n: 'Оберег', cost: 20, d: 'Урон в след. ход -50%.' },
  moon: { n: 'Лунный луч', cost: 40, d: 'Святой урон. Упокаивает нежить.', target: true },
  flurry: { n: 'Шквал клинков', cost: 55, d: 'Три удара подряд.', target: true },
  solace: { n: 'Утешение', cost: 60, d: 'Всем врагам +35% покоя.' },
};
function maxHp() { return 40 + (G.lv - 1) * 9 + eq('hp'); }
function atk() { return 6 + (G.lv - 1) * 2 + eq('atk'); }
function def() { return 1 + Math.floor((G.lv - 1) * 0.8) + eq('def'); }
function eq(stat) { let s = 0; for (const sl of ['weapon', 'armor', 'charm']) { const e = EQUIP[G[sl]]; if (e && e[stat]) s += e[stat]; } return s; }
function grazeMul() { const e = EQUIP[G.charm]; return e && e.graze ? e.graze : 1; }
function hasItem(id) { return G.items.includes(id); }
function addItem(id) { if (G.items.length >= 12 && !ITEMS[id]?.key) return false; G.items.push(id); return true; }
function removeItem(id) { const i = G.items.indexOf(id); if (i >= 0) G.items.splice(i, 1); }
function F(k) { return !!G.flags[k]; }
function setF(k, v = true) { G.flags[k] = v; }

function saveGame() {
  try { localStorage.setItem('ashen_save', JSON.stringify(G)); return true; } catch (e) { return false; }
}
function loadSave() { try { const s = localStorage.getItem('ashen_save'); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function fmtTime(s) { const m = Math.floor(s / 60), h = Math.floor(m / 60); return h + ':' + String(m % 60).padStart(2, '0'); }

// ================= SCRIPT RUNNER =================
const Script = { active: 0, waits: [] };
function waitUntil(fn) { return new Promise(res => Script.waits.push({ fn, res })); }
function updateWaits() { for (let i = Script.waits.length - 1; i >= 0; i--) { const w = Script.waits[i]; let ok = false; try { ok = w.fn(); } catch (e) { ok = true; console.error(e); } if (ok) { Script.waits.splice(i, 1); w.res(); } } }
async function run(fn) { Script.active++; try { await fn(); } catch (e) { console.error(e); } finally { Script.active--; } }
const wait = s => { const t = TIME + s; return waitUntil(() => TIME >= t); };

// ================= FX =================
const Fx = { fade: 0, fadeT: 0, fadeSp: 2, fadeCol: '#000', flashA: 0, flashCol: '#fff', shake: 0, card: null, notes: [], letter: 0 };
function fade(to, dur = 0.6, col = '#000') { Fx.fadeT = to; Fx.fadeSp = dur > 0 ? 1 / dur : 1000; Fx.fadeCol = col; return waitUntil(() => Math.abs(Fx.fade - Fx.fadeT) < 0.001); }
function flash(col = '#fff', a = 1) { Fx.flashCol = col; Fx.flashA = a; }
function shake(s = 3) { Fx.shake = Math.max(Fx.shake, s); }
function note(s, col = '#ffd75e') { Fx.notes.push({ s, col, t: 0 }); }
async function card(title, sub) {
  Fx.card = { title, sub, t: 0 }; sfx('bigbell', { vol: 0.5 });
  await waitUntil(() => Fx.card.t > 3.4); Fx.card = null;
}
function updateFx(dt) {
  if (Fx.fade !== Fx.fadeT) { const s = Fx.fadeSp * dt; Fx.fade = Fx.fade < Fx.fadeT ? Math.min(Fx.fadeT, Fx.fade + s) : Math.max(Fx.fadeT, Fx.fade - s); }
  Fx.flashA = Math.max(0, Fx.flashA - dt * 2.5);
  Fx.shake = Math.max(0, Fx.shake - dt * 12);
  if (Fx.card) Fx.card.t += dt;
  for (const n of Fx.notes) n.t += dt; Fx.notes = Fx.notes.filter(n => n.t < 2.6);
}
function drawFx() {
  uiT();
  if (Fx.flashA > 0) { ctx.globalAlpha = Math.min(1, Fx.flashA); ctx.fillStyle = Fx.flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (Fx.letter > 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 18 * Fx.letter); ctx.fillRect(0, H - 18 * Fx.letter, W, 18 * Fx.letter); }
  if (Fx.card) {
    const t = Fx.card.t, a = t < 0.6 ? t / 0.6 : t > 2.8 ? Math.max(0, 1 - (t - 2.8) / 0.6) : 1;
    ctx.globalAlpha = a * 0.75; ctx.fillStyle = '#000'; ctx.fillRect(0, 60, W, 60); ctx.globalAlpha = a;
    ctx.fillStyle = '#8a7fb0'; ctx.fillRect(60, 68, 200, 0.6); ctx.fillRect(60, 111, 200, 0.6);
    text(Fx.card.title, W / 2, 74, '#f0e6d0', 16, 'center', { w: 600 });
    if (Fx.card.sub) text(Fx.card.sub, W / 2, 96, '#b8b0c8', 8, 'center');
    ctx.globalAlpha = 1;
  }
  let ny = 6;
  for (const n of Fx.notes) {
    const a = n.t < 0.2 ? n.t / 0.2 : n.t > 2.1 ? Math.max(0, 1 - (n.t - 2.1) / 0.5) : 1;
    ctx.globalAlpha = a; const w = tw(n.s, 8) + 14; box(W / 2 - w / 2, ny, w, 15, { border: '#8a7fb0' }); text(n.s, W / 2, ny + 3.5, n.col, 8, 'center'); ny += 18;
    ctx.globalAlpha = 1;
  }
  if (Fx.fade > 0) { ctx.globalAlpha = Fx.fade; ctx.fillStyle = Fx.fadeCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

// ================= DIALOG =================
const VOICE = { hero: 0.8, ivel: 1.5, ansel: 0.7, mirra: 0.9, guido: 1.1, bram: 0.6, lina: 1.6, hosk: 0.75, tomas: 1.0, tomasU: 0.85, gareth: 0.65, garethF: 0.55, king: 0.45, ghost: 1.4, sleeper: 1.0, villager: 1.0 };
const Dlg = { open: false, name: null, port: null, mood: 0, lines: [], n: 0, total: 0, done: false, res: null, pos: 'bottom', voice: 1, speed: 38, shake: 0, auto: 0 };
function say(name, txt, o = {}) {
  return new Promise(res => {
    const port = o.port === undefined ? (PORTDEF[o.p || ''] ? o.p : null) : o.port;
    const maxW = port ? 232 : 286;
    const lines = wrap(txt, maxW, 8);
    const pages = []; for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3));
    let pi = 0;
    const show = () => {
      const pg = pages[pi];
      Object.assign(Dlg, { open: true, name, port, mood: o.m || 0, lines: pg.map(l => parseRich(l, o.col || '#e8e4f0')), n: 0, done: false, pos: o.top ? 'top' : 'bottom', voice: o.v || VOICE[o.p] || 1, speed: o.speed || 40, shake: o.shake || 0, auto: o.auto || 0, autoT: 0 });
      Dlg.total = Dlg.lines.reduce((a, l) => a + l.length, 0);
      Dlg.res = () => { pi++; if (pi < pages.length) show(); else { Dlg.open = false; res(); } };
    };
    show();
  });
}
// narrator helper
const nar = (t, o = {}) => say(null, t, o);
function updateDialog(dt) {
  if (!Dlg.open) return;
  if (!Dlg.done) {
    const prev = Math.floor(Dlg.n);
    let sp = Dlg.speed;
    // slow on punctuation
    const flat = Dlg.lines.flat(); const cur = flat[Math.floor(Dlg.n)];
    if (cur && ',.!?…—'.includes(cur.ch)) sp *= 0.25;
    Dlg.n += dt * sp;
    if (Math.floor(Dlg.n) !== prev && Math.floor(Dlg.n) % 2 === 0) { const c = flat[Math.floor(Dlg.n)]; if (c && c.ch !== ' ') sfx('blip', { rate: Dlg.voice * rnd(0.95, 1.05), vol: 0.8 }); }
    if (Dlg.n >= Dlg.total) { Dlg.n = Dlg.total; Dlg.done = true; }
    if (Input.p('ok') || Input.p('back')) { Dlg.n = Dlg.total; Dlg.done = true; Input.pressed.ok = false; Input.pressed.back = false; }
  } else {
    if (Dlg.auto) { Dlg.autoT += dt; if (Dlg.autoT > Dlg.auto) Dlg.res(); return; }
    if (Input.p('ok')) { Input.pressed.ok = false; Dlg.res(); }
  }
}
function drawDialog() {
  if (!Dlg.open) return;
  uiT();
  const h = 52, y = Dlg.pos === 'top' ? 6 : H - h - 6, x = 10, w = W - 20;
  box(x, y, w, h);
  let tx = x + 10;
  if (Dlg.port) {
    const img = getPortrait(Dlg.port, Dlg.mood);
    if (img) { ctx.imageSmoothingEnabled = false; ctx.drawImage(img, x + 4, y + 2, 48, 48); tx = x + 58; }
  }
  if (Dlg.name) { const nw = tw(Dlg.name, 8) + 12; box(tx - 4, y - 7, nw, 13, { border: '#c8a85a' }); text(Dlg.name, tx + 2, y - 4.5, '#ffd75e', 8); }
  let left = Math.floor(Dlg.n);
  Dlg.lines.forEach((ln, i) => { drawRich(ln, tx, y + 8 + i * 13, left, 8, Dlg.shake); left -= ln.length; });
  if (Dlg.done && !Dlg.auto && Math.floor(TIME * 3) % 2 === 0) { ctx.fillStyle = '#ffd75e'; ctx.fillRect(x + w - 12, y + h - 9, 5, 1); ctx.fillRect(x + w - 11, y + h - 8, 3, 1); ctx.fillRect(x + w - 10, y + h - 7, 1, 1); }
}

// ================= CHOICE / MENU LIST =================
const Choice = { open: false, opts: [], i: 0, res: null, cancel: false, title: null, x: 0, y: 0 };
function choose(opts, o = {}) {
  return new Promise(res => { Object.assign(Choice, { open: true, opts, i: o.def || 0, res, cancel: !!o.cancel, title: o.title || null, side: o.side || 'right' }); });
}
function updateChoice() {
  if (!Choice.open) return;
  const n = Choice.opts.length;
  if (Input.nav('up')) { Choice.i = (Choice.i + n - 1) % n; sfx('move'); }
  if (Input.nav('down')) { Choice.i = (Choice.i + 1) % n; sfx('move'); }
  if (Input.p('ok')) { Input.pressed.ok = false; sfx('select'); Choice.open = false; Choice.res(Choice.i); }
  else if (Input.p('back') && Choice.cancel) { Input.pressed.back = false; sfx('cancel'); Choice.open = false; Choice.res(-1); }
}
function drawChoice() {
  if (!Choice.open) return;
  uiT();
  const w = Math.max(80, ...Choice.opts.map(o => tw(o, 8) + 26), Choice.title ? tw(Choice.title, 8) + 16 : 0);
  const h = Choice.opts.length * 13 + 10 + (Choice.title ? 13 : 0);
  const x = W - w - 14, y = H - 58 - h - 4;
  box(x, y, w, h, { border: '#c8a85a' });
  let yy = y + 6;
  if (Choice.title) { text(Choice.title, x + 8, yy, '#b8b0c8', 8); yy += 13; }
  Choice.opts.forEach((o, i) => { const sel = i === Choice.i; if (sel) heartCursor(x + 6, yy + 2.5); text(o, x + 16, yy, sel ? '#ffd75e' : '#e8e4f0', 8); yy += 13; });
}
