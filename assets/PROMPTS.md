# 《快打袁枝》Higgsfield 美術提示詞

## 使用方法
1. 每個 prompt 前面都加上**風格前綴**，令全套風格一致。
2. 角色、物件、武器、特效：用 **1:1 方形、1024×1024**，要**透明背景 PNG**（如果模型唔支援透明，就用純白背景，之後去背）。
3. 背景：分別生成 9:16 直式同 16:9 橫式。
4. 目標人物（target_*）：上載 `Benny.jpg` 做**參考圖（image reference / character reference）**，保留五官。
5. 下載後**改成下表嘅檔名**，放入對應資料夾。檔名一定要一樣，遊戲先讀得到。
6. 同一角色嘅幾張圖，最好用同一個 seed 或者 character reference，令樣貌一致。

### 風格前綴（每個都加）
```
cute 3D chibi style, soft clay toy look, rounded shapes, big head small body, pastel colors, soft studio lighting, subtle ambient occlusion, clean, high detail, Pixar-like charm,
```

### 通用負面提示（如果模型支援 negative prompt）
```
blood, gore, realistic violence, scary, horror, text watermark, extra limbs, deformed hands, cropped, multiple characters
```

---

## characters/

| 檔名 | Prompt（接喺風格前綴後面） |
|---|---|
| `target_walk.png` | a chibi Asian man with short black bowl-cut hair (use reference photo face), wearing a plain white tank top and blue shorts, sneakers, walking happily, side three-quarter view, full body, isolated on transparent background |
| `target_sit.png` | same chibi man, white tank top and blue shorts, sitting relaxed with legs dangling, hands on knees, front three-quarter view, full body, no chair, isolated on transparent background |
| `target_chess.png` | same chibi man, white tank top and blue shorts, sitting and leaning forward, one hand holding a round Chinese chess piece, focused thinking expression, full body, no table, isolated on transparent background |
| `target_peek.png` | same chibi man, white tank top, peeking out sideways with only head and shoulders visible, curious cheeky expression, isolated on transparent background |
| `target_hit.png` | same chibi man, white tank top and blue shorts, comically dizzy after being bonked, swirly eyes, cartoon stars circling head, funny shocked mouth, full body, isolated on transparent background |
| `woman.png` | a chibi young woman with ponytail, pastel cardigan and long skirt, holding a dog leash in one hand, walking calmly, side view, full body, isolated on transparent background |
| `dachshund_walk.png` | a chibi brown dachshund dog with a red collar, walking happily, tongue out, side view, full body, isolated on transparent background |
| `dachshund_run.png` | same chibi brown dachshund with red collar, running fast excitedly, ears flying, motion pose, side view, full body, isolated on transparent background |
| `chess_opponent.png` | a chibi elderly Hong Kong grandpa with white hair, glasses and a white singlet, sitting and leaning forward thinking about Chinese chess, hand on chin, full body, no table, isolated on transparent background |

## scene/

| 檔名 | 比例 | Prompt |
|---|---|---|
| `park_portrait.png` | 9:16 | a cute 3D toy-like Hong Kong neighborhood park seen from a high three-quarter top-down angle, green grass, winding light stone path, flower beds with colorful flowers, small trees at the edges, sunny day, empty open space in the middle, no people, no benches, no tables |
| `park_landscape.png` | 16:9 | same as above, wide landscape composition |
| `bush.png` | 1:1 | a round fluffy green bush with small pink and yellow flowers, isolated on transparent background |
| `bench.png` | 1:1 | a cute wooden park bench with green metal legs, three-quarter view, isolated on transparent background |
| `chess_table.png` | 1:1 | a round stone Chinese chess (xiangqi) table with a painted xiangqi board and round chess pieces on top, with two round stone stools on opposite sides, three-quarter view, isolated on transparent background |

## weapons/（玩具感，唔好寫實）

| 檔名 | Prompt |
|---|---|
| `bat.png` | a cartoon toy baseball bat, chunky rounded wood, cute, isolated on transparent background |
| `mace.png` | a cartoon toy spiked mace made of soft rubber with rounded pastel spikes, cute and harmless looking, isolated on transparent background |
| `flamethrower.png` | a cartoon toy flamethrower, chunky plastic pastel orange and teal water-gun style, cute, isolated on transparent background |
| `machine_gun.png` | a cartoon toy machine gun, chunky plastic foam-dart blaster style, bright pastel colors, cute and harmless, isolated on transparent background |

## effects/

| 檔名 | Prompt |
|---|---|
| `fx_stars.png` | a ring of cute yellow cartoon stars circling, dizzy effect, isolated on transparent background |
| `fx_bump.png` | a cartoon pink swollen bump lump on top of head effect, shiny, comic style, isolated on transparent background |
| `fx_spark.png` | a cute cartoon orange and yellow spark burst explosion puff, isolated on transparent background |
| `fx_pa.png` | a comic impact burst shape in bright yellow and red, empty center for text, isolated on transparent background |

> 「啪！」「噹！」等中文字由遊戲程式加上，AI 生成中文字容易出錯，所以特效圖唔放字。

## ui/

| 檔名 | Prompt |
|---|---|
| `logo.png` | a cute 3D bubbly game logo plate, rounded pastel badge shape with a cartoon baseball bat and stars decoration, empty space in the middle for title text, isolated on transparent background |

> Logo 上「快打袁枝」四隻字由程式加，避免 AI 寫錯中文。

## audio/bgm/（已取消，唔使生成）

| 檔名 | 說明 |
|---|---|
| `bgm.mp3` | 輕鬆休閒風，烏克麗麗＋口哨＋輕敲擊，約 60–90 秒可無縫循環。Prompt：`cheerful relaxing casual game background music, ukulele, whistling, light percussion, happy park afternoon, seamless loop, 100 bpm` |

## audio/voice/（已完成）

| 檔名 | 原句 |
|---|---|
| `v1_jaumeng.m4a` | 做咩啊？救命呀。 |
| `v2_mhoudangoh.m4a` | 唔好打我啦 |
| `v3_aiyahoutung.m4a` | 哎呀好痛 |
| `v4_tauhong.m4a` | 我投降啊 |
| `v5_wuisei.m4a` | 唔好再打啦，再打我會死㗎 |

## audio/sfx/（之後用程式合成或免費音效，暫時唔使生成）
打擊聲（四款武器各一）、狗吠、打錯人、捉到、結算。


---

# 街坊對打（`assets/fight/`，原創角色，唔好提 Ken 或者 Street Fighter）

先整 `rival.png`，之後每張都上載佢做參考圖，角色先會一致。角色同特效用純白背景，唔好用灰白格仔；下載後改名放入 `assets/fight/`。

### 風格前綴（角色同特效）
```
16-bit retro arcade pixel art, bold black outlines, limited vivid colors, clean crisp pixels, full body, side view facing left, original character, isolated on plain white background, no text,
```

| 檔名 | 比例 | Prompt（接喺前綴後面）|
|---|---|---|
| `rival.png` | 1:1 | a stout bald middle-aged Hong Kong cha chaan teng cook named Uncle Keung, thick moustache, white singlet, stained beige apron, grey shorts, plastic slippers, holding a metal wok spatula in one hand, relaxed fighting stance |
| `rival_punch.png` | 1:1 | same cook, lunging forward throwing a big straight punch with his free fist, angry shouting face, apron flapping |
| `rival_prepare.png` | 1:1 | same cook, wide stance, lifting a black iron wok above his head with both hands, orange flames starting to gather in the wok, eyes closed in concentration |
| `rival_wave.png` | 1:1 | same cook, thrusting the iron wok forward with both hands, mouth wide open shouting, flames bursting out of the wok towards the left |
| `rival_uppercut.png` | 1:1 | same cook, jumping upward off the ground, swinging the wok spatula upward in a rising uppercut, one knee raised, apron and flames trailing below him |
| `rival_spin.png` | 1:1 | same cook, spinning sideways in the air like a top, one leg stretched out with a plastic slipper leading the kick, motion swirl lines of steam around him |
| `wave.png` | 1:1 | a blob of orange and yellow wok flame with sparks and small flying bean sprouts, moving left, no character |

### 背景（唔使加前綴）
| 檔名 | 比例 | Prompt |
|---|---|---|
| `bg_landscape.jpg` | 16:9 | 16-bit retro arcade pixel art background, side view fighting stage on an old Hong Kong street at dusk, cha chaan teng shopfront, stacked neon signs, tong lau buildings, red taxi parked far behind, flat paved pavement filling the bottom third as the ground, vivid colors, no people, no text, no logos |
| `bg_portrait.jpg` | 9:16 | same old Hong Kong street at dusk in pixel art, tall vertical composition, neon signs stacked high above, flat paved pavement filling the bottom third, no people, no text, no logos |
