// ═══════════════════════════════════════════════════════════════════
//  VaartaNow virtual news studio for the editor's video recordings.
//  Draws the camera onto a 1280×720 canvas with a chosen background
//  (camera as is, blur, a studio set, or a VaartaNow backdrop) and TV
//  graphics (logo, date-time, name strap, scrolling news ticker).
//  The person is cut out in the browser with MediaPipe selfie
//  segmentation, loaded only when a background replacement is used.
// ═══════════════════════════════════════════════════════════════════

import type { ImageSegmenter } from "@mediapipe/tasks-vision";

export const STUDIO_W = 1280;
export const STUDIO_H = 720;

const STORAGE = "https://aapstack.tech/p/e027be62-50a9-4e4d-9341-afc64689762b/storage/v1/object/public/news-images/studio";
// MediaPipe runtime + model, pinned to the installed package version
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

export type StudioBackground = { id: string; label: string; kind: "camera" | "blur" | "image" | "brand"; url?: string };
export const STUDIO_BACKGROUNDS: StudioBackground[] = [
  { id: "camera", label: "Camera as is", kind: "camera" },
  { id: "blur", label: "Blur my room", kind: "blur" },
  { id: "brand", label: "VaartaNow backdrop", kind: "brand" },
  { id: "studio-red", label: "Studio · world map", kind: "image", url: `${STORAGE}/studio-red.webp` },
  { id: "studio-blue", label: "Studio · globe", kind: "image", url: `${STORAGE}/studio-blue.webp` },
  { id: "newsroom", label: "Newsroom", kind: "image", url: `${STORAGE}/newsroom.webp` },
  { id: "vizag-window", label: "Vizag beach view", kind: "image", url: `${STORAGE}/vizag-window.webp` },
  { id: "hyderabad-night", label: "Hyderabad skyline", kind: "image", url: `${STORAGE}/hyderabad-night.webp` },
];

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
};

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

export class NewsStudio {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement;
  private person = document.createElement("canvas");
  private mask = document.createElement("canvas");
  private settings: StudioSettings;
  private images = new Map<string, HTMLImageElement>();
  private segmenter: ImageSegmenter | null = null;
  private segmenterLoading: Promise<void> | null = null;
  private raf = 0;
  private tickerX = STUDIO_W;
  private lastTs = 0;
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
      img.src = bg.url;
      this.images.set(bg.url, img);
    }
    if (bg.kind !== "camera" && !this.segmenter && !this.segmenterLoading) {
      this.onStatus?.("Loading background cut-out…");
      this.segmenterLoading = (async () => {
        try {
          const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
          const fileset = await FilesetResolver.forVisionTasks(WASM);
          const make = (delegate: "GPU" | "CPU") => ImageSegmenter.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: MODEL, delegate },
            runningMode: "VIDEO",
            outputConfidenceMasks: true,
            outputCategoryMask: false,
          });
          this.segmenter = await make("GPU").catch(() => make("CPU"));
          this.onStatus?.("");
        } catch (e: any) {
          this.onStatus?.(`Background replacement is not available on this device (${e?.message ?? e}). Using the camera as is.`);
        } finally {
          this.segmenterLoading = null;
        }
      })();
    }
  }

  // camera frame placement: fill the frame for "camera as is"; keep a portrait phone camera whole
  // (full height, centred) when the background is replaced, so the presenter is not cropped
  private placement(fill: boolean) {
    const vw = this.video.videoWidth || STUDIO_W, vh = this.video.videoHeight || STUDIO_H;
    const portrait = vh > vw;
    const scale = fill || !portrait ? Math.max(STUDIO_W / vw, STUDIO_H / vh) : STUDIO_H / vh;
    const w = vw * scale, h = vh * scale;
    return { x: (STUDIO_W - w) / 2, y: STUDIO_H - h, w, h };
  }

  private drawBrand() {
    const { ctx } = this;
    const g = ctx.createLinearGradient(0, 0, STUDIO_W, STUDIO_H);
    g.addColorStop(0, "#7f1d1d");
    g.addColorStop(0.55, "#b91c1c");
    g.addColorStop(1, "#0b1020");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, STUDIO_W, STUDIO_H);
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 26;
    for (let x = -STUDIO_H; x < STUDIO_W; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, STUDIO_H);
      ctx.lineTo(x + STUDIO_H, 0);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = "#fff";
    ctx.font = "900 150px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("VaartaNow", STUDIO_W - 40, 200);
    ctx.font = `700 64px ${TE}`;
    ctx.fillText("తెలుగు వార్తలు", STUDIO_W - 48, 290);
    ctx.restore();
  }

  private draw() {
    const { ctx, video } = this;
    const bg = this.background();
    const ready = video.readyState >= 2;
    ctx.clearRect(0, 0, STUDIO_W, STUDIO_H);
    ctx.textAlign = "left";

    const cutOut = bg.kind !== "camera" && this.segmenter && ready;
    if (!cutOut) {
      if (bg.kind === "brand" && !ready) this.drawBrand();
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
      } else {
        this.drawBrand();
      }
      // 2. the presenter, cut out with the segmentation mask
      const ts = Math.max(performance.now(), this.lastTs + 1);
      this.lastTs = ts;
      const result = this.segmenter!.segmentForVideo(video, ts);
      const m = result.confidenceMasks?.[0];
      if (m) {
        const conf = m.getAsFloat32Array();
        if (this.mask.width !== m.width || this.mask.height !== m.height) { this.mask.width = m.width; this.mask.height = m.height; }
        const mctx = this.mask.getContext("2d")!;
        const data = mctx.createImageData(m.width, m.height);
        for (let i = 0; i < conf.length; i++) {
          const a = Math.min(1, Math.max(0, (conf[i] - 0.35) / 0.3)); // soft edge
          data.data[i * 4 + 3] = a * 255;
        }
        mctx.putImageData(data, 0, 0);
        const p = this.placement(bg.kind === "blur");
        const pctx = this.person.getContext("2d")!;
        pctx.globalCompositeOperation = "source-over";
        pctx.clearRect(0, 0, STUDIO_W, STUDIO_H);
        pctx.drawImage(video, p.x, p.y, p.w, p.h);
        pctx.globalCompositeOperation = "destination-in";
        pctx.drawImage(this.mask, p.x, p.y, p.w, p.h);
        pctx.globalCompositeOperation = "source-over";
        ctx.drawImage(this.person, 0, 0);
      }
      result.close();
    }
    this.overlays();
  }

  private overlays() {
    const { ctx } = this;
    const s = this.settings;
    const tickerH = 58;
    const tickerY = STUDIO_H - tickerH;

    if (s.logo) {
      ctx.fillStyle = "#dc2626";
      roundRect(ctx, 32, 28, 196, 48, 10);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "800 26px Arial, sans-serif";
      ctx.fillText("VaartaNow", 50, 61);
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

    if (s.strap && (s.presenter || s.strapLine)) {
      const y = (s.ticker ? tickerY : STUDIO_H) - 118;
      const w = 760;
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(40, y, 10, 92);
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.fillRect(50, y, w, 50);
      ctx.fillStyle = "#111827";
      const name = fitText(ctx, s.presenter || "VaartaNow", w - 40, 30, 20, 800);
      ctx.fillText(name, 70, y + 36);
      ctx.fillStyle = "rgba(11,16,32,0.92)";
      ctx.fillRect(50, y + 50, w, 42);
      ctx.fillStyle = "#fff";
      const line = fitText(ctx, s.strapLine || "VaartaNow ప్రతినిధి", w - 40, 23, 15, 600);
      ctx.fillText(line, 70, y + 79);
    }

    if (s.ticker) {
      ctx.fillStyle = "rgba(11,16,32,0.95)";
      ctx.fillRect(0, tickerY, STUDIO_W, tickerH);
      // scrolling text (clipped right of the label)
      const label = s.tickerLabel || TICKER_LABELS[0];
      ctx.font = `800 24px ${TE}`;
      const labelW = ctx.measureText(label).width + 48;
      const text = `${(s.tickerText || "VaartaNow తెలుగు వార్తలు").trim()}     ●     `;
      ctx.font = `600 25px ${TE}`;
      const tw = Math.max(ctx.measureText(text).width, 200);
      this.tickerX -= 2.4;
      if (this.tickerX < labelW - tw) this.tickerX += tw;
      ctx.save();
      ctx.beginPath();
      ctx.rect(labelW, tickerY, STUDIO_W - labelW, tickerH);
      ctx.clip();
      ctx.fillStyle = "#fff";
      for (let x = this.tickerX; x < STUDIO_W; x += tw) ctx.fillText(text, x, tickerY + 38);
      ctx.restore();
      // label block
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(0, tickerY, labelW, tickerH);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(0, tickerY, labelW, 4);
      ctx.fillStyle = "#fff";
      ctx.font = `800 24px ${TE}`;
      ctx.fillText(label, 24, tickerY + 38);
    }
  }
}
