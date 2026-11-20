// ================= GAME / SCENES =================
const Game = { scene: 'boot', cine: null, cineT: 0, hidePlayer: false, goT: 0, titleT: 0, titleI: 0, titleMode: 'press', endName: '' };

// ---------- CINEMATIC BACKDROPS ----------
const STARS = Array.from({ length: 70 }, (_, i) => [hash2(i, 1) * W, hash2(i, 2) * 110, hash2(i, 3)]);
function skyGrad(g, a, b, c) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(0.6, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function stars(g, t, a = 1) { for (const [x, y, k] of STARS) { g.globalAlpha = a * (0.3 + 0.7 * Math.abs(Math.sin(t * (0.5 + k) + k * 10))); g.fillStyle = '#e8e8ff'; g.fillRect(Math.round(x), Math.round(y), 1, 1); } g.globalAlpha = 1; }
function moon(g, x, y, r, col = '#e8e4d8', bleed = 0, t = 0) {
  g.drawImage(glowSprite(r * 3, 'rgba(200,200,255,0.25)'), x - r * 3, y - r * 3);
  circ(g, x, y, r, col); circ(g, x - r * 0.3, y - r * 0.2, r * 0.25, shade(col, -0.12)); circ(g, x + r * 0.35, y + r * 0.3, r * 0.18, shade(col, -0.1)); circ(g, x + r * 0.1, y - r * 0.5, r * 0.12, shade(col, -0.1));
  if (bleed) { g.fillStyle = '#7a1a1a'; for (let i = 0; i < 3; i++) { const bx = x - r * 0.4 + i * r * 0.4, len = (r * 0.6 + Math.sin(t + i) * 3) * bleed; g.fillRect(Math.round(bx), Math.round(y + r * 0.7), 2, Math.round(len)); } }
}
function mountains(g, base, col, amp, seed, off = 0) { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 4) { const y = base - Math.abs(Math.sin((x + off) * 0.013 + seed) * amp) - Math.sin((x + off) * 0.041 + seed * 2) * amp * 0.3; g.lineTo(x, y); } g.lineTo(W, H); g.fill(); }
function castleSil(g, x, y, col) { g.fillStyle = col; g.fillRect(x, y - 20, 40, 20); g.fillRect(x + 4, y - 34, 8, 14); g.fillRect(x + 28, y - 30, 8, 10); g.fillRect(x + 16, y - 44, 8, 24); for (let i = 0; i < 5; i++) g.fillRect(x + i * 8, y - 23, 4, 3); poly(g, [x + 16, y - 44, x + 20, y - 54, x + 24, y - 44], col); }
function knightSil(g, x, y, col, s = 1) { g.fillStyle = col; g.fillRect(x - 3 * s, y - 14 * s, 6 * s, 8 * s); g.fillRect(x - 2 * s, y - 19 * s, 5 * s, 5 * s); g.fillRect(x - 3 * s, y - 6 * s, 2 * s, 6 * s); g.fillRect(x + 1 * s, y - 6 * s, 2 * s, 6 * s); poly(g, [x - 3 * s, y - 13 * s, x - 9 * s, y - 2 * s, x - 2 * s, y - 4 * s], col); g.fillRect(x + 4 * s, y - 22 * s, 1 * s, 20 * s); g.fillRect(x + 2 * s, y - 8 * s, 5 * s, 1 * s); }
const cineParts = [];
function drawCine() {
  const g = lc, t = Game.cineT, k = Game.cine;
  if (k === 'moon' || k === 'moon2') {
    skyGrad(g, '#05040c', '#140c1e', '#1a0e14'); stars(g, t);
    moon(g, 236, 48, 22, k === 'moon2' ? '#e8d0c8' : '#e8e4d8', k === 'moon2' ? Math.min(1, t * 0.3) : 0, t);
    mountains(g, 128, '#120c18', 26, 1); castleSil(g, 60, 132, '#0c0810'); mountains(g, 150, '#0a0710', 16, 4); mountains(g, 168, '#060408', 10, 7);
    if (Math.random() < 0.4) cineParts.push({ x: rnd(W), y: -2, vx: rnd(-6, 4), vy: rnd(10, 20), l: 0, c: pick(['#8a8890', '#6a6870']) });
  } else if (k === 'seal') {
    skyGrad(g, '#03050e', '#0a1430', '#06101e'); stars(g, t, 0.8); moon(g, 160, 34, 16, '#dfe8ff');
    mountains(g, 104, '#0a1020', 18, 3);
    g.fillStyle = '#0c1a34'; g.fillRect(0, 104, W, 76); for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(160,190,255,0.15)'; g.fillRect((i * 37 + t * 8) % W, 110 + (i * 13) % 60, 10, 1); }
    g.save(); g.translate(160, 140); g.scale(1, 0.35); g.rotate(t * 0.3); g.strokeStyle = '#9fd0ff'; g.lineWidth = 2; g.globalAlpha = 0.6 + 0.3 * Math.sin(t * 2); for (const r of [50, 40]) { g.beginPath(); g.arc(0, 0, r, 0, 6.283); g.stroke(); } g.beginPath(); for (let i = 0; i <= 5; i++) { const a = i * 4 * Math.PI / 5; if (i) g.lineTo(Math.cos(a) * 40, Math.sin(a) * 40); else g.moveTo(Math.cos(a) * 40, Math.sin(a) * 40); } g.stroke(); g.restore(); g.globalAlpha = 1;
    knightSil(g, 112, 140, '#05070e', 1.4); knightSil(g, 208, 140, '#05070e', 1.4);
    g.fillStyle = '#e8f0ff'; g.fillRect(158, 112, 5, 16); g.fillRect(157, 108, 7, 5); g.fillRect(156, 127, 9, 3);
    g.drawImage(glowSprite(30, 'rgba(160,200,255,0.5)'), 130, 92);
  } else if (k === 'memory') {
    skyGrad(g, '#0a0604', '#1e120a', '#140a06'); stars(g, t, 0.4);
    mountains(g, 110, '#140c08', 14, 2);
    g.fillStyle = '#0e0805'; g.fillRect(0, 130, W, 50);
    const fx = 160, fy = 138; g.drawImage(glowSprite(60, 'rgba(255,140,50,0.35)'), fx - 60, fy - 60);
    for (let i = 0; i < 5; i++) drawFlame(g, fx - 6 + i * 3, fy, 1.6, t + i, 'warm');
    g.fillStyle = '#3a2418'; g.fillRect(fx - 9, fy, 18, 3);
    knightSil(g, 118, 142, '#4a2a18', 1.2); knightSil(g, 204, 142, '#4a2a18', 1.2);
    g.fillStyle = '#4a2a18'; g.fillRect(140, 136, 12, 6); g.fillRect(136, 134, 6, 6); g.fillStyle = '#2a3a6a'; g.fillRect(150, 133, 5, 3);
    g.fillStyle = '#d8d0e0'; g.fillRect(176, 118, 6, 24); g.fillRect(177, 112, 4, 6); g.fillStyle = '#9fd0ff'; g.fillRect(177, 114, 1, 1); g.fillRect(180, 114, 1, 1);
    if (Math.random() < 0.3) cineParts.push({ x: fx + rnd(-6, 6), y: fy - 6, vx: rnd(-4, 4), vy: rnd(-24, -12), l: 0, c: pick(['#ffb040', '#ffd27a']) });
  } else if (k === 'dawn') {
    const p = Math.min(1, t / 8);
    skyGrad(g, lerpCol('#0a0a20', '#3a5a9a', p), lerpCol('#1a1430', '#e8a07a', p), lerpCol('#140a14', '#ffd8a0', p));
    stars(g, t, 1 - p);
    const sy = 150 - p * 60; g.drawImage(glowSprite(80, 'rgba(255,220,150,0.5)'), 160 - 80, sy - 80); circ(g, 160, sy, 16, '#fff2c8');
    mountains(g, 130, lerpCol('#100c18', '#5a3a4a', p), 22, 5); castleSil(g, 210, 136, lerpCol('#0c0810', '#3a2430', p)); mountains(g, 156, lerpCol('#0a0710', '#3a2430', p), 12, 8);
    for (let i = 0; i < 12; i++) { const rx = 20 + i * 26; g.globalAlpha = p * 0.6; g.fillStyle = '#ffd890'; g.fillRect(rx, 148 + (i % 3) * 4, 2, 2); } g.globalAlpha = 1;
  } else if (k === 'watch') {
    skyGrad(g, '#03050e', '#0a1430', '#06101e'); stars(g, t); moon(g, 240, 40, 18, '#dfe8ff');
    mountains(g, 104, '#0a1020', 18, 3); g.fillStyle = '#0c1a34'; g.fillRect(0, 104, W, 76);
    for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(160,190,255,0.15)'; g.fillRect((i * 37 + t * 6) % W, 110 + (i * 13) % 60, 10, 1); }
    g.fillStyle = '#1a2440'; g.beginPath(); g.ellipse(160, 138, 34, 8, 0, 0, 6.283); g.fill();
    g.fillStyle = '#05070e'; g.fillRect(150, 122, 8, 12); g.fillRect(151, 116, 6, 6); g.fillRect(146, 130, 14, 4); poly(g, [150, 122, 142, 134, 152, 132], '#05070e');
    g.fillStyle = '#c8d8ff'; g.fillRect(162, 104, 2, 30); g.fillRect(159, 110, 8, 1);
    g.drawImage(glowSprite(24, 'rgba(160,200,255,0.6)'), 170 - 24, 112 - 24 + Math.sin(t * 2) * 2); drawIvel(g, 170, 132 + Math.sin(t * 2) * 2, t);
  } else if (k === 'credits') {
    g.fillStyle = '#05040a'; g.fillRect(0, 0, W, H); stars(g, t, 0.6);
  }
  for (const p of cineParts) { p.l += 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - p.l / 6); g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
  g.globalAlpha = 1;
  for (let i = cineParts.length - 1; i >= 0; i--) if (cineParts[i].l > 6 || cineParts[i].y > H) cineParts.splice(i, 1);
  g.drawImage(VIGN, 0, 0);
}
function lerpCol(a, b, t) { const A1 = hexRGB(a), B1 = hexRGB(b); return '#' + A1.map((v, i) => Math.round(lerp(v, B1[i], t)).toString(16).padStart(2, '0')).join(''); }
const CREDITS = () => [
  ['ПЕПЕЛЬНЫЙ ОБЕТ', 16], ['', 8], ['Концовка: ' + Game.endName, 9], ['', 8],
  [`Уровень: ${G.lv}   Время: ${fmtTime(G.time)}`, 8], [`Пощажено душ: ${G.spared}   Упокоено мечом: ${G.killed}`, 8], ['', 8],
  [G.killed === 0 ? '«Рыцарь, не обнаживший меча ради смерти»' : G.spared > G.killed ? '«Милосердие сильнее стали»' : '«Клинок исполнил свой долг»', 8], ['', 14],
  ['Сэр Ардан — последний рыцарь Ордена', 8], ['Ивель — жрица Луны', 8], ['Томас — верный оруженосец', 8], ['Гарет — брат по клятве', 8], ['Король Альдерих — Серая Корона', 8], ['', 14],
  ['Музыка', 9], ['Dark Fantasy (Slowed)', 8], ['«Seal of the Forgotten King»', 8], ['', 14],
  ['Спасибо, что прошёл этот путь.', 9], ['Да не погаснет луна.', 9],
];
function drawCredits() {
  uiT(); const t = Game.cineT; let y = H + 10 - t * 14;
  for (const [s, sz] of CREDITS()) { if (y > -20 && y < H + 20) text(s, W / 2, y, sz > 8 ? '#ffd75e' : '#e8e4f0', sz, 'center', { w: sz > 9 ? 600 : 400 }); y += sz + 8; }
  if (t > 6) text(isTouch ? '[A] — в меню' : 'Enter — в меню', W - 6, H - 12, '#5a5570', 6, 'right');
}

// ---------- TITLE ----------
function drawTitle() {
  const g = lc, t = Game.titleT;
  skyGrad(g, '#05040c', '#140c1e', '#1a0e14'); stars(g, t);
  moon(g, 252, 84, 20, '#e8e4d8', 0.5, t);
  mountains(g, 126, '#1c1428', 24, 2, t * 2); castleSil(g, 200, 128, '#110c18'); mountains(g, 146, '#120c1a', 14, 5, t * 4);
  g.fillStyle = '#060408'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, 150); g.lineTo(60, 146); g.lineTo(96, 152); g.lineTo(140, 160); g.lineTo(W, 164); g.lineTo(W, H); g.fill();
  knightSil(g, 70, 147, '#030204', 1.3);
  const cx = 70 + Math.sin(t) * 0.5; g.fillStyle = '#030204'; for (let i = 0; i < 4; i++) g.fillRect(cx - 4 - i * 2, 132 + i * 3 + Math.round(Math.sin(t * 3 + i)), 2, 3);
  if (Math.random() < 0.5) cineParts.push({ x: rnd(W), y: -2, vx: rnd(-8, 2), vy: rnd(10, 22), l: 0, c: pick(['#8a8890', '#6a6870', '#ff7a2a']) });
  for (const p of cineParts) { p.l += 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - p.l / 8); g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
  g.globalAlpha = 1; for (let i = cineParts.length - 1; i >= 0; i--) if (cineParts[i].l > 8 || cineParts[i].y > H) cineParts.splice(i, 1);
  g.drawImage(VIGN, 0, 0);
}
function drawTitleUI() {
  uiT(); const t = Game.titleT;
  const a = Math.min(1, t / 2);
  ctx.globalAlpha = a;
  text('ПЕПЕЛЬНЫЙ ОБЕТ', W / 2, 18, '#f0e6d0', 22, 'center', { w: 700, outline: '#2a1018' });
  ctx.fillStyle = '#a3242f'; ctx.fillRect(W / 2 - 70, 45, 140, 0.8);
  text('рыцари бледной луны', W / 2, 49, '#b8b0c8', 8, 'center');
  ctx.globalAlpha = 1;
  if (Game.titleMode === 'press') { if (Math.floor(t * 2) % 2 === 0 && t > 1) text(isTouch ? 'Коснитесь экрана' : 'Нажмите любую клавишу', W / 2, 150, '#e8e4f0', 8, 'center'); }
  else if (Game.titleMode === 'menu') {
    const opts = titleOpts();
    opts.forEach((o, i) => { const sel = i === Game.titleI, y = 108 + i * 13; if (sel) heartCursor(W / 2 - tw(o.n, 9) / 2 - 12, y + 3); text(o.n, W / 2, y, sel ? '#ffd75e' : (o.dis ? '#5a5570' : '#e8e4f0'), 9, 'center'); });
    const s = loadSave(); if (s && titleOpts()[Game.titleI].k === 'cont') text(`${MAPS[s.map] ? MAPS[s.map].name : ''} · LV${s.lv} · ${fmtTime(s.time)}`, W / 2, 166, '#8a85a0', 7, 'center');
  } else if (Game.titleMode === 'help') {
    box(30, 70, 260, 100);
    const L = isTouch ? ['Джойстик — движение', '[A] — действие / выбор / парирование', '[B] — назад; удерживать — бег', '[☰] — меню', '', 'В бою: уклоняйся от снарядов в окне.', 'Нажми [A] в миг удара — парирование!'] :
      ['Стрелки / WASD — движение', 'Enter / Пробел / Z — действие, выбор, парирование', 'X / Shift — назад; удерживать — бег / точное движение', 'C / Esc — меню', '', 'В бою: уклоняйся от снарядов в окне.', 'Нажми Enter в миг удара — парирование!'];
    L.forEach((l, i) => text(l, 40, 78 + i * 12, '#e8e4f0', 8));
    text('ОК — назад', 280, 158, '#8a85a0', 6.5, 'right');
  }
  text('v1.0', W - 4, H - 9, '#3a3550', 6, 'right');
}
function titleOpts() { const s = loadSave(); return [{ n: 'Новая игра', k: 'new' }, { n: 'Продолжить', k: 'cont', dis: !s }, { n: 'Настройки', k: 'opt' }, { n: 'Управление', k: 'help' }]; }
function updateTitle(dt) {
  Game.titleT += dt;
  if (Game.titleMode === 'press') { if (Input.anyPress && Game.titleT > 0.5) { audioUnlock(); Music.play('t02', { fade: 1.5 }); Game.titleMode = 'menu'; sfx('select'); } return; }
  if (Game.titleMode === 'help') { if (Input.p('ok') || Input.p('back')) { Game.titleMode = 'menu'; sfx('cancel'); } return; }
  if (Game.titleMode === 'opt') { updateSettings(); return; }
  if (Game.titleMode !== 'menu' || Script.active) return;
  const opts = titleOpts();
  if (Input.nav('up')) { Game.titleI = (Game.titleI + opts.length - 1) % opts.length; sfx('move'); }
  if (Input.nav('down')) { Game.titleI = (Game.titleI + 1) % opts.length; sfx('move'); }
  if (Input.p('ok')) {
    const o = opts[Game.titleI];
    if (o.dis) { sfx('deny'); return; }
    sfx('select');
    if (o.k === 'new') { run(async () => { if (loadSave()) { const c = await choose(['Да, начать заново', 'Нет'], { title: 'Сохранение будет перезаписано' }); if (c !== 0) return; } Game.titleMode = 'none'; Music.stop(1.5); await fade(1, 1.2); G = NEWG(); G.flags.own_osword = true; G.flags.own_olds = true; await STORY.intro(); }); }
    else if (o.k === 'cont') { run(async () => { Game.titleMode = 'none'; Music.stop(1); await fade(1, 0.8); G = loadSave(); Game.scene = 'world'; await gotoMap(G.map, G.x, G.y, G.dir, { nofade: true }); await fade(0, 0.8); areaCard(MAPS[G.map].name); }); }
    else if (o.k === 'opt') { Game.titleMode = 'opt'; Settings.i = 0; Settings.back = () => { Game.titleMode = 'menu'; }; }
    else if (o.k === 'help') Game.titleMode = 'help';
  }
}

// ---------- SETTINGS ----------
const Settings = { i: 0, back: null };
function settingsOpts() { return [{ n: 'Музыка', v: A.vol.music, k: 'music' }, { n: 'Звуки', v: A.vol.sfx, k: 'sfx' }, { n: 'Полный экран', k: 'fs' }, { n: 'Назад', k: 'back' }]; }
function updateSettings() {
  const o = settingsOpts();
  if (Input.nav('up')) { Settings.i = (Settings.i + o.length - 1) % o.length; sfx('move'); }
  if (Input.nav('down')) { Settings.i = (Settings.i + 1) % o.length; sfx('move'); }
  const cur = o[Settings.i];
  if (cur.v != null && (Input.nav('left') || Input.nav('right'))) {
    const d = Input.nav('left') ? -0.1 : 0.1; A.vol[cur.k] = clamp(Math.round((A.vol[cur.k] + d) * 10) / 10, 0, 1);
    if (A.sfxG) { A.sfxG.gain.value = A.vol.sfx; A.ambG.gain.value = A.vol.sfx * 0.9; }
    sfx('move'); try { localStorage.setItem('ashen_vol', JSON.stringify(A.vol)); } catch (e) {}
  }
  if (Input.p('ok')) {
    if (cur.k === 'fs') { sfx('select'); try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) {} }
    if (cur.k === 'back') { sfx('cancel'); Settings.back(); }
  }
  if (Input.p('back')) { sfx('cancel'); Settings.back(); }
}
function drawSettings(x = 70, y = 60) {
  uiT(); box(x, y, 180, 70, { border: '#c8a85a' }); text('НАСТРОЙКИ', x + 90, y + 6, '#ffd75e', 8, 'center');
  settingsOpts().forEach((o, i) => {
    const yy = y + 20 + i * 12, sel = i === Settings.i;
    if (sel) heartCursor(x + 8, yy + 2.5);
    text(o.n, x + 18, yy, sel ? '#ffd75e' : '#e8e4f0', 8);
    if (o.v != null) { ctx.fillStyle = '#2a2438'; ctx.fillRect(x + 90, yy + 3, 70, 4); ctx.fillStyle = '#c8a85a'; ctx.fillRect(x + 90, yy + 3, 70 * o.v, 4); text(Math.round(o.v * 100) + '%', x + 172, yy, '#b8b0c8', 7, 'right'); }
  });
}

// ---------- PAUSE MENU ----------
const Menu = { open: false, tab: 'main', i: 0, j: 0, msg: null };
const MENU_MAIN = ['Вещи', 'Снаряжение', 'Молитвы', 'Статус', 'Настройки', 'Закрыть'];
function openMenu() { Menu.open = true; Menu.tab = 'main'; Menu.i = 0; sfx('select'); }
function ownedFor(slot) { return Object.keys(EQUIP).filter(id => EQUIP[id].slot === slot && G.flags['own_' + id]); }
function updateMenu() {
  if (Script.active && Menu.tab !== 'settings') return;
  const tab = Menu.tab;
  if (tab === 'main') {
    if (Input.nav('up')) { Menu.i = (Menu.i + MENU_MAIN.length - 1) % MENU_MAIN.length; sfx('move'); }
    if (Input.nav('down')) { Menu.i = (Menu.i + 1) % MENU_MAIN.length; sfx('move'); }
    if (Input.p('back') || Input.p('menu')) { Menu.open = false; sfx('cancel'); return; }
    if (Input.p('ok')) {
      sfx('select'); const k = Menu.i;
      if (k === 0) { if (!G.items.length) { sfx('deny'); return; } Menu.tab = 'items'; Menu.j = 0; }
      else if (k === 1) { Menu.tab = 'equip'; Menu.j = 0; }
      else if (k === 2) { Menu.tab = 'prayers'; Menu.j = 0; }
      else if (k === 3) Menu.tab = 'status';
      else if (k === 4) { Menu.tab = 'settings'; Settings.i = 0; Settings.back = () => { Menu.tab = 'main'; }; }
      else { Menu.open = false; }
    }
    return;
  }
  if (tab === 'settings') { updateSettings(); return; }
  if (Input.p('back') || Input.p('menu')) { sfx('cancel'); if (tab === 'equipSel') Menu.tab = 'equip'; else Menu.tab = 'main'; return; }
  if (tab === 'items') {
    const n = G.items.length; if (!n) { Menu.tab = 'main'; return; }
    if (Input.nav('up')) { Menu.j = (Menu.j + n - 1) % n; sfx('move'); }
    if (Input.nav('down')) { Menu.j = (Menu.j + 1) % n; sfx('move'); }
    if (Input.p('ok')) {
      const id = G.items[Menu.j], it = ITEMS[id];
      if (it.heal) { if (G.hp >= maxHp()) { sfx('deny'); return; } removeItem(id); const b = G.hp; G.hp = Math.min(maxHp(), G.hp + it.heal); sfx('heal'); note(`+${G.hp - b} ОЗ`, '#8cf08c'); Menu.j = Math.min(Menu.j, G.items.length - 1); }
      else if (it.tp) { sfx('deny'); note('Это можно использовать только в бою', '#b8b0c8'); }
      else { sfx('deny'); }
    }
  } else if (tab === 'equip') {
    if (Input.nav('up')) { Menu.j = (Menu.j + 2) % 3; sfx('move'); }
    if (Input.nav('down')) { Menu.j = (Menu.j + 1) % 3; sfx('move'); }
    if (Input.p('ok')) { sfx('select'); Menu.slot = ['weapon', 'armor', 'charm'][Menu.j]; Menu.tab = 'equipSel'; Menu.k = 0; }
  } else if (tab === 'equipSel') {
    const L = ownedFor(Menu.slot); const n = L.length + (Menu.slot === 'charm' ? 1 : 0); if (!n) { Menu.tab = 'equip'; return; }
    if (Input.nav('up')) { Menu.k = (Menu.k + n - 1) % n; sfx('move'); }
    if (Input.nav('down')) { Menu.k = (Menu.k + 1) % n; sfx('move'); }
    if (Input.p('ok')) { const id = L[Menu.k] || null; G[Menu.slot] = id; G.hp = Math.min(G.hp, maxHp()); sfx('equip'); Menu.tab = 'equip'; }
  } else if (tab === 'prayers') {
    const n = G.prayers.length; if (Input.nav('up')) { Menu.j = (Menu.j + n - 1) % n; sfx('move'); } if (Input.nav('down')) { Menu.j = (Menu.j + 1) % n; sfx('move'); }
  } else if (tab === 'status') { if (Input.p('ok')) { Menu.tab = 'main'; sfx('cancel'); } }
}
function drawMenu() {
  uiT();
  // side panel
  box(8, 8, 92, 104, { border: '#c8a85a' });
  MENU_MAIN.forEach((m, i) => { const y = 16 + i * 14, sel = i === Menu.i; if (sel) heartCursor(14, y + 2.5); text(m, 24, y, sel ? '#ffd75e' : '#e8e4f0', 8); });
  // mini status
  box(8, 116, 92, 56);
  text('АРДАН', 14, 121, '#e8e4f0', 8, 'left', { w: 600 }); text('LV ' + G.lv, 94, 121.5, '#b8b0c8', 7, 'right');
  text(`ОЗ ${G.hp}/${maxHp()}`, 14, 134, '#e8e4f0', 7.5); ctx.fillStyle = '#4a1a22'; ctx.fillRect(14, 145, 78, 4); ctx.fillStyle = '#e8c23a'; ctx.fillRect(14, 145, 78 * G.hp / maxHp(), 4);
  text(`${G.gold} монет`, 14, 154, '#ffd75e', 7.5); text(fmtTime(G.time), 94, 154.5, '#8a85a0', 7, 'right');
  const X = 106, Y = 8, Wd = 206, Hd = 164;
  const tab = Menu.tab;
  if (tab === 'main') { box(X, Y, Wd, Hd); text(G.chapter || '', X + Wd / 2, Y + 8, '#ffd75e', 8, 'center'); text(MAPS[World.id] ? MAPS[World.id].name : '', X + Wd / 2, Y + 22, '#b8b0c8', 8, 'center'); const tip = ['Касайся снарядов вскользь — копишь Дух.', 'Парирование: жми ОК в миг удара.', 'Свечи Обета лечат и сохраняют путь.', 'Не всех нужно убивать. Попробуй ДЕЙСТВИЕ.', 'Удерживай «назад», чтобы бежать.'][Math.floor(TIME / 6) % 5]; wrap(tip, Wd - 20).forEach((l, i) => text(l, X + 10, Y + Hd - 30 + i * 11, '#7a75a0', 7)); drawIvelPortrait(X + Wd / 2 - 24, Y + 44); return; }
  if (tab === 'settings') { drawSettings(X + 13, Y + 40); return; }
  box(X, Y, Wd, Hd);
  if (tab === 'items') {
    text('ВЕЩИ', X + 10, Y + 6, '#ffd75e', 8);
    G.items.forEach((id, i) => { const y = Y + 20 + i * 11, sel = i === Menu.j; if (sel) heartCursor(X + 8, y + 2.5); text(ITEMS[id].n, X + 18, y, sel ? '#ffd75e' : (ITEMS[id].key ? '#b8d8ff' : '#e8e4f0'), 8); });
    const cur = G.items[Menu.j]; if (cur) wrap(ITEMS[cur].d, Wd - 20, 7).forEach((l, i) => text(l, X + 10, Y + Hd - 22 + i * 10, '#8a85a0', 7));
  } else if (tab === 'equip' || tab === 'equipSel') {
    text('СНАРЯЖЕНИЕ', X + 10, Y + 6, '#ffd75e', 8);
    const slots = [['Оружие', 'weapon'], ['Броня', 'armor'], ['Оберег', 'charm']];
    slots.forEach(([n, s], i) => { const y = Y + 22 + i * 14, sel = i === Menu.j; if (sel && tab === 'equip') heartCursor(X + 8, y + 2.5); text(n, X + 18, y, '#b8b0c8', 8); text(G[s] ? EQUIP[G[s]].n : '—', X + 70, y, sel ? '#ffd75e' : '#e8e4f0', 8); });
    text(`АТК ${atk()}   ЗАЩ ${def()}   ОЗ ${maxHp()}`, X + 10, Y + 68, '#8cf08c', 8);
    if (tab === 'equipSel') {
      const L = ownedFor(Menu.slot); const list = Menu.slot === 'charm' ? L.concat([null]) : L;
      box(X + 8, Y + 82, Wd - 16, Hd - 90, { border: '#c8a85a' });
      list.forEach((id, i) => { const y = Y + 88 + i * 11, sel = i === Menu.k; if (sel) heartCursor(X + 14, y + 2.5); const e = id ? EQUIP[id] : null; text(e ? e.n : '(снять)', X + 24, y, sel ? '#ffd75e' : '#e8e4f0', 8); if (e) text((e.atk ? 'АТК+' + e.atk + ' ' : '') + (e.def ? 'ЗАЩ+' + e.def : '') + (e.hp ? ' ОЗ+' + e.hp : ''), X + Wd - 14, y + 0.5, '#8a85a0', 7, 'right'); });
      const id = list[Menu.k]; if (id) text(EQUIP[id].d, X + 14, Y + Hd - 21, '#8a85a0', 7);
    }
  } else if (tab === 'prayers') {
    text('МОЛИТВЫ', X + 10, Y + 6, '#ffd75e', 8);
    G.prayers.forEach((id, i) => { const y = Y + 22 + i * 12, sel = i === Menu.j; if (sel) heartCursor(X + 8, y + 2.5); text(PRAYERS[id].n, X + 18, y, sel ? '#ffd75e' : '#e8e4f0', 8); text(PRAYERS[id].cost + '%', X + Wd - 10, y, '#e8a86a', 7, 'right'); });
    const cur = G.prayers[Menu.j]; if (cur) text(PRAYERS[cur].d, X + 10, Y + Hd - 16, '#8a85a0', 7.5);
    text('Используются в бою за Дух.', X + 10, Y + Hd - 30, '#5a5570', 7);
  } else if (tab === 'status') {
    text('СТАТУС', X + 10, Y + 6, '#ffd75e', 8);
    const next = LVEXP[G.lv] - G.exp;
    const L = [`Уровень: ${G.lv}`, `ОЗ: ${G.hp} / ${maxHp()}`, `Атака: ${atk()}`, `Защита: ${def()}`, `Опыт: ${G.exp}  (до след.: ${Math.max(0, next)})`, `Монеты: ${G.gold}`, `Пощажено: ${G.spared}   Убито: ${G.killed}`, `Сны спящих: ${G.voices}/3`, `Время в пути: ${fmtTime(G.time)}`];
    L.forEach((l, i) => text(l, X + 14, Y + 22 + i * 13, '#e8e4f0', 8));
    ctx.drawImage(knight('idle', TIME * 0.9), X + Wd - 64, Y + 20, 56, 56);
  }
}
function drawIvelPortrait(x, y) { if (!F('ivel')) { ctx.drawImage(knight('idle', TIME * 0.9), x - 4, y - 4, 56, 56); return; } const p = getPortrait('ivel', Math.floor(TIME / 3) % 2); ctx.drawImage(p, x, y, 48, 48); }

// ---------- GAME OVER ----------
function drawGameOver() {
  const g = lc; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  Game.goT += 1 / 60;
  const a = Math.min(1, Game.goT);
  g.globalAlpha = a; g.drawImage(knight('down', 0), 132, 50); g.globalAlpha = 1;
  if (Math.random() < 0.3) cineParts.push({ x: 160 + rnd(-14, 14), y: 90 + rnd(-10, 10), vx: rnd(-4, 4), vy: rnd(-16, -6), l: 0, c: pick(['#8a8890', '#6a6870']) });
  for (const p of cineParts) { p.l += 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - p.l / 3); g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
  g.globalAlpha = 1;
}

// ---------- MAIN LOOP ----------
let lastT = 0, acc = 0;
function update(dt) {
  TIME += dt; FRAME++;
  updateWaits();
  updateFx(dt); Music.update(dt);
  if (Choice.open) updateChoice();
  else if (Dlg.open && !(Game.scene === 'battle' && B.msg)) updateDialog(dt);
  else if (Menu.open) updateMenu();
  if (Game.scene === 'title') updateTitle(dt);
  else if (Game.scene === 'world') { updateWorld(dt); }
  else if (Game.scene === 'battle') updateBattle(dt);
  else if (Game.scene === 'cine') { Game.cineT += dt; }
  Input.endFrame();
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  if (Game.scene === 'title') drawTitle();
  else if (Game.scene === 'world') drawWorld();
  else if (Game.scene === 'battle') drawBattle();
  else if (Game.scene === 'cine') drawCine();
  else if (Game.scene === 'gameover') drawGameOver();
  else { lc.fillStyle = '#000'; lc.fillRect(0, 0, W, H); }
  ctx.drawImage(low, 0, 0, cv.width, cv.height);
  uiT(); ctx.imageSmoothingEnabled = false;
  if (Game.scene === 'title') { drawTitleUI(); if (Game.titleMode === 'opt') drawSettings(); }
  else if (Game.scene === 'world') { drawWorldUI(); if (Menu.open) drawMenu(); }
  else if (Game.scene === 'battle') drawBattleUI();
  else if (Game.scene === 'cine' && Game.cine === 'credits') drawCredits();
  else if (Game.scene === 'gameover') { uiT(); ctx.globalAlpha = Math.min(1, Game.goT / 2); text('СВЕЧА ОБЕТА ПОГАСЛА', W / 2, 24, '#c8c0d8', 12, 'center', { w: 600 }); ctx.globalAlpha = 1; }
  drawDialog(); drawChoice(); drawFx();
}
function frame(ts) {
  const dt = Math.min(0.1, (ts - lastT) / 1000 || 0); lastT = ts; acc += dt;
  let n = 0; while (acc >= 1 / 60 && n < 4) { update(1 / 60); acc -= 1 / 60; n++; }
  if (n === 4) acc = 0;
  try { render(); } catch (e) { console.error(e); }
  requestAnimationFrame(frame);
}
async function boot() {
  layout();
  try { await Promise.race([document.fonts.load('8px Pix'), new Promise(r => setTimeout(r, 2500))]); await document.fonts.ready; } catch (e) {}
  makeTiles(); makeObjects(); makeMonsters(); makeVignette();
  for (const k in CHARDEF) makeChar(k, CHARDEF[k]);
  for (const k in PORTDEF) getPortrait(k, 0);
  setupTouch();
  const ld = $('loading'); if (ld) ld.remove();
  Game.scene = 'title'; Game.titleT = 0;
  requestAnimationFrame(frame);
}
window.__dbg = { get G() { return G; }, set G(v) { G = v; }, World, B, Game, Input, MAPS, ENEMIES, PATS, STORY, run, gotoMap, battle, loadMap, sfx, Music, Script, Dlg, Choice, Menu, setF, F, fade };
boot();
