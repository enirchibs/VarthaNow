import { useCallback, useEffect, useState } from "react";

// Lets editors pick which camera / microphone the recorders use (e.g. OBS Virtual Camera, DroidCam,
// Camo or an external webcam) instead of whatever the browser treats as the default.

const CAMERA_KEY = "vn-camera-id";
const MIC_KEY = "vn-mic-id";

export type DeviceOption = { id: string; label: string };

const read = (key: string) => {
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
};
const write = (key: string, value: string) => {
  try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch { /* private mode */ }
};

/** Names of common virtual cameras; used to suggest the "Camera as is" studio background. */
export const isVirtualCamera = (label: string) =>
  /virtual|obs|droidcam|camo|manycam|xsplit|snap camera|nvidia broadcast|mmhmm|iriun|epoccam/i.test(label);

export function useMediaDevices() {
  const [cameras, setCameras] = useState<DeviceOption[]>([]);
  const [mics, setMics] = useState<DeviceOption[]>([]);
  const [cameraId, setCameraIdState] = useState(() => read(CAMERA_KEY));
  const [micId, setMicIdState] = useState(() => read(MIC_KEY));

  // Device names are only visible after the person has allowed camera/mic once, so call this again
  // after the stream opens.
  const refresh = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const pick = (kind: MediaDeviceKind, fallback: string) =>
        list
          .filter((d) => d.kind === kind && d.deviceId && d.deviceId !== "default" && d.deviceId !== "communications")
          .map((d, i) => ({ id: d.deviceId, label: d.label || `${fallback} ${i + 1}` }));
      setCameras(pick("videoinput", "Camera"));
      setMics(pick("audioinput", "Microphone"));
    } catch { /* not allowed yet */ }
  }, []);

  useEffect(() => {
    void refresh();
    const md = navigator.mediaDevices;
    md?.addEventListener?.("devicechange", refresh);
    return () => md?.removeEventListener?.("devicechange", refresh);
  }, [refresh]);

  const setCameraId = useCallback((id: string) => { setCameraIdState(id); write(CAMERA_KEY, id); }, []);
  const setMicId = useCallback((id: string) => { setMicIdState(id); write(MIC_KEY, id); }, []);

  const cameraLabel = cameras.find((c) => c.id === cameraId)?.label ?? "";

  /**
   * Open the chosen devices. If a saved device is gone (unplugged, OBS closed), fall back to the
   * browser default and forget the stale choice instead of failing.
   */
  const open = useCallback(async (withVideo: boolean) => {
    const audio = (id: string): MediaTrackConstraints => ({ echoCancellation: true, noiseSuppression: true, ...(id ? { deviceId: { exact: id } } : {}) });
    const video = (id: string): MediaTrackConstraints => ({
      width: { ideal: 1280 }, height: { ideal: 720 },
      ...(id ? { deviceId: { exact: id } } : { facingMode: "user" }),
    });
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: audio(micId), video: withVideo ? video(cameraId) : false });
    } catch (e: any) {
      if (!(cameraId || micId) || !["OverconstrainedError", "NotFoundError", "NotReadableError"].includes(e?.name)) throw e;
      setCameraId("");
      setMicId("");
      stream = await navigator.mediaDevices.getUserMedia({ audio: audio(""), video: withVideo ? video("") : false });
    }
    void refresh();
    return stream;
  }, [cameraId, micId, refresh, setCameraId, setMicId]);

  return { cameras, mics, cameraId, micId, cameraLabel, setCameraId, setMicId, open, refresh };
}
