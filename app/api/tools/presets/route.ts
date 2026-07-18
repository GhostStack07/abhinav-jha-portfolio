import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireToolAuth } from '@/lib/auth'

type PresetSize = { w: number; h: number; label?: string | null }

// Built-in clients, seeded on first read. Protected from edit/delete.
const SEEDS: Record<string, PresetSize[]> = {
  'Royal Orchid': [
    { w: 1366, h: 565, label: 'Banner' },
    { w: 600, h: 500, label: 'Overview' },
    { w: 671, h: 358, label: 'Accommodation / Dine / Meetings & Events / In & Around' },
    { w: 800, h: 400, label: 'Gallery' },
    { w: 452, h: 440, label: 'City Page' },
  ],
  'Suba Hotels': [
    { w: 1349, h: 600, label: 'Overview Banner' },
    { w: 1160, h: 440, label: 'Overview Dining' },
    { w: 1280, h: 800, label: 'Accommodation / Dining' },
    { w: 855, h: 470, label: 'Meetings & Events' },
    { w: 716, h: 560, label: 'Meetings & Events (alt)' },
    { w: 700, h: 560, label: 'Gallery' },
    { w: 356, h: 280, label: 'Hotel Card' },
  ],
}

async function seedIfEmpty() {
  const count = await prisma.toolPreset.count()
  if (count > 0) return
  await prisma.toolPreset.createMany({
    data: Object.entries(SEEDS).map(([name, sizes]) => ({
      name,
      sizes: JSON.stringify(sizes),
      seeded: true,
    })),
  })
}

function parseSizes(raw: unknown): PresetSize[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 40) return null
  const out: PresetSize[] = []
  for (const s of raw) {
    const w = Number(s?.w)
    const h = Number(s?.h)
    if (!Number.isInteger(w) || !Number.isInteger(h)) return null
    if (w < 1 || h < 1 || w > 8000 || h > 8000) return null
    const label = typeof s?.label === 'string' ? s.label.slice(0, 120) : null
    out.push({ w, h, label })
  }
  return out
}

export async function GET() {
  const denied = await requireToolAuth()
  if (denied) return denied
  await seedIfEmpty()
  const rows = await prisma.toolPreset.findMany({
    orderBy: [{ seeded: 'desc' }, { name: 'asc' }],
  })
  return NextResponse.json(
    rows.map((r) => ({ name: r.name, sizes: JSON.parse(r.sizes) as PresetSize[], seeded: r.seeded }))
  )
}

export async function POST(req: NextRequest) {
  const denied = await requireToolAuth()
  if (denied) return denied
  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 60) : ''
  const sizes = parseSizes(body?.sizes)
  if (!name || !sizes) {
    return NextResponse.json({ error: 'Invalid preset' }, { status: 400 })
  }
  const existing = await prisma.toolPreset.findUnique({ where: { name } })
  if (existing?.seeded) {
    return NextResponse.json({ error: 'Built-in presets can’t be overwritten' }, { status: 403 })
  }
  await prisma.toolPreset.upsert({
    where: { name },
    create: { name, sizes: JSON.stringify(sizes) },
    update: { sizes: JSON.stringify(sizes) },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const denied = await requireToolAuth()
  if (denied) return denied
  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  const existing = await prisma.toolPreset.findUnique({ where: { name } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.seeded) {
    return NextResponse.json({ error: 'Built-in presets can’t be deleted' }, { status: 403 })
  }
  await prisma.toolPreset.delete({ where: { name } })
  return NextResponse.json({ ok: true })
}
