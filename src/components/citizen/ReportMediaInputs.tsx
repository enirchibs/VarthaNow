import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Mic, Square, Trash2, X } from "lucide-react";
import { MAX_REPORT_FILES, MAX_VIDEO_BYTES } from "@/lib/citizen-reports";

/** Pick up to 3 photos / videos for a citizen report. */
export function MediaPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [note, setNote] = useState("");
  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  function add(list: FileList | null) {
    setNote("");
    const picked = Array.from(list ?? []).filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    const tooBig = picked.filter((f) => f.type.startsWith("video/") && f.size > MAX_VIDEO_BYTES);
    if (tooBig.length) setNote("60 MB కంటే పెద్ద వీడియోలు జోడించలేము.");
    const next = [...files, ...picked.filter((f) => !tooBig.includes(f))].slice(0, MAX_REPORT_FILES);
    if (files.length + picked.length > MAX_REPORT_FILES) setNote(`గరిష్ఠంగా ${MAX_REPORT_FILES} ఫోటోలు/వీడియోలు మాత్రమే.`);
    onChange(next);
  }

  return (
    <div className="space-y-2 pt-2">
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map(({ file, url }, i) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-black">
              {file.type.startsWith("video/")
                ? <video src={url} muted playsInline className="size-full object-cover" />
                : <img src={url} alt="" className="size-full object-cover" />}
              <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white" aria-label="తొలగించండి">
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {files.length < MAX_REPORT_FILES && (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-4 py-3 text-xs font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
          <Camera className="size-4 text-blue-600 dark:text-blue-400" />
          <span>ఫోటోలు లేదా వీడియోలు జోడించండి ({files.length}/{MAX_REPORT_FILES})</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      {note && <p className="text-[11px] font-bold text-orange-600">{note}</p>}
    </div>
  );
}

const pickAudioMime = () =>
  ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";

/** Record one voice note (up to 3 minutes). */
export function VoiceNoteRecorder({ value, onChange }: { value: Blob | null; onChange: (blob: Blob | null) => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const recRef = useRef<MediaRecorder | null>(null);
  const url = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => { if (s + 1 >= 180) recRef.current?.stop(); return s + 1; }), 1000);
    return () => clearInterval(t);
  }, [recording]);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mimeType = pickAudioMime();
      const rec = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 48_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        onChange(new Blob(chunks, { type: (rec.mimeType || mimeType || "audio/webm").split(";")[0] }));
      };
      recRef.current = rec;
      setSeconds(0);
      rec.start(1000);
      setRecording(true);
    } catch (e: any) {
      setError(e?.name === "NotAllowedError" ? "మైక్రోఫోన్ అనుమతి ఇవ్వండి." : "రికార్డింగ్ ప్రారంభించలేకపోయాము.");
    }
  }

  return (
    <div className="space-y-2 pt-1">
      {!recording && !value && (
        <button type="button" onClick={start}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-4 py-2.5 text-xs font-bold text-[hsl(var(--foreground))] transition hover:bg-red-500/10 hover:text-red-600">
          <Mic className="size-4 text-red-500" />
          <span>వాయిస్ నోట్ రికార్డ్ చేయండి</span>
        </button>
      )}
      {recording && (
        <button type="button" onClick={() => recRef.current?.stop()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white">
          <Square className="size-4 fill-white" />
          <span>ఆపండి · {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>
        </button>
      )}
      {value && url && !recording && (
        <div className="flex items-center gap-2">
          <audio src={url} controls className="h-10 flex-1" />
          <button type="button" onClick={() => onChange(null)} className="flex size-9 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-red-600" aria-label="తొలగించండి">
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
      {error && <p className="text-[11px] font-bold text-red-600">{error}</p>}
    </div>
  );
}
