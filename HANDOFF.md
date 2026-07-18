# HANDOFF — Smart Resize (for Claude Code)

Owner: AJ (Abhinav Jha) · Target repo: abhinavjha.com (Next.js)
Status: v1 complete and working · This doc = full context, do not re-ask for it.

---

## 1. What this project is

Internal tool for Internet Moguls, a hospitality digital marketing agency with
150+ hotel clients. The ops team receives 200+ images/day that must be manually
cropped and resized into multiple client-specific sizes for hotel websites.
This tool automates it:

batch upload → AI smart crop (subject-aware) → auto colour enhance
(Canva-style) → export every required size → download individually or as ZIP.

Non-negotiable requirement: output filenames keep the original uploaded name,
with a size suffix — `originalname_1366x565.jpg`. ZIP groups outputs into
folders per size (e.g. `1366x565/`).

---

## 2. Files in this handoff

| File | Place at | Purpose |
|---|---|---|
| `page.tsx` | `app/tools/smart-resize/page.tsx` | The entire tool (client component, typechecked) |
| `smartcrop.d.ts` | `types/smartcrop.d.ts` | Type declarations for the `smartcrop` package |
| `CLAUDE.md` | repo root | Short-form context (subset of this doc) |
| `HANDOFF.md` | repo root | This doc |

Dependencies to install: `npm install smartcrop jszip`

Pages Router variant: place page.tsx at `pages/tools/smart-resize.tsx` — no
code changes needed.

---

## 3. Architecture decisions already made (respect these)

1. **All processing is client-side** (browser canvas). Reason: zero server
   cost, works on Vercel free tier, no image data leaves the user's machine.
   Do not move processing server-side unless a feature genuinely requires it.
2. **Crop engine = smartcrop.js** (edge / skin-tone / saturation scoring, not
   an LLM). `computeCrop()` in page.tsx is the single swap point for any
   future engine (YOLO etc.). Never spread crop logic outside this function.
3. **Center-crop fallback**: if smartcrop fails, the tool center-crops and
   tags the result card "CENTER CROP (AI LIB OFFLINE)". Keep this behaviour.
4. **Enhance = levels stretch (0.5% clip) + saturation 1.12**, skipped for
   flat/full-range images. `enhanceCanvas()` is the swap point.
5. **Styles fully scoped under `.sr-root`** — must never leak CSS into the
   host site or inherit broken styles from it.
6. **Built-in client presets are hardcoded** in the `BUILT_IN` object;
   team-saved presets use localStorage via `loadSavedPresets()` /
   `saveSavedPresets()` — these two functions are deliberately isolated so a
   shared database can replace them without touching UI code.

---

## 4. Client preset data (source of truth)

Royal Orchid:
- Banner 1366×565 · Overview 600×500 · Accom/Dine/M&E/In&Around 671×358
  (one size serves four site sections) · Gallery 800×400 · City Page 452×440

Suba Hotels:
- Overview Banner 1349×600 · Overview Dining 1160×440 · Accom/Dining 1280×800
- Meetings & Events A 855×470 · Meetings & Events B 716×560
- Gallery 700×560 · Hotel Card 356×280

More clients will be added over time — into `BUILT_IN` until Task 3 below
ships a shared database.

---

## 5. Known limitations of v1

- Team-saved presets are per-browser (localStorage), not shared across team.
- Route is public once deployed (unlisted but unauthenticated).
- Practical batch ceiling ~15–20 large images per run (browser memory).
- Output is always JPEG (transparency flattened to white).

---

## 6. Task backlog (priority order, with acceptance criteria)

### Task 1 — Deploy v1 ✅ start here
- Install deps, place files, ensure `next build` passes with the rest of
  the site (check for Tailwind/ESLint/TS config conflicts).
- Accept: live at `abhinavjha.com/tools/smart-resize`; upload 3 images,
  select "Royal Orchid" preset, process, ZIP downloads with correct
  filenames and folder structure.

### Task 2 — Access protection ✅ shipped 2026-07-18
- Server-side gate in `proxy.ts` (Next 16 proxy convention; also guards
  /admin). `/tools/*` without a valid `aj_tool` session cookie redirects to
  `/tools/unlock`; `/api/tools/unlock` checks the code against env var
  `SMART_RESIZE_CODE` and sets the cookie (session-lifetime, httpOnly).
- Gate is OFF when `SMART_RESIZE_CODE` is unset (fail-open rollout). The
  code lives in Vercel env (production); rotate it there to change access.
- Accepted: no-cookie visit shows the code prompt; correct code unlocks
  for the browser session.

### Task 3 — Shared preset database
- Replace localStorage preset functions with Supabase (free tier) or
  Vercel KV. Keep the same function signatures.
- Accept: a preset saved by one team member appears for all others;
  built-in presets migrate into the DB as seed data; delete protection for
  seeded clients.

### Task 4 (conditional) — YOLO crop engine
- Only if the team reports smartcrop missing subjects. Implement as an
  alternative inside `computeCrop()` (ONNX runtime web, or a small API
  endpoint if model size makes client-side impractical).
- Accept: measurably better subject retention on the team's reported
  failure images; smartcrop remains the fallback.

### Task 5 — Per-section filenames ✅ shipped 2026-07-17
- "Section filenames" toggle (default off) in the Output options card.
  When on, each size's label is split on "/" into section slugs and one file
  is exported per section (`name_accommodation_671x358.jpg`); the image is
  rendered once and shared. Unlabelled sizes keep plain names either way.
- Accepted: toggle in UI; default behaviour unchanged (verified both modes).

---

## 7. Working conventions with AJ

- AJ is a digital marketer leading an AI-first transformation — explain
  technical choices in plain business terms, no jargon walls.
- Prefers execution-ready output: do the task, show the result, list what
  changed. Structured summaries over long narration.
- Ask before architectural decisions; don't ask before routine ones.
- Iterate: ship small, verify with AJ, then continue.

---

## 8. Kickoff prompt (paste this as the first message in Claude Code)

> Read HANDOFF.md fully. Start Task 1: install smartcrop and jszip, verify
> app/tools/smart-resize/page.tsx builds cleanly with this site's existing
> config (TypeScript, ESLint, Tailwind if present), fix any conflicts without
> changing the tool's behaviour or scoped styles, then run the build and give
> me the exact deploy/test checklist. Flag anything in my repo setup that
> blocks Tasks 2–3 later.
