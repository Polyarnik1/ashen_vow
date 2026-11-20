// ================= MAP BUILDER =================
function G2(w, h, f) { return Array.from({ length: h }, () => Array(w).fill(f)); }
function rect(g, x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && g[y][x] !== undefined) g[y][x] = c; }
function disc(g, cx, cy, r, c, rng) { for (let y = cy - r - 1; y <= cy + r + 1; y++) for (let x = cx - r - 1; x <= cx + r + 1; x++) { if (!g[y] || g[y][x] === undefined) continue; const d = (x - cx) ** 2 + (y - cy) ** 2; if (d <= r * r * (rng ? 0.75 + 0.5 * rng() : 1)) g[y][x] = c; } }
function pathL(g, pts, w, c, only) { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1; for (let k = 0; k <= n; k++) { const x = Math.round(lerp(x0, x1, k / n)), y = Math.round(lerp(y0, y1, k / n)); for (let yy = y - w; yy <= y + w; yy++) for (let xx = x - w; xx <= x + w; xx++) if (g[yy] && g[yy][xx] !== undefined && (!only || only.includes(g[yy][xx]))) g[yy][xx] = c; } } }
function scat(g, c, on, dens, rng, cond) { for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) if (on.includes(g[y][x]) && rng() < dens && (!cond || cond(x, y))) g[y][x] = c; }
function nearCh(g, x, y, ch, r = 1) { for (let yy = y - r; yy <= y + r; yy++) for (let xx = x - r; xx <= x + r; xx++) if (g[yy] && g[yy][xx] === ch) return true; return false; }
function put(g, x, y, c) { if (g[y] && g[y][x] !== undefined) g[y][x] = c; }
function rows(g) { return g.map(r => r.join('')); }
function clearAround(g, list, ch = '.') { for (const [x, y] of list) { const c = g[y] && g[y][x]; if (c && 'TDbrgB+CmFkK"'.includes(c)) g[y][x] = ch; } }

const MAPS = {};
// ---------- CHAPEL ----------
(() => {
  const g = G2(20, 14, '#');
  rect(g, 1, 2, 18, 12, '.');
  rect(g, 9, 3, 10, 12, '_');
  put(g, 9, 2, 'A'); put(g, 10, 2, '_');
  for (const y of [4, 6]) { put(g, 3, y, 'p'); put(g, 5, y, 'p'); put(g, 13, y, 'p'); put(g, 15, y, 'p'); }
  put(g, 9, 8, 'X'); put(g, 10, 8, '_');
  for (const [x, y] of [[1, 2], [2, 2], [17, 2], [18, 2]]) put(g, x, y, 'h');
  for (const [x, y] of [[4, 2], [15, 2], [2, 10], [17, 10], [6, 9], [13, 9]]) put(g, x, y, 'c');
  for (const [x, y] of [[1, 12], [18, 12], [5, 8], [14, 8]]) put(g, x, y, 'P');
  put(g, 10, 13, '_');
  for (const x of [3, 16]) put(g, x, 1, 'W'); put(g, 7, 1, 't'); put(g, 12, 1, 't'); put(g, 9, 1, 'n'); put(g, 10, 1, 'n');
  put(g, 1, 7, 'k'); put(g, 18, 5, 'w');
  MAPS.chapel = {
    name: 'Пепельная часовня', base: 'stone', wall: 'wall', rows: rows(g), music: 't01', amb: 'fire', dark: 0.55, weather: ['embers'], battleBg: 'chapel', battleMusic: 't05',
    ents: [
      { type: 'npc', id: 'ansel', x: 7, y: 9, char: 'ansel', dir: 2, talk: 'ansel' },
      { type: 'shrine', id: 's1', x: 16, y: 9 },
      { type: 'chest', id: 'c1', x: 2, y: 4, item: 'herb' },
      { type: 'exit', x: 10, y: 13, to: 'forest', tx: 24, ty: 38, dir: 0 },
      { type: 'trigger', id: 'leave', x: 9, y: 12, w: 2, h: 1, cond2: () => !F('rat_done'), run: async () => { await say('Ансельм', 'Постой, сэр Ардан! Сначала... разберись с крысой у дверей.', { p: 'ansel' }); await walk('player', 10, 10); } },
    ],
    look: { '9,2': async () => nar('Алтарь Ордена Бледной Луны. На ткани вышит серебряный полумесяц.'), '10,2': async () => nar('Алтарь Ордена. Свечи горят сто лет и не тают.'), '9,8': async () => nar('Каменный саркофаг. Внутри — только пепел... и вмятина в форме человека.'), '10,8': async () => nar('На крышке выбито: «СЭР АРДАН. ДА НЕ ПОГАСНЕТ ЛУНА».') },
    onEnter: async () => { if (!F('intro_done')) await STORY.chapelWake(); }
  };
})();

// ---------- FOREST ----------
(() => {
  const w = 48, h = 40, r = seeded(42); const g = G2(w, h, 'T');
  const main = [[24, 39], [24, 31], [23, 25], [24, 18], [22, 12], [21, 6], [21, 0]];
  pathL(g, main, 2, '.');
  disc(g, 24, 25, 6, '.', r);
  pathL(g, [[19, 24], [13, 22], [8, 17]], 1, '.'); disc(g, 8, 17, 5, '.', r);
  pathL(g, [[29, 25], [35, 23], [39, 20]], 1, '.'); disc(g, 39, 20, 5, '.', r);
  disc(g, 20, 5, 5, '.', r);
  rect(g, 17, 31, 31, 39, '.');
  pathL(g, [[30, 34], [38, 33], [42, 30]], 1, '.'); disc(g, 42, 29, 3, '.', r);
  scat(g, '"', ['.'], 0.3, r);
  scat(g, 'D', ['T'], 0.12, r);
  scat(g, 'b', ['.', '"'], 0.05, r, (x, y) => nearCh(g, x, y, 'T') && !nearCh(g, x, y, ':', 2));
  scat(g, 'r', ['.', '"'], 0.02, r, (x, y) => nearCh(g, x, y, 'T'));
  scat(g, 'm', ['.', '"'], 0.03, r, (x, y) => nearCh(g, x, y, 'T'));
  scat(g, 'F', ['.', '"'], 0.04, r);
  pathL(g, main, 0, ':');
  pathL(g, [[19, 24], [13, 22], [8, 17]], 0, ':'); pathL(g, [[29, 25], [35, 23], [39, 20]], 0, ':');
  // grave grove
  for (const [x, y] of [[37, 17], [39, 17], [41, 17], [37, 22], [41, 22], [43, 19]]) put(g, x, y, Math.random() < 0.5 ? 'g' : '+');
  for (const [x, y] of [[36, 19], [42, 21]]) put(g, x, y, 'k');
  rect(g, 20, 32, 28, 37, '.');
  clearAround(g, [[24, 38], [24, 37], [27, 24], [24, 30], [7, 16], [8, 18], [41, 19], [42, 29], [17, 4], [20, 5], [21, 1], [22, 1], [23, 1], [20, 1], [19, 1]]);
  const ents = [
    { type: 'house', id: 'chap', x: 20, y: 33, w: 9, h: 5, door: 4, doorOpen: true, roof: '#26222e', wall: '#3a3a4a', windows: [0.18, 0.82], chimney: false },
    { type: 'exit', x: 24, y: 37, to: 'chapel', tx: 10, ty: 12, dir: 3 },
    { type: 'shrine', id: 's2', x: 27, y: 24 },
    { type: 'sign', x: 25, y: 30, text: '↑ Терновая Стена.  ← Старая роща.  → Забытые могилы.' },
    { type: 'npc', id: 'lantern', x: 7, y: 16, talk: 'ivelMeet', obj: 'lantern', fixed: true, cond: () => !F('ivel'), light: [30, 'blue'] },
    { type: 'chest', id: 'f1', x: 41, y: 19, item: 'herb' },
    { type: 'chest', id: 'f2', x: 42, y: 29, gold: 20 },
    { type: 'chest', id: 'f3', x: 17, y: 4, item: 'candle' },
    { type: 'enemy', id: 'e1', x: 22, y: 27, mon: 'ashrat' },
    { type: 'enemy', id: 'e2', x: 12, y: 21, mon: 'wisp', flying: true },
    { type: 'enemy', id: 'e3', x: 26, y: 20, mon: 'mistwolf', speed: 58 },
    { type: 'enemy', id: 'e4', x: 35, y: 23, mon: 'sporecap' },
    { type: 'enemy', id: 'e5', x: 39, y: 21, mon: 'wisp', flying: true, group: ['wisp', 'ashrat'] },
    { type: 'enemy', id: 'e6', x: 22, y: 8, mon: 'mistwolf', speed: 58, group: ['mistwolf', 'sporecap'] },
    { type: 'enemy', id: 'e7', x: 9, y: 19, mon: 'sporecap' },
    { type: 'exit', x: 19, y: 0, w: 5, h: 1, to: 'village', tx: 22, ty: 33, dir: 3 },
    { type: 'trigger', id: 'fogmsg', x: 19, y: 14, w: 7, h: 1, cond2: () => !F('ivel'), run: async () => { await nar('Впереди стена густого тумана. Сквозь неё ничего не видно... Нужен свет.'); await walk('player', Math.floor(World.player.x / 16), 15); } },
  ];
  for (let x = 0; x < w; x++) if (g[12][x] !== 'T' && g[12][x] !== 'D') ents.push({ type: 'gate', id: 'fog' + x, x, y: 12, flag: 'ivel', spr: 'fog' });
  MAPS.forest = { name: 'Туманный лес', base: 'grass', alt: 'dgrass', wall: 'rock', rows: rows(g), music: 't08', amb: 'wind', dark: 0.5, darkCol: 'rgb(4,8,10)', weather: ['fog', 'motes'], battleBg: 'forest', battleMusic: 't05', playerLight: 60, ents,
    onEnter: async () => { if (!F('forest_card')) { setF('forest_card'); await card('Глава I', 'Фонарь в тумане'); } areaCard('Туманный лес'); } };
})();

// ---------- VILLAGE (Thornwall) ----------
(() => {
  const w = 46, h = 36, r = seeded(7); const g = G2(w, h, '.');
  rect(g, 0, 0, w - 1, 0, '#'); rect(g, 0, h - 1, w - 1, h - 1, '#'); rect(g, 0, 0, 0, h - 1, '#'); rect(g, w - 1, 0, w - 1, h - 1, '#');
  rect(g, 0, 1, w - 1, 1, '#');
  rect(g, 22, 0, 23, 1, ';'); rect(g, 22, h - 1, 23, h - 1, ';'); rect(g, w - 1, 17, w - 1, 18, ';');
  scat(g, '"', ['.'], 0.18, r);
  pathL(g, [[22, 35], [22, 2]], 0, ';'); pathL(g, [[23, 35], [23, 2]], 0, ';');
  pathL(g, [[12, 17], [45, 17]], 0, ';'); pathL(g, [[12, 18], [45, 18]], 0, ';');
  pathL(g, [[9, 10], [22, 10]], 0, ';'); pathL(g, [[23, 9], [34, 9]], 0, ';');
  pathL(g, [[12, 18], [12, 26]], 0, ';');
  // graveyard
  for (let y = 19; y <= 32; y++) { put(g, 1, y, 'f'); put(g, 10, y, 'f'); } for (let x = 1; x <= 10; x++) { put(g, x, 19, 'f'); put(g, x, 32, 'f'); }
  put(g, 10, 25, '.'); put(g, 10, 26, '.');
  for (const [x, y] of [[3, 21], [5, 21], [7, 21], [3, 24], [7, 24], [3, 30], [5, 30], [8, 29], [8, 22]]) put(g, x, y, (x + y) % 2 ? 'g' : '+');
  put(g, 5, 27, '%'); put(g, 4, 27, 'D'); put(g, 6, 26, 'k');
  put(g, 22, 15, 'Q'); put(g, 23, 15, '.');
  for (const [x, y] of [[20, 13], [25, 13], [20, 21], [25, 21], [14, 16], [32, 16], [40, 16], [21, 30], [24, 30], [16, 11]]) put(g, x, y, 'L');
  put(g, 27, 13, 'G'); put(g, 28, 13, '.'); put(g, 29, 13, 'C'); put(g, 30, 14, 'B'); put(g, 26, 14, 'C');
  put(g, 13, 12, 'O'); put(g, 14, 12, '.'); put(g, 16, 13, 'a'); put(g, 12, 14, 'B');
  put(g, 36, 28, 'q'); put(g, 37, 28, '.'); for (const [x, y] of [[40, 30], [41, 30], [17, 31], [29, 25], [30, 25]]) put(g, x, y, 'B');
  for (const [x, y] of [[3, 3], [43, 3], [3, 15], [43, 32], [27, 32], [15, 33], [38, 23], [42, 9]]) put(g, x, y, 'T');
  for (let x = 30; x <= 34; x++) put(g, x, 31, 'f');
  scat(g, 'F', ['.', '"'], 0.03, r);
  const ents = [
    { type: 'house', id: 'mirra', x: 4, y: 4, w: 7, h: 5, door: 4, roof: '#3a2a3a', wall: '#4a3a2e', chimney: true },
    { type: 'house', id: 'inn', x: 28, y: 3, w: 9, h: 5, door: 4, roof: '#2e2a3a', wall: '#4a3428', chimney: true, windows: [0.15, 0.4, 0.85] },
    { type: 'house', id: 'hA', x: 14, y: 22, w: 6, h: 4, door: 2, roof: '#2a3030', wall: '#3e3228' },
    { type: 'house', id: 'hB', x: 30, y: 21, w: 7, h: 4, door: 3, roof: '#342a2a', wall: '#45362a', chimney: true },
    { type: 'house', id: 'hC', x: 37, y: 10, w: 6, h: 5, door: 2, roof: '#2a2a36', wall: '#3e3428' },
    { type: 'npc', id: 'mirra', x: 9, y: 11, char: 'mirra', talk: 'mirra' },
    { type: 'npc', id: 'guido', x: 28, y: 15, char: 'guido', talk: 'guido' },
    { type: 'npc', id: 'bram', x: 15, y: 14, char: 'bram', talk: 'bram', dir: 1 },
    { type: 'npc', id: 'lina', x: 20, y: 16, char: 'lina', talk: 'lina', wander: true },
    { type: 'npc', id: 'hosk', x: 43, y: 16, char: 'hosk', talk: 'hosk', dir: 1, cond: () => !F('eastgate') },
    { type: 'npc', id: 'hosk2', x: 43, y: 15, char: 'hosk', talk: 'hosk', dir: 0, cond: () => F('eastgate') },
    { type: 'npc', id: 'vA', x: 18, y: 27, char: 'villagerA', talk: 'vA', wander: true },
    { type: 'npc', id: 'vB', x: 33, y: 27, char: 'villagerB', talk: 'vB', wander: true },
    { type: 'npc', id: 'vC', x: 27, y: 9, char: 'villagerC', talk: 'vC' },
    { type: 'npc', id: 'vD', x: 38, y: 19, char: 'villagerD', talk: 'vD', wander: true },
    { type: 'npc', id: 'gareth_v', x: 25, y: 11, char: 'gareth', talk: 'garethV', cond: () => F('gareth_spared') },
    { type: 'shrine', id: 's3', x: 25, y: 16 },
    { type: 'sign', x: 21, y: 33, text: 'ТЕРНОВАЯ СТЕНА. Путник, шипы — для мёртвых, а не для тебя.' },
    { type: 'sign', x: 11, y: 24, text: 'Кладбище Ордена. Не тревожьте покой спящих.' },
    { type: 'exit', x: 22, y: 35, w: 2, h: 1, to: 'forest', tx: 21, ty: 1, dir: 0 },
    { type: 'exit', x: 45, y: 17, w: 1, h: 2, to: 'cathedral', tx: 17, ty: 32, dir: 3, need: () => F('eastgate'), needMsg: 'Восточные ворота заперты. Стражник Хоск никого не пускает.' },
    { type: 'exit', x: 22, y: 0, w: 2, h: 1, to: 'keep', tx: 22, ty: 38, dir: 3, need: () => F('northgate'), needMsg: 'Северные ворота запечатаны серебряной луной. Нужен Знак Ордена.' },
    { type: 'exit', x: 5, y: 27, to: 'crypt', tx: 19, ty: 2, dir: 0, need: () => hasItem('cryptkey'), needMsg: 'Ступени уходят под землю. Решётка заперта на тяжёлый замок.' },
  ];
  MAPS.village = { name: 'Терновая Стена', base: 'grass', alt: 'dgrass', wall: 'hedge', rows: rows(g), music: 't07', amb: 'wind', dark: 0.42, darkCol: 'rgb(8,6,14)', weather: ['ash'], battleBg: 'forest', battleMusic: 't05', playerLight: 60, ents,
    look: { '22,15': async () => nar('Старый колодец. Где-то глубоко внизу мерцает отражение луны.'), '13,12': async () => nar('Горн кузницы. Угли светятся оранжевым.') },
    onEnter: async () => { if (!F('village_card')) { setF('village_card'); await card('Глава II', 'Терновая Стена'); await STORY.villageArrive(); } else areaCard('Терновая Стена'); } };
})();

// ---------- CATHEDRAL ----------
(() => {
  const g = G2(36, 34, '#');
  rect(g, 1, 2, 8, 8, '.'); rect(g, 11, 2, 24, 8, '.'); rect(g, 27, 2, 34, 8, '.');
  rect(g, 10, 11, 25, 26, '.'); rect(g, 1, 11, 8, 21, '.'); rect(g, 27, 11, 34, 21, '.');
  rect(g, 12, 28, 23, 32, '.'); rect(g, 17, 27, 18, 27, '.'); rect(g, 17, 33, 18, 33, '.');
  rect(g, 9, 15, 9, 16, '.'); rect(g, 26, 15, 26, 16, '.');
  rect(g, 4, 9, 5, 10, '.'); rect(g, 30, 9, 31, 10, '.'); rect(g, 17, 9, 18, 10, '.');
  rect(g, 17, 2, 18, 8, '_'); rect(g, 17, 9, 18, 33, '_');
  for (const y of [13, 15, 17, 19, 21, 23]) for (const x of [11, 13, 21, 23]) { put(g, x, y, 'p'); put(g, x + 1, y, '.'); }
  for (const [x, y] of [[10, 11], [25, 11], [10, 26], [25, 26], [12, 28], [23, 28], [1, 2], [8, 2], [27, 2], [34, 2]]) put(g, x, y, 'U');
  put(g, 17, 3, 'A'); put(g, 18, 3, '_');
  for (const x of [3, 6, 13, 22, 29, 32]) put(g, x, 1, 'W'); for (const x of [15, 20]) put(g, x, 1, 't');
  for (const x of [12, 15, 20, 23]) put(g, x, 10, x % 2 ? 't' : 'W'); put(g, 2, 10, 't'); put(g, 7, 10, 't'); put(g, 28, 10, 't'); put(g, 33, 10, 't');
  put(g, 14, 27, 't'); put(g, 21, 27, 't'); put(g, 13, 27, 'n'); put(g, 22, 27, 'n');
  put(g, 6, 3, 'E'); put(g, 7, 3, '.'); put(g, 28, 5, 'E'); put(g, 29, 5, '.');
  for (const [x, y] of [[12, 3], [23, 3], [14, 7], [21, 7], [2, 20], [33, 20], [13, 31], [22, 31], [11, 25], [24, 25]]) put(g, x, y, 'c');
  for (const [x, y] of [[1, 21], [8, 11], [34, 13], [27, 21], [24, 2], [11, 2]]) put(g, x, y, 'w');
  for (const [x, y] of [[29, 12], [34, 12]]) put(g, x, y, 'o');
  for (const [x, y] of [[31, 15], [28, 18], [32, 19]]) put(g, x, y, 'C');
  for (const [x, y] of [[3, 15], [6, 18], [2, 6]]) put(g, x, y, 'k');
  put(g, 16, 30, 'h'); put(g, 19, 30, 'h');
  const ents = [
    { type: 'exit', x: 17, y: 33, w: 2, h: 1, to: 'village', tx: 44, ty: 17, dir: 1 },
    { type: 'shrine', id: 's4', x: 14, y: 30 },
    { type: 'gate', id: 'gS1', x: 17, y: 9, flag: 'bells' }, { type: 'gate', id: 'gS2', x: 18, y: 9, flag: 'bells' },
    { type: 'gate', id: 'gW1', x: 4, y: 9, flag: 'lv1' }, { type: 'gate', id: 'gW2', x: 5, y: 9, flag: 'lv1' },
    { type: 'gate', id: 'gE1', x: 30, y: 9, flag: 'cath_plates' }, { type: 'gate', id: 'gE2', x: 31, y: 9, flag: 'cath_plates' },
    { type: 'lever', id: 'lv1', x: 2, y: 12, flag: 'lv1', act: e => STORY.lever(e) },
    { type: 'lever', id: 'lv3', x: 4, y: 3, flag: 'lv3', act: e => STORY.lever(e) },
    { type: 'lever', id: 'lv2', x: 33, y: 3, flag: 'lv2', act: e => STORY.lever(e) },
    { type: 'block', id: 'b1', x: 29, y: 14 }, { type: 'block', id: 'b2', x: 33, y: 16 },
    { type: 'chest', id: 'k1', x: 28, y: 3, item: 'doll' },
    { type: 'chest', id: 'k2', x: 7, y: 20, item: 'elixir' },
    { type: 'chest', id: 'k3', x: 2, y: 7, gold: 45 },
    { type: 'chest', id: 'k4', x: 21, y: 30, item: 'bread' },
    { type: 'enemy', id: 'c1', x: 5, y: 16, mon: 'rustarmor', speed: 40 },
    { type: 'enemy', id: 'c2', x: 15, y: 20, mon: 'gargoyle', flying: true },
    { type: 'enemy', id: 'c3', x: 20, y: 14, mon: 'bellwraith', flying: true },
    { type: 'enemy', id: 'c4', x: 30, y: 17, mon: 'rustarmor', speed: 40, group: ['rustarmor', 'bellwraith'] },
    { type: 'enemy', id: 'c5', x: 6, y: 6, mon: 'gargoyle', flying: true, group: ['gargoyle', 'gargoyle'] },
    { type: 'enemy', id: 'c6', x: 31, y: 6, mon: 'bellwraith', flying: true },
    { type: 'enemy', id: 'c7', x: 18, y: 24, mon: 'rustarmor', speed: 40 },
    { type: 'boss', id: 'bishop', x: 17, y: 5, mon: 'bishop', cond: () => !F('bishop_done'), talk: 'bishop', fixed: true },
    { type: 'trigger', id: 'sanct', x: 11, y: 7, w: 14, h: 1, once: true, cond2: () => !F('bishop_done'), run: () => STORY.bishopFight() },
  ];
  MAPS.cathedral = { name: 'Ржавый собор', base: 'stone2', alt: 'carpet', wall: 'rwall', rows: rows(g), music: 't03', amb: 'wind', dark: 0.5, darkCol: 'rgb(10,6,4)', weather: ['dust'], battleBg: 'cathedral', battleMusic: 't14', playerLight: 56, ents,
    onPush: () => { const M = World; const on = [[29, 12], [34, 12]].every(([x, y]) => World.ents.some(e => e.type === 'block' && e.cx === x && e.cy === y)); if (on && !F('cath_plates')) { setF('cath_plates'); run(async () => { sfx('lever'); await wait(0.3); sfx('door'); shake(2); await nar('Где-то наверху со скрежетом поднимается решётка.'); }); } },
    look: { '17,3': async () => nar('Алтарь собора, покрытый ржавчиной. Колокольные верёвки свисают с потолка.') },
    onEnter: async () => { if (!F('cath_card')) { setF('cath_card'); areaCard('Ржавый собор'); await wait(1); await STORY.cathEnter(); } else areaCard('Ржавый собор'); } };
})();

// ---------- CRYPT ----------
(() => {
  const g = G2(40, 34, '#');
  rect(g, 18, 2, 21, 8, '.');
  rect(g, 12, 11, 27, 19, '.');
  rect(g, 18, 9, 21, 10, '.');
  rect(g, 2, 6, 9, 16, '.'); rect(g, 10, 13, 11, 14, '.');
  rect(g, 30, 6, 37, 16, '.'); rect(g, 28, 13, 29, 14, '.');
  rect(g, 19, 20, 20, 23, '.');
  rect(g, 12, 24, 27, 31, '.');
  rect(g, 4, 18, 9, 26, '.'); rect(g, 6, 17, 7, 17, '.'); rect(g, 10, 25, 11, 26, '.');
  rect(g, 30, 18, 35, 26, '.'); rect(g, 32, 17, 33, 17, '.'); rect(g, 28, 25, 29, 26, '.');
  put(g, 19, 1, '%'); put(g, 20, 1, '.');
  for (const [x, y] of [[13, 12], [26, 12], [13, 18], [26, 18], [12, 24], [27, 24], [12, 31], [27, 31]]) put(g, x, y, 'P');
  for (const [x, y] of [[3, 8], [6, 8], [3, 12], [6, 12], [31, 8], [34, 8], [31, 12], [34, 12]]) { put(g, x, y, 'X'); put(g, x + 1, y, '.'); }
  for (const [x, y] of [[5, 20], [8, 23], [31, 20], [34, 24], [15, 26], [24, 26], [15, 29], [24, 29]]) put(g, x, y, 'x');
  for (const [x, y] of [[2, 6], [9, 6], [30, 6], [37, 6], [12, 11], [27, 11], [4, 18], [35, 18], [2, 15], [37, 15]]) put(g, x, y, 'w');
  for (const [x, y] of [[4, 14], [8, 9], [33, 14], [36, 10], [15, 14], [24, 16], [6, 25], [32, 22], [22, 3], [17, 6]]) put(g, x, y, (x + y) % 2 ? 'k' : 'K');
  put(g, 14, 23, 't'); put(g, 25, 23, 't'); put(g, 5, 5, 't'); put(g, 34, 5, 't');
  const ents = [
    { type: 'exit', x: 19, y: 1, to: 'village', tx: 5, ty: 28, dir: 0 },
    { type: 'shrine', id: 's5', x: 21, y: 4 },
    { type: 'sign', x: 18, y: 9, text: '«Луна встаёт на востоке, в полдень глядит с юга, садится на западе и спит на севере. Зажги её путь — и спящий проснётся».' },
    { type: 'brazier', id: 'bN', x: 19, y: 12, dirn: 'N', act: e => STORY.brazier(e), col: 'green' },
    { type: 'brazier', id: 'bE', x: 25, y: 15, dirn: 'E', act: e => STORY.brazier(e), col: 'green' },
    { type: 'brazier', id: 'bS', x: 20, y: 18, dirn: 'S', act: e => STORY.brazier(e), col: 'green' },
    { type: 'brazier', id: 'bW', x: 14, y: 15, dirn: 'W', act: e => STORY.brazier(e), col: 'green' },
    { type: 'gate', id: 'cg1', x: 19, y: 21, flag: 'crypt_puzzle' }, { type: 'gate', id: 'cg2', x: 20, y: 21, flag: 'crypt_puzzle' },
    { type: 'chest', id: 'cr1', x: 3, y: 15, item: 'stariron' },
    { type: 'chest', id: 'cr2', x: 36, y: 15, item: 'ashring' },
    { type: 'chest', id: 'cr3', x: 8, y: 25, item: 'elixir' },
    { type: 'chest', id: 'cr4', x: 31, y: 25, gold: 60 },
    { type: 'enemy', id: 'k1', x: 6, y: 10, mon: 'skeleton', speed: 45 },
    { type: 'enemy', id: 'k2', x: 33, y: 10, mon: 'banshee', flying: true },
    { type: 'enemy', id: 'k3', x: 22, y: 14, mon: 'cryptworm', speed: 40 },
    { type: 'enemy', id: 'k4', x: 7, y: 21, mon: 'skeleton', speed: 45, group: ['skeleton', 'banshee'] },
    { type: 'enemy', id: 'k5', x: 33, y: 21, mon: 'cryptworm', speed: 40, group: ['cryptworm', 'skeleton'] },
    { type: 'enemy', id: 'k6', x: 19, y: 6, mon: 'banshee', flying: true },
    { type: 'boss', id: 'tomas', x: 19, y: 28, char: 'tomasU', dir: 3, cond: () => !F('tomas_done'), talk: 'tomasB', fixed: true },
    { type: 'trigger', id: 'tom', x: 12, y: 26, w: 16, h: 1, once: true, cond2: () => !F('tomas_done'), run: () => STORY.tomasFight() },
  ];
  MAPS.crypt = { name: 'Склеп Ордена', base: 'crypt', wall: 'cwall', rows: rows(g), music: 't13', amb: 'drip', dark: 0.9, darkCol: 'rgb(2,4,4)', weather: [], battleBg: 'crypt', battleMusic: 't14', playerLight: 40, ivelBoost: 34, ents,
    onEnter: async () => { if (!F('crypt_card')) { setF('crypt_card'); await card('Глава III', 'Колыбельная склепа'); await STORY.cryptEnter(); } else areaCard('Склеп Ордена'); } };
})();

// ---------- KEEP ----------
(() => {
  const w = 44, h = 40, r = seeded(99); const g = G2(w, h, '#');
  rect(g, 2, 27, 41, 38, '^'); rect(g, 21, 39, 22, 39, '^');
  rect(g, 1, 24, 42, 26, 'v');
  rect(g, 3, 12, 40, 23, '^');
  rect(g, 12, 2, 31, 10, ';'); rect(g, 21, 11, 22, 11, ';');
  rect(g, 3, 3, 9, 10, '^'); rect(g, 34, 3, 40, 10, '^'); rect(g, 6, 11, 7, 11, '^'); rect(g, 36, 11, 37, 11, '^');
  rect(g, 21, 1, 22, 1, ';');
  scat(g, ';', ['^'], 0.12, r);
  for (const [x, y] of [[8, 30], [14, 33], [30, 31], [36, 35], [5, 36], [26, 29], [12, 15], [30, 19], [36, 14], [6, 20], [16, 21]]) { put(g, x, y, 'j'); }
  for (const [x, y] of [[4, 29], [39, 29], [4, 37], [39, 37], [3, 13], [40, 13], [3, 22], [40, 22]]) put(g, x, y, 'D');
  for (const [x, y] of [[12, 3], [31, 3], [12, 9], [31, 9], [16, 3], [27, 3], [19, 13], [24, 13], [19, 21], [24, 21]]) put(g, x, y, 'P');
  put(g, 21, 3, 'Y'); put(g, 22, 3, ';');
  for (const x of [14, 18, 25, 29]) put(g, x, 1, 't'); for (const x of [16, 27]) put(g, x, 1, 'n');
  for (const x of [5, 38]) put(g, x, 2, 't');
  for (const [x, y] of [[10, 30], [33, 33], [18, 36], [28, 36], [8, 16], [35, 20], [14, 6], [29, 7]]) put(g, x, y, (x + y) % 2 ? 'k' : 'K');
  for (const x of [20, 23]) put(g, x, 27, 'L');
  const ents = [
    { type: 'exit', x: 21, y: 39, w: 2, h: 1, to: 'village', tx: 22, ty: 2, dir: 0 },
    { type: 'shrine', id: 's6', x: 26, y: 16 },
    { type: 'lever', id: 'kl', x: 6, y: 31, flag: 'keep_bridge', act: e => STORY.bridgeLever(e) },
    { type: 'chest', id: 'q1', x: 4, y: 4, item: 'elixir' },
    { type: 'chest', id: 'q2', x: 39, y: 4, item: 'moonst' },
    { type: 'chest', id: 'q3', x: 38, y: 33, item: 'feather' },
    { type: 'chest', id: 'q4', x: 5, y: 14, gold: 70 },
    { type: 'enemy', id: 'r1', x: 12, y: 31, mon: 'raven', flying: true, speed: 62 },
    { type: 'enemy', id: 'r2', x: 30, y: 34, mon: 'raven', flying: true, speed: 62, group: ['raven', 'raven'] },
    { type: 'enemy', id: 'r3', x: 7, y: 34, mon: 'blackguard', speed: 42 },
    { type: 'enemy', id: 'r4', x: 14, y: 17, mon: 'blackguard', speed: 42, group: ['blackguard', 'raven'] },
    { type: 'enemy', id: 'r5', x: 31, y: 15, mon: 'raven', flying: true, speed: 62 },
    { type: 'enemy', id: 'r6', x: 37, y: 7, mon: 'blackguard', speed: 42 },
    { type: 'enemy', id: 'r7', x: 6, y: 7, mon: 'raven', flying: true, group: ['raven', 'blackguard'] },
    { type: 'boss', id: 'gareth', x: 21, y: 5, char: 'garethF', dir: 0, cond: () => !F('gareth_done'), talk: 'garethB', fixed: true },
    { type: 'trigger', id: 'gar', x: 12, y: 9, w: 20, h: 1, once: true, cond2: () => !F('gareth_done'), run: () => STORY.garethFight() },
    { type: 'exit', x: 21, y: 1, w: 2, h: 1, to: 'sleeping', tx: 23, ty: 34, dir: 3, need: () => F('gareth_done'), needMsg: 'Путь за троном завален.' },
  ];
  MAPS.keep = { name: 'Руины крепости', base: '^', wall: 'kwall', rows: rows(g), legend: { '^': { t: 'ash' } }, music: 't17', amb: 'wind', dark: 0.58, darkCol: 'rgb(8,4,6)', weather: ['ash', 'embers'], battleBg: 'keep', battleMusic: 't09', playerLight: 58, ents,
    dyn: () => { if (F('keep_bridge')) for (let y = 24; y <= 26; y++) for (const x of [21, 22]) patchCell(x, y, '='); },
    onEnter: async () => { if (!F('keep_card')) { setF('keep_card'); await card('Глава IV', 'Руины крепости'); await STORY.keepEnter(); } else areaCard('Руины крепости'); } };
  MAPS.keep.base = 'ash';
})();

// ---------- SLEEPING KINGDOM ----------
(() => {
  const w = 46, h = 36, r = seeded(1234); const g = G2(w, h, ';');
  rect(g, 0, 0, w - 1, 1, '#'); rect(g, 0, h - 1, w - 1, h - 1, '#'); rect(g, 0, 0, 0, h - 1, '#'); rect(g, w - 1, 0, w - 1, h - 1, '#');
  rect(g, 22, 0, 23, 1, ';'); rect(g, 22, h - 1, 23, h - 1, ';');
  scat(g, '.', [';'], 0.08, r);
  disc(g, 23, 17, 4, '.', null); put(g, 22, 17, 'Q'); put(g, 23, 17, '.');
  for (const [x, y] of [[19, 13], [27, 13], [19, 21], [27, 21], [10, 30], [36, 30], [10, 10], [36, 10]]) put(g, x, y, 'L');
  for (const [x, y] of [[3, 3], [42, 3], [3, 33], [42, 33], [15, 17], [31, 17]]) put(g, x, y, 'D');
  for (const [x, y] of [[8, 26], [9, 26], [37, 25], [38, 25], [14, 32], [30, 32]]) put(g, x, y, 'B');
  put(g, 12, 15, 'q'); put(g, 13, 15, ';');
  const ents = [
    { type: 'house', id: 'sh1', x: 3, y: 5, w: 8, h: 5, door: 3, roof: '#2a2e40', wall: '#3a3a4a', dark: true },
    { type: 'house', id: 'sh2', x: 14, y: 3, w: 6, h: 5, door: 2, roof: '#2a2e40', wall: '#3a3a4a', dark: true },
    { type: 'house', id: 'sh3', x: 27, y: 3, w: 6, h: 5, door: 2, roof: '#2a2e40', wall: '#3a3a4a', dark: true },
    { type: 'house', id: 'sh4', x: 35, y: 5, w: 8, h: 5, door: 4, roof: '#2a2e40', wall: '#3a3a4a', dark: true, chimney: true },
    { type: 'house', id: 'sh5', x: 3, y: 18, w: 7, h: 5, door: 3, roof: '#2a2e40', wall: '#3e3a3a', dark: true, chimney: true },
    { type: 'house', id: 'sh6', x: 36, y: 18, w: 7, h: 5, door: 3, roof: '#2a2e40', wall: '#3a3a4a', dark: true },
    { type: 'house', id: 'sh7', x: 13, y: 25, w: 6, h: 4, door: 2, roof: '#2a2e40', wall: '#3a3a4a', dark: true },
    { type: 'house', id: 'sh8', x: 28, y: 25, w: 6, h: 4, door: 3, roof: '#2a2e40', wall: '#3a3a4a', dark: true },
    { type: 'npc', id: 'baker', x: 6, y: 24, char: 'sleeper4', talk: 'voice1', sleeper: true, fixed: true },
    { type: 'npc', id: 'mother', x: 39, y: 11, char: 'sleeper2', talk: 'voice2', sleeper: true, fixed: true },
    { type: 'npc', id: 'girl', x: 24, y: 15, char: 'sleeper3', talk: 'voice3', sleeper: true, fixed: true },
    { type: 'npc', id: 'sl1', x: 18, y: 9, char: 'sleeper1', talk: 'sleeper', sleeper: true, fixed: true },
    { type: 'npc', id: 'sl2', x: 30, y: 30, char: 'sleeper1', talk: 'sleeper', sleeper: true, fixed: true, dir: 1 },
    { type: 'npc', id: 'sl3', x: 11, y: 12, char: 'sleeper2', talk: 'sleeper', sleeper: true, fixed: true, dir: 2 },
    { type: 'npc', id: 'ela', x: 23, y: 30, char: 'ghostgirl', talk: 'ela', ghostly: true, float: true, light: [26, 'moon'] },
    { type: 'shrine', id: 's7', x: 26, y: 33 },
    { type: 'chest', id: 'sk1', x: 41, y: 30, item: 'pale' },
    { type: 'chest', id: 'sk2', x: 4, y: 12, item: 'holy' },
    { type: 'chest', id: 'sk3', x: 33, y: 13, item: 'elixir' },
    { type: 'enemy', id: 'z1', x: 12, y: 21, mon: 'shade', flying: true },
    { type: 'enemy', id: 'z2', x: 33, y: 20, mon: 'shade', flying: true, group: ['shade', 'moth'] },
    { type: 'enemy', id: 'z3', x: 23, y: 7, mon: 'moth', flying: true },
    { type: 'enemy', id: 'z4', x: 8, y: 32, mon: 'shade', flying: true },
    { type: 'exit', x: 22, y: 35, w: 2, h: 1, to: 'keep', tx: 22, ty: 2, dir: 0 },
    { type: 'exit', x: 22, y: 0, w: 2, h: 1, to: 'moonroad', tx: 2, ty: 10, dir: 2 },
  ];
  MAPS.sleeping = { name: 'Спящее королевство', base: 'cobble', alt: 'grass', wall: 'wall', rows: rows(g), music: 't06', amb: 'wind', dark: 0.5, darkCol: 'rgb(4,6,16)', weather: ['moon', 'fog'], grade: 'rgba(40,60,140,0.10)', battleBg: 'dream', battleMusic: 't14', playerLight: 60, ents,
    onEnter: async () => { if (!F('sleep_card')) { setF('sleep_card'); await card('Глава V', 'Спящее королевство'); await STORY.sleepEnter(); } else areaCard('Спящее королевство'); } };
})();

// ---------- MOON ROAD ----------
(() => {
  const w = 72, h = 20, r = seeded(555); const g = G2(w, h, 'T');
  rect(g, 0, 0, w - 1, 5, 'v'); rect(g, 0, 6, w - 1, 6, '~');
  for (let x = 0; x < w; x++) { const y0 = 7 + Math.round(Math.sin(x * 0.2) * 1.2), y1 = 13 + Math.round(Math.sin(x * 0.13 + 2) * 1.5); for (let y = y0; y <= y1; y++) put(g, x, y, '.'); for (let y = 7; y < y0; y++) put(g, x, y, '~'); }
  disc(g, 36, 10, 4, '.', null);
  pathL(g, [[0, 10], [12, 11], [24, 9], [36, 10], [48, 11], [60, 9], [71, 10]], 0, ',');
  scat(g, 'R', ['~'], 0.18, r); scat(g, 'l', ['v'], 0.03, r, (x, y) => y > 3);
  scat(g, 'F', ['.'], 0.06, r); scat(g, '"', ['.'], 0.15, r); scat(g, 'D', ['T'], 0.2, r); scat(g, 'r', ['.', '"'], 0.03, r, (x, y) => nearCh(g, x, y, 'T'));
  put(g, 35, 8, 'M'); put(g, 36, 8, '.');
  clearAround(g, [[1, 10], [2, 10], [70, 10], [36, 12], [35, 9], [37, 9], [36, 9]], ',');
  const ents = [
    { type: 'exit', x: 0, y: 7, w: 1, h: 8, to: 'sleeping', tx: 23, ty: 1, dir: 0 },
    { type: 'exit', x: 71, y: 7, w: 1, h: 8, to: 'lake', tx: 17, ty: 37, dir: 3 },
    { type: 'shrine', id: 's8', x: 38, y: 12 },
    { type: 'enemy', id: 'm1', x: 14, y: 10, mon: 'moth', flying: true },
    { type: 'enemy', id: 'm2', x: 26, y: 11, mon: 'drowned', speed: 38 },
    { type: 'enemy', id: 'm3', x: 46, y: 10, mon: 'moth', flying: true, group: ['moth', 'moth'] },
    { type: 'enemy', id: 'm4', x: 57, y: 11, mon: 'drowned', speed: 38, group: ['drowned', 'moth'] },
    { type: 'trigger', id: 'altar', x: 33, y: 8, w: 7, h: 6, once: true, run: () => STORY.moonAltar() },
  ];
  MAPS.moonroad = { name: 'Лунная тропа', base: 'grass', alt: 'moon', wall: 'rock', rows: rows(g), music: 't04', amb: 'water', dark: 0.38, darkCol: 'rgb(4,6,18)', weather: ['moon', 'fog'], grade: 'rgba(60,80,160,0.10)', battleBg: 'moon', battleMusic: 't14', playerLight: 64, ents,
    onEnter: async () => { areaCard('Лунная тропа'); } };
})();

// ---------- LAKE ----------
(() => {
  const w = 36, h = 40, r = seeded(77); const g = G2(w, h, 'v');
  disc(g, 18, 11, 7, '.', r);
  rect(g, 10, 34, 25, 39, '.'); disc(g, 17, 35, 6, '.', r);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g[y][x] === 'v' && nearCh(g, x, y, '.', 1)) g[y][x] = '~';
  pathL(g, [[17, 34], [17, 22], [18, 22], [18, 18]], 0, '=', ['v', '~']);
  rect(g, 17, 18, 18, 18, '.');
  scat(g, 'R', ['~'], 0.25, r); scat(g, 'l', ['v'], 0.04, r);
  scat(g, '"', ['.'], 0.2, r); scat(g, 'F', ['.'], 0.06, r);
  rect(g, 0, 36, 9, 39, 'T'); rect(g, 26, 36, 35, 39, 'T'); put(g, 11, 38, 'D'); put(g, 24, 38, 'D');
  put(g, 18, 8, 'I');
  for (const [x, y] of [[13, 9], [23, 9], [14, 14], [22, 14]]) put(g, x, y, 'P');
  for (const [x, y] of [[16, 10], [20, 10]]) put(g, x, y, 'c');
  const ents = [
    { type: 'exit', x: 10, y: 39, w: 16, h: 1, to: 'moonroad', tx: 70, ty: 10, dir: 1 },
    { type: 'shrine', id: 's9', x: 21, y: 13 },
    { type: 'enemy', id: 'l1', x: 14, y: 35, mon: 'drowned', speed: 36 },
    { type: 'enemy', id: 'l2', x: 18, y: 15, mon: 'drowned', speed: 36, group: ['drowned', 'drowned'] },
    { type: 'enemy', id: 'l3', x: 20, y: 34, mon: 'moth', flying: true, group: ['moth', 'shade'] },
    { type: 'trigger', id: 'sword', x: 16, y: 9, w: 5, h: 1, cond2: () => !F('descend'), run: () => STORY.swordStone() },
  ];
  MAPS.lake = { name: 'Озеро Забвения', base: 'grass', alt: 'moon', wall: 'rock', rows: rows(g), music: 't20', amb: 'water', dark: 0.35, darkCol: 'rgb(4,6,18)', weather: ['moon', 'fog'], grade: 'rgba(60,90,170,0.12)', battleBg: 'moon', battleMusic: 't14', playerLight: 64, ents,
    onEnter: async () => { if (!F('lake_card')) { setF('lake_card'); await card('Финал', 'Меч под озером'); await STORY.lakeEnter(); } else areaCard('Озеро Забвения'); } };
})();

// ---------- THRONE ----------
(() => {
  const g = G2(26, 30, '#');
  rect(g, 3, 2, 22, 27, '.');
  rect(g, 12, 28, 13, 29, '.');
  rect(g, 11, 3, 14, 27, ',');
  for (let y = 6; y <= 25; y++) { put(g, 5, y, '~'); put(g, 20, y, '~'); }
  for (const y of [7, 12, 17, 22]) { put(g, 8, y, 'P'); put(g, 17, y, 'P'); }
  put(g, 12, 3, 'Y'); put(g, 13, 3, ',');
  for (const x of [6, 10, 15, 19]) put(g, x, 1, 't'); for (const x of [8, 17]) put(g, x, 1, 'W');
  for (const [x, y] of [[10, 5], [15, 5], [4, 3], [21, 3]]) put(g, x, y, 'c');
  const ents = [
    { type: 'boss', id: 'king', x: 13, y: 5, mon: 'king', fixed: true, cond: () => !F('king_done'), talk: 'kingB' },
    { type: 'trigger', id: 'kingT', x: 3, y: 13, w: 20, h: 1, once: true, run: () => STORY.kingFight() },
  ];
  MAPS.throne = { name: 'Затонувший трон', base: 'marble', alt: 'moon', wall: 'mwall', rows: rows(g), music: 't11', amb: 'drip', dark: 0.55, darkCol: 'rgb(4,4,14)', weather: ['moon'], grade: 'rgba(60,70,140,0.12)', battleBg: 'king', battleMusic: 't29', playerLight: 56, ents,
    onEnter: async () => { areaCard('Затонувший трон'); } };
})();
