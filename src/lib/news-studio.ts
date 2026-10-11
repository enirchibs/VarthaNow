// ═══════════════════════════════════════════════════════════════════
//  VaartaNow virtual news studio for editor recordings and Live Studio.
//  Draws the camera onto a 1280×720 canvas with a chosen background
//  (camera as is, blur, a studio set, VaartaNow or breaking-news
//  backdrop) and TV graphics (logo, LIVE, date-time, name strap, big
//  breaking-news headline, news ticker, VaartaNow headlines ticker).
//  The person is cut out in the browser with MediaPipe segmentation,
//  loaded only when a background replacement is used.
// ═══════════════════════════════════════════════════════════════════

import type { ImageSegmenter } from "@mediapipe/tasks-vision";

export const STUDIO_W = 1280;
export const STUDIO_H = 720;

const STORAGE = "https://aapstack.tech/p/e027be62-50a9-4e4d-9341-afc64689762b/storage/v1/object/public/news-images/studio";
// MediaPipe runtime + models, pinned to the installed package version. The multi-class model
// (hair, face, body, clothes vs background) separates a person from room objects much better;
// the small selfie model is the fallback.
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODELS = [
  { url: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite", personFromBackground: true },
  { url: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite", personFromBackground: false },
];

export type PresenterSide = "left" | "center" | "right";
// side: where the presenter should stand so the landmark on the screen stays visible
export type StudioBackground = { id: string; label: string; kind: "camera" | "blur" | "image" | "brand" | "breaking" | "wall"; url?: string; side?: PresenterSide };
export const STUDIO_BACKGROUNDS: StudioBackground[] = [
  { id: "camera", label: "Camera as is", kind: "camera" },
  { id: "blur", label: "Blur my room", kind: "blur" },
  { id: "brand", label: "VaartaNow backdrop", kind: "brand" },
  { id: "breaking", label: "Breaking news backdrop", kind: "breaking" },
  { id: "news-wall", label: "VaartaNow news wall", kind: "wall" },
  { id: "studio-charminar", label: "Charminar screen", kind: "image", url: `${STORAGE}/studio-charminar.webp`, side: "right" },
  { id: "studio-tankbund", label: "Tank Bund screen", kind: "image", url: `${STORAGE}/studio-tankbund.webp`, side: "left" },
  { id: "studio-red", label: "Studio · world map", kind: "image", url: `${STORAGE}/studio-red.webp` },
  { id: "studio-blue", label: "Studio · globe", kind: "image", url: `${STORAGE}/studio-blue.webp` },
  { id: "newsroom", label: "Newsroom", kind: "image", url: `${STORAGE}/newsroom.webp` },
  { id: "vizag-window", label: "Vizag beach view", kind: "image", url: `${STORAGE}/vizag-window.webp` },
  { id: "hyderabad-night", label: "Hyderabad skyline", kind: "image", url: `${STORAGE}/hyderabad-night.webp` },
];

/** Swatch for backgrounds drawn in code (shown in the pickers). */
export const backgroundSwatch = (b: StudioBackground) =>
  b.kind === "brand" ? "linear-gradient(135deg,#7f1d1d,#b91c1c 55%,#0b1020)"
    : b.kind === "breaking" ? "linear-gradient(135deg,#450a0a,#dc2626 50%,#111827)"
      : b.kind === "wall" ? "repeating-linear-gradient(0deg,#0b1020 0 10px,#1e3a8a 10px 12px)"
      : b.kind === "blur" ? "linear-gradient(135deg,#94a3b8,#cbd5e1,#64748b)" : "#1e293b";

export const TICKER_LABELS = ["బ్రేకింగ్ న్యూస్", "తాజా వార్తలు", "ప్రత్యేక కథనం", "స్థానిక వార్తలు"];

export type StudioSettings = {
  background: string;
  logo: boolean;
  clock: boolean;
  strap: boolean;
  ticker: boolean;
  tickerLabel: string;
  tickerText: string;
  presenter: string;
  strapLine: string; // second line of the name strap, e.g. the story headline
  live?: boolean; // red LIVE badge (Live Studio only)
  breaking?: boolean; // big scrolling breaking-news headline band
  breakingText?: string;
  vnTicker?: boolean; // bottom line scrolling the latest VaartaNow headlines
  headlines?: string[]; // latest VaartaNow headlines: mixed into the ticker, the headlines line and the news wall
  desk?: boolean; // presenter sits behind a VaartaNow news desk
  speed?: number; // scrolling speed multiplier (0.6 slow · 1 normal · 1.5 fast)
  side?: PresenterSide; // where the presenter stands when the background is replaced
  // Citizen journalist recording: no VaartaNow logo, LIVE, BREAKING or VaartaNow tickers (the video is
  // reviewed before publishing and can be downloaded, so it must not look like an official bulletin)
  citizen?: boolean;
};

/** Backgrounds a citizen may use: no VaartaNow-branded or breaking-news backdrops. */
export const CITIZEN_BACKGROUNDS = STUDIO_BACKGROUNDS.filter((b) => !["brand", "breaking", "wall"].includes(b.kind));

export const SCROLL_SPEEDS = [
  { value: 0.6, label: "Slow" },
  { value: 1, label: "Normal" },
  { value: 1.5, label: "Fast" },
];

const TE = "'Noto Sans Telugu', 'Nirmala UI', Gautami, sans-serif";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Fit text into a width by shrinking the font, then ellipsis. */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, min: number, weight = 700) {
  let s = size;
  ctx.font = `${weight} ${s}px ${TE}`;
  while (ctx.measureText(text).width > maxW && s > min) ctx.font = `${weight} ${--s}px ${TE}`;
  let t = text;
  while (ctx.measureText(t).width > maxW && t.length > 4) t = `${t.slice(0, -2)}…`;
  return t;
}

/** An email is not a name to show on air. */
const displayName = (p: string) => (p && !p.includes("@") ? p : "VaartaNow ప్రతినిధి");

export class NewsStudio {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement;
  private person = document.createElement("canvas");
  private mask = document.createElement("canvas");
  private settings: StudioSettings;
  private images = new Map<string, HTMLImageElement>();
  private segmenter: ImageSegmenter | null = null;
  private personFromBackground = false;
  private segmenterLoading: Promise<void> | null = null;
  private smooth: Float32Array | null = null; // mask averaged over frames (less flicker)
  private prob: Float32Array | null = null; // person probability for the current frame
  // One copy of the camera frame per drawn frame: the model and the drawing must use the same
  // picture, or the video advances while the model runs and the cut-out lags behind movement.
  private frame = document.createElement("canvas");
  private raf = 0;
  private tickerX = STUDIO_W;
  private breakingX = 0;
  private vnX = STUDIO_W;
  private wallX = [0, 0, 0, 0, 0, 0];
  private lastTs = 0;
  private lastFrame = 0;
  private dt = 1 / 30; // seconds since the previous frame
  onStatus?: (text: string) => void;

  constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement, settings: StudioSettings) {
    this.canvas = canvas;
    canvas.width = STUDIO_W;
    canvas.height = STUDIO_H;
    this.ctx = canvas.getContext("2d")!;
    this.person.width = STUDIO_W;
    this.person.height = STUDIO_H;
    this.video = video;
    this.settings = settings;
    this.prepare();
  }

  update(settings: StudioSettings) {
    this.settings = settings;
    this.prepare();
  }

  start() {
    const loop = () => {
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.segmenter?.close();
    this.segmenter = null;
  }

  /** Video track of the composed picture, plus the microphone. */
  stream(audio: MediaStreamTrack[]): MediaStream {
    return new MediaStream([...this.canvas.captureStream(30).getVideoTracks(), ...audio]);
  }

  private background() {
    return STUDIO_BACKGROUNDS.find((b) => b.id === this.settings.background) ?? STUDIO_BACKGROUNDS[0];
  }

  private prepare() {
    const bg = this.background();
    if (bg.kind === "image" && bg.url && !this.images.has(bg.url)) {
      const img = new Image();
      img.crossOrigin = "anonymous"; // keeps the canvas exportable for recording
      const url = bg.url;
      img.onload = () => this.onStatus?.("");
      img.onerror = () => {
        this.images.delete(url); // picking the background again retries
        this.onStatus?.(`Could not load the "${bg.label}" background; showing the VaartaNow backdrop. Pick it again to retry.`);
      };
      this.onStatus?.(`Loading "${bg.label}"…`);
      img.src = url;
      this.images.set(url, img);
    }
    if (bg.kind !== "camera" && !this.segmenter && !this.segmenterLoading) {
      this.onStatus?.("Loading background cut-out…");
      this.segmenterLoading = (async () => {
        try {
          const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
          const fileset = await FilesetResolver.forVisionTasks(WASM);
          for (const model of MODELS) {
            for (const delegate of ["GPU", "CPU"] as const) {
              try {
                this.segmenter = await ImageSegmenter.createFromOptions(fileset, {
                  baseOptions: { modelAssetPath: model.url, delegate },
                  runningMode: "VIDEO",
                  outputConfidenceMasks: true,
                  outputCategoryMask: false,
                });
                this.personFromBackground = model.personFromBackground;
                this.onStatus?.("");
                return;
              } catch { /* try the next option */ }
            }
          }
          throw new Error("no segmentation model could be loaded");
        } catch (e: any) {
          this.onStatus?.(`Background replacement is not available on this device (${e?.message ?? e}). Using the camera as is.`);
        } finally {
          this.segmenterLoading = null;
        }
      })();
    }
  }

  // camera frame placement: fill the frame; keep a portrait phone camera whole (full height,
  // centred) when the background is replaced, so the presenter is not cropped
  private placement(fill: boolean) {
    const vw = this.video.videoWidth || STUDIO_W, vh = this.video.videoHeight || STUDIO_H;
    const portrait = vh > vw;
    const scale = fill || !portrait ? Math.max(STUDIO_W / vw, STUDIO_H / vh) : STUDIO_H / vh;
    const w = vw * scale, h = vh * scale;
    return { x: (STUDIO_W - w) / 2, y: STUDIO_H - h, w, h };
  }

  private stripes(color: string, alpha: number) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 26;
    for (let x = -STUDIO_H; x < STUDIO_W; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, STUDIO_H);
      ctx.lineTo(x + STUDIO_H, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawBrand() {
    const { ctx } = this;
    const g = ctx.createLinearGradient(0, 0, STUDIO_W, STUDIO_H);
    g.addColorStop(0, "#7f1d1d");
    g.addColorStop(0.55, "#b91c1c");
    g.addColorStop(1, "#0b1020");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, STUDIO_W, STUDIO_H);
    this.stripes("#fff", 0.08);
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = "#fff";
    ctx.font = "900 150px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("VaartaNow", STUDIO_W - 40, 200);
    ctx.font = `700 64px ${TE}`;
    ctx.fillText("తెలుగు వార్తలు", STUDIO_W - 48, 290);
    ctx.restore();
  }

  private drawBreaking() {
    const { ctx } = this;
    const g = ctx.createRadialGradient(STUDIO_W / 2, STUDIO_H / 2, 80, STUDIO_W / 2, STUDIO_H / 2, STUDIO_W * 0.75);
    g.addColorStop(0, "#dc2626");
    g.addColorStop(0.55, "#7f1d1d");
    g.addColorStop(1, "#111827");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, STUDIO_W, STUDIO_H);
    this.stripes("#000", 0.12);
    // light rays + big repeated words behind the presenter
    ctx.save();
    ctx.globalAlpha = 0.12 + 0.05 * Math.sin(performance.now() / 600);
    ctx.fillStyle = "#fff";
    ctx.font = "900 120px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BREAKING NEWS", STUDIO_W / 2, 230);
    ctx.font = `900 96px ${TE}`;
    ctx.fillText("బ్రేకింగ్ న్యూస్", STUDIO_W / 2, 350);
    ctx.restore();
    ctx.fillStyle = "#facc15";
    ctx.fillRect(0, 0, STUDIO_W, 6);
  }

  /** Dark studio wall with rows of the latest VaartaNow headlines scrolling behind the presenter. */
  private drawWall() {
    const { ctx } = this;
    const g = ctx.createLinearGradient(0, 0, 0, STUDIO_H);
    g.addColorStop(0, "#0b1020");
    g.addColorStop(1, "#172554");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, STUDIO_W, STUDIO_H);
    const items = (this.settings.headlines ?? []).filter(Boolean);
    const lines = items.length ? items : ["VaartaNow · తాజా తెలుగు వార్తలు"];
    const rows = this.wallX.length;
    for (let r = 0; r < rows; r++) {
      const y = 90 + r * 100;
      const dir = r % 2 ? 1 : -1;
      const text = `${[...lines.slice(r % lines.length), ...lines.slice(0, r % lines.length)].join("   ◆   ")}   ◆   `;
      ctx.font = `800 ${r % 2 ? 34 : 40}px ${TE}`;
      const tw = Math.max(ctx.measureText(text).width, 400);
      this.wallX[r] = (this.wallX[r] + dir * (18 + r * 4) * (this.settings.speed ?? 0.6) * this.dt + tw) % tw;
      ctx.save();
      ctx.globalAlpha = r % 2 ? 0.16 : 0.24;
      ctx.fillStyle = r % 3 === 0 ? "#f87171" : "#e2e8f0";
      for (let x = this.wallX[r] - tw; x < STUDIO_W; x += tw) ctx.fillText(text, x, y);
      ctx.restore();
    }
    // light strips and a large faint logo
    ctx.fillStyle = "rgba(220,38,38,0.85)";
    ctx.fillRect(0, 36, STUDIO_W, 4);
    ctx.fillRect(0, STUDIO_H - 140, STUDIO_W, 3);
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#fff";
    ctx.font = "900 170px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("VaartaNow", STUDIO_W / 2, STUDIO_H / 2 + 60);
    ctx.restore();
  }

  /** News desk in front of the presenter (drawn after the person, before the graphics). */
  private drawDesk() {
    const { ctx } = this;
    const top = 470, front = 545;
    // desk top, in slight perspective
    const g = ctx.createLinearGradient(0, top, 0, front);
    g.addColorStop(0, "#334155");
    g.addColorStop(1, "#0f172a");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(150, top);
    ctx.lineTo(STUDIO_W - 150, top);
    ctx.lineTo(STUDIO_W - 40, front);
    ctx.lineTo(40, front);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(150, top, STUDIO_W - 300, 2);
    // front panel
    const f = ctx.createLinearGradient(0, front, 0, STUDIO_H);
    f.addColorStop(0, "#b91c1c");
    f.addColorStop(1, "#450a0a");
    ctx.fillStyle = f;
    ctx.fillRect(40, front, STUDIO_W - 80, STUDIO_H - front);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(40, front, STUDIO_W - 80, 5);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(40, front + 5, STUDIO_W - 80, 18);
    if (!this.settings.citizen) {
      ctx.textAlign = "right";
      ctx.font = "900 44px Arial, sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText("Vaarta", STUDIO_W - 80 - ctx.measureText("Now").width, front + 62);
      ctx.fillStyle = "#facc15";
      ctx.fillText("Now", STUDIO_W - 80, front + 62);
      ctx.textAlign = "left";
    }
  }

  /**
   * Person probability → alpha. Smoothed over frames only where the picture is steady (moving
   * hands get the new mask at once, so no ghost trail), keeps the body plus any sizeable separate
   * part such as a raised hand, drops small specks, and softens the edges.
   */
  private buildMask(prob: Float32Array, w: number, h: number) {
    const n = w * h;
    if (!this.smooth || this.smooth.length !== n) this.smooth = new Float32Array(n);
    const sm = this.smooth;
    for (let i = 0; i < n; i++) {
      const k = Math.abs(prob[i] - sm[i]) > 0.25 ? 0.9 : 0.55;
      sm[i] = sm[i] * (1 - k) + prob[i] * k;
    }
    // connected regions above 0.45
    const T = 0.45;
    const label = new Int32Array(n);
    const queue = new Int32Array(n);
    const sizes: number[] = [0];
    for (let i = 0; i < n; i++) {
      if (label[i] || sm[i] < T) continue;
      const id = sizes.length;
      let head = 0, tail = 0, size = 0;
      queue[tail++] = i;
      label[i] = id;
      while (head < tail) {
        const q = queue[head++];
        size++;
        const x = q % w, y = (q - x) / w;
        if (x > 0 && !label[q - 1] && sm[q - 1] >= T) { label[q - 1] = id; queue[tail++] = q - 1; }
        if (x < w - 1 && !label[q + 1] && sm[q + 1] >= T) { label[q + 1] = id; queue[tail++] = q + 1; }
        if (y > 0 && !label[q - w] && sm[q - w] >= T) { label[q - w] = id; queue[tail++] = q - w; }
        if (y < h - 1 && !label[q + w] && sm[q + w] >= T) { label[q + w] = id; queue[tail++] = q + w; }
      }
      sizes.push(size);
    }
    const biggest = Math.max(0, ...sizes);
    const keep = sizes.map((sz) => sz > 0 && sz >= Math.max(biggest * 0.06, 30));
    if (this.mask.width !== w || this.mask.height !== h) { this.mask.width = w; this.mask.height = h; }
    const mctx = this.mask.getContext("2d")!;
    const data = mctx.createImageData(w, h);
    for (let i = 0; i < n; i++) {
      let a = 0;
      if (keep[label[i]]) a = Math.min(1, (sm[i] - T) / 0.25 + 0.4);
      else if (sm[i] > 0.15 && sm[i] < T) {
        // thin halo just outside a kept shape keeps edges smooth
        const x = i % w;
        if ((x > 0 && keep[label[i - 1]]) || (x < w - 1 && keep[label[i + 1]]) || (i >= w && keep[label[i - w]]) || (i + w < n && keep[label[i + w]])) a = sm[i];
      }
      data.data[i * 4 + 3] = a * 255;
    }
    mctx.putImageData(data, 0, 0);
  }

  private draw() {
    const { ctx, video } = this;
    const now = performance.now();
    this.dt = this.lastFrame ? Math.min(0.1, (now - this.lastFrame) / 1000) : 1 / 30;
    this.lastFrame = now;
    const bg = this.background();
    const ready = video.readyState >= 2;
    ctx.clearRect(0, 0, STUDIO_W, STUDIO_H);
    ctx.textAlign = "left";

    const cutOut = bg.kind !== "camera" && this.segmenter && ready;
    if (!cutOut) {
      if (!ready) bg.kind === "breaking" ? this.drawBreaking() : bg.kind === "wall" ? this.drawWall() : this.drawBrand();
      if (ready) {
        const p = this.placement(true);
        ctx.drawImage(video, p.x, p.y, p.w, p.h);
      }
    } else {
      // 1. background
      if (bg.kind === "blur") {
        const p = this.placement(true);
        ctx.save();
        ctx.filter = "blur(16px)";
        ctx.drawImage(video, p.x - 20, p.y - 20, p.w + 40, p.h + 40);
        ctx.restore();
      } else if (bg.kind === "image") {
        const img = this.images.get(bg.url!);
        if (img?.complete && img.naturalWidth) ctx.drawImage(img, 0, 0, STUDIO_W, STUDIO_H);
        else this.drawBrand();
      } else if (bg.kind === "breaking") {
        this.drawBreaking();
      } else if (bg.kind === "wall") {
        this.drawWall();
      } else {
        this.drawBrand();
      }
      // 2. the presenter, cut out with the segmentation mask
      const vw = video.videoWidth, vh = video.videoHeight;
      if (this.frame.width !== vw || this.frame.height !== vh) { this.frame.width = vw; this.frame.height = vh; }
      this.frame.getContext("2d")!.drawImage(video, 0, 0, vw, vh);
      const ts = Math.max(performance.now(), this.lastTs + 1);
      this.lastTs = ts;
      const result = this.segmenter!.segmentForVideo(this.frame, ts);
      const masks = result.confidenceMasks ?? [];
      const m = masks[0];
      if (m) {
        const n = m.width * m.height;
        if (!this.prob || this.prob.length !== n) this.prob = new Float32Array(n);
        const prob = this.prob;
        if (this.personFromBackground && masks.length >= 5) {
          // multi-class model: 0 background, 1 hair, 2 body skin, 3 face skin, 4 clothes, 5 other objects.
          // Only the person classes count, so lamps and objects ("others") never show through.
          prob.fill(0);
          for (const c of [1, 2, 3, 4]) {
            const arr = masks[c].getAsFloat32Array();
            for (let i = 0; i < n; i++) prob[i] += arr[i];
          }
          for (let i = 0; i < n; i++) if (prob[i] > 1) prob[i] = 1;
        } else {
          const arr = m.getAsFloat32Array();
          for (let i = 0; i < n; i++) prob[i] = this.personFromBackground ? 1 - arr[i] : arr[i];
        }
        this.buildMask(prob, m.width, m.height);
        const p = this.placement(bg.kind === "blur");
        if (bg.kind !== "blur") p.x += ({ left: -0.24, center: 0, right: 0.24 } as const)[this.settings.side ?? "center"] * STUDIO_W;
        const pctx = this.person.getContext("2d")!;
        pctx.globalCompositeOperation = "source-over";
        pctx.clearRect(0, 0, STUDIO_W, STUDIO_H);
        pctx.drawImage(this.frame, p.x, p.y, p.w, p.h);
        pctx.globalCompositeOperation = "destination-in";
        pctx.filter = "blur(2px)"; // feather the upscaled mask edge
        pctx.drawImage(this.mask, p.x, p.y, p.w, p.h);
        pctx.filter = "none";
        pctx.globalCompositeOperation = "source-over";
        ctx.drawImage(this.person, 0, 0);
      }
      result.close();
    }
    if (this.settings.desk) this.drawDesk();
    this.overlays();
  }

  /** A scrolling text line clipped to a box; returns the new x offset. */
  private scroll(text: string, x: number, left: number, top: number, height: number, font: string, color: string, speed: number, baseline: number) {
    const { ctx } = this;
    ctx.font = font;
    const tw = Math.max(ctx.measureText(text).width, 200);
    x -= speed * 60 * (this.settings.speed ?? 0.6) * this.dt; // speed is px per frame at 60 fps, "Normal"
    if (x < left - tw) x += tw;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, STUDIO_W - left, height);
    ctx.clip();
    ctx.fillStyle = color;
    for (let xx = x; xx < STUDIO_W; xx += tw) ctx.fillText(text, xx, top + baseline);
    ctx.restore();
    return x;
  }

  private overlays() {
    const { ctx } = this;
    const s: StudioSettings = this.settings.citizen
      ? { ...this.settings, live: false, breaking: false, vnTicker: false, tickerLabel: "సిటిజన్ రిపోర్ట్", headlines: [] }
      : this.settings;
    // bottom-up layout: VaartaNow headlines line, news ticker, breaking band, name strap
    let bottom = STUDIO_H;
    const vnH = 42, tickerH = 58;
    const vnY = s.vnTicker ? (bottom -= vnH) : bottom;
    const tickerY = s.ticker ? (bottom -= tickerH) : bottom;
    const headlines = (s.headlines ?? []).filter((h) => h && h !== s.tickerText);

    if (s.logo && s.citizen) {
      ctx.font = `800 22px ${TE}`;
      const w = ctx.measureText("సిటిజన్ రిపోర్ట్").width + 36;
      ctx.fillStyle = "#d97706";
      roundRect(ctx, 32, 28, w, 48, 10);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText("సిటిజన్ రిపోర్ట్", 50, 60);
    } else if (s.logo) {
      ctx.fillStyle = "#dc2626";
      roundRect(ctx, 32, 28, 196, 48, 10);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "800 26px Arial, sans-serif";
      ctx.fillText("VaartaNow", 50, 61);
    }

    if (s.live) {
      const x = s.logo ? 244 : 32;
      ctx.fillStyle = "#dc2626";
      roundRect(ctx, x, 28, 112, 48, 10);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.55 + 0.45 * Math.abs(Math.sin(performance.now() / 400))})`;
      ctx.beginPath();
      ctx.arc(x + 24, 52, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "800 24px Arial, sans-serif";
      ctx.fillText("LIVE", x + 42, 61);
    }

    if (s.clock) {
      const now = new Date();
      const text = `${now.toLocaleDateString("te-IN", { day: "numeric", month: "short" })} · ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
      ctx.font = `600 20px ${TE}`;
      const w = ctx.measureText(text).width + 32;
      ctx.fillStyle = "rgba(11,16,32,0.8)";
      roundRect(ctx, STUDIO_W - 32 - w, 32, w, 40, 8);
      ctx.fill();
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(text, STUDIO_W - 32 - w + 16, 59);
    }

    if (s.strap) {
      const y = bottom - 104;
      const w = 760;
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(40, y, 10, 92);
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.fillRect(50, y, w, 50);
      ctx.fillStyle = "#111827";
      ctx.fillText(fitText(ctx, displayName(s.presenter), w - 40, 30, 20, 800), 70, y + 36);
      ctx.fillStyle = "rgba(11,16,32,0.92)";
      ctx.fillRect(50, y + 50, w, 42);
      ctx.fillStyle = "#fff";
      ctx.fillText(fitText(ctx, s.strapLine || "VaartaNow", w - 40, 23, 15, 600), 70, y + 79);
    }

    if (s.breaking) {
      // top-right breaking-news box: flashing label over the headline scrolling in large letters
      // top right; when the presenter stands on the right it moves to the top left so it never covers their face
      const presenterRight = s.side === "right" && this.background().kind !== "camera";
      const w = 500, x = presenterRight ? 32 : STUDIO_W - 32 - w, labelH = 44, bodyH = 72;
      const y = presenterRight ? (s.logo || s.live ? 90 : 32) : s.clock ? 86 : 32;
      const flash = Math.floor(performance.now() / 700) % 2 === 0;
      ctx.fillStyle = flash ? "#dc2626" : "#b91c1c";
      ctx.fillRect(x, y, w, labelH);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(x, y, w, 4);
      ctx.fillStyle = "#fff";
      ctx.font = "900 24px Arial, sans-serif";
      ctx.fillText("BREAKING NEWS", x + 18, y + 32);
      ctx.fillStyle = "#facc15";
      ctx.font = `900 24px ${TE}`;
      ctx.textAlign = "right";
      ctx.fillText("బ్రేకింగ్ న్యూస్", x + w - 18, y + 32);
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255,255,255,0.97)";
      ctx.fillRect(x, y + labelH, w, bodyH);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y + labelH, w, bodyH);
      ctx.clip();
      ctx.font = `900 40px ${TE}`;
      const text = `${(s.breakingText || s.tickerText || "VaartaNow").trim()}      ●      `;
      const tw = Math.max(ctx.measureText(text).width, 200);
      this.breakingX -= 1.6 * 60 * (s.speed ?? 0.6) * this.dt;
      if (this.breakingX < -tw) this.breakingX += tw;
      ctx.fillStyle = "#111827";
      for (let xx = x + this.breakingX; xx < x + w; xx += tw) ctx.fillText(text, xx, y + labelH + 51);
      ctx.restore();
    }

    if (s.ticker) {
      ctx.fillStyle = "rgba(11,16,32,0.95)";
      ctx.fillRect(0, tickerY, STUDIO_W, tickerH);
      const label = s.tickerLabel || TICKER_LABELS[0];
      ctx.font = `800 24px ${TE}`;
      const labelW = ctx.measureText(label).width + 48;
      const items = [(s.tickerText || "VaartaNow తెలుగు వార్తలు").trim(), ...headlines.slice(0, 5)];
      this.tickerX = this.scroll(`${items.join("     ●     ")}     ●     `, this.tickerX, labelW, tickerY, tickerH, `600 25px ${TE}`, "#fff", 2, 38);
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(0, tickerY, labelW, tickerH);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(0, tickerY, labelW, 4);
      ctx.fillStyle = "#fff";
      ctx.font = `800 24px ${TE}`;
      ctx.fillText(label, 24, tickerY + 38);
    }

    if (s.vnTicker) {
      ctx.fillStyle = "#facc15";
      ctx.fillRect(0, vnY, STUDIO_W, vnH);
      const rest = s.ticker && headlines.length > 8 ? headlines.slice(5) : headlines;
      const text = `${(rest.length ? rest : ["VaartaNow · తాజా తెలుగు వార్తలు"]).join("   ◆   ")}   ◆   `;
      ctx.font = "900 22px Arial, sans-serif";
      const labelW = ctx.measureText("VaartaNow").width + 40;
      this.vnX = this.scroll(text, this.vnX, labelW, vnY, vnH, `700 21px ${TE}`, "#111827", 1.5, 29);
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, vnY, labelW, vnH);
      ctx.fillStyle = "#fff";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.fillText("Vaarta", 20, vnY + 29);
      ctx.fillStyle = "#ef4444";
      ctx.fillText("Now", 20 + ctx.measureText("Vaarta").width, vnY + 29);
    }
  }
}
