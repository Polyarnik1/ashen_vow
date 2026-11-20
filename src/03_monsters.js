// ================= MONSTER SPRITES =================
// each: [w,h,frames, draw(g,t,p)]  t:0..1 loop, p = t*2PI
const MDRAW = {
  ashrat: [46, 34, 8, (g, t, p) => {
    const b = Math.round(Math.sin(p * 2) * 1);
    g.strokeStyle = '#4a4650'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(12, 24 + b); g.quadraticCurveTo(2, 22 + Math.sin(p) * 5, 4, 10 + Math.cos(p) * 2); g.stroke();
    ell(g, 22, 23 + b, 13, 8, '#55525e'); ell(g, 20, 25 + b, 11, 6, '#403e48');
    ell(g, 34, 21 + b, 7.5, 6.5, '#5e5b68'); poly(g, [38, 18 + b, 45, 22 + b, 38, 25 + b], '#5e5b68'); circ(g, 44.5, 22 + b, 1.3, '#c87a8a');
    ell(g, 31, 14 + b, 3, 4.5, '#6e6a78'); ell(g, 31, 15 + b, 1.5, 2.5, '#a0606a');
    R(g, 36, 19 + b, 2, 2, '#ffb030'); R(g, 36, 19 + b, 1, 1, '#fff2a0');
    for (const [x, ph] of [[14, 0], [20, 1], [26, 2]]) R(g, x, 29, 3, 3 + (Math.sin(p * 2 + ph) > 0 ? 1 : 0), '#34323c');
    for (let i = 0; i < 5; i++) { const fl = Math.sin(p * 3 + i * 1.7); circ(g, 13 + i * 4.5, 15 + b - Math.abs(fl) * 2, 1.6, fl > 0.3 ? '#ffcf5a' : fl > -0.3 ? '#ff7a2a' : '#a03a10'); }
  }],
  wisp: [34, 42, 8, (g, t, p) => {
    const y = Math.sin(p) * 2; const fl = (i) => Math.sin(p * 3 + i) * 2;
    poly(g, [17, 2 + y + fl(0), 6, 24 + y, 9, 34 + y, 25, 34 + y, 28, 24 + y], '#1e7a4a');
    poly(g, [12 + fl(1), 8 + y, 7, 26 + y, 14, 30 + y], '#1e7a4a'); poly(g, [23 + fl(2), 10 + y, 27, 26 + y, 20, 30 + y], '#1e7a4a');
    poly(g, [17, 10 + y + fl(1), 10, 26 + y, 12, 32 + y, 22, 32 + y, 24, 26 + y], '#5ae09a');
    ell(g, 17, 27 + y, 7, 6, '#c8ffe0');
    ell(g, 14, 26 + y, 1.6, 2.4, '#0a2a1a'); ell(g, 20, 26 + y, 1.6, 2.4, '#0a2a1a'); ell(g, 17, 31 + y, 1.6, 1 + Math.abs(Math.sin(p)), '#0a2a1a');
    for (let i = 0; i < 3; i++) { const a = p + i * 2.1; R(g, 17 + Math.cos(a) * 13, 24 + y + Math.sin(a) * 6, 1.5, 1.5, '#8affc0'); }
  }],
  mistwolf: [62, 42, 8, (g, t, p) => {
    const b = Math.sin(p * 2) * 1;
    for (let i = 0; i < 4; i++) { g.globalAlpha = 0.5 - i * 0.1; ell(g, 9 - i * 3, 18 + Math.sin(p + i) * 3, 7 - i, 4, '#7a8aa0'); } g.globalAlpha = 1;
    poly(g, [8, 16 + b, 14, 12 + b, 18, 18 + b], '#4a5468');
    ell(g, 28, 22 + b, 15, 9, '#3a4256'); ell(g, 26, 25 + b, 13, 6, '#2a3044');
    poly(g, [16, 14 + b, 22, 10 + b, 30, 12 + b, 26, 18 + b], '#4a5468');
    ell(g, 44, 16 + b, 8, 7, '#3e4660'); poly(g, [48, 13 + b, 60, 18 + b, 58, 21 + b, 48, 21 + b], '#3e4660');
    poly(g, [50, 20 + b, 59, 21 + b, 51, 24 + b], '#20263a');
    for (let i = 0; i < 3; i++) R(g, 52 + i * 2, 21 + b, 1, 2, '#d8d8e0');
    poly(g, [40, 10 + b, 42, 2 + b, 46, 10 + b], '#3e4660'); poly(g, [44, 10 + b, 47, 3 + b, 49, 11 + b], '#4a5468');
    R(g, 47, 14 + b, 3, 2, '#ff3a3a'); R(g, 49, 14 + b, 1, 1, '#ffb0a0');
    const lg = (x, ph) => { const s = Math.sin(p * 2 + ph) * 1.5; R(g, x + s, 28 + b, 3, 10 - b, '#2a3044'); R(g, x + s - 1, 37, 4, 2, '#1a2030'); };
    lg(18, 0); lg(24, 2); lg(34, 1); lg(40, 3);
    g.globalAlpha = 0.35; ell(g, 30, 39, 20, 2, '#9aaac0'); g.globalAlpha = 1;
  }],
  sporecap: [40, 42, 8, (g, t, p) => {
    const sq = Math.sin(p * 2) * 1.2;
    R(g, 13, 22, 14, 14 - sq, '#c8bca0'); R(g, 13, 22, 4, 14 - sq, '#a89c80');
    ell(g, 20, 18 + sq, 18, 10 - sq * 0.4, '#6a2a4a'); ell(g, 20, 21 + sq, 17, 5, '#4a1a34');
    for (const [x, y, r] of [[12, 14, 2.5], [22, 11, 3], [29, 17, 2], [17, 19, 1.6]]) circ(g, x, y + sq, r, '#d8b8c8');
    ell(g, 17, 28, 1.5, 2, '#2a1a1a'); ell(g, 23, 28, 1.5, 2, '#2a1a1a'); R(g, 18, 32, 4, 1, '#2a1a1a');
    R(g, 13, 35, 4, 4, '#a89c80'); R(g, 23, 35, 4, 4, '#a89c80');
    for (let i = 0; i < 4; i++) { const k = (t + i / 4) % 1; circ(g, 8 + i * 8 + Math.sin(k * 6) * 2, 10 - k * 9, 1.2, '#c8e870'); }
  }],
  rustarmor: [44, 58, 8, (g, t, p) => {
    const b = Math.round(Math.sin(p) * 1.2);
    R(g, 13, 44, 6, 11, '#5a3a28'); R(g, 23, 44, 6, 11, '#4a3020'); R(g, 11, 53, 9, 3, '#3a2418'); R(g, 22, 53, 9, 3, '#3a2418');
    poly(g, [10, 22 + b, 32, 22 + b, 30, 46, 12, 46], '#6a4430'); poly(g, [10, 22 + b, 20, 22 + b, 20, 46, 12, 46], '#523224');
    R(g, 12, 36 + b, 18, 2, '#3a2418'); for (let i = 0; i < 4; i++) R(g, 14 + i * 4, 26 + b + (i % 2) * 5, 2, 3, '#9a4a1e');
    ell(g, 8, 24 + b, 6, 4, '#7a5038'); ell(g, 34, 24 + b, 6, 4, '#7a5038');
    R(g, 13, 7 + b, 16, 15, '#7a5038'); R(g, 13, 7 + b, 5, 15, '#5a3a28'); poly(g, [13, 7 + b, 21, 2 + b, 29, 7 + b], '#7a5038');
    R(g, 15, 13 + b, 12, 2, '#0a0606'); R(g, 20, 13 + b, 2, 7, '#0a0606');
    const gl = 0.5 + 0.5 * Math.sin(p * 2); g.globalAlpha = gl; R(g, 16, 13 + b, 3, 2, '#ff8a2a'); R(g, 23, 13 + b, 3, 2, '#ff8a2a'); g.globalAlpha = 1;
    R(g, 3, 26 + b, 4, 12, '#6a4430'); R(g, 35, 26 + b, 4, 12, '#6a4430');
    R(g, 38, 6 + b, 2, 34, '#8a8070'); R(g, 38, 6 + b, 1, 34, '#b0a890'); R(g, 34, 36 + b, 10, 2, '#5a3a22'); R(g, 38, 38 + b, 2, 5, '#3a2418');
    poly(g, [0, 28 + b, 9, 28 + b, 9, 42 + b, 4.5, 46 + b, 0, 42 + b], '#5a4434'); R(g, 3, 32 + b, 3, 6, '#8a2a2a');
  }],
  gargoyle: [58, 50, 8, (g, t, p) => {
    const f = Math.sin(p * 2) * 4, b = Math.sin(p * 2 + 1) * 1.5;
    for (const s of [-1, 1]) { const x0 = 29 + s * 8; poly(g, [x0, 16 + b, x0 + s * 22, 4 + f, x0 + s * 27, 14 + f, x0 + s * 22, 22 + f * 0.5, x0 + s * 14, 26 + b], s < 0 ? '#4a4c58' : '#565866'); for (let i = 1; i < 3; i++) line(g, x0, 18 + b, x0 + s * (10 + i * 6), 8 + f + i * 4, '#33343e', 1); }
    ell(g, 29, 28 + b, 10, 11, '#5a5c6a'); ell(g, 26, 30 + b, 7, 9, '#46484f');
    ell(g, 29, 14 + b, 8, 7, '#5e606e'); poly(g, [22, 10 + b, 18, 1 + b, 25, 8 + b], '#6e7080'); poly(g, [36, 10 + b, 40, 1 + b, 33, 8 + b], '#6e7080');
    R(g, 25, 13 + b, 3, 2, '#ffd23a'); R(g, 31, 13 + b, 3, 2, '#ffd23a');
    R(g, 25, 18 + b, 9, 2, '#22222a'); R(g, 26, 18 + b, 1, 2, '#d8d8d8'); R(g, 32, 18 + b, 1, 2, '#d8d8d8');
    R(g, 21, 37 + b, 5, 8, '#46484f'); R(g, 32, 37 + b, 5, 8, '#46484f'); R(g, 19, 44 + b, 8, 3, '#3a3c44'); R(g, 31, 44 + b, 8, 3, '#3a3c44');
    speck(g, 18, 20, 22, 20, ['#3a3c44', '#6a6c7a'], 20, seeded(3));
  }],
  bellwraith: [44, 56, 8, (g, t, p) => {
    const y = Math.sin(p) * 2, sw = Math.sin(p) * 3;
    poly(g, [22, 4 + y, 10, 14 + y, 6, 40 + y, 38, 40 + y, 34, 14 + y], '#5a5a78');
    poly(g, [22, 4 + y, 10, 14 + y, 6, 40 + y, 16, 40 + y, 16, 14 + y], '#46465e');
    for (let i = 0; i < 5; i++) { const x = 6 + i * 8; poly(g, [x, 39 + y, x + 8, 39 + y, x + 4, 48 + y + Math.sin(p * 2 + i) * 3], i % 2 ? '#46465e' : '#5a5a78'); }
    R(g, 6, 36 + y, 32, 3, '#8a8aaa');
    ell(g, 22 + sw, 34 + y, 3.5, 4, '#2a2a3a'); line(g, 22, 18 + y, 22 + sw, 31 + y, '#2a2a3a', 1.5);
    ell(g, 16, 20 + y, 2.5, 3.5, '#0a0a14'); ell(g, 28, 20 + y, 2.5, 3.5, '#0a0a14');
    R(g, 15, 19 + y, 2, 2, '#c8d8ff'); R(g, 27, 19 + y, 2, 2, '#c8d8ff');
    for (let i = 0; i < 4; i++) R(g, 21, i * 2 + y - 2, 2, 1, '#6a6a7a');
  }],
  bishop: [84, 104, 10, (g, t, p) => {
    const y = Math.round(Math.sin(p) * 1.5);
    // halo of rust
    g.strokeStyle = '#8a4a1e'; g.lineWidth = 2; g.beginPath(); g.arc(42, 22 + y, 20, 0, 6.283); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + p * 0.25; R(g, 42 + Math.cos(a) * 20 - 1, 22 + y + Math.sin(a) * 20 - 1, 3, 3, i % 3 ? '#a05a22' : '#ffb040'); }
    // robe
    poly(g, [42, 30 + y, 20, 44 + y, 12, 100, 72, 100, 64, 44 + y], '#4a2c26');
    poly(g, [42, 30 + y, 20, 44 + y, 12, 100, 36, 100, 38, 44 + y], '#3a201c');
    R(g, 38, 40 + y, 8, 60 - y, '#8a6a2a'); for (let k = 0; k < 5; k++) { R(g, 40, 48 + k * 10, 4, 1, '#3a201c'); R(g, 41, 46 + k * 10, 2, 5, '#3a201c'); }
    for (let i = 0; i < 6; i++) R(g, 14 + i * 9, 92 + (i % 2) * 2, 4, 8, '#2a1612');
    // arms & censer
    poly(g, [22, 46 + y, 8, 66 + y, 14, 70 + y, 26, 54 + y], '#4a2c26'); poly(g, [62, 46 + y, 76, 64 + y, 70, 68 + y, 58, 54 + y], '#4a2c26');
    const cs = Math.sin(p) * 6; line(g, 74, 66 + y, 74 + cs, 82, '#6a6a6a', 1); circ(g, 74 + cs, 84, 4, '#7a5a2a'); R(g, 72 + cs, 82, 4, 1, '#ffb040');
    g.globalAlpha = 0.5; for (let i = 0; i < 3; i++) circ(g, 74 + cs + Math.sin(p + i) * 3, 78 - i * 5 - t * 4, 2 + i, '#8a8a8a'); g.globalAlpha = 1;
    R(g, 6, 50 + y, 2, 46, '#8a6a2a'); R(g, 2, 48 + y, 10, 2, '#8a6a2a'); R(g, 6, 44 + y, 2, 6, '#8a6a2a');
    // head & mitre
    ell(g, 42, 30 + y, 9, 8, '#c8b8a0'); ell(g, 39, 31 + y, 6, 7, '#a8987e');
    R(g, 37, 30 + y, 4, 2, '#0a0606'); R(g, 44, 30 + y, 4, 2, '#0a0606'); R(g, 38, 30 + y, 2, 1, '#ff6a2a'); R(g, 45, 30 + y, 2, 1, '#ff6a2a');
    R(g, 39, 35 + y, 6, 2, '#3a2018');
    poly(g, [32, 26 + y, 42, 2 + y, 52, 26 + y], '#7a3a2a'); poly(g, [32, 26 + y, 42, 2 + y, 42, 26 + y], '#5a2a1e'); R(g, 41, 6 + y, 2, 20, '#c89a3a'); R(g, 36, 14 + y, 12, 2, '#c89a3a');
    // candles on shoulders
    for (const [x, yy] of [[22, 40], [62, 40], [28, 36], [56, 36]]) { R(g, x - 1, yy + y - 6, 3, 6, '#d8ccb0'); }
  }],
  skeleton: [44, 58, 8, (g, t, p) => {
    const b = Math.round(Math.sin(p * 2) * 1), j = Math.sin(p) * 1.5;
    const bone = '#d8d2c0', boneD = '#a8a290';
    R(g, 15, 42, 3, 12, bone); R(g, 25, 42, 3, 12, bone); R(g, 13, 53, 6, 2, boneD); R(g, 24, 53, 6, 2, boneD);
    R(g, 13, 38 + b, 17, 4, boneD);
    R(g, 21, 22 + b, 2, 17, bone);
    for (let i = 0; i < 4; i++) { R(g, 14, 23 + b + i * 4, 15, 2, bone); }
    R(g, 10, 22 + b, 3, 12, bone); R(g, 31, 22 + b, 3, 12, bone);
    ell(g, 22, 13 + b + j * 0.3, 8, 8, bone); ell(g, 19, 14 + b, 5, 7, boneD);
    R(g, 17, 12 + b, 4, 4, '#0a0a10'); R(g, 23, 12 + b, 4, 4, '#0a0a10'); R(g, 18, 13 + b, 2, 2, '#ff4a3a'); R(g, 24, 13 + b, 2, 2, '#ff4a3a');
    R(g, 18, 19 + b, 8, 2, '#0a0a10'); for (let i = 0; i < 4; i++) R(g, 18 + i * 2, 19 + b, 1, 2, bone);
    poly(g, [13, 9 + b, 22, 3 + b, 31, 9 + b, 31, 12 + b, 13, 12 + b], '#5a5c68'); R(g, 21, 1 + b, 2, 4, '#8a2a2a');
    poly(g, [1, 24 + b, 11, 24 + b, 11, 40 + b, 6, 44 + b, 1, 40 + b], '#5a4434'); R(g, 4, 28 + b, 4, 10, '#7a7a8a'); R(g, 2, 32 + b, 8, 2, '#7a7a8a');
    R(g, 34, 16 + b + j, 2, 22, '#9a9aa8'); R(g, 31, 32 + b + j, 8, 2, '#5a3a22');
  }],
  banshee: [48, 62, 8, (g, t, p) => {
    const y = Math.sin(p) * 2.5;
    for (let i = 0; i < 6; i++) { const x = 8 + i * 6; poly(g, [x, 30 + y, x + 7, 30 + y, x + 3 + Math.sin(p + i) * 3, 58 + y + Math.sin(p * 2 + i) * 3], i % 2 ? '#8a9ab8' : '#a8b8d8'); }
    poly(g, [24, 8 + y, 8, 26 + y, 6, 42 + y, 42, 42 + y, 40, 26 + y], '#b8c8e8');
    poly(g, [24, 8 + y, 8, 26 + y, 6, 42 + y, 18, 42 + y, 18, 24 + y], '#98a8c8');
    ell(g, 24, 18 + y, 8, 9, '#e0e8f8');
    for (let i = 0; i < 5; i++) R(g, 13 + i * 5, 8 + y, 3, 22 + (i % 2) * 6, '#d8e0f0');
    ell(g, 21, 18 + y, 1.8, 3, '#1a2a4a'); ell(g, 27, 18 + y, 1.8, 3, '#1a2a4a'); ell(g, 24, 24 + y, 2, 2.5 + Math.abs(Math.sin(p * 2)), '#1a2a4a');
    for (const x of [21, 27]) { const k = (t * 2) % 1; R(g, x, 21 + y + k * 10, 1, 2, '#7ac8ff'); }
    poly(g, [10, 28 + y, 0, 40 + y, 3, 42 + y, 14, 32 + y], '#c8d4ec'); poly(g, [38, 28 + y, 48, 40 + y, 45, 42 + y, 34, 32 + y], '#c8d4ec');
  }],
  cryptworm: [58, 50, 8, (g, t, p) => {
    for (let i = 7; i >= 0; i--) { const x = 8 + i * 5, y = 34 + Math.sin(p * 2 + i * 0.8) * 4 - i * 2; ell(g, x, y, 7 - i * 0.3, 6 - i * 0.3, i % 2 ? '#b8a8a0' : '#a89890'); R(g, x - 4, y - 1, 8, 1, '#8a7a72'); }
    const hx = 46, hy = 18 + Math.sin(p * 2 + 6) * 3; ell(g, hx, hy, 10, 9, '#c8b8b0');
    const o = 2 + Math.abs(Math.sin(p * 2)) * 3; ell(g, hx + 2, hy + 1, 6, o, '#3a1a1a');
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; R(g, hx + 2 + Math.cos(a) * 5, hy + 1 + Math.sin(a) * (o - 1), 1, 1, '#e8e0d0'); }
    for (const dx of [-5, 8]) R(g, hx + dx, hy - 5, 2, 2, '#ffd23a');
  }],
  tomas: [60, 76, 10, (g, t, p) => {
    const b = Math.round(Math.sin(p) * 1.5);
    // tattered banner pole
    R(g, 46, 4 + b, 2, 66, '#5a4030');
    const w = Math.sin(p * 2) * 2; poly(g, [48, 6 + b, 60, 8 + b + w, 58, 22 + b + w, 54, 18 + b, 50, 26 + b, 48, 26 + b], '#2a3058'); R(g, 52, 12 + b, 3, 6, '#b8b0a0');
    R(g, 20, 50, 6, 20, '#2a2a34'); R(g, 32, 50, 6, 20, '#2a2a34'); R(g, 18, 68, 9, 4, '#1a1a20'); R(g, 31, 68, 9, 4, '#1a1a20');
    poly(g, [16, 28 + b, 42, 28 + b, 40, 52, 18, 52], '#4a4e5a'); poly(g, [16, 28 + b, 28, 28 + b, 28, 52, 18, 52], '#3a3e4a');
    poly(g, [22, 30 + b, 36, 30 + b, 34, 54, 24, 54], '#2a3048'); R(g, 28, 34 + b, 2, 8, '#8a8a7a'); R(g, 25, 37 + b, 8, 2, '#8a8a7a');
    ell(g, 14, 30 + b, 6, 4, '#5a5e6a'); ell(g, 44, 30 + b, 6, 4, '#5a5e6a');
    R(g, 10, 32 + b, 5, 14, '#4a4e5a'); R(g, 43, 32 + b, 5, 12, '#4a4e5a'); R(g, 43, 42 + b, 5, 4, '#8fa894');
    ell(g, 29, 18 + b, 9, 10, '#8fa894'); ell(g, 26, 19 + b, 6, 9, '#7a9280');
    poly(g, [19, 14 + b, 29, 6 + b, 39, 14 + b, 38, 18 + b, 34, 13 + b, 24, 13 + b, 20, 18 + b], '#4a4038');
    R(g, 24, 18 + b, 3, 3, '#0a1410'); R(g, 31, 18 + b, 3, 3, '#0a1410');
    const gl = 0.6 + 0.4 * Math.sin(p * 3); g.globalAlpha = gl; R(g, 24, 18 + b, 3, 2, '#9fffd0'); R(g, 31, 18 + b, 3, 2, '#9fffd0'); g.globalAlpha = 1;
    R(g, 26, 24 + b, 6, 1, '#2a3a30'); line(g, 22, 22 + b, 23, 26 + b, '#5a7060', 1);
    for (let i = 0; i < 3; i++) { g.globalAlpha = 0.5; circ(g, 12 + i * 16 + Math.sin(p + i) * 3, 60 - ((t + i / 3) % 1) * 40, 1.5, '#9fffd0'); } g.globalAlpha = 1;
  }],
  raven: [54, 46, 8, (g, t, p) => {
    const f = Math.sin(p * 2) * 8, y = Math.sin(p * 2 + 1.5) * 2;
    poly(g, [26, 20 + y, 2, 10 + f, 6, 18 + f, 2, 22 + f * 0.6, 22, 28 + y], '#1a1a24'); poly(g, [28, 20 + y, 52, 10 + f, 48, 18 + f, 52, 22 + f * 0.6, 32, 28 + y], '#22222e');
    ell(g, 27, 26 + y, 9, 11, '#22222e'); ell(g, 25, 27 + y, 6, 9, '#1a1a24');
    poly(g, [21, 34 + y, 27, 44 + y, 33, 34 + y], '#1a1a24');
    ell(g, 27, 14 + y, 7, 7, '#d8d2c0'); poly(g, [24, 17 + y, 27, 27 + y, 30, 17 + y], '#c8c2b0');
    R(g, 23, 12 + y, 3, 3, '#0a0a10'); R(g, 28, 12 + y, 3, 3, '#0a0a10'); R(g, 24, 13 + y, 1, 1, '#ff3a3a'); R(g, 29, 13 + y, 1, 1, '#ff3a3a');
    R(g, 23, 36 + y, 1, 4, '#8a7a3a'); R(g, 30, 36 + y, 1, 4, '#8a7a3a');
  }],
  blackguard: [52, 66, 8, (g, t, p) => {
    const b = Math.round(Math.sin(p) * 1.2);
    poly(g, [8, 26 + b, 4, 60, 20, 62, 26, 30 + b], '#3a1a1a');
    R(g, 16, 46, 7, 16, '#2a2a30'); R(g, 28, 46, 7, 16, '#2a2a30'); R(g, 14, 60, 10, 4, '#18181c'); R(g, 27, 60, 10, 4, '#18181c');
    poly(g, [13, 24 + b, 39, 24 + b, 37, 48, 15, 48], '#3a3a44'); poly(g, [13, 24 + b, 25, 24 + b, 25, 48, 15, 48], '#2a2a32');
    R(g, 15, 38 + b, 22, 2, '#5a1a1a');
    ell(g, 11, 26 + b, 7, 5, '#4a4a56'); ell(g, 41, 26 + b, 7, 5, '#4a4a56'); for (const x of [6, 46]) poly(g, [x, 22 + b, x + (x < 20 ? -2 : 2), 15 + b, x + (x < 20 ? 3 : -3), 22 + b], '#4a4a56');
    R(g, 17, 6 + b, 18, 18, '#3e3e48'); R(g, 17, 6 + b, 5, 18, '#2e2e36'); poly(g, [17, 6 + b, 26, 1 + b, 35, 6 + b], '#3e3e48');
    R(g, 19, 13 + b, 14, 2, '#0a0606'); const gl = 0.6 + 0.4 * Math.sin(p * 3); g.globalAlpha = gl; R(g, 24, 13 + b, 4, 2, '#ff2a1a'); g.globalAlpha = 1;
    poly(g, [0, 30 + b, 12, 30 + b, 12, 46 + b, 6, 52 + b, 0, 46 + b], '#4a4450'); line(g, 2, 32 + b, 10, 48 + b, '#1a1a20', 1.5); R(g, 4, 34 + b, 2, 4, '#5a1a1a');
    R(g, 42, 2 + b, 3, 44, '#6a6a78'); R(g, 42, 2 + b, 1, 44, '#9a9aa8'); poly(g, [40, 4 + b, 43.5, -4 + b, 47, 4 + b], '#8a8a98'); R(g, 38, 44 + b, 11, 2, '#3a2a1a');
  }],
  gareth: [92, 104, 10, (g, t, p) => {
    const b = Math.round(Math.sin(p) * 1.5);
    // wings of light (tattered)
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) { const x0 = 46 + s * 10, a = -0.6 - i * 0.28 + Math.sin(p + i) * 0.05; const l = 30 + i * 3; g.globalAlpha = 0.85 - i * 0.12; poly(g, [x0, 30 + b, x0 + s * Math.cos(a) * l, 30 + b + Math.sin(a) * l * 0.9 + i * 6, x0 + s * Math.cos(a) * l * 0.8, 36 + b + Math.sin(a) * l * 0.6 + i * 8], i % 2 ? '#c8c0a8' : '#e8e0c8'); } g.globalAlpha = 1;
    // cape
    poly(g, [30, 34 + b, 62, 34 + b, 70, 98, 22, 98], '#5a1a1a'); for (let i = 0; i < 6; i++) poly(g, [22 + i * 8, 97, 30 + i * 8, 97, 26 + i * 8, 102 + (i % 2) * 2], '#5a1a1a');
    // legs
    R(g, 34, 70, 9, 26, '#6a5e40'); R(g, 49, 70, 9, 26, '#5a5034'); R(g, 32, 94, 12, 5, '#3a3428'); R(g, 48, 94, 12, 5, '#3a3428');
    // torso
    poly(g, [30, 36 + b, 62, 36 + b, 60, 72, 32, 72], '#a8925a'); poly(g, [30, 36 + b, 46, 36 + b, 46, 72, 32, 72], '#8a7648');
    R(g, 43, 42 + b, 6, 18, '#e8e0d0'); R(g, 38, 48 + b, 16, 5, '#e8e0d0');
    line(g, 36, 40 + b, 42, 58 + b, '#1a1010', 1.5); line(g, 54, 44 + b, 50, 66 + b, '#1a1010', 1.5); line(g, 42, 58 + b, 46, 64 + b, '#1a1010', 1);
    R(g, 32, 64 + b, 28, 3, '#5a4a2a');
    ell(g, 28, 38 + b, 9, 7, '#c8b27a'); ell(g, 64, 38 + b, 9, 7, '#c8b27a'); ell(g, 26, 37 + b, 5, 3, '#e8d8a0');
    R(g, 20, 40 + b, 7, 20, '#a8925a'); R(g, 65, 40 + b, 7, 18, '#a8925a');
    // greatsword
    const sw = Math.sin(p) * 1; R(g, 72, 4 + b + sw, 4, 70, '#d8d8e8'); R(g, 72, 4 + b + sw, 1, 70, '#ffffff'); R(g, 75, 4 + b + sw, 1, 70, '#9a9aa8'); poly(g, [72, 4 + b + sw, 74, -2 + b + sw, 76, 4 + b + sw], '#e8e8f0');
    R(g, 64, 56 + b + sw, 20, 4, '#8a7a4a'); R(g, 72, 60 + b + sw, 4, 10, '#4a2a1a'); circ(g, 74, 72 + b + sw, 3, '#c8a84a');
    // helmet
    R(g, 36, 12 + b, 20, 22, '#c8b27a'); R(g, 36, 12 + b, 6, 22, '#a08a5a'); poly(g, [36, 12 + b, 46, 6 + b, 56, 12 + b], '#d8c28a');
    poly(g, [36, 18 + b, 26, 6 + b, 32, 20 + b], '#e8d8a0'); poly(g, [56, 18 + b, 66, 6 + b, 60, 20 + b], '#e8d8a0');
    R(g, 38, 20 + b, 16, 3, '#0a0606'); R(g, 45, 20 + b, 2, 12, '#0a0606');
    const gl = 0.6 + 0.4 * Math.sin(p * 3); g.globalAlpha = gl; R(g, 39, 20 + b, 4, 2, '#ff4a2a'); R(g, 49, 20 + b, 4, 2, '#ff4a2a'); g.globalAlpha = 1;
    line(g, 50, 13 + b, 53, 22 + b, '#1a1010', 1);
  }],
  moth: [64, 46, 8, (g, t, p) => {
    const f = Math.abs(Math.sin(p * 2)), y = Math.sin(p * 2) * 2;
    for (const s of [-1, 1]) {
      const wx = 32 + s * (4 + 20 * (0.4 + 0.6 * f));
      poly(g, [32, 18 + y, wx, 4 + y, 32 + s * 28 * (0.4 + 0.6 * f), 20 + y, 32 + s * 4, 26 + y], '#c8c4d8');
      poly(g, [32, 22 + y, 32 + s * 22 * (0.4 + 0.6 * f), 26 + y, 32 + s * 16 * (0.4 + 0.6 * f), 40 + y, 32 + s * 3, 30 + y], '#a8a4c0');
      circ(g, 32 + s * 14 * (0.4 + 0.6 * f), 14 + y, 3, '#5a6aa8'); circ(g, 32 + s * 14 * (0.4 + 0.6 * f) + s, 13 + y, 2, '#c8d8ff');
    }
    ell(g, 32, 24 + y, 3.5, 11, '#8a84a0'); ell(g, 32, 14 + y, 4, 4, '#d8d4e8');
    R(g, 30, 13 + y, 1, 2, '#1a1a3a'); R(g, 33, 13 + y, 1, 2, '#1a1a3a');
    line(g, 31, 11 + y, 27, 3 + y, '#c8c4d8', 1); line(g, 33, 11 + y, 37, 3 + y, '#c8c4d8', 1);
    for (let i = 0; i < 4; i++) { const k = (t + i / 4) % 1; g.globalAlpha = 1 - k; R(g, 20 + i * 8, 34 + k * 10, 1, 1, '#e8e8ff'); } g.globalAlpha = 1;
  }],
  drowned: [44, 60, 8, (g, t, p) => {
    const b = Math.round(Math.sin(p) * 1.5), sw = Math.sin(p) * 2;
    R(g, 14, 44, 6, 14, '#3a5a6a'); R(g, 24, 44, 6, 14, '#34505e');
    ell(g, 22, 34 + b, 12, 14, '#4a6a7a'); ell(g, 19, 35 + b, 8, 12, '#3e5a6a');
    poly(g, [10, 28 + b, 2 + sw, 46 + b, 6 + sw, 48 + b, 14, 34 + b], '#4a6a7a'); poly(g, [34, 28 + b, 42 - sw, 44 + b, 38 - sw, 46 + b, 30, 34 + b], '#4a6a7a');
    ell(g, 22, 15 + b, 9, 9, '#6a8a92'); ell(g, 19, 16 + b, 6, 8, '#5a7a82');
    circ(g, 18, 15 + b, 2.5, '#d8e8e0'); circ(g, 26, 15 + b, 2.5, '#d8e8e0'); R(g, 18, 15 + b, 1, 1, '#1a2a2a'); R(g, 26, 15 + b, 1, 1, '#1a2a2a');
    ell(g, 22, 21 + b, 3, 2, '#1a2a30');
    for (let i = 0; i < 6; i++) { const x = 13 + i * 3.5; line(g, x, 8 + b, x + Math.sin(p + i) * 2, 26 + b + (i % 3) * 4, '#2a4a2a', 1.5); }
    for (let i = 0; i < 3; i++) { const k = (t * 1.5 + i / 3) % 1; R(g, 12 + i * 10, 30 + b + k * 26, 1, 2, '#7ab8d8'); }
  }],
  shade: [44, 56, 8, (g, t, p) => {
    const y = Math.sin(p) * 2;
    g.globalAlpha = 0.9;
    poly(g, [22, 4 + y, 6, 24 + y, 4, 52, 40, 52, 38, 24 + y], '#1a1a2e');
    for (let i = 0; i < 5; i++) poly(g, [4 + i * 8, 50, 12 + i * 8, 50, 8 + i * 8 + Math.sin(p * 2 + i) * 2, 56], '#1a1a2e');
    g.globalAlpha = 1;
    ell(g, 22, 18 + y, 9, 9, '#2a2a44');
    R(g, 16, 18 + y, 4, 1, '#c8c8ff'); R(g, 25, 18 + y, 4, 1, '#c8c8ff');
    for (let i = 0; i < 3; i++) { const k = (t + i / 3) % 1; g.globalAlpha = 1 - k; setFontless(g, 30 + i * 3, 10 + y - k * 10, 3); } g.globalAlpha = 1;
  }],
  king: [124, 124, 12, (g, t, p) => {
    const y = Math.round(Math.sin(p) * 2);
    // seal circle behind
    g.strokeStyle = '#3a4a7a'; g.lineWidth = 1.5; g.beginPath(); g.arc(62, 50, 50, 0, 6.283); g.stroke();
    g.beginPath(); g.arc(62, 50, 42, 0, 6.283); g.stroke();
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + p * 0.1; R(g, 62 + Math.cos(a) * 46 - 1.5, 50 + Math.sin(a) * 46 - 1.5, 3, 3, i % 2 ? '#6a8aca' : '#9fd0ff'); }
    // robe
    poly(g, [62, 40 + y, 30, 56 + y, 18, 122, 106, 122, 94, 56 + y], '#3a3a4a'); poly(g, [62, 40 + y, 30, 56 + y, 18, 122, 50, 122, 56, 56 + y], '#2a2a38');
    for (let i = 0; i < 8; i++) poly(g, [18 + i * 11, 120, 29 + i * 11, 120, 23 + i * 11 + Math.sin(p + i) * 2, 124], '#2a2a38');
    R(g, 58, 52 + y, 8, 66, '#6a6a7a'); for (let k = 0; k < 6; k++) circ(g, 62, 58 + k * 10 + y, 2, '#9fd0ff');
    ell(g, 32, 56 + y, 12, 8, '#4a4a5a'); ell(g, 92, 56 + y, 12, 8, '#4a4a5a');
    // skeletal hands
    for (const [x, s] of [[16, -1], [108, 1]]) { R(g, x - 3, 62 + y, 6, 26, '#3a3a4a'); for (let f2 = 0; f2 < 4; f2++) R(g, x - 3 + f2 * 2, 88 + y, 1, 6 + Math.sin(p * 2 + f2) * 1, '#c8c8c0'); }
    // head
    ell(g, 62, 34 + y, 13, 14, '#b8b8b0'); ell(g, 58, 35 + y, 9, 12, '#9a9a92');
    R(g, 54, 31 + y, 6, 5, '#0a0a12'); R(g, 65, 31 + y, 6, 5, '#0a0a12');
    const gl = 0.7 + 0.3 * Math.sin(p * 2); g.globalAlpha = gl; R(g, 56, 32 + y, 3, 3, '#e8f4ff'); R(g, 67, 32 + y, 3, 3, '#e8f4ff'); g.globalAlpha = 1;
    R(g, 61, 37 + y, 3, 3, '#3a3a40');
    poly(g, [50, 40 + y, 74, 40 + y, 70, 62 + y, 62, 68 + y, 54, 62 + y], '#d8d8d8'); poly(g, [56, 42 + y, 68, 42 + y, 66, 58 + y, 58, 58 + y], '#e8e8e8');
    R(g, 56, 41 + y, 12, 2, '#2a2a30');
    // crown
    R(g, 48, 18 + y, 28, 7, '#7a7a86'); R(g, 48, 18 + y, 28, 1, '#c8c8d4');
    for (let i = 0; i < 5; i++) poly(g, [48 + i * 6, 18 + y, 51 + i * 6, 6 + y + (i === 2 ? -4 : 0), 54 + i * 6, 18 + y], '#8a8a96');
    circ(g, 62, 21 + y, 2.5, '#9fd0ff');
    // floating crown shards
    for (let i = 0; i < 6; i++) { const a = p + i * 1.047; const rx = 62 + Math.cos(a) * 30, ry = 20 + y + Math.sin(a) * 8; poly(g, [rx, ry - 4, rx + 2, ry, rx, ry + 4, rx - 2, ry], Math.sin(a) > 0 ? '#9a9aa6' : '#6a6a76'); }
  }],
};
function setFontless(g, x, y, s) { // tiny "z"
  R(g, x, y, s, 1, '#9a9ac8'); R(g, x + s - 1, y + 1, 1, 1, '#9a9ac8'); R(g, x, y + 2, 1, 1, '#9a9ac8'); R(g, x, y + s - 1, s, 1, '#9a9ac8');
}
const MSPR = {}, MSPR_S = {};
function makeMonsters() {
  for (const id in MDRAW) {
    const [w, h, n, fn] = MDRAW[id];
    MSPR[id] = []; MSPR_S[id] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      MSPR[id].push(pixelize(mk(w, h, g => fn(g, t, t * 6.2832))));
      const s = id === 'king' || id === 'bishop' || id === 'gareth' ? 0.42 : 0.5;
      const sw = Math.ceil(w * s) + 2, sh = Math.ceil(h * s) + 2;
      MSPR_S[id].push(pixelize(mk(sw, sh, g => { g.translate(1, 1); g.scale(s, s); fn(g, t, t * 6.2832); })));
    }
  }
}
function mframe(id, t, small) { const arr = (small ? MSPR_S : MSPR)[id]; return arr[Math.floor(((t % 1) + 1) % 1 * arr.length) % arr.length]; }

// ================= KNIGHT BATTLE SPRITE =================
const KCACHE = {};
function knight(pose, t, f2 = 0) {
  const fi = Math.floor((t % 1) * 8);
  const key = pose + fi + '_' + Math.round(f2 * 10);
  if (KCACHE[key]) return KCACHE[key];
  const p = fi / 8 * 6.2832;
  const c = pixelize(mk(56, 56, g => {
    let bob = Math.round(Math.sin(p) * 1), lean = 0, kneel = 0, swA = -0.9, shieldUp = 0, head = 0;
    if (pose === 'attack') { swA = -2.2 + f2 * 3.4; lean = f2 > 0.4 ? 3 : -2; bob = 0; }
    if (pose === 'hurt') { lean = -4; swA = 0.4; bob = 1; }
    if (pose === 'defend') { shieldUp = 1; swA = 0.6; }
    if (pose === 'pray') { kneel = 1; swA = 1.57; head = 2; }
    if (pose === 'down') { kneel = 2; swA = 1.4; head = 4; lean = 2; }
    if (pose === 'win') { swA = -1.57 - 0.1; bob = 0; }
    if (pose === 'item') { swA = 0.5; }
    const X = 18 + lean, Y = 10 + bob + kneel * 5;
    const st = '#b4bacb', stD = '#7a8096', stDD = '#4a4e60', stL = '#dfe3ee';
    // cape
    const fl = Math.sin(p + 1) * 2;
    poly(g, [X + 4, Y + 16, X - 6 + fl, Y + 38 - kneel * 3, X + 2, Y + 40 - kneel * 3, X + 12, Y + 18], '#5e141c');
    poly(g, [X + 4, Y + 16, X - 3 + fl, Y + 36 - kneel * 3, X + 8, Y + 18], '#7a1c26');
    // back leg / legs
    if (kneel) { R(g, X + 4, Y + 32, 12, 5, stDD); R(g, X + 14, Y + 28, 5, 10, stD); R(g, X + 12, Y + 36, 9, 3, '#22222c'); R(g, X + 2, Y + 35, 6, 3, '#22222c'); }
    else { R(g, X + 6, Y + 30, 5, 12, stDD); R(g, X + 13, Y + 30, 5, 12, stD); R(g, X + 5, Y + 40, 7, 3, '#22222c'); R(g, X + 12, Y + 40, 8, 3, '#22222c'); R(g, X + 13, Y + 34, 5, 1, stL); }
    // torso
    poly(g, [X + 4, Y + 14, X + 20, Y + 14, X + 19, Y + 31, X + 5, Y + 31], st);
    poly(g, [X + 4, Y + 14, X + 10, Y + 14, X + 10, Y + 31, X + 5, Y + 31], stD);
    R(g, X + 5, Y + 26, 15, 2, '#3a2a1e'); R(g, X + 11, Y + 26, 3, 2, '#c8a84a');
    R(g, X + 12, Y + 16, 6, 1, stL); R(g, X + 14, Y + 18, 1, 6, stD);
    ell(g, X + 17, Y + 15, 5, 3.5, stL);
    // head
    const hx = X + 6 + (head > 2 ? 3 : 0), hy = Y + 1 + head;
    R(g, hx, hy, 13, 13, st); R(g, hx, hy, 4, 13, stD); poly(g, [hx, hy, hx + 6, hy - 3, hx + 13, hy], st); R(g, hx + 10, hy + 1, 2, 5, stL);
    R(g, hx + 7, hy + 6, 7, 2, '#0b0a12'); R(g, hx + 11, hy + 5, 2, 1, '#8fd8ff'); R(g, hx + 9, hy + 8, 1, 4, '#0b0a12');
    const pf = Math.sin(p * 2) * 1.5; poly(g, [hx + 5, hy - 2, hx - 6, hy + 2 + pf, hx - 3, hy + 6 + pf, hx + 6, hy + 1], '#a3242f'); poly(g, [hx + 5, hy - 2, hx - 4, hy + 1 + pf, hx + 5, hy + 1], '#c8303c');
    // shield (back arm)
    if (shieldUp) { poly(g, [X + 20, Y + 10, X + 30, Y + 10, X + 30, Y + 28, X + 25, Y + 33, X + 20, Y + 28], '#4a4e60'); poly(g, [X + 21, Y + 11, X + 29, Y + 11, X + 29, Y + 27, X + 25, Y + 31, X + 21, Y + 27], '#6a2030'); R(g, X + 24, Y + 13, 2, 14, '#c8c0a0'); R(g, X + 22, Y + 17, 6, 2, '#c8c0a0'); }
    else { poly(g, [X + 1, Y + 16, X + 9, Y + 16, X + 9, Y + 29, X + 5, Y + 33, X + 1, Y + 29], '#4a4e60'); poly(g, [X + 2, Y + 17, X + 8, Y + 17, X + 8, Y + 28, X + 5, Y + 31, X + 2, Y + 28], '#6a2030'); R(g, X + 4, Y + 19, 2, 9, '#c8c0a0'); R(g, X + 2.5, Y + 22, 5, 1.5, '#c8c0a0'); }
    // sword arm
    const sx = X + 17, sy = Y + 20;
    R(g, sx - 2, sy - 4, 4, 8, stD);
    const ca = Math.cos(swA), sa = Math.sin(swA);
    g.save(); g.translate(sx, sy); g.rotate(swA);
    R(g, -1, -2, 6, 4, '#5e6274'); // hand
    R(g, 4, -4, 2, 8, '#8a6a3a'); R(g, 6, -1, 22, 3, '#d8dce8'); R(g, 6, -1, 22, 1, '#ffffff'); poly(g, [28, -1, 31, 0.5, 28, 2], '#d8dce8');
    R(g, 1, -0.5, 3, 1.5, '#4a2a1a');
    g.restore();
  }));
  KCACHE[key] = c; return c;
}
