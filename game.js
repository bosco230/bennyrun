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
  benny_hit1: encodeURI('punch/Benny punch 1.png'),
  benny_hit2: encodeURI('punch/Benny punch 2.png'),
  benny_hit3: encodeURI('punch/Benny punch 3.png'),
  benny_hit4: encodeURI('punch/Benny punch final.png'),
  ifc_bg: 'assets/ifc/rooftop2.jpg',
  ifc_benny: 'assets/ifc/benny_walking.png',
  burn_room: 'assets/burn/room.jpg',
  burn_room_portrait: 'assets/burn/room_portrait.jpg',
  burn_sit: 'assets/burn/sit.png',
  burn_scream1: 'assets/burn/scream1.png',
  burn_scream2: 'assets/burn/scream2.png',
  burn_scream3: 'assets/burn/scream3.png',
  burn_furnace_on: 'assets/burn/furnace_on.png',
  burn_furnace_off: 'assets/burn/furnace_off.png',
  burn_window_closed: 'assets/burn/window_closed.png',
  burn_window_open: 'assets/burn/window_open.png',
  fight_benny: 'assets/fight/benny.png',
  fight_benny_hit: 'assets/fight/benny_hit.png',
  fight_benny_shock: 'assets/fight/benny_shock.png',
  fight_rival: 'assets/fight/rival.png',
  fight_rival_punch: 'assets/fight/rival_punch.png',
  fight_rival_prepare: 'assets/fight/rival_prepare.png',
  fight_rival_wave: 'assets/fight/rival_wave.png',
  fight_rival_uppercut: 'assets/fight/rival_uppercut.png',
  fight_rival_spin: 'assets/fight/rival_spin.png',
  fight_wave: 'assets/fight/wave.png',
  fight_bg_landscape: 'assets/fight/bg_landscape.jpg',
  fight_bg_portrait: 'assets/fight/bg_portrait.jpg',
  brothel_bg: 'assets/brothel/bg.jpg',
  brothel_girl1: 'assets/brothel/girl1.png',
  brothel_girl2: 'assets/brothel/girl2.png',
  brothel_girl3: 'assets/brothel/girl3.png',
  brothel_girl4: 'assets/brothel/girl4.png',
  brothel_girl5: 'assets/brothel/girl5.png',
  brothel_girl6: 'assets/brothel/girl6.png',
  brothel_girl7: 'assets/brothel/girl7.png',
  brothel_girl8: 'assets/brothel/girl8.png',
  brothel_kiss1: 'assets/brothel/kiss1.png?v=2',
  brothel_kiss2: 'assets/brothel/kiss2.png',
  animal_room: 'assets/animal/room.jpg',
  animal_room_portrait: 'assets/animal/room_portrait.jpg',
  animal_sit: 'assets/animal/sit.png',
  animal_sit_scare: 'assets/animal/sit_scare.png',
  animal_jump1: 'assets/animal/jump1.png?v=2',
  animal_jump2: 'assets/animal/jump2.png?v=2',
  animal_jump3: 'assets/animal/jump3.png?v=2',
  animal_jump4: 'assets/animal/jump4.png',   // 老鼠上身
  animal_jump5: 'assets/animal/jump5.png',   // 曱甴上身
  animal_jump6: 'assets/animal/jump6.png',   // 蜘蛛上身
  animal_centipede: 'assets/animal/centipede.png',
  animal_cockroach: 'assets/animal/cockroach.png',
  animal_grasshopper: 'assets/animal/grasshopper.png',
  animal_mouse: 'assets/animal/mouse.png',
  animal_snake: 'assets/animal/snake.png',
  animal_spider: 'assets/animal/spider.png',
};

// 蛇蟲鼠蟻：每撳一下掟一隻隨機動物入房，Benny 嚇到周圍跳；冇完結，撳「放過佢」返回
// 位置用房間相（1536×1024）嘅比例座標；h 係高度（× 房間高度），speed 係每秒行幾多個房間闊度
const ANIMAL = {
  sofa: { x: 0.49, y: 0.80, h: 0.40 },
  floor: [0.80, 0.97],      // 地下嘅 y 範圍
  wall: [0.10, 0.60],       // 牆身嘅 y 範圍（蜘蛛用）
  bennyH: 0.40, hopSec: 0.7,
  jumpPoses: 6,
  jumpScale: [1, 1, 1, 1, 0.82, 0.82, 0.82],  // 4–6 係上半身相，畫細少少等個頭同其他姿勢差唔多大
  // 直度手機用另一張直身房間相（853×1844）：梳化喺中間偏上，地下由一半開始；
  // 呢間房高咗一倍，所以人同動物嘅大細（佔房間高度嘅比例）乘 scale
  // depth：喺地下越近畫面底（越近鏡頭）畫得越大
  portrait: { sofa: { x: 0.50, y: 0.47, h: 0.17 }, floor: [0.52, 0.93], wall: [0.10, 0.40], scale: 0.6, depth: 0.7 },
  scareDelay: 0.8,          // 入嚟幾耐之後由坐定轉做嚇親
  maxCritters: 15, score: 20,
  kinds: {
    grasshopper: { h: 0.091, where: 'floor', speed: 0.16, move: 'hop' },
    spider:      { h: 0.07, where: 'wall',  speed: 0.05, move: 'crawl' },
    snake:       { h: 0.095, where: 'floor', speed: 0.07, move: 'slither' },
    mouse:       { h: 0.072, where: 'floor', speed: 0.30, move: 'dash' },
    cockroach:   { h: 0.09, where: 'floor', speed: 0.26, move: 'dash' },
    centipede:   { h: 0.12, where: 'floor', speed: 0.06, move: 'slither' },
  },
};
const ANIMAL_VOICES = [
  { src: 'assets/animal/animal_v1.m4a', text: '唔好再掟啦，我投降啦！' },
  { src: 'assets/animal/animal_v2.m4a', text: '好驚啊，好驚呀，快啲停呀！' },
  { src: 'assets/animal/animal_v3.m4a', text: '放過我啦好冇？' },
  { src: 'assets/animal/animal_v4.m4a', text: '救命呀，我閃！' },
  { src: 'assets/animal/animal_v5.m4a', text: '玩呢啲？' },
  { src: 'assets/animal/animal_v6.m4a', text: '我做鬼都唔會放過你！' },
  { src: 'assets/animal/animal_v7.m4a', text: '頂你個肺！' },
  { src: 'assets/animal/animal_v8.m4a', text: '你哋冇人性㗎，咁樣蝦我！' },
  { src: 'assets/animal/animal_v9.m4a', text: '黐線㗎，黐線㗎！' },
];

// 燒碳（救人版）：碳爐燒緊、窗閂住，Benny 越嚟越辛苦；玩家要開窗同熄碳爐救佢
// 位置用房間相（1536×1024）嘅比例座標；y 係底部（腳）
const BURN = {
  stages: [0, 2.5, 6, 10],             // 辛苦程度轉階段嘅秒數（只喺有危險時計）
  rescueScore: 600, perSec: 30, minScore: 100,
  window: { x: 0.16, y: 0.55, h: 0.30 },
  furnace: { x: 0.47, y: 0.93, h: 0.20 },
  sofa: { x: 0.79, y: 0.90, h: 0.46 },  // 坐喺梳化
  floor: { x: 0.74, y: 0.97, h: 0.50 }, // 辛苦到跪喺梳化前面
  // 直度手機用另一張直身房間相（853×1844），位置用嗰張相嘅比例：窗喺左面牆，梳化喺右邊
  portrait: {
    window: { x: 0.19, y: 0.32, h: 0.125 },
    furnace: { x: 0.30, y: 0.80, h: 0.10 },
    sofa: { x: 0.71, y: 0.62, h: 0.22 },
    floor: { x: 0.68, y: 0.80, h: 0.25 },
  },
};
const BURN_VOICES = [
  { src: 'assets/burn/burn_v1.m4a', text: '快啲開窗，好辛苦呀！' },
  { src: 'assets/burn/burn_v2.m4a', text: '我唞唔到氣，我就死啦！' },
  { src: 'assets/burn/burn_v3.m4a', text: '老友，俾條生路嚟行得唔得？' },
  { src: 'assets/burn/burn_v4.m4a', text: '冇喇冇啦，啲鋪我死梗啦！' },
  { src: 'assets/burn/burn_v5.m4a', text: '舒服晒！' },
];
const BURN_RELIEF = 4;

// IFC 天台：天台分 9 格，主角每秒自動向右一格；推一下向左一格，喺最左再推就跌落去
const IFC = {
  cells: 9,
  stepSec: 1,
  fallScore: 500, perSec: 10, minScore: 100,
  intro: 'assets/ifc/intro.mp4',
  ending: 'assets/ifc/ending.mp4',
  nearEdge: 2,          // 第 0–2 格算近邊緣
};
const IFC_VOICES = [
  { src: 'assets/ifc/ifc_v1.m4a', text: '唔好推我啦，呢度好高呀！' },
  { src: 'assets/ifc/ifc_v2.m4a', text: '唔好再推我啦，我真係好驚呀！' },
  { src: 'assets/ifc/ifc_v3.m4a', text: '我唔想死住呀！' },
  { src: 'assets/ifc/ifc_v4.m4a', text: '好在好在，嚇死我咩？' },
  { src: 'assets/ifc/ifc_v5.m4a', text: '黃輝救我呀！' },
];
const IFC_NEAR = [0, 1, 2], IFC_RELIEF = 3, IFC_FALL = 4;

// 懲罰相入面頭頂同塊面嘅位置（以相片闊高比例計）；tilt 係個頭嘅傾斜角度
const PUNCH = {
  benny_idle: { top: { x: 0.50, y: 0.04 }, face: { x: 0.50, y: 0.22 }, tilt: 0 },
  benny_hit1: { top: { x: 0.32, y: 0.03 }, face: { x: 0.34, y: 0.25 }, tilt: -0.25 },
  benny_hit2: { top: { x: 0.69, y: 0.03 }, face: { x: 0.67, y: 0.24 }, tilt: 0.25 },
  benny_hit3: { top: { x: 0.50, y: 0.03 }, face: { x: 0.51, y: 0.21 }, tilt: 0 },
  benny_hit4: { top: { x: 0.50, y: 0.03 }, face: { x: 0.50, y: 0.21 }, tilt: 0 },
};
const HIT_KEYS = ['benny_hit1', 'benny_hit2', 'benny_hit3', 'benny_hit4'];

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
  { src: 'assets/audio/voice/v6_houlantung.m4a', text: '好撚痛呀！' },
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
// 公園主關要用嘅圖先載入；懲罰相、IFC 天台、燒碳嘅圖等開始畫面出咗之後喺背景慢慢載，手機開得快啲
const isLateImage = (k) => /^(benny_idle|benny_hit|ifc_|burn_|animal_|brothel_|fight_)/.test(k);
function loadImages(keys, showProgress) {
  let done = 0;
  return Promise.all(keys.map((k) => new Promise((res) => {
    const im = new Image();
    im.onload = () => { IMG[k] = im; done++; if (showProgress) $('load-text').textContent = `載入緊… ${done}/${keys.length}`; res(); };
    im.onerror = () => { IMG[k] = null; done++; res(); };
    im.src = IMG_SRC[k];
  })));
}
let lateImagesReady = null, lateImagesDone = false;
// 小遊戲開始前用：背景圖未載完就顯示「載入緊…」，載完先開始
function whenLateImagesReady(fn) {
  if (lateImagesDone || !lateImagesReady) { fn(); return; }
  if (game) floatText('載入緊…', W / 2, H * 0.45, '#7a6a85', 1);
  lateImagesReady.then(fn);
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
    this.ifcVoices = IFC_VOICES.map((v) => { const a = new Audio(v.src); a.preload = 'auto'; return a; });
    this.burnVoices = BURN_VOICES.map((v) => { const a = new Audio(v.src); a.preload = 'auto'; return a; });
    this.animalVoices = ANIMAL_VOICES.map((v) => { const a = new Audio(v.src); a.preload = 'auto'; return a; });
    this.brothelVoices = BROTHEL_VOICES.map((v) => { const a = new Audio(v.src); a.preload = 'auto'; return a; });
    this.fightVoices = FIGHT_VOICES.map((src) => { const a = new Audio(src); a.preload = 'auto'; return a; });
    [...this.voices, ...this.ifcVoices, ...this.burnVoices, ...this.animalVoices, ...this.brothelVoices, ...this.fightVoices].forEach((a) => { a.muted = true; const p = a.play(); if (p) p.then(() => { a.pause(); a.currentTime = 0; a.muted = this.muted; }).catch(() => { a.muted = this.muted; }); });
  },

  setMuted(m) {
    this.muted = m; store.set('kdyz-muted', m ? '1' : '0');
    if (this.master) this.master.gain.value = m ? 0 : 1;
    [...this.voices, ...(this.ifcVoices || []), ...(this.burnVoices || []), ...(this.animalVoices || []), ...(this.brothelVoices || []), ...(this.fightVoices || [])].forEach((a) => { a.muted = m; });
    const v = document.getElementById('ifc-video'); if (v) v.muted = m;
    $('btn-mute').textContent = m ? '🔇' : '🔊';
  },

  // IFC 天台語音：同一時間只播一段；force 用嚟跌落去嗰句一定要播
  ifcVoice(i, force = false) {
    const now = performance.now();
    if (!force && now - (this.ifcAt || 0) < 1400) return null;
    this.ifcAt = now;
    (this.ifcVoices || []).forEach((a) => { if (!a.paused) a.pause(); });
    const a = this.ifcVoices && this.ifcVoices[i];
    if (a) { try { a.currentTime = 0; const p = a.play(); if (p) p.catch(() => {}); } catch (e) { /* 忽略 */ } }
    return IFC_VOICES[i].text;
  },

  // 燒碳語音：同 IFC 一樣，同一時間只播一段
  burnVoice(i, force = false) {
    const now = performance.now();
    if (!force && now - (this.burnAt || 0) < 1800) return null;
    this.burnAt = now;
    (this.burnVoices || []).forEach((a) => { if (!a.paused) a.pause(); });
    const a = this.burnVoices && this.burnVoices[i];
    if (a) { try { a.currentTime = 0; const p = a.play(); if (p) p.catch(() => {}); } catch (e) { /* 忽略 */ } }
    return BURN_VOICES[i].text;
  },

  // 蛇蟲鼠蟻語音：隨機、唔連續重複同一句，同一時間只播一段
  // 對打招式聲音：0 鑊氣波、1 衝天鑊鏟、2 旋風拖鞋
  fightVoice(i) {
    (this.fightVoices || []).forEach((a) => { if (!a.paused) a.pause(); });
    const a = this.fightVoices && this.fightVoices[i];
    if (a) { try { a.currentTime = 0; const p = a.play(); if (p) p.catch(() => {}); } catch (e) { /* 忽略 */ } }
  },

  // 妓寨語音：每撳一次女子都播一句（隨機、唔連續重複），新嗰句會截斷舊嗰句
  brothelVoice() {
    let i; do { i = Math.floor(Math.random() * BROTHEL_VOICES.length); } while (i === this.lastBrothel && BROTHEL_VOICES.length > 1);
    this.lastBrothel = i;
    (this.brothelVoices || []).forEach((a) => { if (!a.paused) a.pause(); });
    const a = this.brothelVoices && this.brothelVoices[i];
    if (a) { try { a.currentTime = 0; const p = a.play(); if (p) p.catch(() => {}); } catch (e) { /* 忽略 */ } }
    return BROTHEL_VOICES[i].text;
  },

  animalVoice() {
    const now = performance.now();
    if (now - (this.animalAt || 0) < 1500) return null;
    this.animalAt = now;
    let i; do { i = Math.floor(Math.random() * ANIMAL_VOICES.length); } while (i === this.lastAnimal && ANIMAL_VOICES.length > 1);
    this.lastAnimal = i;
    (this.animalVoices || []).forEach((a) => { if (!a.paused) a.pause(); });
    const a = this.animalVoices && this.animalVoices[i];
    if (a) { try { a.currentTime = 0; const p = a.play(); if (p) p.catch(() => {}); } catch (e) { /* 忽略 */ } }
    return ANIMAL_VOICES[i].text;
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
  game.mini = { hits: 0, score: 0, t: 0, tier: 0, bumps: 0, charred: 0, lastHit: -1, swing: 0, hitPt: null, count: 3, motion: false, milestone: 0, topTier: 0, hitKey: HIT_KEYS[0] };
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
  // 未打過就用原本張相；打咗之後停留喺上一下被打嘅相，直到下一下先換
  return M.hits > 0 ? M.hitKey : 'benny_idle';
}

function punishHit(x, y) {
  const M = game.mini;
  const b = bigTargetRect();
  // 每下隨機揀一張被打相，唔會連續兩下同一張
  let k; do { k = pick(HIT_KEYS); } while (k === M.hitKey && HIT_KEYS.length > 1);
  M.hitKey = k;
  const face = punchPoint(k, 'face'), top = punchPoint(k, 'top');
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
      if (M.count <= 0) { game.phase = 'punish'; punishButtons(true); Sound.sfx('go'); floatText('開打！', W / 2, H * 0.35, '#e86a8c', 1.6); }
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
  game.phase = 'done'; punishButtons(false);
  Sound.sfx('end'); floatText('收工！', W / 2, H * 0.35, '#e86a8c', 1.5);
  setTimeout(showResult, 1000);
}

// ============================================================
// IFC 天台
// ============================================================
// 全螢幕播片，播完或者撳「跳過影片」就 onEnd()
function playIfcVideo(src, onEnd) {
  const v = $('ifc-video');
  let done = false;
  let errTimer = 0;
  const finish = () => {
    if (done) return; done = true;
    clearTimeout(errTimer);
    v.onended = null; v.onerror = null; $('btn-skip').onclick = null;
    v.pause(); v.removeAttribute('src'); v.load();
    hide('ifc-video-layer'); hide('ifc-video-msg');
    onEnd();
  };
  v.muted = Sound.muted;
  v.src = src;
  v.onended = finish;
  // 片載唔到：講清楚原因，3 秒後自動繼續，唔會卡死
  v.onerror = () => {
    $('ifc-video-msg').textContent = location.protocol === 'file:'
      ? '影片播唔到：請用 serve.ps1 開遊戲（唔好直接雙擊 index.html）'
      : '影片載入唔到，請檢查網絡或者伺服器有冇開緊';
    show('ifc-video-msg');
    errTimer = setTimeout(finish, 3000);
  };
  $('btn-skip').onclick = finish;
  hide('ifc-video-msg');
  show('ifc-video-layer');
  const p = v.play();
  // 瀏覽器唔准有聲自動播：改靜音播，片照睇得到
  if (p) p.catch(() => { v.muted = true; v.play().catch(() => {}); });
}

function startIfc() {
  if (!game || game.phase !== 'punish' || game.paused) return;
  punishButtons(false);
  game.phase = 'ifcIntro';
  playIfcVideo(IFC.intro, beginRoof);
}

function beginRoof() {
  const mid = Math.floor(IFC.cells / 2);
  game.ifc = { cell: mid, x: mid, t: 0, stepT: 0, face: 1, bob: 0, pushes: 0, wasNear: false, bubble: null, fallT: 0, score: 0 };
  game.phase = 'ifc';
  show('ifc-hud');
}

function ifcSay(text, t = 1.6) { if (text) game.ifc.bubble = { text, t }; }

function ifcPush() {
  if (!game || game.phase !== 'ifc' || game.paused) return;
  const I = game.ifc;
  I.pushes++; I.face = -1;
  Sound.sfx('miss');
  if (I.cell === 0) { ifcFall(); return; }
  I.cell--;
  if (I.cell <= IFC.nearEdge) { I.wasNear = true; ifcSay(Sound.ifcVoice(pick(IFC_NEAR))); }
}

function ifcFall() {
  const I = game.ifc;
  game.phase = 'ifcFall'; I.fallT = 0;
  hide('ifc-hud');
  I.score = Math.max(IFC.minScore, IFC.fallScore - IFC.perSec * Math.floor(I.t));
  ifcSay(Sound.ifcVoice(IFC_FALL, true), 2);
  game.shake = 0.3;
}

// 返回連打懲罰；add 係 IFC 天台得分（放過佢 = 0）
function endIfc(add) {
  const M = game.mini;
  game.phase = 'punish'; game.ifc = null;
  hide('ifc-hud'); punishButtons(true);
  (Sound.ifcVoices || []).forEach((a) => { if (!a.paused) a.pause(); });
  if (add > 0) {
    M.score += add; M.ifcFell = true;
    floatText(`IFC 天台 +${add}`, W / 2, H * 0.4, '#4f7fd9', 1.3);
    Sound.sfx('level');
  }
}

function ifcCellX(c) { return W * (0.12 + 0.76 * c / (IFC.cells - 1)); }

function updateIfc(dt) {
  const I = game.ifc;
  if (I.bubble) { I.bubble.t -= dt; if (I.bubble.t <= 0) I.bubble = null; }
  if (game.phase === 'ifc') {
    I.t += dt; I.stepT += dt;
    while (I.stepT >= IFC.stepSec) {
      I.stepT -= IFC.stepSec;
      if (I.cell < IFC.cells - 1) {
        I.cell++; I.face = 1;
        // 由邊緣行返出中間：鬆一口氣
        if (I.wasNear && I.cell >= Math.floor(IFC.cells / 2)) { I.wasNear = false; ifcSay(Sound.ifcVoice(IFC_RELIEF)); }
      }
    }
    I.x += (I.cell - I.x) * Math.min(1, dt * 12);
    if (Math.abs(I.cell - I.x) > 0.03) I.bob += dt;
  } else if (game.phase === 'ifcFall') {
    I.fallT += dt;
    if (I.fallT >= 1.4) {
      const add = I.score;
      game.phase = 'ifcEnding';
      playIfcVideo(IFC.ending, () => endIfc(add));
    }
  }
}

function drawIfc() {
  const I = game.ifc;
  // 背景好闊（2.5:1），以圖片 48% 闊嗰度為中心裁，等手機都見到天台地台同左邊邊緣
  const bg = IMG.ifc_bg;
  if (bg) {
    const s = Math.max(W / bg.width, H / bg.height), dw = bg.width * s, dh = bg.height * s;
    const ox = clamp(W / 2 - 0.48 * dw, W - dw, 0);
    ctx.drawImage(bg, ox, (H - dh) / 2, dw, dh);
  } else drawCover('ifc_bg');
  const groundY = H * 0.86, h = Math.min(H * 0.5, W * 0.9);
  // 地上 9 格，最左嗰格紅色提示邊緣
  ctx.save();
  for (let c = 0; c < IFC.cells; c++) {
    ctx.beginPath(); ctx.ellipse(ifcCellX(c), groundY, W * 0.035, H * 0.012, 0, 0, Math.PI * 2);
    ctx.fillStyle = c === 0 ? 'rgba(232,64,79,.55)' : c === I.cell ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.25)'; ctx.fill();
  }
  ctx.font = `900 ${Math.max(14, U * 0.035)}px ${getComputedStyle(document.body).fontFamily}`;
  ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.fillStyle = '#e8404f';
  ctx.strokeText('⚠ 邊緣', ifcCellX(0), groundY + H * 0.045); ctx.fillText('⚠ 邊緣', ifcCellX(0), groundY + H * 0.045);
  ctx.restore();

  // 主角
  // 主角永遠面向同一邊，左右移動都唔反轉
  let fx = W * (0.12 + 0.76 * I.x / (IFC.cells - 1)), fy = groundY, opt = {};
  if (game.phase === 'ifc' || game.phase === 'ifcIntro') {
    fy -= Math.abs(Math.sin(I.bob * 10)) * U * 0.012;
    opt.rot = Math.sin(I.bob * 10) * 0.04;
  } else {
    // 跌落去：向左飛出、轉、縮細
    const k = Math.min(1, I.fallT / 1.2);
    fx -= k * W * 0.35; fy += k * k * H * 0.5 - Math.sin(k * Math.PI) * H * 0.08;
    opt.rot = -k * 2.2; opt.sx = opt.sy = 1 - k * 0.6;
  }
  const r = drawSprite('ifc_benny', fx, fy, h, opt);
  if (I.bubble) drawBubble(I.bubble.text, fx, r.y, '#4f7fd9');

  // 頂部資料
  const ff = getComputedStyle(document.body).fontFamily, fs = Math.max(17, U * 0.045);
  ctx.save(); ctx.font = `900 ${fs}px ${ff}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const s = `🏙 IFC 天台 ・ 已撐 ${Math.floor(I.t)} 秒 ・ 推咗 ${I.pushes} 下`;
  ctx.lineWidth = fs * 0.22; ctx.strokeStyle = '#fff'; ctx.strokeText(s, W / 2, Math.max(78, U * 0.16));
  ctx.fillStyle = '#34589f'; ctx.fillText(s, W / 2, Math.max(78, U * 0.16));
  ctx.restore();
}

// 懲罰畫面三個掣（完成、IFC 天台、燒碳）一齊出、一齊收
function punishButtons(on) {
  ['btn-done', 'btn-ifc', 'btn-burn', 'btn-animal', 'btn-brothel', 'btn-fight'].forEach((id) => (on ? show(id) : hide(id)));
}

// ============================================================
// 街坊對打：玩家操控茶餐廳師傅強叔打 Benny；Benny 自己行同閃避。唔限時，撳「放過佢」返回
// 位置 x 用畫面比例；強叔未有圖就用暫代圖形，新圖放入 assets/fight/ 就自動換
// ============================================================
const FIGHT = {
  hp: 100, h: 0.36,           // 人物高度 × min(H, W × 1.5)
  moveSpeed: 0.38, bennySpeed: 0.12, dodgeSpeed: 0.55, dodgeChance: 0.3,   // 每秒 × 畫面闊度
  specialCd: 2, koTime: 2,
  punch: { dmg: 8, score: 20, time: 0.3 },
  wave: { dmg: 20, score: 100, prepare: 0.6, time: 0.4, speed: 0.9 },
  upper: { dmg: 25, score: 120, dash: 1.4, time: 0.45 },
  spin: { dmg: 18, score: 100, speed: 1.1, back: 0.6 },
  koScore: 300,
};
const FIGHT_VOICES = ['assets/fight/rival_v1.mp3', 'assets/fight/rival_v2.mp3', 'assets/fight/rival_v3.mp3'];
const fightUnit = () => Math.min(H, W * 1.5);
const fightGround = () => Math.min(H * (W / H < 0.75 ? 0.77 : 0.82), H - 150);
// 強叔每張圖（正方形）入面嘅位置：ax／ay 係兩腳中間同腳底，bh 係身高佔圖片幾多
const RIVAL_POSE = {
  fight_rival:          { ax: 0.56,  ay: 0.87, bh: 0.83 },
  fight_rival_punch:    { ax: 0.59,  ay: 0.87, bh: 0.78 },
  fight_rival_prepare:  { ax: 0.575, ay: 0.94, bh: 0.74 },
  fight_rival_wave:     { ax: 0.745, ay: 0.82, bh: 0.655 },
  fight_rival_uppercut: { ax: 0.47,  ay: 0.90, bh: 0.70 },
  fight_rival_spin:     { ax: 0.575, ay: 0.82, bh: 0.70 },
};

function startFight() {
  if (!game || game.phase !== 'punish' || game.paused) return;
  punishButtons(false); show('fight-hud');
  game.fight = {
    t: 0, hp: FIGHT.hp, score: 0, kos: 0, cd: 0, move: 0, wave: null, koT: 0,
    b: { x: 0.2, dest: 0.3, state: 'idle', T: 0, y: 0, vy: 0, dodge: 0, dodgeDir: 0, bob: 0, bubble: null },
    r: { x: 0.8, state: 'idle', T: 0, y: 0, hit: false, home: 0.8, dir: -1 },
  };
  game.phase = 'fight';
}

function endFight() {
  const F = game.fight, M = game.mini;
  game.phase = 'punish'; game.fight = null;
  hide('fight-hud'); punishButtons(true);
  (Sound.fightVoices || []).forEach((a) => { if (!a.paused) a.pause(); });
  if (F.score > 0) { M.score += F.score; M.fightKOs = (M.fightKOs || 0) + F.kos; floatText(`街坊對打 +${F.score}`, W / 2, H * 0.4, '#7a4fd0', 1.3); }
}

// 出招前 Benny 有機會閃開
function fightMaybeDodge(F) {
  if (F.b.state !== 'idle' || Math.random() > FIGHT.dodgeChance) return;
  F.b.dodge = 0.4; F.b.dodgeDir = F.b.x < F.r.x ? -1 : 1;
}
const fightReady = (F) => F && F.r.state === 'idle' && F.b.state !== 'ko';

function fightPunch() {
  const F = game && game.fight;
  if (!fightReady(F)) return;
  F.r.state = 'punch'; F.r.T = 0; F.r.hit = false;
  fightMaybeDodge(F); Sound.sfx('bat');
}
function fightSpecialStart(F, voice) {
  F.cd = FIGHT.specialCd; F.r.T = 0; F.r.hit = false;
  Sound.fightVoice(voice); fightMaybeDodge(F);
}
function fightWave() {
  const F = game && game.fight;
  if (!fightReady(F) || F.cd > 0) return;
  F.r.state = 'prepare'; fightSpecialStart(F, 0);
}
function fightUppercut() {
  const F = game && game.fight;
  if (!fightReady(F) || F.cd > 0) return;
  F.r.state = 'dash'; fightSpecialStart(F, 1);
}
function fightSpin() {
  const F = game && game.fight;
  if (!fightReady(F) || F.cd > 0) return;
  F.r.state = 'spin'; F.r.home = F.r.x;
  // 由右至左橫過畫面；已經喺最左就由左至右
  F.r.dir = F.r.x > 0.25 ? -1 : 1;
  fightSpecialStart(F, 2);
}

function fightHit(atk, kind) {
  const F = game.fight, b = F.b;
  if (b.state === 'ko') return;
  F.hp = Math.max(0, F.hp - atk.dmg); F.score += atk.score;
  const fx = b.x * W, fy = fightGround() - fightUnit() * FIGHT.h * 0.6;
  addFx({ img: 'fx_pa', word: kind === 'shock' ? '轟！' : '啪！', x: fx, y: fy, size: U * 0.2, life: 0.35, grow: true, rot: rand(-0.3, 0.3) });
  floatText(`+${atk.score}`, fx, fy - U * 0.06, '#e86a8c', 0.9);
  game.shake = Math.max(game.shake, 0.15);
  const said = Sound.voice();
  if (said) b.bubble = { text: said, t: 1.2 };
  if (kind === 'air') { b.state = 'air'; b.vy = -1.5; b.y = 0; }
  else { b.state = kind === 'shock' ? 'shock' : 'hit'; b.T = kind === 'shock' ? 0.55 : 0.35; }
  if (F.hp <= 0) {
    F.score += FIGHT.koScore; F.kos++; F.koT = FIGHT.koTime;
    if (kind !== 'air') { b.state = 'ko'; b.T = FIGHT.koTime; }
    floatText(`KO！+${FIGHT.koScore}`, W / 2, H * 0.3, '#e8404f', 1.6);
    Sound.sfx('level');
  }
}

function updateFight(dt) {
  const F = game.fight, b = F.b, r = F.r, u = fightUnit();
  F.t += dt; F.cd = Math.max(0, F.cd - dt);
  if (b.bubble) { b.bubble.t -= dt; if (b.bubble.t <= 0) b.bubble = null; }
  const reach = (u * FIGHT.h * 0.5) / W, close = () => Math.abs(b.x - r.x) < reach;

  // 強叔
  if (r.state === 'idle' && F.move) r.x = clamp(r.x + F.move * FIGHT.moveSpeed * dt, 0.08, 0.92);
  r.T += dt;
  if (r.state === 'punch') {
    // 出拳圖隻手好長，判定距離 = 手臂長度 + Benny 半個身闊
    if (!r.hit && r.T > 0.12) { r.hit = true; if (Math.abs(b.x - r.x) * W < u * FIGHT.h * 0.9) fightHit(FIGHT.punch, 'hit'); }
    if (r.T > FIGHT.punch.time) r.state = 'idle';
  } else if (r.state === 'prepare') {
    if (r.T > FIGHT.wave.prepare) {
      r.state = 'wave'; r.T = 0;
      F.wave = { x: r.x + (b.x < r.x ? -0.08 : 0.08), dir: b.x < r.x ? -1 : 1, t: 0 };
      Sound.sfx('flame');
    }
  } else if (r.state === 'wave') {
    if (r.T > FIGHT.wave.time) r.state = 'idle';
  } else if (r.state === 'dash') {
    const d = b.x - r.x;
    r.x += Math.sign(d) * Math.min(Math.abs(d), FIGHT.upper.dash * dt);
    if (close() || r.T > 0.6) { r.state = 'upper'; r.T = 0; r.hit = false; Sound.sfx('mace'); }
  } else if (r.state === 'upper') {
    r.y = Math.sin(Math.min(1, r.T / FIGHT.upper.time) * Math.PI) * u * 0.22;
    if (!r.hit && r.T > 0.1) { r.hit = true; if (close()) fightHit(FIGHT.upper, 'air'); }
    if (r.T > FIGHT.upper.time) { r.state = 'idle'; r.y = 0; }
  } else if (r.state === 'spin') {
    r.x += r.dir * FIGHT.spin.speed * dt;
    if (!r.hit && close()) { r.hit = true; fightHit(FIGHT.spin, 'hit'); Sound.sfx('gun'); }
    if (r.x < 0.08 || r.x > 0.92) { r.x = clamp(r.x, 0.08, 0.92); r.state = 'back'; }
  } else if (r.state === 'back') {
    const d = r.home - r.x;
    r.x += Math.sign(d) * Math.min(Math.abs(d), FIGHT.spin.back * dt);
    if (Math.abs(d) < 0.005) r.state = 'idle';
  }

  // 鑊氣波
  if (F.wave) {
    F.wave.x += F.wave.dir * FIGHT.wave.speed * dt; F.wave.t += dt;
    if (Math.abs(F.wave.x - b.x) < reach * 0.7 && b.state !== 'ko') { F.wave = null; fightHit(FIGHT.wave, 'shock'); }
    else if (F.wave.x < -0.1 || F.wave.x > 1.1) F.wave = null;
  }

  // Benny
  b.bob += dt;
  if (F.koT > 0) { F.koT -= dt; if (F.koT <= 0) { F.hp = FIGHT.hp; b.state = 'idle'; b.y = 0; b.bubble = { text: '仲嚟？', t: 1 }; } }
  if (b.state === 'air') {
    b.vy += 4 * dt; b.y += b.vy * dt;
    if (b.y >= 0) { b.y = 0; b.state = F.hp <= 0 ? 'ko' : 'hit'; b.T = F.hp <= 0 ? F.koT : 0.4; Sound.sfx('bat'); }
  } else if (b.state === 'hit' || b.state === 'shock') {
    b.T -= dt; if (b.T <= 0) b.state = F.hp <= 0 ? 'ko' : 'idle';
  } else if (b.state === 'idle') {
    if (b.dodge > 0) {
      b.dodge -= dt; b.x = clamp(b.x + b.dodgeDir * FIGHT.dodgeSpeed * dt, 0.08, 0.92);
    } else {
      const d = b.dest - b.x;
      if (Math.abs(d) < 0.01) b.dest = rand(0.08, 0.92);
      else b.x += Math.sign(d) * FIGHT.bennySpeed * dt;
    }
  }
}

// 強叔暫代圖形：未有 assets/fight/rival*.png 先用
function drawRivalPlaceholder(x, y, h, state, flip) {
  const w = h * 0.55, s = flip ? -1 : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, 1); if (state === 'spin') ctx.rotate(game.t * 25);
  ctx.lineWidth = 3; ctx.strokeStyle = '#222';
  const box = (c, a, b, cw, ch) => { ctx.fillStyle = c; ctx.fillRect(a, b, cw, ch); ctx.strokeRect(a, b, cw, ch); };
  box('#8a8f98', -w * 0.3, -h * 0.34, w * 0.25, h * 0.34); box('#8a8f98', w * 0.05, -h * 0.34, w * 0.25, h * 0.34);
  box('#f4f1e6', -w * 0.42, -h * 0.72, w * 0.84, h * 0.4); box('#d9c8a0', -w * 0.3, -h * 0.58, w * 0.6, h * 0.3);
  ctx.fillStyle = '#f1c9a0'; ctx.beginPath(); ctx.arc(0, -h * 0.84, h * 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 手：向左（面向 Benny）
  const armUp = state === 'prepare', armOut = ['punch', 'wave', 'spin'].includes(state);
  ctx.fillStyle = '#f1c9a0';
  if (armUp) { ctx.fillRect(-w * 0.5, -h * 1.05, w * 0.16, h * 0.4); ctx.fillRect(w * 0.34, -h * 1.05, w * 0.16, h * 0.4); }
  else if (state === 'upper') ctx.fillRect(-w * 0.55, -h * 1.1, w * 0.18, h * 0.5);
  else if (armOut) ctx.fillRect(-w * 1.05, -h * 0.68, w * 0.7, h * 0.12);
  else ctx.fillRect(-w * 0.55, -h * 0.68, w * 0.16, h * 0.34);
  ctx.restore();
  ctx.save(); ctx.font = `900 ${Math.max(12, h * 0.08)}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
  ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.strokeText('強叔', x, y + h * 0.1); ctx.fillStyle = '#333'; ctx.fillText('強叔', x, y + h * 0.1); ctx.restore();
}

function drawFight() {
  const F = game.fight, b = F.b, r = F.r, u = fightUnit(), g = fightGround(), h = u * FIGHT.h;
  // 背景：直度用直身，闊度用闊身；未有圖就用公園
  const bgKey = W / H < 0.75 ? 'fight_bg_portrait' : 'fight_bg_landscape';
  const alt = bgKey === 'fight_bg_portrait' ? 'fight_bg_landscape' : 'fight_bg_portrait';
  drawCover(IMG[bgKey] ? bgKey : IMG[alt] ? alt : layout.bg);

  // Benny（圖片面向右，對手喺左邊就反轉）
  const bFlip = r.x < b.x;
  let bKey = 'fight_benny', bH = h, bx = b.x * W, by = g + b.y * h, bOpt = { flip: bFlip };
  if (b.state === 'hit' || b.state === 'ko' || b.state === 'air') { bKey = 'fight_benny_hit'; bH = h * 0.75; }
  else if (b.state === 'shock') { bKey = 'fight_benny_shock'; bH = h * 1.1; bx += Math.sin(game.t * 60) * U * 0.006; }
  else { by -= Math.abs(Math.sin(b.bob * 8)) * u * 0.008; }
  const br = drawSprite(bKey, bx, by, bH, bOpt);

  // 強叔（圖片面向左，Benny 喺右邊就反轉）
  const rFlip = r.state === 'spin' || r.state === 'back' ? r.dir > 0 : b.x > r.x;
  const key = { punch: 'fight_rival_punch', prepare: 'fight_rival_prepare', wave: 'fight_rival_wave', dash: 'fight_rival', upper: 'fight_rival_uppercut', spin: 'fight_rival_spin' }[r.state] || 'fight_rival';
  const rx = r.x * W, ry = g - r.y;
  const useKey = IMG[key] ? key : 'fight_rival';
  if (IMG[useKey]) {
    // 用腳底位置對齊，出招轉圖時個人唔會跳位
    const P = RIVAL_POSE[useKey], S = h / P.bh, off = (0.5 - P.ax) * S;
    drawSprite(useKey, rx + (rFlip ? -off : off), ry + (1 - P.ay) * S, S, { flip: rFlip, rot: r.state === 'spin' ? Math.sin(game.t * 30) * 0.08 : 0 });
  } else drawRivalPlaceholder(rx, ry, h, r.state, rFlip);

  // 鑊氣波
  if (F.wave) {
    const wx = F.wave.x * W, wy = g - h * 0.55, s = h * 0.6;
    if (IMG.fight_wave) drawSprite('fight_wave', wx, wy + s / 2, s, { flip: F.wave.dir > 0 });
    else {
      const gr = ctx.createRadialGradient(wx, wy, s * 0.05, wx, wy, s * 0.5);
      gr.addColorStop(0, '#fff6c0'); gr.addColorStop(0.5, '#ffb030'); gr.addColorStop(1, 'rgba(232,80,20,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(wx, wy, s * 0.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (b.bubble) drawBubble(b.bubble.text, br.x + br.w / 2, br.y, '#e86a8c');

  // 血條同分數
  const bw = Math.min(W * 0.62, 420), bx0 = (W - bw) / 2, by0 = Math.max(100, U * 0.16), bh0 = Math.max(14, U * 0.024);
  ctx.save();
  ctx.fillStyle = 'rgba(40,20,30,.75)'; roundRect(bx0 - 3, by0 - 3, bw + 6, bh0 + 6, 8); ctx.fill();
  ctx.fillStyle = F.hp > 30 ? '#ffd45c' : '#e8404f'; ctx.fillRect(bx0, by0, bw * F.hp / FIGHT.hp, bh0);
  const ff = getComputedStyle(document.body).fontFamily, fs = Math.max(15, U * 0.036);
  ctx.font = `900 ${fs}px ${ff}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const s = `🥊 Benny ・ ${fmt(F.score)} 分 ・ KO ${F.kos} 次`;
  ctx.lineWidth = fs * 0.22; ctx.strokeStyle = '#fff'; ctx.strokeText(s, W / 2, by0 + bh0 + fs);
  ctx.fillStyle = '#533396'; ctx.fillText(s, W / 2, by0 + bh0 + fs);
  ctx.restore();
  ['btn-fight-wave', 'btn-fight-upper', 'btn-fight-spin'].forEach((id) => { $(id).disabled = F.cd > 0; });
}

// ============================================================
// 妓寨：四個女子周圍行，Benny 喺中間行嚟行去；撳中女子，佢追住 Benny 5 秒，
// Benny 被迫加速走，追完 Benny 變做 scare 入面隨機一張相。唔限時，撳「放過佢啦」返回
// ============================================================
const BROTHEL_FOCUS = 0.74;   // 手機直度畫面裁圖時，以「妓寨」牌匾同大門右邊為中心
const BROTHEL = {
  girls: ['brothel_girl1', 'brothel_girl2', 'brothel_girl3', 'brothel_girl4', 'brothel_girl5', 'brothel_girl6', 'brothel_girl7', 'brothel_girl8'],
  scares: ['brothel_kiss1', 'brothel_kiss2', 'animal_jump1', 'animal_jump2', 'animal_jump3'],
  area: { x0: 0.12, x1: 0.88, y0: 0.52, y1: 0.94 },   // 地下（畫面比例），y 係腳底
  bennyArea: { x0: 0.28, x1: 0.72, y0: 0.62, y1: 0.86 },
  girlH: 0.15, bennyH: 0.30,     // 高度 × min(H, W × 1.6)；人多咗，女子畫細少少
  girlSpeed: 0.08, bennySpeed: 0.07, chaseSpeed: 0.26, fleeSpeed: 0.30,   // 每秒 × 畫面短邊
  chaseTime: 5, scareTime: 3,
};
const BROTHEL_VOICES = [
  { src: 'assets/brothel/brothel_v1.m4a', text: '人哋好掛住你啊！' },
  { src: 'assets/brothel/brothel_v2.m4a', text: '今晚我哋不醉無歸！' },
  { src: 'assets/brothel/brothel_v3.m4a', text: '你有冇掛住人哋嘅啫？' },
  { src: 'assets/brothel/brothel_v4.m4a', text: '好衰㗎你，咁耐都唔嚟搵人！' },
  { src: 'assets/brothel/brothel_v5.m4a', text: '袁公子，快啲返嚟啦！' },
];
const brothelUnit = () => Math.min(H, W * 1.6);
const randIn = (r) => ({ x: rand(r.x0, r.x1), y: rand(r.y0, r.y1) });

function startBrothel() {
  if (!game || game.phase !== 'punish' || game.paused) return;
  punishButtons(false); show('brothel-hud');
  const A = BROTHEL.area;
  game.brothel = {
    t: 0, chased: 0,
    girls: BROTHEL.girls.map((key, i, all) => ({ key, x: A.x0 + (A.x1 - A.x0) * (i + 0.5) / all.length, y: rand(A.y0, A.y1), dest: randIn(A), chase: 0, bob: rand(0, 6), bubble: null })),
    benny: { x: 0.5, y: 0.74, dest: randIn(BROTHEL.bennyArea), bob: 0, scare: null, scareT: 0, bubble: null },
  };
  game.phase = 'brothel';
}

function endBrothel() {
  game.phase = 'punish'; game.brothel = null;
  hide('brothel-hud'); punishButtons(true);
  (Sound.brothelVoices || []).forEach((a) => { if (!a.paused) a.pause(); });
}

// 用畫面比例座標行路（x 同 y 嘅像素長度唔同，用 moveToward 同一套計法）
function brothelMove(e, tx, ty, speed, dt) { return moveToward(e, tx, ty, speed, dt); }

function brothelRects() {
  const Bm = game.brothel, u = brothelUnit(), out = [];
  for (const g of Bm.girls) {
    const h = BROTHEL.girlH * u, w = h * aspect(g.key);
    out.push({ g, x: g.x * W - w / 2, y: g.y * H - h, w, h });
  }
  return out;
}

function onBrothelTap(x, y, touch) {
  const pad = touch ? U * 0.02 : 0;
  // 由最前（y 最大）嗰個開始判定
  const hit = brothelRects().sort((a, b) => b.g.y - a.g.y).find((r) => hitRect(r, x, y, pad));
  if (!hit) return;
  const g = hit.g, Bm = game.brothel;
  g.chase = BROTHEL.chaseTime; Bm.chased++;
  const said = Sound.brothelVoice();
  if (said) g.bubble = { text: said, t: 2.2 };
  floatText('💋', x, y - U * 0.03, '#e8406a', 1);
  Bm.benny.bubble = { text: pick(['唔好呀！', '救命呀！', '我走先！']), t: 1.2 };
}

function updateBrothel(dt) {
  const Bm = game.brothel, b = Bm.benny, A = BROTHEL.area, BA = BROTHEL.bennyArea;
  Bm.t += dt;
  const chasers = Bm.girls.filter((g) => g.chase > 0);
  for (const g of Bm.girls) {
    g.bob += dt;
    if (g.bubble) { g.bubble.t -= dt; if (g.bubble.t <= 0) g.bubble = null; }
    if (g.chase > 0) {
      g.chase -= dt;
      brothelMove(g, b.x, b.y + 0.01, BROTHEL.chaseSpeed, dt);
      // 追完：Benny 變做隨機一張 scare 相（唔會連續兩次同一張）
      if (g.chase <= 0) {
        let k; do { k = pick(BROTHEL.scares); } while (k === b.scare && BROTHEL.scares.length > 1);
        b.scare = k; b.scareT = BROTHEL.scareTime;
        b.bubble = { text: pick(['嗚……', '我唔想呀！', '放過我啦！']), t: 1.6 };
      }
    } else if (brothelMove(g, g.dest.x, g.dest.y, BROTHEL.girlSpeed, dt)) g.dest = randIn(A);
  }
  if (b.bubble) { b.bubble.t -= dt; if (b.bubble.t <= 0) b.bubble = null; }
  if (b.scareT > 0) { b.scareT -= dt; if (b.scareT <= 0) b.scare = null; }
  b.bob += dt;
  if (chasers.length) {
    // 俾人追：向遠離追佢嘅女子嘅方向加速走，撞邊就沿住邊走
    let dx = 0, dy = 0;
    for (const g of chasers) { const ex = (b.x - g.x) * W, ey = (b.y - g.y) * H, d = Math.hypot(ex, ey) || 1; dx += ex / d; dy += ey / d; }
    const d = Math.hypot(dx, dy) || 1;
    const tx = clamp(b.x + dx / d * 0.2, A.x0, A.x1), ty = clamp(b.y + dy / d * 0.2, A.y0, A.y1);
    brothelMove(b, tx, ty, BROTHEL.fleeSpeed, dt);
    b.dest = randIn(BA);
  } else if (brothelMove(b, b.dest.x, b.dest.y, BROTHEL.bennySpeed, dt)) b.dest = randIn(BA);
}

function drawBrothel() {
  // 鋪滿成個畫面；直度手機左右裁走，保留大門同「妓寨」牌匾
  const im = IMG.brothel_bg;
  if (!im) { ctx.fillStyle = '#3a1520'; ctx.fillRect(0, 0, W, H); }
  else {
    const s = Math.max(W / im.width, H / im.height), w = im.width * s, h = im.height * s;
    const x = clamp(W / 2 - BROTHEL_FOCUS * w, W - w, 0);
    ctx.drawImage(im, x, (H - h) / 2, w, h);
  }
  const Bm = game.brothel;
  if (!Bm) return;
  const u = brothelUnit(), b = Bm.benny, items = [], bubbles = [];
  for (const g of Bm.girls) items.push({ z: g.y, draw: () => {
    const moving = g.chase > 0 ? 18 : 7;
    const r = drawSprite(g.key, g.x * W, g.y * H - Math.abs(Math.sin(g.bob * moving)) * u * 0.008, BROTHEL.girlH * u, { rot: Math.sin(g.bob * moving) * 0.04 });
    if (g.chase > 0) { ctx.save(); ctx.strokeStyle = '#ff4f7b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, g.y * H, r.w * 0.45, u * 0.012, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    if (g.bubble) bubbles.push([g.bubble.text, r.x + r.w / 2, r.y, '#c8324f']);
  } });
  items.push({ z: b.y, draw: () => {
    const key = b.scare || 'benny_idle';
    const fleeing = Bm.girls.some((g) => g.chase > 0);
    const sp = fleeing ? 16 : 7;
    const r = drawSprite(key, b.x * W, b.y * H - Math.abs(Math.sin(b.bob * sp)) * u * 0.01, BROTHEL.bennyH * u, { rot: Math.sin(b.bob * sp) * 0.035 });
    if (b.bubble) bubbles.push([b.bubble.text, r.x + r.w / 2, r.y, '#4a3b52']);
  } });
  items.sort((p, q) => p.z - q.z).forEach((d) => d.draw());
  for (const bb of bubbles) drawBubble(...bb);

  const ff = getComputedStyle(document.body).fontFamily, fs = Math.max(16, U * 0.042);
  ctx.save(); ctx.font = `900 ${fs}px ${ff}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const s = `🏮 撳女仔，佢會追住袁公子！ ・ 追咗 ${Bm.chased} 次`;
  ctx.lineWidth = fs * 0.22; ctx.strokeStyle = '#fff'; ctx.strokeText(s, W / 2, Math.max(78, U * 0.16));
  ctx.fillStyle = '#8e2138'; ctx.fillText(s, W / 2, Math.max(78, U * 0.16));
  ctx.restore();
}

// ============================================================
// 蛇蟲鼠蟻
// ============================================================
function startAnimal() {
  if (!game || game.phase !== 'punish' || game.paused) return;
  punishButtons(false); show('animal-hud');
  const S = animalLayout().sofa;
  game.animal = {
    t: 0, critters: [], thrown: 0, bubble: null,
    benny: { onSofa: true, x: S.x, y: S.y, fromX: S.x, fromY: S.y, toX: S.x, toY: S.y, hopT: 0, pose: 1, flip: false },
  };
  game.phase = 'animal';
}

function onAnimalTap(x, y) {
  const A = game.animal, st = animalStage();
  const u = clamp((x - st.x) / st.w, st.u0 + 0.04, st.u1 - 0.04), v = (y - st.y) / st.h;
  const kind = pick(Object.keys(ANIMAL.kinds)), K = ANIMAL.kinds[kind];
  const L = animalLayout(), band = K.where === 'wall' ? L.wall : L.floor;
  const c = { kind, u, v: clamp(v, band[0], band[1]), dir: Math.random() < 0.5 ? -1 : 1, vdir: Math.random() < 0.5 ? -1 : 1, t: 0, phase: Math.random(), nextTurn: rand(0.6, 1.6), stop: 0 };
  c.baseV = c.v;
  A.critters.push(c);
  if (A.critters.length > ANIMAL.maxCritters) A.critters.shift();
  A.thrown++;
  floatText(`+${ANIMAL.score}`, x, y - U * 0.04, '#5c9a4a', 0.8);
  Sound.sfx('miss');
  // 第一隻掟入嚟：Benny 由梳化彈起身，開始周圍跳
  if (A.benny.onSofa) { A.benny.onSofa = false; nextHop(A.benny); }
  const said = Sound.animalVoice();
  if (said) A.bubble = { text: said, t: 1.8 };
}

function nextHop(b) {
  b.fromX = b.x; b.fromY = b.y;
  const st = animalStage();
  const L = animalLayout();
  b.toX = rand(Math.max(0.14, st.u0 + 0.08), Math.min(0.86, st.u1 - 0.08)); b.toY = rand(L.floor[0] + 0.03, L.floor[1]);
  b.hopT = 0; b.pose = b.pose % ANIMAL.jumpPoses + 1; b.flip = b.toX < b.fromX;
}

function updateAnimal(dt) {
  const A = game.animal, b = A.benny;
  A.t += dt;
  if (A.bubble) { A.bubble.t -= dt; if (A.bubble.t <= 0) A.bubble = null; }
  if (!b.onSofa) {
    b.hopT += dt / ANIMAL.hopSec;
    if (b.hopT >= 1) { b.x = b.toX; b.y = b.toY; nextHop(b); }
    else { b.x = b.fromX + (b.toX - b.fromX) * b.hopT; b.y = b.fromY + (b.toY - b.fromY) * b.hopT; }
  }
  // 動物撞到睇得到嘅房間邊就掉頭（手機裁咗左右）
  const vis = animalStage(), lo = vis.u0 + 0.03, hi = vis.u1 - 0.03, L = animalLayout();
  for (const c of A.critters) {
    const K = ANIMAL.kinds[c.kind];
    c.t += dt;
    if (K.move === 'hop') {
      // 草蜢：一跳一跳，喺半空先郁
      c.phase = (c.phase + dt / 0.8) % 1;
      if (c.phase < 0.55) c.u += c.dir * K.speed * dt * 1.8;
    } else if (K.move === 'crawl') {
      // 蜘蛛：喺牆上周圍爬，間中轉方向
      c.nextTurn -= dt;
      if (c.nextTurn <= 0) { c.nextTurn = rand(0.8, 2); c.dir = Math.random() < 0.5 ? -1 : 1; c.vdir = Math.random() < 0.5 ? -1 : 1; }
      c.u += c.dir * K.speed * dt; c.v += c.vdir * K.speed * 0.8 * dt;
      if (c.v < L.wall[0] || c.v > L.wall[1]) { c.vdir *= -1; c.v = clamp(c.v, L.wall[0], L.wall[1]); }
    } else if (K.move === 'slither') {
      // 蛇／蜈蚣：左右扭住行
      c.u += c.dir * K.speed * dt;
      c.v = c.baseV + Math.sin(c.t * 3) * 0.012;
    } else {
      // 老鼠／曱甴：快速亂竄，會停一停、突然轉頭
      c.nextTurn -= dt;
      if (c.nextTurn <= 0) {
        c.nextTurn = rand(0.4, 1.4);
        if (Math.random() < 0.35) c.stop = rand(0.15, 0.4); else if (Math.random() < 0.5) c.dir *= -1;
        c.baseV = clamp(c.baseV + rand(-0.04, 0.04), L.floor[0], L.floor[1]);
      }
      if (c.stop > 0) c.stop -= dt; else c.u += c.dir * K.speed * dt;
      c.v += (c.baseV - c.v) * Math.min(1, dt * 4);
    }
    if (c.u < lo || c.u > hi) { c.dir *= -1; c.u = clamp(c.u, lo, hi); }
  }
}

function endAnimal() {
  const A = game.animal, M = game.mini, add = A.thrown * ANIMAL.score;
  game.phase = 'punish'; game.animal = null;
  hide('animal-hud'); punishButtons(true);
  (Sound.animalVoices || []).forEach((a) => { if (!a.paused) a.pause(); });
  if (add > 0) { M.score += add; M.animalThrown = (M.animalThrown || 0) + A.thrown; floatText(`蛇蟲鼠蟻 +${add}`, W / 2, H * 0.4, '#5c9a4a', 1.3); }
}

function drawCritter(c, st) {
  const K = ANIMAL.kinds[c.kind], key = `animal_${c.kind}`;
  const sc = animalLayout().scale * (K.where === 'wall' ? 1 : animalDepth(c.v));
  const pop = Math.min(1, c.t / 0.18);
  let fx = st.x + c.u * st.w, fy = st.y + c.v * st.h;
  const opt = { sx: 0.3 + 0.7 * pop, sy: 0.3 + 0.7 * pop };
  if (K.move === 'hop') fy -= Math.max(0, Math.sin(c.phase / 0.55 * Math.PI)) * (c.phase < 0.55 ? 1 : 0) * st.h * 0.07 * sc;
  if (K.move === 'slither') opt.rot = Math.sin(c.t * 3) * 0.06;
  if (K.move === 'crawl') opt.rot = Math.sin(c.t * 2) * 0.12;
  else opt.flip = c.dir < 0;            // 動物圖都係向右，向左行就反轉（蜘蛛係正面，唔使）
  drawSprite(key, fx, fy, K.h * st.h * sc, opt);
}

function drawAnimal() {
  const A = game.animal, b = A.benny;
  const L = animalLayout();
  let st;
  if (animalPortrait()) { st = animalStage(); ctx.drawImage(IMG.animal_room_portrait, st.x, st.y, st.w, st.h); }
  else st = drawRoom('animal_room', ANIMAL_FOCUS);
  // 牆上嘅蜘蛛先畫，之後地下嘅嘢同 Benny 按前後次序畫
  A.critters.filter((c) => ANIMAL.kinds[c.kind].where === 'wall').forEach((c) => drawCritter(c, st));
  const items = A.critters.filter((c) => ANIMAL.kinds[c.kind].where !== 'wall').map((c) => ({ z: c.v, draw: () => drawCritter(c, st) }));
  let head = null;
  items.push({ z: b.onSofa ? L.sofa.y : b.y, draw: () => {
    let key, h, fx = st.x + b.x * st.w, fy = st.y + b.y * st.h, opt = {};
    if (b.onSofa) {
      key = A.t < ANIMAL.scareDelay ? 'animal_sit' : 'animal_sit_scare';
      h = L.sofa.h * st.h * (key === 'animal_sit' ? 1 : 0.9);
      if (key === 'animal_sit_scare') fx += Math.sin(game.t * 40) * U * 0.002;
    } else {
      const d = L.scale * animalDepth(b.y);
      key = `animal_jump${b.pose}`; h = ANIMAL.bennyH * st.h * ANIMAL.jumpScale[b.pose] * d;
      fy -= Math.sin(b.hopT * Math.PI) * st.h * 0.22 * d;   // 跳起嘅弧線
      opt.flip = b.flip; opt.rot = (b.flip ? -1 : 1) * Math.sin(b.hopT * Math.PI) * 0.08;
    }
    const r = drawSprite(key, fx, fy, h, opt);
    head = { x: r.x + r.w / 2, y: r.y };
  } });
  items.sort((p, q) => p.z - q.z).forEach((d) => d.draw());
  if (A.bubble && head) drawBubble(A.bubble.text, head.x, head.y, '#5c9a4a');

  // 頂部提示
  const ff = getComputedStyle(document.body).fontFamily, fs = Math.max(16, U * 0.042);
  ctx.save(); ctx.font = `900 ${fs}px ${ff}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const s = `🐍 撳畫面掟動物！ ・ 掟咗 ${A.thrown} 隻`;
  ctx.lineWidth = fs * 0.22; ctx.strokeStyle = '#fff'; ctx.strokeText(s, W / 2, Math.max(78, U * 0.16));
  ctx.fillStyle = '#3e6e31'; ctx.fillText(s, W / 2, Math.max(78, U * 0.16));
  ctx.restore();
}

// ============================================================
// 燒碳（救人版）
// ============================================================
function startBurn() {
  if (!game || game.phase !== 'punish' || game.paused) return;
  punishButtons(false);
  game.burn = { t: 0, danger: 0, stage: 0, windowOpen: false, furnaceOff: false, bubble: { text: '咳咳……點解咁焗嘅？', t: 2 }, saidAt: 0, nextPlea: 0, doneT: 0, score: 0, smoke: [] };
  game.phase = 'burn';
}

// 房間相嘅位置。闊畫面：成間房睇晒（多出嚟嘅位用模糊背景填）。
// 直度手機：成間房會變得好細，所以放大到大約畫面高度 45%，左右裁走啲，以 focusU 為中心；
// u0／u1 係裁完之後睇到嘅房間範圍（比例），遊戲嘢要擺返喺呢個範圍入面
const ROOM_MIN_H = 0.5;
function roomStage(key, focusU = 0.5) {
  const im = IMG[key], iw = im ? im.width : 1536, ih = im ? im.height : 1024;
  const contain = Math.min(W / iw, H / ih), cover = Math.max(W / iw, H / ih);
  const s = Math.max(contain, Math.min(cover, (H * ROOM_MIN_H) / ih));
  const w = iw * s, h = ih * s;
  const x = clamp(W / 2 - focusU * w, W - w, 0) || 0;
  return { x: w <= W ? (W - w) / 2 : x, y: (H - h) / 2, w, h, u0: Math.max(0, -x / w), u1: Math.min(1, (W - x) / w) };
}
const BURN_FOCUS = 0.64, ANIMAL_FOCUS = 0.5;
// 燒碳：直度畫面（窄過 3:4）用直身房間相，鋪滿成個畫面；其他用原本闊身相
const burnPortrait = () => W / H < 0.75 && !!IMG.burn_room_portrait;
const burnLayout = () => (burnPortrait() ? BURN.portrait : BURN);
function burnStage() {
  if (!burnPortrait()) return roomStage('burn_room', BURN_FOCUS);
  const im = IMG.burn_room_portrait, s = Math.max(W / im.width, H / im.height), w = im.width * s, h = im.height * s;
  const x = (W - w) / 2;
  return { x, y: (H - h) / 2, w, h, u0: Math.max(0, -x / w), u1: Math.min(1, (W - x) / w) };
}
// 蛇蟲鼠蟻：直度畫面用直身房間相（同燒碳一樣），鋪滿成個畫面
const animalPortrait = () => W / H < 0.75 && !!IMG.animal_room_portrait;
const ANIMAL_LANDSCAPE = { sofa: ANIMAL.sofa, floor: ANIMAL.floor, wall: ANIMAL.wall, scale: 1 };
const animalLayout = () => (animalPortrait() ? ANIMAL.portrait : ANIMAL_LANDSCAPE);
// 遠近：地下 v 越大（越近鏡頭）放大啲；闊身相冇呢個效果
function animalDepth(v) {
  const L = animalLayout();
  if (!L.depth) return 1;
  const k = clamp((v - L.floor[0]) / (L.floor[1] - L.floor[0]), 0, 1);
  return 1 - L.depth * 0.35 + L.depth * k;
}
function animalStage() {
  if (!animalPortrait()) return roomStage('animal_room', ANIMAL_FOCUS);
  const im = IMG.animal_room_portrait, s = Math.max(W / im.width, H / im.height), w = im.width * s, h = im.height * s;
  const x = (W - w) / 2;
  return { x, y: (H - h) / 2, w, h, u0: Math.max(0, -x / w), u1: Math.min(1, (W - x) / w) };
}

function drawRoom(key, focusU) {
  const st = roomStage(key, focusU);
  ctx.save(); if ('filter' in ctx) ctx.filter = 'blur(10px) brightness(.7)'; drawCover(key); ctx.restore();
  if (IMG[key]) ctx.drawImage(IMG[key], st.x, st.y, st.w, st.h);
  return st;
}
const burnPt = (st, p) => ({ x: st.x + p.x * st.w, y: st.y + p.y * st.h });

function burnRects() {
  const st = burnStage(), B = game.burn, L = burnLayout();
  const winKey = B.windowOpen ? 'burn_window_open' : 'burn_window_closed';
  const wh = L.window.h * st.h, ww = wh * aspect(winKey);
  // 闊身相喺窄畫面裁咗左邊：窗沿住後面嗰幅牆移入嚟，保持睇到（直身相唔使）
  const shifted = !burnPortrait() && st.u0 > 0.05;
  const wc = burnPt(st, { x: shifted ? Math.max(L.window.x, st.u0 + 0.17) : L.window.x, y: L.window.y - (shifted ? 0.05 : 0) });
  const fh = L.furnace.h * st.h, fw = fh * aspect('burn_furnace_on');
  const fc = burnPt(st, L.furnace);
  return {
    st,
    window: { x: wc.x - ww / 2, y: wc.y - wh / 2, w: ww, h: wh },
    furnace: { x: fc.x - fw / 2, y: fc.y - fh, w: fw, h: fh },
  };
}

function onBurnTap(x, y, touch) {
  const B = game.burn, R = burnRects(), pad = touch ? U * 0.04 : U * 0.01;
  if (!B.windowOpen && hitRect(R.window, x, y, pad)) {
    B.windowOpen = true; Sound.sfx('catch');
    floatText('開窗！', R.window.x + R.window.w / 2, R.window.y, '#3f9a62', 1.1);
  } else if (!B.furnaceOff && hitRect(R.furnace, x, y, pad)) {
    B.furnaceOff = true; Sound.sfx('catch');
    floatText('熄咗碳爐！', R.furnace.x + R.furnace.w / 2, R.furnace.y, '#3f9a62', 1.1);
    for (let i = 0; i < 8; i++) addFx({ x: R.furnace.x + R.furnace.w * rand(0.3, 0.7), y: R.furnace.y + R.furnace.h * 0.2, vx: rand(-30, 30), vy: rand(-120, -60), r: U * rand(0.015, 0.03), color: 'rgba(230,230,230,.6)', life: 1.2 });
  } else return;
  if (B.windowOpen && B.furnaceOff) burnRescued();
}

function burnRescued() {
  const B = game.burn;
  game.phase = 'burnSaved';
  B.score = Math.max(BURN.minScore, BURN.rescueScore - BURN.perSec * Math.floor(B.t));
  B.bubble = { text: Sound.burnVoice(BURN_RELIEF, true) || '舒服晒！', t: 2.4 };
  B.stage = 0;
  floatText(`救咗佢！+${B.score}`, W / 2, H * 0.3, '#3f9a62', 1.3);
  Sound.sfx('level');
}

// 返回連打懲罰
function endBurn(add) {
  const M = game.mini;
  game.phase = 'punish'; game.burn = null;
  punishButtons(true);
  (Sound.burnVoices || []).forEach((a) => { if (!a.paused) a.pause(); });
  if (add > 0) { M.score += add; M.burnSaved = true; floatText(`燒碳救人 +${add}`, W / 2, H * 0.4, '#e0763a', 1.3); }
}

function updateBurn(dt) {
  const B = game.burn;
  if (B.bubble) { B.bubble.t -= dt; if (B.bubble.t <= 0) B.bubble = null; }
  // 煙：開咗窗散得快啲
  const fade = B.windowOpen ? 2.2 : 1;
  B.smoke = B.smoke.filter((s) => (s.t += dt * fade) < 3);
  if (game.phase === 'burnSaved') {
    B.doneT += dt;
    if (B.doneT >= 2.4) endBurn(B.score);
    return;
  }
  B.t += dt;
  // 窗同碳爐每解決一樣，辛苦程度升得慢一半
  const hazards = (B.windowOpen ? 0 : 1) + (B.furnaceOff ? 0 : 1);
  B.danger += dt * hazards / 2;
  let st = 0; BURN.stages.forEach((s, i) => { if (B.danger >= s) st = i; });
  if (st > B.stage) {
    B.stage = st; B.nextPlea = B.t + 5;
    const said = Sound.burnVoice(st - 1, true);
    if (said) B.bubble = { text: said, t: 2.6 };
  } else if (B.stage >= 3 && B.t >= B.nextPlea) {
    // 最辛苦嗰階段：輪流求救，等玩家快啲救
    B.nextPlea = B.t + 5;
    const said = Sound.burnVoice(pick([2, 3]));
    if (said) B.bubble = { text: said, t: 2.6 };
  }
  // 碳爐未熄就一路出煙
  if (!B.furnaceOff && Math.random() < dt * 6) {
    const R = burnRects();
    B.smoke.push({ x: R.furnace.x + R.furnace.w * rand(0.35, 0.65), y: R.furnace.y + R.furnace.h * 0.15, r: U * rand(0.03, 0.06), t: 0, vx: rand(-15, 15) });
  }
}

function drawBurn() {
  const B = game.burn, R = burnRects(), st = R.st;
  // 模糊背景填滿，再畫清楚嘅房間（直度畫面用直身相，鋪滿成個畫面）
  if (burnPortrait()) ctx.drawImage(IMG.burn_room_portrait, st.x, st.y, st.w, st.h);
  else drawRoom('burn_room', BURN_FOCUS);

  // 窗：開咗就見到外面藍天
  const W0 = R.window;
  if (B.windowOpen) {
    const g = ctx.createLinearGradient(0, W0.y, 0, W0.y + W0.h);
    g.addColorStop(0, '#8fd0ff'); g.addColorStop(1, '#dff3ff');
    ctx.fillStyle = g; ctx.fillRect(W0.x + W0.w * 0.17, W0.y + W0.h * 0.26, W0.w * 0.66, W0.h * 0.67);
  }
  const winKey = B.windowOpen ? 'burn_window_open' : 'burn_window_closed';
  if (IMG[winKey]) ctx.drawImage(IMG[winKey], W0.x, W0.y, W0.w, W0.h);

  // 碳爐
  const F = R.furnace, fk = B.furnaceOff ? 'burn_furnace_off' : 'burn_furnace_on';
  if (IMG[fk]) {
    const flick = B.furnaceOff ? 0 : Math.sin(game.t * 18) * 0.01;
    ctx.drawImage(IMG[fk], F.x, F.y - F.h * flick, F.w, F.h * (1 + flick));
  }

  // Benny：未辛苦／救返就坐喺梳化；辛苦就跪喺梳化前面
  const key = B.stage === 0 ? 'burn_sit' : ['burn_sit', 'burn_scream1', 'burn_scream2', 'burn_scream3'][B.stage];
  const L = burnLayout(), pos = B.stage === 0 ? L.sofa : L.floor;
  const p = burnPt(st, pos), bh = pos.h * st.h * (B.stage === 0 ? 1 : 0.92);
  const shake = B.stage >= 2 && game.phase === 'burn' ? Math.sin(game.t * 30) * U * 0.004 * B.stage : 0;
  const r = drawSprite(key, p.x + shake, p.y, bh);

  // 煙：碳爐未熄就越嚟越濃；開窗會散得快啲
  for (const s of B.smoke) {
    ctx.fillStyle = `rgba(90,90,90,${(0.28 * (1 - s.t / 3)).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(s.x + s.vx * s.t, s.y - s.t * st.h * 0.12, s.r * (1 + s.t), 0, Math.PI * 2); ctx.fill();
  }
  const haze = game.phase === 'burn' ? Math.min(0.32, B.danger * 0.03) * (B.furnaceOff ? 0.4 : 1) * (B.windowOpen ? 0.5 : 1) : 0;
  if (haze > 0) { ctx.fillStyle = `rgba(70,70,70,${haze.toFixed(3)})`; ctx.fillRect(0, 0, W, H); }

  // 提示圈：仲未搞掂嘅嘢會一閃一閃
  if (game.phase === 'burn') {
    const pulse = 0.5 + 0.5 * Math.sin(game.t * 6);
    ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(255,214,92,${(0.4 + 0.6 * pulse).toFixed(2)})`;
    if (!B.windowOpen) { ctx.beginPath(); ctx.roundRect(W0.x - 6, W0.y - 6, W0.w + 12, W0.h + 12, 12); ctx.stroke(); }
    if (!B.furnaceOff) { ctx.beginPath(); ctx.ellipse(F.x + F.w / 2, F.y + F.h / 2, F.w * 0.62, F.h * 0.6, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }

  if (B.bubble) drawBubble(B.bubble.text, r.x + r.w / 2, r.y, '#e0763a');

  // 頂部提示
  const ff = getComputedStyle(document.body).fontFamily, fs = Math.max(16, U * 0.042);
  ctx.save(); ctx.font = `900 ${fs}px ${ff}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const todo = [!B.windowOpen && '撳窗開窗', !B.furnaceOff && '撳碳爐熄火'].filter(Boolean).join('、');
  const s = game.phase === 'burnSaved' ? '救咗佢！' : `🔥 快啲救佢！${todo} ・ ${Math.floor(B.t)} 秒`;
  ctx.lineWidth = fs * 0.22; ctx.strokeStyle = '#fff'; ctx.strokeText(s, W / 2, Math.max(78, U * 0.16));
  ctx.fillStyle = '#a9522a'; ctx.fillText(s, W / 2, Math.max(78, U * 0.16));
  ctx.restore();
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
    ctx.beginPath(); ctx.ellipse(top.x, top.y + b.h * 0.07, b.w * 0.13, b.h * 0.07, PUNCH[key].tilt, 0, Math.PI * 2); ctx.fill(); ctx.restore();
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
  lastResult = { total, secs: Math.round(game.elapsed), hits: M.hits, weapon: CFG.mini.tiers[M.topTier].name, ifcFell: !!M.ifcFell, burnSaved: !!M.burnSaved, animalThrown: M.animalThrown || 0, fightKOs: M.fightKOs || 0 };

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
  const ifc = (r.ifcFell ? '\n仲喺 IFC 天台推咗佢落去 🏙' : '') + (r.burnSaved ? '\n最後都係救返佢 🪟' : '') + (r.animalThrown ? `\n仲掟咗 ${r.animalThrown} 隻蛇蟲鼠蟻落佢度 🐍` : '') + (r.fightKOs ? `\n街坊對打 KO 咗佢 ${r.fightKOs} 次 🥊` : '');
  return `🎯《快打袁枝》我攞咗 ${fmt(r.total)} 分！\n捉袁枝用咗 ${r.secs} 秒，連打 ${r.hits} 下，用埋${r.weapon}😈${ifc}\n你夠唔夠我快？`;
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
  } else if (game.phase === 'ifc' || game.phase === 'ifcFall') {
    updateIfc(dt);
  } else if (game.phase === 'burn' || game.phase === 'burnSaved') {
    updateBurn(dt);
  } else if (game.phase === 'animal') {
    updateAnimal(dt);
  } else if (game.phase === 'brothel' && game.brothel) {
    updateBrothel(dt);
  } else if (game.phase === 'fight' && game.fight) {
    updateFight(dt);
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
  } else if (game.phase.startsWith('ifc') && game.ifc) {
    drawIfc();
  } else if (game.phase.startsWith('burn') && game.burn) {
    drawBurn();
  } else if (game.phase === 'animal' && game.animal) {
    drawAnimal();
  } else if (game.phase === 'brothel') {
    drawBrothel();
  } else if (game.phase === 'fight' && game.fight) {
    drawFight();
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
  else if (game.phase === 'burn') onBurnTap(x, y, touch);
  else if (game.phase === 'animal') onAnimalTap(x, y);
  else if (game.phase === 'brothel' && game.brothel) onBrothelTap(x, y, touch);
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
  const playing = ['main', 'zoom', 'countdown', 'punish', 'ifcIntro', 'ifc', 'ifcFall', 'ifcEnding', 'burn', 'burnSaved', 'animal', 'brothel', 'fight'].includes(game.phase);
  const v = $('ifc-video'), videoOn = !$('ifc-video-layer').classList.contains('hidden');
  if (p && playing && !game.paused) {
    game.paused = true; Sound.suspend(); show('scr-pause');
    if (videoOn) v.pause();
  } else if (!p && game.paused) {
    game.paused = false; Sound.resume(); hide('scr-pause');
    if (videoOn) v.play().catch(() => {});
  }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
document.addEventListener('keydown', (e) => {
  if (game && game.phase === 'ifc' && (e.key === 'ArrowLeft' || e.key === ' ')) { e.preventDefault(); ifcPush(); }
  if (game && game.phase === 'fight' && game.fight) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); game.fight.move = -1; }
    if (e.key === 'ArrowRight') { e.preventDefault(); game.fight.move = 1; }
  }
});
document.addEventListener('keyup', (e) => {
  if (game && game.fight && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) game.fight.move = 0;
});

// ============================================================
// 掣
// ============================================================
$('btn-start').addEventListener('click', () => {
  Sound.init(); Sound.setMuted(Sound.muted);
  hide('scr-start'); show('hud');
  newGame();
});
$('btn-again').addEventListener('click', () => {
  hide('scr-result'); punishButtons(false); show('hud'); newGame();
});
// 懲罰同燒碳要用背景載入嘅圖；IFC 天台唔使等（開場片播緊嗰陣啲圖會載完，而且片要喺撳掣嗰下即刻播先有聲）
let waitingImages = false;
const afterImages = (fn) => () => {
  if (waitingImages) return;
  waitingImages = true;
  whenLateImagesReady(() => { waitingImages = false; fn(); });
};
$('btn-punish').addEventListener('click', afterImages(startCountdown));
$('btn-done').addEventListener('click', finishPunish);
$('btn-ifc').addEventListener('click', startIfc);
$('btn-burn').addEventListener('click', afterImages(startBurn));
$('btn-animal').addEventListener('click', afterImages(startAnimal));
$('btn-animal-spare').addEventListener('click', () => { if (game && game.phase === 'animal') endAnimal(); });
$('btn-fight').addEventListener('click', afterImages(startFight));
$('btn-fight-punch').addEventListener('click', fightPunch);
$('btn-fight-wave').addEventListener('click', fightWave);
$('btn-fight-upper').addEventListener('click', fightUppercut);
$('btn-fight-spin').addEventListener('click', fightSpin);
$('btn-fight-spare').addEventListener('click', () => { if (game && game.phase === 'fight') endFight(); });
[['btn-fight-left', -1], ['btn-fight-right', 1]].forEach(([id, dir]) => {
  const b = $(id), set = (v) => { if (game && game.fight) game.fight.move = v; };
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); set(dir); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => set(0)));
});
$('btn-brothel').addEventListener('click', afterImages(startBrothel));
$('btn-brothel-back').addEventListener('click', () => { if (game && game.phase === 'brothel') endBrothel(); });
$('btn-push').addEventListener('click', ifcPush);
$('btn-spare').addEventListener('click', () => { if (game && game.phase === 'ifc') endIfc(0); });
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
const allKeys = Object.keys(IMG_SRC);
loadImages(allKeys.filter((k) => !isLateImage(k)), true).then(() => {
  lateImagesReady = loadImages(allKeys.filter(isLateImage), false).then(() => { lateImagesDone = true; });
  hide('scr-loading'); show('scr-start');
  const best = parseInt(store.get('kdyz-best', '0'), 10) || 0;
  $('best-text').textContent = best ? `最高分：${fmt(best)}` : '';
  $('btn-mute').textContent = Sound.muted ? '🔇' : '🔊';
  drawAvatar();
});
