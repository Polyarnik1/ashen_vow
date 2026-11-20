// ================= GFX HELPERS =================
function mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; if (fn) fn(g, w, h); return c; }
function hexRGB(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function pixelize(c, outline = '#08070d', thr = 100) {
  const g = c.getContext('2d'), w = c.width, h = c.height;
  const im = g.getImageData(0, 0, w, h), d = im.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] < thr ? 0 : 255;
  if (outline) {
    const o = hexRGB(outline), a = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (a[i]) continue;
      if ((x > 0 && a[i - 1]) || (x < w - 1 && a[i + 1]) || (y > 0 && a[i - w]) || (y < h - 1 && a[i + w])) {
        d[i * 4] = o[0]; d[i * 4 + 1] = o[1]; d[i * 4 + 2] = o[2]; d[i * 4 + 3] = 255;
      }
    }
  }
  g.putImageData(im, 0, 0); return c;
}
function tint(c, col, alpha = 1) { // returns silhouette in color
  return mk(c.width, c.height, g => { g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-in'; g.globalAlpha = alpha; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); });
}
function flipH(c) { return mk(c.width, c.height, g => { g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); }); }
function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function circ(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); }
function ell(g, x, y, rx, ry, c, rot = 0) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, 6.2832); g.fill(); }
function poly(g, pts, c) { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); }
function line(g, x1, y1, x2, y2, c, w = 1) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
function speck(g, x, y, w, h, cols, n, r) { for (let i = 0; i < n; i++) R(g, x + Math.floor(r() * w), y + Math.floor(r() * h), 1, 1, cols[Math.floor(r() * cols.length)]); }
function shade(hex, k) { const [r, g, b] = hexRGB(hex); const f = v => clamp(Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)), 0, 255); return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join(''); }

// ================= TILES =================
const TILE = {}; // name -> [variants]
const TILEDEF = {
  stone: { c: ['#2a2c3b', '#232533', '#323548'], m: '#16171f', kind: 'flag' },
  stone2: { c: ['#3a2f2c', '#33292a', '#45372f'], m: '#1b1414', kind: 'check' },
  carpet: { c: ['#5e1620', '#4d121b', '#6b1a25'], m: '#b08a3a', kind: 'carpet' },
  grass: { c: ['#1f2e25', '#1a2820', '#25362b', '#2c3f30'], kind: 'grass' },
  dgrass: { c: ['#1c2a22', '#18251e', '#213228', '#283a2e'], kind: 'grass' },
  dirt: { c: ['#3b3128', '#332a22', '#44392e'], kind: 'dirt' },
  cobble: { c: ['#34343f', '#2c2c36', '#3d3d4a'], m: '#1a1a22', kind: 'cobble' },
  wood: { c: ['#3d2a1e', '#35241a', '#46301f'], m: '#1d130d', kind: 'plank' },
  crypt: { c: ['#26302c', '#212a26', '#2d3833'], m: '#121815', kind: 'flag' },
  ash: { c: ['#26252b', '#211f25', '#2d2b32'], kind: 'dirt' },
  moon: { c: ['#3b4560', '#343d56', '#46516e'], m: '#1d2233', kind: 'flag' },
  marble: { c: ['#4a4f63', '#41465a', '#555b72'], m: '#23263a', kind: 'check' },
  bridge: { c: ['#4a3624', '#3e2d1e', '#56402b'], m: '#1d130d', kind: 'bridge' },
  sand: { c: ['#4a4436', '#433d30', '#524b3c'], kind: 'dirt' },
  void: { c: ['#000000'], kind: 'flat' },
  stairs: { c: ['#2f3140', '#1d1e28'], kind: 'stairs' },
  plate: { c: ['#2a2c3b'], kind: 'plate' },
};
const WALLDEF = {
  wall: { face: '#3a3d52', faceD: '#2b2d3d', mortar: '#1a1b26', top: '#1c1d29', topE: '#4a4d66', kind: 'brick' },
  rwall: { face: '#4a3832', faceD: '#3a2b27', mortar: '#1e1513', top: '#21191a', topE: '#6a4a3a', kind: 'brick', rust: true },
  cwall: { face: '#33403a', faceD: '#26302b', mortar: '#131a17', top: '#161d1a', topE: '#4b5c53', kind: 'brick', skull: true },
  kwall: { face: '#3b3b44', faceD: '#2c2c34', mortar: '#18181e', top: '#1b1b21', topE: '#55556a', kind: 'block', moss: true },
  hedge: { face: '#1e3324', faceD: '#16261b', mortar: '#0c160f', top: '#13221a', topE: '#2c4a33', kind: 'hedge' },
  mwall: { face: '#555b78', faceD: '#444a63', mortar: '#262a3c', top: '#2a2e40', topE: '#7a82a6', kind: 'block' },
  rock: { face: '#35323a', faceD: '#29272e', mortar: '#141317', top: '#1a1a1f', topE: '#4a4752', kind: 'rock' },
  wwall: { face: '#4a3424', faceD: '#3a281b', mortar: '#1d130d', top: '#2a1d15', topE: '#6a4a33', kind: 'plankw' },
};
function makeTiles() {
  for (const name in TILEDEF) {
    const D = TILEDEF[name]; const vars = [];
    for (let v = 0; v < 4; v++) {
      const r = seeded(1000 + v * 77 + name.length * 13 + name.charCodeAt(0));
      vars.push(mk(16, 16, g => {
        const c = D.c;
        R(g, 0, 0, 16, 16, c[0]);
        switch (D.kind) {
          case 'flag': {
            const off = v % 2 ? 4 : 0;
            for (let yy = 0; yy < 16; yy += 8) for (let xx = -8; xx < 16; xx += 8) {
              const sx = xx + (yy ? off : 0); R(g, sx, yy, 8, 8, c[Math.floor(r() * c.length)]);
              R(g, sx, yy, 8, 1, D.m); R(g, sx, yy, 1, 8, D.m); R(g, sx + 1, yy + 1, 6, 1, shade(c[0], 0.08));
            }
            speck(g, 0, 0, 16, 16, [c[1], c[2], D.m], 10, r);
            if (r() < 0.35) { let x = Math.floor(r() * 12) + 2, y = Math.floor(r() * 12) + 2; for (let i = 0; i < 5; i++) { R(g, x, y, 1, 1, D.m); x += Math.round(r() * 2 - 1); y += 1; } }
            break;
          }
          case 'check': {
            for (let yy = 0; yy < 16; yy += 8) for (let xx = 0; xx < 16; xx += 8) { R(g, xx, yy, 8, 8, ((xx + yy) / 8) % 2 ? c[1] : c[2]); R(g, xx, yy, 8, 1, D.m); R(g, xx, yy, 1, 8, D.m); }
            speck(g, 0, 0, 16, 16, [c[0], D.m], 12, r);
            break;
          }
          case 'carpet': {
            R(g, 0, 0, 16, 16, c[0]); speck(g, 0, 0, 16, 16, [c[1], c[2]], 30, r);
            for (let i = 2; i < 16; i += 4) R(g, i, (i * 3) % 16, 1, 1, '#7a2a33');
            break;
          }
          case 'grass': {
            speck(g, 0, 0, 16, 16, c, 60, r);
            for (let i = 0; i < 7; i++) { const x = Math.floor(r() * 15), y = Math.floor(r() * 14) + 2; R(g, x, y, 1, 2, c[3]); R(g, x + 1, y - 1, 1, 2, c[2]); }
            if (v === 3) { const x = 4 + Math.floor(r() * 8), y = 4 + Math.floor(r() * 8); R(g, x, y, 1, 1, '#6e5a7a'); R(g, x + 1, y + 1, 1, 1, '#5a4766'); R(g, x - 3, y + 3, 1, 1, '#8a8a6a'); }
            break;
          }
          case 'dirt': { speck(g, 0, 0, 16, 16, c, 70, r); for (let i = 0; i < 3; i++) R(g, Math.floor(r() * 14), Math.floor(r() * 14), 2, 1, shade(c[0], -0.3)); break; }
          case 'cobble': {
            for (let yy = 0; yy < 16; yy += 5) for (let xx = (yy / 5) % 2 ? -3 : 0; xx < 16; xx += 6) { R(g, xx + 1, yy + 1, 5, 4, c[Math.floor(r() * c.length)]); R(g, xx + 1, yy + 1, 5, 1, shade(c[0], 0.12)); }
            break;
          }
          case 'plank': case 'bridge': {
            const horiz = D.kind === 'bridge';
            for (let i = 0; i < 16; i += 4) { if (horiz) { R(g, 0, i, 16, 4, c[Math.floor(r() * 3)]); R(g, 0, i, 16, 1, D.m); } else { R(g, i, 0, 4, 16, c[Math.floor(r() * 3)]); R(g, i, 0, 1, 16, D.m); R(g, i, (i * 5 + v * 3) % 16, 4, 1, D.m); } }
            speck(g, 0, 0, 16, 16, [shade(c[0], -0.3)], 8, r);
            if (horiz) { R(g, 0, 0, 16, 1, '#1a120c'); R(g, 0, 15, 16, 1, '#1a120c'); R(g, 3, 1, 1, 1, '#777'); R(g, 12, 9, 1, 1, '#777'); }
            break;
          }
          case 'stairs': { for (let i = 0; i < 16; i += 4) { R(g, 0, i, 16, 3, shade(c[0], -i / 30)); R(g, 0, i + 3, 16, 1, c[1]); } break; }
          case 'plate': { R(g, 0, 0, 16, 16, '#2a2c3b'); R(g, 2, 2, 12, 12, '#16171f'); R(g, 3, 3, 10, 10, '#4a4f63'); R(g, 4, 4, 8, 8, '#3a3e50'); R(g, 7, 7, 2, 2, '#7a82a6'); break; }
        }
      }));
    }
    TILE[name] = vars;
  }
  // water: 4 animation frames
  TILE.water = []; TILE.dwater = [];
  for (let f = 0; f < 4; f++) {
    for (const [nm, base, hi] of [['water', '#16243a', '#2a4566'], ['dwater', '#0c1424', '#1c2c48']]) {
      TILE[nm].push(mk(16, 16, g => {
        R(g, 0, 0, 16, 16, base);
        for (let i = 0; i < 4; i++) { const y = (i * 4 + f) % 16; const x = (i * 7 + f * 2) % 16; R(g, x, y, 4, 1, hi); R(g, (x + 9) % 16, (y + 2) % 16, 2, 1, shade(hi, 0.2)); }
      }));
    }
  }
  // walls: face + top variants
  for (const name in WALLDEF) {
    const D = WALLDEF[name]; const face = [], top = [];
    for (let v = 0; v < 4; v++) {
      const r = seeded(500 + v * 31 + name.charCodeAt(0) * 7);
      face.push(mk(16, 16, g => {
        R(g, 0, 0, 16, 16, D.face);
        if (D.kind === 'brick') {
          for (let yy = 0; yy < 16; yy += 4) { const off = (yy / 4) % 2 ? 4 : 0; R(g, 0, yy, 16, 1, D.mortar); for (let xx = -off; xx < 16; xx += 8) { R(g, xx, yy, 1, 4, D.mortar); if (r() < 0.4) R(g, xx + 1, yy + 1, 6, 3, D.faceD); R(g, xx + 1, yy + 1, 6, 1, shade(D.face, 0.1)); } }
        } else if (D.kind === 'block') {
          for (let yy = 0; yy < 16; yy += 8) { const off = (yy / 8) % 2 ? 6 : 0; R(g, 0, yy, 16, 1, D.mortar); for (let xx = -off; xx < 16; xx += 12) { R(g, xx, yy, 1, 8, D.mortar); R(g, xx + 1, yy + 1, 10, 1, shade(D.face, 0.12)); } }
          speck(g, 0, 0, 16, 16, [D.faceD], 14, r);
        } else if (D.kind === 'hedge') {
          speck(g, 0, 0, 16, 16, [D.faceD, D.topE, '#0e1a12'], 90, r);
          for (let i = 0; i < 6; i++) { const x = Math.floor(r() * 15), y = Math.floor(r() * 15); R(g, x, y, 1, 1, '#6a5a4a'); }
        } else if (D.kind === 'rock') {
          for (let i = 0; i < 5; i++) { const x = Math.floor(r() * 12), y = Math.floor(r() * 12); R(g, x, y, 5, 4, D.faceD); R(g, x, y, 5, 1, shade(D.face, 0.12)); }
          speck(g, 0, 0, 16, 16, [D.mortar], 10, r);
        } else if (D.kind === 'plankw') {
          for (let i = 0; i < 16; i += 4) { R(g, i, 0, 1, 16, D.mortar); R(g, i + 1, 0, 1, 16, shade(D.face, 0.08)); }
          R(g, 0, 7, 16, 2, D.faceD);
        }
        if (D.rust) for (let i = 0; i < 3; i++) { const x = Math.floor(r() * 15); for (let y = Math.floor(r() * 6); y < 16; y++) if (r() < 0.8) R(g, x, y, 1, 1, '#7a3a1e'); }
        if (D.moss) for (let i = 0; i < 8; i++) R(g, Math.floor(r() * 16), 12 + Math.floor(r() * 4), 1, 1, '#2e4a2e');
        if (D.skull && v === 2) { R(g, 5, 5, 6, 6, D.mortar); circ(g, 8, 8, 2.2, '#b9b4a0'); R(g, 7, 8, 1, 1, '#111'); R(g, 9, 8, 1, 1, '#111'); }
        R(g, 0, 15, 16, 1, 'rgba(0,0,0,0.5)');
      }));
      top.push(mk(16, 16, g => { R(g, 0, 0, 16, 16, D.top); speck(g, 0, 0, 16, 16, [shade(D.top, 0.08), shade(D.top, -0.2)], 12, r); }));
    }
    TILE[name + '_f'] = face; TILE[name + '_t'] = top;
  }
}

// ================= HUMANOIDS =================
// dir: 0 down, 1 left, 2 right, 3 up ; frame 0..3
function drawHumanoid(o, dir, frame) {
  const W2 = 16, H2 = 24;
  const c = mk(W2, H2, g => {
    const step = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    const bob = (frame === 1 || frame === 3) ? 1 : 0;
    const sm = o.small ? 2 : 0; // child: shorter body
    const by = bob + sm;
    const side = dir === 1 || dir === 2;
    const flip = dir === 1;
    g.save(); if (flip) { g.translate(16, 0); g.scale(-1, 1); }
    const skin = o.skin || '#d9b89a', skinD = shade(skin, -0.25);
    const body = o.body || '#5a5a6a', bodyD = shade(body, -0.3), bodyL = shade(body, 0.18);
    const legs = o.legs || '#2c2a33', boots = o.boots || '#1c1a20';
    // cape back (for down & side)
    if (o.cape && dir !== 3) { const cc = shade(o.cape, -0.2); if (side) R(g, 3, 11 + by, 4, 9 - sm, cc); else { R(g, 3, 11 + by, 1, 9 - sm, cc); R(g, 12, 11 + by, 1, 9 - sm, cc); } }
    // legs
    if (!o.robe) {
      if (side) { R(g, 6 + step, 18 + bob, 3, 4, legs); R(g, 8 - step, 18 + bob, 3, 4, shade(legs, -0.2)); R(g, 6 + step, 21 + bob, 4, 2, boots); R(g, 8 - step, 21 + bob, 4, 2, boots); }
      else {
        const l1 = step > 0 ? 3 : 4, l2 = step < 0 ? 3 : 4;
        R(g, 5, 18 + bob, 3, l1, legs); R(g, 9, 18 + bob, 3, l2, legs);
        R(g, 5, 17 + bob + l1, 3, 2, boots); R(g, 9, 17 + bob + l2, 3, 2, boots);
      }
    }
    // torso
    const ty = 11 + by;
    if (o.robe) { R(g, 4, ty, 9, 11 - sm + (bob ? 0 : 1), body); R(g, 4, ty, 2, 11 - sm, bodyD); R(g, 4, 21 + bob, 9, 1, bodyD); if (step) R(g, 7 + step, 19 + bob, 2, 2, bodyD); }
    else { R(g, 4, ty, 9, 7 - sm, body); R(g, 4, ty, 2, 7 - sm, bodyD); R(g, 10, ty, 2, 2, bodyL); }
    if (o.armor) { R(g, 5, ty + 1, 7, 1, bodyL); R(g, 8, ty + 2, 1, 3, bodyD); if (!side) { R(g, 3, ty, 3, 2, bodyL); R(g, 11, ty, 3, 2, bodyL); } }
    if (o.belt) R(g, 4, ty + 5 - sm, 9, 1, o.belt);
    if (o.apron) { R(g, 5, ty + 1, 7, 8 - sm, o.apron); }
    if (o.tabard && dir === 0) { R(g, 6, ty + 1, 5, 7 - sm, o.tabard); R(g, 8, ty + 2, 1, 3, '#d8d0b0'); R(g, 7, ty + 3, 3, 1, '#d8d0b0'); }
    // arms
    const as = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    const arm = o.armColor || body;
    if (side) { R(g, 7 - as, ty + 1, 3, 6, shade(arm, -0.1)); R(g, 7 - as, ty + 6, 3, 2, o.glove || skin); }
    else { R(g, 2, ty + 1 + as, 2, 6, arm); R(g, 13, ty + 1 - as, 2, 6, arm); R(g, 2, ty + 6 + as, 2, 2, o.glove || skin); R(g, 13, ty + 6 - as, 2, 2, o.glove || skin); }
    if (o.weapon && dir !== 3) { if (side) { R(g, 9 - as, ty - 2, 1, 10, '#c9ccd8'); R(g, 8 - as, ty + 5, 3, 1, '#8a6a3a'); } else R(g, 14, ty - 3 - as, 1, 10, o.weapon); }
    // cape front when up
    if (o.cape && dir === 3) { R(g, 3, ty, 11, 10 - sm, o.cape); R(g, 3, ty, 1, 10 - sm, shade(o.cape, -0.3)); R(g, 8, ty + 3, 1, 6, shade(o.cape, -0.25)); R(g, 4 + (frame % 2), ty + 9 - sm, 2, 1, shade(o.cape, -0.3)); }
    // head
    const hy = 2 + by;
    const hair = o.hair || '#3a2a1e', hairD = shade(hair, -0.3);
    const hs = o.head || 'short';
    if (hs === 'helmet' || hs === 'phelm') {
      const st = o.steel || '#a7aec2', stD = shade(st, -0.35), stL = shade(st, 0.3);
      R(g, 3, hy, 11, 10, st); R(g, 3, hy, 2, 10, stD); R(g, 12, hy + 1, 1, 3, stL);
      if (dir === 0) { R(g, 5, hy + 5, 7, 1, '#0b0a12'); R(g, 8, hy + 5, 1, 4, '#0b0a12'); if (o.eyes) { R(g, 6, hy + 5, 1, 1, o.eyes); R(g, 10, hy + 5, 1, 1, o.eyes); } }
      else if (side) { R(g, 10, hy + 5, 4, 1, '#0b0a12'); if (o.eyes) R(g, 12, hy + 5, 1, 1, o.eyes); R(g, 4, hy + 2, 1, 6, stD); }
      else { R(g, 8, hy + 1, 1, 8, stD); }
      if (o.plume) { const pc = o.plume; const sway = frame % 2; R(g, 7, hy - 2, 3, 3, pc); R(g, side ? 3 - sway : 8, hy - 3, side ? 5 : 2, 2, pc); if (dir === 3 || side) R(g, side ? 2 : 7, hy - 1, 3, 4, shade(pc, -0.25)); }
      if (hs === 'phelm') { R(g, 1, hy + 2, 2, 4, stL); R(g, 14, hy + 2, 2, 4, stL); R(g, 0, hy + 1, 1, 3, stL); R(g, 15, hy + 1, 1, 3, stL); }
    } else {
      // face / skull
      R(g, 4, hy + 1, 9, 9, skin); R(g, 4, hy + 1, 2, 9, skinD);
      if (dir === 0) { const ec = o.eyes || '#1a1420'; if (o.sleep) { R(g, 6, hy + 6, 2, 1, '#1a1420'); R(g, 9, hy + 6, 2, 1, '#1a1420'); } else { R(g, 6, hy + 5, 1, 2, ec); R(g, 10, hy + 5, 1, 2, ec); } if (o.blush) { R(g, 5, hy + 7, 1, 1, '#c87a7a'); R(g, 11, hy + 7, 1, 1, '#c87a7a'); } }
      else if (side) { if (o.sleep) R(g, 10, hy + 6, 2, 1, '#1a1420'); else R(g, 11, hy + 5, 1, 2, o.eyes || '#1a1420'); R(g, 13, hy + 6, 1, 1, skinD); }
      if (o.beard && dir !== 3) { R(g, side ? 8 : 5, hy + 7, side ? 5 : 7, 4, o.beard); R(g, side ? 9 : 6, hy + 10, side ? 3 : 5, 1, shade(o.beard, -0.2)); }
      if (o.mustache && dir === 0) R(g, 6, hy + 7, 5, 1, o.mustache);
      if (hs === 'short' || hs === 'long' || hs === 'braids' || hs === 'bun') {
        R(g, 3, hy, 11, 4, hair); R(g, 3, hy, 2, 7, hair); R(g, 12, hy, 2, 5, hair); R(g, 5, hy, 5, 1, shade(hair, 0.2));
        if (dir === 3) R(g, 3, hy, 11, 10, hair);
        if (side) { R(g, 3, hy, 6, 9, hair); }
        if (hs === 'long') { R(g, 3, hy + 4, 2, 9, hair); R(g, 12, hy + 4, 2, 9, hair); if (dir === 3) R(g, 4, hy + 8, 9, 5, hairD); }
        if (hs === 'braids') { R(g, 2, hy + 6, 2, 6, hair); R(g, 13, hy + 6, 2, 6, hair); R(g, 2, hy + 11, 2, 1, '#a04050'); R(g, 13, hy + 11, 2, 1, '#a04050'); }
        if (hs === 'bun') { R(g, 6, hy - 2, 5, 3, hair); }
      } else if (hs === 'hood') {
        const hc = o.hood || body;
        R(g, 3, hy - 1, 11, 4, hc); R(g, 2, hy + 1, 3, 10, hc); R(g, 12, hy + 1, 3, 10, hc); R(g, 2, hy + 1, 1, 10, shade(hc, -0.3));
        if (dir === 3) R(g, 3, hy, 11, 11, hc);
        if (side) { R(g, 2, hy, 7, 11, hc); }
      } else if (hs === 'cap') {
        R(g, 3, hy, 11, 3, o.hat || '#4a3a2a'); R(g, 1, hy + 3, 15, 1, shade(o.hat || '#4a3a2a', -0.3)); if (dir === 3) R(g, 3, hy + 1, 11, 7, hair);
      } else if (hs === 'bald') { R(g, 5, hy + 1, 3, 1, shade(skin, 0.25)); if (dir === 3) R(g, 4, hy + 1, 9, 9, skinD); }
      else if (hs === 'crown') {
        R(g, 3, hy, 11, 3, '#8a8a96'); for (let i = 0; i < 4; i++) R(g, 3 + i * 3, hy - 2, 2, 2, '#8a8a96'); R(g, 7, hy + 1, 2, 1, '#9fd0ff');
        if (dir === 3) R(g, 4, hy + 3, 9, 7, '#d0d0d0');
      }
    }
    g.restore();
  });
  return pixelize(c, o.outline || '#07060b');
}
const CHAR = {}; // name -> [dir][frame]
function makeChar(name, o) { const set = []; for (let d = 0; d < 4; d++) { set.push([0, 1, 2, 3].map(f => drawHumanoid(o, d, f === 2 ? 0 : f))); } CHAR[name] = set; return set; }
const CHARDEF = {
  hero: { head: 'helmet', steel: '#b4bacb', eyes: '#8fd8ff', plume: '#a3242f', armor: true, body: '#8a90a6', legs: '#4a4e60', boots: '#22222c', cape: '#7a1c26', glove: '#5e6274', armColor: '#7a8096', belt: '#3a2a1e', weapon: '#c9ccd8' },
  ansel: { head: 'hood', hood: '#4a4558', body: '#4a4558', robe: true, skin: '#cfae92', beard: '#d8d4cc', belt: '#8a6a3a' },
  mirra: { head: 'bun', hair: '#a8a4ac', body: '#4a3a52', robe: true, skin: '#d1ad94', belt: '#6a5a3a' },
  guido: { head: 'cap', hat: '#5a2a3a', hair: '#2a1a14', mustache: '#2a1a14', body: '#6a4a2a', belt: '#2a1a10', skin: '#d8a888', legs: '#3a2a22' },
  bram: { head: 'bald', skin: '#c49478', beard: '#6a3a1e', body: '#5a4a44', apron: '#3a2a1e', armColor: '#c49478', legs: '#2a2420' },
  lina: { head: 'braids', hair: '#a0642a', body: '#6a3a4a', robe: true, skin: '#e2bea2', small: true, blush: true },
  hosk: { head: 'helmet', steel: '#7a7e8a', body: '#5a4a3a', armor: true, legs: '#3a3030', weapon: '#9a9aa8', tabard: '#3a4a6a' },
  villagerA: { head: 'short', hair: '#4a3420', body: '#4a5a4a', belt: '#2a2010', legs: '#2a2a2a' },
  villagerB: { head: 'long', hair: '#2a1e18', body: '#5a4a6a', robe: true, skin: '#d6b296' },
  villagerC: { head: 'hood', hood: '#3a4a3a', body: '#3a4a3a', robe: true, skin: '#c8a88a', beard: '#8a8a8a' },
  villagerD: { head: 'short', hair: '#8a6a3a', body: '#6a5a3a', belt: '#3a2a1a', legs: '#3a3428', skin: '#dcb898' },
  tomas: { head: 'short', hair: '#6a4a2a', body: '#6a6e80', armor: true, legs: '#3a3a48', tabard: '#3a4a7a', weapon: '#9a9aa8', skin: '#d8b898' },
  tomasU: { head: 'short', hair: '#4a4038', body: '#4a4e5a', armor: true, legs: '#2a2a34', tabard: '#2a3048', weapon: '#7a7a88', skin: '#8fa894', eyes: '#9fffd0' },
  gareth: { head: 'phelm', steel: '#c8b27a', eyes: '#ff4a3a', armor: true, body: '#8a7a50', legs: '#3a3428', cape: '#e8e0d0', weapon: '#d8d8e8', armColor: '#9a8a5a' },
  garethF: { head: 'phelm', steel: '#4a4440', eyes: '#ff3a2a', armor: true, body: '#3a3430', legs: '#2a2420', cape: '#5a1a1a', weapon: '#8a8a9a', armColor: '#4a4440' },
  king: { head: 'crown', skin: '#b8b8b0', eyes: '#e8f4ff', body: '#4a4a5a', robe: true, beard: '#d8d8d8', belt: '#8a8a96' },
  sleeper1: { head: 'short', hair: '#5a4a3a', body: '#5a6070', sleep: true, legs: '#3a3a44', skin: '#b8b0a8' },
  sleeper2: { head: 'long', hair: '#7a6040', body: '#6a5a6a', robe: true, sleep: true, skin: '#bab0a8' },
  sleeper3: { head: 'braids', hair: '#3a2a20', body: '#5a6a6a', robe: true, small: true, sleep: true, skin: '#c0b8ae' },
  sleeper4: { head: 'cap', hat: '#3a3a4a', hair: '#555', body: '#4a4a3a', sleep: true, skin: '#b8b0a8', beard: '#9a9a9a' },
  ghostgirl: { head: 'long', hair: '#c8d8f0', body: '#9ab0d8', robe: true, small: true, skin: '#d8e4f4', eyes: '#3a5a9a' },
};

// ================= OBJECT SPRITES =================
const SPR = {};
function makeObjects() {
  // trees
  for (let v = 0; v < 3; v++) {
    const r = seeded(900 + v * 11);
    SPR['tree' + v] = pixelize(mk(32, 48, g => {
      R(g, 14, 30, 4, 16, '#2a1e18'); R(g, 14, 30, 1, 16, '#1a120e'); R(g, 12, 44, 8, 2, '#2a1e18');
      const cols = ['#142a22', '#1a3329', '#203d31', '#0f211b'];
      for (let i = 0; i < 4; i++) { const y = 6 + i * 7, w = 7 + i * 3.2; poly(g, [16, y - 6, 16 - w, y + 10, 16 + w, y + 10], cols[i % 2 ? 1 : 0]); poly(g, [16, y - 4, 16 + w * 0.2, y + 9, 16 + w - 1, y + 10], cols[2]); }
      speck(g, 4, 6, 24, 30, ['#27493a', '#0c1a15'], 40, r);
    }));
    SPR['dtree' + v] = pixelize(mk(32, 48, g => {
      const c = '#2e2626', cd = '#1e1818';
      R(g, 14, 22, 4, 24, c); R(g, 14, 22, 1, 24, cd); R(g, 11, 44, 10, 2, c);
      const br = (x, y, a, l, w) => { if (l < 3) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; line(g, x, y, x2, y2, c, w); br(x2, y2, a - 0.5 - r() * 0.3, l * 0.68, Math.max(1, w - 1)); br(x2, y2, a + 0.4 + r() * 0.3, l * 0.62, Math.max(1, w - 1)); };
      br(16, 24, -Math.PI / 2 - 0.3 + v * 0.2, 11, 3); br(16, 30, -Math.PI / 2 + 0.6, 8, 2); br(16, 28, -Math.PI / 2 - 0.9, 7, 2);
    }));
  }
  SPR.bush = pixelize(mk(16, 16, g => { ell(g, 8, 10, 7, 5, '#16291f'); ell(g, 6, 8, 4, 3, '#1f3a2c'); ell(g, 11, 9, 3, 3, '#1c3328'); R(g, 5, 7, 1, 1, '#7a2a3a'); R(g, 11, 10, 1, 1, '#7a2a3a'); }));
  SPR.grave = pixelize(mk(16, 20, g => { R(g, 3, 4, 10, 14, '#4a4c58'); circ(g, 8, 5, 5, '#4a4c58'); R(g, 3, 4, 2, 14, '#33343e'); R(g, 6, 7, 4, 1, '#2a2a33'); R(g, 7, 6, 2, 5, '#2a2a33'); R(g, 2, 17, 12, 2, '#2a2a30'); R(g, 11, 10, 1, 3, '#2e4a2e'); }));
  SPR.cross = pixelize(mk(16, 20, g => { R(g, 7, 2, 3, 16, '#3a3434'); R(g, 3, 6, 11, 3, '#3a3434'); R(g, 7, 2, 1, 16, '#2a2424'); R(g, 4, 17, 9, 2, '#22201e'); }));
  SPR.pillar = pixelize(mk(16, 36, g => { R(g, 3, 4, 10, 28, '#4a4d62'); R(g, 3, 4, 3, 28, '#353748'); R(g, 10, 4, 1, 28, '#5e627a'); R(g, 1, 0, 14, 5, '#55597a'); R(g, 1, 31, 14, 5, '#3a3d50'); R(g, 1, 4, 14, 1, '#2a2c3a'); for (let y = 8; y < 30; y += 6) R(g, 6, y, 1, 3, '#2f3142'); }));
  SPR.rpillar = tint2(SPR.pillar, '#6a4a3a');
  SPR.statue = pixelize(mk(16, 34, g => { R(g, 2, 26, 12, 8, '#3a3c48'); R(g, 2, 26, 12, 2, '#4e5062'); R(g, 4, 12, 8, 14, '#5a5c6a'); R(g, 4, 12, 2, 14, '#44464f'); circ(g, 8, 8, 4, '#5a5c6a'); R(g, 6, 8, 4, 1, '#2a2a33'); R(g, 12, 3, 1, 22, '#6a6c7a'); R(g, 10, 14, 5, 1, '#6a6c7a'); R(g, 3, 13, 2, 9, '#4a4c58'); }));
  SPR.candle = pixelize(mk(8, 12, g => { R(g, 3, 5, 2, 6, '#d8ccb0'); R(g, 2, 10, 4, 2, '#5a4a3a'); R(g, 3, 5, 1, 6, '#b0a48a'); }), null);
  SPR.candles = pixelize(mk(16, 16, g => { for (const [x, h] of [[3, 6], [7, 9], [11, 5]]) { R(g, x, 14 - h, 2, h, '#d8ccb0'); R(g, x, 14 - h, 1, h, '#a89c84'); } R(g, 1, 14, 14, 2, '#3a3028'); }), null);
  SPR.torch = pixelize(mk(8, 14, g => { R(g, 3, 6, 2, 8, '#4a3020'); R(g, 2, 5, 4, 2, '#2a2a30'); }));
  SPR.brazier = pixelize(mk(16, 16, g => { R(g, 3, 6, 10, 4, '#3a3a44'); R(g, 2, 5, 12, 2, '#55556a'); R(g, 5, 10, 2, 5, '#2a2a33'); R(g, 9, 10, 2, 5, '#2a2a33'); R(g, 4, 14, 8, 2, '#22222a'); }));
  SPR.altar = pixelize(mk(32, 20, g => { R(g, 2, 6, 28, 12, '#4a4658'); R(g, 2, 6, 28, 3, '#5e5a70'); R(g, 6, 8, 20, 10, '#6a1a24'); R(g, 14, 8, 4, 10, '#b08a3a'); R(g, 2, 17, 28, 2, '#2a2833'); }));
  SPR.pew = pixelize(mk(32, 14, g => { R(g, 1, 2, 30, 4, '#3a2618'); R(g, 1, 6, 30, 5, '#2e1f14'); R(g, 1, 2, 30, 1, '#4e3422'); R(g, 2, 11, 2, 3, '#22160e'); R(g, 28, 11, 2, 3, '#22160e'); }));
  SPR.shelf = pixelize(mk(16, 28, g => { R(g, 1, 0, 14, 28, '#2e1f14'); for (let y = 3; y < 26; y += 7) { R(g, 2, y, 12, 5, '#160e08'); for (let x = 2; x < 14; x += 2) R(g, x, y + 1 + (x % 3 ? 0 : 1), 2, 4 - (x % 3 ? 0 : 1), ['#5a2020', '#20305a', '#3a5a2a', '#6a5a2a'][(x + y) % 4]); } }));
  SPR.barrel = pixelize(mk(16, 18, g => { R(g, 3, 2, 10, 15, '#4a3020'); R(g, 3, 2, 3, 15, '#3a2418'); R(g, 3, 5, 10, 1, '#2a2a30'); R(g, 3, 13, 10, 1, '#2a2a30'); ell(g, 8, 2.5, 5, 1.5, '#5a3a24'); }));
  SPR.crate = pixelize(mk(16, 16, g => { R(g, 1, 2, 14, 13, '#5a4028'); R(g, 1, 2, 14, 2, '#6a4c30'); R(g, 1, 2, 2, 13, '#3e2c1c'); line(g, 2, 4, 14, 14, '#3e2c1c'); R(g, 1, 8, 14, 1, '#3e2c1c'); }));
  SPR.block = pixelize(mk(16, 18, g => { R(g, 1, 3, 14, 14, '#5a5c70'); R(g, 1, 1, 14, 4, '#787b94'); R(g, 1, 3, 2, 14, '#44465a'); R(g, 5, 8, 6, 5, '#44465a'); R(g, 6, 9, 4, 3, '#7a82a6'); }));
  SPR.well = pixelize(mk(32, 32, g => { ell(g, 16, 22, 13, 7, '#4a4c58'); ell(g, 16, 21, 10, 5, '#0a0c14'); R(g, 4, 6, 2, 16, '#3a2618'); R(g, 26, 6, 2, 16, '#3a2618'); R(g, 3, 4, 26, 3, '#4a3020'); R(g, 15, 7, 1, 10, '#8a7a5a'); R(g, 13, 16, 5, 4, '#4a3020'); }));
  SPR.fence = pixelize(mk(16, 14, g => { R(g, 0, 4, 16, 2, '#3a2a1e'); R(g, 0, 9, 16, 2, '#3a2a1e'); R(g, 2, 1, 2, 13, '#4a3626'); R(g, 12, 1, 2, 13, '#4a3626'); }));
  SPR.lamp = pixelize(mk(16, 36, g => { R(g, 7, 8, 2, 26, '#22222a'); R(g, 4, 33, 8, 3, '#22222a'); R(g, 4, 2, 8, 8, '#2a2a33'); R(g, 5, 3, 6, 6, '#ffcf7a'); R(g, 3, 1, 10, 2, '#22222a'); }));
  SPR.bell = pixelize(mk(32, 32, g => { R(g, 2, 2, 28, 3, '#3a2618'); poly(g, [16, 5, 8, 10, 6, 26, 26, 26, 24, 10], '#7a5a2a'); poly(g, [16, 5, 8, 10, 6, 26, 12, 26, 12, 10], '#5a4220'); R(g, 4, 25, 24, 3, '#8a6a32'); circ(g, 16, 29, 2, '#4a3a22'); R(g, 18, 12, 2, 10, '#9a7a3a'); }));
  SPR.lever0 = pixelize(mk(16, 16, g => { R(g, 4, 11, 8, 4, '#3a3a44'); R(g, 7, 4, 2, 8, '#6a6a7a'); circ(g, 8, 4, 2, '#a03030'); }));
  SPR.lever1 = pixelize(mk(16, 16, g => { R(g, 4, 11, 8, 4, '#3a3a44'); line(g, 8, 12, 13, 6, '#6a6a7a', 2); circ(g, 13, 6, 2, '#30a050'); }));
  SPR.chest0 = pixelize(mk(16, 16, g => { R(g, 1, 5, 14, 10, '#5a3a20'); R(g, 1, 3, 14, 4, '#6e4828'); R(g, 1, 7, 14, 1, '#2a1a10'); R(g, 1, 3, 1, 12, '#a08a4a'); R(g, 14, 3, 1, 12, '#a08a4a'); R(g, 7, 6, 2, 3, '#d8b85a'); }));
  SPR.chest1 = pixelize(mk(16, 16, g => { R(g, 1, 7, 14, 8, '#5a3a20'); R(g, 1, 2, 14, 3, '#6e4828'); R(g, 2, 5, 12, 2, '#120a06'); R(g, 1, 2, 1, 13, '#a08a4a'); R(g, 14, 2, 1, 13, '#a08a4a'); }));
  SPR.shrine = pixelize(mk(16, 28, g => { R(g, 4, 22, 8, 5, '#3a3a4a'); R(g, 3, 25, 10, 3, '#2a2a36'); R(g, 6, 10, 4, 12, '#e8e2d0'); R(g, 6, 10, 1, 12, '#b8b2a0'); R(g, 5, 18, 2, 4, '#d8d2c0'); R(g, 9, 15, 2, 3, '#d8d2c0'); R(g, 7, 8, 1, 2, '#222'); }));
  SPR.sign = pixelize(mk(16, 16, g => { R(g, 7, 8, 2, 8, '#3a2618'); R(g, 2, 2, 12, 7, '#5a3e26'); R(g, 4, 4, 8, 1, '#2a1a10'); R(g, 4, 6, 6, 1, '#2a1a10'); }));
  SPR.bones = pixelize(mk(16, 10, g => { circ(g, 5, 5, 3, '#c8c2b0'); R(g, 4, 5, 1, 1, '#111'); R(g, 6, 5, 1, 1, '#111'); line(g, 8, 7, 14, 4, '#b8b2a0', 2); line(g, 9, 3, 14, 8, '#a8a290', 1.5); }));
  SPR.skulls = pixelize(mk(16, 12, g => { for (const [x, y] of [[4, 8], [10, 8], [7, 4]]) { circ(g, x, y, 3, '#c8c2b0'); R(g, x - 1, y, 1, 1, '#111'); R(g, x + 1, y, 1, 1, '#111'); } }));
  SPR.mush = pixelize(mk(16, 12, g => { R(g, 4, 6, 2, 5, '#c8c2b0'); ell(g, 5, 6, 4, 2.5, '#3a9a9a'); R(g, 10, 7, 2, 4, '#c8c2b0'); ell(g, 11, 7, 3, 2, '#4ab0b0'); R(g, 4, 5, 1, 1, '#aaffff'); }));
  SPR.rock = pixelize(mk(16, 12, g => { ell(g, 8, 7, 7, 4.5, '#3a3840'); ell(g, 7, 6, 5, 3, '#4a4852'); R(g, 5, 4, 3, 1, '#5a5862'); }));
  SPR.banner = pixelize(mk(12, 22, g => { R(g, 0, 0, 12, 2, '#3a2a1a'); poly(g, [1, 2, 11, 2, 11, 18, 6, 21, 1, 18], '#4a1a2a'); R(g, 1, 2, 2, 16, '#3a1220'); R(g, 5, 6, 2, 6, '#b8b0a0'); R(g, 3, 8, 6, 2, '#b8b0a0'); }));
  SPR.throne = pixelize(mk(32, 40, g => { R(g, 6, 2, 20, 26, '#4a4a5a'); R(g, 6, 2, 4, 26, '#3a3a48'); poly(g, [6, 2, 10, 0, 16, 4, 22, 0, 26, 2], '#6a6a7a'); R(g, 4, 22, 24, 10, '#3a3a48'); R(g, 4, 22, 24, 2, '#5a5a6a'); R(g, 10, 6, 12, 16, '#2a2440'); R(g, 3, 32, 26, 6, '#2a2a36'); }));
  SPR.coffin = pixelize(mk(16, 28, g => { poly(g, [4, 1, 12, 1, 15, 8, 12, 27, 4, 27, 1, 8], '#3a2a22'); poly(g, [5, 3, 11, 3, 13, 8, 11, 25, 5, 25, 3, 8], '#4a3628'); R(g, 7, 7, 2, 10, '#8a8a7a'); R(g, 5, 10, 6, 2, '#8a8a7a'); }));
  SPR.web = pixelize(mk(16, 16, g => { g.globalAlpha = 0.9; for (let i = 0; i < 5; i++) line(g, 0, 0, 16, i * 4, '#9a9aa8', 0.6); for (let r2 = 4; r2 < 16; r2 += 4) { g.strokeStyle = '#9a9aa8'; g.lineWidth = 0.6; g.beginPath(); g.arc(0, 0, r2, 0, Math.PI / 2); g.stroke(); } }), null, 60);
  SPR.window = pixelize(mk(16, 16, g => { R(g, 4, 2, 8, 12, '#1a1a22'); circ(g, 8, 5, 4, '#1a1a22'); R(g, 5, 4, 6, 9, '#3a5a9a'); R(g, 5, 4, 3, 4, '#9a3a5a'); R(g, 8, 8, 3, 5, '#9a8a3a'); R(g, 7, 3, 1, 10, '#1a1a22'); R(g, 5, 8, 6, 1, '#1a1a22'); }));
  SPR.reeds = pixelize(mk(16, 16, g => { for (let i = 0; i < 6; i++) { const x = 2 + i * 2; R(g, x, 4 + (i % 3) * 2, 1, 12, '#3a4a32'); if (i % 2) R(g, x, 3 + (i % 3) * 2, 1, 3, '#5a3a22'); } }));
  SPR.lily = pixelize(mk(16, 10, g => { ell(g, 8, 5, 6, 3, '#1e3a2a'); R(g, 8, 3, 3, 2, '#0a1424'); circ(g, 7, 4, 1.5, '#d8d0e8'); }), null);
  SPR.swordstone = pixelize(mk(16, 32, g => { ell(g, 8, 26, 7, 4, '#4a4c58'); R(g, 2, 22, 12, 6, '#4a4c58'); R(g, 7, 2, 2, 22, '#c8d4f0'); R(g, 7, 2, 1, 22, '#ffffff'); R(g, 4, 10, 8, 2, '#8a7a4a'); R(g, 7, 6, 2, 4, '#5a3a2a'); circ(g, 8, 5, 1.5, '#9fd0ff'); }));
  SPR.cart = pixelize(mk(32, 24, g => { R(g, 3, 6, 24, 10, '#4a3020'); R(g, 3, 6, 24, 2, '#5a3c28'); circ(g, 8, 18, 5, '#2a1e14'); circ(g, 8, 18, 2, '#4a3626'); circ(g, 24, 19, 4, '#2a1e14'); line(g, 27, 12, 31, 8, '#3a2618', 2); }));
  SPR.gate = pixelize(mk(16, 24, g => { R(g, 0, 0, 16, 3, '#2a2a30'); for (let x = 1; x < 16; x += 3) R(g, x, 2, 2, 22, '#4a4a56'); R(g, 0, 10, 16, 2, '#3a3a44'); R(g, 0, 18, 16, 2, '#3a3a44'); for (let x = 1; x < 16; x += 3) R(g, x, 22, 2, 2, '#6a6a7a'); }));
  SPR.door = pixelize(mk(16, 16, g => { R(g, 2, 1, 12, 15, '#1a120c'); R(g, 3, 2, 10, 14, '#3e2a1a'); R(g, 8, 2, 1, 14, '#1a120c'); R(g, 3, 6, 10, 1, '#2a2a30'); R(g, 3, 12, 10, 1, '#2a2a30'); R(g, 10, 9, 1, 2, '#c8a85a'); }));
  SPR.arch = pixelize(mk(16, 16, g => { R(g, 2, 3, 12, 13, '#05040a'); circ(g, 8, 5, 6, '#05040a'); }), null);
  SPR.brokenwall = pixelize(mk(16, 12, g => { R(g, 1, 4, 6, 7, '#3b3b44'); R(g, 8, 6, 7, 5, '#34343c'); R(g, 1, 4, 6, 1, '#55556a'); R(g, 8, 6, 7, 1, '#55556a'); }));
  SPR.moonaltar = pixelize(mk(32, 24, g => { R(g, 4, 10, 24, 12, '#4a4f63'); R(g, 4, 10, 24, 3, '#6a7090'); circ(g, 16, 8, 6, '#c8d8ff'); circ(g, 18, 7, 5, '#4a4f63'); R(g, 2, 21, 28, 3, '#2a2e40'); }));
  SPR.flower = pixelize(mk(8, 8, g => { R(g, 3, 4, 1, 4, '#2a4a2a'); circ(g, 3.5, 3, 2, '#8a8ab8'); R(g, 3, 3, 1, 1, '#e8e0a0'); }), null);
  SPR.bed = pixelize(mk(16, 24, g => { R(g, 1, 1, 14, 22, '#3a2618'); R(g, 2, 2, 12, 5, '#d8d0c0'); R(g, 2, 7, 12, 15, '#4a5a7a'); R(g, 2, 7, 12, 2, '#5a6a8a'); }));
  SPR.table = pixelize(mk(32, 18, g => { R(g, 1, 2, 30, 8, '#4a3020'); R(g, 1, 2, 30, 2, '#5a3c28'); R(g, 3, 10, 2, 7, '#2e1f14'); R(g, 27, 10, 2, 7, '#2e1f14'); R(g, 8, 0, 3, 3, '#c8c0a0'); R(g, 20, 1, 4, 2, '#8a4a2a'); }));
  SPR.anvil = pixelize(mk(16, 14, g => { R(g, 2, 2, 12, 3, '#4a4a56'); R(g, 0, 2, 4, 2, '#4a4a56'); R(g, 5, 5, 6, 5, '#3a3a44'); R(g, 3, 10, 10, 3, '#2a2a33'); R(g, 3, 2, 10, 1, '#6a6a7a'); }));
  SPR.forge = pixelize(mk(32, 28, g => { R(g, 2, 6, 28, 20, '#3a3434'); R(g, 2, 6, 28, 3, '#4a4444'); R(g, 8, 14, 16, 8, '#1a0a06'); R(g, 10, 17, 12, 5, '#c8501e'); R(g, 13, 18, 6, 3, '#ffb040'); R(g, 12, 0, 8, 8, '#2a2626'); }));
  SPR.tent = pixelize(mk(32, 28, g => { poly(g, [16, 2, 2, 26, 30, 26], '#5a3a3a'); poly(g, [16, 2, 2, 26, 16, 26], '#4a2e2e'); poly(g, [16, 12, 11, 26, 21, 26], '#1a0e0e'); R(g, 15, 0, 2, 4, '#3a2618'); }));
  SPR.sarc = pixelize(mk(32, 20, g => { R(g, 2, 4, 28, 14, '#4a4c58'); R(g, 2, 2, 28, 5, '#5e6070'); R(g, 6, 3, 20, 3, '#6e7080'); circ(g, 10, 4.5, 2, '#7a7c8a'); R(g, 2, 17, 28, 2, '#2a2a33'); }));
}
function tint2(c, col) { return mk(c.width, c.height, g => { g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.45; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); }); }

// light glow sprites (precomputed radial gradients)
const GLOW = {};
function glowSprite(r, col) {
  const k = r + '_' + col; if (GLOW[k]) return GLOW[k];
  const c = mk(r * 2, r * 2, g => { const gr = g.createRadialGradient(r, r, 0, r, r, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); });
  GLOW[k] = c; return c;
}
// flame animation (drawn live on low canvas)
function drawFlame(g, x, y, s = 1, t = 0, col = 'warm') {
  const f = Math.sin(t * 17 + x) * 0.5 + Math.sin(t * 11 + y * 1.3) * 0.5;
  const pal = col === 'blue' ? ['#3a6aff', '#8fc8ff', '#e8f6ff'] : col === 'green' ? ['#2a8a5a', '#7af0b0', '#e0fff0'] : col === 'rust' ? ['#a03a10', '#ff7a2a', '#ffe0a0'] : ['#c8401a', '#ffa030', '#fff0b0'];
  const h = (5 + f * 1.2) * s;
  g.fillStyle = pal[0]; g.fillRect(Math.round(x - 1.5 * s), Math.round(y - h), Math.max(1, Math.round(3 * s)), Math.round(h));
  g.fillStyle = pal[1]; g.fillRect(Math.round(x - 1 * s), Math.round(y - h * 0.75), Math.max(1, Math.round(2 * s)), Math.round(h * 0.75));
  g.fillStyle = pal[2]; g.fillRect(Math.round(x - 0.5 * s), Math.round(y - h * 0.4), Math.max(1, Math.round(1 * s)), Math.max(1, Math.round(h * 0.4)));
}

// ================= HOUSES =================
function makeHouse(w, h, o = {}) { // w,h in tiles; roof color
  const pw = w * 16, ph = h * 16;
  return pixelize(mk(pw, ph, g => {
    const r = seeded(pw * 7 + ph);
    const wallTop = Math.floor(ph * 0.48);
    // walls
    R(g, 1, wallTop, pw - 2, ph - wallTop, o.wall || '#4a3a2e');
    for (let x = 1; x < pw; x += 8) R(g, x, wallTop, 1, ph - wallTop, shade(o.wall || '#4a3a2e', -0.3));
    R(g, 1, wallTop, pw - 2, 2, '#2a1e16');
    R(g, 1, ph - 3, pw - 2, 3, '#2a2420');
    // timber
    R(g, 1, wallTop + 8, pw - 2, 2, '#2e2016');
    // roof
    const rc = o.roof || '#2e2a3a', rcd = shade(rc, -0.3), rcl = shade(rc, 0.15);
    poly(g, [0, wallTop + 2, pw / 2, 0, pw, wallTop + 2], rc);
    poly(g, [0, wallTop + 2, pw / 2, 0, pw / 2, wallTop + 2], rcd);
    for (let y = 4; y < wallTop; y += 4) { const hw = (y / wallTop) * pw / 2; R(g, pw / 2 - hw, y, hw * 2, 1, shade(rc, -0.4)); }
    R(g, pw / 2 - 1, 0, 2, wallTop + 2, rcl);
    speck(g, 4, 4, pw - 8, wallTop - 6, [rcl, rcd], 30, r);
    // door
    const dx = o.doorX != null ? o.doorX * 16 + 4 : Math.floor(pw / 2) - 4;
    R(g, dx, ph - 15, 9, 12, '#1a120c'); R(g, dx + 1, ph - 14, 7, 11, '#3e2a1a'); R(g, dx + 6, ph - 9, 1, 2, '#c8a85a');
    // windows (glow)
    const wins = o.windows || [0.22, 0.78];
    for (const fx of wins) { const wx = Math.floor(pw * fx) - 4; R(g, wx, wallTop + 12, 8, 7, '#1a120c'); R(g, wx + 1, wallTop + 13, 6, 5, o.dark ? '#1a1e2a' : '#ffb85a'); R(g, wx + 4, wallTop + 13, 1, 5, '#1a120c'); R(g, wx + 1, wallTop + 15, 6, 1, '#1a120c'); }
    // chimney
    if (o.chimney) { R(g, pw * 0.72, 4, 6, 12, '#3a3434'); R(g, pw * 0.72 - 1, 3, 8, 2, '#2a2626'); }
  }));
}

// ================= PORTRAITS (48x48) =================
const PORT = {};
function drawPortrait(o, mood = 0) {
  return pixelize(mk(48, 48, g => {
    const skin = o.skin || '#d9b89a', skinD = shade(skin, -0.3), skinL = shade(skin, 0.15);
    if (o.kind === 'wisp') {
      const t = mood * 0.7;
      g.drawImage(glowSprite(22, 'rgba(120,170,255,0.5)'), 2, 6);
      poly(g, [24, 2 + Math.sin(t) * 2, 10, 30, 14, 42, 34, 42, 38, 30], '#3a7aff');
      poly(g, [24, 10, 14, 32, 18, 40, 30, 40, 34, 32], '#8fc8ff');
      ell(g, 24, 32, 9, 8, '#e8f6ff');
      if (mood === 1) { R(g, 19, 31, 3, 1, '#1a2a5a'); R(g, 27, 31, 3, 1, '#1a2a5a'); R(g, 19, 30, 1, 1, '#1a2a5a'); R(g, 29, 30, 1, 1, '#1a2a5a'); }
      else { R(g, 19, 29, 3, 4, '#1a2a5a'); R(g, 27, 29, 3, 4, '#1a2a5a'); R(g, 20, 29, 1, 1, '#fff'); R(g, 28, 29, 1, 1, '#fff'); }
      if (mood === 2) { R(g, 22, 37, 5, 1, '#1a2a5a'); R(g, 17, 34, 1, 2, '#7ab0ff'); } else R(g, 22, 36, 5, 2, '#1a2a5a');
      return;
    }
    // shoulders
    const bc = o.body || '#4a4a5a';
    ell(g, 24, 50, 22, 14, bc); ell(g, 18, 50, 14, 12, shade(bc, -0.25));
    if (o.armor) { ell(g, 9, 40, 8, 6, shade(bc, 0.2)); ell(g, 39, 40, 8, 6, shade(bc, 0.2)); R(g, 22, 38, 4, 10, shade(bc, -0.3)); }
    if (o.cape) { R(g, 2, 42, 6, 6, o.cape); R(g, 40, 42, 6, 6, o.cape); }
    if (o.kind === 'wisp') {
      const t = mood * 0.7;
      poly(g, [24, 2 + Math.sin(t) * 2, 10, 30, 14, 42, 34, 42, 38, 30], '#3a7aff');
      poly(g, [24, 10, 14, 32, 18, 40, 30, 40, 34, 32], '#8fc8ff');
      ell(g, 24, 32, 9, 8, '#e8f6ff');
      R(g, 19, 29, 3, 4, '#1a2a5a'); R(g, 27, 29, 3, 4, '#1a2a5a');
      if (mood === 1) { R(g, 19, 31, 3, 1, '#e8f6ff'); R(g, 27, 31, 3, 1, '#e8f6ff'); }
      if (mood === 2) { R(g, 22, 37, 5, 1, '#1a2a5a'); }
      else R(g, 22, 36, 5, 2, '#1a2a5a');
      return;
    }
    // neck
    R(g, 20, 30, 8, 8, skinD);
    // head
    if (o.kind === 'helmet' || o.kind === 'phelm') {
      const st = o.steel || '#b4bacb', stD = shade(st, -0.35), stL = shade(st, 0.3);
      ell(g, 24, 20, 14, 16, st); ell(g, 19, 20, 9, 15, stD); R(g, 12, 20, 24, 16, st); R(g, 12, 20, 6, 16, stD);
      R(g, 30, 8, 2, 20, stL);
      R(g, 14, 20, 20, 3, '#0a0912'); R(g, 23, 20, 2, 13, '#0a0912');
      for (let i = 0; i < 4; i++) { R(g, 15 + i * 5, 28, 1, 1, '#0a0912'); R(g, 15 + i * 5, 31, 1, 1, '#0a0912'); }
      if (o.eyes) { R(g, 17, 21, 3, 1, o.eyes); R(g, 28, 21, 3, 1, o.eyes); if (mood === 1) { R(g, 17, 20, 3, 1, o.eyes); R(g, 28, 20, 3, 1, o.eyes); } }
      if (o.plume) { poly(g, [22, 6, 26, 6, 36, -2, 40, 4, 30, 10], o.plume); poly(g, [24, 4, 30, 2, 26, 8], shade(o.plume, 0.2)); }
      if (o.kind === 'phelm') { poly(g, [10, 14, 2, 4, 4, 18], stL); poly(g, [38, 14, 46, 4, 44, 18], stL); }
      if (o.cracks) { line(g, 18, 10, 22, 18, '#1a1010'); line(g, 30, 26, 34, 32, '#1a1010'); }
      return;
    }
    ell(g, 24, 20, 12, 14, skin); ell(g, 19, 21, 8, 12, skinD); ell(g, 27, 16, 6, 6, skinL);
    if (o.gaunt) { R(g, 15, 24, 3, 6, skinD); R(g, 30, 24, 3, 6, skinD); }
    // eyes
    const ec = o.eyes || '#1a1420';
    if (o.sleep || mood === 3) { R(g, 17, 22, 5, 1, '#1a1420'); R(g, 27, 22, 5, 1, '#1a1420'); }
    else {
      R(g, 17, 20, 5, 4, '#e8e4dc'); R(g, 27, 20, 5, 4, '#e8e4dc');
      R(g, 19, 20, 3, 4, ec); R(g, 28, 20, 3, 4, ec);
      if (o.glow) { R(g, 17, 20, 5, 4, o.eyes); R(g, 27, 20, 5, 4, o.eyes); R(g, 19, 21, 1, 1, '#fff'); R(g, 29, 21, 1, 1, '#fff'); }
      if (mood === 1) { R(g, 16, 18, 6, 1, shade(o.hair || '#333', -0.2)); R(g, 27, 18, 6, 1, shade(o.hair || '#333', -0.2)); } // stern
      if (mood === 2) { R(g, 16, 17, 6, 1, '#2a2020'); R(g, 27, 17, 6, 1, '#2a2020'); R(g, 18, 25, 2, 2, '#9ac8ff'); } // sad tear
    }
    // brows default
    R(g, 17, 18, 5, 1, shade(o.hair || '#3a2a1e', -0.2)); R(g, 27, 18, 5, 1, shade(o.hair || '#3a2a1e', -0.2));
    // nose & mouth
    R(g, 24, 23, 2, 4, skinD);
    if (mood === 4) { R(g, 21, 29, 7, 2, '#5a2020'); R(g, 22, 29, 5, 1, '#e8e4dc'); } // grin
    else if (mood === 2) R(g, 22, 30, 5, 1, '#5a2a2a');
    else R(g, 21, 29, 7, 1, '#6a3a3a');
    if (o.beard) { poly(g, [12, 22, 36, 22, 34, 34, 28, 42, 20, 42, 14, 34], o.beard); R(g, 21, 29, 7, 2, '#3a2020'); poly(g, [18, 30, 30, 30, 28, 40, 20, 40], shade(o.beard, 0.15)); }
    if (o.mustache) { R(g, 18, 27, 13, 2, o.mustache); R(g, 16, 28, 3, 2, o.mustache); R(g, 30, 28, 3, 2, o.mustache); }
    if (o.scar) { line(g, 30, 14, 34, 28, '#8a4a4a', 1); }
    // hair / headwear
    const hair = o.hair || '#3a2a1e', hairD = shade(hair, -0.3);
    switch (o.hs) {
      case 'hood': { const hc = o.hood; poly(g, [24, 0, 6, 14, 4, 46, 12, 46, 13, 20, 24, 8, 35, 20, 36, 46, 44, 46, 42, 14], hc); poly(g, [24, 0, 6, 14, 4, 46, 12, 46, 13, 20, 24, 8], shade(hc, -0.25)); break; }
      case 'bun': ell(g, 24, 9, 13, 7, hair); ell(g, 24, 2, 6, 5, hair); R(g, 11, 9, 4, 14, hair); R(g, 33, 9, 4, 14, hair); R(g, 18, 6, 10, 1, shade(hair, 0.2)); break;
      case 'cap': ell(g, 24, 9, 14, 6, o.hat); R(g, 6, 11, 36, 3, shade(o.hat, -0.3)); R(g, 11, 12, 4, 8, hair); R(g, 33, 12, 4, 8, hair); R(g, 30, 4, 4, 6, '#a03030'); break;
      case 'bald': ell(g, 24, 10, 11, 6, skinL); R(g, 12, 14, 3, 8, hairD); R(g, 33, 14, 3, 8, hairD); break;
      case 'braids': ell(g, 24, 10, 13, 8, hair); R(g, 9, 12, 5, 26, hair); R(g, 34, 12, 5, 26, hair); R(g, 9, 36, 5, 3, '#a04050'); R(g, 34, 36, 5, 3, '#a04050'); R(g, 14, 9, 20, 3, hair); break;
      case 'long': ell(g, 24, 10, 14, 9, hair); R(g, 9, 10, 6, 32, hair); R(g, 33, 10, 6, 32, hair); R(g, 13, 8, 22, 5, hair); break;
      case 'crown': {
        R(g, 10, 4, 28, 6, '#8a8a96'); for (let i = 0; i < 5; i++) poly(g, [10 + i * 6, 4, 13 + i * 6, -3, 16 + i * 6, 4], '#8a8a96'); R(g, 10, 4, 28, 1, '#c8c8d4'); circ(g, 24, 7, 2, '#9fd0ff');
        R(g, 10, 10, 4, 22, '#d8d8d8'); R(g, 34, 10, 4, 22, '#d8d8d8'); break;
      }
      default: ell(g, 24, 9, 13, 7, hair); R(g, 11, 9, 5, 10, hair); R(g, 32, 9, 5, 10, hair); poly(g, [14, 8, 30, 8, 22, 14], hair); R(g, 18, 5, 10, 1, shade(hair, 0.2));
    }
  }));
}
const PORTDEF = {
  hero: { kind: 'helmet', steel: '#b4bacb', eyes: '#8fd8ff', plume: '#a3242f', armor: true, body: '#7a8096', cape: '#7a1c26' },
  ivel: { kind: 'wisp' },
  ansel: { hs: 'hood', hood: '#4a4558', body: '#4a4558', skin: '#cfae92', beard: '#d8d4cc', hair: '#c8c4bc' },
  mirra: { hs: 'bun', hair: '#a8a4ac', body: '#4a3a52', skin: '#d1ad94' },
  guido: { hs: 'cap', hat: '#5a2a3a', hair: '#2a1a14', mustache: '#2a1a14', body: '#6a4a2a', skin: '#d8a888' },
  bram: { hs: 'bald', skin: '#c49478', beard: '#6a3a1e', hair: '#6a3a1e', body: '#3a2a1e' },
  lina: { hs: 'braids', hair: '#a0642a', body: '#6a3a4a', skin: '#e2bea2' },
  hosk: { kind: 'helmet', steel: '#7a7e8a', body: '#3a4a6a', armor: true },
  villager: { hs: 'short', hair: '#4a3420', body: '#4a5a4a', skin: '#d6b296' },
  tomas: { hs: 'short', hair: '#6a4a2a', body: '#3a4a7a', skin: '#d8b898', armor: true },
  tomasU: { hs: 'short', hair: '#4a4038', body: '#2a3048', skin: '#8fa894', eyes: '#9fffd0', glow: true, gaunt: true, armor: true },
  gareth: { kind: 'phelm', steel: '#c8b27a', eyes: '#ffd27a', armor: true, body: '#8a7a50', cape: '#e8e0d0' },
  garethF: { kind: 'phelm', steel: '#5a5450', eyes: '#ff3a2a', armor: true, body: '#3a3430', cape: '#5a1a1a', cracks: true },
  king: { hs: 'crown', skin: '#b8b8b0', eyes: '#e8f4ff', glow: true, gaunt: true, body: '#3a3a4a', beard: '#d8d8d8', hair: '#d8d8d8' },
  ghost: { hs: 'long', hair: '#c8d8f0', body: '#9ab0d8', skin: '#d8e4f4', eyes: '#3a5a9a' },
  sleeper: { hs: 'short', hair: '#5a4a3a', body: '#5a6070', skin: '#b8b0a8', sleep: true },
};
function getPortrait(name, mood = 0) { const k = name + mood; if (!PORT[k] && PORTDEF[name]) PORT[k] = drawPortrait(PORTDEF[name], mood); return PORT[k]; }
