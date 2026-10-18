import { Camera, Mic } from "lucide-react";
import { isVirtualCamera, type useMediaDevices } from "@/hooks/useMediaDevices";

type Devices = ReturnType<typeof useMediaDevices>;

/**
 * Camera + microphone choice for the recorders. Picking a virtual camera (OBS etc.) switches the studio to
 * "Camera as is": the OBS picture is used untouched and only the studio graphics are drawn on top.
 */
export function DevicePicker({ devices, video, disabled, onBackgroundAsIs }: {
  devices: Devices;
  video: boolean;
  disabled?: boolean;
  /** Called from the virtual-camera tip to switch the studio background to "Camera as is". */
  onBackgroundAsIs?: () => void;
}) {
  const { cameras, mics, cameraId, micId, cameraLabel, setCameraId, setMicId } = devices;
  const selectCls = "h-9 w-full min-w-0 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 text-xs font-bold disabled:opacity-60";
  const virtual = video && isVirtualCamera(cameraLabel);

  return (
    <div className="space-y-2 rounded-xl border border-[hsl(var(--border))] p-2.5">
      <div className={`grid gap-2 ${video ? "sm:grid-cols-2" : ""}`}>
        {video && (
          <label className="flex min-w-0 items-center gap-1.5">
            <Camera className="size-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
            <span className="sr-only">Camera</span>
            <select aria-label="Camera" value={cameraId} disabled={disabled} className={selectCls}
              onChange={(e) => {
                setCameraId(e.target.value);
                const label = e.target.selectedOptions[0]?.textContent ?? "";
                if (isVirtualCamera(label)) onBackgroundAsIs?.();
              }}>
              <option value="">Default camera</option>
              {cameras.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
        )}
        <label className="flex min-w-0 items-center gap-1.5">
          <Mic className="size-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <span className="sr-only">Microphone</span>
          <select aria-label="Microphone" value={micId} disabled={disabled} onChange={(e) => setMicId(e.target.value)} className={selectCls}>
            <option value="">Default microphone</option>
            {mics.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
      </div>
      {video && cameras.length === 0 && (
        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
          Camera names appear after you open the camera once. Virtual cameras (OBS, DroidCam, Camo) must be started before you open this page.
        </p>
      )}
      {virtual && (
        <p className="text-[11px] font-bold text-amber-600">
          Virtual camera: its picture is used as is, with only the studio graphics on top.
          {onBackgroundAsIs && (
            <button type="button" onClick={onBackgroundAsIs} className="ml-1 underline">Use “Camera as is”</button>
          )}
        </p>
      )}
    </div>
  );
}
