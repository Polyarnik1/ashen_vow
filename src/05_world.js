// ================= WORLD =================
const LEGEND = {
  '#': { wall: 1 }, '.': { t: '$base' }, ',': { t: '$alt' }, '~': { t: 'water', solid: 1 }, 'v': { t: 'dwater', solid: 1 },
  '=': { t: 'bridge' }, ':': { t: 'dirt' }, '"': { t: 'dgrass' }, '_': { t: 'carpet' }, '%': { t: 'stairs' }, ' ': { t: 'void', solid: 1 },
  'o': { t: 'plate', plate: 1 }, ';': { t: 'cobble' }, '^': { t: 'ash' }, '*': { t: 'sand' },
  'T': { o: 'tree', block: 1 }, 'D': { o: 'dtree', block: 1 }, 'b': { o: 'bush', block: 1 }, 'g': { o: 'grave', block: 1 }, '+': { o: 'cross', block: 1 },
  'P': { o: 'pillar', block: 1 }, 'S': { o: 'statue', block: 1 }, 'c': { o: 'candles', light: [26, 'warm'] }, 'B': { o: 'barrel', block: 1 }, 'C': { o: 'crate', block: 1 },
  'h': { o: 'shelf', block: 1 }, 'p': { o: 'pew', block: 1, w: 2 }, 'r': { o: 'rock', block: 1 }, 'm': { o: 'mush', light: [22, 'cyan'] }, 'k': { o: 'bones' }, 'K': { o: 'skulls' },
  'f': { o: 'fence', block: 1 }, 'L': { o: 'lamp', block: 1, light: [54, 'warm'] }, 'w': { o: 'web' }, 'R': { o: 'reeds' }, 'l': { o: 'lily' }, 'F': { o: 'flower' },
  'W': { wall: 1, deco: 'window' }, 't': { wall: 1, deco: 'torch' }, 'n': { wall: 1, deco: 'banner' }, 'Z': { o: 'brazier', block: 1, flame: 1, light: [50, 'warm'] },
  'A': { o: 'altar', block: 1, w: 2, light: [34, 'warm'] }, 'x': { o: 'coffin', block: 1 }, 'X': { o: 'sarc', block: 1, w: 2 }, 'j': { o: 'brokenwall', block: 1 },
  'Q': { o: 'well', block: 1, w: 2 }, 'E': { o: 'bell', block: 1, w: 2 }, 'Y': { o: 'throne', block: 1, w: 2 }, 'M': { o: 'moonaltar', block: 1, w: 2, light: [40, 'moon'] },
  'q': { o: 'cart', block: 1, w: 2 }, 'G': { o: 'tent', block: 1, w: 2 }, 'a': { o: 'anvil', block: 1 }, 'O': { o: 'forge', block: 1, w: 2, light: [46, 'fire'] },
  'u': { o: 'table', block: 1, w: 2 }, 'y': { o: 'bed', block: 1 }, 'I': { o: 'swordstone', block: 1, light: [36, 'moon'] }, 'U': { o: 'rpillar', block: 1 },
};
const LIGHTCOL = { warm: 'rgba(255,170,80,0.32)', fire: 'rgba(255,120,40,0.4)', cyan: 'rgba(80,220,220,0.3)', moon: 'rgba(140,180,255,0.3)', blue: 'rgba(120,170,255,0.35)', green: 'rgba(90,240,150,0.32)', red: 'rgba(255,60,40,0.3)' };
const World = {
  map: null, id: null, w: 0, h: 0, ground: null, cells: [], solid: [], ents: [], objs: [], parts: [], cam: { x: 0, y: 0 }, camLock: null,
  player: { x: 0, y: 0, dir: 0, anim: 0, moving: false, stepAcc: 0, pushT: 0 }, trail: [], grace: 0, t: 0, frozen: false, lightC: null
};
function cellAt(x, y) { if (x < 0 || y < 0 || x >= World.w || y >= World.h) return null; return World.cells[y * World.w + x]; }
function isSolidCell(x, y) { if (x < 0 || y < 0 || x >= World.w || y >= World.h) return true; return World.solid[y * World.w + x]; }

function loadMap(id) {
  const M = MAPS[id]; World.map = M; World.id = id;
  const rows = M.rows; World.h = rows.length; World.w = Math.max(...rows.map(r => r.length));
  World.cells = []; World.solid = new Array(World.w * World.h).fill(false); World.objs = []; const wide = [];
  const leg = Object.assign({}, LEGEND, M.legend || {});
  for (let y = 0; y < World.h; y++) for (let x = 0; x < World.w; x++) {
    const ch = rows[y][x] || ' ';
    const L = leg[ch] || LEGEND['.'];
    const c = { ch, wall: !!L.wall, t: L.t ? (L.t === '$base' ? M.base : L.t === '$alt' ? (M.alt || M.base) : L.t) : (L.wall ? null : (L.under || M.base)), plate: !!L.plate, deco: L.deco };
    World.cells.push(c);
    World.solid[y * World.w + x] = !!(L.wall || L.solid || L.block);
    if (L.o) {
      const ow = (L.w || 1) * 16;
      let spr = L.o; if (spr === 'tree') spr = 'tree' + Math.floor(hash2(x, y) * 3); if (spr === 'dtree') spr = 'dtree' + Math.floor(hash2(x, y) * 3);
      World.objs.push({ x: x * 16 + ow / 2, y: y * 16 + 15, spr, light: L.light, flame: L.flame, cx: x, cy: y });
      if (L.block && L.w === 2) wide.push(y * World.w + x + 1);
    }
    if (L.deco === 'torch') World.objs.push({ x: x * 16 + 8, y: y * 16 + 17, spr: 'torch', wallTorch: true, light: [46, 'fire'], flame: 1 });
    if (L.deco === 'window') World.objs.push({ x: x * 16 + 8, y: y * 16 + 16, spr: null, light: [24, 'moon'], beam: true, noSort: true });
  }
  for (const i of wide) World.solid[i] = true;
  buildGround();
  // entities
  World.ents = [];
  for (const e of (M.ents || [])) {
    if (e.cond && !e.cond()) continue;
    if (e.type === 'enemy' && G.defeated[id + ':' + e.id]) continue;
    const ent = Object.assign({ dir: 0, t: rnd(10), anim: 0 }, e);
    ent.x = e.x * 16 + 8; ent.y = e.y * 16 + 14;
    if (e.type === 'enemy') { ent.hx = ent.x; ent.hy = ent.y; ent.state = 'idle'; ent.wt = rnd(1, 3); ent.vx = 0; ent.vy = 0; }
    if (e.type === 'block') { ent.cx = e.x; ent.cy = e.y; if (G.flags['blk_' + id + e.id]) { const p = G.flags['blk_' + id + e.id]; ent.cx = p[0]; ent.cy = p[1]; ent.x = p[0] * 16 + 8; ent.y = p[1] * 16 + 14; } }
    if (e.type === 'house') {
      ent.x = e.x * 16; ent.y = (e.y + e.h) * 16 - 1;
      const key = 'house_' + id + e.id; if (!SPR[key]) SPR[key] = makeHouse(e.w, e.h, e); ent.spr = key;
      const solidRows = Math.ceil(e.h * 0.6);
      for (let yy = e.y + e.h - solidRows; yy < e.y + e.h; yy++) for (let xx = e.x; xx < e.x + e.w; xx++) if (!(e.door != null && xx === e.x + e.door && yy === e.y + e.h - 1 && e.doorOpen)) World.solid[yy * World.w + xx] = true;
    }
    World.ents.push(ent);
  }
  if (M.dyn) M.dyn();
  World.parts = [];
  if (!World.lightC) { World.lightC = mk(W, H); }
}
function buildGround() {
  const M = World.map, wt = M.wall || 'wall';
  World.ground = mk(World.w * 16, World.h * 16, g => {
    for (let y = 0; y < World.h; y++) for (let x = 0; x < World.w; x++) {
      const c = cellAt(x, y), v = Math.floor(hash2(x * 3 + 1, y * 7 + 2) * 4);
      if (c.wall) {
        const below = cellAt(x, y + 1);
        const wtype = M.wallAt ? M.wallAt(x, y) : wt;
        if (!below || !below.wall) {
          g.drawImage(TILE[wtype + '_f'][v], x * 16, y * 16);
          if (c.deco === 'window') g.drawImage(SPR.window, x * 16, y * 16);
          if (c.deco === 'banner') g.drawImage(SPR.banner, x * 16 + 2, y * 16 - 4);
        } else {
          g.drawImage(TILE[wtype + '_t'][v], x * 16, y * 16);
          const D = WALLDEF[wtype];
          // edges where neighbor is not wall
          const nb = (dx, dy) => { const n = cellAt(x + dx, y + dy); return n && !n.wall; };
          g.fillStyle = D.topE;
          if (nb(-1, 0)) g.fillRect(x * 16, y * 16, 1, 16);
          if (nb(1, 0)) g.fillRect(x * 16 + 15, y * 16, 1, 16);
          if (nb(0, -1)) g.fillRect(x * 16, y * 16, 16, 1);
        }
        if (c.deco === 'window' && below && below.wall) g.drawImage(SPR.window, x * 16, y * 16);
      } else {
        const tn = c.t || M.base; const set = TILE[tn] || TILE.stone;
        g.drawImage(set[v % set.length], x * 16, y * 16);
        const above = cellAt(x, y - 1);
        if (above && above.wall) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x * 16, y * 16, 16, 3); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x * 16, y * 16 + 3, 16, 3); }
        // shoreline
        if (tn !== 'water' && tn !== 'dwater') {
          for (const [dx, dy, rx, ry, rw, rh] of [[0, -1, 0, 0, 16, 1], [0, 1, 0, 15, 16, 1], [-1, 0, 0, 0, 1, 16], [1, 0, 15, 0, 1, 16]]) { const n = cellAt(x + dx, y + dy); if (n && (n.t === 'water' || n.t === 'dwater') && tn !== 'bridge') { g.fillStyle = 'rgba(160,190,220,0.25)'; g.fillRect(x * 16 + rx, y * 16 + ry, rw, rh); } }
        }
      }
    }
  });
}

function patchCell(x, y, ch) {
  const M = World.map; const leg = Object.assign({}, LEGEND, M.legend || {}); const L = leg[ch] || LEGEND['.'];
  const c = World.cells[y * World.w + x]; c.ch = ch; c.wall = !!L.wall; c.t = L.t ? (L.t === '$base' ? M.base : L.t === '$alt' ? (M.alt || M.base) : L.t) : M.base;
  World.solid[y * World.w + x] = !!(L.wall || L.solid || L.block);
  const g = World.ground.getContext('2d'); const set = TILE[c.t] || TILE.stone; g.drawImage(set[Math.floor(hash2(x * 3 + 1, y * 7 + 2) * 4) % set.length], x * 16, y * 16);
}
// ---------- ENTITY HELPERS ----------
function entBox(e) { return { x: e.x - 6, y: e.y - 5, w: 12, h: 8 }; }
function isSolidEnt(e) {
  if (e.hidden) return false;
  if (e.type === 'gate') return !F(e.flag);
  return ['npc', 'chest', 'shrine', 'sign', 'lever', 'block', 'brazier', 'boss', 'obj', 'stash'].includes(e.type) && !e.ghost;
}
function rectHit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function blockedAt(px, py, ignore) {
  const box2 = { x: px - 5, y: py - 4, w: 10, h: 6 };
  const x0 = Math.floor(box2.x / 16), x1 = Math.floor((box2.x + box2.w - 0.01) / 16), y0 = Math.floor(box2.y / 16), y1 = Math.floor((box2.y + box2.h - 0.01) / 16);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (isSolidCell(x, y)) return true;
  for (const e of World.ents) { if (e === ignore || !isSolidEnt(e)) continue; if (rectHit(box2, entBox(e))) return e; }
  return false;
}
function entById(id) { return World.ents.find(e => e.id === id); }
const DIRV = [[0, 1], [-1, 0], [1, 0], [0, -1]];
function dirTo(dx, dy) { return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); }

// ---------- SCRIPT COMMANDS (world) ----------
async function walk(e, tx, ty, speed = 50) { // tile coords target, e can be 'player'
  const ent = e === 'player' ? World.player : e;
  const gx = tx * 16 + 8, gy = ty * 16 + 14;
  for (const axis of ['x', 'y']) {
    const goal = axis === 'x' ? gx : gy;
    while (Math.abs(ent[axis] - goal) > 0.5) {
      const d = Math.sign(goal - ent[axis]);
      ent.dir = axis === 'x' ? (d < 0 ? 1 : 2) : (d < 0 ? 3 : 0);
      ent[axis] += d * Math.min(Math.abs(goal - ent[axis]), speed / 60);
      ent.moving = true; ent.anim += speed / 60 / 7;
      await wait(1 / 60);
    }
    ent[axis] = goal;
  }
  ent.moving = false;
}
function face(e, d) { (e === 'player' ? World.player : e).dir = d; }
function emote(e, ch = '!', dur = 0.9) { const ent = e === 'player' ? World.player : e; ent.emote = { ch, t: 0, dur }; if (ch === '!') sfx('alert', { vol: 0.6 }); }
async function camTo(tx, ty, sp = 2) { World.camLock = { x: tx * 16 + 8, y: ty * 16 + 8, sp }; await wait(0.9 / sp + 0.3); }
function camFree() { World.camLock = null; }
async function gotoMap(id, tx, ty, dir = 0, o = {}) {
  World.frozen = true;
  if (!o.nofade) { sfx('door', { vol: o.silent ? 0 : 0.5 }); await fade(1, 0.35); }
  G.map = id; loadMap(id);
  World.player.x = tx * 16 + 8; World.player.y = ty * 16 + 14; World.player.dir = dir; World.player.moving = false;
  World.trail = []; World.camLock = null; snapCam();
  const M = MAPS[id];
  if (M.music !== undefined && !o.keepMusic) { if (M.music) Music.play(M.music, { fade: 1.2 }); else Music.stop(1); }
  setAmb(M.amb || 'none');
  if (M.chapter) G.chapter = M.chapter;
  World.frozen = false;
  if (!o.nofade) await fade(0, 0.4);
  if (M.onEnter) run(() => M.onEnter());
}
function snapCam() { const p = World.player; World.cam.x = clamp(Math.round(p.x - W / 2), 0, Math.max(0, World.w * 16 - W)); World.cam.y = clamp(Math.round(p.y - H / 2 - 6), 0, Math.max(0, World.h * 16 - H)); if (World.w * 16 < W) World.cam.x = Math.round((World.w * 16 - W) / 2); if (World.h * 16 < H) World.cam.y = Math.round((World.h * 16 - H) / 2); }

// ---------- PARTICLES ----------
function addPart(p) { if (World.parts.length < 400) World.parts.push(Object.assign({ life: 0, max: 1, vx: 0, vy: 0, size: 1, col: '#fff', glow: 0 }, p)); }
function weatherTick(dt) {
  const M = World.map, cx = World.cam.x, cy = World.cam.y, wz = M.weather || [];
  for (const w of wz) {
    if (w === 'ash' && Math.random() < 0.35) addPart({ x: cx + rnd(-20, W + 20), y: cy - 4, vx: rnd(-6, 4), vy: rnd(8, 16), max: rnd(6, 12), col: pick(['#8a8890', '#6a6870', '#a8a6ae']), size: pick([1, 1, 2]), wob: rnd(6) });
    if (w === 'embers' && Math.random() < 0.15) addPart({ x: cx + rnd(W), y: cy + H + 4, vx: rnd(-4, 4), vy: rnd(-18, -8), max: rnd(4, 8), col: pick(['#ffb040', '#ff7a2a', '#ffd27a']), size: 1, glow: 1, wob: rnd(6) });
    if (w === 'motes' && Math.random() < 0.06) addPart({ x: cx + rnd(W), y: cy + rnd(H), vx: rnd(-5, 5), vy: rnd(-5, 5), max: rnd(3, 6), col: '#b8ff8a', size: 1, glow: 1, blink: 1, wob: rnd(6) });
    if (w === 'moon' && Math.random() < 0.12) addPart({ x: cx + rnd(W), y: cy + rnd(H), vx: rnd(-3, 3), vy: rnd(-8, -2), max: rnd(2, 5), col: pick(['#c8d8ff', '#9fd0ff', '#ffffff']), size: 1, glow: 1, blink: 1 });
    if (w === 'rain') for (let i = 0; i < 3; i++) addPart({ x: cx + rnd(-30, W + 10), y: cy - 6, vx: 60, vy: 260, max: 0.75, col: 'rgba(160,180,220,0.5)', rain: 1 });
    if (w === 'dust' && Math.random() < 0.08) addPart({ x: cx + rnd(W), y: cy + rnd(H), vx: rnd(-2, 2), vy: rnd(1, 4), max: rnd(5, 9), col: '#d8c8a0', size: 1, glow: 1, blink: 1 });
    if (w === 'fog' && Math.random() < 0.03) addPart({ x: cx - 40, y: cy + rnd(-10, H), vx: rnd(6, 14), vy: rnd(-1, 1), max: rnd(14, 24), fog: 1, r: irnd(24, 44) });
  }
  for (const p of World.parts) {
    p.life += dt; p.x += (p.vx + (p.wob != null ? Math.sin(p.life * 2 + p.wob) * 6 : 0)) * dt; p.y += p.vy * dt;
    if (p.grav) p.vy += p.grav * dt;
  }
  World.parts = World.parts.filter(p => p.life < p.max);
}
function drawParts(g, cx, cy, layer) {
  for (const p of World.parts) {
    const k = p.life / p.max; const x = Math.round(p.x - cx), y = Math.round(p.y - cy);
    if (p.fog) { if (layer !== 'fog') continue; g.globalAlpha = Math.sin(k * Math.PI) * 0.16; g.drawImage(glowSprite(p.r, 'rgba(170,180,200,1)'), x - p.r, y - p.r); g.globalAlpha = 1; continue; }
    if (layer === 'fog') continue;
    if (p.rain) { g.fillStyle = p.col; g.fillRect(x, y, 1, 4); if (k > 0.95 && Math.random() < 0.3) addPart({ x: p.x, y: p.y, vx: rnd(-20, 20), vy: -30, grav: 200, max: 0.2, col: 'rgba(180,200,240,0.6)' }); continue; }
    let a = p.blink ? Math.sin(k * Math.PI) * (0.6 + 0.4 * Math.sin(p.life * 9)) : (1 - k * k);
    g.globalAlpha = clamp(a, 0, 1); g.fillStyle = p.col; g.fillRect(x, y, p.size, p.size);
    if (p.glow) { g.globalAlpha = clamp(a * 0.35, 0, 1); g.fillRect(x - 1, y, p.size + 2, p.size); g.fillRect(x, y - 1, p.size, p.size + 2); }
    g.globalAlpha = 1;
  }
}

// ---------- UPDATE ----------
function canControl() { return !Script.active && !Dlg.open && !Choice.open && !World.frozen && Game.scene === 'world' && !Menu.open && Fx.fade < 0.5; }
function updateWorld(dt) {
  if (!World.map) return;
  World.t += dt; G.time += dt;
  const p = World.player;
  World.grace = Math.max(0, World.grace - dt);
  if (canControl()) {
    if (Input.p('menu')) { openMenu(); return; }
    const a = Input.axis();
    let mx = a.x, my = a.y;
    if (!Input.joy) { mx = (Input.h('right') ? 1 : 0) - (Input.h('left') ? 1 : 0); my = (Input.h('down') ? 1 : 0) - (Input.h('up') ? 1 : 0); }
    const running = Input.h('back') || Math.hypot(a.x, a.y) > 0.95 && Input.joy;
    const sp = (running ? 112 : 72) * dt;
    p.moving = !!(mx || my);
    if (p.moving) {
      if (Math.abs(mx) > Math.abs(my) * 1.05) p.dir = mx < 0 ? 1 : 2; else if (my) p.dir = my < 0 ? 3 : 0;
      const l = Math.hypot(mx, my); const vx = mx / l * sp * Math.min(1, l * 1.3), vy = my / l * sp * Math.min(1, l * 1.3);
      let hitX = blockedAt(p.x + vx, p.y, null); if (!hitX) p.x += vx; else if (!vy) { /* corner slide */ for (const off of [-3, 3]) if (!blockedAt(p.x + vx, p.y + off)) { p.y += Math.sign(off) * sp * 0.6; break; } }
      let hitY = blockedAt(p.x, p.y + vy, null); if (!hitY) p.y += vy; else if (!vx) { for (const off of [-3, 3]) if (!blockedAt(p.x + off, p.y + vy)) { p.x += Math.sign(off) * sp * 0.6; break; } }
      const pushEnt = (hitX && hitX.type === 'block') ? hitX : (hitY && hitY.type === 'block') ? hitY : null;
      if (pushEnt) { p.pushT += dt; if (p.pushT > 0.28) { tryPush(pushEnt, p.dir); p.pushT = 0; } } else p.pushT = 0;
      p.anim += sp / 9;
      p.stepAcc += sp; if (p.stepAcc > (running ? 13 : 15)) { p.stepAcc = 0; sfx(Math.random() < 0.5 ? 'step' : 'step2', { vol: 0.35, vary: 0.1 }); }
      World.trail.push([p.x, p.y, p.dir]); if (World.trail.length > 60) World.trail.shift();
    } else p.anim = 0;
    if (Input.p('ok')) interact();
    // exits & triggers
    const tx = Math.floor(p.x / 16), ty = Math.floor((p.y - 2) / 16);
    for (const e of World.ents) {
      if (e.type !== 'exit' && e.type !== 'trigger') continue;
      const ex = (e.x - 8) / 16, ey = (e.y - 14) / 16, ew = e.w || 1, eh = e.h || 1;
      if (tx >= ex && tx < ex + ew && ty >= ey && ty < ey + eh) {
        if (e.type === 'exit') { if (e.need && !e.need()) { if (!e._told) { e._told = true; run(async () => { await nar(e.needMsg || 'Путь закрыт.'); }); } continue; } run(() => gotoMap(e.to, e.tx, e.ty, e.dir == null ? p.dir : e.dir)); return; }
        if (e.type === 'trigger' && !(e.once && F('trg_' + World.id + e.id)) && !(e.cond2 && !e.cond2())) { if (e.once) setF('trg_' + World.id + e.id); p.moving = false; run(() => e.run(e)); return; }
      } else if (e.type === 'exit') e._told = false;
    }
  }
  // camera
  let tx = p.x - W / 2, ty = p.y - H / 2 - 6;
  if (World.camLock) { tx = World.camLock.x - W / 2; ty = World.camLock.y - H / 2; World.cam.x += (tx - World.cam.x) * Math.min(1, dt * 3 * World.camLock.sp); World.cam.y += (ty - World.cam.y) * Math.min(1, dt * 3 * World.camLock.sp); }
  else { World.cam.x = tx; World.cam.y = ty; }
  World.cam.x = clamp(World.cam.x, 0, Math.max(0, World.w * 16 - W)); World.cam.y = clamp(World.cam.y, 0, Math.max(0, World.h * 16 - H));
  if (World.w * 16 < W) World.cam.x = (World.w * 16 - W) / 2; if (World.h * 16 < H) World.cam.y = (World.h * 16 - H) / 2;
  // entities
  for (const e of World.ents) {
    e.t += dt;
    if (e.emote) { e.emote.t += dt; if (e.emote.t > e.emote.dur) e.emote = null; }
    if (e.type === 'npc' && e.wander && !Script.active) {
      e.wt = (e.wt || rnd(2, 4)) - dt;
      if (e.wt < 0) { e.wt = rnd(2, 5); if (Math.random() < 0.5) { const d = irnd(0, 3); e.wdx = DIRV[d][0]; e.wdy = DIRV[d][1]; e.dir = d; e.wm = rnd(0.4, 1); } }
      if (e.wm > 0) { e.wm -= dt; const nx = e.x + e.wdx * 24 * dt, ny = e.y + e.wdy * 24 * dt; const hx = e.x0 ?? (e.x0 = e.x), hy = e.y0 ?? (e.y0 = e.y); if (!blockedAt(nx, ny, e) && Math.abs(nx - hx) < 28 && Math.abs(ny - hy) < 28 && dist(nx, ny, p.x, p.y) > 14) { e.x = nx; e.y = ny; e.moving = true; e.anim += dt * 3.5; } else e.wm = 0; } else e.moving = false;
    }
    if (e.type === 'enemy') updateEnemy(e, dt);
    if (e.moving && e.type === 'npc') e.anim += 0;
  }
  // ivel follower
  if (F('ivel') && !F('ivel_away')) {
    const tr = World.trail; const k = Math.max(0, tr.length - 16);
    const tgt = tr[k] || [p.x - 12, p.y];
    World.ivel = World.ivel || { x: p.x, y: p.y };
    World.ivel.x += (tgt[0] - World.ivel.x) * Math.min(1, dt * 5); World.ivel.y += (tgt[1] - World.ivel.y) * Math.min(1, dt * 5);
    if (Math.random() < 0.2) addPart({ x: World.ivel.x + rnd(-2, 2), y: World.ivel.y - 18 + rnd(-2, 2), vy: rnd(-12, -4), vx: rnd(-3, 3), max: 0.8, col: pick(['#8fc8ff', '#e8f6ff']), glow: 1 });
  }
  // ambient object particles
  for (const o of World.objs) if (o.flame && Math.random() < 0.05) { if (Math.abs(o.x - p.x) < 200 && Math.abs(o.y - p.y) < 140) addPart({ x: o.x + rnd(-2, 2), y: o.y - (o.wallTorch ? 18 : 14), vx: rnd(-3, 3), vy: rnd(-20, -10), max: rnd(0.5, 1.2), col: pick(['#ffb040', '#ffd27a']), glow: 1 }); }
  weatherTick(dt);
}
function updateEnemy(e, dt) {
  if (window.__noEnc) return;
  const p = World.player;
  const d = dist(e.x, e.y, p.x, p.y);
  const active = canControl() && World.grace <= 0;
  if (!active) { e.moving = false; return; }
  if (e.state === 'idle') {
    e.wt -= dt;
    if (e.wt < 0) { e.wt = rnd(1.5, 3); const a = rnd(6.28); e.vx = Math.cos(a) * 18; e.vy = Math.sin(a) * 18; e.mt = rnd(0.5, 1.2); }
    if (e.mt > 0) { e.mt -= dt; const nx = e.x + e.vx * dt, ny = e.y + e.vy * dt; if (!blockedAt(nx, ny, e) && dist(nx, ny, e.hx, e.hy) < 40) { e.x = nx; e.y = ny; } }
    if (d < (e.sight || 72)) { e.state = 'chase'; emote(e, '!', 0.5); e.ct = 0.45; }
  } else if (e.state === 'chase') {
    e.ct -= dt; if (e.ct > 0) return;
    const sp = (e.speed || 50) * dt; const dx = (p.x - e.x) / d, dy = (p.y - e.y) / d;
    if (!blockedAt(e.x + dx * sp, e.y, e)) e.x += dx * sp; if (!blockedAt(e.x, e.y + dy * sp, e)) e.y += dy * sp;
    if (d > 140 || dist(e.x, e.y, e.hx, e.hy) > 170) { e.state = 'return'; }
  } else if (e.state === 'return') {
    const dd = dist(e.x, e.y, e.hx, e.hy); if (dd < 2) e.state = 'idle'; else { e.x += (e.hx - e.x) / dd * 30 * dt; e.y += (e.hy - e.y) / dd * 30 * dt; }
    if (d < 50) e.state = 'chase';
  }
  if (d < 13) {
    e.state = 'idle';
    run(() => encounter(e));
  }
}
async function encounter(e) {
  World.frozen = true;
  emote(e, '!', 0.6); await wait(0.45);
  const res = await battle(e.group || [e.mon], { area: World.map.battleBg || 'default', music: e.music || World.map.battleMusic, enemyEnt: e, boss: e.boss });
  if (res === 'win' || res === 'spare') {
    G.defeated[World.id + ':' + e.id] = 1;
    World.ents = World.ents.filter(x => x !== e);
  }
  World.grace = 1.5; World.frozen = false;
  if (e.after && (res === 'win' || res === 'spare')) await e.after(res);
}
function tryPush(e, dir) {
  const [dx, dy] = DIRV[dir]; const nx = e.cx + dx, ny = e.cy + dy;
  if (isSolidCell(nx, ny)) { return; }
  for (const o of World.ents) if (o !== e && isSolidEnt(o) && Math.floor(o.x / 16) === nx && Math.floor((o.y) / 16) === ny) return;
  e.cx = nx; e.cy = ny; sfx('push', { vol: 0.7 });
  const sx = e.x, sy = e.y, gx = nx * 16 + 8, gy = ny * 16 + 14; let k = 0;
  e.sliding = true;
  const step = () => { k += 1 / 10; e.x = lerp(sx, gx, Math.min(1, k)); e.y = lerp(sy, gy, Math.min(1, k)); return k >= 1; };
  waitUntil(step).then(() => { e.sliding = false; G.flags['blk_' + World.id + e.id] = [nx, ny]; if (World.map.onPush) World.map.onPush(e); });
}
function interact() {
  const p = World.player; const [dx, dy] = DIRV[p.dir];
  const fx = p.x + dx * 13, fy = p.y + dy * 11 - 2;
  let best = null, bd = 99;
  for (const e of World.ents) {
    if (e.hidden || !(e.talk || e.type === 'chest' || e.type === 'stash' || e.type === 'shrine' || e.type === 'sign' || e.type === 'lever' || e.type === 'brazier' || e.act)) continue;
    const d = dist(fx, fy, e.x, e.y - 4); if (d < 14 && d < bd) { bd = d; best = e; }
  }
  if (best) { run(() => interactEnt(best)); return; }
  // look at object
  const cx = Math.floor(fx / 16), cy = Math.floor((fy + 2) / 16);
  const M = World.map; if (M.look) { const k = cx + ',' + cy; if (M.look[k]) { run(() => M.look[k]()); } }
}
async function interactEnt(e) {
  const p = World.player;
  if (e.type === 'npc' || e.type === 'boss') { if (!e.fixed) e.dir = dirTo(p.x - e.x, p.y - e.y); if (e.talk) await TALK[e.talk](e); return; }
  if (e.type === 'chest') {
    const k = 'chest_' + World.id + e.id; if (F(k)) { await nar('Сундук пуст.'); return; }
    setF(k); sfx('chest');
    if (e.gold) { G.gold += e.gold; await nar(`Внутри [y]${e.gold} монет[/].`); }
    if (e.item) {
      if (EQUIP[e.item]) { G.flags['own_' + e.item] = true; await nar(`Найдено: [y]${EQUIP[e.item].n}[/]! ${EQUIP[e.item].d} (Надень в меню)`); sfx('item'); }
      else if (addItem(e.item)) { await nar(`Найдено: [y]${ITEMS[e.item].n}[/].`); sfx('item'); }
      else { setF(k, false); await nar('Сумка переполнена...'); }
    }
    if (e.after) await e.after();
    return;
  }
  if (e.type === 'stash') { await openStash(); return; }
  if (e.type === 'shrine') { await TALK.shrine(e); return; }
  if (e.type === 'sign') { await nar(e.text); return; }
  if (e.type === 'lever' || e.type === 'brazier') { if (e.act) await e.act(e); return; }
  if (e.act) await e.act(e);
}

// ---------- DRAW ----------
function drawEntSprite(g, e, cx, cy) {
  const x = Math.round(e.x - cx), y = Math.round(e.y - cy);
  if (e.hidden) return;
  if (e.type === 'exit' || e.type === 'trigger') return;
  const shadow = (w = 6) => { g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x - w, y - 1, w * 2, 2); g.fillRect(x - w + 2, y - 2, w * 2 - 4, 4); };
  if (e.char) {
    shadow(5);
    const fr = e.moving ? Math.floor(e.anim) % 4 : 0;
    let img = CHAR[e.char][e.dir][fr];
    if (e.ghostly) g.globalAlpha = 0.6 + 0.2 * Math.sin(World.t * 3);
    g.drawImage(img, x - 8, y - 22 + (e.float ? Math.round(Math.sin(World.t * 2) * 1.5) - 3 : 0)); g.globalAlpha = 1;
    if (e.sleeper && Math.floor(World.t * 2 + e.t) % 3 === 0) { g.fillStyle = '#9a9ac8'; setFontless(g, x + 5, y - 28 - (World.t * 4 % 4), 3); }
    return;
  }
  if (e.type === 'house') { const img = SPR[e.spr]; g.drawImage(img, x, y - img.height + 1); return; }
  if (e.obj === 'lantern') { const yy = y; g.drawImage(SPR.dtree1, x - 16, yy - 46); g.fillStyle = '#2a2a33'; g.fillRect(x + 3, yy - 30, 1, 5); g.fillRect(x, yy - 26, 7, 2); g.fillStyle = '#3a3a48'; g.fillRect(x, yy - 24, 7, 8); g.fillStyle = '#9fd0ff'; g.fillRect(x + 1, yy - 23, 5, 6); drawFlame(g, x + 3.5, yy - 18, 0.7, World.t, 'blue'); g.fillStyle = '#2a2a33'; g.fillRect(x, yy - 17, 7, 1); return; }
  if (e.type === 'gate' && e.spr === 'fog') { if (F(e.flag)) return; for (let i = 0; i < 3; i++) { g.globalAlpha = 0.35; g.drawImage(glowSprite(14, 'rgba(190,200,215,1)'), x - 14 + Math.sin(World.t + i * 2 + e.x) * 4, y - 22 + i * 6 + Math.cos(World.t * 0.7 + i) * 2); } g.globalAlpha = 1; return; }
  if (e.mon) {
    const img = mframe(e.mon, World.t * 0.9 + e.t, true);
    shadow(Math.min(10, img.width / 3));
    const fl = e.flying ? Math.round(Math.sin(World.t * 3 + e.t) * 2) - 4 : 0;
    g.drawImage(img, x - Math.floor(img.width / 2), y - img.height + 2 + fl);
    return;
  }
  const S = SPR;
  switch (e.type) {
    case 'chest': g.drawImage(F('chest_' + World.id + e.id) ? S.chest1 : S.chest0, x - 8, y - 14); break;
    case 'stash': { const k = 0.5 + 0.5 * Math.sin(World.t * 2.5 + e.x); g.drawImage(S.stash, x - 8, y - 14); g.globalAlpha = 0.5 + 0.5 * k; g.fillStyle = '#d8b8ff'; g.fillRect(x - 1, y - 7, 2, 3); g.fillRect(x - 2, y - 6, 4, 1); g.globalAlpha = 1; g.globalAlpha = 0.25 * k; g.drawImage(glowSprite(12, 'rgba(190,150,255,1)'), x - 12, y - 18); g.globalAlpha = 1; break; }
    case 'shrine': {
      g.drawImage(S.shrine, x - 8, y - 26);
      drawFlame(g, x, y - 18, 1.2, World.t, 'blue');
      break;
    }
    case 'sign': g.drawImage(S.sign, x - 8, y - 14); break;
    case 'lever': g.drawImage(F(e.flag) ? S.lever1 : S.lever0, x - 8, y - 14); break;
    case 'block': g.drawImage(S.block, x - 8, y - 16); break;
    case 'gate': if (!F(e.flag)) g.drawImage(S.gate, x - 8, y - 22); else { g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x - 8, y - 22, 16, 3); } break;
    case 'brazier': g.drawImage(S.brazier, x - 8, y - 14); if (e.lit) drawFlame(g, x, y - 8, 1.4, World.t + e.t, e.col || 'warm'); break;
    case 'obj': if (e.spr) g.drawImage(S[e.spr], x - Math.floor(S[e.spr].width / 2), y - S[e.spr].height + 2); break;
  }
}
function drawWorld() {
  const g = lc;
  if (!World.map) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); return; } const cx = Math.round(World.cam.x + (Fx.shake ? rnd(-Fx.shake, Fx.shake) : 0)), cy = Math.round(World.cam.y + (Fx.shake ? rnd(-Fx.shake, Fx.shake) : 0));
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.drawImage(World.ground, -cx, -cy);
  // animated water
  const fr = Math.floor(World.t * 3) % 4;
  const x0 = Math.max(0, Math.floor(cx / 16)), y0 = Math.max(0, Math.floor(cy / 16)), x1 = Math.min(World.w - 1, Math.floor((cx + W) / 16)), y1 = Math.min(World.h - 1, Math.floor((cy + H) / 16));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const c = cellAt(x, y); if (c && (c.t === 'water' || c.t === 'dwater') && !c.wall) g.drawImage(TILE[c.t][(fr + ((x + y) & 3)) % 4], x * 16 - cx, y * 16 - cy); }
  // plates
  // collect drawables
  const list = [];
  for (const o of World.objs) { if (o.noSort || !o.spr) continue; if (o.x - cx < -40 || o.x - cx > W + 40 || o.y - cy < -10 || o.y - cy > H + 60) continue; list.push({ y: o.y, o }); }
  for (const e of World.ents) { if (e.type === 'house') { if (e.x - cx > W + 10 || e.x + e.w * 16 - cx < -10) continue; list.push({ y: e.y, e }); continue; } if (e.x - cx < -60 || e.x - cx > W + 60 || e.y - cy < -20 || e.y - cy > H + 80) continue; list.push({ y: e.y + (e.type === 'gate' ? 1 : 0), e }); }
  const p = World.player; list.push({ y: p.y, pl: true });
  if (World.ivel && F('ivel') && !F('ivel_away')) list.push({ y: World.ivel.y + 2, iv: true });
  list.sort((a, b) => a.y - b.y);
  for (const it of list) {
    if (it.o) { const o = it.o, img = SPR[o.spr]; if (!img) continue; const x = Math.round(o.x - cx - img.width / 2), y = Math.round(o.y - cy - img.height + 1); g.drawImage(img, x, y); if (o.flame) drawFlame(g, Math.round(o.x - cx), Math.round(o.y - cy) - (o.wallTorch ? 10 : 9), 1.1, World.t + o.x * 0.1, 'warm'); if (o.spr === 'candles' || o.spr === 'altar') { const by = Math.round(o.y - cy); if (o.spr === 'candles') { drawFlame(g, Math.round(o.x - cx) - 4, by - 8, 0.6, World.t + 1); drawFlame(g, Math.round(o.x - cx), by - 11, 0.6, World.t + 2); drawFlame(g, Math.round(o.x - cx) + 4, by - 7, 0.6, World.t + 3); } else { drawFlame(g, Math.round(o.x - cx) - 9, by - 14, 0.7, World.t); drawFlame(g, Math.round(o.x - cx) + 9, by - 14, 0.7, World.t + 1); } } }
    else if (it.e) drawEntSprite(g, it.e, cx, cy);
    else if (it.pl) {
      if (Game.hidePlayer) continue;
      const x = Math.round(p.x - cx), y = Math.round(p.y - cy);
      g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x - 5, y - 1, 10, 2); g.fillRect(x - 3, y - 2, 6, 4);
      const frm = p.moving ? Math.floor(p.anim) % 4 : 0;
      g.drawImage(CHAR.hero[p.dir][frm], x - 8, y - 22);
    } else if (it.iv) drawIvel(g, World.ivel.x - cx, World.ivel.y - cy, World.t);
  }
  drawParts(g, cx, cy, 'main');
  // lighting
  drawLighting(g, cx, cy);
  drawParts(g, cx, cy, 'fog');
  if (World.map.grade) { g.fillStyle = World.map.grade; g.fillRect(0, 0, W, H); }
  // vignette
  g.drawImage(VIGN, 0, 0);
}
function drawIvel(g, x, y, t) {
  x = Math.round(x); const yy = Math.round(y - 18 + Math.sin(t * 2.5) * 2);
  g.fillStyle = '#3a6aff'; g.fillRect(x - 3, yy - 2, 7, 6); g.fillRect(x - 2, yy - 5 + Math.round(Math.sin(t * 9)), 5, 4); g.fillRect(x - 1, yy - 7 + Math.round(Math.sin(t * 7)), 2, 3);
  g.fillStyle = '#8fc8ff'; g.fillRect(x - 2, yy - 3, 5, 6); g.fillRect(x - 1, yy - 5, 3, 3);
  g.fillStyle = '#e8f6ff'; g.fillRect(x - 2, yy, 5, 3);
  g.fillStyle = '#1a2a5a'; g.fillRect(x - 1, yy, 1, 1); g.fillRect(x + 1, yy, 1, 1);
}
let VIGN = null;
function makeVignette() { VIGN = mk(W, H, g => { const gr = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }); }
function drawLighting(g, cx, cy) {
  const M = World.map; const dark = M.dark || 0; if (dark <= 0) return;
  const L = World.lightC, lg = L.getContext('2d');
  lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, W, H);
  lg.fillStyle = M.darkCol || 'rgb(6,5,14)'; lg.globalAlpha = dark; lg.fillRect(0, 0, W, H); lg.globalAlpha = 1;
  lg.globalCompositeOperation = 'destination-out';
  const lights = [];
  const p = World.player;
  const pr = (M.playerLight || 52) + (F('ivel') && !F('ivel_away') ? (M.ivelBoost || 26) : 0);
  lights.push([p.x, p.y - 10, pr, 'none', 0.9]);
  if (World.ivel && F('ivel') && !F('ivel_away')) lights.push([World.ivel.x, World.ivel.y - 18, 34, 'blue', 1]);
  for (const o of World.objs) if (o.light) lights.push([o.x, o.y - 10, o.light[0], o.light[1], 1]);
  for (const e of World.ents) {
    if (e.type === 'shrine') lights.push([e.x, e.y - 18, 46, 'blue', 1]);
    if (e.type === 'stash') lights.push([e.x, e.y - 8, 30, 'blue', 0.8]);
    if (e.type === 'brazier' && e.lit) lights.push([e.x, e.y - 8, 52, e.col === 'blue' ? 'blue' : 'fire', 1]);
    if (e.light) lights.push([e.x, e.y - 10, e.light[0], e.light[1], 1]);
    if (e.mon === 'wisp') lights.push([e.x, e.y - 10, 28, 'green', 1]);
  }
  for (const pt of World.parts) if (pt.glow && pt.size) { }
  const fl = (k) => 1 + Math.sin(World.t * 13 + k) * 0.03 + Math.sin(World.t * 7.3 + k * 2) * 0.03;
  for (const [x, y, r0, col, a] of lights) {
    const r = Math.round(r0 * (col === 'fire' || col === 'warm' ? fl(x) : 1));
    const sx = x - cx, sy = y - cy; if (sx < -r || sx > W + r || sy < -r || sy > H + r) continue;
    lg.globalAlpha = a; lg.drawImage(glowSprite(r, 'rgba(0,0,0,1)'), Math.round(sx - r), Math.round(sy - r));
  }
  lg.globalAlpha = 1; lg.globalCompositeOperation = 'source-over';
  g.drawImage(L, 0, 0);
  // colored glows
  g.globalCompositeOperation = 'lighter';
  for (const [x, y, r0, col] of lights) {
    if (!LIGHTCOL[col]) continue; const r = Math.round(r0 * 0.8);
    const sx = x - cx, sy = y - cy; if (sx < -r || sx > W + r || sy < -r || sy > H + r) continue;
    g.drawImage(glowSprite(r, LIGHTCOL[col]), Math.round(sx - r), Math.round(sy - r));
  }
  // window beams
  for (const o of World.objs) if (o.beam) { const sx = o.x - cx, sy = o.y - cy; if (sx < -60 || sx > W + 60 || sy < -40 || sy > H + 80) continue; g.globalAlpha = 0.07 + 0.02 * Math.sin(World.t + o.x); g.fillStyle = '#9ab8ff'; g.beginPath(); g.moveTo(sx - 4, sy - 4); g.lineTo(sx + 4, sy - 4); g.lineTo(sx + 22, sy + 52); g.lineTo(sx + 4, sy + 52); g.fill(); g.globalAlpha = 1; }
  g.globalCompositeOperation = 'source-over';
}
function drawWorldUI() {
  uiT();
  if (!World.map) return;
  const cx = World.cam.x, cy = World.cam.y;
  const ems = World.ents.filter(e => e.emote).map(e => [e, e.emote]); if (World.player.emote) ems.push([World.player, World.player.emote]);
  for (const [e, em] of ems) {
    const x = e.x - cx, y = e.y - cy - (e.mon ? 34 : 30) - Math.min(4, em.t * 30);
    box(x - 5, y - 6, 10, 11, { border: '#ffd75e', stud: '#ffd75e' }); text(em.ch, x, y - 4.5, '#ffd75e', 8, 'center', { w: 700 });
  }
  // interact hint
  if (canControl() && isTouch) {
    const p = World.player; const [dx, dy] = DIRV[p.dir]; const fx = p.x + dx * 13, fy = p.y + dy * 11 - 2;
    for (const e of World.ents) { if (e.hidden || !(e.talk || ['chest', 'stash', 'shrine', 'sign', 'lever', 'brazier'].includes(e.type) || e.act)) continue; if (dist(fx, fy, e.x, e.y - 4) < 14) { const x = e.x - cx, y = e.y - cy - 32 + Math.sin(TIME * 5); ctx.fillStyle = '#ffd75e'; ctx.fillRect(x - 1, y, 3, 3); ctx.fillRect(x, y + 3, 1, 1); break; } }
  }
  // area name card
  if (World.areaCard) { const t = World.areaCard.t += 1 / 60; const a = t < 0.5 ? t / 0.5 : t > 2.5 ? Math.max(0, 1 - (t - 2.5) / 0.6) : 1; ctx.globalAlpha = a; text(World.areaCard.s, 12, 10, '#e8e0d0', 10, 'left', { w: 500 }); ctx.fillStyle = '#c8a85a'; ctx.fillRect(12, 24, tw(World.areaCard.s, 10) * Math.min(1, t * 1.5), 0.6); ctx.globalAlpha = 1; if (t > 3.2) World.areaCard = null; }
}
function areaCard(s) { World.areaCard = { s, t: 0 }; }
