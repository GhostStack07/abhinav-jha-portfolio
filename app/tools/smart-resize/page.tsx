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
type OutputFile = { folder: string; filename: string; blob: Blob };
type OutputCell = {
  fname: string;
  w: number;
  h: number;
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

const BUILT_IN: Record<string, { w: number; h: number; label: string }[]> = {
  "Royal Orchid": [
    { w: 1366, h: 565, label: "Banner" },
    { w: 600, h: 500, label: "Overview" },
    // One 671×358 output serves all four site sections (same pixels = same file)
    { w: 671, h: 358, label: "Accommodation / Dine / Meetings & Events / In & Around" },
    { w: 800, h: 400, label: "Gallery" },
    { w: 452, h: 440, label: "City Page" },
  ],
  "Suba Hotels": [
    { w: 1349, h: 600, label: "Overview Banner" },
    { w: 1160, h: 440, label: "Overview Dining" },
    // One 1280×800 output serves both sections
    { w: 1280, h: 800, label: "Accommodation / Dining" },
    { w: 855, h: 470, label: "Meetings & Events" },
    { w: 716, h: 560, label: "Meetings & Events (alt)" },
    { w: 700, h: 560, label: "Gallery" },
    { w: 356, h: 280, label: "Hotel Card" },
  ],
};

const STORE_KEY = "smart-resize-client-presets";

// ---------- pure helpers ----------
function baseName(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}

// "Accommodation / Dine / Meetings & Events" → ["accommodation", "dine", "meetings-events"]
function sectionSlugs(label?: string | null): string[] {
  if (!label) return [];
  return label
    .split("/")
    .map((part) => part.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean);
}

function loadSavedPresets(): Record<string, { w: number; h: number; label?: string }[]> {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSavedPresets(obj: Record<string, { w: number; h: number; label?: string }[]>) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(obj));
  } catch {
    /* storage unavailable — presets stay session-only */
  }
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

// ---------- component ----------
export default function SmartResizePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [sizes, setSizes] = useState<SizeDef[]>(DEFAULT_SIZES);
  const [customSize, setCustomSize] = useState("");
  const [enhanceOn, setEnhanceOn] = useState(true);
  const [sectionNamesOn, setSectionNamesOn] = useState(false);
  const [clientNames, setClientNames] = useState<string[]>([]);
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

  useEffect(() => {
    // localStorage is only readable after mount; a lazy initializer would mismatch SSR markup
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClientNames(Object.keys(loadSavedPresets()).filter((n) => !BUILT_IN[n]).sort());
    const urls = objectUrls.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

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
    const list = BUILT_IN[name] ?? loadSavedPresets()[name] ?? [];
    setSizes((prev) => prev.map((s) => ({ ...s, on: false })));
    // apply after the deselect state has been queued
    setTimeout(() => {
      list.forEach((p) => addSize(p.w, p.h, true, (p as { label?: string }).label));
    }, 0);
    showToast(`Loaded sizes for “${name}”`);
  };

  const onSavePreset = () => {
    const active = sizes.filter((s) => s.on);
    if (!active.length) {
      showToast("Select at least one size first");
      return;
    }
    const name = window.prompt("Client name for this preset:");
    if (!name) return;
    const trimmed = name.trim();
    if (BUILT_IN[trimmed]) {
      showToast("That name is a built-in preset — pick another.");
      return;
    }
    const presets = loadSavedPresets();
    presets[trimmed] = active.map((s) => ({ w: s.w, h: s.h, label: s.label ?? undefined }));
    saveSavedPresets(presets);
    setClientNames(Object.keys(presets).filter((n) => !BUILT_IN[n]).sort());
    setSelectedClient(trimmed);
    showToast(`Saved preset for “${trimmed}”`);
  };

  const onDeletePreset = () => {
    if (!selectedClient) {
      showToast("Select a client preset to delete");
      return;
    }
    if (BUILT_IN[selectedClient]) {
      showToast(`“${selectedClient}” is built-in and can't be deleted.`);
      return;
    }
    if (!window.confirm(`Delete preset “${selectedClient}”?`)) return;
    const presets = loadSavedPresets();
    delete presets[selectedClient];
    saveSavedPresets(presets);
    setClientNames(Object.keys(presets).filter((n) => !BUILT_IN[n]).sort());
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
        tctx.fillStyle = "#EEF1F4";
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

          tctx.strokeStyle = "rgba(15,118,110,0.85)";
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

          const blob = await canvasToBlob(out);
          // Section-filename mode: one file per site section for labelled sizes,
          // all sharing the same rendered blob. Unlabelled sizes keep plain names.
          const sections = sectionNamesOn ? sectionSlugs(s.label) : [];
          const stems = sections.length
            ? sections.map((sec) => `${baseName(file.name)}_${sec}`)
            : [baseName(file.name)];
          const previewUrl = out.toDataURL("image/jpeg", 0.6);
          const downloadUrl = track(URL.createObjectURL(blob));
          for (const stem of stems) {
            const fname = `${stem}_${s.w}x${s.h}.jpg`;
            outputsRef.current.push({ folder: `${s.w}x${s.h}`, filename: fname, blob });
            card.outputs.push({ fname, w: s.w, h: s.h, previewUrl, downloadUrl });
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
      outputs.forEach((o) => zip.folder(o.folder)!.file(o.filename, o.blob));
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
          <div className="sr-eyebrow">Internal Tool</div>
          <h1>Smart Resize</h1>
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
              <optgroup label="Built-in">
                {Object.keys(BUILT_IN).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </optgroup>
              {clientNames.length > 0 && (
                <optgroup label="Saved by team">
                  {clientNames.map((n) => (
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
                            {o.w} × {o.h} px
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
.sr-root{--bg:#EDF0F3;--card:#fff;--ink:#17222E;--muted:#5D6B7A;--line:#D8DEE5;--accent:#0F766E;--accent-soft:#E2F1EF;--accent-ink:#0B5A54;--danger:#B4372F;--radius:12px;
  background:var(--bg);color:var(--ink);min-height:100vh;padding-bottom:80px;line-height:1.5;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
.sr-root *{box-sizing:border-box}
.sr-wrap{max-width:880px;margin:0 auto;padding:0 16px}
.sr-root header{padding:28px 0 18px}
.sr-eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-ink);font-weight:700}
.sr-root h1{font-size:clamp(24px,5vw,34px);font-weight:800;letter-spacing:-.02em;margin:4px 0 0}
.sr-root header p{color:var(--muted);font-size:14px;margin:6px 0 0;max-width:560px}
.sr-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:18px;margin-bottom:14px}
.sr-card h2{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700;margin:0 0 12px;display:flex;align-items:center;gap:8px}
.sr-step{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--ink);color:#fff;font-size:11px;font-weight:700;letter-spacing:0}
.sr-drop{display:block;border:2px dashed var(--line);border-radius:var(--radius);padding:34px 16px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s}
.sr-drop.hover{border-color:var(--accent);background:var(--accent-soft)}
.sr-drop strong{display:block;font-size:15px}
.sr-drop span{color:var(--muted);font-size:13px}
.sr-drop input{display:none}
.sr-filelist{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}
.sr-filechip{display:inline-flex;align-items:center;gap:6px;background:#F2F5F7;border:1px solid var(--line);border-radius:8px;padding:5px 10px;font-size:12.5px;max-width:100%}
.sr-filechip b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}
.sr-filechip button{border:none;background:none;color:var(--muted);cursor:pointer;font-size:14px;line-height:1;padding:0}
.sr-chiprow{display:flex;flex-wrap:wrap;gap:8px}
.sr-sizechip{border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:7px 14px;font-size:13px;cursor:pointer;user-select:none;transition:all .12s;font-weight:600;color:var(--muted);font-family:inherit}
.sr-sizechip.on{background:var(--accent);border-color:var(--accent);color:#fff}
.sr-customrow{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.sr-customrow input{border:1px solid var(--line);border-radius:8px;padding:9px 12px;font-size:14px;width:170px;font-family:inherit}
.sr-customrow input:focus{outline:2px solid var(--accent);outline-offset:0;border-color:var(--accent)}
.sr-btn{border:none;border-radius:8px;padding:9px 16px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit}
.sr-btn.ghost{background:#F2F5F7;color:var(--ink);border:1px solid var(--line)}
.sr-btn.accent{background:var(--accent);color:#fff}
.sr-btn:disabled{opacity:.45;cursor:not-allowed}
.sr-btn.process{width:100%;padding:14px;font-size:15.5px;border-radius:10px}
.sr-presetrow{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center}
.sr-presetrow select{border:1px solid var(--line);border-radius:8px;padding:9px 12px;font-size:13.5px;background:#fff;flex:1;min-width:160px;font-family:inherit}
.sr-hint{font-size:12px;color:var(--muted);margin-top:8px}
.sr-togglerow{display:flex;align-items:center;justify-content:space-between;gap:12px}
.sr-togglerow + .sr-togglerow{margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
.sr-togglerow p i{font-style:normal;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}
.sr-togglerow b{font-size:14.5px}
.sr-togglerow p{font-size:12.5px;color:var(--muted);margin:0}
.sr-switch{position:relative;width:46px;height:26px;flex:none;display:inline-block}
.sr-switch input{opacity:0;width:0;height:0;position:absolute}
.sr-switch span{position:absolute;inset:0;background:#C6CED6;border-radius:999px;cursor:pointer;transition:.15s}
.sr-switch span:before{content:"";position:absolute;height:20px;width:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.15s}
.sr-switch input:checked + span{background:var(--accent)}
.sr-switch input:checked + span:before{transform:translateX(20px)}
.sr-progress{margin-top:12px}
.sr-progress .bar{height:8px;background:#E4E9ED;border-radius:99px;overflow:hidden}
.sr-progress .fill{height:100%;background:var(--accent);transition:width .2s}
.sr-progress .txt{font-size:12.5px;color:var(--muted);margin-top:6px;text-align:center}
.sr-reshead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.sr-imgcard{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;margin-bottom:14px;background:#fff}
.sr-imgcard .top{display:flex;gap:12px;padding:12px;border-bottom:1px solid var(--line);align-items:center}
.sr-imgcard .top img,.sr-imgcard .thumb-ph{width:88px;height:66px;object-fit:cover;border-radius:8px;background:#EEF1F4;flex:none}
.sr-imgcard .meta b{font-size:14px;word-break:break-all}
.sr-imgcard .meta span{display:block;font-size:12px;color:var(--muted)}
.sr-imgcard .meta .tag{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-ink);background:var(--accent-soft);border-radius:5px;padding:2px 7px;margin-top:4px}
.sr-imgcard .meta .err{color:var(--danger)}
.outgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;padding:12px}
.outcell{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#FAFBFC}
.outcell img{width:100%;display:block;background:#EEF1F4}
.outcell .oc-meta{padding:8px 10px;font-size:11.5px;color:var(--muted)}
.outcell .oc-meta b{display:block;color:var(--ink);font-size:12px;word-break:break-all;font-weight:600}
.outcell a{display:block;text-align:center;padding:7px;font-size:12.5px;font-weight:700;color:var(--accent-ink);text-decoration:none;border-top:1px solid var(--line)}
.sr-toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#17222E;color:#fff;padding:10px 18px;border-radius:99px;font-size:13.5px;opacity:0;pointer-events:none;transition:opacity .25s;z-index:50;max-width:90vw;text-align:center}
.sr-toast.show{opacity:1}
@media (prefers-reduced-motion: reduce){.sr-root *{transition:none!important}}
`;
