"use client";

/**
 * Smart Resize — batch smart-crop + auto-enhance tool
 * Drop-in route for a Next.js App Router site.
 *
 * Install deps:   npm install smartcrop jszip
 * Place file at:  app/tools/smart-resize/page.tsx
 * (Pages Router:  pages/tools/smart-resize.tsx — works unchanged)
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import smartcrop from "smartcrop";
import JSZip from "jszip";

// ---------- types ----------
type SizeDef = { w: number; h: number; on: boolean; label?: string | null };
type OutputFile = { group: string; size: string; filename: string; blob: Blob };
type OutputCell = {
  fname: string;
  w: number;
  h: number;
  kb: number;
  overBudget: boolean;
  previewUrl: string;
  downloadUrl: string;
};
type ResultCard = {
  name: string;
  sizeMB: string;
  thumbUrl: string;
  tag: string;
  error?: string;
  outputs: OutputCell[];
};

// ---------- presets ----------
const DEFAULT_SIZES: SizeDef[] = [
  { w: 1920, h: 600, on: true },
  { w: 1200, h: 628, on: true },
  { w: 1080, h: 1080, on: true },
  { w: 1080, h: 1920, on: false },
  { w: 800, h: 800, on: false },
  { w: 400, h: 300, on: false },
];

// Client presets live in the shared database — see app/api/tools/presets.
// Seeded (built-in) clients are edit/delete-protected server-side.
type PresetSize = { w: number; h: number; label?: string | null };
type PresetRow = { name: string; sizes: PresetSize[]; seeded: boolean };

// ---------- pure helpers ----------
function baseName(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}

// Folder name for grouping shots of the same subject: strips trailing counters
// so "deluxe room (1)", "deluxe-room-2" and "deluxe room copy" share "deluxe room".
function imageGroup(base: string): string {
  let g = base.trim();
  let prev = "";
  while (prev !== g) {
    prev = g;
    g = g
      .replace(/\s*\(\d+\)\s*$/, "")
      .replace(/[-_ ]+\d+$/, "")
      .replace(/\s+copy\s*\d*$/i, "")
      .trim();
  }
  g = g.replace(/[\\/]+/g, "-");
  return g || base;
}

// "Accommodation / Dine / Meetings & Events" → ["accommodation", "dine", "meetings-events"]
function sectionSlugs(label?: string | null): string[] {
  if (!label) return [];
  return label
    .split("/")
    .map((part) => part.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean);
}

async function fetchPresets(): Promise<PresetRow[]> {
  const res = await fetch("/api/tools/presets");
  if (!res.ok) throw new Error("Could not load presets");
  return res.json();
}

function savePresetReq(name: string, sizes: PresetSize[]): Promise<Response> {
  return fetch("/api/tools/presets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, sizes }),
  });
}

function deletePresetReq(name: string): Promise<Response> {
  return fetch("/api/tools/presets", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        /* fall through */
      }
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read " + file.name));
    };
    img.src = url;
  });
}

type CropBox = { x: number; y: number; w: number; h: number; smart: boolean };

async function computeCrop(
  source: HTMLCanvasElement,
  targetW: number,
  targetH: number
): Promise<CropBox> {
  const sw = source.width;
  const sh = source.height;
  const scale = Math.min(1, 1024 / Math.max(sw, sh));
  let ac: HTMLCanvasElement = source;
  if (scale < 1) {
    ac = document.createElement("canvas");
    ac.width = Math.round(sw * scale);
    ac.height = Math.round(sh * scale);
    ac.getContext("2d")!.drawImage(source, 0, 0, ac.width, ac.height);
  }
  try {
    const r = await smartcrop.crop(ac, {
      width: Math.max(1, Math.round(targetW * scale)),
      height: Math.max(1, Math.round(targetH * scale)),
    });
    const t = r.topCrop;
    return { x: t.x / scale, y: t.y / scale, w: t.width / scale, h: t.height / scale, smart: true };
  } catch {
    // fallback: center crop at target aspect
    const ta = targetW / targetH;
    const sa = sw / sh;
    let cw: number, ch: number;
    if (sa > ta) {
      ch = sh;
      cw = sh * ta;
    } else {
      cw = sw;
      ch = sw / ta;
    }
    return { x: (sw - cw) / 2, y: (sh - ch) / 2, w: cw, h: ch, smart: false };
  }
}

function enhanceCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const n = d.length / 4;
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722) | 0;
    hist[lum]++;
  }
  const clip = n * 0.005;
  let acc = 0,
    lo = 0,
    hi = 255;
  for (let j = 0; j < 256; j++) {
    acc += hist[j];
    if (acc > clip) {
      lo = j;
      break;
    }
  }
  acc = 0;
  for (let k = 255; k >= 0; k--) {
    acc += hist[k];
    if (acc > clip) {
      hi = k;
      break;
    }
  }
  const range = hi - lo;
  const doStretch = range > 30 && range < 250;
  const scale = doStretch ? 255 / range : 1;
  const SAT = 1.12;
  for (let p = 0; p < d.length; p += 4) {
    let r = d[p],
      g = d[p + 1],
      b = d[p + 2];
    if (doStretch) {
      r = (r - lo) * scale;
      g = (g - lo) * scale;
      b = (b - lo) * scale;
    }
    const avg = (r + g + b) / 3;
    r = avg + (r - avg) * SAT;
    g = avg + (g - avg) * SAT;
    b = avg + (b - avg) * SAT;
    d[p] = r < 0 ? 0 : r > 255 ? 255 : r;
    d[p + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    d[p + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }
  ctx.putImageData(img, 0, 0);
}

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
      "image/jpeg",
      quality
    );
  });
}

// Highest JPEG quality that fits the KB budget (binary search); maxKB 0 = no limit.
async function encodeWithBudget(canvas: HTMLCanvasElement, maxKB: number): Promise<Blob> {
  const blob = await canvasToBlob(canvas, 0.9);
  if (!maxKB || blob.size <= maxKB * 1024) return blob;
  let lo = 0.3,
    hi = 0.9,
    best: Blob | null = null;
  for (let i = 0; i < 6; i++) {
    const q = (lo + hi) / 2;
    const b = await canvasToBlob(canvas, q);
    if (b.size <= maxKB * 1024) {
      best = b;
      lo = q;
    } else {
      hi = q;
    }
  }
  // nothing fit even near quality 0.3 — return the smallest we can make
  return best ?? (await canvasToBlob(canvas, 0.3));
}

// ---------- component ----------
export default function SmartResizePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [sizes, setSizes] = useState<SizeDef[]>(DEFAULT_SIZES);
  const [customSize, setCustomSize] = useState("");
  const [enhanceOn, setEnhanceOn] = useState(true);
  const [sectionNamesOn, setSectionNamesOn] = useState(false);
  const [maxKB, setMaxKB] = useState(300);
  const [zipByImage, setZipByImage] = useState(true);
  const [presets, setPresets] = useState<Record<string, PresetSize[]>>({});
  const [seededNames, setSeededNames] = useState<string[]>([]);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, text: "" });
  const [results, setResults] = useState<ResultCard[]>([]);
  const [toast, setToast] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const outputsRef = useRef<OutputFile[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrls = useRef<string[]>([]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const refreshPresets = useCallback(async () => {
    try {
      const list = await fetchPresets();
      const map: Record<string, PresetSize[]> = {};
      list.forEach((p) => {
        map[p.name] = p.sizes;
      });
      setPresets(map);
      setSeededNames(list.filter((p) => p.seeded).map((p) => p.name));
      setTeamNames(list.filter((p) => !p.seeded).map((p) => p.name).sort());
    } catch {
      showToast("Couldn't load client presets — refresh to retry.");
    }
  }, [showToast]);

  useEffect(() => {
    // setState here happens after an awaited fetch, not synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshPresets();
    const urls = objectUrls.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [refreshPresets]);

  // ----- files -----
  const addFiles = useCallback((list: FileList | File[]) => {
    const next: File[] = [];
    Array.from(list).forEach((f) => {
      if (/^image\//.test(f.type)) next.push(f);
    });
    if (next.length) setFiles((prev) => [...prev, ...next]);
  }, []);

  // ----- sizes -----
  const toggleSize = (idx: number) =>
    setSizes((prev) => prev.map((s, i) => (i === idx ? { ...s, on: !s.on } : s)));

  const addSize = useCallback(
    (w: number, h: number, on: boolean, label?: string | null) => {
      if (!(w > 0 && h > 0 && w <= 8000 && h <= 8000)) {
        showToast("Enter a valid size like 1600x900");
        return;
      }
      setSizes((prev) => {
        const exists = prev.some((s) => s.w === w && s.h === h);
        if (exists) {
          return prev.map((s) =>
            s.w === w && s.h === h ? { ...s, on: true, label: label ?? s.label } : s
          );
        }
        return [...prev, { w, h, on, label: label ?? null }];
      });
    },
    [showToast]
  );

  const onAddCustom = () => {
    const v = customSize.trim().toLowerCase().replace(/[×,]/g, "x");
    const m = v.match(/^(\d+)\s*x\s*(\d+)$/);
    if (!m) {
      showToast("Format: width x height, e.g. 1600x900");
      return;
    }
    addSize(parseInt(m[1], 10), parseInt(m[2], 10), true);
    setCustomSize("");
  };

  // ----- presets -----
  const onClientChange = (name: string) => {
    setSelectedClient(name);
    if (!name) return;
    const list = presets[name] ?? [];
    setSizes((prev) => prev.map((s) => ({ ...s, on: false })));
    // apply after the deselect state has been queued
    setTimeout(() => {
      list.forEach((p) => addSize(p.w, p.h, true, p.label));
    }, 0);
    showToast(`Loaded sizes for “${name}”`);
  };

  const onSavePreset = async () => {
    const active = sizes.filter((s) => s.on);
    if (!active.length) {
      showToast("Select at least one size first");
      return;
    }
    const name = window.prompt("Client name for this preset:");
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (seededNames.includes(trimmed)) {
      showToast("That name is a built-in preset — pick another.");
      return;
    }
    const res = await savePresetReq(
      trimmed,
      active.map((s) => ({ w: s.w, h: s.h, label: s.label ?? undefined }))
    ).catch(() => null);
    if (!res?.ok) {
      showToast(
        res?.status === 401
          ? "Session expired — reload the page to unlock again."
          : "Couldn't save the preset — try again."
      );
      return;
    }
    await refreshPresets();
    setSelectedClient(trimmed);
    showToast(`Saved “${trimmed}” for the whole team`);
  };

  const onDeletePreset = async () => {
    if (!selectedClient) {
      showToast("Select a client preset to delete");
      return;
    }
    if (seededNames.includes(selectedClient)) {
      showToast(`“${selectedClient}” is built-in and can't be deleted.`);
      return;
    }
    if (!window.confirm(`Delete preset “${selectedClient}” for the whole team?`)) return;
    const res = await deletePresetReq(selectedClient).catch(() => null);
    if (!res?.ok) {
      showToast(
        res?.status === 401
          ? "Session expired — reload the page to unlock again."
          : "Couldn't delete the preset — try again."
      );
      return;
    }
    await refreshPresets();
    setSelectedClient("");
    showToast("Deleted preset");
  };

  // ----- processing -----
  const canProcess = files.length > 0 && sizes.some((s) => s.on) && !processing;

  const track = (url: string) => {
    objectUrls.current.push(url);
    return url;
  };

  const onProcess = async () => {
    const activeSizes = sizes.filter((s) => s.on);
    if (!files.length || !activeSizes.length) return;

    setProcessing(true);
    setResults([]);
    outputsRef.current = [];
    const total = files.length * activeSizes.length;
    let done = 0;
    let anyFallback = false;
    const cards: ResultCard[] = [];

    for (const file of files) {
      const card: ResultCard = {
        name: file.name,
        sizeMB: (file.size / 1024 / 1024).toFixed(2) + " MB",
        thumbUrl: "",
        tag: "ANALYSING…",
        outputs: [],
      };
      try {
        const bmp = await loadBitmap(file);
        const src = document.createElement("canvas");
        src.width = bmp.width;
        src.height = bmp.height;
        src.getContext("2d")!.drawImage(bmp, 0, 0);
        if ("close" in bmp && typeof bmp.close === "function") bmp.close();

        // thumbnail with focus overlays
        const thumb = document.createElement("canvas");
        thumb.width = 176;
        thumb.height = 132;
        const tctx = thumb.getContext("2d")!;
        const tScale = Math.min(thumb.width / src.width, thumb.height / src.height);
        const tw = src.width * tScale;
        const th = src.height * tScale;
        const tox = (thumb.width - tw) / 2;
        const toy = (thumb.height - th) / 2;
        tctx.fillStyle = "#1c1914";
        tctx.fillRect(0, 0, thumb.width, thumb.height);
        tctx.drawImage(src, tox, toy, tw, th);

        for (const s of activeSizes) {
          setProgress({
            done,
            total,
            text: `${file.name} → ${s.w}×${s.h}  (${done + 1}/${total})`,
          });
          const crop = await computeCrop(src, s.w, s.h);
          if (!crop.smart) anyFallback = true;

          tctx.strokeStyle = "rgba(255,92,56,0.85)";
          tctx.lineWidth = 1.5;
          tctx.strokeRect(tox + crop.x * tScale, toy + crop.y * tScale, crop.w * tScale, crop.h * tScale);

          const out = document.createElement("canvas");
          out.width = s.w;
          out.height = s.h;
          const octx = out.getContext("2d")!;
          octx.fillStyle = "#FFFFFF";
          octx.fillRect(0, 0, s.w, s.h);
          octx.imageSmoothingEnabled = true;
          octx.imageSmoothingQuality = "high";
          octx.drawImage(src, crop.x, crop.y, crop.w, crop.h, 0, 0, s.w, s.h);
          if (enhanceOn) enhanceCanvas(out);

          const blob = await encodeWithBudget(out, maxKB);
          // Section-filename mode: one file per site section for labelled sizes,
          // all sharing the same rendered blob. Unlabelled sizes keep plain names.
          const sections = sectionNamesOn ? sectionSlugs(s.label) : [];
          const stems = sections.length
            ? sections.map((sec) => `${baseName(file.name)}_${sec}`)
            : [baseName(file.name)];
          const previewUrl = out.toDataURL("image/jpeg", 0.6);
          const downloadUrl = track(URL.createObjectURL(blob));
          const kb = Math.max(1, Math.round(blob.size / 1024));
          const overBudget = maxKB > 0 && blob.size > maxKB * 1024;
          for (const stem of stems) {
            const fname = `${stem}_${s.w}x${s.h}.jpg`;
            outputsRef.current.push({
              group: imageGroup(baseName(file.name)),
              size: `${s.w}x${s.h}`,
              filename: fname,
              blob,
            });
            card.outputs.push({ fname, w: s.w, h: s.h, kb, overBudget, previewUrl, downloadUrl });
          }

          done++;
          setProgress({ done, total, text: `${done}/${total}` });
          await new Promise((r) => setTimeout(r, 0));
        }
        card.thumbUrl = thumb.toDataURL("image/jpeg", 0.7);
        card.tag = anyFallback ? "CENTER CROP (AI LIB OFFLINE)" : "AI FOCUS DETECTED";
      } catch (err) {
        card.error = err instanceof Error ? err.message : "Could not process";
        done += activeSizes.length;
      }
      cards.push({ ...card });
      setResults([...cards]);
    }

    setProgress({ done: total, total, text: `Done — ${outputsRef.current.length} files generated.` });
    setProcessing(false);
    if (anyFallback) showToast("Note: smart-crop couldn't run on some images, used center crop.");
  };

  const onZip = async () => {
    const outputs = outputsRef.current;
    if (!outputs.length) return;
    try {
      const zip = new JSZip();
      outputs.forEach((o) => {
        const path = zipByImage ? `${o.group}/${o.size}` : o.size;
        zip.file(`${path}/${o.filename}`, o.blob);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = track(URL.createObjectURL(blob));
      a.download = "smart-resize-output.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(`ZIP ready — ${outputs.length} files.`);
    } catch (e) {
      showToast("ZIP failed: " + (e instanceof Error ? e.message : "unknown error"));
    }
  };

  // ---------- render ----------
  return (
    <div className="sr-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="sr-wrap">
        <header>
          <h1>
            Smart <span className="hl">Resize</span>
          </h1>
          <p>
            Upload once, get every size. Content-aware cropping keeps the subject in frame,
            auto-enhance balances the colours, and files keep their original names.
          </p>
        </header>

        {/* STEP 1 */}
        <section className="sr-card">
          <h2>
            <span className="sr-step">1</span> Upload images
          </h2>
          <label
            className={"sr-drop" + (dragOver ? " hover" : "")}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            <svg
              className="sr-dropicon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
              <path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5" />
            </svg>
            <strong>Drop images here or tap to browse</strong>
            <span>JPG / PNG / WebP · multiple files supported</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {files.length > 0 && (
            <div className="sr-filelist">
              {files.map((f, i) => (
                <div className="sr-filechip" key={f.name + i}>
                  <b>{f.name}</b>
                  <button
                    aria-label={"Remove " + f.name}
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* STEP 2 */}
        <section className="sr-card">
          <h2>
            <span className="sr-step">2</span> Choose output sizes
          </h2>
          <div className="sr-chiprow">
            {sizes.map((s, i) => (
              <button
                key={`${s.w}x${s.h}`}
                className={"sr-sizechip" + (s.on ? " on" : "")}
                onClick={() => toggleSize(i)}
              >
                {(s.label ? s.label + " · " : "") + s.w + " × " + s.h}
              </button>
            ))}
          </div>
          <div className="sr-customrow">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Custom, e.g. 1600x900"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddCustom();
              }}
            />
            <button className="sr-btn ghost" onClick={onAddCustom}>
              Add size
            </button>
          </div>
          <div className="sr-presetrow">
            <select value={selectedClient} onChange={(e) => onClientChange(e.target.value)}>
              <option value="">Client presets…</option>
              {seededNames.length > 0 && (
                <optgroup label="Built-in">
                  {seededNames.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </optgroup>
              )}
              {teamNames.length > 0 && (
                <optgroup label="Saved by team">
                  {teamNames.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <button className="sr-btn ghost" onClick={onSavePreset}>
              Save as client
            </button>
            <button className="sr-btn ghost" onClick={onDeletePreset}>
              Delete
            </button>
          </div>
          <div className="sr-hint">
            Select sizes, then save them under a client name so the team never re-types them.
          </div>
        </section>

        {/* STEP 3 */}
        <section className="sr-card">
          <h2>
            <span className="sr-step">3</span> Output options
          </h2>
          <div className="sr-togglerow">
            <div>
              <b>Colour auto-adjust</b>
              <p>Levels correction + gentle saturation, like Canva&apos;s Enhance.</p>
            </div>
            <label className="sr-switch">
              <input
                type="checkbox"
                checked={enhanceOn}
                onChange={(e) => setEnhanceOn(e.target.checked)}
              />
              <span />
            </label>
          </div>
          <div className="sr-togglerow">
            <div>
              <b>Section filenames</b>
              <p>
                Adds the site section to each name — <i>photo_accommodation_671x358.jpg</i>.
                Sizes shared by several sections export one file per section.
              </p>
            </div>
            <label className="sr-switch">
              <input
                type="checkbox"
                checked={sectionNamesOn}
                onChange={(e) => setSectionNamesOn(e.target.checked)}
              />
              <span />
            </label>
          </div>
          <div className="sr-togglerow">
            <div>
              <b>Folder per photo (ZIP)</b>
              <p>
                Groups the ZIP by photo, then size — <i>deluxe room/671x358/…</i>. Numbered
                shots (<i>deluxe room (1)</i>, <i>deluxe-room-2</i>) share one folder. Off =
                one folder per size.
              </p>
            </div>
            <label className="sr-switch">
              <input
                type="checkbox"
                checked={zipByImage}
                onChange={(e) => setZipByImage(e.target.checked)}
              />
              <span />
            </label>
          </div>
          <div className="sr-togglerow sr-sliderrow">
            <div>
              <b>Max file size</b>
              <p>Each export is compressed to stay under this limit — keeps pages fast.</p>
            </div>
            <div className="sr-slider">
              <input
                type="range"
                min={0}
                max={500}
                step={25}
                value={maxKB}
                onChange={(e) => setMaxKB(parseInt(e.target.value, 10))}
                aria-label="Maximum file size in kilobytes"
              />
              <span className="val">{maxKB === 0 ? "No limit" : `${maxKB} KB`}</span>
            </div>
          </div>
        </section>

        {/* STEP 4 */}
        <section className="sr-card">
          <button className="sr-btn accent process" disabled={!canProcess} onClick={onProcess}>
            {processing ? "Processing…" : "Process images"}
          </button>
          {(processing || progress.total > 0) && (
            <div className="sr-progress">
              <div className="bar">
                <div
                  className="fill"
                  style={{
                    width: progress.total
                      ? Math.round((progress.done / progress.total) * 100) + "%"
                      : "0%",
                  }}
                />
              </div>
              <div className="txt">{progress.text}</div>
            </div>
          )}
        </section>

        {/* RESULTS */}
        {results.length > 0 && (
          <section>
            <div className="sr-reshead">
              <span className="sr-eyebrow">Results</span>
              <button className="sr-btn accent" onClick={onZip} disabled={processing}>
                Download all (ZIP)
              </button>
            </div>
            {results.map((card, i) => (
              <div className="sr-imgcard" key={card.name + i}>
                <div className="top">
                  {card.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={card.thumbUrl} alt={"Preview of " + card.name} width={88} height={66} />
                  ) : (
                    <div className="thumb-ph" />
                  )}
                  <div className="meta">
                    <b>{card.name}</b>
                    <span>{card.sizeMB}</span>
                    {card.error ? (
                      <span className="err">Failed: {card.error}</span>
                    ) : (
                      <span className="tag">{card.tag}</span>
                    )}
                  </div>
                </div>
                {card.outputs.length > 0 && (
                  <div className="outgrid">
                    {card.outputs.map((o) => (
                      <div className="outcell" key={o.fname}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={o.previewUrl} alt={o.fname} />
                        <div className="oc-meta">
                          <b>{o.fname}</b>
                          <span>
                            {o.w} × {o.h} px ·{" "}
                            <em className={o.overBudget ? "kb over" : "kb"}>
                              {o.kb} KB{o.overBudget ? " — over limit" : ""}
                            </em>
                          </span>
                        </div>
                        <a href={o.downloadUrl} download={o.fname}>
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>

      <div className={"sr-toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}

// ---------- styles (scoped under .sr-root) ----------
const CSS = `
.sr-root{--bg:#0d0c0a;--card:#141210;--card-2:#1c1914;--ink:#eae5d8;--muted:#9a948a;--faint:#4a453d;--line:#2a2621;--accent:#ff5c38;--accent-2:#d4ff3a;--accent-soft:rgba(255,92,56,.10);--danger:#ff6b5e;--radius:14px;
  --srf:var(--serif,Georgia,serif);--sns:var(--sans,system-ui,sans-serif);--mno:var(--mono,ui-monospace,monospace);
  background:radial-gradient(900px 420px at 88% -8%,rgba(255,92,56,.09),transparent 60%),radial-gradient(700px 400px at -5% 2%,rgba(212,255,58,.05),transparent 55%),var(--bg);
  color:var(--ink);min-height:100vh;padding-bottom:96px;line-height:1.5;font-family:var(--sns)}
.sr-root *{box-sizing:border-box}
.sr-wrap{max-width:880px;margin:0 auto;padding:0 16px}
.sr-root header{padding:48px 0 26px}
.sr-eyebrow{font-family:var(--mno);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.sr-root h1{font-family:var(--srf);font-weight:400;font-size:clamp(44px,7vw,76px);line-height:.95;letter-spacing:-.025em;margin:0;color:var(--ink)}
.sr-root h1 .hl{background:linear-gradient(180deg,transparent 62%,var(--accent) 62%,var(--accent) 92%,transparent 92%);padding:0 6px;font-style:italic}
.sr-root header p{color:var(--muted);font-size:15px;margin:14px 0 0;max-width:560px}
.sr-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:20px;margin-bottom:16px}
.sr-card h2{font-family:var(--mno);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:500;margin:0 0 14px;display:flex;align-items:center;gap:10px}
.sr-step{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--accent);color:#12110e;font-size:11px;font-weight:700;letter-spacing:0;font-family:var(--sns)}
.sr-drop{display:block;border:1px dashed var(--faint);border-radius:12px;padding:36px 16px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;background:var(--card-2)}
.sr-drop:hover,.sr-drop.hover{border-color:var(--accent);background:var(--accent-soft)}
.sr-dropicon{width:38px;height:38px;margin:0 auto 10px;display:block;color:var(--accent);transition:transform .2s}
.sr-drop:hover .sr-dropicon,.sr-drop.hover .sr-dropicon{transform:translateY(-3px)}
.sr-drop strong{display:block;font-size:15px;color:var(--ink);font-weight:600}
.sr-drop span{color:var(--muted);font-size:13px}
.sr-drop input{display:none}
.sr-filelist{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}
.sr-filechip{display:inline-flex;align-items:center;gap:8px;background:var(--card-2);border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:12.5px;max-width:100%}
.sr-filechip b{font-weight:500;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}
.sr-filechip button{border:none;background:none;color:var(--muted);cursor:pointer;font-size:14px;line-height:1;padding:0}
.sr-filechip button:hover{color:var(--accent)}
.sr-chiprow{display:flex;flex-wrap:wrap;gap:8px}
.sr-sizechip{border:1px solid var(--line);background:transparent;border-radius:999px;padding:8px 14px;font-family:var(--mno);font-size:11.5px;letter-spacing:.02em;cursor:pointer;user-select:none;transition:all .18s;color:var(--muted)}
.sr-sizechip:hover{border-color:var(--muted);color:var(--ink)}
.sr-sizechip.on{background:var(--accent);border-color:var(--accent);color:#12110e;box-shadow:0 0 18px rgba(255,92,56,.28)}
.sr-customrow{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.sr-customrow input{border:1px solid var(--line);background:var(--card-2);color:var(--ink);border-radius:999px;padding:9px 14px;font-size:13.5px;width:180px;font-family:var(--mno)}
.sr-customrow input::placeholder{color:var(--faint)}
.sr-customrow input:focus{outline:1px solid var(--accent);outline-offset:0;border-color:var(--accent)}
.sr-btn{border:1px solid var(--line);border-radius:999px;padding:9px 18px;font-size:13.5px;font-weight:500;cursor:pointer;font-family:var(--sns);transition:all .2s;background:transparent;color:var(--ink)}
.sr-btn.ghost:hover:not(:disabled){border-color:var(--ink)}
.sr-btn.accent{background:var(--accent);color:#12110e;border-color:var(--accent);font-weight:600}
.sr-btn.accent:hover:not(:disabled){background:transparent;color:var(--accent)}
.sr-btn:disabled{opacity:.4;cursor:not-allowed}
.sr-btn.process{width:100%;padding:15px;font-size:15px}
.sr-presetrow{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center}
.sr-presetrow select{border:1px solid var(--line);background:var(--card-2);color:var(--ink);border-radius:999px;padding:9px 14px;font-size:13px;flex:1;min-width:160px;font-family:var(--sns)}
.sr-hint{font-size:12px;color:var(--faint);margin-top:10px}
.sr-togglerow{display:flex;align-items:center;justify-content:space-between;gap:12px}
.sr-togglerow + .sr-togglerow{margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
.sr-togglerow p i{font-style:normal;font-family:var(--mno);font-size:11px}
.sr-slider{display:flex;align-items:center;gap:12px;flex:none}
.sr-slider input[type=range]{width:150px;accent-color:var(--accent);cursor:pointer}
.sr-slider .val{font-family:var(--srf);font-style:italic;font-size:17px;color:var(--ink);min-width:70px;text-align:right}
.sr-togglerow b{font-size:14.5px;color:var(--ink);font-weight:600}
.sr-togglerow p{font-size:12.5px;color:var(--muted);margin:0}
.sr-switch{position:relative;width:46px;height:26px;flex:none;display:inline-block}
.sr-switch input{opacity:0;width:0;height:0;position:absolute}
.sr-switch span{position:absolute;inset:0;background:#3a352e;border-radius:999px;cursor:pointer;transition:.15s}
.sr-switch span:before{content:"";position:absolute;height:20px;width:20px;left:3px;top:3px;background:var(--ink);border-radius:50%;transition:.15s}
.sr-switch input:checked + span{background:var(--accent)}
.sr-switch input:checked + span:before{background:#12110e;transform:translateX(20px)}
.sr-progress{margin-top:14px}
.sr-progress .bar{height:6px;background:var(--line);border-radius:99px;overflow:hidden}
.sr-progress .fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-2));transition:width .2s}
.sr-progress .txt{font-family:var(--mno);font-size:11.5px;color:var(--muted);margin-top:8px;text-align:center;letter-spacing:.04em}
.sr-reshead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.sr-imgcard{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;margin-bottom:14px;background:var(--card)}
.sr-imgcard .top{display:flex;gap:12px;padding:12px;border-bottom:1px solid var(--line);align-items:center}
.sr-imgcard .top img,.sr-imgcard .thumb-ph{width:88px;height:66px;object-fit:cover;border-radius:8px;background:var(--card-2);flex:none}
.sr-imgcard .meta b{font-size:14px;color:var(--ink);word-break:break-all;font-weight:600}
.sr-imgcard .meta span{display:block;font-size:12px;color:var(--muted)}
.sr-imgcard .meta .tag{display:inline-block;font-family:var(--mno);font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);background:var(--accent-soft);border-radius:5px;padding:2px 8px;margin-top:4px}
.sr-imgcard .meta .err{color:var(--danger)}
.outgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;padding:12px}
.outcell{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--card-2);transition:border-color .18s,transform .18s}
.outcell:hover{transform:translateY(-2px);border-color:var(--muted)}
.outcell img{width:100%;display:block;background:var(--card-2)}
.outcell .oc-meta{padding:8px 10px;font-size:11.5px;color:var(--muted)}
.outcell .oc-meta .kb{font-style:normal}
.outcell .oc-meta .kb.over{color:var(--danger);font-weight:700}
.outcell .oc-meta b{display:block;color:var(--ink);font-size:12px;word-break:break-all;font-weight:500}
.outcell a{display:block;text-align:center;padding:8px;font-size:12.5px;font-weight:600;color:var(--accent);text-decoration:none;border-top:1px solid var(--line);transition:background .18s}
.outcell a:hover{background:var(--accent-soft)}
.sr-toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:var(--ink);color:#12110e;padding:10px 18px;border-radius:99px;font-size:13.5px;font-weight:500;opacity:0;pointer-events:none;transition:opacity .25s;z-index:50;max-width:90vw;text-align:center}
.sr-toast.show{opacity:1}
@media (prefers-reduced-motion: reduce){.sr-root *{transition:none!important}}
`;
