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
  tomas: [80, 92, 12, (g, t, p) => {
    const b = Math.round(Math.sin(p) * 1.4), w1 = Math.sin(p) * 3, w2 = Math.sin(p * 2 + 1) * 2.5, gl = 0.65 + 0.35 * Math.sin(p * 2);
    const steel = '#5c606e', steelD = '#3c3f4c', steelL = '#8a8fa2', rust = '#7a4a2e', blue = '#26327a', blueD = '#171e4c', bone = '#d8d2bc', boneD = '#a8a28c', teal = '#9fffd0';
    // pale-moon halo behind him
    g.globalAlpha = 0.16 + 0.06 * Math.sin(p); g.fillStyle = '#9fc8ff'; g.beginPath(); g.arc(38, 40 + b, 36, 0, 6.2832); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1; g.beginPath(); g.arc(50, 34 + b, 33, 0, 6.2832); g.fill(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    // tattered cape
    poly(g, [24, 34 + b, 56, 34 + b, 66 + w1, 76, 62 + w2, 84, 57 + w1, 78, 51 + w2, 88, 45 + w1, 80, 39 + w2, 87, 33 + w1, 79, 27 + w2, 86, 22 + w1, 78, 14 + w2, 82, 12 + w1, 70], blueD);
    poly(g, [28, 36 + b, 40, 36 + b, 38 + w1, 84, 31 + w2, 80, 25 + w1, 70], blue);
    for (const x of [20, 30, 50, 58]) R(g, x + w1 * (x > 40 ? 0.8 : 0.4), 52 + b, 1, 22, '#0f1436');
    // legs: rusted greaves, bare shin bone
    for (const lx of [28, 43]) {
      R(g, lx, 70, 9, 15, steelD); R(g, lx + 1, 74, 7, 5, bone); R(g, lx + 3, 74, 1, 5, boneD); R(g, lx + 5, 75, 1, 4, boneD);
      R(g, lx - 1, 69, 11, 4, steel); R(g, lx - 1, 69, 11, 1, steelL); R(g, lx, 80, 9, 5, steel); R(g, lx - 2, 84, 13, 6, '#22222c'); R(g, lx - 2, 84, 13, 1, '#3a3a46');
    }
    // tassets / hips
    poly(g, [25, 60 + b, 55, 60 + b, 58, 72, 22, 72], steelD); for (let i = 0; i < 4; i++) { R(g, 24 + i * 8, 62 + b, 7, 9, i % 2 ? steel : steelD); R(g, 24 + i * 8, 62 + b, 7, 1, steelL); }
    R(g, 24, 58 + b, 32, 3, '#4a3020'); R(g, 38, 57 + b, 4, 5, '#c8a84a'); R(g, 39, 58 + b, 2, 3, '#7a5a1a');
    // hanging chain & pouch
    for (let i = 0; i < 5; i++) R(g, 54 + Math.sin(p + i) * 0.6, 60 + i * 3, 2, 2, '#8a8fa2'); R(g, 53, 74, 5, 4, '#4a3020');
    // torso: rusty breastplate
    poly(g, [24, 36 + b, 56, 36 + b, 54, 61 + b, 26, 61 + b], steel); poly(g, [24, 36 + b, 36, 36 + b, 36, 61 + b, 26, 61 + b], steelD);
    R(g, 24, 36 + b, 32, 2, steelL); for (const [x, y] of [[28, 40], [51, 40], [29, 56], [50, 56]]) R(g, x, y + b, 2, 2, '#b8bccc');
    for (const [x, y, wd] of [[30, 46, 5], [46, 52, 6], [28, 53, 4]]) R(g, x, y + b, wd, 2, rust);
    // crescent crest on plate
    g.strokeStyle = '#cfd4e0'; g.lineWidth = 2; g.beginPath(); g.arc(47, 45 + b, 5, 1.2, 5.1); g.stroke();
    // broken chest hole: ribs + soul fire
    poly(g, [33, 43 + b, 43, 42 + b, 45, 50 + b, 42, 58 + b, 34, 57 + b, 31, 50 + b], '#0b0f12');
    g.globalAlpha = gl * 0.8; ell(g, 38, 50 + b, 5, 6, '#2fd8a0'); g.globalAlpha = 1;
    for (let i = 0; i < 3; i++) R(g, 33 + (i % 2), 45 + i * 4 + b, 10 - (i % 2) * 2, 1, bone); R(g, 38, 44 + b, 1, 13, boneD);
    // scarf (faded red favor) with fluttering tails
    poly(g, [33, 34 + b, 47, 34 + b, 46, 39 + b, 34, 39 + b], '#8a2a34'); R(g, 33, 34 + b, 14, 1, '#b84a54');
    poly(g, [36, 38 + b, 41, 39 + b, 30 + w2, 54 + b, 25 + w2, 53 + b], '#8a2a34'); poly(g, [41, 38 + b, 45, 38 + b, 50 + w2 * 0.6, 50 + b, 46 + w2 * 0.6, 52 + b], '#6a1e28');
    // tabard front (torn)
    poly(g, [33, 60 + b, 47, 60 + b, 49, 78 + w1 * 0.3, 44, 73, 40, 80, 36, 73, 31, 78], blue); R(g, 39, 62 + b, 2, 12, '#d8d0b0'); R(g, 36, 66 + b, 8, 2, '#d8d0b0');
    // shield arm (left)
    R(g, 14, 36 + b, 12, 7, steel); ell(g, 20, 38 + b, 9, 6, steel); R(g, 12, 36 + b, 4, 4, steelL); poly(g, [8, 36 + b, 12, 32 + b, 14, 38 + b], steelD);
    R(g, 14, 42 + b, 6, 8, boneD); R(g, 15, 42 + b, 4, 8, steelD);
    // dented moon shield
    poly(g, [0, 40 + b, 22, 40 + b, 22, 58 + b, 11, 76 + b, 0, 58 + b], '#2a3a78'); poly(g, [0, 40 + b, 11, 40 + b, 11, 76 + b, 0, 58 + b], '#1c2858');
    R(g, 0, 40 + b, 22, 2, steelL); R(g, 0, 40 + b, 2, 18, steelL); R(g, 20, 40 + b, 2, 18, steel);
    g.strokeStyle = '#d8dcec'; g.lineWidth = 2.4; g.beginPath(); g.arc(12, 56 + b, 6, 0.9, 5.4); g.stroke(); line(g, 4, 46 + b, 9, 54 + b, '#10163a', 1); line(g, 15, 66 + b, 18, 60 + b, '#10163a', 1);
    // right arm raised, holding banner-spear
    ell(g, 58, 38 + b, 7, 6, steel); R(g, 54, 34 + b, 8, 2, steelL); R(g, 56, 41 + b, 6, 8, steelD); R(g, 60, 48 + b, 6, 8, boneD); R(g, 61, 54 + b, 6, 6, '#4a4e5a'); R(g, 61, 52 + b, 6, 2, steelL);
    R(g, 64, 4, 2, 86, '#5a4030'); R(g, 64, 4, 1, 86, '#7a5a40'); poly(g, [63, 10, 67, 10, 65, 0], '#c8ccd8'); R(g, 64, 10, 2, 2, '#8a8fa2');
    // pennant: swallowtail, tattered, with moon
    const fl = Math.sin(p * 2) * 2.5, fl2 = Math.sin(p * 2 + 1.4) * 2;
    poly(g, [66, 13, 78 + fl * 0.4, 14 + fl, 74 + fl, 20 + fl2, 79 + fl * 0.4, 28 + fl2, 66, 29], blue); poly(g, [66, 13, 73, 14, 73, 28, 66, 29], blueD);
    g.strokeStyle = '#d8dcec'; g.lineWidth = 1.4; g.beginPath(); g.arc(70, 21, 3, 1.1, 5.3); g.stroke();
    R(g, 75 + fl, 22 + fl2, 1, 1, '#000'); R(g, 72 + fl * 0.5, 26 + fl2, 1, 1, '#000');
    // head: cracked kettle helm over skull
    R(g, 34, 31 + b, 12, 5, boneD);
    ell(g, 40, 23 + b, 9.5, 11, '#a8bcae'); ell(g, 36, 25 + b, 6, 9, '#8ea494');
    R(g, 35, 33 + b, 10, 3, bone); for (let i = 0; i < 5; i++) R(g, 35 + i * 2, 33 + b, 1, 3, '#2a3a30');
    ell(g, 40, 28 + b, 1.2, 2, '#1a2a22'); // nose hole
    poly(g, [31, 14 + b, 40, 5 + b, 49, 14 + b, 48, 20 + b, 32, 20 + b], steel); poly(g, [31, 14 + b, 40, 5 + b, 40, 20 + b, 32, 20 + b], steelD);
    R(g, 28, 18 + b, 24, 3, steel); R(g, 28, 18 + b, 24, 1, steelL); R(g, 29, 20 + b, 3, 12, steelD); R(g, 48, 20 + b, 3, 10, steel);
    line(g, 38, 6 + b, 41, 14 + b, '#14161c', 1); line(g, 41, 14 + b, 39, 19 + b, '#14161c', 1);
    R(g, 39, 4 + b, 2, 16, steelL); // nasal bar
    poly(g, [29, 22 + b, 33, 22 + b, 31, 31 + b], '#2a2420'); poly(g, [47, 22 + b, 51, 22 + b, 50, 30 + b], '#2a2420'); // hair tufts
    // glowing eyes + soul-fire trails
    R(g, 34, 23 + b, 4, 4, '#0a1410'); R(g, 43, 23 + b, 4, 4, '#0a1410');
    g.globalAlpha = gl; R(g, 35, 24 + b, 3, 3, teal); R(g, 43, 24 + b, 3, 3, teal); g.globalAlpha = 1;
    for (const ex of [36, 45]) for (let i = 0; i < 3; i++) { const k = (t * 2 + i / 3) % 1; g.globalAlpha = (1 - k) * 0.7; ell(g, ex + Math.sin(p + i + ex) * 1.5, 22 + b - k * 14, 1.6 - k, 2.4 - k, teal); } g.globalAlpha = 1;
    line(g, 44, 28 + b, 46, 33 + b, '#5a7060', 1);
    // rising soul motes
    for (let i = 0; i < 5; i++) { g.globalAlpha = 0.55; const k = (t + i / 5) % 1; circ(g, 12 + i * 14 + Math.sin(p + i) * 3, 88 - k * 62, 1.3, teal); } g.globalAlpha = 1;
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
  blackguard: [68, 86, 12, (g, t, p) => {
    const b = Math.round(Math.sin(p) * 1.3), w1 = Math.sin(p) * 3, w2 = Math.sin(p * 2 + 0.8) * 2.5, gl = 0.6 + 0.4 * Math.sin(p * 2);
    const pl = '#3a3a46', plD = '#262630', plL = '#5e5e6e', blk = '#18181e', red = '#ff3a2a', redD = '#8a1a22', met = '#8a8a9a';
    // ground mist of red light
    g.globalAlpha = 0.22 * gl + 0.1; ell(g, 34, 82, 26, 5, red); g.globalAlpha = 1;
    // tattered cape
    poly(g, [20, 34 + b, 50, 34 + b, 60 + w1, 74, 55 + w2, 80, 50 + w1, 74, 44 + w2, 83, 38 + w1, 75, 32 + w2, 84, 26 + w1, 76, 20 + w2, 82, 14 + w1, 74, 10 + w2, 68], '#2a0e12');
    poly(g, [26, 36 + b, 40, 36 + b, 38 + w1, 84, 30 + w2, 78, 22 + w1, 70], '#4a1418'); for (const x of [18, 48, 55]) R(g, x + w1 * 0.6, 52 + b, 1, 20, '#1a080a');
    // legs: plate, knee spikes, sabatons
    for (const lx of [23, 37]) {
      R(g, lx, 62, 9, 16, plD); R(g, lx, 62, 3, 16, blk); R(g, lx + 6, 63, 1, 14, plL);
      poly(g, [lx - 1, 63, lx + 4, 59, lx + 9, 63], met); R(g, lx - 1, 66, 11, 3, pl); R(g, lx - 1, 66, 11, 1, plL);
      poly(g, [lx - 2, 79, lx + 13, 79, lx + 15, 84, lx - 2, 84], blk); R(g, lx - 2, 79, 14, 1, '#3a3a46');
      g.globalAlpha = gl * 0.7; line(g, lx + 3, 69, lx + 5, 74, red, 1); g.globalAlpha = 1;
    }
    // faulds
    poly(g, [20, 56 + b, 48, 56 + b, 51, 66, 17, 66], plD); for (let k = 0; k < 4; k++) { R(g, 19 + k * 8, 58 + b, 7, 8, k % 2 ? pl : plD); R(g, 19 + k * 8, 58 + b, 7, 1, plL); }
    R(g, 19, 54 + b, 30, 3, '#3a1a1a'); R(g, 31, 53 + b, 6, 5, '#8a7a3a'); R(g, 32, 54 + b, 4, 3, '#5a4a1a');
    // dangling chains
    for (let k = 0; k < 6; k++) { R(g, 18 + Math.sin(p + k * 0.7) * 1, 56 + k * 3, 2, 2, met); R(g, 49 + Math.sin(p + k * 0.7 + 1) * 1, 56 + k * 3, 2, 2, met); }
    // cuirass with oath inscription and glowing broken heart
    poly(g, [18, 34 + b, 50, 34 + b, 48, 56 + b, 20, 56 + b], pl); poly(g, [18, 34 + b, 32, 34 + b, 32, 56 + b, 20, 56 + b], plD);
    R(g, 18, 34 + b, 32, 2, plL); for (const [x, y] of [[22, 38], [46, 38], [23, 52], [45, 52]]) R(g, x, y + b, 2, 2, '#b8b8c8');
    for (let k = 0; k < 4; k++) { R(g, 22 + k * 7, 49 + b, 4, 1, '#1a1a22'); R(g, 23 + k * 7, 51 + b, 3, 1, '#1a1a22'); }
    g.globalAlpha = gl * 0.5; circ(g, 34, 43 + b, 8, red); g.globalAlpha = 1;
    poly(g, [29, 40 + b, 34, 38 + b, 39, 40 + b, 38, 46 + b, 34, 50 + b, 30, 46 + b], '#0a0406');
    g.globalAlpha = 0.5 + gl * 0.5; poly(g, [30, 41 + b, 34, 40 + b, 38, 41 + b, 37, 45 + b, 34, 48 + b, 31, 45 + b], red); g.globalAlpha = 1; line(g, 34, 39 + b, 33, 44 + b, '#0a0406', 1); line(g, 33, 44 + b, 35, 48 + b, '#0a0406', 1);
    g.globalAlpha = gl * 0.8; line(g, 26, 36 + b, 30, 41 + b, red, 1); line(g, 41, 40 + b, 46, 35 + b, red, 1); line(g, 39, 47 + b, 43, 54 + b, red, 1); g.globalAlpha = 1;
    // spiked pauldrons
    for (const [cx, s] of [[16, -1], [52, 1]]) { ell(g, cx, 37 + b, 8, 6, pl); ell(g, cx + s * -1, 35 + b, 6, 3, plL); for (let k = 0; k < 3; k++) poly(g, [cx + s * (k * 3 - 2), 33 + b, cx + s * (k * 3 - 2) + s * 3, 26 + b - k * 2, cx + s * (k * 3 - 2) + s * 5, 34 + b], met); }
    // shackled arms: left (shield), right (broken sword)
    R(g, 8, 42 + b, 6, 10, plD); R(g, 7, 52 + b, 8, 4, met); R(g, 54, 42 + b, 6, 10, plD); R(g, 54, 51 + b, 8, 4, met);
    for (let k = 0; k < 5; k++) R(g, 58 + Math.sin(p + k) * 1.2, 55 + b + k * 3, 2, 2, met);
    // cracked oath shield with split crescent and chain wrap
    poly(g, [0, 44 + b, 16, 44 + b, 16, 62 + b, 8, 76 + b, 0, 62 + b], '#4a4450'); poly(g, [0, 44 + b, 8, 44 + b, 8, 76 + b, 0, 62 + b], '#322e3a');
    R(g, 0, 44 + b, 16, 2, plL); R(g, 0, 44 + b, 1, 18, plL);
    g.strokeStyle = '#b8b0c0'; g.lineWidth = 1.6; g.beginPath(); g.arc(8, 59 + b, 4.5, 0.9, 5.4); g.stroke();
    g.globalAlpha = gl; line(g, 2, 46 + b, 7, 56 + b, red, 1.2); line(g, 7, 56 + b, 6, 62 + b, red, 1.2); line(g, 6, 62 + b, 11, 70 + b, red, 1.2); g.globalAlpha = 1;
    for (let k = 0; k < 9; k++) R(g, 1 + k * 1.7, 47 + b + k * 2.6, 2, 2, k % 2 ? met : '#6a6a7a');
    // broken sword
    R(g, 59, 48 + b, 4, 3, '#3a2a1a'); R(g, 56, 45 + b, 10, 2, '#6a5a2a'); R(g, 60, 49 + b, 2, 8, '#2a1a10');
    R(g, 60, 22 + b, 3, 23, '#b8bccb'); R(g, 60, 22 + b, 1, 23, '#e0e4f0'); poly(g, [60, 22 + b, 63, 22 + b, 62, 17 + b, 61, 20 + b, 60, 16 + b], '#b8bccb');
    g.save(); g.translate(62, 8); g.rotate(p * 0.5 - 0.5); poly(g, [-2, -6, 2, -6, 2, 2, -1, 6, -3, 1], '#d8dcea'); g.globalAlpha = 0.28 * gl + 0.1; circ(g, 0, 0, 4, red); g.restore(); g.globalAlpha = 1;
    // horned great helm with red visor glow and torn plume
    R(g, 28, 30 + b, 12, 5, plD);
    poly(g, [24, 8 + b, 34, 3 + b, 44, 8 + b, 44, 30 + b, 24, 30 + b], '#3e3e4a'); poly(g, [24, 8 + b, 34, 3 + b, 34, 30 + b, 24, 30 + b], '#2a2a34');
    R(g, 24, 8 + b, 20, 2, plL); R(g, 33, 3 + b, 2, 26, '#52525e');
    poly(g, [24, 9 + b, 15, 6 + b, 11, -1 + b, 19, 3 + b, 23, 3 + b], '#2a2a34'); poly(g, [44, 9 + b, 53, 6 + b, 57, -1 + b, 49, 3 + b, 45, 3 + b], '#52525e');
    const fl = Math.sin(p * 2) * 2; poly(g, [30, 4 + b, 36, 2 + b, 44 + fl, -2 + b, 48 + fl, 6 + b, 40, 8 + b], redD); poly(g, [34, 4 + b, 38, 3 + b, 44 + fl, 0 + b, 40, 7 + b], '#c0303a');
    R(g, 26, 16 + b, 18, 3, '#0a0406'); g.globalAlpha = 0.6 + gl * 0.4; R(g, 27, 17 + b, 16, 1, red); R(g, 31, 16 + b, 8, 3, red); g.globalAlpha = 1;
    for (let k = 0; k < 4; k++) { R(g, 27 + k * 3, 23 + b, 1, 4, '#0a0406'); R(g, 36 + k * 2, 23 + b, 1, 4, '#0a0406'); }
    line(g, 28, 9 + b, 31, 15 + b, '#0a0406', 1); line(g, 41, 20 + b, 43, 28 + b, '#0a0406', 1);
    for (let k = 0; k < 3; k++) { const q = (t * 2 + k / 3) % 1; g.globalAlpha = (1 - q) * 0.6; ell(g, 30 + k * 4 + Math.sin(p + k) * 1.5, 16 + b - q * 12, 1.4 - q * 0.6, 2.2 - q, red); } g.globalAlpha = 1;
    // embers
    for (let k = 0; k < 5; k++) { const q = (t + k / 5) % 1; g.globalAlpha = 0.6 * (1 - q); circ(g, 10 + k * 12 + Math.sin(p + k * 2) * 3, 82 - q * 56, 1.2, '#ff6a3a'); } g.globalAlpha = 1;
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
