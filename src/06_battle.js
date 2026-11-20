// ================= BATTLE =================
const BGTHEME = {
  default: { a: '#0c0a18', b: '#1a1230', line: '#3a2a6a', rune: '#5a4aa0', glow: 'rgba(120,90,220,0.25)' },
  chapel: { a: '#100a0a', b: '#2a1414', line: '#5a2a2a', rune: '#a0503a', glow: 'rgba(255,120,60,0.2)' },
  forest: { a: '#06100c', b: '#0e2218', line: '#1e4a34', rune: '#3a8a5a', glow: 'rgba(80,220,140,0.18)' },
  cathedral: { a: '#120a06', b: '#2a160c', line: '#6a3a1a', rune: '#c8702a', glow: 'rgba(255,140,40,0.2)' },
  crypt: { a: '#060c0a', b: '#0e1c18', line: '#1e3a32', rune: '#4aa088', glow: 'rgba(100,255,200,0.15)' },
  keep: { a: '#0c0a0c', b: '#1e161a', line: '#4a2a30', rune: '#a03a3a', glow: 'rgba(255,60,60,0.18)' },
  moon: { a: '#060a18', b: '#101a36', line: '#2a3a7a', rune: '#7aa0ff', glow: 'rgba(120,170,255,0.22)' },
  king: { a: '#05050c', b: '#14142a', line: '#3a3a6a', rune: '#c8d8ff', glow: 'rgba(200,220,255,0.22)' },
  dream: { a: '#0a0614', b: '#1c1030', line: '#4a2a6a', rune: '#c88aff', glow: 'rgba(200,140,255,0.2)' },
};
const B = { active: false };
const ENEMY_POS = [[[232, 74]], [[214, 52], [254, 98]], [[206, 44], [262, 72], [214, 104]]];

function battle(group, opts = {}) {
  return new Promise(res => {
    const snap = JSON.stringify(G);
    const start = () => {
      Object.assign(B, {
        active: true, res, opts, snap, t: 0, state: 'intro', theme: BGTHEME[opts.area] || BGTHEME.default,
        enemies: group.map((id, i) => mkEnemy(id, i, group.length)), cmd: 0, sel: 0, sub: 0, msg: null, flavor: '',
        bullets: [], fx: [], nums: [], pattern: null, soul: { x: 160, y: 72, inv: 0, parry: 0, cd: 0, tr: [] },
        box: { x: 40, y: 140, w: 240, h: 36 }, bt: null, boxOn: false, heroPose: 'idle', heroX: 0, heroFlash: 0, ward: 0, defending: false,
        resolveRes: null, aim: null, bubbles: [], turn: 0, shards: B.nextShards || null, hitstop: 0, hpShake: 0, reviveUsed: false, special: {}
      });
      B.nextShards = null;
      Game.scene = 'battle';
      Music.play(opts.music || (opts.boss ? 't19' : 't05'), { battle: true, fade: 0.2 });
      run(battleMain);
    };
    B.restart = start;
    // transition: shatter snapshot
    sfx('shatter', { vol: 0.8 }); flash('#fff', 0.6);
    const snapImg = mk(W, H, g => g.drawImage(low, 0, 0));
    const shards = []; const cols = 8, rows = 5;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const w = W / cols, h = H / rows, x0 = x * w, y0 = y * h;
      for (const tri of [[x0, y0, x0 + w, y0, x0, y0 + h], [x0 + w, y0, x0 + w, y0 + h, x0, y0 + h]]) {
        const cx = (tri[0] + tri[2] + tri[4]) / 3, cy = (tri[1] + tri[3] + tri[5]) / 3;
        shards.push({ tri, cx, cy, vx: (cx - W / 2) * rnd(1.5, 3), vy: (cy - H / 2) * rnd(1.5, 3) - rnd(20, 60), rot: 0, vr: rnd(-6, 6), t: 0 });
      }
    }
    B.nextShards = { img: snapImg, list: shards, t: 0 };
    start();
  });
}
function mkEnemy(id, i, n) {
  const d = ENEMIES[id]; const pos = ENEMY_POS[n - 1][i];
  return { id, d, name: d.name, hp: d.hp, maxhp: d.hp, mercy: 0, x: pos[0], y: pos[1], hx: pos[0], hy: pos[1], shake: 0, flash: 0, alpha: 1, dead: false, spared: false, dying: 0, acts: {}, hpT: 0, t: rnd(1), phase: 0, enterT: 0 };
}
const alive = () => B.enemies.filter(e => !e.dead && !e.spared);

// ---------- text helpers ----------
function btext(s, o = {}) {
  return new Promise(res => {
    const lines = wrap(s, 290, 8);
    B.msg = { lines: lines.map(l => parseRich(l)), n: 0, total: 0, done: false, res, auto: o.auto };
    B.msg.total = B.msg.lines.reduce((a, l) => a + l.length, 0);
  });
}
function updateBText(dt) {
  const m = B.msg; if (!m) return;
  if (!m.done) {
    const prev = Math.floor(m.n); m.n += dt * 48;
    if (Math.floor(m.n) !== prev && Math.floor(m.n) % 3 === 0) sfx('blip', { rate: 1, vol: 0.5 });
    if (m.n >= m.total) { m.n = m.total; m.done = true; m.dt = 0; }
    if (Input.p('ok') || Input.p('back')) { m.n = m.total; m.done = true; m.dt = 0; Input.pressed.ok = false; Input.pressed.back = false; }
  } else {
    m.dt += dt;
    if ((m.auto && m.dt > m.auto) || Input.p('ok')) { Input.pressed.ok = false; B.msg = null; m.res(); }
  }
}
function bubble(e, s, dur = 2.2) { B.bubbles.push({ e, s, t: 0, dur, lines: wrap(s, 86, 8) }); }
function addNum(x, y, s, col) { B.nums.push({ x, y, s: String(s), col, t: 0, vy: -50 }); }
function bfx(o) { B.fx.push(Object.assign({ t: 0, life: 0.5 }, o)); }

// ---------- MAIN LOOP ----------
async function battleMain() {
  B.state = 'intro';
  if (B.shards) await waitUntil(() => B.shards.t > 0.9);
  B.shards = null;
  await wait(0.2);
  const d0 = B.enemies[0].d;
  if (B.opts.intro) await B.opts.intro();
  await btext(B.opts.introText || (B.enemies.length > 1 ? `${B.enemies.map(e => e.name).join(', ')} преграждают путь!` : (d0.intro || `${d0.name} преграждает путь!`)));
  while (true) {
    B.turn++;
    B.defending = false;
    B.flavor = pickFlavor();
    const act = await chooseAction();
    await doAction(act);
    if (await checkEnd()) return;
    await enemyPhase();
    if (G.hp <= 0) {
      if (hasItem('feather')) { removeItem('feather'); G.hp = Math.ceil(maxHp() / 2); sfx('heal'); flash('#ffd27a', 0.8); await btext('[y]Пепельное перо[/] вспыхивает! Ты поднимаешься из пепла.'); }
      else { await gameOver(); return; }
    }
    if (await checkEnd()) return;
  }
}
function pickFlavor() {
  const a = alive(); if (!a.length) return '';
  const e = pick(a);
  if (e.mercy >= 100) return e.d.spareTxt || `${e.name} больше не желает сражаться.`;
  if (e.hp < e.maxhp * 0.3 && e.d.lowTxt) return e.d.lowTxt;
  if (B.opts.flavor) { const f = B.opts.flavor(); if (f) return f; }
  return pick(e.d.flavor || ['Холодный ветер шевелит пепел.']);
}
function chooseAction() { return new Promise(res => { B.state = 'menu'; B.resolveRes = res; B.sub = 0; }); }

const CMDS = [{ n: 'УДАР', k: 'fight' }, { n: 'ДЕЙСТВИЕ', k: 'act' }, { n: 'МОЛИТВА', k: 'pray' }, { n: 'ВЕЩИ', k: 'item' }, { n: 'ЩИТ', k: 'defend' }];
function updateBattleMenu() {
  const st = B.state;
  if (st === 'menu') {
    if (Input.nav('left')) { B.cmd = (B.cmd + 4) % 5; sfx('move'); }
    if (Input.nav('right')) { B.cmd = (B.cmd + 1) % 5; sfx('move'); }
    if (Input.p('ok')) {
      const k = CMDS[B.cmd].k; Input.pressed.ok = false;
      if (k === 'fight') { sfx('select'); B.next = 'fight'; toTarget(); }
      else if (k === 'act') { sfx('select'); B.next = 'act'; toTarget(); }
      else if (k === 'pray') { sfx('select'); B.state = 'pray'; B.sel = 0; }
      else if (k === 'item') { if (!usableItems().length) { sfx('deny'); return; } sfx('select'); B.state = 'item'; B.sel = 0; }
      else if (k === 'defend') { sfx('select'); finish({ k: 'defend' }); }
    }
  } else if (st === 'target') {
    const a = alive(); const n = a.length;
    if (Input.nav('up')) { B.sel = (B.sel + n - 1) % n; sfx('move'); }
    if (Input.nav('down')) { B.sel = (B.sel + 1) % n; sfx('move'); }
    if (Input.p('back')) { sfx('cancel'); B.state = B.next === 'pray' ? 'pray' : 'menu'; if (B.next === 'pray') B.sel = B.praySel; return; }
    if (Input.p('ok')) { Input.pressed.ok = false; sfx('select'); confirmTarget(a[B.sel]); }
  } else if (st === 'actlist') {
    const L = actList(B.tgt); const n = L.length;
    navGrid(n);
    if (Input.p('back')) { sfx('cancel'); B.next = 'act'; toTarget(true); return; }
    if (Input.p('ok')) { Input.pressed.ok = false; sfx('select'); finish({ k: 'act', tgt: B.tgt, a: L[B.sel] }); }
  } else if (st === 'pray') {
    const L = G.prayers; const n = L.length;
    navGrid(n);
    if (Input.p('back')) { sfx('cancel'); B.state = 'menu'; return; }
    if (Input.p('ok')) {
      Input.pressed.ok = false; const id = L[B.sel], P = PRAYERS[id];
      if (G.tp < P.cost) { sfx('deny'); return; }
      sfx('select'); B.praySel = B.sel;
      if (P.target) { B.next = 'pray'; B.prayId = id; toTarget(); } else finish({ k: 'pray', p: id });
    }
  } else if (st === 'item') {
    const L = usableItems(); const n = L.length;
    navGrid(n);
    if (Input.p('back')) { sfx('cancel'); B.state = 'menu'; return; }
    if (Input.p('ok')) { Input.pressed.ok = false; sfx('select'); finish({ k: 'item', id: L[B.sel] }); }
  }
}
function navGrid(n) {
  if (Input.nav('down')) { if (B.sel + 2 < n) { B.sel += 2; sfx('move'); } }
  if (Input.nav('up')) { if (B.sel - 2 >= 0) { B.sel -= 2; sfx('move'); } }
  if (Input.nav('right')) { if (B.sel % 2 === 0 && B.sel + 1 < n) { B.sel++; sfx('move'); } }
  if (Input.nav('left')) { if (B.sel % 2 === 1) { B.sel--; sfx('move'); } }
}
function confirmTarget(tgt) {
  if (!tgt) { B.state = 'menu'; return; }
  if (B.next === 'fight') finish({ k: 'fight', tgt });
  else if (B.next === 'act') { B.tgt = tgt; B.state = 'actlist'; B.sel = 0; }
  else if (B.next === 'pray') finish({ k: 'pray', p: B.prayId, tgt });
}
function toTarget(keep) {
  const a = alive(); if (!a.length) { B.state = 'menu'; return; }
  if (a.length === 1 && !keep) { B.sel = 0; confirmTarget(a[0]); return; }
  if (a.length === 1 && keep) { B.state = 'menu'; return; }
  B.state = 'target'; B.sel = keep ? Math.max(0, a.indexOf(B.tgt)) : 0;
}
function finish(a) { B.state = 'busy'; const r = B.resolveRes; B.resolveRes = null; r(a); }
function usableItems() { return G.items.filter(i => !ITEMS[i].key && !ITEMS[i].auto); }
function actList(e) {
  const L = [{ n: 'Проверить', check: true }];
  for (const a of e.d.acts || []) { if (a.req && !e.acts[a.req]) continue; if (a.cond && !a.cond(e)) continue; L.push(a); }
  L.push({ n: e.d.boss ? 'Пощадить' : 'Пощадить', spare: true });
  return L;
}

// ---------- ACTIONS ----------
async function doAction(a) {
  B.state = 'busy';
  if (a.k === 'fight') await heroAttack(a.tgt, 1);
  else if (a.k === 'defend') {
    B.defending = true; B.heroPose = 'defend'; sfx('equip'); G.tp = Math.min(100, G.tp + 16);
    bfx({ kind: 'ring', x: 62, y: 84, col: '#8fd8ff', life: 0.6 });
    await btext('Ты поднимаешь щит. Дух крепнет. (+16%)', { auto: 1.2 });
  }
  else if (a.k === 'item') {
    const it = ITEMS[a.id]; removeItem(a.id); B.heroPose = 'item';
    if (it.heal) { const before = G.hp; G.hp = Math.min(maxHp(), G.hp + it.heal); sfx('heal'); addNum(62, 60, '+' + (G.hp - before), '#8cf08c'); bfx({ kind: 'spark', x: 62, y: 80, col: '#8cf08c', life: 0.8 }); await btext(`Ты используешь: ${it.n}. ${G.hp >= maxHp() ? 'ОЗ полностью восстановлены!' : `Восстановлено ${G.hp - before} ОЗ.`}`); }
    if (it.tp) { G.tp = Math.min(100, G.tp + it.tp); sfx('magic'); await btext(`Ты зажигаешь огарок. Дух +${it.tp}%.`); }
  }
  else if (a.k === 'act') await doAct(a.tgt, a.a);
  else if (a.k === 'pray') await doPray(a.p, a.tgt);
  B.heroPose = B.defending ? 'defend' : 'idle';
}
function aimBar(count = 1) {
  return new Promise(res => {
    B.aim = { cursors: [], i: 0, res, results: [] };
    for (let k = 0; k < count; k++) B.aim.cursors.push({ x: 36 - k * 70, hit: null });
    B.state = 'aim';
  });
}
function updateAim(dt) {
  const A2 = B.aim; if (!A2) return;
  for (const c of A2.cursors) if (c.hit == null) c.x += dt * 210;
  const cur = A2.cursors.find(c => c.hit == null);
  if (cur && Input.p('ok') && cur.x > 30) { Input.pressed.ok = false; const d = Math.abs(cur.x - 160); cur.hit = d; A2.results.push(d); sfx(d < 6 ? 'crit' : 'slash', { vol: 0.6 }); bfx({ kind: 'aimflash', x: cur.x, life: 0.3, col: d < 6 ? '#ffd75e' : '#fff' }); }
  for (const c of A2.cursors) if (c.hit == null && c.x > 290) { c.hit = 999; A2.results.push(999); }
  if (A2.cursors.every(c => c.hit != null)) { const r = A2.results; B.aim.doneT = (B.aim.doneT || 0) + dt; if (B.aim.doneT > 0.25) { const res = A2.res; B.aim = null; B.state = 'busy'; res(r); } }
}
async function heroAttack(tgt, count = 1) {
  if (!tgt) return;
  const results = await aimBar(count);
  for (let i = 0; i < results.length; i++) {
    const d = results[i];
    if (tgt.dead || tgt.spared) { const a = alive(); if (!a.length) break; tgt = a[0]; }
    if (d >= 999 || d > 130) { addNum(tgt.x, tgt.y - 20, 'МИМО', '#9a95a8'); sfx('swing'); await wait(0.4); continue; }
    const q = clamp(1 - d / 130, 0, 1); const crit = d < 6;
    let dmg = (atk() * 2 + 4 - tgt.d.def * 1.2) * (0.35 + 0.85 * q) * rnd(0.92, 1.08);
    if (crit) dmg *= 1.6; dmg = Math.max(1, Math.round(dmg));
    await heroStrike(tgt, dmg, crit);
  }
}
async function heroStrike(tgt, dmg, crit, holy) {
  B.heroPose = 'attack'; B.heroAtk = 0;
  sfx('dash', { vol: 0.6 });
  // dash forward
  for (let k = 0; k <= 1; k += 1 / 8) { B.heroX = easeOut(k) * (tgt.x - 110); B.heroAtk = k * 0.4; await wait(1 / 60); }
  for (let k = 0.4; k <= 1; k += 0.1) { B.heroAtk = k; await wait(1 / 60); }
  sfx(crit ? 'crit' : 'hit', { vol: 0.9 }); sfx('slash', { vol: 0.5 });
  bfx({ kind: 'slash', x: tgt.x, y: tgt.y, life: 0.3, col: holy ? '#9fd0ff' : '#fff' });
  if (crit) { flash('#fff', 0.35); shake(4); B.hitstop = 0.08; }
  damageEnemy(tgt, dmg, crit);
  await wait(0.25);
  for (let k = 1; k >= 0; k -= 1 / 10) { B.heroX = easeOut(k) * (tgt.x - 110); await wait(1 / 60); }
  B.heroX = 0; B.heroPose = 'idle';
  await wait(0.2);
  if (tgt.hp <= 0 && !tgt.dead) await killEnemy(tgt);
}
function damageEnemy(e, dmg, crit) {
  e.hp = Math.max(0, e.hp - dmg); e.shake = 0.4; e.flash = 0.25; e.hpT = 1.8;
  addNum(e.x, e.y - 24, crit ? dmg + '!' : dmg, crit ? '#ffd75e' : '#ff6a5a');
  for (let i = 0; i < 8; i++) bfx({ kind: 'dot', x: e.x, y: e.y, vx: rnd(-80, 80), vy: rnd(-90, 20), col: pick(['#fff', '#ffd75e', '#ff8a5a']), life: 0.5 });
  if (e.d.onHit) e.d.onHit(e);
}
async function killEnemy(e) {
  if (e.d.boss && e.d.onDefeat) { await e.d.onDefeat(e); if (!e.dead && e.hp > 0) return; }
  e.dead = true; e.dying = 0.001; sfx('die');
  G.killed++;
  B.special.killedAny = true;
}
async function doAct(e, a) {
  if (a.check) { await btext(`[y]${e.name}[/] — АТК ${e.d.atk} ЗАЩ ${e.d.def}. ${e.d.check}`); return; }
  if (a.spare) {
    if (e.mercy >= 100) { await spareEnemy(e); }
    else { sfx('deny'); await btext(e.d.noSpare || `Ты предлагаешь пощаду... но ${e.name} не готов${e.d.fem ? 'а' : ''} её принять.`); }
    return;
  }
  e.acts[a.n] = (e.acts[a.n] || 0) + 1;
  B.heroPose = 'item'; sfx(a.sfx || 'select');
  if (a.run) { await a.run(e, a); }
  else {
    const t = typeof a.t === 'function' ? a.t(e) : a.t;
    await btext(t);
  }
  let m = typeof a.m === 'function' ? a.m(e) : (a.m || 0);
  if (a.once && e.acts[a.n] > 1) m = Math.floor(m / 4);
  if (m) { const before = e.mercy; e.mercy = Math.min(100, e.mercy + m); addNum(e.x, e.y - 24, '+' + (e.mercy - before) + '% покоя', '#ffd75e'); if (e.mercy >= 100 && before < 100) { sfx('chime'); await btext(e.d.readyTxt || `[y]${e.name}[/] готов${e.d.fem ? 'а' : ''} обрести покой.`); } }
  if (a.calm) e.calm = (e.calm || 0) + a.calm;
  if (a.reply) bubble(e, a.reply);
}
async function spareEnemy(e) {
  if (e.d.onSpare) { const ok = await e.d.onSpare(e); if (ok === false) return; }
  e.spared = true; e.dying = 0.001; sfx('spare'); G.spared++;
  for (let i = 0; i < 16; i++) bfx({ kind: 'dot', x: e.x + rnd(-14, 14), y: e.y + rnd(-14, 14), vx: rnd(-20, 20), vy: rnd(-70, -30), col: pick(['#fff', '#ffd75e', '#c8d8ff']), life: 1.2 });
  await btext(e.d.sparedTxt || `${e.name} обретает покой.`);
}
async function doPray(id, tgt) {
  const P = PRAYERS[id]; G.tp -= P.cost; B.heroPose = 'pray'; sfx('holy', { vol: 0.8 });
  bfx({ kind: 'pillar', x: 62, y: 84, life: 1.0, col: '#ffe8a0' });
  await wait(0.6);
  if (id === 'heal') { const before = G.hp; G.hp = Math.min(maxHp(), G.hp + Math.ceil(maxHp() * 0.55)); sfx('heal'); addNum(62, 60, '+' + (G.hp - before), '#8cf08c'); await btext(`Тёплый свет обнимает тебя. +${G.hp - before} ОЗ.`); }
  else if (id === 'ward') { B.ward = 1; sfx('equip'); await btext('Перед тобой мерцает оберег. Следующий удар ослабнет вдвое.'); }
  else if (id === 'moon') {
    B.heroPose = 'win'; sfx('light');
    bfx({ kind: 'beam', x: tgt.x, y: tgt.y, life: 0.7, col: '#c8e0ff' });
    await wait(0.4);
    let dmg = Math.round((atk() * 3 + 12) * rnd(0.95, 1.05)); if (tgt.d.undead) dmg = Math.round(dmg * 1.5);
    damageEnemy(tgt, dmg, false);
    await btext(tgt.d.undead ? `Лунный луч пронзает [y]${tgt.name}[/]! Нежить содрогается.` : `Лунный луч обжигает [y]${tgt.name}[/].`);
    if (tgt.d.undead && !tgt.d.boss) { tgt.mercy = Math.min(100, tgt.mercy + 25); addNum(tgt.x, tgt.y - 36, '+25% покоя', '#ffd75e'); }
    if (tgt.hp <= 0 && !tgt.dead) await killEnemy(tgt);
  }
  else if (id === 'flurry') { B.heroPose = 'idle'; await btext('Клинок поёт! Три удара!', { auto: 0.8 }); await heroAttack(tgt, 3); }
  else if (id === 'solace') {
    sfx('spare'); for (const e of alive()) { const bf = e.mercy; e.mercy = Math.min(100, e.mercy + 35); addNum(e.x, e.y - 24, '+' + (e.mercy - bf) + '% покоя', '#ffd75e'); }
    await btext('Ты шепчешь слова утешения. Ярость врагов стихает.');
  }
}
async function checkEnd() {
  if (alive().length) return false;
  await waitUntil(() => B.enemies.every(e => !e.dying || e.dying > 1));
  const killed = B.enemies.filter(e => e.dead), spared = B.enemies.filter(e => e.spared);
  let exp = 0, gold = 0;
  for (const e of killed) { exp += e.d.exp; gold += e.d.gold; }
  for (const e of spared) { exp += Math.round(e.d.exp * 0.5); gold += e.d.gold; }
  G.exp += exp; G.gold += gold;
  B.heroPose = 'win'; sfx('item');
  if (!B.opts.noRewards) await btext(`[y]ПОБЕДА![/] Получено опыта: ${exp}, монет: ${gold}.`);
  while (G.lv < LVEXP.length - 1 && G.exp >= LVEXP[G.lv]) { G.lv++; G.hp = Math.min(maxHp(), G.hp + 9); sfx('levelup'); await btext(`[y]Уровень ${G.lv}![/] Твоя клятва крепнет. ОЗ, сила и защита растут.`); }
  if (B.opts.after) await B.opts.after();
  await endBattle(spared.length && !killed.length ? 'spare' : 'win');
  return true;
}
async function endBattle(r) {
  await fade(1, 0.5);
  B.active = false; Game.scene = 'world'; B.bullets = [];
  if (World.map && World.map.music) Music.play(World.map.music, { fade: 1 });
  G.tp = Math.min(G.tp, 100);
  await fade(0, 0.4);
  const res = B.res; res(r);
}
async function gameOver() {
  B.state = 'dead'; B.heroPose = 'down'; Music.stop(0.5); sfx('gameover');
  await wait(1.2);
  Game.scene = 'gameover'; Game.goT = 0;
  await wait(1.5);
  const i = await choose(['Попробовать снова', 'Загрузить сохранение', 'В главное меню'], { title: 'Свеча обета погасла...' });
  if (i === 0) { G = JSON.parse(B.snap); G.hp = Math.max(G.hp, Math.ceil(maxHp() * 0.75)); Game.scene = 'battle'; await fade(1, 0.3); B.shards = null; const r = B.res; const grp = B.enemies.map(e => e.id); const o = B.opts; B.active = false; fade(0, 0.4); const res2 = await battleNoShatter(grp, o); r(res2); }
  else if (i === 1) { const s = loadSave(); B.active = false; if (s) { G = s; await fade(1, 0.3); Game.scene = 'world'; Script.waits.length = 0; await gotoMap(G.map, G.x, G.y, G.dir, { nofade: true }); fade(0, 0.5); } else { location.reload(); } }
  else { location.reload(); }
}
function battleNoShatter(grp, o) { return new Promise(res => { battle(grp, o).then(res); B.shards = null; B.nextShards = null; }); }

// ---------- ENEMY PHASE ----------
async function enemyPhase() {
  const a = alive(); if (!a.length) return;
  // speech bubbles
  for (const e of a) { if (!B.bubbles.some(b => b.e === e)) { const s = e.d.talkFn ? e.d.talkFn(e) : pick(e.d.talk || ['...']); if (s) bubble(e, s, 2); } }
  await waitUntil(() => B.bubbles.length === 0 || Input.p('ok'));
  B.bubbles = [];
  if (B.opts.beforeAttack) await B.opts.beforeAttack();
  // pick patterns
  const pats = [];
  const atkers = a.slice(0, 2);
  for (const e of atkers) {
    let pn = e.d.patFn ? e.d.patFn(e) : pick(e.d.pats);
    if (e.mercy >= 100 && !e.d.boss) pn = e.d.calmPat || pn;
    pats.push({ e, p: PATS[pn](a.length > 1 ? 0.7 : 1, e) });
  }
  const dur = Math.max(...pats.map(p => p.p.dur)) * (a.some(e => e.mercy >= 100) && !a.some(e => e.d.boss) ? 0.75 : 1);
  const bw = Math.max(...pats.map(p => p.p.w || 90)), bh = Math.max(...pats.map(p => p.p.h || 90));
  const bh2 = Math.min(bh, 90); B.bt = { x: 160 - bw / 2, y: 72 - bh2 / 2, w: bw, h: bh2 };
  B.boxOn = true; const st0 = pats[0].p.start || [0.5, 0.5]; B.soul.x = B.bt.x + B.bt.w * st0[0]; B.soul.y = B.bt.y + B.bt.h * st0[1]; B.soul.inv = 0; B.soul.tr = []; B.bullets = [];
  B.state = 'boxin'; sfx('whoosh', { vol: 0.4 });
  await wait(0.35);
  B.box = Object.assign({}, B.bt);
  for (const p of pats) { p.p.timers = {}; p.p.atk = p.e.d.atk; if (p.p.init) p.p.init(mkP(p)); }
  B.pats = pats; B.patT = 0; B.patDur = dur; B.state = 'dodge';
  await waitUntil(() => B.patT >= B.patDur || G.hp <= 0);
  B.state = 'boxout'; B.bullets.forEach(b => { if (!b.dying) { b.dying = 0.001; } });
  await wait(0.3);
  B.bullets = []; B.boxOn = false; B.ward = 0;
  B.state = 'busy';
  if (B.opts.afterAttack) await B.opts.afterAttack();
}
function mkP(p) {
  const bx = B.bt;
  return {
    x: bx.x, y: bx.y, w: bx.w, h: bx.h, cx: bx.x + bx.w / 2, cy: bx.y + bx.h / 2, e: p.e, pat: p.p, soul: B.soul,
    get t() { return B.patT; },
    ev(key, iv, fn, st = 0) { const T = p.p.timers; if (T[key] == null) T[key] = st; while (B.patT >= T[key]) { fn(); T[key] += iv; } },
    once(key, at, fn) { const T = p.p.timers; if (!T['o' + key] && B.patT >= at) { T['o' + key] = 1; fn(); } },
    aim(x, y, sp) { const d = Math.hypot(B.soul.x - x, B.soul.y - y) || 1; return [(B.soul.x - x) / d * sp, (B.soul.y - y) / d * sp]; },
    dmg: p.e.d.atk
  };
}
function bul(o) {
  const b = Object.assign({ x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, r: 3, type: 'orb', col: '#e8e4f0', t: 0, life: 9, parry: true, grazed: false, warn: 0, rot: 0, vr: 0, len: 0, wd: 3, alpha: 1 }, o);
  if (b.type === 'sword' || b.type === 'spear' || b.type === 'bone' || b.type === 'feather') { if (!o.rot && (b.vx || b.vy)) b.rot = Math.atan2(b.vy, b.vx); }
  B.bullets.push(b); return b;
}
function updateDodge(dt) {
  const s = B.soul;
  if (B.hitstop > 0) { B.hitstop -= dt; return; }
  B.patT += dt;
  // soul movement
  const a = Input.axis(); const slow = Input.h('back') && !Input.joy;
  const sp = (slow ? 46 : 92) * dt;
  s.x += a.x * sp; s.y += a.y * sp;
  const bx = B.box; s.x = clamp(s.x, bx.x + 4, bx.x + bx.w - 4); s.y = clamp(s.y, bx.y + 4, bx.y + bx.h - 4);
  s.tr.push([s.x, s.y]); if (s.tr.length > 6) s.tr.shift();
  s.inv = Math.max(0, s.inv - dt); s.parry = Math.max(0, s.parry - dt); s.cd = Math.max(0, s.cd - dt);
  if (Input.p('ok') && s.cd <= 0) { s.parry = 0.2; s.cd = 0.6; sfx('swing', { vol: 0.35, rate: 1.6 }); }
  for (const p of B.pats) if (p.p.u) p.p.u(mkP(p), dt);
  for (const b of B.bullets) {
    if (b.dying) { b.dying += dt; continue; }
    if (b.warn > 0) { b.warn -= dt; if (b.warn <= 0 && b.onAct) b.onAct(b); continue; } // life/t only start counting after the warning ends
    b.t += dt;
    if (b.upd) b.upd(b, dt);
    b.vx += b.ax * dt; b.vy += b.ay * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
    if (b.type === 'ring') b.rad += b.grow * dt;
    if (b.t > b.life) b.dead = true;
    if (b.type !== 'beam' && b.type !== 'ring' && (b.x < bx.x - 60 || b.x > bx.x + bx.w + 60 || b.y < bx.y - 60 || b.y > bx.y + bx.h + 60)) b.dead = true;
    if (b.type === 'ring' && b.rad > 200) b.dead = true;
    if (b.dead || b.harmless) continue;
    // collision
    const d = bulDist(b, s.x, s.y);
    if (d < 2.2) {
      if (s.parry > 0 && b.parry) { parryBullet(b); continue; }
      if (s.inv <= 0) { hurtSoul(b); if (!b.pierce && b.type !== 'beam' && b.type !== 'ring') b.dead = true; }
    } else if (d < 7.5) {
      if (s.parry > 0 && b.parry && d < 7.5) { parryBullet(b); continue; }
      if (!b.grazed) { b.grazed = true; G.tp = Math.min(100, G.tp + 1.1 * grazeMul()); sfxT('graze', 0.05); bfx({ kind: 'graze', x: s.x, y: s.y, life: 0.25 }); }
      else if (b.type === 'beam' || b.type === 'ring') { G.tp = Math.min(100, G.tp + 4 * dt * grazeMul()); }
    }
  }
  B.bullets = B.bullets.filter(b => !b.dead && !(b.dying > 0.3));
}
function parryBullet(b) {
  b.dying = 0.001; sfx('parry', { vol: 0.7 }); G.tp = Math.min(100, G.tp + 5);
  B.hitstop = 0.05; B.soul.parry = 0; B.soul.cd = 0.25;
  bfx({ kind: 'parry', x: b.x, y: b.y, life: 0.35 });
  for (let i = 0; i < 6; i++) bfx({ kind: 'dot', x: b.x, y: b.y, vx: rnd(-90, 90), vy: rnd(-90, 90), col: '#ffd75e', life: 0.3 });
  B.special.parries = (B.special.parries || 0) + 1;
}
function hurtSoul(b) {
  let dmg = Math.round((B.pats[0]?.p.atk || 5) * (b.dmg || 1) * 1.25 - def() * 0.45);
  dmg = Math.max(1, dmg);
  if (B.defending) dmg = Math.ceil(dmg * 0.5);
  if (B.ward) dmg = Math.ceil(dmg * 0.5);
  G.hp = Math.max(0, G.hp - dmg); B.soul.inv = 1.0; sfx('hurt'); shake(3); B.hpShake = 0.4; B.heroFlash = 0.3;
  addNum(B.soul.x, B.soul.y - 8, dmg, '#ff5a5a');
  if (G.hp <= 0) B.patT = B.patDur;
}
function segDist(px, py, x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1; const l = dx * dx + dy * dy || 1; let t = ((px - x1) * dx + (py - y1) * dy) / l; t = clamp(t, 0, 1); return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)); }
function bulDist(b, x, y) {
  switch (b.type) {
    case 'beam': { const dx = Math.max(b.x - x, 0, x - (b.x + b.w)), dy = Math.max(b.y - y, 0, y - (b.y + b.h)); return Math.hypot(dx, dy); }
    case 'ring': { const d = Math.hypot(x - b.x, y - b.y); const ang = Math.atan2(y - b.y, x - b.x); let da = Math.abs(((ang - b.gap + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (b.gapW && da < b.gapW / 2) return 99; return Math.abs(d - b.rad) - b.th / 2; }
    case 'sword': case 'spear': case 'bone': case 'feather': case 'line': { const c = Math.cos(b.rot) * b.len / 2, s = Math.sin(b.rot) * b.len / 2; return segDist(x, y, b.x - c, b.y - s, b.x + c, b.y + s) - b.wd / 2; }
    default: return Math.hypot(x - b.x, y - b.y) - b.r;
  }
}

// ---------- UPDATE ----------
function updateBattle(dt) {
  B.t += dt;
  if (B.shards) { B.shards.t += dt; for (const s of B.shards.list) { s.t += dt; s.vy += 400 * dt; s.cx += s.vx * dt; s.cy += s.vy * dt; s.rot += s.vr * dt; } }
  for (const e of B.enemies) {
    e.t += dt; e.shake = Math.max(0, e.shake - dt); e.flash = Math.max(0, e.flash - dt); e.hpT = Math.max(0, e.hpT - dt); e.enterT = Math.min(1, e.enterT + dt * 2);
    if (e.dying) e.dying += dt * 0.8;
  }
  for (const n of B.nums) { n.t += dt; n.vy += 160 * dt; n.y += n.vy * dt; if (n.y > n.baseY) { } }
  B.nums = B.nums.filter(n => n.t < 1.1);
  for (const f of B.fx) { f.t += dt; if (f.vx != null) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 120 * dt; } }
  B.fx = B.fx.filter(f => f.t < f.life);
  for (const b of B.bubbles) b.t += dt; B.bubbles = B.bubbles.filter(b => b.t < b.dur);
  B.heroFlash = Math.max(0, B.heroFlash - dt); B.hpShake = Math.max(0, B.hpShake - dt);
  if (B.state === 'boxin') { const k = 0.25; for (const kk of ['x', 'y', 'w', 'h']) B.box[kk] += (B.bt[kk] - B.box[kk]) * k; }
  if (B.state === 'boxout') { const tg = { x: 10, y: 140, w: 300, h: 36 }; for (const kk of ['x', 'y', 'w', 'h']) B.box[kk] += (tg[kk] - B.box[kk]) * 0.25; }
  if (B.msg) updateBText(dt);
  else if (B.state === 'aim') updateAim(dt);
  else if (B.state === 'dodge') updateDodge(dt);
  else if (['menu', 'target', 'actlist', 'pray', 'item'].includes(B.state)) updateBattleMenu();
  for (const b of B.bullets) if (B.state !== 'dodge' && b.dying) b.dying += dt;
}

// ---------- DRAW ----------
function drawBattleBg(g) {
  const T = B.theme, t = B.t;
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, T.a); gr.addColorStop(0.62, T.b); gr.addColorStop(1, T.a);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // seal circle
  g.save(); g.translate(232, 70); g.rotate(t * 0.08);
  g.globalAlpha = 0.35; g.strokeStyle = T.rune; g.lineWidth = 1;
  for (const r of [58, 50, 30]) { g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.stroke(); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.save(); g.rotate(a); g.fillStyle = T.rune; g.fillRect(52, -2, 3, 4); g.fillRect(53, -3, 1, 6); g.restore(); }
  g.restore();
  g.save(); g.translate(232, 70); g.globalAlpha = 0.3; g.strokeStyle = T.rune;
  g.beginPath(); g.arc(0, 0, 22, Math.PI * 0.35, Math.PI * 1.65); g.arc(-8, 0, 18, Math.PI * 1.5, Math.PI * 0.5, true); g.stroke();
  g.rotate(-t * 0.05); for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(32, 0); g.lineTo(44, 0); g.stroke(); g.fillStyle = T.rune; g.fillRect(44, -1, 2, 2); }
  g.restore(); g.globalAlpha = 1;
  // perspective floor
  const hz = 104;
  g.strokeStyle = T.line; g.lineWidth = 1; g.globalAlpha = 0.6;
  for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(160 + i * 8, hz); g.lineTo(160 + i * 60, H); g.stroke(); }
  for (let k = 0; k < 8; k++) { const z = ((k + (t * 0.6) % 1) / 8); const y = hz + Math.pow(z, 2) * (H - hz); g.globalAlpha = 0.15 + z * 0.5; g.beginPath(); g.moveTo(0, Math.round(y) + 0.5); g.lineTo(W, Math.round(y) + 0.5); g.stroke(); }
  g.globalAlpha = 1;
  // drifting runes
  for (let i = 0; i < 14; i++) {
    const x = (i * 53 + t * (6 + (i % 3) * 4)) % (W + 20) - 10, y = 12 + (i * 37) % 86 + Math.sin(t + i) * 3;
    g.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2 + i); g.fillStyle = T.rune;
    g.fillRect(Math.round(x), Math.round(y), 1, 5); g.fillRect(Math.round(x) - 2, Math.round(y) + 1, 5, 1); if (i % 2) g.fillRect(Math.round(x) + 1, Math.round(y) + 3, 2, 1);
  }
  g.globalAlpha = 1;
  g.drawImage(glowSprite(70, T.glow), 232 - 70, 70 - 70);
}
function drawBattle() {
  const g = lc; const sh = Fx.shake ? rnd(-Fx.shake, Fx.shake) : 0;
  g.save(); g.translate(Math.round(sh), Math.round(sh * 0.5));
  drawBattleBg(g);
  const dim = B.state === 'dodge' || B.state === 'boxin' ? 0.45 : 1;
  // hero
  const hp = B.heroPose; const kf = hp === 'attack' ? knight('attack', 0, B.heroAtk || 0) : knight(hp, B.t * 0.9);
  const hx = 34 + Math.round(B.heroX) - (B.state === 'intro' && B.shards ? 60 * (1 - Math.min(1, B.shards.t)) : 0), hy = 56;
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(hx + 14, hy + 50, 26, 3); g.fillRect(hx + 18, hy + 49, 18, 5);
  g.globalAlpha = dim; g.drawImage(B.heroFlash > 0 && Math.floor(B.t * 30) % 2 ? tint(kf, '#ff4a4a') : kf, hx, hy); g.globalAlpha = 1;
  if (B.defending) { g.globalAlpha = 0.25 + 0.1 * Math.sin(B.t * 6); g.drawImage(glowSprite(26, 'rgba(140,200,255,1)'), hx + 2, hy + 2); g.globalAlpha = 1; }
  // enemies
  for (const e of B.enemies) {
    if (e.dying > 1) continue;
    const img = mframe(e.d.spr || e.id, e.t * (e.d.animSp || 0.8), false);
    const ex = Math.round(e.x - img.width / 2 + (e.shake ? Math.sin(e.shake * 80) * 4 * e.shake / 0.4 : 0) + (1 - easeOut(e.enterT)) * 80), ey = Math.round(e.y - img.height / 2);
    g.fillStyle = 'rgba(0,0,0,0.4)'; const shw = Math.min(30, img.width / 2.4); g.fillRect(Math.round(e.x - shw), Math.round(e.y + img.height / 2 - 2), Math.round(shw * 2), 3);
    g.globalAlpha = dim * e.alpha;
    if (e.dying) {
      const k = e.dying;
      if (e.spared) { g.globalAlpha = Math.max(0, 1 - k); g.drawImage(tint(img, '#fff', 0.5 + k * 0.5), ex, ey - k * 10); }
      else { // disintegrate by rows
        const rows = img.height; for (let y = 0; y < rows; y += 2) { const off = Math.max(0, k * 60 - (rows - y) * 0.6); if (off > 40) continue; g.globalAlpha = Math.max(0, 1 - off / 40); g.drawImage(tint(img, '#ffffff', 0.4), 0, y, img.width, 2, ex + off * (y % 4 ? 1 : -1) * 0.6, ey + y - off * 0.3, img.width, 2); }
      }
      g.globalAlpha = 1; continue;
    }
    g.drawImage(e.flash > 0 ? tint(img, '#fff', 0.8) : img, ex, ey);
    g.globalAlpha = 1;
    if (e.mercy >= 100 && !e.dying) { g.globalAlpha = 0.2 + 0.15 * Math.sin(B.t * 4); g.drawImage(glowSprite(30, 'rgba(255,220,100,1)'), e.x - 30, e.y - 30); g.globalAlpha = 1; }
  }
  // battle box & bullets
  if (B.boxOn) {
    const bx = B.box;
    g.fillStyle = 'rgba(0,0,0,0.88)'; g.fillRect(Math.round(bx.x), Math.round(bx.y), Math.round(bx.w), Math.round(bx.h));
    g.save(); g.beginPath(); g.rect(Math.round(bx.x), Math.round(bx.y), Math.round(bx.w), Math.round(bx.h)); g.clip();
    // faint grid
    g.globalAlpha = 0.12; g.fillStyle = B.theme.rune; for (let x = Math.round(bx.x) + ((B.t * 8) % 10); x < bx.x + bx.w; x += 10) g.fillRect(Math.round(x), Math.round(bx.y), 1, Math.round(bx.h)); for (let y = Math.round(bx.y) + 5; y < bx.y + bx.h; y += 10) g.fillRect(Math.round(bx.x), y, Math.round(bx.w), 1); g.globalAlpha = 1;
    for (const b of B.bullets) drawBullet(g, b);
    if (B.state === 'dodge' || B.state === 'boxin') drawSoul(g);
    g.restore();
    // frame
    const fc = '#e8e4f0';
    g.fillStyle = fc; g.fillRect(Math.round(bx.x) - 2, Math.round(bx.y) - 2, Math.round(bx.w) + 4, 2); g.fillRect(Math.round(bx.x) - 2, Math.round(bx.y + bx.h), Math.round(bx.w) + 4, 2); g.fillRect(Math.round(bx.x) - 2, Math.round(bx.y), 2, Math.round(bx.h)); g.fillRect(Math.round(bx.x + bx.w), Math.round(bx.y), 2, Math.round(bx.h));
    g.fillStyle = B.theme.rune; for (const [cx2, cy2] of [[bx.x - 3, bx.y - 3], [bx.x + bx.w - 1, bx.y - 3], [bx.x - 3, bx.y + bx.h - 1], [bx.x + bx.w - 1, bx.y + bx.h - 1]]) g.fillRect(Math.round(cx2), Math.round(cy2), 4, 4);
  }
  // fx
  for (const f of B.fx) drawBfx(g, f);
  // shards
  if (B.shards) {
    const S = B.shards; g.fillStyle = '#000'; g.globalAlpha = Math.max(0, 1 - S.t * 1.6); g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    for (const s of S.list) {
      const [x1, y1, x2, y2, x3, y3] = s.tri; const ocx = (x1 + x2 + x3) / 3, ocy = (y1 + y2 + y3) / 3;
      g.save(); g.translate(s.cx, s.cy); g.rotate(s.rot); g.beginPath(); g.moveTo(x1 - ocx, y1 - ocy); g.lineTo(x2 - ocx, y2 - ocy); g.lineTo(x3 - ocx, y3 - ocy); g.closePath(); g.clip();
      g.drawImage(S.img, -ocx, -ocy); g.restore();
    }
  }
  g.restore();
}
function drawSoul(g) {
  const s = B.soul; const x = Math.round(s.x), y = Math.round(s.y);
  if (s.inv > 0 && Math.floor(B.t * 20) % 2) return;
  for (let i = 0; i < s.tr.length - 1; i++) { g.globalAlpha = i / s.tr.length * 0.3; g.fillStyle = '#8fd8ff'; g.fillRect(Math.round(s.tr[i][0]) - 2, Math.round(s.tr[i][1]) - 2, 4, 4); }
  g.globalAlpha = 1;
  // shield crest
  g.fillStyle = '#0a0a14'; g.fillRect(x - 4, y - 4, 9, 7); g.fillRect(x - 3, y + 3, 7, 1); g.fillRect(x - 2, y + 4, 5, 1); g.fillRect(x - 1, y + 5, 3, 1);
  g.fillStyle = s.parry > 0 ? '#ffd75e' : '#cfe8ff'; g.fillRect(x - 3, y - 3, 7, 6); g.fillRect(x - 2, y + 3, 5, 1); g.fillRect(x - 1, y + 4, 3, 1);
  g.fillStyle = s.parry > 0 ? '#fff4c0' : '#6aa8e8'; g.fillRect(x, y - 3, 1, 7); g.fillRect(x - 2, y - 1, 5, 1);
  if (s.parry > 0) { g.globalAlpha = s.parry / 0.2; g.strokeStyle = '#ffd75e'; g.lineWidth = 1; g.beginPath(); g.arc(x + 0.5, y + 0.5, 9 - s.parry * 10, 0, 6.283); g.stroke(); g.globalAlpha = 1; }
  if (s.cd > 0) { g.fillStyle = 'rgba(255,215,94,0.6)'; g.fillRect(x - 4, y + 8, Math.round(8 * (1 - s.cd / 0.6)), 1); }
}
function drawBullet(g, b) {
  let a = b.alpha; if (b.dying) a *= Math.max(0, 1 - b.dying / 0.3);
  if (b.warn > 0) {
    const bl = Math.floor(B.t * 16) % 2 ? 0.55 : 0.25;
    g.globalAlpha = bl;
    if (b.type === 'beam') { g.fillStyle = b.wcol || '#ff5a5a'; g.fillRect(Math.round(b.x), Math.round(b.y), Math.round(b.w), Math.round(b.h)); g.globalAlpha = 1; g.fillStyle = b.wcol || '#ff5a5a'; if (b.w > b.h) { g.fillRect(Math.round(b.x), Math.round(b.y), Math.round(b.w), 1); g.fillRect(Math.round(b.x), Math.round(b.y + b.h - 1), Math.round(b.w), 1); } else { g.fillRect(Math.round(b.x), Math.round(b.y), 1, Math.round(b.h)); g.fillRect(Math.round(b.x + b.w - 1), Math.round(b.y), 1, Math.round(b.h)); } }
    else if (b.type === 'ring') { }
    else { g.strokeStyle = b.wcol || '#ff5a5a'; g.lineWidth = 1; g.beginPath(); g.arc(Math.round(b.x) + 0.5, Math.round(b.y) + 0.5, b.r + 3 + Math.sin(B.t * 20), 0, 6.283); g.stroke(); if (b.type === 'sword' || b.type === 'spear') { g.globalAlpha = bl * 0.5; const c = Math.cos(b.rot), s = Math.sin(b.rot); g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x + c * 200, b.y + s * 200); g.stroke(); } }
    g.globalAlpha = 1; return;
  }
  g.globalAlpha = a;
  const x = Math.round(b.x), y = Math.round(b.y);
  switch (b.type) {
    case 'orb': case 'wisp': case 'ember': case 'tear': case 'spore': case 'dust': {
      const r = b.r;
      if (b.type === 'ember') { const fl = Math.sin(b.t * 20 + b.x) > 0; g.fillStyle = fl ? '#ffd27a' : '#ff7a2a'; g.fillRect(x - 1, y - 2, 3, 4); g.fillRect(x - 2, y - 1, 5, 2); g.fillStyle = '#fff2c0'; g.fillRect(x, y - 1, 1, 2); break; }
      if (b.type === 'tear') { g.fillStyle = b.col; g.fillRect(x - 1, y - 3, 2, 2); g.fillRect(x - 2, y - 1, 4, 3); g.fillStyle = '#fff'; g.fillRect(x - 1, y, 1, 1); break; }
      g.globalAlpha = a * 0.35; g.fillStyle = b.col; g.beginPath(); g.arc(x + 0.5, y + 0.5, r + 1.5, 0, 6.283); g.fill();
      g.globalAlpha = a; g.beginPath(); g.arc(x + 0.5, y + 0.5, r, 0, 6.283); g.fill();
      g.fillStyle = b.core || '#fff'; g.fillRect(x - Math.floor(r / 2), y - Math.floor(r / 2), Math.max(1, Math.ceil(r * 0.8)), Math.max(1, Math.ceil(r * 0.8)));
      break;
    }
    case 'shard': case 'rune': case 'note': case 'z': {
      g.save(); g.translate(x + 0.5, y + 0.5); g.rotate(b.type === 'shard' ? Math.atan2(b.vy, b.vx) : b.rot);
      if (b.type === 'shard') { g.fillStyle = b.col; g.beginPath(); g.moveTo(b.r * 2, 0); g.lineTo(0, b.r * 0.8); g.lineTo(-b.r * 1.5, 0); g.lineTo(0, -b.r * 0.8); g.fill(); g.fillStyle = '#fff'; g.fillRect(0, -0.5, b.r, 1); }
      else if (b.type === 'rune') { g.strokeStyle = b.col; g.lineWidth = 1; g.strokeRect(-b.r, -b.r, b.r * 2, b.r * 2); g.fillStyle = b.col; g.fillRect(-1, -b.r + 1, 2, b.r * 2 - 2); g.fillRect(-b.r + 1, -1, b.r * 2 - 2, 1); }
      else if (b.type === 'note') { g.fillStyle = b.col; g.fillRect(-2, 0, 4, 3); g.fillRect(1, -6, 1, 7); g.fillRect(1, -6, 3, 1); }
      else { g.fillStyle = b.col; g.fillRect(-3, -3, 6, 1); g.fillRect(1, -2, 1, 1); g.fillRect(0, -1, 1, 1); g.fillRect(-1, 0, 1, 1); g.fillRect(-2, 1, 1, 1); g.fillRect(-3, 2, 6, 1); }
      g.restore(); break;
    }
    case 'sword': case 'spear': case 'bone': case 'feather': case 'line': {
      g.save(); g.translate(x, y); g.rotate(b.rot);
      const L = b.len;
      if (b.type === 'sword') { g.fillStyle = b.col || '#d8dce8'; g.fillRect(-L / 2, -1, L - 5, 3); g.fillStyle = '#fff'; g.fillRect(-L / 2, -1, L - 5, 1); g.fillStyle = b.col || '#d8dce8'; g.beginPath(); g.moveTo(L / 2 - 5, -1); g.lineTo(L / 2, 0.5); g.lineTo(L / 2 - 5, 2); g.fill(); g.fillStyle = '#8a6a3a'; g.fillRect(-L / 2 - 1, -3, 2, 7); g.fillRect(-L / 2 - 4, 0, 3, 1); }
      else if (b.type === 'spear') { g.fillStyle = '#6a4a2a'; g.fillRect(-L / 2, -0.5, L - 6, 2); g.fillStyle = b.col || '#c8ccd8'; g.beginPath(); g.moveTo(L / 2 - 7, -2.5); g.lineTo(L / 2, 0.5); g.lineTo(L / 2 - 7, 3.5); g.fill(); }
      else if (b.type === 'bone') { g.fillStyle = b.col || '#e8e2d0'; g.fillRect(-L / 2, -1, L, 3); g.fillRect(-L / 2 - 1, -2, 3, 2); g.fillRect(-L / 2 - 1, 1, 3, 2); g.fillRect(L / 2 - 2, -2, 3, 2); g.fillRect(L / 2 - 2, 1, 3, 2); }
      else if (b.type === 'feather') { g.fillStyle = b.col || '#2a2a3a'; g.beginPath(); g.ellipse(0, 0, L / 2, 2.5, 0, 0, 6.283); g.fill(); g.fillStyle = '#6a6a8a'; g.fillRect(-L / 2, 0, L, 0.6); }
      else { g.fillStyle = b.col; g.fillRect(-L / 2, -b.wd / 2, L, b.wd); g.fillStyle = '#fff'; g.fillRect(-L / 2, -0.5, L, 1); }
      g.restore(); break;
    }
    case 'beam': {
      const k = b.t; const fl = 0.75 + 0.25 * Math.sin(B.t * 40);
      g.fillStyle = b.col || '#fff'; g.globalAlpha = a * fl; g.fillRect(Math.round(b.x), Math.round(b.y), Math.round(b.w), Math.round(b.h));
      g.fillStyle = '#fff'; g.globalAlpha = a; if (b.w > b.h) g.fillRect(Math.round(b.x), Math.round(b.y + b.h / 2 - 1), Math.round(b.w), 2); else g.fillRect(Math.round(b.x + b.w / 2 - 1), Math.round(b.y), 2, Math.round(b.h));
      break;
    }
    case 'ring': {
      g.strokeStyle = b.col; g.lineWidth = b.th;
      if (b.gapW) { g.beginPath(); g.arc(b.x, b.y, Math.max(0.5, b.rad), b.gap + b.gapW / 2, b.gap - b.gapW / 2 + Math.PI * 2); g.stroke(); }
      else { g.beginPath(); g.arc(b.x, b.y, Math.max(0.5, b.rad), 0, 6.283); g.stroke(); }
      g.strokeStyle = '#fff'; g.lineWidth = 1; g.globalAlpha = a * 0.6; if (b.gapW) { g.beginPath(); g.arc(b.x, b.y, Math.max(0.5, b.rad), b.gap + b.gapW / 2, b.gap - b.gapW / 2 + Math.PI * 2); g.stroke(); }
      break;
    }
    case 'raven': { g.fillStyle = '#1a1a24'; const f = Math.sin(b.t * 20) * 3; g.fillRect(x - 3, y - 1, 7, 3); g.fillRect(x - 7, y - 2 + f, 5, 2); g.fillRect(x + 3, y - 2 + f, 5, 2); g.fillStyle = '#d8d2c0'; g.fillRect(x + (b.vx > 0 ? 3 : -4), y - 1, 2, 2); g.fillStyle = '#ff3a3a'; g.fillRect(x + (b.vx > 0 ? 4 : -4), y - 1, 1, 1); break; }
    case 'flame': { const h = 6 + Math.sin(b.t * 18 + b.x) * 1.5; g.fillStyle = '#c8401a'; g.fillRect(x - 2, y - h / 2, 5, h); g.fillStyle = '#ffa030'; g.fillRect(x - 1, y - h / 2 + 2, 3, h - 2); g.fillStyle = '#fff0b0'; g.fillRect(x, y, 1, 2); break; }
    case 'crescent': { g.strokeStyle = b.col; g.lineWidth = 2; g.beginPath(); g.arc(x, y, b.r, b.vx > 0 ? -1.2 : Math.PI - 1.2 + 0, b.vx > 0 ? 1.2 : Math.PI + 1.2); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 0.7; g.stroke(); break; }
  }
  g.globalAlpha = 1;
}
function drawBfx(g, f) {
  const k = f.t / f.life;
  switch (f.kind) {
    case 'dot': g.globalAlpha = 1 - k; g.fillStyle = f.col; g.fillRect(Math.round(f.x), Math.round(f.y), 2, 2); break;
    case 'slash': { g.globalAlpha = 1 - k; g.strokeStyle = f.col; g.lineWidth = 3 * (1 - k) + 1; g.beginPath(); g.arc(f.x - 6, f.y + 4, 22, -1.6 + k * 0.6, 0.4 + k * 0.8); g.stroke(); g.lineWidth = 1; g.strokeStyle = '#ffd75e'; g.beginPath(); g.arc(f.x - 6, f.y + 4, 18, -1.4 + k, 0.3 + k); g.stroke(); break; }
    case 'ring': g.globalAlpha = 1 - k; g.strokeStyle = f.col; g.lineWidth = 2; g.beginPath(); g.arc(f.x, f.y, 6 + k * 30, 0, 6.283); g.stroke(); break;
    case 'parry': g.globalAlpha = 1 - k; g.strokeStyle = '#ffd75e'; g.lineWidth = 2; g.beginPath(); g.arc(f.x, f.y, 3 + k * 14, 0, 6.283); g.stroke(); for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.78; g.fillStyle = '#fff'; g.fillRect(Math.round(f.x + Math.cos(a) * (4 + k * 16)), Math.round(f.y + Math.sin(a) * (4 + k * 16)), 2, 2); } break;
    case 'graze': g.globalAlpha = (1 - k) * 0.7; g.strokeStyle = '#8fd8ff'; g.lineWidth = 1; g.beginPath(); g.arc(f.x, f.y, 5 + k * 6, 0, 6.283); g.stroke(); break;
    case 'aimflash': break;
    case 'pillar': { g.globalAlpha = Math.sin(k * Math.PI) * 0.7; g.fillStyle = f.col; g.fillRect(f.x - 10, 0, 20, f.y + 20); g.fillStyle = '#fff'; g.fillRect(f.x - 3, 0, 6, f.y + 20); for (let i = 0; i < 5; i++) { g.fillStyle = f.col; g.fillRect(Math.round(f.x + Math.sin(i * 2 + f.t * 4) * 14), Math.round(f.y + 20 - ((f.t * 60 + i * 15) % 60)), 2, 2); } break; }
    case 'beam': { g.globalAlpha = Math.sin(k * Math.PI); g.fillStyle = f.col; g.fillRect(f.x - 8 + k * 4, 0, 16 - k * 8, f.y + 30); g.fillStyle = '#fff'; g.fillRect(f.x - 2, 0, 4, f.y + 30); g.drawImage(glowSprite(30, 'rgba(200,220,255,0.8)'), f.x - 30, f.y - 30); break; }
    case 'spark': { g.globalAlpha = 1 - k; for (let i = 0; i < 6; i++) { const a = i + f.t * 3; g.fillStyle = f.col; g.fillRect(Math.round(f.x + Math.cos(a) * (6 + k * 16)), Math.round(f.y + Math.sin(a) * (6 + k * 16) - k * 10), 2, 2); } break; }
  }
  g.globalAlpha = 1;
}
const ICON = {
  fight: g => { g.fillRect(2, 9, 2, 2); g.fillRect(4, 7, 2, 2); g.fillRect(6, 5, 2, 2); g.fillRect(8, 3, 2, 2); g.fillRect(10, 1, 2, 2); g.fillRect(1, 7, 5, 1); g.fillRect(3, 6, 1, 5); },
  act: g => { g.fillRect(2, 2, 9, 6); g.fillRect(3, 8, 2, 2); g.fillRect(2, 10, 1, 1); },
  pray: g => { g.fillRect(5, 2, 3, 9); g.fillRect(4, 4, 5, 2); g.fillRect(2, 11, 9, 1); },
  item: g => { g.fillRect(3, 4, 7, 7); g.fillRect(4, 2, 5, 2); g.fillRect(5, 1, 3, 1); },
  defend: g => { g.fillRect(2, 1, 9, 6); g.fillRect(3, 7, 7, 2); g.fillRect(4, 9, 5, 1); g.fillRect(5, 10, 3, 1); }
};
function drawBattleUI() {
  uiT();
  // TP gauge
  const tpH = 74, tpx = 8, tpy = 26;
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(tpx - 1, tpy - 1, 8, tpH + 2);
  ctx.fillStyle = '#3a2a4a'; ctx.fillRect(tpx, tpy, 6, tpH);
  const fh = tpH * G.tp / 100; ctx.fillStyle = G.tp >= 100 ? '#ffd75e' : '#e88a3a'; ctx.fillRect(tpx, tpy + tpH - fh, 6, fh);
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(tpx, tpy + tpH - fh, 6, 0.6);
  text('ДУХ', tpx + 3, tpy - 11, '#e8a86a', 7, 'center', { w: 700 }); text(Math.floor(G.tp) + '%', tpx + 3, tpy + tpH + 2, G.tp >= 100 ? '#ffd75e' : '#e8e4f0', 6, 'center');
  // party strip
  const sy = 121; const hs = B.hpShake > 0 ? rnd(-1, 1) : 0;
  box(10, sy, 300, 16, { border: '#8a7fb0' });
  text('АРДАН', 16, sy + 4, '#e8e4f0', 8, 'left', { w: 600 }); text('LV' + G.lv, 56, sy + 4.5, '#b8b0c8', 7);
  text('ОЗ', 78, sy + 4.5, '#b8b0c8', 7);
  ctx.fillStyle = '#4a1a22'; ctx.fillRect(92 + hs, sy + 5, 60, 6); ctx.fillStyle = G.hp / maxHp() < 0.25 ? '#ff5a5a' : '#e8c23a'; ctx.fillRect(92 + hs, sy + 5, 60 * G.hp / maxHp(), 6);
  text(`${G.hp}/${maxHp()}`, 156, sy + 4, G.hp / maxHp() < 0.25 ? '#ff5a5a' : '#e8e4f0', 8);
  // command buttons
  for (let i = 0; i < 5; i++) {
    const bx = 196 + i * 22, by = sy + 2, sel = B.cmd === i && ['menu', 'target', 'actlist', 'pray', 'item'].includes(B.state);
    ctx.fillStyle = sel ? '#3a2a10' : 'rgba(0,0,0,0.5)'; ctx.fillRect(bx, by, 18, 12);
    ctx.fillStyle = sel ? '#ffd75e' : '#8a7fb0'; ctx.fillRect(bx, by, 18, 0.7); ctx.fillRect(bx, by + 11.3, 18, 0.7); ctx.fillRect(bx, by, 0.7, 12); ctx.fillRect(bx + 17.3, by, 0.7, 12);
    ctx.save(); ctx.translate(bx + 3, by); ctx.fillStyle = sel ? '#ffd75e' : '#c8c0d8'; ICON[CMDS[i].k](ctx); ctx.restore();
  }
  // text box
  const ty = 140; box(10, ty, 300, 36);
  if (B.state === 'dodge' || B.state === 'boxin' || B.state === 'boxout') {
    if (B.state === 'dodge' && B.turn <= 2) text(isTouch ? 'Джойстик — уклон. [A] — парирование!' : 'Стрелки — уклон. Enter — парирование! Shift — точно', 160, ty + 13, '#7a75a0', 7, 'center');
  } else if (B.msg) {
    let left = Math.floor(B.msg.n); B.msg.lines.forEach((ln, i) => { if (i < 2) drawRich(ln, 18, ty + 6 + i * 13, left, 8); left -= ln.length; });
    if (B.msg.done && Math.floor(TIME * 3) % 2 === 0) { ctx.fillStyle = '#ffd75e'; ctx.fillRect(298, ty + 28, 5, 1); ctx.fillRect(299, ty + 29, 3, 1); ctx.fillRect(300, ty + 30, 1, 1); }
  } else if (B.state === 'menu') {
    text('* ' + B.flavor, 18, ty + 6, '#e8e4f0', 8);
    text(CMDS[B.cmd].n, 300, ty + 24, '#ffd75e', 7, 'right');
  } else if (B.state === 'target') {
    alive().forEach((e, i) => { const yy = ty + 4 + i * 10.5; if (i === B.sel) heartCursor(16, yy + 2.5); text(e.name, 26, yy, i === B.sel ? '#ffd75e' : (e.mercy >= 100 ? '#ffd75e' : '#e8e4f0'), 8); const hw = 40; ctx.fillStyle = '#4a1a22'; ctx.fillRect(170, yy + 3, hw, 4); ctx.fillStyle = '#8cf08c'; ctx.fillRect(170, yy + 3, hw * e.hp / e.maxhp, 4); ctx.fillStyle = '#3a3010'; ctx.fillRect(220, yy + 3, hw, 4); ctx.fillStyle = '#ffd75e'; ctx.fillRect(220, yy + 3, hw * e.mercy / 100, 4); });
    text('ОЗ', 182, ty + 27, '#8a85a0', 6); text('ПОКОЙ', 232, ty + 27, '#8a85a0', 6);
  } else if (B.state === 'actlist' || B.state === 'pray' || B.state === 'item') {
    let L, lbl;
    if (B.state === 'actlist') { L = actList(B.tgt); lbl = a => a.n; }
    else if (B.state === 'pray') { L = G.prayers; lbl = id => PRAYERS[id].n; }
    else { L = usableItems(); lbl = id => ITEMS[id].n; }
    const per = 6, page = Math.floor(B.sel / per), start = page * per;
    L.slice(start, start + per).forEach((it, k) => {
      const i = start + k, cx = 26 + (k % 2) * 140, cy = ty + 4 + Math.floor(k / 2) * 10.5;
      let col = '#e8e4f0';
      if (B.state === 'pray' && G.tp < PRAYERS[it].cost) col = '#6a6580';
      if (B.state === 'actlist' && it.spare && B.tgt.mercy >= 100) col = '#ffd75e';
      if (i === B.sel) heartCursor(cx - 10, cy + 2.5);
      text(lbl(it), cx, cy, i === B.sel ? '#ffd75e' : col, 8);
      if (B.state === 'pray') text(PRAYERS[it].cost + '%', cx + 116, cy + 0.5, G.tp >= PRAYERS[it].cost ? '#e8a86a' : '#6a6580', 7, 'right');
    });
    const cur = L[B.sel];
    if (B.state === 'pray' && cur) text(PRAYERS[cur].d, 300, ty + 27, '#8a85a0', 6.5, 'right');
    if (B.state === 'item' && cur) text(ITEMS[cur].d, 300, ty + 27, '#8a85a0', 6.5, 'right');
    if (B.state === 'actlist' && cur && cur.d) text(cur.d, 300, ty + 27, '#8a85a0', 6.5, 'right');
    if (L.length > per) text(`${page + 1}/${Math.ceil(L.length / per)}`, 300, ty + 4, '#8a85a0', 6, 'right');
  } else if (B.state === 'aim' && B.aim) {
    // attack bar
    const x0 = 36, x1 = 284, y0 = ty + 10;
    ctx.fillStyle = '#1a1424'; ctx.fillRect(x0, y0, x1 - x0, 16);
    for (let x = x0; x < x1; x += 2) { const d = Math.abs(x - 160); const q = 1 - d / 130; ctx.fillStyle = d < 6 ? '#ffd75e' : q > 0.6 ? '#7a5a2a' : q > 0 ? '#4a3a2a' : '#2a2030'; ctx.fillRect(x, y0 + 2, 2, 12); }
    ctx.fillStyle = '#fff'; ctx.fillRect(159.5, y0, 1, 16);
    for (const c of B.aim.cursors) { if (c.x < x0 - 2) continue; const col = c.hit == null ? '#fff' : (c.hit < 6 ? '#ffd75e' : c.hit < 999 ? '#ff8a5a' : '#6a6580'); ctx.fillStyle = col; ctx.fillRect(c.x - 1.5, y0 - 3, 3, 22); }
    text(isTouch ? 'Жми [A] в центре!' : 'Жми Enter в центре!', 160, ty + 28, '#8a85a0', 6.5, 'center');
  }
  // enemy names & hp bars shown on hit
  for (const e of B.enemies) {
    if (e.hpT > 0 && !e.dying) { const w = 40; ctx.fillStyle = '#000'; ctx.fillRect(e.x - w / 2 - 1, e.y + 30, w + 2, 6); ctx.fillStyle = '#4a1a22'; ctx.fillRect(e.x - w / 2, e.y + 31, w, 4); ctx.fillStyle = '#8cf08c'; ctx.fillRect(e.x - w / 2, e.y + 31, w * e.hp / e.maxhp, 4); }
    if (B.state === 'target' && alive()[B.sel] === e) { const yy = e.y - 38 + Math.sin(TIME * 6) * 2; ctx.fillStyle = '#ffd75e'; ctx.fillRect(e.x - 3, yy, 7, 2); ctx.fillRect(e.x - 2, yy + 2, 5, 1); ctx.fillRect(e.x - 1, yy + 3, 3, 1); ctx.fillRect(e.x, yy + 4, 1, 1); }
  }
  // bubbles
  for (const b of B.bubbles) {
    const e = b.e; const w = Math.max(...b.lines.map(l => tw(l, 8))) + 10, h = b.lines.length * 11 + 6;
    const x = clamp(e.x - w - 26, 100, W - w - 4), y = clamp(e.y - 34, 4, 90);
    ctx.fillStyle = '#f0ece4'; ctx.fillRect(x, y, w, h); ctx.fillRect(x + w, y + 6, 4, 3); ctx.fillRect(x + w + 3, y + 7, 3, 1);
    ctx.fillStyle = '#000'; b.lines.forEach((l, i) => text(l, x + 5, y + 4 + i * 11, '#14101c', 8, 'left', { shadow: false }));
  }
  // numbers
  for (const n of B.nums) { const a = n.t > 0.8 ? 1 - (n.t - 0.8) / 0.3 : 1; ctx.globalAlpha = a; text(n.s, n.x, Math.min(n.y, n.y), n.col, n.s.length > 4 ? 7 : 10, 'center', { w: 700, outline: '#000' }); ctx.globalAlpha = 1; }
}
