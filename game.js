'use strict';

// ============================================================
// 設定
// ============================================================
const CFG = {
  catchesToWin: 3,
  score: { walk: 150, peek: 200, sit: 80, wrong: -50 },
  timeBonus: { full: 300, freeSec: 30, perSec: 10 },
  // 每捉到一次，難度上升
  walkSpeed: 0.32,          // 單位：每秒 × 畫面短邊
  speedUpPerCatch: 1.25,
  sitTime: 3.0,
  sitTimeDropPerCatch: 0.6,
  peekTime: 0.8,
  dogChaseTime: 5,
  mini: {
    // 唔限時：玩家撳「完成」先收工
    tiers: [
      { from: 0,  key: 'bat',          name: '棒球棍', pts: 10, word: '啪！', sfx: 'bat' },
      { from: 20, key: 'mace',         name: '狼牙棒', pts: 15, word: '噹！', sfx: 'mace' },
      { from: 40, key: 'flamethrower', name: '火槍',   pts: 20, word: '轟！', sfx: 'flame' },
      { from: 60, key: 'machine_gun',  name: '機關槍', pts: 30, word: '噠噠噠！', sfx: 'gun' },
    ],
    milestones: [{ at: 30, bonus: 100 }, { at: 60, bonus: 200 }],
    tapMinGap: 30,          // ms，同一隻手指
    shakeThreshold: 14,     // m/s²
    shakeMinGap: 120,       // ms
  },
};

const IMG_SRC = {
  park_portrait: 'assets/scene/park_portrait.png',
  park_landscape: 'assets/scene/park_landscape.png',
  bush: 'assets/scene/bush.png',
  bench: 'assets/scene/bench.png',
  chess_table: 'assets/scene/chess_table.png',
  target_walk: 'assets/characters/target_walk.png',
  target_sit: 'assets/characters/target_sit.png',
  target_chess: 'assets/characters/target_chess.png',
  target_peek: 'assets/characters/target_peek.png',
  target_hit: 'assets/characters/target_hit.png',
  woman: 'assets/characters/woman.png',
  woman_dog: 'assets/characters/woman_dog.png',
  dachshund_walk: 'assets/characters/dachshund_walk.png',
  dachshund_run: 'assets/characters/dachshund_run.png',
  chess_opponent: 'assets/characters/chess_opponent.png',
  bat: 'assets/weapons/bat.png',
  mace: 'assets/weapons/mace.png',
  flamethrower: 'assets/weapons/flamethrower.png',
  machine_gun: 'assets/weapons/machine_gun.png',
  fx_stars: 'assets/effects/fx_stars.png',
  fx_bump: 'assets/effects/fx_bump.png',
  fx_spark: 'assets/effects/fx_spark.png',
  fx_pa: 'assets/effects/fx_pa.png',
  benny: 'Benny.jpg',
  benny_idle: encodeURI('punch/Benny original.png'),
  benny_hit: encodeURI('punch/Benny punch 1.png'),
};

// 懲罰相入面頭頂同塊面嘅位置（以相片闊高比例計）
const PUNCH = {
  benny_idle: { top: { x: 0.50, y: 0.04 }, face: { x: 0.50, y: 0.22 } },
  benny_hit:  { top: { x: 0.32, y: 0.03 }, face: { x: 0.34, y: 0.25 } },
};

// woman_dog.png 入面女子同狗各自嘅範圍（向右行時）
const WOMAN_DOG = {
  woman: { x0: 0.0, x1: 0.53, y0: 0.0, y1: 1.0 },
  dog:   { x0: 0.55, x1: 1.0, y0: 0.70, y1: 1.0 },
  dogFootX: 0.80,   // 狗腳喺圖入面嘅 x
};

const VOICES = [
  { src: 'assets/audio/voice/v1_jaumeng.m4a', text: '做咩啊？救命呀！' },
  { src: 'assets/audio/voice/v2_mhoudangoh.m4a', text: '唔好打我啦！' },
  { src: 'assets/audio/voice/v3_aiyahoutung.m4a', text: '哎呀好痛！' },
  { src: 'assets/audio/voice/v4_tauhong.m4a', text: '我投降啊！' },
  { src: 'assets/audio/voice/v5_wuisei.m4a', text: '唔好再打啦，再打我會死㗎！' },
];

// Benny.jpg 入面塊面嘅範圍（像素），開始畫面頭像用
const PHOTO_FACE = { cx: 153, cy: 268, rx: 100, ry: 128 };

// 每個人物喺畫面嘅高度（× 畫面短邊）
const SIZE = {
  target: 0.26, woman: 0.27, dog: 0.17, opponent: 0.22,
  bench: 0.34, chess_table: 0.42, bush: 0.24,
};

// 場景佈局（畫面比例座標，y 係「腳」嘅位置）
const LAYOUTS = {
  portrait: {
    bg: 'park_portrait',
    area: { x0: 0.14, x1: 0.86, y0: 0.36, y1: 0.86 },
    bench: { x: 0.70, y: 0.43 },
    chess: { x: 0.42, y: 0.76 },
    bushes: [{ x: 0.24, y: 0.55 }, { x: 0.80, y: 0.63 }],
  },
  landscape: {
    bg: 'park_landscape',
    area: { x0: 0.12, x1: 0.88, y0: 0.40, y1: 0.90 },
    bench: { x: 0.26, y: 0.50 },
    chess: { x: 0.66, y: 0.80 },
    bushes: [{ x: 0.47, y: 0.55 }, { x: 0.86, y: 0.52 }, { x: 0.13, y: 0.85 }],
  },
};

// ============================================================
// 工具
// ============================================================
const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (n) => n.toLocaleString('en-US');

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 私人模式 */ } },
};

// ============================================================
// 畫布
// ============================================================
const canvas = $('game');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, U = 0, DPR = 1, layout = LAYOUTS.portrait;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight; U = Math.min(W, H);
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  layout = W > H * 1.05 ? LAYOUTS.landscape : LAYOUTS.portrait;
  if (game) placeProps();
}
window.addEventListener('resize', resize);

// ============================================================
// 素材
// ============================================================
const IMG = {};
function loadImages() {
  const keys = Object.keys(IMG_SRC);
  let done = 0;
  return Promise.all(keys.map((k) => new Promise((res) => {
    const im = new Image();
    im.onload = () => { IMG[k] = im; done++; $('load-text').textContent = `載入緊… ${done}/${keys.length}`; res(); };
    im.onerror = () => { IMG[k] = null; done++; res(); };
    im.src = IMG_SRC[k];
  })));
}

// 去背圖嘅闊高比
function aspect(key) { const im = IMG[key]; return im ? im.width / im.height : 0.55; }

// 以「腳底中間」為錨點畫圖，返回畫咗嘅矩形
function drawSprite(key, fx, fy, h, opt = {}) {
  const im = IMG[key];
  const w = h * aspect(key);
  const flip = opt.flip ? -1 : 1;
  const sx = opt.sx || 1, sy = opt.sy || 1;
  ctx.save();
  ctx.translate(fx, fy);
  if (opt.rot) ctx.rotate(opt.rot);
  ctx.scale(flip * sx, sy);
  if (opt.alpha !== undefined) ctx.globalAlpha = opt.alpha;
  if (im) ctx.drawImage(im, -w / 2, -h, w, h);
  else { ctx.fillStyle = '#f6a'; ctx.fillRect(-w / 2, -h, w, h); }
  ctx.restore();
  return { x: fx - w * sx / 2, y: fy - h * sy, w: w * sx, h: h * sy };
}

function drawCover(key, zoom = 1, cx = W / 2, cy = H / 2) {
  const im = IMG[key];
  if (!im) { ctx.fillStyle = '#9fd38a'; ctx.fillRect(0, 0, W, H); return; }
  const s = Math.max(W / im.width, H / im.height) * zoom;
  const dw = im.width * s, dh = im.height * s;
  // 鏡頭拉近時，以 (cx, cy) 為中心
  const ox = W / 2 - (cx - W / 2) * (zoom - 1) - dw / 2;
  const oy = H / 2 - (cy - H / 2) * (zoom - 1) - dh / 2;
  ctx.drawImage(im, ox, oy, dw, dh);
}

// ============================================================
// 聲音
// ============================================================
const Sound = {
  ac: null, master: null, muted: store.get('kdyz-muted', '0') === '1',
  voices: [], lastVoice: -1, voiceAt: 0,

  init() {
    if (this.ac) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      this.ac = new AC();
      this.master = this.ac.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ac.destination);
    }
    // iOS：要喺用家㩒掣嗰下先「解鎖」每個 audio
    this.voices = VOICES.map((v) => { const a = new Audio(v.src); a.preload = 'auto'; return a; });
    this.voices.forEach((a) => { a.muted = true; const p = a.play(); if (p) p.then(() => { a.pause(); a.currentTime = 0; a.muted = this.muted; }).catch(() => { a.muted = this.muted; }); });
  },

  setMuted(m) {
    this.muted = m; store.set('kdyz-muted', m ? '1' : '0');
    if (this.master) this.master.gain.value = m ? 0 : 1;
    this.voices.forEach((a) => { a.muted = m; });
    $('btn-mute').textContent = m ? '🔇' : '🔊';
  },

  voice() {
    const now = performance.now();
    if (now - this.voiceAt < 800) return null;
    let i; do { i = Math.floor(Math.random() * VOICES.length); } while (i === this.lastVoice && VOICES.length > 1);
    this.lastVoice = i; this.voiceAt = now;
    const a = this.voices[i];
    if (a) { try { a.currentTime = 0; const p = a.play(); if (p) p.catch(() => {}); } catch (e) { /* 忽略 */ } }
    return VOICES[i].text;
  },

  // ---- 合成音效 ----
  tone(type, f0, f1, dur, vol, t0 = 0) {
    if (!this.ac) return;
    const t = this.ac.currentTime + t0;
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol, freq = 1200, t0 = 0, q = 1) {
    if (!this.ac) return;
    const t = this.ac.currentTime + t0;
    const len = Math.floor(this.ac.sampleRate * dur);
    const buf = this.ac.createBuffer(1, len, this.ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = this.ac.createBufferSource(); s.buffer = buf;
    const f = this.ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = this.ac.createGain(); g.gain.value = vol;
    s.connect(f).connect(g).connect(this.master); s.start(t);
  },
  sfx(name) {
    switch (name) {
      case 'catch': [660, 880, 1320].forEach((f, i) => this.tone('triangle', f, 0, 0.18, 0.25, i * 0.08)); break;
      case 'wrong': this.tone('square', 220, 140, 0.32, 0.14); break;
      case 'bark':
        this.tone('sawtooth', 520, 300, 0.09, 0.18); this.tone('sawtooth', 560, 320, 0.1, 0.18, 0.15);
        this.noise(0.08, 0.2, 900, 0, 2); this.noise(0.08, 0.2, 900, 0.15, 2); break;
      case 'miss': this.tone('sine', 500, 300, 0.2, 0.08); break;
      case 'bat': this.tone('sine', 180, 60, 0.15, 0.5); this.noise(0.06, 0.4, 2000); break;
      case 'mace': this.tone('triangle', 900, 700, 0.25, 0.22); this.tone('sine', 140, 60, 0.15, 0.45); break;
      case 'flame': this.noise(0.35, 0.5, 600, 0, 0.6); this.tone('sine', 120, 50, 0.2, 0.3); break;
      case 'gun': for (let i = 0; i < 3; i++) { this.noise(0.04, 0.5, 2500, i * 0.05, 1.5); this.tone('square', 160, 80, 0.04, 0.12, i * 0.05); } break;
      case 'level': [523, 659, 784, 1046].forEach((f, i) => this.tone('triangle', f, 0, 0.2, 0.22, i * 0.07)); break;
      case 'count': this.tone('sine', 880, 0, 0.15, 0.25); break;
      case 'go': this.tone('sine', 1320, 0, 0.35, 0.3); break;
      case 'end': [784, 659, 523, 784, 1046].forEach((f, i) => this.tone('triangle', f, 0, 0.22, 0.22, i * 0.1)); break;
    }
  },

  suspend() { if (this.ac) this.ac.suspend(); },
  resume() { if (this.ac) this.ac.resume(); },
};

// ============================================================
// 遊戲狀態
// ============================================================
let game = null;

function newGame() {
  game = {
    phase: 'main',          // main → zoom → punishIntro → countdown → punish → done
    t: 0, elapsed: 0, score: 0, catches: 0,
    level: 0, paused: false,
    props: [], fx: [], texts: [],
    shake: 0,
    target: null, woman: null, dog: null, opponent: null,
    zoom: { t: 0, x: 0, y: 0 },
    mini: null,
  };
  placeProps();
  const a = layout.area;
  game.target = { x: (a.x0 + a.x1) / 2, y: (a.y0 + a.y1) / 2, state: 'walk', dest: null, timer: 0, face: 1, bob: 0, bubble: null, prop: null };
  chooseTargetDest();
  game.woman = { x: a.x0 + 0.1, y: a.y1 - 0.08, dest: null, face: 1, bob: 0, angry: 0, bubble: null };
  game.dog = { x: game.woman.x - 0.06, y: game.woman.y + 0.01, state: 'leash', timer: 0, face: 1, bob: 0 };
  game.opponent = { bubble: null, angry: 0 };
  updateHud();
}

// 道具位置跟住佈局
function placeProps() {
  const L = layout;
  game.props = [
    { kind: 'bench', x: L.bench.x, y: L.bench.y, h: SIZE.bench },
    { kind: 'chess_table', x: L.chess.x, y: L.chess.y, h: SIZE.chess_table },
    ...L.bushes.map((b) => ({ kind: 'bush', x: b.x, y: b.y, h: SIZE.bush })),
  ];
}
const propOf = (kind) => game.props.find((p) => p.kind === kind);

// 比例座標 ↔ 像素
const px = (fx) => fx * W, py = (fy) => fy * H;

// 用像素距離移動（比例座標下 X、Y 唔同長度）
function moveToward(e, tx, ty, speed, dt) {
  const dx = (tx - e.x) * W, dy = (ty - e.y) * H;
  const d = Math.hypot(dx, dy);
  const step = speed * U * dt;
  if (Math.abs(dx) > 2) e.face = dx > 0 ? 1 : -1;
  if (d <= step) { e.x = tx; e.y = ty; return true; }
  e.x += dx / d * step / W; e.y += dy / d * step / H;
  return false;
}

function randomPoint() {
  const a = layout.area;
  return { x: rand(a.x0, a.x1), y: rand(a.y0, a.y1) };
}

// ---------- 目標（袁枝）----------
function speedNow() { return CFG.walkSpeed * Math.pow(CFG.speedUpPerCatch, game.level); }
function sitTimeNow() { return Math.max(1.2, CFG.sitTime - CFG.sitTimeDropPerCatch * game.level); }

function seatPos(kind) {
  const p = propOf(kind);
  if (kind === 'bench') return { x: p.x, y: p.y - 0.004 };
  // 象棋台：坐左邊前面張石凳
  const w = SIZE.chess_table * U * aspect('chess_table');
  return { x: p.x - (w * 0.30) / W, y: p.y - 0.004 };
}

function chooseTargetDest() {
  const T = game.target;
  const r = Math.random();
  const bushes = game.props.filter((p) => p.kind === 'bush');
  T.prop = null;
  if (r < 0.22) { T.goal = 'bench'; T.dest = seatPos('bench'); }
  else if (r < 0.44) { T.goal = 'chess'; T.dest = seatPos('chess_table'); }
  else if (r < 0.70) {
    const b = pick(bushes); T.goal = 'bush'; T.prop = b;
    T.dest = { x: b.x, y: b.y - 0.012 };
  } else { T.goal = 'wander'; T.dest = randomPoint(); }
  T.state = 'walk';
}

function updateTarget(dt) {
  const T = game.target, dog = game.dog;
  T.bob += dt;
  const chased = dog.state === 'chase';
  if (T.bubble) { T.bubble.t -= dt; if (T.bubble.t <= 0) T.bubble = null; }

  // 俾狗追：即刻起身走
  if (chased && ['sit', 'chess', 'hide', 'peek'].includes(T.state)) {
    T.state = 'flee'; T.dest = fleePoint(); say(T, '嘩！隻狗呀！', 1.2);
  }

  switch (T.state) {
    case 'walk':
      if (moveToward(T, T.dest.x, T.dest.y, speedNow() * (chased ? 1.9 : 1), dt)) {
        if (T.goal === 'bench') { T.state = 'sit'; T.timer = sitTimeNow(); T.face = 1; }
        else if (T.goal === 'chess') { T.state = 'chess'; T.timer = sitTimeNow(); T.face = 1; }
        else if (T.goal === 'bush') { T.state = 'hide'; T.timer = rand(0.5, 1.1); T.peeks = Math.random() < 0.5 ? 2 : 1; T.side = Math.random() < 0.5 ? -1 : 1; }
        else chooseTargetDest();
      }
      break;
    case 'flee':
      if (moveToward(T, T.dest.x, T.dest.y, speedNow() * 1.9, dt)) T.dest = fleePoint();
      if (!chased) chooseTargetDest();
      break;
    case 'sit': case 'chess':
      T.timer -= dt; if (T.timer <= 0) chooseTargetDest();
      break;
    case 'hide':
      T.timer -= dt;
      if (T.timer <= 0) { T.state = 'peek'; T.timer = Math.max(0.45, CFG.peekTime - 0.08 * game.level); T.peekT = 0; }
      break;
    case 'peek':
      T.timer -= dt; T.peekT += dt;
      if (T.timer <= 0) {
        T.peeks--;
        if (T.peeks > 0) { T.state = 'hide'; T.timer = rand(0.4, 0.9); T.side = -T.side; }
        else { if (Math.random() < 0.5) floatText('走甩咗！', px(T.x), py(T.y) - SIZE.bush * U, '#7a6a85', 0.7); chooseTargetDest(); }
      }
      break;
    case 'hit':
      T.timer -= dt;
      if (T.timer <= 0) {
        if (game.catches >= CFG.catchesToWin) startZoom();
        else { T.state = 'escape'; T.dest = { x: T.x < 0.5 ? -0.15 : 1.15, y: T.y }; say(T, pick(['唔好捉我！', '救命呀！', '我走先！']), 1); }
      }
      break;
    case 'escape':
      if (moveToward(T, T.dest.x, T.dest.y, speedNow() * 2.2, dt)) {
        T.state = 'away'; T.timer = 0.9;
      }
      break;
    case 'away':
      T.timer -= dt;
      if (T.timer <= 0) {
        const a = layout.area; const left = Math.random() < 0.5;
        T.x = left ? -0.08 : 1.08; T.y = rand(a.y0, a.y1);
        chooseTargetDest();
      }
      break;
  }
}

function fleePoint() {
  const T = game.target, d = game.dog, a = layout.area;
  let best = null, bd = -1;
  for (let i = 0; i < 6; i++) {
    const p = randomPoint();
    const dd = Math.hypot((p.x - d.x) * W, (p.y - d.y) * H) + Math.hypot((p.x - T.x) * W, (p.y - T.y) * H) * 0.2;
    if (dd > bd) { bd = dd; best = p; }
  }
  return best || { x: (a.x0 + a.x1) / 2, y: (a.y0 + a.y1) / 2 };
}

// ---------- 拖狗女子同臘腸狗 ----------
function updateWoman(dt) {
  const Wm = game.woman, dog = game.dog;
  if (Wm.bubble) { Wm.bubble.t -= dt; if (Wm.bubble.t <= 0) Wm.bubble = null; }
  if (Wm.angry > 0) Wm.angry -= dt;
  else if (dog.state === 'leash') {
    // 拖住狗一齊行：人同狗係同一張圖，方向一定一致
    Wm.bob += dt;
    if (!Wm.dest) Wm.dest = randomPoint();
    if (moveToward(Wm, Wm.dest.x, Wm.dest.y, 0.11, dt)) Wm.dest = null;
  }

  dog.bob += dt;
  if (dog.state === 'leash') {
    const p = leashDogPos(); dog.x = p.x; dog.y = p.y; dog.face = Wm.face;
  } else if (dog.state === 'chase') {
    dog.timer -= dt;
    const T = game.target;
    const tx = ['away', 'escape'].includes(T.state) ? dog.x : T.x;
    moveToward(dog, tx, T.y + 0.004, speedNow() * 2.1, dt);
    if (dog.timer <= 0) dog.state = 'return';
  } else if (dog.state === 'return') {
    const p = leashDogPos();
    if (moveToward(dog, p.x, p.y, 0.5, dt)) { dog.state = 'leash'; Wm.bubble = null; }
  }
}

// 狗帶另一頭：狗喺女子前面
function leashDogPos() {
  const Wm = game.woman, h = SIZE.woman * U, w = h * aspect('woman_dog');
  return { x: Wm.x + Wm.face * (WOMAN_DOG.dogFootX - 0.5) * w / W, y: Wm.y };
}

function say(e, text, t = 1.3) { e.bubble = { text, t }; }

// ============================================================
// 主關：畫面
// ============================================================
function collectDrawables() {
  const T = game.target, Wm = game.woman, dog = game.dog, list = [];
  const chessP = propOf('chess_table');

  for (const p of game.props) list.push({ z: p.y, draw: () => drawProp(p) });

  // 捉棋伯伯（坐喺棋台右邊張石凳）
  const tw = SIZE.chess_table * U * aspect('chess_table');
  const opp = { x: chessP.x + (tw * 0.42) / W, y: chessP.y - (SIZE.chess_table * U * 0.14) / H };
  list.push({
    z: chessP.y + 0.0005, draw: () => {
      const shake = game.opponent.angry > 0 ? Math.sin(game.t * 50) * 3 : 0;
      game.opponent.rect = drawSprite('chess_opponent', px(opp.x) + shake, py(opp.y), SIZE.opponent * U, { rot: Math.sin(game.t * 1.2) * 0.015 });
      game.opponent.head = { x: px(opp.x), y: py(opp.y) - SIZE.opponent * U };
    },
  });

  // 臘腸狗（甩咗繩先獨立畫）
  if (dog.state !== 'leash') {
    list.push({
      z: dog.y, draw: () => {
        const hop = Math.abs(Math.sin(dog.bob * 16)) * U * 0.012;
        // 狗圖原本向左，向右行就反轉
        dog.rect = drawSprite('dachshund_run', px(dog.x), py(dog.y) - hop, SIZE.dog * U * 1.05, { flip: dog.face > 0 });
      },
    });
  }

  // 女子：拖住狗嗰陣用「女子＋狗帶＋狗」整張圖
  list.push({
    z: Wm.y, draw: () => {
      const h = SIZE.woman * U;
      const together = dog.state === 'leash';
      const walking = together && Wm.angry <= 0;
      const bob = walking ? Math.abs(Math.sin(Wm.bob * 7)) * U * 0.005 : 0;
      const shake = Wm.angry > 0 ? Math.sin(game.t * 50) * 3 : 0;
      const fx = px(Wm.x) + shake, fy = py(Wm.y) - bob;
      if (together) {
        const r = drawSprite('woman_dog', fx, fy, h, { flip: Wm.face < 0, rot: walking ? Math.sin(Wm.bob * 7) * 0.012 : 0 });
        const part = (p) => {
          const x0 = Wm.face > 0 ? p.x0 : 1 - p.x1, x1 = Wm.face > 0 ? p.x1 : 1 - p.x0;
          return { x: r.x + r.w * x0, y: r.y + r.h * p.y0, w: r.w * (x1 - x0), h: r.h * (p.y1 - p.y0) };
        };
        Wm.rect = part(WOMAN_DOG.woman); dog.rect = part(WOMAN_DOG.dog);
        Wm.head = { x: Wm.rect.x + Wm.rect.w / 2, y: r.y };
      } else {
        Wm.rect = drawSprite('woman', fx, fy, h, { flip: Wm.face < 0 });
        Wm.head = { x: fx, y: fy - h };
      }
    },
  });

  // 目標
  if (!['hide', 'away'].includes(T.state)) {
    let z = T.y;
    if (T.state === 'sit') z = propOf('bench').y + 0.001;
    if (T.state === 'chess') z = chessP.y + 0.001;
    if (T.state === 'peek') z = T.prop.y - 0.001;
    list.push({ z, draw: () => drawTarget() });
  }

  list.sort((a, b) => a.z - b.z);
  return list;
}

function drawProp(p) {
  const h = p.h * U;
  p.rect = drawSprite(p.kind, px(p.x), py(p.y), h);
}

function drawTarget() {
  const T = game.target, h = SIZE.target * U;
  let key = 'target_walk', fx = px(T.x), fy = py(T.y), opt = {};
  const moving = ['walk', 'flee', 'escape'].includes(T.state);
  if (moving) {
    const sp = T.state === 'walk' ? 8 : 13;
    fy -= Math.abs(Math.sin(T.bob * sp)) * U * 0.01;
    opt.rot = Math.sin(T.bob * sp) * 0.05;
    opt.flip = T.face < 0;
  } else if (T.state === 'sit') {
    key = 'target_sit';
    const b = propOf('bench'); fy = py(b.y) - SIZE.bench * U * 0.06;
    opt.sy = 1 + Math.sin(T.bob * 2) * 0.01;
  } else if (T.state === 'chess') {
    key = 'target_chess'; fy = py(propOf('chess_table').y) - SIZE.chess_table * U * 0.02;
    opt.rot = Math.sin(T.bob * 1.5) * 0.02;
  } else if (T.state === 'peek') {
    key = 'target_peek';
    const b = T.prop, bh = b.h * U, bw = bh * aspect('bush');
    const out = Math.min(1, T.peekT / 0.12, Math.max(0, T.timer) / 0.12);
    fx = px(b.x) + T.side * (bw * 0.18 + bw * 0.22 * out);
    fy = py(b.y) - bh * 0.28;
    // 相入面道牆喺佢左邊：喺花叢右邊探頭就唔使反轉
    opt.flip = T.side < 0;
    opt.h = h * 0.62;
  } else if (T.state === 'hit') {
    key = 'target_hit';
    const s = 1 + Math.sin(T.timer * 40) * 0.04;
    opt.sx = s; opt.sy = 2 - s;
    opt.flip = T.face < 0;
  }
  const H2 = opt.h || (key === 'target_hit' ? h * 0.82 : key === 'target_sit' ? h * 0.8 : key === 'target_chess' ? h * 0.76 : h);
  T.rect = drawSprite(key, fx, fy, H2, opt);
  T.head = { x: fx, y: T.rect.y };
}

function drawBubble(text, x, y, color = '#4a3b52') {
  ctx.save();
  const fs = Math.max(14, U * 0.04);
  ctx.font = `900 ${fs}px ${getComputedStyle(document.body).fontFamily}`;
  const tw = ctx.measureText(text).width, pad = fs * 0.5;
  const bw = tw + pad * 2, bh = fs * 1.7;
  let bx = clamp(x - bw / 2, 6, W - bw - 6), by = Math.max(56, y - bh - fs * 0.6);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = color; ctx.lineWidth = 3;
  roundRect(bx, by, bw, bh, bh / 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(clamp(x, bx + 14, bx + bw - 14) - 7, by + bh - 1); ctx.lineTo(clamp(x, bx + 14, bx + bw - 14), by + bh + 10); ctx.lineTo(clamp(x, bx + 14, bx + bw - 14) + 7, by + bh - 1);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + bw / 2, by + bh / 2 + 1);
  ctx.restore();
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// 飄字
function floatText(text, x, y, color = '#e86a8c', size = 1) {
  game.texts.push({ text, x, y, color, size, t: 0, life: 0.9 });
}
function drawTexts(dt) {
  const ff = getComputedStyle(document.body).fontFamily;
  game.texts = game.texts.filter((f) => (f.t += dt) < f.life);
  for (const f of game.texts) {
    const k = f.t / f.life;
    ctx.save();
    ctx.globalAlpha = 1 - k * k;
    const fs = Math.max(18, U * 0.06) * f.size * (1 + Math.max(0, 0.25 - f.t) * 1.5);
    ctx.font = `900 ${fs}px ${ff}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = fs * 0.18; ctx.strokeStyle = '#fff'; ctx.lineJoin = 'round';
    ctx.strokeText(f.text, f.x, f.y - k * U * 0.08);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y - k * U * 0.08);
    ctx.restore();
  }
}

// 粒子 / 特效圖
function addFx(o) { game.fx.push(Object.assign({ t: 0, life: 0.5, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, s: 1 }, o)); }
function drawFx(dt) {
  game.fx = game.fx.filter((f) => (f.t += dt) < f.life);
  for (const f of game.fx) {
    f.x += f.vx * dt; f.y += f.vy * dt; f.vy += f.g * dt; f.rot += f.vr * dt;
    const k = f.t / f.life;
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
    ctx.globalAlpha = f.fade === false ? 1 : 1 - k;
    if (f.img) {
      const im = IMG[f.img]; const s = f.size * (f.grow ? 0.6 + 0.6 * Math.min(1, k * 4) : 1);
      if (im) ctx.drawImage(im, -s * im.width / im.height / 2, -s / 2, s * im.width / im.height, s);
      if (f.word) {
        ctx.font = `900 ${s * 0.32}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = s * 0.05; ctx.strokeStyle = '#fff'; ctx.strokeText(f.word, 0, 0);
        ctx.fillStyle = '#e8404f'; ctx.fillText(f.word, 0, 0);
      }
    } else {
      ctx.fillStyle = f.color; ctx.beginPath(); ctx.arc(0, 0, f.r * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// ============================================================
// 主關：㩒擊
// ============================================================
function hitRect(r, x, y, pad) {
  if (!r) return false;
  return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;
}

function onMainTap(x, y, touch) {
  const T = game.target, Wm = game.woman, dog = game.dog;
  const pad = touch ? U * 0.03 : U * 0.005;
  const catchable = ['walk', 'flee', 'sit', 'chess', 'peek'].includes(T.state);

  // 由最前（畫最遲）嗰個開始判定
  const order = [];
  if (catchable && T.rect) order.push({ who: 'target', z: T.state === 'peek' ? T.prop.y - 0.001 : T.state === 'sit' ? propOf('bench').y + 0.001 : T.state === 'chess' ? propOf('chess_table').y + 0.001 : T.y });
  order.push({ who: 'woman', z: Wm.y }, { who: 'dog', z: dog.y }, { who: 'opponent', z: propOf('chess_table').y + 0.0005 });
  order.sort((a, b) => b.z - a.z);

  for (const o of order) {
    if (o.who === 'target') {
      // 探頭時判定範圍細啲但收緊少啲
      const r = T.rect;
      const inner = { x: r.x + r.w * 0.12, y: r.y, w: r.w * 0.76, h: r.h };
      if (hitRect(inner, x, y, pad)) { catchTarget(x, y); return; }
    } else if (o.who === 'woman' && hitRect(shrink(Wm.rect, 0.15), x, y, pad * 0.5)) {
      wrongHit(Wm, x, y, '打錯人呀！'); Wm.angry = 1; return;
    } else if (o.who === 'dog' && hitRect(shrink(dog.rect, 0.08), x, y, pad * 0.5)) {
      if (dog.state === 'leash' || dog.state === 'return') {
        dog.state = 'chase'; dog.timer = CFG.dogChaseTime;
        Sound.sfx('bark'); floatText('汪汪！', x, y, '#a0522d', 0.9);
        say(Wm, '喂！返嚟呀！', 1.5);
      }
      return;
    } else if (o.who === 'opponent' && hitRect(shrink(game.opponent.rect, 0.15), x, y, pad * 0.5)) {
      wrongHit(game.opponent, x, y, '打錯人呀！後生仔！'); game.opponent.angry = 0.8; return;
    }
  }
}
function shrink(r, k) { return r && { x: r.x + r.w * k, y: r.y + r.h * k * 0.5, w: r.w * (1 - 2 * k), h: r.h * (1 - k * 0.5) }; }

function wrongHit(who, x, y, text) {
  game.score = Math.max(0, game.score + CFG.score.wrong);
  Sound.sfx('wrong');
  floatText(`${CFG.score.wrong}`, x, y, '#d33');
  say(who, text, 1.3);
  game.flash = { t: 0.25, color: 'rgba(255,60,60,.25)' };
  if (navigator.vibrate) try { navigator.vibrate(80); } catch (e) { /* 忽略 */ }
  updateHud();
}

function catchTarget(x, y) {
  const T = game.target;
  const pts = T.state === 'peek' ? CFG.score.peek : (T.state === 'sit' || T.state === 'chess') ? CFG.score.sit : CFG.score.walk;
  game.score += pts; game.catches++; game.level++;
  Sound.sfx('catch');
  floatText(`+${pts}`, x, y - U * 0.04, '#e86a8c', 1.1);
  addFx({ img: 'fx_stars', x: px(T.x), y: T.rect.y, size: U * 0.12, life: 0.7, grow: true });
  // 坐低／探頭嗰陣被捉，即刻企返出嚟
  if (T.state === 'sit' || T.state === 'chess') { T.y += 0.02; }
  if (T.state === 'peek') { T.x = T.prop.x + T.side * (T.prop.h * U * aspect('bush') * 0.5) / W; T.y = T.prop.y + 0.02; }
  T.state = 'hit'; T.timer = 0.8;
  say(T, game.catches >= CFG.catchesToWin ? '捉到你喇！' : pick(['哎呀！', '畀你捉到！', '唔好呀！']), 0.8);
  updateHud();
}

// ============================================================
// 轉場：鏡頭拉近
// ============================================================
function startZoom() {
  const T = game.target;
  game.phase = 'zoom';
  game.zoom = { t: 0, x: px(T.x), y: py(T.y) - SIZE.target * U * 0.5 };
  floatText('捉到你喇！懲罰時間！', W / 2, H * 0.3, '#e86a8c', 1.1);
  game.texts[game.texts.length - 1].life = 1.6;
}

// ============================================================
// 小遊戲：連打懲罰
// ============================================================
function startPunishIntro() {
  game.phase = 'punishIntro';
  game.mini = { hits: 0, score: 0, t: 0, tier: 0, bumps: 0, charred: 0, lastHit: -1, swing: 0, hitPt: null, count: 3, motion: false, milestone: 0, topTier: 0 };
  show('scr-punish');
  const canShake = 'DeviceMotionEvent' in window && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  $('btn-shake').classList.toggle('hidden', !canShake);
  $('shake-text').textContent = '';
}

function enableShake() {
  const go = () => {
    game.mini.motion = true;
    $('shake-text').textContent = '📳 搖手機模式已開！㩒「開打！」開始。';
    $('btn-shake').classList.add('hidden');
  };
  const DME = window.DeviceMotionEvent;
  if (DME && typeof DME.requestPermission === 'function') {
    DME.requestPermission().then((s) => { if (s === 'granted') go(); else $('shake-text').textContent = '冇權限用動作感應，照㩒畫面打都得！'; })
      .catch(() => { $('shake-text').textContent = '呢部機開唔到搖手機模式（要用 https 開），照㩒畫面打都得！'; });
  } else go();
}

let lastShake = 0;
window.addEventListener('devicemotion', (e) => {
  if (!game || game.phase !== 'punish' || !game.mini.motion || game.paused) return;
  const a = e.acceleration && e.acceleration.x !== null ? e.acceleration : null;
  let mag;
  if (a) mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
  else if (e.accelerationIncludingGravity) { const g = e.accelerationIncludingGravity; mag = Math.abs(Math.hypot(g.x || 0, g.y || 0, g.z || 0) - 9.8); }
  else return;
  const now = performance.now();
  if (mag > CFG.mini.shakeThreshold && now - lastShake >= CFG.mini.shakeMinGap) { lastShake = now; punishHit(null, null); }
});

function startCountdown() {
  hide('scr-punish');
  game.phase = 'countdown'; game.mini.count = 3; game.mini.countT = 0;
  Sound.sfx('count');
}

function miniTier(hits) {
  let i = 0; CFG.mini.tiers.forEach((t, k) => { if (hits >= t.from) i = k; }); return i;
}

// 懲罰相：腳底中間錨點、高度
function bigTargetRect() {
  // 相片下半截（短褲）可以出咗畫面，等塊面企喺畫面中間
  const asp = aspect('benny_idle');
  const h = Math.min(H * 0.8, (W * 0.98) / asp);
  return { h, w: h * asp, fx: W / 2, fy: H + h * 0.12 };
}

// 由相片比例座標轉做畫面座標（跟住當刻顯示緊邊張相）
function punchPoint(key, which) {
  const b = bigTargetRect(), a = PUNCH[key][which];
  return { x: b.fx - b.w / 2 + a.x * b.w, y: b.fy - b.h + a.y * b.h };
}

function punchKey() {
  const M = game.mini;
  return M.hits > 0 && game.t - M.lastHit < 0.25 ? 'benny_hit' : 'benny_idle';
}

function punishHit(x, y) {
  const M = game.mini;
  const b = bigTargetRect();
  const face = punchPoint('benny_hit', 'face'), top = punchPoint('benny_hit', 'top');
  if (x === null) { x = face.x + rand(-b.w * 0.08, b.w * 0.08); y = face.y + rand(-b.h * 0.08, b.h * 0.08); }
  M.hits++;
  const ti = miniTier(M.hits - 1), tier = CFG.mini.tiers[ti];
  if (ti !== M.tier) { M.tier = ti; Sound.sfx('level'); floatText(`升級：${tier.name}！`, W / 2, H * 0.48, '#7a4fd0', 1.1); }
  M.topTier = Math.max(M.topTier, ti);
  M.score += tier.pts;
  M.lastHit = game.t; M.swing = 1; M.hitPt = { x, y };
  Sound.sfx(tier.sfx);
  const said = Sound.voice();
  if (said) M.bubble = { text: said, t: 1.1 };
  for (const ms of CFG.mini.milestones) {
    if (M.hits === ms.at) { M.score += ms.bonus; floatText(`${ms.at} 連擊！+${ms.bonus}`, W / 2, H * 0.58, '#ff8c00', 1.2); Sound.sfx('level'); game.shake = 0.4; }
  }

  // 特效
  const s = U * 0.18;
  if (tier.key === 'bat') {
    addFx({ img: 'fx_pa', word: tier.word, x, y, size: s, life: 0.35, grow: true, rot: rand(-0.3, 0.3) });
  } else if (tier.key === 'mace') {
    addFx({ img: 'fx_pa', word: tier.word, x, y, size: s, life: 0.35, grow: true, rot: rand(-0.3, 0.3) });
    if (M.hits % 6 === 0) M.bumps = Math.min(3, M.bumps + 1);
  } else if (tier.key === 'flamethrower') {
    addFx({ img: 'fx_spark', x, y, size: s * 1.1, life: 0.4, grow: true, rot: rand(-1, 1) });
    M.charred = Math.min(1, M.charred + 0.08);
    for (let i = 0; i < 3; i++) addFx({ x: top.x + rand(-b.w * 0.08, b.w * 0.08), y: top.y, vx: rand(-20, 20), vy: rand(-90, -40), r: U * rand(0.012, 0.025), color: 'rgba(90,80,80,.5)', life: 0.9 });
    if (M.hits % 3 === 0) addFx({ img: 'fx_pa', word: tier.word, x: x + rand(-30, 30), y: y - 40, size: s * 0.9, life: 0.3, grow: true });
  } else {
    game.shake = Math.max(game.shake, 0.12);
    const cols = ['#ff6b9a', '#ffd45c', '#6bd3ff', '#9cf06b', '#c58bff'];
    for (let i = 0; i < 5; i++) {
      const ang = rand(0, Math.PI * 2), sp = rand(150, 380);
      addFx({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: 600, r: U * rand(0.008, 0.016), color: pick(cols), life: 0.6 });
    }
    addFx({ img: 'fx_spark', x, y, size: s * 0.6, life: 0.2 });
    if (M.hits % 2 === 0) addFx({ img: 'fx_pa', word: tier.word, x: x + rand(-40, 40), y: y - 50, size: s, life: 0.3, grow: true });
  }
  floatText(`+${tier.pts}`, x + rand(-30, 30), y - U * 0.06, '#e86a8c', 0.7);
}

function updatePunish(dt) {
  const M = game.mini;
  if (game.phase === 'countdown') {
    M.countT += dt;
    if (M.countT >= 0.8) {
      M.countT = 0; M.count--;
      if (M.count <= 0) { game.phase = 'punish'; show('btn-done'); Sound.sfx('go'); floatText('開打！', W / 2, H * 0.35, '#e86a8c', 1.6); }
      else Sound.sfx('count');
    }
    return;
  }
  if (game.phase === 'punish') {
    M.t += dt;
    if (M.swing > 0) M.swing = Math.max(0, M.swing - dt * 7);
    if (M.bubble) { M.bubble.t -= dt; if (M.bubble.t <= 0) M.bubble = null; }
  }
}

// 撳「完成」：唔限時，打夠自己收手
function finishPunish() {
  if (!game || game.phase !== 'punish') return;
  game.phase = 'done'; hide('btn-done');
  Sound.sfx('end'); floatText('收工！', W / 2, H * 0.35, '#e86a8c', 1.5);
  setTimeout(showResult, 1000);
}

function drawPunish() {
  const M = game.mini;
  // 背景：公園拉近 + 霧化
  const z = 2.2;
  ctx.save();
  if ('filter' in ctx) ctx.filter = 'blur(6px)';
  drawCover(layout.bg, z, game.zoom.x, game.zoom.y);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,248,235,.35)'; ctx.fillRect(0, 0, W, H);

  const b = bigTargetRect();
  const since = game.t - M.lastHit;
  const hitNow = M.hits > 0 && since < 0.16;
  const key = punchKey();
  const sq = hitNow ? 1 - 0.05 * Math.cos(since * 40) : 1 + Math.sin(game.t * 3) * 0.008;
  const shiftX = hitNow ? (M.hitPt && M.hitPt.x < b.fx ? 1 : -1) * U * 0.02 * (1 - since / 0.16) : 0;
  const r = drawSprite(key, b.fx + shiftX, b.fy, b.h, { sx: 2 - sq, sy: sq });
  M.rect = r;
  const top = punchPoint(key, 'top'); top.x += shiftX;

  // 頭髮燒焦
  if (M.charred > 0) {
    ctx.save(); ctx.globalAlpha = M.charred * 0.6; ctx.fillStyle = '#2a1d16';
    ctx.beginPath(); ctx.ellipse(top.x, top.y + b.h * 0.07, b.w * 0.13, b.h * 0.07, key === 'benny_hit' ? -0.25 : 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  // 腫包
  for (let i = 0; i < M.bumps; i++) {
    const im = IMG.fx_bump; if (!im) break;
    const s = b.h * 0.1;
    ctx.drawImage(im, top.x - s * 0.55 + (i - 1) * s * 0.6, top.y - s * 0.6 + (i === 1 ? -s * 0.15 : 0), s * 1.1, s);
  }
  // 頭頂星星（棒球棍階段）
  if (M.tier === 0 && M.hits > 0 && since < 0.6 && IMG.fx_stars) {
    const im = IMG.fx_stars, s = b.h * 0.16;
    ctx.save(); ctx.translate(top.x, top.y); ctx.rotate(Math.sin(game.t * 6) * 0.3); ctx.drawImage(im, -s * im.width / im.height / 2, -s / 2, s * im.width / im.height, s); ctx.restore();
  }

  // 武器
  const tier = CFG.mini.tiers[M.tier], im = IMG[tier.key];
  if (im && game.phase !== 'countdown') {
    const p = M.hitPt || punchPoint('benny_idle', 'face');
    const ws = U * (tier.key === 'machine_gun' || tier.key === 'flamethrower' ? 0.3 : 0.32);
    ctx.save();
    if (tier.key === 'bat' || tier.key === 'mace') {
      // 揮棍：由右上角揮落嚟
      const ang = -0.9 + (1 - M.swing) * 1.2;
      ctx.translate(p.x + ws * 0.35, p.y + ws * 0.35); ctx.rotate(ang);
      ctx.drawImage(im, -ws * 0.5, -ws * 0.9, ws, ws * im.height / im.width);
    } else {
      // 槍：放喺右邊，對住打中嘅位
      const gx = Math.min(W - ws * 0.45, b.fx + b.w * 0.42), gy = Math.min(H - ws * 0.4, b.fy - b.h * 0.3);
      const ang = Math.atan2(p.y - gy, p.x - gx) + Math.PI; // 槍口向左
      const recoil = M.swing * ws * 0.08;
      ctx.translate(gx + Math.cos(ang) * recoil, gy + Math.sin(ang) * recoil); ctx.rotate(ang);
      const flipY = Math.cos(ang) < 0 ? -1 : 1;
      ctx.scale(1, flipY);
      ctx.drawImage(im, -ws * 0.5, -ws * 0.5 * im.height / im.width, ws, ws * im.height / im.width);
    }
    ctx.restore();
  }

  // 對白
  if (M.bubble) {
    // 擺喺個頭側邊，唔好遮住塊面
    const face = punchPoint(key, 'face');
    drawBubble(M.bubble.text, face.x + b.w * 0.24, face.y - b.h * 0.02, '#e86a8c');
  }

  // 大字：倒數 / 用時 / 連擊
  const ff = getComputedStyle(document.body).fontFamily;
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (game.phase === 'countdown') {
    const fs = U * 0.3 * (1.2 - M.countT * 0.4);
    ctx.font = `900 ${fs}px ${ff}`; ctx.lineWidth = fs * 0.12; ctx.strokeStyle = '#fff'; ctx.strokeText(M.count, W / 2, H / 2);
    ctx.fillStyle = '#e86a8c'; ctx.fillText(M.count, W / 2, H / 2);
  } else {
    // 放喺「完成」掣上面
    const fs = Math.max(17, U * 0.045);
    ctx.font = `900 ${fs}px ${ff}`; ctx.lineWidth = fs * 0.22; ctx.strokeStyle = '#fff';
    const y = H - 92 - fs * 0.6;
    const s = `⏱ ${M.t.toFixed(1)} 秒 ・ ${M.hits} 下 ・ ${tier.name}`;
    ctx.strokeText(s, W / 2, y); ctx.fillStyle = '#7a4fd0'; ctx.fillText(s, W / 2, y);
  }
  ctx.restore();
}

// ============================================================
// 結算
// ============================================================
let lastResult = null;
function showResult() {
  const M = game.mini;
  const tb = CFG.timeBonus;
  const timeBonus = Math.max(0, Math.round(tb.full - Math.max(0, game.elapsed - tb.freeSec) * tb.perSec));
  const total = game.score + timeBonus + M.score;
  const best = parseInt(store.get('kdyz-best', '0'), 10) || 0;
  const isNew = total > best;
  if (isNew) store.set('kdyz-best', String(total));
  lastResult = { total, secs: Math.round(game.elapsed), hits: M.hits, weapon: CFG.mini.tiers[M.topTier].name };

  $('res-main').textContent = fmt(game.score);
  $('res-time-label').textContent = `用時加分（${game.elapsed.toFixed(1)} 秒）`;
  $('res-time').textContent = '+' + fmt(timeBonus);
  $('res-mini-label').textContent = `懲罰分（${M.hits} 下，${M.t.toFixed(1)} 秒）`;
  $('res-mini').textContent = '+' + fmt(M.score);
  $('res-total').textContent = fmt(total);
  $('res-best').textContent = isNew ? '🎉 破咗紀錄！' : `最高分：${fmt(best)}`;
  $('res-title').textContent = isNew ? '新紀錄！' : '打完收工！';
  $('copy-text').textContent = '';
  hide('hud'); show('scr-result');
}

function shareText() {
  const r = lastResult;
  return `🎯《快打袁枝》我攞咗 ${fmt(r.total)} 分！\n捉袁枝用咗 ${r.secs} 秒，連打 ${r.hits} 下，用埋${r.weapon}😈\n你夠唔夠我快？`;
}

function copyText(text) {
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove(); return ok;
  };
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true, fallback);
  return Promise.resolve(fallback());
}

// ============================================================
// HUD / 畫面切換
// ============================================================
function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }
function updateHud() {
  if (!game) return;
  $('hud-score').textContent = `${fmt(game.score)} 分`;
  $('hud-catch').textContent = '●'.repeat(game.catches) + '○'.repeat(Math.max(0, CFG.catchesToWin - game.catches));
  $('hud-time').textContent = `${game.elapsed.toFixed(1)} 秒`;
}

function drawAvatar() {
  const c = $('avatar'), x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  x.save(); x.beginPath(); x.arc(110, 110, 104, 0, Math.PI * 2); x.fillStyle = '#ffe3ea'; x.fill(); x.clip();
  if (IMG.benny) {
    const p = PHOTO_FACE, side = p.ry * 2.3;
    x.drawImage(IMG.benny, p.cx - side / 2, p.cy - side * 0.55, side, side, 0, 0, 220, 220);
  }
  x.restore();
  x.lineWidth = 6; x.strokeStyle = '#fff'; x.beginPath(); x.arc(110, 110, 104, 0, Math.PI * 2); x.stroke();
}

// ============================================================
// 主迴圈
// ============================================================
let lastT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - lastT) / 1000 || 0); lastT = now;
  ctx.clearRect(0, 0, W, H);
  if (!game) { drawCover(layout.bg); return; }
  if (game.paused) { render(0); return; }
  game.t += dt;

  if (game.phase === 'main') {
    game.elapsed += dt;
    updateTarget(dt); updateWoman(dt);
    if (Math.floor(game.elapsed * 10) !== game._lastHud) { game._lastHud = Math.floor(game.elapsed * 10); updateHud(); }
  } else if (game.phase === 'zoom') {
    game.zoom.t += dt; updateWoman(dt);
    if (game.zoom.t >= 1.5) startPunishIntro();
  } else if (['countdown', 'punish', 'done'].includes(game.phase)) {
    updatePunish(dt);
  }
  render(dt);
}

function render(dt) {
  ctx.save();
  if (game.shake > 0) { game.shake -= dt; const s = U * 0.015; ctx.translate(rand(-s, s), rand(-s, s)); }

  if (game.phase === 'main' || game.phase === 'zoom') {
    drawMainScene();
  } else if (game.phase === 'punishIntro') {
    drawPunishIntroBg();
  } else {
    drawPunish();
  }
  drawFx(dt);
  drawTexts(dt);
  ctx.restore();

  if (game.flash && game.flash.t > 0) { game.flash.t -= dt; ctx.fillStyle = game.flash.color; ctx.fillRect(0, 0, W, H); }
}

function drawMainScene() {
  let z = 1;
  if (game.phase === 'zoom') { const k = Math.min(1, game.zoom.t / 1.2); z = 1 + 1.2 * (k * k * (3 - 2 * k)); }
  ctx.save();
  if (z > 1) {
    const cx = game.zoom.x, cy = game.zoom.y;
    ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-(W / 2 + (cx - W / 2) * (z - 1) / z), -(H / 2 + (cy - H / 2) * (z - 1) / z));
  }
  drawCover(layout.bg);
  for (const d of collectDrawables()) d.draw();
  const T = game.target, Wm = game.woman, O = game.opponent;
  if (T.bubble && T.head && !['hide', 'away'].includes(T.state)) drawBubble(T.bubble.text, T.head.x, T.head.y, '#e86a8c');
  if (Wm.bubble && Wm.head) drawBubble(Wm.bubble.text, Wm.head.x, Wm.head.y, '#d33');
  if (O.bubble && O.head) { O.bubble.t -= 1 / 60; if (O.bubble.t <= 0) O.bubble = null; else drawBubble(O.bubble.text, O.head.x, O.head.y, '#d33'); }
  if (O.angry > 0) O.angry -= 1 / 60;
  ctx.restore();
}

function drawPunishIntroBg() {
  ctx.save();
  if ('filter' in ctx) ctx.filter = 'blur(6px)';
  drawCover(layout.bg, 2.2, game.zoom.x, game.zoom.y);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,248,235,.35)'; ctx.fillRect(0, 0, W, H);
}

// ============================================================
// 輸入
// ============================================================
const lastTapByPointer = {};
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (!game || game.paused) return;
  const x = e.clientX, y = e.clientY, touch = e.pointerType !== 'mouse';
  if (game.phase === 'main') onMainTap(x, y, touch);
  else if (game.phase === 'punish') {
    const now = performance.now(), id = e.pointerId;
    if (lastTapByPointer[id] && now - lastTapByPointer[id] < CFG.mini.tapMinGap) return;
    lastTapByPointer[id] = now;
    // 打中邊度都計，特效落喺最近袁枝嘅位
    const r = game.mini.rect || { x: 0, y: 0, w: W, h: H };
    punishHit(clamp(x, r.x + r.w * 0.15, r.x + r.w * 0.85), clamp(y, r.y + r.h * 0.05, r.y + r.h * 0.6));
  }
}, { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

function pause(p) {
  if (!game || ['done'].includes(game.phase)) return;
  const playing = ['main', 'zoom', 'countdown', 'punish'].includes(game.phase);
  if (p && playing && !game.paused) { game.paused = true; Sound.suspend(); show('scr-pause'); }
  else if (!p && game.paused) { game.paused = false; Sound.resume(); hide('scr-pause'); }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });

// ============================================================
// 掣
// ============================================================
$('btn-start').addEventListener('click', () => {
  Sound.init(); Sound.setMuted(Sound.muted);
  hide('scr-start'); show('hud');
  newGame();
});
$('btn-again').addEventListener('click', () => {
  hide('scr-result'); hide('btn-done'); show('hud'); newGame();
});
$('btn-punish').addEventListener('click', startCountdown);
$('btn-done').addEventListener('click', finishPunish);
$('btn-shake').addEventListener('click', enableShake);
$('btn-resume').addEventListener('click', () => pause(false));
$('btn-mute').addEventListener('click', () => { Sound.init(); Sound.setMuted(!Sound.muted); });
$('btn-copy').addEventListener('click', () => {
  copyText(shareText()).then((ok) => { $('copy-text').textContent = ok ? '✅ 已複製，可以貼去群組喇！' : '複製唔到，請手動截圖分享 🙏'; });
});

// ============================================================
// 開始
// ============================================================
resize();
requestAnimationFrame(frame);
loadImages().then(() => {
  hide('scr-loading'); show('scr-start');
  const best = parseInt(store.get('kdyz-best', '0'), 10) || 0;
  $('best-text').textContent = best ? `最高分：${fmt(best)}` : '';
  $('btn-mute').textContent = Sound.muted ? '🔇' : '🔊';
  drawAvatar();
});
